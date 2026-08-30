import type { Competition } from '@/data/competitions'

/**
 * Live contest feeds.
 *
 * Codeforces publishes a first-party JSON API with permissive CORS, so that one
 * is read directly. LeetCode has no public REST endpoint, so a community mirror
 * is tried first and a computed schedule fills in when it is unreachable —
 * LeetCode's cadence is fixed (Weekly every Sunday 08:00 IST, Biweekly every
 * second Saturday 20:00 IST), so the fallback is accurate rather than fake.
 *
 * Everything here is best-effort: a failed fetch degrades to the curated list in
 * `src/data/competitions.ts` and says so on screen. It never blocks the page.
 */

const CACHE_TTL_MS = 15 * 60_000
const TIMEOUT_MS = 8_000

export type FeedId = 'codeforces' | 'leetcode'

export type FeedResult = {
  id: FeedId
  label: string
  items: Competition[]
  /** 'live' hit the network, 'computed' used the known schedule, 'error' gave up. */
  status: 'live' | 'computed' | 'error'
  error?: string
}

function cacheKey(id: FeedId) {
  return `ipd.contests.${id}.v1`
}

function readCache(id: FeedId): Competition[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(id))
    if (!raw) return null
    const { at, items } = JSON.parse(raw) as { at: number; items: Competition[] }
    if (Date.now() - at > CACHE_TTL_MS) return null
    // A cached row whose start time has passed is worse than no row at all.
    return items.filter((c) => Date.parse(c.startsAt) > Date.now() - 6 * 3_600_000)
  } catch {
    return null
  }
}

function writeCache(id: FeedId, items: Competition[]) {
  try {
    sessionStorage.setItem(cacheKey(id), JSON.stringify({ at: Date.now(), items }))
  } catch {
    /* private mode — just refetch next time */
  }
}

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

// ------------------------------------------------------------- Codeforces

type CfContest = {
  id: number
  name: string
  phase: string
  durationSeconds: number
  startTimeSeconds?: number
}

/** Div. 3 / Div. 4 rounds are beginner-friendly; the rest lean harder. */
function cfRoles(name: string): Competition['roles'] {
  return /div\.?\s*1/i.test(name) ? ['sde', 'quant'] : ['sde']
}

export async function fetchCodeforces(): Promise<FeedResult> {
  const cached = readCache('codeforces')
  if (cached) return { id: 'codeforces', label: 'Codeforces', items: cached, status: 'live' }

  try {
    const data = await getJson<{ status: string; result: CfContest[] }>(
      'https://codeforces.com/api/contest.list?gym=false',
    )
    if (data.status !== 'OK') throw new Error('Codeforces returned an error')

    const items: Competition[] = data.result
      .filter((c) => c.phase === 'BEFORE' && typeof c.startTimeSeconds === 'number')
      .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
      .slice(0, 12)
      .map((c) => ({
        id: `cf-${c.id}`,
        title: c.name,
        org: 'Codeforces',
        source: 'Codeforces' as const,
        roles: cfRoles(c.name),
        startsAt: new Date((c.startTimeSeconds ?? 0) * 1000).toISOString(),
        durationMins: Math.round(c.durationSeconds / 60),
        timeLabel: `${Math.round(c.durationSeconds / 60)} min contest`,
        team: 'Individual',
        tag: 'Contest' as const,
        url: `https://codeforces.com/contests/${c.id}`,
        live: true,
      }))

    writeCache('codeforces', items)
    return { id: 'codeforces', label: 'Codeforces', items, status: 'live' }
  } catch (e) {
    return {
      id: 'codeforces',
      label: 'Codeforces',
      items: [],
      status: 'error',
      error: e instanceof Error ? e.message : 'Could not reach Codeforces',
    }
  }
}

// --------------------------------------------------------------- LeetCode

/**
 * Known-good anchors, verified against LeetCode's own schedule. Weekly contests
 * run every 7 days from the first, biweekly every 14 days from the second.
 */
