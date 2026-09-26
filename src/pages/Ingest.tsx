import { useCallback, useEffect, useRef, useState } from "react"
import { Check, FileUp, Info, Loader2, Trash2 } from "lucide-react"
import { EmptyState, Loading, PageHeader, SetupNotice } from "@/components/Bits"
import { EntityTypeTag } from "@/components/EntityBadge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatBytes, formatDateTime } from "@/lib/format"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useTable } from "@/hooks/use-table"
import { useGraph } from "@/providers/GraphProvider"
import type { CaseDocument, Entity } from "@/lib/types"

/**
 * The stages a real pipeline would run. Here they advance on a timer -- this
 * screen demonstrates the workflow and its states, it does not parse anything.
 * The banner says so, because a demo that quietly implies it read your PDF is
 * worse than one that admits it did not.
 */
const STAGES = [
  "Uploading",
  "Extracting text",
  "Recognising entities",
  "Extracting relationships",
  "Merging into the graph",
] as const

const KIND_BY_EXT: Record<string, string> = {
  pdf: "report",
  docx: "intelligence",
  txt: "report",
  csv: "cdr",
  xlsx: "financial",
  xls: "financial",
  json: "other",
}

interface Job {
  id: string
  name: string
  size: number
  stage: number
  done: boolean
  /** Entity ids the pipeline "found", drawn from the existing graph. */
  found: string[]
}

export function Ingest() {
  const graph = useGraph()
  const { rows: existing, loading, error } = useTable<CaseDocument>("documents", {
    orderBy: "uploaded_at",
    ascending: false,
  })

  const [jobs, setJobs] = useState<Job[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      // Stand-ins for what extraction would return, so the preview table has
      // something real to link to.
      const pool = graph.entities
      const next = Array.from(files).map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        name: file.name,
        size: file.size,
        stage: 0,
        done: false,
        found: pool
          .slice((i * 3) % Math.max(pool.length - 4, 1))
          .slice(0, 4)
          .map((e) => e.id),
      }))
      setJobs((prev) => [...next, ...prev])
    },
    [graph.entities]
  )

  // Advance every unfinished job one stage at a time.
  useEffect(() => {
    if (!jobs.some((j) => !j.done)) return

    const timer = setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.done) return j
          const stage = j.stage + 1
          if (stage < STAGES.length) return { ...j, stage }

          // Record the upload. Best-effort: the demo policy allows anon
          // inserts on `documents` only, and a failure here should not break
          // the screen.
          void supabase.from("documents").insert({
            filename: j.name,
            kind: KIND_BY_EXT[j.name.split(".").pop()?.toLowerCase() ?? ""] ?? "other",
            size_bytes: j.size,
            status: "processed",
            extracted_count: j.found.length,
          })

          return { ...j, stage, done: true }
        })
      )
    }, 850)

    return () => clearTimeout(timer)
  }, [jobs])

  if (error) return <SetupNotice message={error} />
  if (loading || graph.loading) return <Loading label="Loading documents" />

  return (
    <div>
      <PageHeader
        title="Data ingestion"
        description="Upload FIRs, call detail records, financial statements, surveillance and intelligence reports."
      />

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3.5 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Simulated pipeline.</span> This screen
          demonstrates the ingestion workflow and its states. Files are not read, parsed or
          uploaded &mdash; only a record of the upload is written. Connect the NLP service to make
          extraction real.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              accept(e.dataTransfer.files)
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "cursor-pointer rounded-lg border border-dashed px-6 py-12 text-center transition-colors",
              dragging ? "border-primary/60 bg-primary/5" : "hover:border-ring/40"
            )}
          >
            <FileUp className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Drop files here, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, TXT, CSV, XLSX and JSON
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.json"
              onChange={(e) => {
                accept(e.target.files)
                e.target.value = ""
              }}
            />
          </div>

          {jobs.length > 0 && (
            <section className="rounded-lg border bg-card">
              <header className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-medium">Processing</h2>
                <Button variant="ghost" size="sm" onClick={() => setJobs([])}>
                  <Trash2 className="size-3.5" /> Clear
                </Button>
              </header>

              <ul className="divide-y">
                {jobs.map((job) => (
                  <li key={job.id} className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{job.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(job.size)}</p>
                      </div>
                      {job.done ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#5fc97a]">
                          <Check className="size-3.5" /> Processed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          {STAGES[job.stage]}
                        </span>
                      )}
                    </div>

                    <Progress
                      className="mt-2.5 h-1"
                      value={(Math.min(job.stage + (job.done ? 0 : 1), STAGES.length) / STAGES.length) * 100}
                    />

                    {job.done && (
                      <div className="mt-3 rounded-md border bg-muted/25 p-3">
                        <p className="mb-2 text-xs text-muted-foreground">
                          Entities the pipeline would return (illustrative)
                        </p>
                        <ul className="space-y-1.5">
                          {job.found.map((eid) => {
                            const e = graph.byId.get(eid) as Entity | undefined
                            if (!e) return null
                            return (
                              <li key={eid} className="flex items-center gap-2 text-sm">
                                <EntityTypeTag type={e.type} />
                                <span className="truncate">{e.name}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="rounded-lg border bg-card">
          <header className="border-b px-4 py-3">
            <h2 className="text-sm font-medium">Ingested documents</h2>
          </header>
          {!existing.length ? (
            <div className="p-4">
              <EmptyState title="Nothing ingested yet" />
            </div>
          ) : (
            <ul className="scroll-slim max-h-[32rem] divide-y overflow-y-auto">
              {existing.map((d) => (
                <li key={d.id} className="px-4 py-3">
                  <p className="truncate text-sm font-medium">{d.filename}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.kind} &middot; {formatBytes(d.size_bytes)} &middot; {d.extracted_count}{" "}
                    entities
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateTime(d.uploaded_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
