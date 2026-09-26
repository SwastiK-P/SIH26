import { Link } from "react-router-dom"
import { entityVar, ENTITY_ICON, ENTITY_LABEL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Entity, EntityType } from "@/lib/types"

/** The coloured dot that ties an entity type to its colour everywhere. */
export function EntityDot({ type, className }: { type: EntityType; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: entityVar(type) }}
    />
  )
}

export function EntityTypeTag({ type }: { type: EntityType }) {
  const Icon = ENTITY_ICON[type]
  const colour = entityVar(type)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
      style={{
        color: colour,
        // color-mix keeps the tint tied to the variable, so it follows the
        // theme instead of needing a second hard-coded value per mode.
        backgroundColor: `color-mix(in oklab, ${colour} 12%, transparent)`,
      }}
    >
      <Icon className="size-3" />
      {ENTITY_LABEL[type]}
    </span>
  )
}

interface EntityLinkProps {
  entity: Entity | undefined
  className?: string
  showType?: boolean
}

export function EntityLink({ entity, className, showType = false }: EntityLinkProps) {
  if (!entity) return <span className="text-muted-foreground">Unknown</span>

  const Icon = ENTITY_ICON[entity.type]
  return (
    <Link
      to={`/entities/${entity.id}`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md text-sm transition-colors hover:text-primary",
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" style={{ color: entityVar(entity.type) }} />
      <span className="truncate underline-offset-4 group-hover:underline">{entity.name}</span>
      {showType && (
        <span className="text-xs text-muted-foreground">{ENTITY_LABEL[entity.type]}</span>
      )}
    </Link>
  )
}
