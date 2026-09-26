import {
  Banknote,
  Building2,
  CalendarClock,
  Car,
  MapPin,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react"
import type { EntityType, Severity } from "./types"
import type { Theme } from "@/providers/ThemeProvider"

/**
 * One colour per entity type, shared by the graph canvas, the badges and the
 * charts. Hex rather than oklch because the canvas painter needs a literal
 * string and both sides must land on the same pixel value.
 * Mirrors the `--entity-*` custom properties in index.css.
 *
 * Two sets: the light values are deep enough for a white icon to read on top
 * of them, the dark values are lifted so they stay visible on a dark ground.
 */
const ENTITY_COLOR_LIGHT: Record<EntityType, string> = {
  person: "#3b82f6",
  organization: "#0d9488",
  phone: "#c026d3",
  vehicle: "#d97706",
  location: "#ea580c",
  bank_account: "#16a34a",
  event: "#7c3aed",
}

const ENTITY_COLOR_DARK: Record<EntityType, string> = {
  person: "#6a9dfa",
  organization: "#2dbfa4",
  phone: "#e07fd6",
  vehicle: "#e0a94a",
  location: "#ec8a5a",
  bank_account: "#4ec172",
  event: "#a68cf0",
}

export const entityColors = (theme: Theme) =>
  theme === "dark" ? ENTITY_COLOR_DARK : ENTITY_COLOR_LIGHT

/**
 * For DOM use, where `currentColor` is not available: the CSS custom property
 * already swaps with the theme, so components read the variable rather than a
 * fixed hex. Canvas code uses `entityColors()` instead.
 */
export const entityVar = (type: EntityType) => `var(--entity-${type})`

export const ENTITY_LABEL: Record<EntityType, string> = {
  person: "Person",
  organization: "Organisation",
  phone: "Phone",
  vehicle: "Vehicle",
  location: "Location",
  bank_account: "Bank account",
  event: "Event",
}

export const ENTITY_ICON: Record<EntityType, LucideIcon> = {
  person: User,
  organization: Building2,
  phone: Phone,
  vehicle: Car,
  location: MapPin,
  bank_account: Banknote,
  event: CalendarClock,
}

export const severityVar = (severity: Severity) => `var(--sev-${severity})`

/** Distinct from the entity ramp, so "colour by cluster" reads as another lens. */
const COMMUNITY_LIGHT = [
  "#2563eb",
  "#d97706",
  "#0d9488",
  "#c026d3",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
]

const COMMUNITY_DARK = [
  "#6a9dfa",
  "#e0a94a",
  "#2dbfa4",
  "#e07fd6",
  "#4ec172",
  "#ec8a5a",
  "#a68cf0",
  "#38bdf8",
]

export function communityColor(index: number, theme: Theme = "light") {
  const ramp = theme === "dark" ? COMMUNITY_DARK : COMMUNITY_LIGHT
  return ramp[((index % ramp.length) + ramp.length) % ramp.length]
}
