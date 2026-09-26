/**
 * A rule-based responder over the computed graph.
 *
 * Deliberately not an LLM. Every sentence it produces is derived from a number
 * the analytics actually computed and cites the records behind it, so nothing
 * here can invent a relationship that is not in the data. Wiring a language
 * model in later means replacing `answer()` and keeping the same contract:
 * a claim, the entities it concerns, and the evidence for it.
 */
import { shortestPath, type Adjacency } from "@/graph/metrics"
import { humanise } from "@/lib/format"
import type { Entity, EntityMetrics, Evidence, Relationship } from "@/lib/types"

export interface AssistantContext {
  entities: Entity[]
  relationships: Relationship[]
  metrics: Map<string, EntityMetrics>
  adjacency: Adjacency
  byId: Map<string, Entity>
  connectionsOf: (id: string) => Relationship[]
  otherEnd: (rel: Relationship, id: string) => Entity | undefined
  communityCount: number
}

export interface Answer {
  text: string
  /** Entities worth linking to under the answer. */
  entityIds: string[]
  evidence: Evidence[]
}

export const SUGGESTIONS = [
  "Who is the most important entity in this network?",
  "Show all connections of Rahul Sharma",
  "How is Rahul Sharma connected to Deepa Nair?",
  "Why was Arjun Patil flagged?",
  "What financial relationships exist?",
  "Which relationships have the strongest evidence?",
]

/** Finds entities named in the question. Longest name first so "Rahul Sharma" beats "Rahul". */
function mentioned(question: string, entities: Entity[]): Entity[] {
  const q = question.toLowerCase()
  const hits: Entity[] = []

  for (const e of [...entities].sort((a, b) => b.name.length - a.name.length)) {
    const names = [e.name, ...e.aliases].map((n) => n.toLowerCase())
    if (names.some((n) => q.includes(n))) {
      if (!hits.some((h) => h.id === e.id)) hits.push(e)
      continue
    }
    // Surname or first name on its own, when it is unambiguous.
    const parts = e.name.toLowerCase().split(/\s+/).filter((p) => p.length > 3)
    if (parts.some((p) => new RegExp(`\\b${p}\\b`).test(q))) {
      if (!hits.some((h) => h.id === e.id)) hits.push(e)
    }
  }

  return hits
}

const ranked = (ctx: AssistantContext) =>
  ctx.entities
    .map((e) => ({ e, m: ctx.metrics.get(e.id) }))
    .filter((r): r is { e: Entity; m: EntityMetrics } => Boolean(r.m))
    .sort((a, b) => b.m.priority - a.m.priority)

