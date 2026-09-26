import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { EmptyState, Loading, PageHeader, SetupNotice } from "@/components/Bits"
import { EntityTypeTag } from "@/components/EntityBadge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { entityVar, ENTITY_LABEL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useGraph } from "@/providers/GraphProvider"
import { ENTITY_TYPES, type EntityType } from "@/lib/types"

export function Entities() {
  const { entities, metrics, loading, error } = useGraph()
  const [query, setQuery] = useState("")
  const [type, setType] = useState<EntityType | "all">("all")

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entities
      .filter((e) => (type === "all" ? true : e.type === type))
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.aliases.some((a) => a.toLowerCase().includes(q))
      )
      .map((e) => ({ entity: e, m: metrics.get(e.id) }))
      .sort((a, b) => (b.m?.priority ?? 0) - (a.m?.priority ?? 0))
  }, [entities, metrics, query, type])

  if (error) return <SetupNotice message={error} />
  if (loading) return <Loading label="Loading entities" />

  const available = ENTITY_TYPES.filter((t) => entities.some((e) => e.type === t))

  return (
    <div>
      <PageHeader
        title="Entities"
        description="Every person, organisation, identifier and place extracted from the case material, ranked by investigation priority."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search names and aliases"
          className="h-9 max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          <FilterChip active={type === "all"} onClick={() => setType("all")}>
            All
          </FilterChip>
          {available.map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => setType(t)} colour={entityVar(t)}>
              {ENTITY_LABEL[t]}
            </FilterChip>
          ))}
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No entities match" hint="Try clearing the search or the type filter." />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Entity</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="text-right">Links</TableHead>
                <TableHead className="hidden text-right md:table-cell">Betweenness</TableHead>
                <TableHead className="text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ entity, m }) => (
                <TableRow key={entity.id} className="group">
                  <TableCell>
                    <Link to={`/entities/${entity.id}`} className="block">
                      <span className="text-sm font-medium group-hover:text-primary">
                        {entity.name}
                      </span>
                      {entity.aliases.length > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {entity.aliases.join(", ")}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <EntityTypeTag type={entity.type} />
                  </TableCell>
                  <TableCell className="tabular text-right text-sm">{m?.degree ?? 0}</TableCell>
                  <TableCell className="tabular hidden text-right text-sm text-muted-foreground md:table-cell">
                    {m?.betweenness.toFixed(3) ?? "0.000"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-2">
                      <span className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${m?.priority ?? 0}%` }}
                        />
                      </span>
                      <span className="tabular w-6 text-sm">{m?.priority ?? 0}</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function FilterChip({
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
