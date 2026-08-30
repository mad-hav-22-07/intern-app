import { DAILY, type DailyItem } from '@/data/daily'
import type { RoleId } from '@/data/roles'

/**
 * Picking the day's challenge.
 *
 * The choice is a pure function of the date, so every student on a profile sees
 * the same question on the same day and it rolls over at local midnight. That is
 * what makes it discussable in the forum; a random pick per browser would not be.
 *
 * No backend is involved. The bank is in the bundle and the date is the only
 * input, which also means it keeps working offline.
 */

const DAY_MS = 86_400_000

/** Whole days since the epoch, in local time rather than UTC. */
export function dayNumber(date = new Date()): number {
  const local = new Date(date)
  local.setHours(0, 0, 0, 0)
  return Math.floor(local.getTime() / DAY_MS)
}

/** Today's item for a role, or null if that role has no bank yet. */
export function dailyFor(role: RoleId, date = new Date()): DailyItem | null {
  const bank = DAILY[role]
  if (!bank?.length) return null
  // Offset by role so two profiles never sit on the same index every day.
  const offset = role.charCodeAt(0)
  return bank[(dayNumber(date) + offset) % bank.length]
}

/**
 * The id a solve is recorded under. Includes the day, so solving today's
 * question does not mark tomorrow's as done when the bank wraps around.
 */
export function solveKey(role: RoleId, date = new Date()): string {
  return `${role}:${dayNumber(date)}`
}

/** Milliseconds until the next rollover, for the countdown on the page. */
export function msUntilTomorrow(now = new Date()): number {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - now.getTime()
}
