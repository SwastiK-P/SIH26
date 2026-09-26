import { FileText } from "lucide-react"
import type { Evidence } from "@/lib/types"

/**
 * The traceability surface: every derived relationship can be walked back to
 * the document and record it came from. Without this the graph is an
 * assertion; with it, it is a claim an investigator can check.
 */
export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  if (!evidence?.length) {
    return <p className="text-sm text-muted-foreground">No source records attached.</p>
  }

  return (
    <ul className="space-y-2">
      {evidence.map((e, i) => (
        <li key={`${e.document}-${e.ref}-${i}`} className="rounded-md border bg-muted/25 p-3">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{e.document}</span>
            <span className="text-muted-foreground">{e.ref}</span>
          </div>
          <p className="mt-1.5 border-l-2 border-border pl-2.5 text-sm text-muted-foreground italic">
            {e.snippet}
          </p>
        </li>
      ))}
    </ul>
  )
}
