const IDENTITY_KEY = 'ipd.identity.v1'

/**
 * A stable per-browser id used as `author_key` / `voter_key`.
 *
 * This is not authentication — it is self-asserted and only survives as long as
 * this browser's localStorage. It exists so voting can be one-per-person and so
 * "your" posts are recognisable. Replace with `auth.uid()` when real accounts land.
 */
export function identityKey(): string {
  try {
    const existing = localStorage.getItem(IDENTITY_KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    localStorage.setItem(IDENTITY_KEY, fresh)
    return fresh
  } catch {
    // Private mode with storage disabled — stay usable, just not stable.
    return 'ephemeral'
  }
}
