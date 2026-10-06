import { ALL_PROBLEMS } from './problems'
import type { CodingProblem } from './problemTypes'
import type { RoleId } from './roles'
import type { BankDifficulty } from './questionBank'

/**
 * The solvable set, plus the rounds built out of it.
 *
 * Types and the language list live in `problemTypes.ts`; the problems themselves
 * live one topic-group per file under `problems/`. This file re-exports both so
 * that everything importing `@/data/coding` keeps working.
 */
export * from './problemTypes'

export const CODING_PROBLEMS: CodingProblem[] = ALL_PROBLEMS

export const PROBLEM_MAP: Record<string, CodingProblem> = Object.fromEntries(
  CODING_PROBLEMS.map((p) => [p.id, p]),
)

/* --------------------------------------------------------------------- round */

export type CodingRound = {
  id: string
  title: string
  role: RoleId
  minutes: number
  difficulty: BankDifficulty
  attempts: number
  avgScore: number
  yourBest?: number
  problemIds: string[]
  /** Blocks paste in the editor and counts every attempt, like a real proctor. */
  blockPaste: boolean
}

export const CODING_ROUNDS: CodingRound[] = [
  {
    id: 'cr1',
    title: 'SDE Online Assessment',
    role: 'sde',
    minutes: 75,
    difficulty: 'Medium',
    attempts: 496,
    avgScore: 48,
    yourBest: 62,
    problemIds: ['cp-pair-sum', 'cp-distinct-window', 'cp-room-booking'],
    blockPaste: true,
  },
  {
    id: 'cr2',
    title: 'Warm-up: One Problem, 20 Minutes',
    role: 'sde',
    minutes: 20,
    difficulty: 'Easy',
    attempts: 1130,
    avgScore: 71,
    problemIds: ['cp-pair-sum'],
    blockPaste: false,
  },
  {
    id: 'cr3',
    title: 'Arrays & Hashing Sprint',
    role: 'sde',
    minutes: 45,
    difficulty: 'Medium',
    attempts: 388,
    avgScore: 57,
    problemIds: ['cp-ar-class-president', 'cp-ar-badge-chain', 'cp-ar-donation-batches'],
    blockPaste: true,
  },
  {
    id: 'cr4',
    title: 'Two Pointers & Windows',
    role: 'sde',
    minutes: 50,
    difficulty: 'Medium',
    attempts: 271,
    avgScore: 51,
    problemIds: ['cp-tp-mirror-message', 'cp-tp-canal-dam', 'cp-tp-rain-basin'],
    blockPaste: true,
  },
  {
    id: 'cr5',
    title: 'Search, Stacks & Selection',
    role: 'sde',
    minutes: 60,
    difficulty: 'Medium',
    attempts: 204,
    avgScore: 46,
    problemIds: ['cp-se-first-fit-bin', 'cp-se-conveyor-load', 'cp-se-widest-shelf-span'],
    blockPaste: true,
  },
  {
    id: 'cr6',
    title: 'DP Under Pressure',
    role: 'sde',
    minutes: 60,
    difficulty: 'Hard',
    attempts: 163,
    avgScore: 39,
    problemIds: ['cp-dp-vault-row', 'cp-dp-canteen-change', 'cp-dp-roll-correction'],
    blockPaste: true,
  },
  {
    id: 'cr7',
    title: 'Graphs, Grids & Bits',
    role: 'sde',
    minutes: 60,
    difficulty: 'Hard',
    attempts: 149,
    avgScore: 41,
    problemIds: ['cp-gr-land-blocks', 'cp-gr-semester-plan', 'cp-gr-twin-loners'],
    blockPaste: true,
  },
  {
    id: 'cr8',
    title: 'Quant Coding Round',
    role: 'quant',
    minutes: 45,
    difficulty: 'Medium',
    attempts: 312,
    avgScore: 54,
    problemIds: ['cp-ar-scoreboard-echo', 'cp-dp-shuttle-loop', 'cp-se-kth-topper'],
    blockPaste: true,
  },
]
