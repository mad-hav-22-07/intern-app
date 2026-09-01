import type { RoleId } from './roles'
import type { BankSource, BankDifficulty } from './questionBank'
import type { Case, Signature, Lang } from '@/lib/harness'

/**
 * The solvable half of the question bank.
 *
 * `questionBank.ts` is a *catalogue*: it points at problems that live on
 * LeetCode, Codeforces and HackerRank and deliberately does not copy their text.
 * This file is the opposite — every statement here is written from scratch so it
 * can be shipped, judged and shown inside a proctored round without borrowing
 * anyone's copy. Each one names the well-known problem it is modelled on under
 * `origin`, so a student can go read the original discussion afterwards.
 *
 * The shape is LeetCode's, not Codeforces': you implement a method, the judge
 * calls it with real arguments and compares what you returned. Nobody parses
 * stdin, nobody prints an answer. `lib/harness.ts` is what makes that work
 * across four languages — see the notes at the top of it.
 *
 * Cases marked `hidden` are withheld until submit, exactly like a real judge:
 * "Run" checks the examples, "Submit" runs everything.
 */

/*
 * Languages live in `lib/drivers/`, one file per driver, and `Lang` is derived
 * from that registry. Re-exported here so the ~30 places that import them from
 * `@/data/coding` keep working.
 */
export type { Lang } from '@/lib/harness'
export { LANGS } from '@/lib/harness'

export type CodingProblem = {
  id: string
  title: string
  difficulty: BankDifficulty
  topics: string[]
  roles: RoleId[]
  /** Paragraphs. `backticks` become inline code; nothing else is parsed. */
  statement: string[]
  constraints: string[]
  /** What the student implements, and what the judge calls. */
  signature: Signature
  cases: Case[]
  /**
   * Hand-written starters, by language. Partial on purpose: a language added
   * after a problem was written falls back to a stub generated from the
   * signature (`starterFor` in `lib/harness`), so adding a language does not
   * mean writing a stub for every problem that already exists.
   */
  starter: Partial<Record<Lang, string>>
  /** The published problem this one is modelled on. */
  origin: { source: BankSource; title: string; url: string }
  /** Revealed one at a time, and only if asked for. Costs nothing but pride. */
  hints: string[]
}
