import { useEffect, useState } from 'react'

/**
 * The study-track item ids, loaded on demand.
 *
 * The dashboard needs these only to draw a progress bar on the handful of
 * resources that have a tracker behind them — but "these" is every item of every
 * track, which is around 1,100 rows and, with the NeetCode lists, 150 KB of the
 * initial bundle. Making a student download all of it before the dashboard
 * paints, so that four progress bars can be correct a moment sooner, is the
 * wrong trade.
 *
 * So the data arrives in a second chunk and the bars fill in when it lands. The
 * row is fully usable before then: it renders, it links to its tracker, it just
 * does not yet know how far through you are. Returns `null` until loaded, which
 * callers should treat as "not known yet" rather than "zero".
 */
export type TrackProgress = {
  /** track id -> every item id in it */
  itemsByTrack: Record<string, string[]>
}

let cached: TrackProgress | null = null
let inFlight: Promise<TrackProgress> | null = null

function load(): Promise<TrackProgress> {
  if (cached) return Promise.resolve(cached)
  // One import for the whole app, shared between the dashboard and anything else
  // that wants it — React 18 mounts effects twice in development, and a second
  // network round trip for the same chunk is pure waste.
  inFlight ??= import('@/data/quant').then((m) => {
    cached = {
      itemsByTrack: Object.fromEntries(m.STUDY_TRACKS.map((t) => [t.id, m.trackItemIds(t)])),
    }
    return cached
  })
  return inFlight
}

export function useTrackProgress(): TrackProgress | null {
  const [data, setData] = useState<TrackProgress | null>(cached)

  useEffect(() => {
    if (cached) return
    let alive = true
    load().then((d) => {
      if (alive) setData(d)
    })
    return () => {
      alive = false
    }
  }, [])

  return data
}
