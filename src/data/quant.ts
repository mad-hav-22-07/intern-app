import { QUESTION_BANK } from './questionBank'
import { PROBSTAT_TRACKS } from './probstat'
import { NEETCODE_TRACKS } from './neetcode'

/**
 * Study tracks: the things a quant candidate actually works through, with a
 * checkbox against every single item.
 *
 * The rule this file follows, and the reason it is shaped the way it is:
 * **we link to material, we do not reproduce it.** Brainstellar publishes its
 * puzzle titles and a stable URL per puzzle, so that track is a real list with
 * real links. Crack, Mosteller and Winkler are copyrighted books that you buy;
 * their problem *statements* and *titles* are not ours to copy, so those tracks
 * are numbered grids — you tick the number against your own copy. A numbered
 * grid is also simply the better tracker for a book you are working through.
 *
 * Every count and every link in this file was checked against the source in
 * August 2026. Where a number is edition-dependent it says so in `provenance`,
 * because a tracker that quietly disagrees with the book in the student's hands
 * is worse than no tracker.
 *
 * Item ids double as the keys in `done` (see `AppContext`), so they must be
 * globally unique and must never be renumbered — changing an id silently wipes
 * that item's tick for everyone.
 */

export type LinkKind = 'official' | 'buy' | 'free' | 'borrow' | 'practice'

export type SourceLink = {
  label: string
  url: string
  kind: LinkKind
  note?: string
}

export type ItemDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Deadly'

export type TrackItem = {
  id: string
  /** What goes in the cell or the row number: "7", "L14". */
  label: string
  /** Only where we are allowed to show one. */
  title?: string
  url?: string
  /**
   * Per-item difficulty, where the source publishes one. Drives the chip on the
   * row and the difficulty filter. Left off for a numbered grid, where we have
   * no per-number claim to make.
   */
  difficulty?: ItemDifficulty
  /** One topic tag, where the source publishes one. */
  topic?: string
}

export type TrackGroup = {
  id: string
  title: string
  note?: string
  /** `list` shows titles and links; `grid` shows numbered cells only. */
  layout: 'list' | 'grid'
  items: TrackItem[]
}

export type TrackKind = 'book' | 'notes' | 'platform' | 'drill'

export type StudyTrack = {
  id: string
  title: string
  by?: string
  kind: TrackKind
  /** One or two sentences on what it is and when to use it. */
  blurb: string
  /** What it costs you, roughly. */
  effort?: string
  links: SourceLink[]
  /** Where the counts came from, and anything edition-dependent. */
  provenance?: string
  groups: TrackGroup[]
}

/* --------------------------------------------------------------- Brainstellar */

/*
 * Read straight out of the question bank so there is one list of Brainstellar
 * puzzles in the codebase, not two that drift apart. The site's own four tiers
 * are Easy / Medium / Hard / Deadly, and they map onto its id bands exactly —
 * the gaps (113, 212, 214, 219, 1001, 1007, 1010) are puzzles that no longer
 * exist and 404 on the site, so 101 really is all of them.
 */
const bsNumber = (id: string) => Number(id.replace('bs-', ''))

const bsBand = (lo: number, hi: number, tier: ItemDifficulty): TrackItem[] =>
  QUESTION_BANK.filter((b) => b.source === 'Brainstellar')
    .filter((b) => bsNumber(b.id) >= lo && bsNumber(b.id) <= hi)
    .sort((a, b) => bsNumber(a.id) - bsNumber(b.id))
    .map((b) => ({
      id: b.id,
      label: String(bsNumber(b.id)),
      title: b.title,
      url: b.url,
      difficulty: tier,
      topic: b.topics[0],
    }))

const brainstellar: StudyTrack = {
  id: 'brainstellar',
  title: 'Brainstellar',
  by: 'brainstellar.com',
  kind: 'platform',
  blurb:
    'The closest free set to what actually gets asked in a quant interview, and the one most people work through first. Every puzzle has a written solution on the site.',
  effort: 'ongoing',
  links: [
    { label: 'All puzzles', url: 'https://brainstellar.com/', kind: 'official' },
    { label: 'Easy album', url: 'https://brainstellar.com/puzzles/easy', kind: 'official' },
  ],
  provenance:
    'All 101 puzzles, in the site\'s own four tiers. Titles and links verified against brainstellar.com in August 2026.',
  groups: [
    { id: 'bs-easy', title: 'Easy', layout: 'list', items: bsBand(1, 99, 'Easy'), note: 'Warm-ups. Do these in one sitting if you can.' },
    { id: 'bs-medium', title: 'Medium', layout: 'list', items: bsBand(100, 199, 'Medium') },
    { id: 'bs-hard', title: 'Hard', layout: 'list', items: bsBand(200, 999, 'Hard') },
    { id: 'bs-deadly', title: 'Deadly', layout: 'list', items: bsBand(1000, 1999, 'Deadly'), note: 'Well past interview difficulty. Fun, not required.' },
  ],
}

/* ------------------------------------------------------------------ grid helper */

