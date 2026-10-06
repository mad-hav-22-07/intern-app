import type { RoleId } from './roles'
import type { CodingRound } from './coding'

/**
 * Exam *shapes*, not exam *history*.
 *
 * `CODING_ROUNDS` in `coding.ts` is a list of rounds that already have a batch
 * behind them — real attempts, a real average, sometimes a `yourBest`. That is
 * the wrong home for "here is what a Hard SDE final round looks like": adding
 * one more entry there means inventing a fake track record for a round nobody
 * has sat yet, and it means every new difficulty tier permanently bloats one
 * flat array with no way to say "this is the canonical Easy/Medium/Hard for
 * this track" versus "this is one of eight assorted rounds."
 *
 * A template answers a narrower question: for someone prepping for an SDE or
 * Quant OA, what does an Easy / Medium / Hard version of it actually contain,
 * and how long should the clock honestly run? `toRound()` below is the seam —
 * it turns a template into the exact `CodingRound` shape the exam UI already
 * knows how to render, so listing templates next to (or instead of) the
 * existing rounds is a one-line map, not a second render path.
 *
 * Difficulty tiers here mean the same thing they mean in `problemTypes.ts` —
 * they are not a repaint of `BankDifficulty`, they *are* it, so a template's
 * `tier` drops straight into `CodingRound.difficulty` with no translation.
 */

export type ExamTier = 'Easy' | 'Medium' | 'Hard'

export type ExamTemplate = {
  /** Stable and distinctive — this can end up as a localStorage key, so never renumber it. */
  id: string
  title: string
  role: RoleId
  tier: ExamTier
  /** Who this simulates sitting, which real round it stands in for, and what a pass looks like. */
  blurb: string
  minutes: number
  problemIds: string[]
  /** Blocks paste and counts every attempt, like a real proctor. Off for anything meant as a first timed rep rather than a simulation of the real gate. */
  blockPaste: boolean
  /**
   * A template has no batch behind it yet, and a 0-attempts / 0%-average card
   * reads as broken rather than as "new." These are seed telemetry, tuned to
   * sit in the same range as the equivalent tier in `CODING_ROUNDS` (compare
   * `cr2`, `cr1`, `cr6`) so a template card looks like a normal round card,
   * not a placeholder.
   */
  attempts: number
  avgScore: number
}

/**
 * Time budgets are per-problem, not a round number picked to look tidy:
 * ~20 min/problem for Easy, ~30 for Medium, ~45 for Hard, then summed and
 * rounded to a clean total. That is also why an Easy tier with one problem
 * and an Easy tier with two do not scale linearly — the second problem
 * doesn't get its own fresh 20 minutes, it gets what's left after the first
 * one stops needing "generous."
 *
 * Eight templates: three tiers each for SDE and Quant, plus two that exist
 * because a real prep cycle needs them and a bare 2×3 grid can't provide
 * them — a sub-half-hour first screener, and a full two-hour final-round
 * simulation. Problem picks are spread across the 28-problem pool on
 * purpose; the two exceptions (see `tpl-quant-hard`) are noted inline.
 */
