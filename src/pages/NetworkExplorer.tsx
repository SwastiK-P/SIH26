import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Crosshair, RotateCcw, X } from "lucide-react"
import { NetworkCanvas } from "@/graph/NetworkCanvas"
import { buildAdjacency, neighbourhood } from "@/graph/metrics"
import { ConfidenceBar, Loading, PageHeader, SetupNotice } from "@/components/Bits"
import { EntityLink, EntityTypeTag } from "@/components/EntityBadge"
import { EvidenceList } from "@/components/EvidenceList"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { communityColor, entityVar, ENTITY_LABEL } from "@/lib/constants"
import { humanise } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useGraph } from "@/providers/GraphProvider"
import { useTheme } from "@/providers/ThemeProvider"
import { ENTITY_TYPES, type EntityType } from "@/lib/types"

export function NetworkExplorer() {
  const graph = useGraph()
  const { theme } = useTheme()
  const { entities, relationships, metrics, communityCount, loading, error } = graph

  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(new Set())
  const [hiddenRels, setHiddenRels] = useState<Set<string>>(new Set())
  const [minConfidence, setMinConfidence] = useState(0)
  const [colourByCommunity, setColourByCommunity] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [depth, setDepth] = useState(1)

  const relTypes = useMemo(
    () => [...new Set(relationships.map((r) => r.type))].sort(),
    [relationships]
  )

  const view = useMemo(() => {
    const passingRels = relationships.filter(
      (r) => !hiddenRels.has(r.type) && r.confidence >= minConfidence
    )

    let visibleEntities = entities.filter((e) => !hiddenTypes.has(e.type))
    let visibleRels = passingRels

    // Focus mode narrows the canvas to a neighbourhood, computed against the
    // filtered graph so it respects whatever the analyst has already hidden.
    if (focusId) {
      const scoped = buildAdjacency(visibleEntities, passingRels)
      const keep = neighbourhood(scoped, focusId, depth)
      visibleEntities = visibleEntities.filter((e) => keep.has(e.id))
      visibleRels = passingRels.filter((r) => keep.has(r.source_id) && keep.has(r.target_id))
    } else {
      const ids = new Set(visibleEntities.map((e) => e.id))
      visibleRels = passingRels.filter((r) => ids.has(r.source_id) && ids.has(r.target_id))
    }

    return { entities: visibleEntities, relationships: visibleRels }
  }, [entities, relationships, hiddenTypes, hiddenRels, minConfidence, focusId, depth])

  const selected = selectedId ? graph.byId.get(selectedId) : undefined
  const selectedMetrics = selectedId ? metrics.get(selectedId) : undefined
  const connections = selectedId ? graph.connectionsOf(selectedId) : []

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const reset = () => {
    setHiddenTypes(new Set())
    setHiddenRels(new Set())
    setMinConfidence(0)
    setFocusId(null)
    setSelectedId(null)
    setDepth(1)
  }

  if (error) return <SetupNotice message={error} />
  if (loading) return <Loading label="Loading network" />

  return (
    <div>
      <PageHeader
        title="Network explorer"
        description="Filter the graph, follow a chain of connections and read the source records behind each link."
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)]">
        {/* ------------------------------------------------------- filters */}
        <aside className="space-y-5 rounded-lg border bg-card p-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Entity types</p>
            <div className="space-y-1">
              {ENTITY_TYPES.map((type) => {
                const count = entities.filter((e) => e.type === type).length
                if (!count) return null
                const on = !hiddenTypes.has(type)
                return (
                  <button
                    key={type}
                    onClick={() => setHiddenTypes((s) => toggle(s, type))}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent/50",
                      !on && "opacity-40"
                    )}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: entityVar(type) }}
                    />
                    <span className="flex-1">{ENTITY_LABEL[type]}</span>
                    <span className="tabular text-muted-foreground">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Relationships</p>
            <div className="flex flex-wrap gap-1">
              {relTypes.map((type) => {
                const on = !hiddenRels.has(type)
                return (
                  <button
                    key={type}
                    onClick={() => setHiddenRels((s) => toggle(s, type))}
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[11px] transition-colors",
                      on
                        ? "border-border bg-muted/50 text-foreground"
                        : "border-transparent text-muted-foreground/50 line-through"
                    )}
                  >
                    {humanise(type)}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Minimum confidence</Label>
              <span className="tabular text-xs">{Math.round(minConfidence * 100)}%</span>
            </div>
            <Slider
              value={[minConfidence]}
              onValueChange={([v]) => setMinConfidence(v)}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="community" className="text-xs text-muted-foreground">
              Colour by cluster
            </Label>
            <Switch
              id="community"
              checked={colourByCommunity}
              onCheckedChange={setColourByCommunity}
            />
          </div>

          {focusId && (
            <div className="space-y-2 rounded-md border border-primary/25 bg-primary/5 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Focused</span>
                <button
                  onClick={() => setFocusId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {graph.byId.get(focusId)?.name}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    className={cn(
                      "flex-1 rounded border px-1.5 py-1 text-[11px]",
                      depth === d ? "border-primary/40 bg-primary/15 text-primary" : "text-muted-foreground"
                    )}
                  >
                    {d} hop
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="border-t pt-3 text-[11px] text-muted-foreground">
            Showing {view.entities.length} of {entities.length} entities and{" "}
            {view.relationships.length} of {relationships.length} links
            {communityCount > 0 && <> across {communityCount} clusters</>}.
          </p>
        </aside>

        {/* -------------------------------------------------------- canvas */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="relative min-h-[26rem] overflow-hidden rounded-lg border bg-card/60">
            <NetworkCanvas
              entities={view.entities}
              relationships={view.relationships}
              metrics={metrics}
              colourBy={colourByCommunity ? "community" : "type"}
              selectedId={selectedId}
              onSelect={setSelectedId}
              className="h-[26rem] w-full lg:h-[calc(100vh-14rem)]"
            />
            <p className="pointer-events-none absolute bottom-3 left-4 text-[11px] text-muted-foreground">
              Node size reflects investigation priority. Drag to rearrange, scroll to zoom.
            </p>
          </div>

          {/* ------------------------------------------------ detail panel */}
          <aside className="scroll-slim max-h-[calc(100vh-14rem)] overflow-y-auto rounded-lg border bg-card">
            {!selected ? (
              <div className="px-4 py-16 text-center">
                <p className="text-sm font-medium">Select an entity</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click any node to see its metrics, connections and the records behind them.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                <header className="space-y-2.5 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold">{selected.name}</h2>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <EntityTypeTag type={selected.type} />
                  {selected.aliases.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Also recorded as {selected.aliases.join(", ")}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setFocusId(selected.id)}
                    >
                      <Crosshair className="size-3.5" /> Focus
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/entities/${selected.id}`}>Profile</Link>
                    </Button>
                  </div>
                </header>

                {selectedMetrics && (
                  <section className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3.5 text-xs">
                    <Metric label="Priority" value={selectedMetrics.priority} />
                    <Metric label="Connections" value={selectedMetrics.degree} />
                    <Metric
                      label="Betweenness"
                      value={selectedMetrics.betweenness.toFixed(3)}
                    />
                    <Metric
                      label="Cluster"
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: communityColor(selectedMetrics.community, theme) }}
                          />
                          {selectedMetrics.community + 1}
                        </span>
                      }
                    />
                    {selectedMetrics.bridges > 1 && (
                      <p className="col-span-2 rounded-md border border-primary/25 bg-primary/5 px-2.5 py-2 text-[11px] text-primary">
                        Connects {selectedMetrics.bridges} separate clusters.
                      </p>
                    )}
                  </section>
                )}

                <section className="px-4 py-3.5">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Connections ({connections.length})
                  </p>
                  <ul className="space-y-2">
                    {connections.map((r) => {
                      const other = graph.otherEnd(r, selected.id)
                      return (
                        <li key={r.id} className="rounded-md border bg-muted/25 px-2.5 py-2">
                          <p className="text-[11px] text-muted-foreground">{humanise(r.type)}</p>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <EntityLink entity={other} className="min-w-0" />
                            <ConfidenceBar value={r.confidence} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>

                <section className="px-4 py-3.5">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Source records</p>
                  <EvidenceList evidence={connections.flatMap((r) => r.evidence).slice(0, 6)} />
                </section>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 font-medium">{value}</p>
    </div>
  )
}
