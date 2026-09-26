import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, FileText } from "lucide-react"
import { NetworkCanvas } from "@/graph/NetworkCanvas"
import { EmptyState, Loading, SetupNotice, SeverityBadge, StatTile } from "@/components/Bits"
import { EntityLink } from "@/components/EntityBadge"
import { Button } from "@/components/ui/button"
import { formatBytes, formatDate, formatDateTime } from "@/lib/format"
import { useTable } from "@/hooks/use-table"
import { useGraph } from "@/providers/GraphProvider"
import type { Alert, Case, CaseDocument, CaseEntity, TimelineEvent } from "@/lib/types"

export function CaseDetail() {
  const { id = "" } = useParams()
  const graph = useGraph()

  const { rows: cases, loading, error } = useTable<Case>("cases")
  const { rows: links } = useTable<CaseEntity>("case_entities")
  const { rows: documents } = useTable<CaseDocument>("documents")
  const { rows: alerts } = useTable<Alert>("alerts")
  const { rows: events } = useTable<TimelineEvent>("events", { orderBy: "occurred_at" })

  const kase = cases.find((c) => c.id === id)

  const members = useMemo(() => links.filter((l) => l.case_id === id), [links, id])

  // The case subgraph: entities attached to this case, plus the links between
  // them. Anything reaching outside the case stays out, so the picture matches
  // what the case file actually covers.
  const subgraph = useMemo(() => {
    const ids = new Set(members.map((m) => m.entity_id))
    return {
      entities: graph.entities.filter((e) => ids.has(e.id)),
      relationships: graph.relationships.filter(
        (r) => ids.has(r.source_id) && ids.has(r.target_id)
      ),
    }
  }, [members, graph.entities, graph.relationships])

  if (error || graph.error) return <SetupNotice message={error ?? graph.error!} />
  if (loading || graph.loading) return <Loading label="Loading case" />
  if (!kase) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/cases">
            <ArrowLeft className="size-3.5" /> Cases
          </Link>
        </Button>
        <EmptyState title="Case not found" />
      </div>
    )
  }

  const caseDocs = documents.filter((d) => d.case_id === id)
  const caseAlerts = alerts.filter((a) => a.case_id === id)
  const caseEvents = events.filter((e) => e.case_id === id)

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
        <Link to="/cases">
          <ArrowLeft className="size-3.5" /> Cases
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <div className="max-w-2xl space-y-1.5">
          <p className="tabular text-xs text-muted-foreground">
            {kase.case_no} &middot; opened {formatDate(kase.opened_at)}
          </p>
          <h1 className="text-xl font-semibold tracking-tight">{kase.title}</h1>
          <p className="text-sm text-muted-foreground">{kase.summary}</p>
        </div>
        <SeverityBadge severity={kase.priority} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Entities" value={members.length} />
        <StatTile label="Documents" value={caseDocs.length} />
        <StatTile label="Events" value={caseEvents.length} />
        <StatTile label="Alerts" value={caseAlerts.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="overflow-hidden rounded-lg border bg-card/60">
          <header className="border-b px-4 py-3">
            <h2 className="text-sm font-medium">Case network</h2>
            <p className="text-xs text-muted-foreground">
              {subgraph.entities.length} entities linked to this case
            </p>
          </header>
          {subgraph.entities.length ? (
            <NetworkCanvas
              entities={subgraph.entities}
              relationships={subgraph.relationships}
              metrics={graph.metrics}
              className="h-96 w-full"
            />
          ) : (
            <div className="px-4 py-16 text-center text-sm text-muted-foreground">
              No entities linked yet.
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-lg border bg-card">
            <header className="border-b px-4 py-3">
              <h2 className="text-sm font-medium">Entities</h2>
            </header>
            <ul className="scroll-slim max-h-72 divide-y overflow-y-auto">
              {members.map((m) => (
                <li key={m.entity_id} className="flex items-center gap-3 px-4 py-2.5">
                  <EntityLink entity={graph.byId.get(m.entity_id)} className="min-w-0 flex-1" />
                  {m.role && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">{m.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border bg-card">
            <header className="border-b px-4 py-3">
              <h2 className="text-sm font-medium">Documents</h2>
            </header>
            <ul className="divide-y">
              {caseDocs.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{d.filename}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatBytes(d.size_bytes)}
                      {d.pages ? ` · ${d.pages} pages` : ""} · {d.extracted_count} entities
                      extracted
                    </p>
                  </div>
                </li>
              ))}
              {!caseDocs.length && (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No documents uploaded.
                </li>
              )}
            </ul>
          </section>

          {caseAlerts.length > 0 && (
            <section className="rounded-lg border bg-card">
              <header className="border-b px-4 py-3">
                <h2 className="text-sm font-medium">Alerts</h2>
              </header>
              <ul className="divide-y">
                {caseAlerts.map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <SeverityBadge severity={a.severity} />
                      <p className="flex-1 text-sm">{a.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {caseEvents.length > 0 && (
        <section className="mt-4 rounded-lg border bg-card">
          <header className="border-b px-4 py-3">
            <h2 className="text-sm font-medium">Case timeline</h2>
          </header>
          <ul className="divide-y">
            {caseEvents.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3">
                <span className="tabular w-40 shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(e.occurred_at)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
