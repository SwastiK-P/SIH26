const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export const formatDate = (iso: string | null | undefined) =>
  iso ? DATE.format(new Date(iso)) : "--"

export const formatTime = (iso: string | null | undefined) =>
  iso ? TIME.format(new Date(iso)) : "--"

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? `${DATE.format(new Date(iso))}, ${TIME.format(new Date(iso))}` : "--"

/**
 * Calendar-day key used to group timeline entries.
 *
 * Built from local date parts, not toISOString(): times are rendered in the
 * viewer's timezone, so a UTC-based key would file an event under one day and
 * then print a clock time belonging to the next.
 */
export function dayKey(iso: string) {
  const d = new Date(iso)
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${month}-${day}`
}

/** Turns a `dayKey` back into a local Date (parsing it directly would be UTC). */
export function fromDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function formatBytes(bytes: number) {
  if (!bytes) return "--"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

/** COMMUNICATED_WITH -> Communicated with */
export function humanise(token: string) {
  const words = token.toLowerCase().replace(/_/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const percent = (n: number) => `${Math.round(n * 100)}%`
