import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { EmptyState, Loading, PageHeader, SetupNotice, SeverityBadge, StatTile } from "@/components/Bits"
import { EntityLink, EntityTypeTag } from "@/components/EntityBadge"
import { Button } from "@/components/ui/button"
import { entityVar, ENTITY_LABEL } from "@/lib/constants"
import { formatDate } from "@/lib/format"
import { useTable } from "@/hooks/use-table"
import { useGraph } from "@/providers/GraphProvider"
import type { Alert, Case, EntityType } from "@/lib/types"

export function Dashboard() {
  const { entities, relationships, metrics, communityCount, loading, error } = useGraph()
  const { rows: alerts } = useTable<Alert>("alerts")
  const { rows: cases } = useTable<Case>("cases")

  if (error) return <SetupNotice message={error} />
  if (loading) return <Loading label="Loading network" />

  const counts = entities.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {})

  const breakdown = Object.entries(counts)
    .map(([type, value]) => ({ type: type as EntityType, value }))
    .sort((a, b) => b.value - a.value)

  const ranked = [...metrics.entries()]
    .map(([id, m]) => ({ entity: entities.find((e) => e.id === id), m }))
    .filter((r): r is { entity: NonNullable<typeof r.entity>; m: typeof r.m } => Boolean(r.entity))
    .sort((a, b) => b.m.priority - a.m.priority)

  const openAlerts = alerts.filter((a) => a.status !== "dismissed")
  const bridges = ranked.filter((r) => r.m.bridges > 1)

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Entities, relationships and analytics derived from the case material."
        actions={
          <Button asChild size="sm">
            <Link to="/network">
              Open network <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        }
      />

      {!entities.length ? (
        <EmptyState
          title="No entities yet"
          hint="Run `npm run seed` to load the synthetic demonstration network."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Entities" value={entities.length} />
            <StatTile label="Relationships" value={relationships.length} />
            <StatTile
              label="Clusters"
              value={communityCount}
              hint={`${bridges.length} entities bridge them`}
            />
            <StatTile
              label="Open alerts"
              value={openAlerts.length}
              hint={`${alerts.filter((a) => a.severity === "critical").length} critical`}
            />
          </div>

          {/* --------------------------------------------- top influencers */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium">Network influence</h2>
              <p className="text-xs text-muted-foreground">
                Betweenness, degree and PageRank, blended
              </p>
            </div>

            <ul className="divide-y overflow-hidden rounded-lg border bg-card">
              {ranked.slice(0, 5).map(({ entity, m }, i) => (
                <li key={entity.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="tabular w-4 text-xs text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <EntityLink entity={entity} />
                    <p className="tabular mt-0.5 text-[11px] text-muted-foreground">
                      betweenness {m.betweenness.toFixed(3)} &middot; {m.degree} connections
                      {m.bridges > 1 && (
                        <span className="text-primary"> &middot; bridges {m.bridges} clusters</span>
                      )}
                    </p>
                  </div>
                  <div className="w-20 shrink-0">
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${m.priority}%` }}
                      />
                    </div>
                  </div>
                  <span className="tabular w-6 shrink-0 text-right text-sm">{m.priority}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* -------------------------------------------------- composition */}
          <section>
            <h2 className="mb-3 text-sm font-medium">Composition</h2>
            <div className="flex flex-wrap gap-2">
              {breakdown.map((d) => (
                <div
                  key={d.type}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                >
                  <EntityTypeTag type={d.type} />
                  <span className="tabular text-sm font-medium">{d.value}</span>
                </div>
              ))}
            </div>
            {/* A bar reads the mix faster than a pie at this scale, and costs
                no chart library. */}
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full">
              {breakdown.map((d) => (
                <div
                  key={d.type}
                  title={`${ENTITY_LABEL[d.type]}: ${d.value}`}
                  style={{
                    width: `${(d.value / entities.length) * 100}%`,
                    backgroundColor: entityVar(d.type),
                  }}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* --------------------------------------------------- alerts */}
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-medium">Recent alerts</h2>
                <Link to="/alerts" className="text-xs text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </div>
              <ul className="divide-y overflow-hidden rounded-lg border bg-card">
                {openAlerts.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 px-4 py-3">
                    <SeverityBadge severity={a.severity} />
                    <p className="flex-1 text-sm">{a.title}</p>
                  </li>
                ))}
                {!openAlerts.length && (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No open alerts.
                  </li>
                )}
              </ul>
            </section>

            {/* ---------------------------------------------------- cases */}
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-medium">Cases</h2>
                <Link to="/cases" className="text-xs text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </div>
              <ul className="divide-y overflow-hidden rounded-lg border bg-card">
                {cases.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/cases/${c.id}`}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{c.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {c.case_no} &middot; opened {formatDate(c.opened_at)}
                        </p>
                      </div>
                      <SeverityBadge severity={c.priority} />
                    </Link>
                  </li>
                ))}
                {!cases.length && (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No cases yet.
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
