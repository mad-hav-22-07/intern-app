import type { Company } from './bluebookTypes'
import { BLUEBOOK_2024 } from './bluebook/y2024'
import { BLUEBOOK_2025 } from './bluebook/y2025'
import { BLUEBOOK_IDDD } from './bluebook/iddd2026'

/**
 * The Blue Books, merged.
 *
 * One file per edition under `bluebook/`, transcribed from the Placement &
 * Internship Cell's own PDFs in `Blue_Book/`. The type and the reasoning behind
 * its heavily-optional shape live in `bluebookTypes.ts` — read that first.
 *
 * Newest edition first, because a student planning next season cares far more
 * about what happened last year than what happened three years ago. The `edition`
 * field is on every row so the page can filter, and so a number can always be
 * traced back to the book it came from.
 */

export * from './bluebookTypes'

export const COMPANIES: Company[] = [...BLUEBOOK_IDDD, ...BLUEBOOK_2025, ...BLUEBOOK_2024]

/** Editions present, newest first — drives the filter and the "source" note. */
export const EDITIONS = ['IDDD 2026-27', '2025-26', '2024-25'] as const
