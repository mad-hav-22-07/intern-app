import type { CodingProblem } from '../problemTypes'
import { CORE_PROBLEMS } from './core'
import { ARRAYS_PROBLEMS } from './arrays-hashing'
import { TWO_POINTER_PROBLEMS } from './two-pointers'
import { SEARCH_PROBLEMS } from './search-stack'
import { DP_PROBLEMS } from './dp-greedy'
import { GRAPH_PROBLEMS } from './graphs-bits'

/**
 * Every solvable problem in the app.
 *
 * One file per topic group, aggregated here. Adding a set is: write the file,
 * add it to this array, add its reference solutions under `scripts/solutions/`,
 * and run `npm run verify:problems` until it is green. See
 * `docs/AUTHORING-PROBLEMS.md` for the contract.
 *
 * Order is the order they appear in the practice list, so it runs easy-ish to
 * hard-ish rather than alphabetically.
 */
export const ALL_PROBLEMS: CodingProblem[] = [
  ...CORE_PROBLEMS,
  ...ARRAYS_PROBLEMS,
  ...TWO_POINTER_PROBLEMS,
  ...SEARCH_PROBLEMS,
  ...DP_PROBLEMS,
  ...GRAPH_PROBLEMS,
]
