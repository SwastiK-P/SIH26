/**
 * Graph analytics, computed in the browser.
 *
 * The demo network is small enough (tens of nodes) that running Brandes and
 * Louvain on every load costs under a millisecond, so the numbers the UI
 * shows are really computed rather than stored. Everything here is a pure
 * function over an index-based adjacency structure -- no dependencies, and
 * nothing that assumes the demo seed in particular.
 *
 * If this ever has to handle a real case load, these move server-side (Neo4j
 * GDS or NetworkX); the shapes returned here are what the UI consumes, so
 * only the implementation would change.
 */
import type { Entity, EntityMetrics, Relationship } from "@/lib/types"

export interface Adjacency {
  ids: string[]
  index: Map<string, number>
  /** Neighbour indices, deduplicated: parallel edges collapse to one link. */
  neighbours: number[][]
  /** Summed confidence per neighbour, aligned with `neighbours`. */
  weights: number[][]
}

/** Builds an undirected adjacency view. Parallel edges merge, weights add. */
export function buildAdjacency(entities: Entity[], relationships: Relationship[]): Adjacency {
  const ids = entities.map((e) => e.id)
  const index = new Map(ids.map((id, i) => [id, i]))
  const acc: Map<number, number>[] = ids.map(() => new Map())

  for (const r of relationships) {
    const a = index.get(r.source_id)
    const b = index.get(r.target_id)
    if (a === undefined || b === undefined || a === b) continue
    const w = Math.max(r.confidence ?? 0.5, 0.01)
    acc[a].set(b, (acc[a].get(b) ?? 0) + w)
    acc[b].set(a, (acc[b].get(a) ?? 0) + w)
  }

  const neighbours: number[][] = []
  const weights: number[][] = []
  for (const map of acc) {
    const ns = [...map.keys()].sort((x, y) => x - y)
    neighbours.push(ns)
    weights.push(ns.map((n) => map.get(n)!))
  }

  return { ids, index, neighbours, weights }
}

/** Number of distinct entities each node is directly linked to. */
export function degreeCentrality(adj: Adjacency): number[] {
  return adj.neighbours.map((n) => n.length)
}

/**
 * Brandes' algorithm, unweighted and undirected.
 *
 * This is the metric that finds intermediaries. A node with few connections
 * can still score highest here if it is the only route between two groups --
 * which is precisely the pattern a manual read of the source files misses.
 *
 * Returns values normalised to 0..1 against the maximum possible for the
 * graph size, so they stay comparable as the network grows.
 */
export function betweennessCentrality(adj: Adjacency): number[] {
  const n = adj.ids.length
  const score = new Array<number>(n).fill(0)
  if (n < 3) return score

  for (let s = 0; s < n; s++) {
    const stack: number[] = []
    const preds: number[][] = Array.from({ length: n }, () => [])
    const sigma = new Array<number>(n).fill(0)
    const dist = new Array<number>(n).fill(-1)
    sigma[s] = 1
    dist[s] = 0

    const queue = [s]
    for (let head = 0; head < queue.length; head++) {
      const v = queue[head]
      stack.push(v)
      for (const w of adj.neighbours[v]) {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1
          queue.push(w)
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v]
          preds[w].push(v)
        }
      }
    }

    const delta = new Array<number>(n).fill(0)
    for (let i = stack.length - 1; i >= 0; i--) {
      const w = stack[i]
      for (const v of preds[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
      }
      if (w !== s) score[w] += delta[w]
    }
  }

  // Each pair is walked from both endpoints, and the maximum attainable value
  // for an undirected graph is (n-1)(n-2)/2.
  const max = ((n - 1) * (n - 2)) / 2
  return score.map((v) => v / 2 / max)
}

