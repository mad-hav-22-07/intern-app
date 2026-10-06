import type { Lang } from '../../src/data/problemTypes'
import { CORE_SOLUTIONS } from './core'
import { ARRAYS_SOLUTIONS } from './arrays-hashing'
import { TWO_POINTER_SOLUTIONS } from './two-pointers'
import { SEARCH_SOLUTIONS } from './search-stack'
import { DP_SOLUTIONS } from './dp-greedy'
import { GRAPH_SOLUTIONS } from './graphs-bits'

/**
 * Reference solutions, keyed by problem id.
 *
 * These exist only for `scripts/verify-problems.mts`. Nothing in `src/` imports
 * this directory, so none of it reaches the bundle and no student can read the
 * answers out of the page source. One file per problem file in
 * `src/data/problems/`, same base name.
 */
export type SolutionSet = Partial<Record<Lang, string>>

export const SOLUTIONS: Record<string, SolutionSet> = {
  ...CORE_SOLUTIONS,
  ...ARRAYS_SOLUTIONS,
  ...TWO_POINTER_SOLUTIONS,
  ...SEARCH_SOLUTIONS,
  ...DP_SOLUTIONS,
  ...GRAPH_SOLUTIONS,
}