const grid = (prefix: string, from: number, to: number): TrackItem[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    id: `${prefix}-${from + i}`,
    label: String(from + i),
  }))

/* ------------------------------------------------------- Heard on the Street */

const heardOnTheStreet: StudyTrack = {
  id: 'hots',
  title: 'Heard on the Street',
  by: 'Timothy Falcon Crack',
  kind: 'book',
  blurb:
    'Real questions from real Wall Street interviews, in four chapters: purely quantitative and logic, derivatives, other financial economics, and statistics. The standard book for trading and quant research interviews.',
  effort: '4-6 weeks',
  links: [
    { label: 'Buy (current edition)', url: 'https://www.amazon.com/dp/1991155484', kind: 'buy', note: "The author sells only through Amazon; there is no legitimate free PDF." },
    { label: 'Author page', url: 'https://www.goodreads.com/author/show/33691.Timothy_Falcon_Crack', kind: 'official' },
  ],
  provenance:
    'The current revised edition states 239 quantitative questions. Editions differ — the 18th had 211 — so if your copy stops earlier, just leave the tail unticked.',
  groups: [
    {
      id: 'hots-quant',
      title: 'Quantitative questions',
      note: 'Numbered as your copy numbers them. Chapters run: purely quantitative & logic, derivatives, other financial economics, statistics.',
      layout: 'grid',
      items: grid('hots-q', 1, 239),
    },
  ],
}

/* ------------------------------------------------------------------- Mosteller */

const mosteller: StudyTrack = {
  id: 'mosteller',
  title: 'Fifty Challenging Problems in Probability',
  by: 'Frederick Mosteller',
  kind: 'book',
  blurb:
    'Eighty pages, and most of a quant probability interview is in them. Short problems, full solutions, and a difficulty curve that stays honest to the end.',
  effort: '3 weeks',
  links: [
    { label: 'Buy (Dover)', url: 'https://store.doverpublications.com/products/9780486653556', kind: 'buy' },
    { label: 'Borrow (Internet Archive)', url: 'https://archive.org/details/fiftychallenging0000fred', kind: 'borrow', note: 'Free one-hour loans with an Archive account.' },
  ],
  provenance:
    'The title says fifty; the book contains 56 numbered problems. The grid runs to 56.',
  groups: [
    { id: 'mos-all', title: 'Problems 1-56', layout: 'grid', items: grid('mos', 1, 56) },
  ],
}

/* ------------------------------------------------------- MIT 6.041 / RES.6-012 */

const OCW = 'https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/pages'
const PART = {
  i: `${OCW}/part-i-the-fundamentals/`,
  ii: `${OCW}/part-ii-inference-limit-theorems/`,
  iii: `${OCW}/part-iii-random-processes/`,
}

/*
 * OCW publishes each lecture as a section of its part page rather than as its
 * own URL, so every lecture links to the part it lives in. Checked August 2026.
 */
const lectures = (part: keyof typeof PART, from: number, titles: string[]): TrackItem[] =>
  titles.map((title, i) => ({
    id: `mit-l${from + i}`,
    label: `L${from + i}`,
    title,
    url: PART[part],
  }))

/** The difficulty tiers a track actually uses, in display order. */
export const DIFFICULTY_ORDER: ItemDifficulty[] = ['Easy', 'Medium', 'Hard', 'Deadly']

export function trackDifficulties(t: StudyTrack): ItemDifficulty[] {
  const seen = new Set(t.groups.flatMap((g) => g.items.map((i) => i.difficulty).filter(Boolean)))
  return DIFFICULTY_ORDER.filter((d) => seen.has(d))
}

const mitProbability: StudyTrack = {
  id: 'mit-prob',
  title: 'Introduction to Probability',
  by: 'Bertsekas & Tsitsiklis · MIT 6.041 / RES.6-012',
  kind: 'notes',
  blurb:
    'The course the Bertsekas & Tsitsiklis textbook was written for, free on OCW with video for every lecture. This is where you go when a puzzle beats you and you realise the gap is theory, not cleverness.',
  effort: '10-12 weeks',
  links: [
    { label: 'Course home (OCW)', url: 'https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/', kind: 'free' },
    {
      label: 'Summary notes (PDF, 77pp)',
      url: 'https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/d973b10c2587781f86ca4f2aff49098f_MITRES_6_012S18_Textbook.pdf',
      kind: 'free',
      note: 'Bertsekas & Tsitsiklis’ own condensed summary of the textbook. Print it.',
    },
    {
      label: '6.041SC with problem sets & exams',
      url: 'https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/',
      kind: 'free',
      note: 'The older run of the same course, which published its psets and solutions.',
    },
  ],
  provenance: '26 lectures, titles taken from OCW RES.6-012 in August 2026.',
  groups: [
    {
      id: 'mit-part-i',
      title: 'Part I - The Fundamentals',
      layout: 'list',
      items: lectures('i', 1, [
        'Probability Models and Axioms',
        "Conditioning and Bayes' Rule",
        'Independence',
        'Counting',
        'Discrete Random Variables I',
        'Discrete Random Variables II',
        'Discrete Random Variables III',
        'Continuous Random Variables I',
        'Continuous Random Variables II',
        'Continuous Random Variables III',
        'Derived Distributions',
        'Sums of Independent R.V.s; Covariance and Correlation',
        'Conditional Expectation & Variance; Sums of a Random Number of R.V.s',
      ]),
    },
    {
      id: 'mit-part-ii',
      title: 'Part II - Inference & Limit Theorems',
      layout: 'list',
      items: lectures('ii', 14, [
        'Introduction to Bayesian Inference',
        'Linear Models with Normal Noise',
        'Least Mean Squares (LMS) Estimation',
        'Linear Least Mean Squares (LLMS) Estimation',
        'Inequalities, Convergence, and the Weak Law of Large Numbers',
        'The Central Limit Theorem',
        'An Introduction to Classical Statistics',
      ]),
    },
    {
      id: 'mit-part-iii',
      title: 'Part III - Random Processes',
      layout: 'list',
      items: lectures('iii', 21, [
        'The Bernoulli Process',
        'The Poisson Process I',
        'The Poisson Process II',
        'Finite-State Markov Chains',
        'Steady-State Behavior of Markov Chains',
        'Absorption Probabilities and Expected Time to Absorption',
      ]),
    },
  ],
}

