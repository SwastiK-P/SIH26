import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Share2 } from "lucide-react"
import { ConfidenceBar, EmptyState, Loading, SetupNotice, StatTile } from "@/components/Bits"
import { EntityLink, EntityTypeTag } from "@/components/EntityBadge"
import { EvidenceList } from "@/components/EvidenceList"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime, humanise } from "@/lib/format"
import { useTable } from "@/hooks/use-table"
import { useGraph } from "@/providers/GraphProvider"
import type { TimelineEvent } from "@/lib/types"

export function EntityProfile() {
  const { id = "" } = useParams()
  const graph = useGraph()
  const { rows: events } = useTable<TimelineEvent>("events", { orderBy: "occurred_at" })

  const entity = graph.byId.get(id)
  const metrics = graph.metrics.get(id)
  const connections = graph.connectionsOf(id)

  const related = useMemo(
    () => events.filter((e) => e.entity_ids?.includes(id)),
    [events, id]
  )

  if (graph.error) return <SetupNotice message={graph.error} />
  if (graph.loading) return <Loading label="Loading entity" />
  if (!entity) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/entities">
            <ArrowLeft className="size-3.5" /> Entities
          </Link>
        </Button>
        <EmptyState title="Entity not found" hint="It may have been removed from the graph." />
      </div>
    )
  }

  const attributes = Object.entries(entity.metadata ?? {})
  const allEvidence = connections.flatMap((r) => r.evidence)

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
        <Link to="/entities">
          <ArrowLeft className="size-3.5" /> Entities
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">{entity.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <EntityTypeTag type={entity.type} />
            {entity.aliases.map((a) => (
              <span
                key={a}
                className="rounded-md border border-dashed px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/network">
            <Share2 className="size-3.5" /> View in network
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Priority" value={metrics?.priority ?? 0} hint="0-100 blended score" />
        <StatTile label="Connections" value={metrics?.degree ?? 0} />
        <StatTile
          label="Betweenness"
          value={metrics?.betweenness.toFixed(3) ?? "0.000"}
          hint="Share of shortest paths"
        />
        <StatTile label="Cluster" value={(metrics?.community ?? 0) + 1} />
        <StatTile
          label="Clusters touched"
          value={metrics?.bridges ?? 0}
          hint={metrics && metrics.bridges > 1 ? "Acts as a bridge" : "Within one cluster"}
        />
      </div>

      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Connections ({connections.length})</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="events">Events ({related.length})</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({allEvidence.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-4">
          {!connections.length ? (
            <EmptyState title="No recorded connections" />
          ) : (
            <ul className="divide-y overflow-hidden rounded-lg border bg-card">
              {connections.map((r) => {
                const other = graph.otherEnd(r, entity.id)
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                  >
                    <span className="w-40 shrink-0 text-xs text-muted-foreground">
                      {humanise(r.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <EntityLink entity={other} showType />
                      {r.occurred_at && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateTime(r.occurred_at)}
                        </p>
                      )}
                    </div>
                    <ConfidenceBar value={r.confidence} />
                    <span className="text-xs text-muted-foreground">
                      {r.evidence.length} source{r.evidence.length === 1 ? "" : "s"}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="attributes" className="mt-4">
          {!attributes.length ? (
            <EmptyState title="No attributes recorded" />
          ) : (
            <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
              {attributes.map(([key, value]) => (
                <div key={key} className="bg-card px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{humanise(key)}</dt>
                  <dd className="mt-0.5 text-sm">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          {!related.length ? (
            <EmptyState title="No events reference this entity" />
          ) : (
            <ul className="divide-y overflow-hidden rounded-lg border bg-card">
              {related.map((e) => (
                <li key={e.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{e.title}</p>
                    <span className="tabular text-xs text-muted-foreground">
                      {formatDateTime(e.occurred_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                  {e.source_document && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Source: {e.source_document}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Every relationship above traces back to these records. Confidence reflects how
              directly the source supports the link.
            </p>
            <EvidenceList evidence={allEvidence} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
