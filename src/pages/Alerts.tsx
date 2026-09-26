import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { EmptyState, Loading, PageHeader, SetupNotice, SeverityBadge } from "@/components/Bits"
import { EntityLink } from "@/components/EntityBadge"
import { EvidenceList } from "@/components/EvidenceList"
import { Button } from "@/components/ui/button"
import { severityVar } from "@/lib/constants"
import { formatDate, humanise } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useTable } from "@/hooks/use-table"
import { useGraph } from "@/providers/GraphProvider"
import type { Alert, Severity } from "@/lib/types"

const ORDER: Severity[] = ["critical", "high", "medium", "low"]

export function Alerts() {
  const { rows: alerts, loading, error } = useTable<Alert>("alerts")
  const graph = useGraph()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (error) return <SetupNotice message={error} />
  if (loading) return <Loading label="Loading alerts" />

  const sorted = [...alerts].sort(
    (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity)
  )
  const selected = sorted.find((a) => a.id === selectedId) ?? sorted[0]
  const entity = selected?.entity_id ? graph.byId.get(selected.entity_id) : undefined
  const metrics = selected?.entity_id ? graph.metrics.get(selected.entity_id) : undefined
  const connections = selected?.entity_id ? graph.connectionsOf(selected.entity_id) : []

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Patterns the system flagged for review. An alert marks something worth checking, not a conclusion about anyone."
      />

      {!sorted.length ? (
        <EmptyState title="No alerts" hint="Run `npm run seed` to load the demonstration alerts." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <ul className="space-y-2">
            {sorted.map((a) => {
              const active = a.id === selected?.id
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setSelectedId(a.id)}
                    className={cn(
                      "w-full rounded-lg border bg-card p-4 text-left transition-colors",
                      active ? "border-ring/40" : "hover:border-ring/25"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: severityVar(a.severity) }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{a.title}</p>
                          <SeverityBadge severity={a.severity} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span>{humanise(a.type)}</span>
                          <span className="capitalize">{a.status}</span>
                          <span>{formatDate(a.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* ------------------------------------------------ why it fired */}
          <aside className="scroll-slim max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto rounded-lg border bg-card p-4 lg:sticky lg:top-20">
            {!selected ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Select an alert.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <SeverityBadge severity={selected.severity} />
                  <h2 className="text-sm font-semibold">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Why it fired</p>
                  <dl className="space-y-px overflow-hidden rounded-md border">
                    {Object.entries(selected.rationale ?? {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-baseline justify-between gap-3 bg-muted/25 px-3 py-2"
                      >
                        <dt className="text-xs text-muted-foreground">{humanise(key)}</dt>
                        <dd className="tabular text-xs font-medium">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {entity && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Entity concerned
                    </p>
                    <div className="rounded-md border bg-muted/25 p-3">
                      <EntityLink entity={entity} showType />
                      {metrics && (
                        <div className="tabular mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                          <span>priority {metrics.priority}</span>
                          <span>links {metrics.degree}</span>
                          <span>btw {metrics.betweenness.toFixed(3)}</span>
                        </div>
                      )}
                      <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                        <Link to={`/entities/${entity.id}`}>
                          Open profile <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {connections.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Supporting records
                    </p>
                    <EvidenceList evidence={connections.flatMap((r) => r.evidence).slice(0, 4)} />
                  </div>
                )}

                <p className="border-t pt-3 text-[11px] text-muted-foreground">
                  Association within a network is not evidence of wrongdoing. Confirm or dismiss
                  after reviewing the source records.
                </p>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
