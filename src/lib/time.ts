const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "just now" · "4m ago" · "3h ago" · "2d ago" · "12 Mar" */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then

  if (diff < MINUTE) return 'just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`

  const d = new Date(then)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

/** Hours elapsed since `iso`. Drives the Today / Past week tabs. */
export function hoursSince(iso: string): number {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY
  return (Date.now() - then) / HOUR
}

/** Reddit-ish decay so a fresh post with 5 votes can outrank a week-old one with 40. */
export function hotScore(score: number, iso: string): number {
  return score / Math.pow(hoursSince(iso) + 2, 1.5)
}