export function answer(question: string, ctx: AssistantContext): Answer {
  const q = question.toLowerCase().trim()
  const named = mentioned(question, ctx.entities)

  if (!ctx.entities.length) {
    return {
      text: "There is no graph loaded yet. Run the schema and seed steps, then ask again.",
      entityIds: [],
      evidence: [],
    }
  }

  // ---- how are A and B connected -------------------------------------
  const asksPath =
    /\b(connect|connected|link|linked|between|path|relate[ds]?|bridge)\b/.test(q) &&
    named.length >= 2

  if (asksPath) {
    const [a, b] = named
    const path = shortestPath(ctx.adjacency, a.id, b.id)

    if (!path.length) {
      return {
        text: `There is no recorded chain of relationships between ${a.name} and ${b.name}. They sit in unconnected parts of the graph.`,
        entityIds: [a.id, b.id],
        evidence: [],
      }
    }

    const names = path.map((id) => ctx.byId.get(id)?.name ?? "?")
    const middle = path.slice(1, -1)
    const evidence: Evidence[] = []
    for (let i = 0; i < path.length - 1; i++) {
      const rel = ctx.relationships.find(
        (r) =>
          (r.source_id === path[i] && r.target_id === path[i + 1]) ||
          (r.target_id === path[i] && r.source_id === path[i + 1])
      )
      if (rel) evidence.push(...rel.evidence)
    }

    return {
      text:
        `${a.name} reaches ${b.name} in ${path.length - 1} steps: ${names.join(" → ")}. ` +
        (middle.length
          ? `The chain depends on ${middle.map((id) => ctx.byId.get(id)?.name).join(" and ")}; removing ${middle.length === 1 ? "that entity" : "those entities"} would break it.`
          : "They are directly linked."),
      entityIds: path,
      evidence,
    }
  }

  // ---- why was X flagged ---------------------------------------------
  if (/\bwhy\b|\bflag|\breason|\bexplain/.test(q) && named.length) {
    const e = named[0]
    const m = ctx.metrics.get(e.id)
    if (!m) {
      return { text: `${e.name} has no computed metrics.`, entityIds: [e.id], evidence: [] }
    }

    const position = ranked(ctx).findIndex((r) => r.e.id === e.id) + 1
    const conns = ctx.connectionsOf(e.id)

    const reasons = [
      `${e.name} ranks ${position} of ${ctx.entities.length} by investigation priority (${m.priority}/100).`,
      `Betweenness is ${m.betweenness.toFixed(3)}, meaning that share of all shortest paths in the network runs through this entity.`,
      `It has ${m.degree} direct connection${m.degree === 1 ? "" : "s"}.`,
    ]

    if (m.bridges > 1) {
      reasons.push(
        `It touches ${m.bridges} of the ${ctx.communityCount} detected clusters, so it is one of the few links holding otherwise separate groups together.`
      )
    }

    reasons.push(
      `The finding rests on ${conns.reduce((n, r) => n + r.evidence.length, 0)} source records across ${new Set(conns.flatMap((r) => r.evidence.map((v) => v.document))).size} documents. Structural position is not evidence of wrongdoing; it indicates where to look.`
    )

    return {
      text: reasons.join(" "),
      entityIds: [e.id],
      evidence: conns.flatMap((r) => r.evidence).slice(0, 5),
    }
  }

  // ---- connections of X ----------------------------------------------
  if (named.length === 1 && /\bconnection|\bassociat|\blink|\bshow\b|\bwho\b|\bwhat\b/.test(q)) {
    const e = named[0]
    const conns = ctx.connectionsOf(e.id)
    if (!conns.length) {
      return { text: `${e.name} has no recorded relationships.`, entityIds: [e.id], evidence: [] }
    }

    const lines = conns
      .map((r) => {
        const other = ctx.otherEnd(r, e.id)
        return `${humanise(r.type).toLowerCase()} ${other?.name} (${Math.round(r.confidence * 100)}%)`
      })
      .join("; ")

    return {
      text: `${e.name} has ${conns.length} recorded relationship${conns.length === 1 ? "" : "s"}: ${lines}.`,
      entityIds: [e.id, ...conns.map((r) => ctx.otherEnd(r, e.id)?.id ?? "").filter(Boolean)],
      evidence: conns.flatMap((r) => r.evidence).slice(0, 5),
    }
  }

  // ---- financial ------------------------------------------------------
  if (/\bfinanc|\btransact|\bmoney|\btransfer|\baccount|\bpayment/.test(q)) {
    const financial = ctx.relationships.filter(
      (r) => r.type === "TRANSFERRED_TO" || r.type === "OWNED_BY"
    )
    if (!financial.length) {
      return { text: "No financial relationships are recorded in the graph.", entityIds: [], evidence: [] }
    }

    const lines = financial
      .map(
        (r) =>
          `${ctx.byId.get(r.source_id)?.name} → ${ctx.byId.get(r.target_id)?.name} (${Math.round(r.confidence * 100)}%)`
      )
      .join("; ")

    return {
      text: `There ${financial.length === 1 ? "is" : "are"} ${financial.length} financial link${financial.length === 1 ? "" : "s"}: ${lines}.`,
      entityIds: [...new Set(financial.flatMap((r) => [r.source_id, r.target_id]))],
      evidence: financial.flatMap((r) => r.evidence).slice(0, 5),
    }
  }

  // ---- strongest evidence ---------------------------------------------
  if (/\bevidence|\bstrong|\bconfiden|\breliab|\bsource/.test(q)) {
    const top = [...ctx.relationships]
      .sort(
        (a, b) =>
          b.confidence * 10 + b.evidence.length - (a.confidence * 10 + a.evidence.length)
      )
      .slice(0, 5)

    const lines = top
      .map(
        (r) =>
          `${ctx.byId.get(r.source_id)?.name} ${humanise(r.type).toLowerCase()} ${ctx.byId.get(r.target_id)?.name} at ${Math.round(r.confidence * 100)}% across ${r.evidence.length} record${r.evidence.length === 1 ? "" : "s"}`
      )
      .join("; ")

    return {
      text: `The best-supported relationships are: ${lines}.`,
      entityIds: [...new Set(top.flatMap((r) => [r.source_id, r.target_id]))],
      evidence: top.flatMap((r) => r.evidence).slice(0, 6),
    }
  }

  // ---- bridges / clusters ---------------------------------------------
  if (/\bcluster|\bcommunit|\bgroup|\bbridge|\bintermediar|\bbroker/.test(q)) {
    const bridges = ranked(ctx).filter((r) => r.m.bridges > 1)
    if (!bridges.length) {
      return {
        text: `The network splits into ${ctx.communityCount} cluster${ctx.communityCount === 1 ? "" : "s"} and no single entity spans more than one.`,
        entityIds: [],
        evidence: [],
      }
    }

    const lines = bridges
      .map((r) => `${r.e.name} (${r.m.bridges} clusters, betweenness ${r.m.betweenness.toFixed(3)})`)
      .join("; ")

    return {
      text: `The network splits into ${ctx.communityCount} clusters. ${bridges.length} entit${bridges.length === 1 ? "y spans" : "ies span"} more than one: ${lines}. ${bridges[0].e.name} carries the most traffic between groups.`,
      entityIds: bridges.map((r) => r.e.id),
      evidence: ctx.connectionsOf(bridges[0].e.id).flatMap((r) => r.evidence).slice(0, 4),
    }
  }

  // ---- most important --------------------------------------------------
  if (/\bimportant|\bkey\b|\btop\b|\bcentral|\binfluen|\brank|\bmost\b|\bwho\b/.test(q)) {
    const top = ranked(ctx).slice(0, 3)
    const [first] = top

    return {
      text:
        `${first.e.name} ranks highest, at ${first.m.priority}/100. ` +
        `The score blends betweenness (${first.m.betweenness.toFixed(3)}), ${first.m.degree} direct connections and PageRank. ` +
        (first.m.bridges > 1
          ? `It is the entity holding ${first.m.bridges} clusters together, which is why it outranks entities with more connections. `
          : "") +
        `Next are ${top
          .slice(1)
          .map((r) => `${r.e.name} (${r.m.priority})`)
          .join(" and ")}.`,
      entityIds: top.map((r) => r.e.id),
      evidence: ctx.connectionsOf(first.e.id).flatMap((r) => r.evidence).slice(0, 4),
    }
  }

  // ---- an entity was named but the intent is unclear --------------------
  if (named.length === 1) {
    const e = named[0]
    const m = ctx.metrics.get(e.id)
    const conns = ctx.connectionsOf(e.id)
    return {
      text: `${e.name} is a ${humanise(e.type).toLowerCase()} with ${conns.length} recorded relationship${conns.length === 1 ? "" : "s"} and an investigation priority of ${m?.priority ?? 0}/100. Ask about its connections, or why it was flagged.`,
      entityIds: [e.id],
      evidence: conns.flatMap((r) => r.evidence).slice(0, 3),
    }
  }

  return {
    text:
      "I answer from the graph itself, so I can tell you who is structurally important, how two entities connect, why something was flagged, what the financial links are, and which relationships have the strongest source records. Try one of the suggestions below.",
    entityIds: [],
    evidence: [],
  }
}
