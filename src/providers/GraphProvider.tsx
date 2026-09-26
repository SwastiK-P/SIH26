import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { computeMetrics, type Adjacency } from "@/graph/metrics"
import { isConfigured, supabase } from "@/lib/supabase"
import type { Entity, EntityMetrics, Relationship } from "@/lib/types"

interface GraphValue {
  entities: Entity[]
  relationships: Relationship[]
  byId: Map<string, Entity>
  metrics: Map<string, EntityMetrics>
  adjacency: Adjacency
  communityCount: number
  loading: boolean
  error: string | null
  reload: () => void
  /** Relationships touching an entity, strongest evidence first. */
  connectionsOf: (id: string) => Relationship[]
  /** The entity on the other end of a relationship. */
  otherEnd: (rel: Relationship, id: string) => Entity | undefined
}

const GraphContext = createContext<GraphValue | null>(null)

const EMPTY_ADJACENCY: Adjacency = {
  ids: [],
  index: new Map(),
  neighbours: [],
  weights: [],
}

/**
 * Loads the whole graph once and derives every metric from it.
 *
 * A real deployment would page this or push the analytics server-side, but at
 * demo scale one fetch is simpler than a cache layer and means every screen
 * reads exactly the same numbers.
 */
export function GraphProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!isConfigured) {
      setError("Supabase is not configured. Copy .env.example to .env and fill it in.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      supabase.from("entities").select("*").order("name"),
      supabase.from("relationships").select("*"),
    ])
      .then(([e, r]) => {
        if (cancelled) return
        if (e.error) throw e.error
        if (r.error) throw r.error
        setEntities((e.data ?? []) as Entity[])
        setRelationships((r.data ?? []) as Relationship[])
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return
        setError(
          err?.message?.includes("schema cache")
            ? "Tables not found. Run supabase/schema.sql in the SQL editor, then `npm run seed`."
            : (err?.message ?? "Could not load the graph.")
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [nonce])

  const derived = useMemo(() => {
    if (!entities.length) {
      return { adjacency: EMPTY_ADJACENCY, metrics: new Map<string, EntityMetrics>(), communityCount: 0 }
    }
    return computeMetrics(entities, relationships)
  }, [entities, relationships])

  const byId = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities])

  const byEntity = useMemo(() => {
    const map = new Map<string, Relationship[]>()
    for (const r of relationships) {
      for (const id of [r.source_id, r.target_id]) {
        const list = map.get(id)
        if (list) list.push(r)
        else map.set(id, [r])
      }
    }
    for (const list of map.values()) list.sort((a, b) => b.confidence - a.confidence)
    return map
  }, [relationships])

  const value = useMemo<GraphValue>(
    () => ({
      entities,
      relationships,
      byId,
      metrics: derived.metrics,
      adjacency: derived.adjacency,
      communityCount: derived.communityCount,
      loading,
      error,
      reload,
      connectionsOf: (id) => byEntity.get(id) ?? [],
      otherEnd: (rel, id) => byId.get(rel.source_id === id ? rel.target_id : rel.source_id),
    }),
    [entities, relationships, byId, byEntity, derived, loading, error, reload]
  )

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
}

export function useGraph() {
  const ctx = useContext(GraphContext)
  if (!ctx) throw new Error("useGraph must be used inside <GraphProvider>")
  return ctx
}
