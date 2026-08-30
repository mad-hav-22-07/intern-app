/**
 * Streak maths over a plain `{ 'YYYY-MM-DD': count }` map.
 *
 * A day is "active" if anything at all was logged on it — ticking off material,
 * finishing a mock round, adding a competition. `goal` only drives today's
 * progress bar; it is deliberately not a condition for keeping the streak, so a
 * light day does not wipe out three weeks of work.
 */

export type Activity = Record<string, number>

const DAY = 86_400_000

export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return dayKey(new Date())
}

/** Local midnight `n` days before today. */
export function daysAgo(n: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setTime(d.getTime() - n * DAY)
  return d
}

export type StreakStats = {
  current: number
  best: number
  todayCount: number
  /** Days with any activity, all time. */
  activeDays: number
  totalLogged: number
}

export function streakStats(activity: Activity): StreakStats {
  const active = new Set(Object.keys(activity).filter((k) => (activity[k] ?? 0) > 0))

  // Current streak: walk back from today. Today not being logged yet is not a
  // break — the day is still in progress — so start counting at yesterday.
  let current = 0
  const start = active.has(todayKey()) ? 0 : 1
  for (let i = start; ; i++) {
    if (!active.has(dayKey(daysAgo(i)))) break
    current++
  }

  // Best streak: sort the active days and walk forward looking for gaps.
  const sorted = [...active].sort()
  let best = 0
  let run = 0
  let previous: number | null = null
  for (const key of sorted) {
    const t = new Date(`${key}T00:00:00`).getTime()
    run = previous !== null && Math.round((t - previous) / DAY) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    previous = t
  }

  return {
    current,
    best: Math.max(best, current),
    todayCount: activity[todayKey()] ?? 0,
    activeDays: active.size,
    totalLogged: Object.values(activity).reduce((a, b) => a + b, 0),
  }
}

export type HeatCell = { key: string; date: Date; count: number; future: boolean }

/** The last `days` days, oldest first — the row the heatmap renders. */
export function heatmap(activity: Activity, days: number): HeatCell[] {
  const out: HeatCell[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i)
    const key = dayKey(date)
    out.push({ key, date, count: activity[key] ?? 0, future: false })
  }
  return out
}

/**
 * The same window arranged as GitHub-style columns of 7, padded so every column
 * starts on a Monday. Trailing days of the current week are marked `future`.
 */
export function heatmapWeeks(activity: Activity, weeks: number): HeatCell[][] {
  const today = daysAgo(0)
  const sinceMonday = (today.getDay() + 6) % 7
  const cells: HeatCell[] = []

  // Start on the Monday `weeks - 1` weeks before this week's Monday.
  const first = new Date(today)
  first.setDate(first.getDate() - sinceMonday - (weeks - 1) * 7)

  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(first)
    date.setDate(first.getDate() + i)
    const key = dayKey(date)
    cells.push({ key, date, count: activity[key] ?? 0, future: date.getTime() > today.getTime() })
  }

  return Array.from({ length: weeks }, (_, w) => cells.slice(w * 7, w * 7 + 7))
}

/** 0-3, the four shades the heatmap paints. */
export function intensity(count: number, goal: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0
  if (count >= goal) return 3
  if (count >= Math.ceil(goal / 2)) return 2
  return 1
}

/**
 * First-run history so a brand-new browser does not show an empty wall. Seeded
 * once, then never touched again — real activity is appended on top of it.
 */
export function seedActivity(): Activity {
  const pattern = [
    2, 1, 0, 3, 2, 2, 1, 0, 0, 1, 3, 3, 2, 1, 2, 0, 1, 2, 3, 3, 2, 2, 1, 3, 3, 2, 3,
  ]
  const out: Activity = {}
  pattern.forEach((count, i) => {
    // pattern[0] is the oldest day; today is left empty for the user to fill.
    if (count > 0) out[dayKey(daysAgo(pattern.length - i))] = count
  })
  return out
}
