import { useEffect, useRef, useState } from "react"
import { Bot, CornerDownLeft } from "lucide-react"
import { Loading, PageHeader, SetupNotice } from "@/components/Bits"
import { EntityLink } from "@/components/EntityBadge"
import { EvidenceList } from "@/components/EvidenceList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { answer, SUGGESTIONS, type Answer } from "@/lib/assistant"
import { useGraph } from "@/providers/GraphProvider"

interface Turn {
  id: number
  question: string
  reply: Answer
}

export function Assistant() {
  const graph = useGraph()
  const [input, setInput] = useState("")
  const [turns, setTurns] = useState<Turn[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turns])

  const ask = (question: string) => {
    const q = question.trim()
    if (!q) return
    setTurns((prev) => [...prev, { id: Date.now(), question: q, reply: answer(q, graph) }])
    setInput("")
  }

  if (graph.error) return <SetupNotice message={graph.error} />
  if (graph.loading) return <Loading label="Loading network" />

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      <PageHeader
        title="Investigation assistant"
        description="Ask about the network in plain language. Every answer is derived from the computed graph metrics and cites the records behind it."
      />

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex-1 space-y-4">
          {!turns.length && (
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/15">
                  <Bot className="size-4 text-primary" />
                </span>
                <div className="space-y-3">
                  <p className="text-sm">
                    I read the knowledge graph directly &mdash; {graph.entities.length} entities and{" "}
                    {graph.relationships.length} relationships, with centrality and clustering
                    already computed. Ask me something.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className="rounded-md border px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {turns.map((turn) => (
            <div key={turn.id} className="space-y-3">
              <div className="flex justify-end">
                <p className="max-w-xl rounded-lg rounded-br-sm bg-accent px-3.5 py-2.5 text-sm">
                  {turn.question}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/15">
                  <Bot className="size-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1 space-y-3 rounded-lg border bg-card p-4">
                  <p className="text-sm leading-relaxed">{turn.reply.text}</p>

                  {turn.reply.entityIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3">
                      {[...new Set(turn.reply.entityIds)].map((id) => (
                        <EntityLink key={id} entity={graph.byId.get(id)} />
                      ))}
                    </div>
                  )}

                  {turn.reply.evidence.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Source records
                      </p>
                      <EvidenceList evidence={turn.reply.evidence} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={endRef} />
        </div>

        <div className="sticky bottom-0 space-y-2 bg-background pt-2 pb-1">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about connections, key entities, or why something was flagged"
              className="h-10"
            />
            <Button type="submit" className="h-10" disabled={!input.trim()}>
              <CornerDownLeft className="size-3.5" /> Ask
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            Answers are generated from graph metrics and stored evidence, not from a language
            model. Nothing here is a legal or investigative conclusion.
          </p>
        </div>
      </div>
    </div>
  )
}
