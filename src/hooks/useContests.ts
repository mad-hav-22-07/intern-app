import { useCallback, useEffect, useMemo, useState } from 'react'
import { COMPETITIONS, type Competition } from '@/data/competitions'
import { clearContestCache, fetchAllFeeds, type FeedResult } from '@/lib/contests'

/**
 * The curated listings merged with whatever the live feeds return. Feed failures
 * are surfaced per source rather than thrown — the page still works on the
 * curated list alone.
 */
export function useContests() {
  const [feeds, setFeeds] = useState<FeedResult[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setFeeds(await fetchAllFeeds())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const refresh = useCallback(() => {
    clearContestCache()
    return load()
  }, [load])

  const all = useMemo<Competition[]>(() => {
    const live = feeds.flatMap((f) => f.items)
    const seen = new Set(live.map((c) => c.id))
    return [...COMPETITIONS.filter((c) => !seen.has(c.id)), ...live]
  }, [feeds])

  return { all, feeds, loading, refresh }
}
