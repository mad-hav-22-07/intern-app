import type { Company } from '@/data/bluebookTypes'
import { ROLE_MAP, type RoleId } from '@/data/roles'

/**
 * Answers computed from the Blue Book data, not written by hand.
 *
 * The assistant used to return prose someone typed out, which was fine while the
 * companies were invented and became a liability the moment they were real: a
 * hand-written "core roles converted best at 32%" is a number nobody recomputes
 * when the data changes, and a student will plan around it.
 *
 * So every answer here is derived. That has one consequence worth stating up
 * front rather than hiding: **the books are compiled from student feedback
 * forms, so most companies do not print application or offer counts at all.**
 * Every answer that depends on those numbers says how many companies it could
 * actually see, because "quant converts at 12%" computed over three companies is
 * a very different claim from the same number over thirty.
 */

export type Insight = {
  q: string
  /** Returns null when the data cannot support an answer at all. */
  answer: (companies: Company[]) => string | null
}

const pct = (a: number, b: number) => Math.round((a / b) * 100)

const list = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`

/*
 * A company appears once per role and once per edition — Morgan Stanley has two
 * roles in one book and shows up again in the next — so any answer that names
 * companies has to collapse them, or it reads "American Express, American
 * Express, Barclays".
 */
const uniqueNames = (cs: Company[]) => [...new Set(cs.map((c) => c.name))]

const median = (ns: number[]) => [...ns].sort((a, b) => a - b)[Math.floor(ns.length / 2)]

/** Companies with enough numbers to compute a conversion rate. */
const withFunnel = (cs: Company[]) =>
  cs.filter((c) => typeof c.shortlisted === 'number' && typeof c.offers === 'number' && c.shortlisted > 0)

/** How much of the book a claim is actually based on. */
const basis = (used: number, total: number) =>
  used === total
    ? ''
    : ` Based on the ${used} of ${total} companies whose entry prints the numbers — the rest do not, so treat this as indicative rather than complete.`

/*
 * Only the entries that actually name a number. The books write cutoffs as
 * `8.5`, `7.0+`, `7 and above`, `Historically around 8.5`, and also as `NA` and
 * `No CGPA criteria` — the first four all yield a usable number, the last two
 * must not be read as one.
 */
function cgpaNumbers(cs: Company[]) {
  return cs
    .map((c) => Number(String(c.cgpaCutoff ?? '').match(/\d+(\.\d+)?/)?.[0]))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 10)
}

export const INSIGHTS: Insight[] = [
  {
    q: 'What do students say actually gets tested?',
    answer: (cs) => {
      const topics = new Map<string, number>()
      for (const c of cs) for (const t of c.prepareTopics ?? []) {
        const k = t.trim()
        if (k) topics.set(k, (topics.get(k) ?? 0) + 1)
      }
      if (topics.size < 3) return null
      const top = [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
      return `The topics named most often across the book: ${top.map(([t, n]) => `${t} (${n})`).join(', ')}. Open any company row for the round-by-round feedback students left.`
    },
  },
  {
    q: 'Which profile converts shortlists into offers best?',
    answer: (cs) => {
      const usable = withFunnel(cs)
      if (usable.length < 4) return null
      const byProfile = new Map<RoleId, { s: number; o: number; n: number }>()
      for (const c of usable) {
        const e = byProfile.get(c.profile) ?? { s: 0, o: 0, n: 0 }
        e.s += c.shortlisted!
        e.o += c.offers!
        e.n++
        byProfile.set(c.profile, e)
      }
      const ranked = [...byProfile.entries()]
        .filter(([, e]) => e.s > 0)
        .sort((a, b) => b[1].o / b[1].s - a[1].o / a[1].s)
      if (!ranked.length) return null
      const lines = ranked.map(
        ([r, e]) => `${ROLE_MAP[r].label} ${pct(e.o, e.s)}% (${e.o} offers from ${e.s} shortlists across ${e.n} ${e.n === 1 ? 'company' : 'companies'})`,
      )
      return `Shortlist-to-offer conversion, best first: ${lines.join('; ')}.${basis(usable.length, cs.length)}`
    },
  },
  {
    q: 'What CGPA do I realistically need?',
    answer: (cs) => {
      const all = cgpaNumbers(cs)
      if (all.length < 3) return null
      const sorted = [...all].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      const day1 = cgpaNumbers(cs.filter((c) => /day\s*1/i.test(c.day ?? '')))
      const day1Median = day1.length ? [...day1].sort((a, b) => a - b)[Math.floor(day1.length / 2)] : null
      return (
        `Across the ${all.length} companies that publish a cutoff, the median is ${median.toFixed(1)} and the range is ${sorted[0].toFixed(1)} to ${sorted[sorted.length - 1].toFixed(1)}.` +
        (day1Median !== null
          ? ` Day 1 companies sit higher, at a median of ${day1Median.toFixed(1)} across ${day1.length} of them.`
          : '') +
        ' A published cutoff is necessary, not sufficient — the shortlisted cohort usually sits well above it.'
      )
    },
  },
  {
    q: 'How many rounds should I expect?',
    answer: (cs) => {
      const withRounds = cs.filter((c) => c.rounds.length > 0)
      if (withRounds.length < 4) return null
      const byProfile = new Map<RoleId, number[]>()
      for (const c of withRounds) {
        byProfile.set(c.profile, [...(byProfile.get(c.profile) ?? []), c.rounds.length])
      }
      /*
       * The median, not the range. Across 180 companies the range is "1 to 5"
       * for every profile, which tells a student nothing; the middle of the
       * distribution is the number they can actually plan an evening around.
       */
      const lines = [...byProfile.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([r, ns]) => `${ROLE_MAP[r].label} ${median(ns)}`)
      return `Typical number of selection rounds, taking the median for each profile: ${lines.join(', ')}. A handful of companies run one round and a handful run six, so treat this as the shape rather than the promise.${basis(withRounds.length, cs.length)}`
    },
  },
  {
    q: 'Which companies are open to every branch?',
    answer: (cs) => {
      const open = uniqueNames(cs.filter((c) => c.allBranches))
      if (!open.length) return null
      const names = open.slice(0, 12)
      return (
        `${open.length} ${open.length === 1 ? 'company' : 'companies'} in the book list no department restriction: ${list(names)}` +
        (open.length > names.length ? `, and ${open.length - names.length} more.` : '.') +
        ' Everything else names specific departments, so filter by yours above before planning.'
      )
    },
  },
  {
    q: 'What are the most competitive companies?',
    answer: (cs) => {
      const usable = withFunnel(cs).filter((c) => typeof c.applied === 'number' && c.applied! > 0)
      if (usable.length < 3) return null
      const seen = new Set<string>()
      const hardest = [...usable]
        .sort((a, b) => a.offers! / a.applied! - b.offers! / b.applied!)
        .filter((c) => !seen.has(c.name) && seen.add(c.name))
        .slice(0, 5)
        .map((c) => `${c.name} (${c.offers} from ${c.applied} applicants)`)
      return `Lowest offer rate against applications: ${list(hardest)}.${basis(usable.length, cs.length)}`
    },
  },

]

/** The questions that can actually be answered from the data we have. */
export function answerableInsights(companies: Company[]) {
  return INSIGHTS.map((i) => ({ q: i.q, a: i.answer(companies) })).filter(
    (x): x is { q: string; a: string } => x.a !== null,
  )
}