/** PageRank by power iteration. Weighted by relationship confidence. */
export function pagerank(adj: Adjacency, damping = 0.85, iterations = 60): number[] {
  const n = adj.ids.length
  if (n === 0) return []

  let rank = new Array<number>(n).fill(1 / n)
  const outWeight = adj.weights.map((ws) => ws.reduce((a, b) => a + b, 0))

  for (let it = 0; it < iterations; it++) {
    const next = new Array<number>(n).fill(0)
    let dangling = 0

    for (let v = 0; v < n; v++) {
      if (outWeight[v] === 0) {
        dangling += rank[v]
        continue
      }
      const ns = adj.neighbours[v]
      for (let k = 0; k < ns.length; k++) {
        next[ns[k]] += (rank[v] * adj.weights[v][k]) / outWeight[v]
      }
    }

    const base = (1 - damping) / n + (damping * dangling) / n
    rank = next.map((v) => base + damping * v)
  }

  return rank
}

// --------------------------------------------------------------------------
// Community detection
// --------------------------------------------------------------------------

interface Level {
  size: number
  neighbours: number[][]
  weights: number[][]
  selfLoops: number[]
}

/** One Louvain local-moving pass. Returns the community of each node. */
function localMoving(level: Level): { communities: number[]; improved: boolean } {
  const n = level.size
  const k = new Array<number>(n).fill(0)
  for (let v = 0; v < n; v++) {
    k[v] = level.weights[v].reduce((a, b) => a + b, 0) + 2 * level.selfLoops[v]
  }
  const m2 = k.reduce((a, b) => a + b, 0)
  const communities = Array.from({ length: n }, (_, i) => i)
  const sigmaTot = k.slice()

  if (m2 === 0) return { communities, improved: false }

  let improved = false
  let moved = true
  let guard = 0

  while (moved && guard++ < 50) {
    moved = false
    // Fixed node order keeps the partition reproducible across reloads --
    // an investigator should not see the clusters renumber on refresh.
    for (let v = 0; v < n; v++) {
      const from = communities[v]
      sigmaTot[from] -= k[v]

      const linksTo = new Map<number, number>()
      linksTo.set(from, 0)
      const ns = level.neighbours[v]
      for (let i = 0; i < ns.length; i++) {
        const c = communities[ns[i]]
        linksTo.set(c, (linksTo.get(c) ?? 0) + level.weights[v][i])
      }

      let best = from
      let bestGain = (linksTo.get(from) ?? 0) - (sigmaTot[from] * k[v]) / m2

      for (const [c, w] of linksTo) {
        const gain = w - (sigmaTot[c] * k[v]) / m2
        // Strict >, and the map is seeded with `from`, so a tie leaves the
        // node where it is instead of flip-flopping between equal options.
        if (gain > bestGain + 1e-12) {
          bestGain = gain
          best = c
        }
      }

      sigmaTot[best] += k[v]
      communities[v] = best
      if (best !== from) {
        moved = true
        improved = true
      }
    }
  }

  return { communities, improved }
}

/** Renumbers arbitrary community labels to a dense 0..c-1 range. */
function compact(labels: number[]): { labels: number[]; count: number } {
  const seen = new Map<number, number>()
  const out = labels.map((l) => {
    let id = seen.get(l)
    if (id === undefined) {
      id = seen.size
      seen.set(l, id)
    }
    return id
  })
  return { labels: out, count: seen.size }
}

/**
 * Louvain community detection (modularity maximisation with aggregation).
 *
 * Deterministic: nodes are visited in index order and ties are resolved in
 * favour of the incumbent community, so the same graph always yields the
 * same partition.
 */