/* ---------------------------------------------------------------- PuzzledQuant */

const puzzledQuant: StudyTrack = {
  id: 'puzzledquant',
  title: 'PuzzledQuant',
  by: 'puzzledquant.com',
  kind: 'platform',
  blurb:
    'Company-tagged interview puzzles, closer to a LeetCode for quant than a book. Useful once Brainstellar stops surprising you and you want questions attached to the firm that asked them.',
  effort: 'ongoing',
  links: [
    { label: 'PuzzledQuant', url: 'https://www.puzzledquant.com/', kind: 'official' },
    { label: 'Free weekly puzzle (Substack)', url: 'https://puzzledquant.substack.com/', kind: 'free' },
  ],
  provenance:
    'The site publishes a browsable index of roughly 950 problems, but it throttles automated access hard enough that we could not mirror it, and a list captured today would be stale within a month anyway. So this is a plain counter rather than the site\u2019s own list: log the first fifty you solve and use it as a streak. Checked August 2026.',
  groups: [
    { id: 'pq-first50', title: 'First 50 solved', layout: 'grid', items: grid('pq', 1, 50) },
  ],
}

/* ------------------------------------------------------------------ mental math */

const mentalMath: StudyTrack = {
  id: 'mental-math',
  title: 'Mental Maths: 80 in 8',
  by: 'Optiver-style arithmetic test',
  kind: 'drill',
  blurb:
    "80 arithmetic questions in 8 minutes, no calculator - Optiver's first-round screen, and now a common one across trading firms. It is pure drill: the only way through is a session a day until the speed is reflex.",
  effort: '10 min a day',
  links: [
    { label: '80in8 trainer', url: 'https://80in8.netlify.app/', kind: 'practice' },
    { label: 'Zetamac (classic drill)', url: 'https://arithmetic.zetamac.com/', kind: 'practice', note: 'Set 120 seconds and go. The default settings are the ones everyone quotes scores from.' },
    { label: 'What the test is', url: 'https://quantprep.io/mental_math_optiver_intro', kind: 'free' },
  ],
  provenance:
    'Scoring commonly quoted: +1 per correct, -2 per wrong, and a pass around 56. Firms change this without announcing it, so treat it as a target, not a rule.',
  groups: [
    {
      id: 'mm-sessions',
      title: '30 sessions',
      note: 'One tick per timed session, not per question. Thirty days is roughly where speed stops improving.',
      layout: 'grid',
      items: grid('mm', 1, 30),
    },
  ],
}

/* ---------------------------------------------------------------------- export */

/**
 * Every track in the app, quant and SDE.
 *
 * Order is roughly the order you should work through them: theory, then the
 * problem books, then puzzles, then drill; the DSA sheets sit at the end because
 * they belong to a different profile.
 */
export const STUDY_TRACKS: StudyTrack[] = [
  mitProbability,
  ...PROBSTAT_TRACKS,
  mosteller,
  heardOnTheStreet,
  brainstellar,
  puzzledQuant,
  mentalMath,
  ...NEETCODE_TRACKS,
]

export const TRACK_MAP: Record<string, StudyTrack> = Object.fromEntries(
  STUDY_TRACKS.map((t) => [t.id, t]),
)

export const trackItemIds = (t: StudyTrack) => t.groups.flatMap((g) => g.items.map((i) => i.id))

export const trackTotal = (t: StudyTrack) => t.groups.reduce((n, g) => n + g.items.length, 0)

export const KIND_WORD: Record<TrackKind, string> = {
  book: 'Book',
  notes: 'Course notes',
  platform: 'Platform',
  drill: 'Drill',
}

export const LINK_WORD: Record<LinkKind, string> = {
  official: 'Official',
  buy: 'Buy',
  free: 'Free',
  borrow: 'Borrow',
  practice: 'Practice',
}
