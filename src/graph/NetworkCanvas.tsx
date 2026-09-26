import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d"
import { loadEntityIcons } from "@/graph/node-icons"
import { communityColor, entityColors } from "@/lib/constants"
import { useTheme } from "@/providers/ThemeProvider"
import type { Entity, EntityMetrics, EntityType, Relationship } from "@/lib/types"

/** Ceiling for auto-fit, so a handful of nodes never fills the whole canvas. */
const MAX_ZOOM = 1.5

interface GNode {
  id: string
  name: string
  type: EntityType
  colour: string
  radius: number
  x?: number
  y?: number
}

interface GLink {
  id: string
  source: string | GNode
  target: string | GNode
  width: number
  type: string
}

export interface NetworkCanvasProps {
  entities: Entity[]
  relationships: Relationship[]
  metrics: Map<string, EntityMetrics>
  colourBy?: "type" | "community"
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  className?: string
}

export function NetworkCanvas({
  entities,
  relationships,
  metrics,
  colourBy = "type",
  selectedId = null,
  onSelect,
  className,
}: NetworkCanvasProps) {
  const { theme } = useTheme()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hovered, setHovered] = useState<string | null>(null)
  const [icons, setIcons] = useState<Map<EntityType, HTMLImageElement> | null>(null)

  // The kapsule handle is attached after the parent's effects have already
  // run, so a plain useRef read from an effect finds nothing. It is kept two
  // ways on purpose:
  //   - state, so the force-tuning effect re-runs once the handle exists;
  //   - a ref, because force-graph captures callback props like onEngineStop
  //     at init. A callback closing over the state value would be frozen with
  //     `api === null` forever, and the fit would silently never happen.
  const apiRef = useRef<ForceGraphMethods<GNode, GLink> | null>(null)
  const [api, setApi] = useState<ForceGraphMethods<GNode, GLink> | null>(null)
  const attach = useCallback((g: ForceGraphMethods<GNode, GLink> | null) => {
    apiRef.current = g
    setApi(g)
  }, [])

  // force-graph stores simulation state on the node objects, so the same
  // object has to survive a re-render or every filter change would fling the
  // layout back to the centre.
  const nodeCache = useRef(new Map<string, GNode>())

  useEffect(() => {
    let cancelled = false
    void loadEntityIcons().then((loaded) => {
      if (!cancelled) setIcons(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return

    // Measure up front. A ResizeObserver alone is not enough: in a hidden or
    // background tab it may not fire at all, which would leave the canvas
    // unmounted and the panel permanently blank.
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      )
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    document.addEventListener("visibilitychange", measure)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", measure)
    }
  }, [])

  const data = useMemo(() => {
    const palette = entityColors(theme)
    const visible = new Set(entities.map((e) => e.id))
    const cache = nodeCache.current

    const nodes = entities.map((e) => {
      const m = metrics.get(e.id)
      const colour =
        colourBy === "community" && m ? communityColor(m.community, theme) : palette[e.type]
      // Priority drives size, so the entities worth looking at read as bigger
      // without the analyst having to open a panel. The floor is set by the
      // icon: much below this it stops being recognisable.
      const radius = 9 + ((m?.priority ?? 0) / 100) * 8

      const existing = cache.get(e.id)
      if (existing) {
        existing.name = e.name
        existing.type = e.type
        existing.colour = colour
        existing.radius = radius
        return existing
      }
      const node: GNode = { id: e.id, name: e.name, type: e.type, colour, radius }
      cache.set(e.id, node)
      return node
    })

    const links = relationships
      .filter((r) => visible.has(r.source_id) && visible.has(r.target_id))
      .map<GLink>((r) => ({
        id: r.id,
        source: r.source_id,
        target: r.target_id,
        width: 0.5 + r.confidence * 1.5,
        type: r.type,
      }))

    return { nodes, links }
  }, [entities, relationships, metrics, colourBy, theme])

  /** Frame the whole graph, without ever magnifying a collapsed one. */
  const fit = useCallback(() => {
    const g = apiRef.current
    if (!g) return
    // Instant rather than animated: an animated fit reads the bounding box up
    // front and then clips anything that drifts outward while it plays.
    g.zoomToFit(0, 60)
    // A layout that has not spread yet has a near-zero bounding box, and
    // fitting that would magnify a pile of overlapping nodes to fill the
    // canvas. The ceiling keeps the view usable until the next fit lands.
    if (g.zoom() > MAX_ZOOM) g.zoom(MAX_ZOOM, 0)
  }, [])

  // d3-force's defaults are tuned for hundreds of nodes and leave a small
  // investigative graph balled up in the centre. Push the nodes apart and give
  // the links room so the structure is readable without dragging anything.
  useEffect(() => {
    if (!api) return
    api.d3Force("charge")?.strength(-320)
    api.d3Force("link")?.distance(78)
    api.d3ReheatSimulation()

    // The engine's own stop event is not a dependable moment to frame the
    // view: in a throttled or backgrounded tab the simulation barely ticks, so
    // the event can arrive while the layout is still collapsed -- and it only
    // fires once, so that bad framing would stick. Re-fitting on a short
    // schedule converges on the right view whenever the simulation gets to run.
    const timers = [500, 1400, 2800, 4500].map((ms) => window.setTimeout(fit, ms))
    return () => timers.forEach(clearTimeout)
  }, [api, data, fit])

  const linkColour = theme === "dark" ? "rgba(148,163,184,0.3)" : "rgba(100,116,139,0.3)"
  const nodeRing = theme === "dark" ? "rgba(20,22,30,0.9)" : "#ffffff"
  const labelColour = theme === "dark" ? "rgba(226,232,240,0.82)" : "rgba(51,65,85,0.92)"
  const labelActive = theme === "dark" ? "#f2f4f8" : "#0f172a"

  return (
    <div ref={wrapRef} className={className}>
      {size.width > 0 && (
        <ForceGraph2D<GNode, GLink>
          ref={attach as never}
          width={size.width}
          height={size.height}
          graphData={data}
          backgroundColor="transparent"
          cooldownTicks={300}
          d3VelocityDecay={0.32}
          onEngineStop={fit}
          linkColor={() => linkColour}
          linkWidth={(l) => l.width}
          onNodeClick={(n) => onSelect?.(n.id)}
          onBackgroundClick={() => onSelect?.(null)}
          onNodeHover={(n) => setHovered(n?.id ?? null)}
          nodeLabel={(n) => n.name}
          nodePointerAreaPaint={(node, colour, ctx) => {
            ctx.fillStyle = colour
            ctx.beginPath()
            ctx.arc(node.x ?? 0, node.y ?? 0, node.radius + 3, 0, 2 * Math.PI)
            ctx.fill()
          }}
          nodeCanvasObject={(node, ctx, scale) => {
            const x = node.x ?? 0
            const y = node.y ?? 0
            const active = node.id === selectedId || node.id === hovered

            if (active) {
              ctx.beginPath()
              ctx.arc(x, y, node.radius + 5, 0, 2 * Math.PI)
              ctx.fillStyle = `${node.colour}2e`
              ctx.fill()
            }

            ctx.beginPath()
            ctx.arc(x, y, node.radius, 0, 2 * Math.PI)
            ctx.fillStyle = node.colour
            ctx.fill()
            ctx.lineWidth = active ? 2 : 1.5
            ctx.strokeStyle = active ? labelActive : nodeRing
            ctx.stroke()

            // The icon says what kind of thing a node is without a legend.
            const icon = icons?.get(node.type)
            if (icon?.complete) {
              const s = node.radius * 1.15
              ctx.drawImage(icon, x - s / 2, y - s / 2, s, s)
            }

            // Labels are drawn in graph space, so divide by the zoom to hold a
            // constant on-screen size. Hidden when zoomed far out, where they
            // would only overlap into noise.
            if (scale > 0.45 || active) {
              ctx.font = `${11 / scale}px ui-sans-serif, system-ui, sans-serif`
              ctx.textAlign = "center"
              ctx.textBaseline = "top"
              ctx.fillStyle = active ? labelActive : labelColour
              ctx.fillText(node.name, x, y + node.radius + 4 / scale)
            }
          }}
        />
      )}
    </div>
  )
}
