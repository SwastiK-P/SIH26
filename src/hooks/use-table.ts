import { useEffect, useState } from "react"
import { isConfigured, supabase } from "@/lib/supabase"

interface Options {
  /** Column to sort on, e.g. "occurred_at". */
  orderBy?: string
  ascending?: boolean
}

/**
 * Reads a whole table. Fine here because every table in the demo is small;
 * the graph itself goes through GraphProvider instead so the metrics are
 * computed once rather than per screen.
 */
export function useTable<T>(table: string, { orderBy, ascending = true }: Options = {}) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConfigured) {
      setError("Supabase is not configured.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const query = supabase.from(table).select("*")
    if (orderBy) query.order(orderBy, { ascending })

    query.then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError(err.message)
      else {
        setRows((data ?? []) as T[])
        setError(null)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [table, orderBy, ascending])

  return { rows, loading, error }
}