export function detectCommunities(adj: Adjacency): number[] {
  const n = adj.ids.length
  if (n === 0) return []

  let level: Level = {
    size: n,
    neighbours: adj.neighbours,
    weights: adj.weights,
    selfLoops: new Array<number>(n).fill(0),
  }
  // Maps an original node to its community at the current level.
  let assignment = Array.from({ length: n }, (_, i) => i)

  for (let pass = 0; pass < 10; pass++) {
    const { communities, improved } = localMoving(level)
    const { labels, count } = compact(communities)

    assignment = assignment.map((c) => labels[c])
    if (!improved || count === level.size) break

    // Collapse each community into a single node and repeat on the smaller graph.
    const agg: Map<number, number>[] = Array.from({ length: count }, () => new Map())
    const selfLoops = new Array<number>(count).fill(0)

    for (let v = 0; v < level.size; v++) {
      const cv = labels[v]
      selfLoops[cv] += level.selfLoops[v]
      const ns = level.neighbours[v]
      for (let i = 0; i < ns.length; i++) {
        const cw = labels[ns[i]]
        const w = level.weights[v][i]
        // Each undirected edge is visited from both ends; halving the
        // self-loop contribution keeps the total weight invariant.
        if (cv === cw) selfLoops[cv] += w / 2
        else agg[cv].set(cw, (agg[cv].get(cw) ?? 0) + w)
      }
    }

    level = {
      size: count,
      neighbours: agg.map((m) => [...m.keys()].sort((a, b) => a - b)),
      weights: agg.map((m) => [...m.keys()].sort((a, b) => a - b).map((k) => m.get(k)!)),
      selfLoops,
    }
  }

  return compact(assignment).labels
}

// --------------------------------------------------------------------------

const normalise = (values: number[]) => {
  const max = Math.max(...values, 0)
  return max > 0 ? values.map((v) => v / max) : values.map(() => 0)
}

/**
 * Runs every metric and blends them into a single 0-100 investigation
 * priority. Betweenness is weighted most heavily on purpose: brokers between
 * groups are harder to spot by hand than well-connected people, so that is
 * where the analysis adds the most.
 */
export function computeMetrics(
  entities: Entity[],
  relationships: Relationship[]
): { adjacency: Adjacency; metrics: Map<string, EntityMetrics>; communityCount: number } {
  const adjacency = buildAdjacency(entities, relationships)
  const degree = degreeCentrality(adjacency)
  const between = betweennessCentrality(adjacency)
  const rank = pagerank(adjacency)
  const community = detectCommunities(adjacency)
  const communityCount = community.length ? Math.max(...community) + 1 : 0

  const nDegree = normalise(degree)
  const nBetween = normalise(between)
  const nRank = normalise(rank)

  const metrics = new Map<string, EntityMetrics>()
  adjacency.ids.forEach((id, i) => {
    const touched = new Set<number>([community[i]])
    for (const nb of adjacency.neighbours[i]) touched.add(community[nb])

    metrics.set(id, {
      degree: degree[i],
      betweenness: between[i],
      pagerank: rank[i],
      priority: Math.round((0.5 * nBetween[i] + 0.3 * nDegree[i] + 0.2 * nRank[i]) * 100),
      community: community[i],
      bridges: touched.size,
    })
  })

  return { adjacency, metrics, communityCount }
}

/** Shortest chain of entity ids between two nodes, inclusive. Empty if unreachable. */
export function shortestPath(adj: Adjacency, fromId: string, toId: string): string[] {
  const from = adj.index.get(fromId)
  const to = adj.index.get(toId)
  if (from === undefined || to === undefined) return []
  if (from === to) return [fromId]

  const prev = new Array<number>(adj.ids.length).fill(-1)
  const seen = new Array<boolean>(adj.ids.length).fill(false)
  seen[from] = true
  const queue = [from]

  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    for (const w of adj.neighbours[v]) {
      if (seen[w]) continue
      seen[w] = true
      prev[w] = v
      if (w === to) {
        const path: number[] = []
        for (let at: number = to; at !== -1; at = prev[at]) path.push(at)
        return path.reverse().map((i) => adj.ids[i])
      }
      queue.push(w)
    }
  }

  return []
}

/** Every node within `depth` hops of `rootId`, including the root. */
export function neighbourhood(adj: Adjacency, rootId: string, depth: number): Set<string> {
  const out = new Set<string>()
  const start = adj.index.get(rootId)
  if (start === undefined) return out

  let frontier = [start]
  const seen = new Set<number>([start])
  out.add(rootId)

  for (let d = 0; d < depth; d++) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of adj.neighbours[v]) {
        if (seen.has(w)) continue
        seen.add(w)
        out.add(adj.ids[w])
        next.push(w)
      }
    }
    frontier = next
    if (!frontier.length) break
  }

  return out
}