export const EXAM_TEMPLATES: ExamTemplate[] = [
  {
    id: 'tpl-sde-screener',
    title: '30-Minute Screener',
    role: 'sde',
    tier: 'Easy',
    blurb:
      'The take-home a lot of startups send before they’ll even give you a phone screen: one Easy problem, thirty minutes, no ambiguity about the bar. Built for someone who has finished Blind 75 and wants a real clock, not a puzzle — solve it clean and you’ve cleared it.',
    minutes: 30,
    problemIds: ['cp-tp-mirror-message'],
    blockPaste: false,
    attempts: 640,
    avgScore: 74,
  },
  {
    id: 'tpl-sde-easy',
    title: 'SDE Screener',
    role: 'sde',
    tier: 'Easy',
    blurb:
      'A two-problem take-home for someone past Blind 75 who hasn’t sat a timed round yet — a hash-map lookup and a grid BFS, the two patterns almost every Easy round leans on. The clock is generous on purpose: the bar is finishing both, not finishing fast.',
    minutes: 45,
    problemIds: ['cp-pair-sum', 'cp-gr-land-blocks'],
    blockPaste: false,
    attempts: 512,
    avgScore: 68,
  },
  {
    id: 'tpl-sde-medium',
    title: 'SDE Standard OA',
    role: 'sde',
    tier: 'Medium',
    blurb:
      'The three-problem, ninety-minute OA most mid-size firms actually run: a two-pointer/greedy warm-up, a heap-selection problem, and a graph problem, paste blocked like the real proctor. Two clean solves plus a real dent in the third is a realistic shortlist.',
    minutes: 90,
    problemIds: ['cp-tp-canal-dam', 'cp-se-kth-topper', 'cp-gr-redundant-cable'],
    blockPaste: true,
    attempts: 340,
    avgScore: 50,
  },
  {
    id: 'tpl-sde-hard',
    title: 'SDE Onsite Hard Round',
    role: 'sde',
    tier: 'Hard',
    blurb:
      'The hardest round of a FAANG-adjacent onsite, compressed: two Hard problems, ninety minutes, no partial credit for an idea that doesn’t run. Clearing one cleanly and landing the core idea of the other is a strong showing — both is what separates a hire from a maybe.',
    minutes: 90,
    problemIds: ['cp-tp-rain-basin', 'cp-se-widest-shelf-span'],
    blockPaste: true,
    attempts: 178,
    avgScore: 37,
  },
  {
    id: 'tpl-sde-final',
    title: 'SDE Final Round Simulation',
    role: 'sde',
    tier: 'Hard',
    blurb:
      'A full two-hour final round: three Hard problems spanning DP, bit manipulation and prefix-sum/hashing, paste blocked throughout. This is meant to hurt — one full solve and two solid partials is a normal, passing outcome here, not a bad day.',
    minutes: 120,
    problemIds: ['cp-dp-roll-correction', 'cp-gr-twin-loners', 'cp-ar-donation-batches'],
    blockPaste: true,
    attempts: 96,
    avgScore: 29,
  },
  {
    id: 'tpl-quant-easy',
    title: 'Quant Screener',
    role: 'quant',
    tier: 'Easy',
    blurb:
      'A quant desk’s first coding screen for someone who already owns the DSA basics: a DP counting problem and a binary-search problem, the two patterns that show up before the probability puzzles start. Slower clock, room to actually think through the recurrence.',
    minutes: 40,
    problemIds: ['cp-dp-vault-row', 'cp-se-first-fit-bin'],
    blockPaste: false,
    attempts: 405,
    avgScore: 66,
  },
  {
    id: 'tpl-quant-medium',
    title: 'Quant Standard OA',
    role: 'quant',
    tier: 'Medium',
    blurb:
      'The standard quant coding OA: a prefix-sum problem, a DP-plus-binary-search problem, and a binary-search-on-the-answer problem, ninety minutes, paste blocked. Quant OAs test whether you can turn a word problem into the right structure fast — two clean solves is the bar.',
    minutes: 90,
    problemIds: ['cp-ar-scoreboard-echo', 'cp-dp-momentum-streak', 'cp-se-conveyor-load'],
    blockPaste: true,
    attempts: 261,
    avgScore: 47,
  },
  {
    id: 'tpl-quant-hard',
    title: 'Quant Hard Round',
    role: 'quant',
    tier: 'Hard',
    blurb:
      'What the coding leg of a quant final round looks like once the probability round is done: an interval/prefix-sum counting problem and an edit-distance-style DP, ninety minutes, no paste. Most candidates land only one of the two cleanly — that is enough to advance.',
    minutes: 90,
    // The Hard pool is five problems wide and both of these are already spent by the
    // SDE Hard tiers above (`tpl-sde-hard`, `tpl-sde-final`) — there is no unused Hard
    // problem left that is arithmetic/DP-flavoured rather than pointer- or bit-heavy.
    // Reusing them here is the honest choice over stretching a Medium problem to Hard
    // just to avoid the overlap; see the report for the underlying pool gap.
    problemIds: ['cp-ar-donation-batches', 'cp-dp-roll-correction'],
    blockPaste: true,
    attempts: 122,
    avgScore: 33,
  },
]

/** The seam: lets `MockExam.tsx` list templates through the exact same card/start path as `CODING_ROUNDS`. */
export function toRound(template: ExamTemplate): CodingRound {
  return {
    id: template.id,
    title: template.title,
    role: template.role,
    minutes: template.minutes,
    difficulty: template.tier,
    attempts: template.attempts,
    avgScore: template.avgScore,
    problemIds: template.problemIds,
    blockPaste: template.blockPaste,
  }
}
