import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True when the app has somewhere to talk to. When false the UI renders a
 * setup notice instead of a wall of failed requests -- a missing .env is the
 * single most likely reason a fresh clone shows nothing.
 */
export const isConfigured = Boolean(url && key)

export const supabase = createClient(url ?? "http://localhost", key ?? "anon", {
  auth: { persistSession: false },
})