const LC_WEEKLY_ANCHOR = { number: 518, at: Date.UTC(2026, 8, 6, 2, 30) } // Sun 08:00 IST
const LC_BIWEEKLY_ANCHOR = { number: 191, at: Date.UTC(2026, 8, 12, 14, 30) } // Sat 20:00 IST

const LC_DURATION_MINS = 90

function lcSeries(
  anchor: { number: number; at: number },
  everyDays: number,
  kind: 'Weekly' | 'Biweekly',
  count: number,
): Competition[] {
  const step = everyDays * 86_400_000
  // How many whole periods have elapsed since the anchor (negative before it).
  const elapsed = Math.ceil((Date.now() - anchor.at) / step)

  return Array.from({ length: count }, (_, i) => {
    const index = elapsed + i
    const start = anchor.at + index * step
    const number = anchor.number + index
    return {
      id: `lc-${kind.toLowerCase()}-${number}`,
      title: `LeetCode ${kind} Contest ${number}`,
      org: 'LeetCode',
      source: 'LeetCode' as const,
      roles: ['sde'] as Competition['roles'],
      startsAt: new Date(start).toISOString(),
      durationMins: LC_DURATION_MINS,
      timeLabel: `${LC_DURATION_MINS} min contest`,
      team: 'Individual',
      tag: 'Contest' as const,
      url: 'https://leetcode.com/contest/',
      live: true,
    }
  })
}

/** The schedule LeetCode has run on for years — used when the mirror is down. */
function leetcodeComputed(): Competition[] {
  return [
    ...lcSeries(LC_WEEKLY_ANCHOR, 7, 'Weekly', 4),
    ...lcSeries(LC_BIWEEKLY_ANCHOR, 14, 'Biweekly', 2),
  ].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}

type LcResponse = {
  data?: { topTwoContests?: { title: string; startTime: number; duration: number }[] }
}

export async function fetchLeetCode(): Promise<FeedResult> {
  const cached = readCache('leetcode')
  if (cached?.length) return { id: 'leetcode', label: 'LeetCode', items: cached, status: 'live' }

  try {
    const data = await getJson<LcResponse>('https://competeapi.vercel.app/contests/leetcode/')
    const rows = data.data?.topTwoContests ?? []
    if (!rows.length) throw new Error('empty response')

    const announced: Competition[] = rows.map((c) => ({
      id: `lc-${c.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: `LeetCode ${c.title}`,
      org: 'LeetCode',
      source: 'LeetCode' as const,
      roles: ['sde'],
      startsAt: new Date(c.startTime * 1000).toISOString(),
      durationMins: Math.round(c.duration / 60),
      timeLabel: `${Math.round(c.duration / 60)} min contest`,
      team: 'Individual',
      tag: 'Contest' as const,
      url: 'https://leetcode.com/contest/',
      live: true,
    }))

    // The mirror only ever returns the next two. Extend it with the schedule so
    // the calendar has something to show a month out.
    const seen = new Set(announced.map((c) => c.startsAt.slice(0, 10)))
    const items = [
      ...announced,
      ...leetcodeComputed().filter((c) => !seen.has(c.startsAt.slice(0, 10))),
    ].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))

    writeCache('leetcode', items)
    return { id: 'leetcode', label: 'LeetCode', items, status: 'live' }
  } catch (e) {
    return {
      id: 'leetcode',
      label: 'LeetCode',
      items: leetcodeComputed(),
      status: 'computed',
      error: e instanceof Error ? e.message : 'Could not reach the LeetCode mirror',
    }
  }
}

export function fetchAllFeeds(): Promise<FeedResult[]> {
  return Promise.all([fetchCodeforces(), fetchLeetCode()])
}

/** Drops the session cache so the next fetch really hits the network. */
export function clearContestCache() {
  try {
    sessionStorage.removeItem(cacheKey('codeforces'))
    sessionStorage.removeItem(cacheKey('leetcode'))
  } catch {
    /* nothing cached to clear */
  }
}
