import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { ENTITY_ICON } from "@/lib/constants"
import { ENTITY_TYPES, type EntityType } from "@/lib/types"

/**
 * Rasterises the lucide entity icons once so the canvas can stamp them inside
 * each node.
 *
 * Rendering the real components to SVG rather than hand-copying path data
 * means the icon on a node is always the same glyph as the icon next to that
 * entity's name in a list -- they cannot drift apart.
 *
 * Icons are drawn white and always sit on the entity's own colour, so one
 * set covers both themes.
 */
const ICON_COLOUR = "#ffffff"

let cache: Map<EntityType, HTMLImageElement> | null = null

function build() {
  const map = new Map<EntityType, HTMLImageElement>()
  for (const type of ENTITY_TYPES) {
    try {
      const svg = renderToStaticMarkup(
        createElement(ENTITY_ICON[type], {
          color: ICON_COLOUR,
          strokeWidth: 2.25,
          width: 24,
          height: 24,
        })
      )
      const img = new Image(24, 24)
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      map.set(type, img)
    } catch {
      // Running the server renderer in the browser is an unusual thing to
      // ask for. If it ever fails, the node simply draws as a plain coloured
      // circle -- worth losing an icon over, not the whole graph.
    }
  }
  return map
}

/**
 * Resolves once every icon has decoded. The canvas waits for this rather than
 * drawing as they arrive: force-graph stops repainting when the simulation
 * settles, so an icon that loaded late would simply never appear.
 */
export async function loadEntityIcons() {
  if (!cache) cache = build()
  await Promise.all(
    [...cache.values()].map((img) =>
      img.decode().catch(() => undefined)
    )
  )
  return cache
}
