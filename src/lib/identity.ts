const IDENTITY_KEY = 'ipd.identity.v1'

/**
 * The key the forum stores as `author_key` / `voter_key`.
 *
 * When someone is signed in with a real account this is their Supabase user id,
 * which a database trigger checks against `auth.uid()` on insert, so a client
 * cannot post as anyone else.
 *
 * Signed out, or with no Supabase configured, it falls back to a per-browser
 * UUID. That is self-asserted and only good enough to make voting one-per-browser
 * and to recognise "your" posts; it is not authentication and never was.
 */

let sessionKey: string | null = null

/** Set by the auth listener in AppContext whenever the session changes. */
export function setIdentityKey(userId: string | null): void {
  sessionKey = userId
}

export function identityKey(): string {
  if (sessionKey) return sessionKey
  try {
    const existing = localStorage.getItem(IDENTITY_KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    localStorage.setItem(IDENTITY_KEY, fresh)
    return fresh
  } catch {
    // Private mode with storage disabled. Stay usable, just not stable.
    return 'ephemeral'
  }
}
