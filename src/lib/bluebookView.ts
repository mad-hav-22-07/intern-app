import type { BlueBookEdition } from '@/data/bluebookTypes'

/**
 * Presentation helpers for the Blue Book.
 *
 * Kept out of the pages so the list and the detail view cannot disagree about
 * what a season is called or what "no cutoff" looks like.
 */

/**
 * The season a book describes, which is what a student filters by.
 *
 * Note these are *book* years, not seasons: the IDDD 2026-27 book is the edition
 * handed to the 2026-27 batch and, by its own preface, writes up the firms that
 * visited during 2025-26. It is kept separate rather than merged into 2025-26
 * because its eligibility lists are IDDD-specific and its company set differs.
 */
const EDITION_YEAR: Record<BlueBookEdition, string> = {
  'IDDD 2026-27': '2026-27',
  '2025-26': '2025-26',
  '2024-25': '2024-25',
}

/** Newest first — last season is what people want by default. */
export const YEARS = ['2026-27', '2025-26', '2024-25'] as const

export const yearOf = (e: BlueBookEdition) => EDITION_YEAR[e]

/*
 * The books write "no cutoff" at least five ways — `NA`, `N/A`, `No CGPA
 * cutoff`, `No CGPA criteria`, `None` — because each entry is a different
 * student filling in a form. They all mean the same thing and should look like
 * it. Anything else is left exactly as printed: `7.0+` and `Historically around
 * 8.5` both carry information a tidier label would throw away.
 */
const NO_CUTOFF = /^\s*(n\.?\s*a\.?|none|nil|no\s+cgpa.*|not?\s+(applicable|specified|mentioned|disclosed).*)\s*$/i

export function cutoffLabel(raw?: string) {
  if (!raw?.trim()) return null
  return NO_CUTOFF.test(raw) ? 'No cutoff' : raw.trim()
}
