import type { StudyTrack, TrackItem } from './quant'

/**
 * Probability & statistics study tracks, beyond the six in `quant.ts`.
 *
 * Same rule as `quant.ts`: **we link to material, we do not reproduce it.**
 * Harvard publishes Stat 110's own lecture titles and its own numbered
 * Strategic Practice sets with stable per-item PDFs, so that track is a real
 * list with real links. Blitzstein & Hwang, Ross, and Wasserman are
 * copyrighted books - even where a free electronic copy exists - so those
 * tracks are numbered chapter grids, not lists of chapter titles you'd be
 * ticking off against someone else's table of contents.
 *
 * Every count and every link here was checked against the source in
 * August 2026. Harvard's stat110.hsites.harvard.edu domain returns HTTP 403
 * to curl and to the WebFetch tool on every single URL under it - including
 * its own homepage - which is Harvard's bot/WAF protection, not a broken
 * link: every stat110.hsites.harvard.edu URL below was opened in a real
 * Chrome session and confirmed to render (the lecture list, the eleven
 * Strategic Practice PDFs, and the PDF itself loading in Chrome's native
 * viewer rather than an error page).
 */

const s110Grid = (prefix: string, from: number, to: number): TrackItem[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    id: `${prefix}-${from + i}`,
    label: String(from + i),
  }))

/* -------------------------------------------------------------- Stat 110 */

const STAT110_YT = 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo'

/*
 * Titles are Harvard's own one-line lecture descriptions from
 * stat110.hsites.harvard.edu/youtube, checked August 2026. All 34 lectures
 * point at the single playlist above - Harvard's page does not give each
 * lecture its own URL.
 */
const s110Lectures: TrackItem[] = [
  'Sample spaces, naive definition of probability, counting, sampling',
  'Bose-Einstein, story proofs, Vandermonde identity, axioms of probability',
  'Birthday problem, properties of probability, inclusion-exclusion, matching problem',
  "Independence, Newton-Pepys, conditional probability, Bayes' rule",
  'Law of total probability, conditional probability examples, conditional independence',
  "Monty Hall problem, Simpson's paradox",
  "Gambler's ruin, first step analysis, random variables, Bernoulli, Binomial",
  'Random variables, CDFs, PMFs, Hypergeometric',
  'Independence, Geometric, expected values, indicator r.v.s, linearity, symmetry, fundamental bridge',
  'Linearity, Putnam problem, Negative Binomial, St. Petersburg paradox',
  'Sympathetic magic, Poisson distribution, Poisson approximation',
  'Discrete vs. continuous, PDFs, variance, standard deviation, Uniform, universality',
  'Standard Normal, Normal normalizing constant',
  'Normal distribution, standardization, LOTUS',
  'Midterm review, extra examples',
  'Exponential distribution, memoryless property',
  "Moment generating functions (MGFs), hybrid Bayes' rule, Laplace's rule of succession",
  'MGFs to get moments of Expo and Normal, sums of Poissons, joint distributions',
  'Joint, conditional, and marginal distributions, 2-D LOTUS, chicken-egg',
  'Expected distance between Normals, Multinomial, Cauchy',
  'Covariance, correlation, variance of a sum, variance of Hypergeometric',
  'Transformations, LogNormal, convolutions, the probabilistic method',
  "Beta distribution, Bayes' billiards, finance preview and examples",
  'Gamma distribution, Poisson processes',
  'Beta-Gamma (bank-post office), order statistics, conditional expectation, two envelope paradox',
  'Two envelope paradox (cont.), conditional expectation (cont.), waiting for HT vs. waiting for HH',
  "Conditional expectation (cont.), taking out what's known, Adam's law, Eve's law",
  'Sum of a random number of random variables, inequalities (Cauchy-Schwarz, Jensen, Markov, Chebyshev)',
  'Law of large numbers, central limit theorem',
  'Chi-Square, Student-t, Multivariate Normal',
  'Markov chains, transition matrix, stationary distribution',
  'Markov chains (cont.), irreducibility, reversibility, random walk on an undirected network',
  'Markov chains (cont.), Google PageRank as a Markov chain',
  'A look ahead',
].map((title, i) => ({
  id: `s110-l${i + 1}`,
  label: `L${i + 1}`,
  title,
  url: STAT110_YT,
}))

/*
 * The eleven Strategic Practice & Homework PDFs, each its own file at a
 * stable URL under stat110.hsites.harvard.edu. Confirmed present (all
 * eleven, plus the separate solutions PDF) via a live browser session,
 * August 2026 - curl gets a 403 from Harvard's WAF on the same URLs.
 */
const S110_FILES = 'https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files'
const s110Practice: TrackItem[] = Array.from({ length: 11 }, (_, i) => ({
  id: `s110-sp${i + 1}`,
  label: `Set ${i + 1}`,
  title: `Strategic Practice and Homework ${i + 1}`,
  url: `${S110_FILES}/strategic_practice_and_homework_${i + 1}.pdf`,
}))

