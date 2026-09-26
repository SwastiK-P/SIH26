import { Link } from "react-router-dom"
import { FileText, Users } from "lucide-react"
import { EmptyState, Loading, PageHeader, SetupNotice, SeverityBadge } from "@/components/Bits"
import { formatDate } from "@/lib/format"
import { useTable } from "@/hooks/use-table"
import type { Case, CaseDocument, CaseEntity } from "@/lib/types"

const STATUS_LABEL: Record<Case["status"], string> = {
  open: "Open",
  active: "Active",
  under_review: "Under review",
  closed: "Closed",
}

export function Cases() {
  const { rows: cases, loading, error } = useTable<Case>("cases", { orderBy: "opened_at", ascending: false })
  const { rows: links } = useTable<CaseEntity>("case_entities")
  const { rows: documents } = useTable<CaseDocument>("documents")

  if (error) return <SetupNotice message={error} />
  if (loading) return <Loading label="Loading cases" />

  return (
    <div>
      <PageHeader
        title="Cases"
        description="Investigations, the material uploaded against them and the entities they touch."
      />

      {!cases.length ? (
        <EmptyState title="No cases yet" hint="Run `npm run seed` to load the demonstration cases." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {cases.map((c) => {
            const entityCount = links.filter((l) => l.case_id === c.id).length
            const docCount = documents.filter((d) => d.case_id === c.id).length
            return (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="group rounded-lg border bg-card p-4 transition-colors hover:border-ring/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tabular text-xs text-muted-foreground">{c.case_no}</p>
                    <h2 className="mt-0.5 text-sm font-semibold group-hover:text-primary">
                      {c.title}
                    </h2>
                  </div>
                  <SeverityBadge severity={c.priority} />
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="rounded border px-1.5 py-0.5">{STATUS_LABEL[c.status]}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" /> {entityCount} entities
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-3.5" /> {docCount} documents
                  </span>
                  <span className="ml-auto">Opened {formatDate(c.opened_at)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
