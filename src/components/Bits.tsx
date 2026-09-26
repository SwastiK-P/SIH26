import type { ReactNode } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { severityVar } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Severity } from "@/lib/types"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="tabular mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const colour = severityVar(severity)
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize"
      style={{
        color: colour,
        backgroundColor: `color-mix(in oklab, ${colour} 13%, transparent)`,
      }}
    >
      {severity}
    </span>
  )
}

/**
 * Every derived number in this UI is shown with the confidence behind it.
 * Investigators need to know which links are firm and which are inferred.
 */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100)
  const colour =
    value >= 0.85 ? severityVar("low") : value >= 0.7 ? severityVar("medium") : severityVar("high")
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="h-1 w-14 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: colour }}
        />
      </span>
      <span className="tabular text-xs text-muted-foreground">{pct}%</span>
    </span>
  )
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Shown when Supabase is unreachable or the schema has not been created yet. */
export function SetupNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="space-y-2 text-sm">
          <p className="font-medium">Data source unavailable</p>
          <p className="text-muted-foreground">{message}</p>
          <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
            <li>
              Run <code className="text-foreground">supabase/schema.sql</code> in the Supabase SQL
              editor.
            </li>
            <li>
              Copy <code className="text-foreground">.env.example</code> to{" "}
              <code className="text-foreground">.env</code> and fill in both keys.
            </li>
            <li>
              Run <code className="text-foreground">npm run seed</code>, then reload.
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