const stat110: StudyTrack = {
  id: 'stat110',
  title: 'Statistics 110: Probability',
  by: 'Joe Blitzstein · Harvard',
  kind: 'notes',
  blurb:
    "Harvard's Stat 110, the course the Blitzstein & Hwang textbook was written for. Free lecture videos plus story-proof intuition that a puzzle book never gives you the theory for.",
  effort: '10-12 weeks',
  links: [
    { label: 'Course home', url: 'https://stat110.hsites.harvard.edu/', kind: 'official' },
    { label: 'Full lecture playlist (YouTube)', url: STAT110_YT, kind: 'free' },
    {
      label: 'Stat110x on edX',
      url: 'https://www.edx.org/learn/probability/harvard-university-introduction-to-probability',
      kind: 'free',
      note: 'Same material, self-paced, with the animations Harvard built for the online run.',
    },
    {
      label: "Solutions to book exercises marked 's'",
      url: `${S110_FILES}/selected_solutions_blitzstein_hwang_probability.pdf`,
      kind: 'free',
    },
  ],
  provenance:
    "34 lectures and 11 Strategic Practice & Homework sets, titles and file list taken from stat110.hsites.harvard.edu in August 2026.",
  groups: [
    { id: 's110-lectures', title: '34 lectures', layout: 'list', items: s110Lectures },
    {
      id: 's110-practice',
      title: 'Strategic Practice & Homework',
      note: 'Each PDF has practice problems organised by concept, solutions to those, a homework set, and its solutions.',
      layout: 'list',
      items: s110Practice,
    },
  ],
}

/* ------------------------------------------------- Blitzstein & Hwang book */

const blitzsteinHwang: StudyTrack = {
  id: 'blitzstein-hwang',
  title: 'Introduction to Probability',
  by: 'Joseph K. Blitzstein & Jessica Hwang',
  kind: 'book',
  blurb:
    'The textbook Stat 110 is built on: intuition-first, story-proof-heavy, and the standard recommendation alongside Stat 110 itself. The authors publish the full 2nd edition free.',
  effort: '10-12 weeks',
  links: [
    {
      label: 'Free full text, 2nd edition (Google Drive)',
      url: 'http://probabilitybook.net',
      kind: 'free',
      note: "Linked directly from Harvard's own stat110 site as \"Book\".",
    },
    {
      label: 'Publisher page (Routledge / CRC Press)',
      url: 'https://www.routledge.com/Introduction-to-Probability-Second-Edition/Blitzstein-Hwang/p/book/9781138369917',
      kind: 'official',
    },
    {
      label: "Solutions to exercises marked 's'",
      url: `${S110_FILES}/selected_solutions_blitzstein_hwang_probability.pdf`,
      kind: 'free',
    },
  ],
  provenance:
    "13 chapters (Probability and Counting through Poisson Processes), counted from the free 2nd-edition (2019) text at probabilitybook.net in August 2026. If your copy is the 1st edition (2013), check its own contents page before assuming the numbering lines up.",
  groups: [
    {
      id: 'bh-chapters',
      title: 'Chapters 1-13',
      note: 'Probability & counting, conditional probability, random variables & distributions, expectation, continuous random variables, moments, joint distributions, transformations, conditional expectation, inequalities & limit theorems, Markov chains, Markov chain Monte Carlo, Poisson processes.',
      layout: 'grid',
      items: s110Grid('bh-ch', 1, 13),
    },
  ],
}

/* ------------------------------------------------------------- Ross (FCP) */

const ross: StudyTrack = {
  id: 'ross-fcp',
  title: 'A First Course in Probability',
  by: 'Sheldon Ross',
  kind: 'book',
  blurb:
    'The other standard undergraduate probability text, more computational and less story-proof than Blitzstein & Hwang. Good for drilling combinatorics and conditioning until they are automatic.',
  effort: '8-10 weeks',
  links: [
    { label: 'Buy (Pearson, 10th ed.)', url: 'https://www.pearson.com/en-us/subject-catalog/p/Ross-First-Course-in-Probability-A-10th-Edition/P200000006334', kind: 'buy' },
    { label: 'Buy (Amazon, 10th ed.)', url: 'https://www.amazon.com/First-Course-Probability-10th/dp/0134753119', kind: 'buy' },
  ],
  provenance:
    "10 chapters (Combinatorial Analysis through Simulation) in the 10th edition (Pearson, 2019, ISBN 9780134753119), verified against Pearson's own contents listing in August 2026. Earlier editions are close but not guaranteed identical - check your own copy's contents page.",
  groups: [
    { id: 'ross-chapters', title: 'Chapters 1-10', layout: 'grid', items: s110Grid('ross-ch', 1, 10) },
  ],
}

/* --------------------------------------------------------- All of Statistics */

const wasserman: StudyTrack = {
  id: 'wasserman-aos',
  title: 'All of Statistics',
  by: 'Larry Wasserman',
  kind: 'book',
  blurb:
    'Probability and inference in one dense, fast-moving book: the natural next step once Stat 110 or Ross has the probability half solid and you need the statistics half - estimation, hypothesis testing, regression, the bootstrap - for a quant research interview.',
  effort: '10-12 weeks',
  links: [
    { label: 'Buy (Springer)', url: 'https://link.springer.com/book/10.1007/978-0-387-21736-9', kind: 'buy' },
    { label: 'Buy (Amazon)', url: 'https://www.amazon.com/dp/0387402721', kind: 'buy' },
    {
      label: "Author's page (errata, data, R code)",
      url: 'https://www.stat.cmu.edu/~larry/all-of-statistics/',
      kind: 'official',
      note: 'No book text, but the errata PDFs are worth checking before you assume a proof is wrong.',
    },
  ],
  provenance:
    "24 chapters in three parts, counted from the book's own contents pages (Springer, 2004) in August 2026: Part I Probability, chapters 1-5; Part II Statistical Inference, chapters 6-12; Part III Statistical Models and Methods, chapters 13-24 (the last two of which return to probability for stochastic processes and simulation).",
  groups: [
    { id: 'aos-chapters', title: 'Chapters 1-24', layout: 'grid', items: s110Grid('aos-ch', 1, 24) },
  ],
}

/* ---------------------------------------------------------------------- export */

export const PROBSTAT_TRACKS: StudyTrack[] = [
  stat110,
  blitzsteinHwang,
  ross,
  wasserman,
]
