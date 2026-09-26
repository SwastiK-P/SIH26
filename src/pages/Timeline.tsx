import { useMemo, useState } from "react"
import { EmptyState, Loading, PageHeader, SetupNotice } from "@/components/Bits"
import { EntityLink } from "@/components/EntityBadge"
import { dayKey, formatTime, fromDayKey, humanise } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useTable } from "@/hooks/use-table"
import { useGraph } from "@/providers/GraphProvider"
import type { TimelineEvent } from "@/lib/types"

/** Event kinds get their own hues so a day's shape is readable at a glance. */
const EVENT_COLOR: Record<string, string> = {
  communication: "#e07fd6",
  meeting: "#6a9dfa",
  transaction: "#5fc97a",
  location: "#ec8a5a",
  vehicle: "#e0a94a",
  crime: "#f2555a",
  intelligence: "#a68cf0",
}

const colourFor = (type: string) => EVENT_COLOR[type] ?? "#94a3b8"

const DAY = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function Timeline() {
  const { rows: events, loading, error } = useTable<TimelineEvent>("events", {
    orderBy: "occurred_at",
    ascending: true,
  })
  const graph = useGraph()
  const [type, setType] = useState<string>("all")

  const types = useMemo(() => [...new Set(events.map((e) => e.type))].sort(), [events])

  const grouped = useMemo(() => {
    const filtered = type === "all" ? events : events.filter((e) => e.type === type)
    const map = new Map<string, TimelineEvent[]>()
    for (const e of filtered) {
      const key = dayKey(e.occurred_at)
      const list = map.get(key)
      if (list) list.push(e)
      else map.set(key, [e])
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [events, type])

  if (error) return <SetupNotice message={error} />
  if (loading) return <Loading label="Loading timeline" />

  return (
    <div>
      <PageHeader
        title="Timeline"
        description="Communications, movements, transactions and reported events in the order they happened."
      />

      <div className="mb-6 flex flex-wrap gap-1">
        <Chip active={type === "all"} onClick={() => setType("all")}>
          All ({events.length})
        </Chip>
        {types.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)} colour={colourFor(t)}>
            {humanise(t)} ({events.filter((e) => e.type === t).length})
          </Chip>
        ))}
      </div>

      {!grouped.length ? (
        <EmptyState title="No events recorded" hint="Run `npm run seed` to load the demonstration timeline." />
      ) : (
        <div className="space-y-8">
          {grouped.map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {DAY.format(fromDayKey(day))}
              </h2>

              <ol className="relative space-y-3 border-l pl-6">
                {items.map((e) => (
                  <li key={e.id} className="relative">
                    <span
                      className="absolute top-3 -left-[1.8125rem] size-2.5 rounded-full ring-4 ring-background"
                      style={{ backgroundColor: colourFor(e.type) }}
                    />
                    <div className="rounded-lg border bg-card p-3.5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="tabular text-sm font-medium">
                          {formatTime(e.occurred_at)}
                        </span>
                        <span
                          className="rounded px-1.5 py-0.5 text-[11px]"
                          style={{
                            color: colourFor(e.type),
                            backgroundColor: `${colourFor(e.type)}1a`,
                          }}
                        >
                          {humanise(e.type)}
                        </span>
                        {e.location && (
                          <span className="text-xs text-muted-foreground">{e.location}</span>
                        )}
                        <span className="tabular ml-auto text-xs text-muted-foreground">
                          {Math.round(e.confidence * 100)}% confidence
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm font-medium">{e.title}</p>
                      {e.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{e.description}</p>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5">
                        {e.entity_ids?.map((id) => (
                          <EntityLink key={id} entity={graph.byId.get(id)} />
                        ))}
                        {e.source_document && (
                          <span className="ml-auto text-[11px] text-muted-foreground">
                            {e.source_document}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({
  active,
  colour,
  onClick,
  children,
}: {
  active: boolean
  colour?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
        active
          ? "border-ring/40 bg-accent text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {colour && <span className="size-2 rounded-full" style={{ backgroundColor: colour }} />}
      {children}
    </button>
  )
}
