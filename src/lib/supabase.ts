import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * False until the Supabase env vars are provisioned. Everything that touches the
 * network checks this first and falls back to the mock data in `src/data/`, so a
 * fresh clone still runs before anyone has set up a database.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        // Auth is real now, so the session has to survive a refresh. Supabase
        // stores it in localStorage and refreshes the access token in the
        // background; only the short-lived token is ever sent with a request.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null

/** Narrowing helper. Throws rather than returning a null client. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}
