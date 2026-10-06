export type RoleId = 'sde' | 'quant' | 'consult' | 'finance' | 'aiml' | 'fmcg' | 'core'

export type ResourceKind =
  | 'sheet'
  | 'book'
  | 'course'
  | 'video'
  | 'platform'
  | 'doc'
  | 'alert'
  | 'project'

export type Resource = {
  id: string
  title: string
  by?: string
  kind: ResourceKind
  note?: string
  url?: string
  /** rough time investment, shown as a chip */
  effort?: string
  /**
   * A `StudyTrack` id from `data/quant.ts`. When present the dashboard row shows
   * how far through the material you are and links to the per-item tracker
   * instead of behaving like a single checkbox.
   */
  track?: string
}

export type Section = {
  id: string
  title: string
  hint?: string
  resources: Resource[]
}

export type Role = {
  id: RoleId
  label: string
  tagline: string
  /** companies juniors will recognise; purely illustrative */
  companies: string[]
  sections: Section[]
}

/**
 * Placeholder curriculum transcribed from the handwritten plan (notes/IMG_1002-1003).
 * Links are intentionally left empty where the real material has not been collected yet.
 * the UI renders those as un-linked entries instead of dead links.
 */
export const ROLES: Role[] = [
  {
    id: 'sde',
    label: 'SDE',
    tagline: 'DSA depth first, then the CS fundamentals every interview loops back to.',
    companies: ['Google', 'Microsoft', 'Uber', 'Atlassian', 'Rubrik', 'Zomato'],
    sections: [
      {
        id: 'sde-dsa',
        title: 'Data Structures & Algorithms',
        hint: 'The single highest-leverage block. Start here on day one.',
        resources: [
          {
            id: 'r-blind75',
            title: 'NeetCode Blind 75',
            by: 'NeetCode',
            kind: 'sheet',
            note: 'The 75 that cover every pattern once. Start here, and use it again for revision in the last fortnight before a shortlist.',
            url: 'https://neetcode.io/practice',
            effort: '4-6 weeks',
            track: 'neetcode-75',
          },
          {
            id: 'r-neetcode150',
            title: 'NeetCode 150',
            by: 'NeetCode',
            kind: 'sheet',
            note: 'The 75 plus the depth. This is the one to actually finish if you have a semester.',
            url: 'https://neetcode.io/practice',
            effort: '10-12 weeks',
            track: 'neetcode-150',
          },
          {
            id: 'r-neetcode250',
            title: 'NeetCode 250',
            by: 'NeetCode',
            kind: 'sheet',
            note: 'Only once 150 is done and you want more reps per pattern rather than more patterns.',
            url: 'https://neetcode.io/practice',
            effort: 'ongoing',
            track: 'neetcode-250',
          },
          {
            id: 'r-practice',
            title: 'Solve here, in the browser',
            kind: 'platform',
            note: 'Our own problems, with a real judge in Python, C++, Java or JavaScript. No account, no setup.',
            url: '/practice',
            effort: 'ongoing',
          },
          {
            id: 'r-cpcontest',
            title: 'Codeforces / LeetCode contest routine',
            kind: 'platform',
            note: 'One rated contest a week to build speed under pressure.',
            effort: 'ongoing',
          },
        ],
      },
      {
        id: 'sde-core',
        title: 'CS Fundamentals',
        hint: 'Asked in almost every technical round after the DSA round.',
        resources: [
          { id: 'r-os', title: 'Operating Systems', by: 'GeeksforGeeks', kind: 'doc', effort: '2 weeks' },
          { id: 'r-cn', title: 'Computer Networks', by: 'GeeksforGeeks', kind: 'doc', effort: '2 weeks' },
          {
            id: 'r-sql',
            title: 'SQL & DBMS',
            kind: 'doc',
            note: 'Joins, indexing, normalisation, transactions. The theory half of the round.',
            effort: '2 weeks',
          },
          {
            id: 'r-sql-practice',
            title: 'SQL problems, in the browser',
            kind: 'platform',
            note: 'The other half: actually writing the query. Judged against a real SQLite, same as the coding problems.',
            url: '/practice',
            effort: 'ongoing',
          },
        ],
      },
      {
        id: 'sde-sysdes',
        title: 'System Design',
        hint: 'Mostly for later-stage rounds and PPO conversions.',
        resources: [
          { id: 'r-lld', title: 'Low Level Design + OOP patterns', kind: 'course', effort: '3 weeks' },
          { id: 'r-hld', title: 'High Level Design primer', kind: 'course', note: 'Caching, load balancing, sharding, queues.', effort: '3 weeks' },
        ],
      },
    ],
  },
  {
    id: 'quant',
    label: 'Quant',
    tagline: 'Probability and puzzles until they are reflex, plus enough code to implement fast.',
    companies: ['Optiver', 'Quadeye', 'Graviton', 'WorldQuant', 'AlphaGrep', 'Tower Research'],
    sections: [
      {
        id: 'quant-prob',
        title: 'Probability & Statistics',
        hint: 'Non-negotiable. Every quant round opens here. Theory first, then the two problem books.',
        resources: [
          {
            id: 'q-mit-prob',
            title: 'Introduction to Probability (MIT 6.041)',
            by: 'Bertsekas & Tsitsiklis',
            kind: 'course',
            note: 'The theory, free on OCW, with the authors\u2019 own 77-page summary notes. Start here if puzzles keep beating you on the setup rather than the algebra.',
            url: 'https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/',
            effort: '10-12 weeks',
            track: 'mit-prob',
          },
          {
            id: 'q-fifty',
            title: 'Fifty Challenging Problems in Probability',
            by: 'Mosteller',
            kind: 'book',
            note: 'Eighty pages, 56 problems, and most of a quant probability interview inside them.',
            url: 'https://store.doverpublications.com/products/9780486653556',
            effort: '3 weeks',
            track: 'mosteller',
          },
          {
            id: 'q-heard',
            title: 'Heard on the Street',
            by: 'Timothy Crack',
            kind: 'book',
            note: 'Real questions from real Wall Street interviews. The standard book for trading desks.',
            url: 'https://www.amazon.com/dp/1991155484',
            effort: '4-6 weeks',
            track: 'hots',
          },
          {
            id: 'q-stat110',
            title: 'Statistics 110: Probability',
            by: 'Joe Blitzstein · Harvard',
            kind: 'course',
            note: '34 lectures on YouTube plus Harvard\u2019s own practice sets. The friendlier route through the same material as 6.041.',
            url: 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo',
            effort: '10 weeks',
            track: 'stat110',
          },
          {
            id: 'q-blitzstein',
            title: 'Introduction to Probability',
            by: 'Blitzstein & Hwang',
            kind: 'book',
            note: 'The textbook Stat 110 is built on, free from the authors. The long way round \u2014 worth it with a full semester, skip it with six weeks.',
            effort: '8 weeks',
            track: 'blitzstein-hwang',
          },
          {
            id: 'q-ross',
            title: 'A First Course in Probability',
            by: 'Sheldon Ross',
            kind: 'book',
            note: 'The standard undergraduate text. Use it as a reference when one chapter of the others will not go in.',
            effort: 'reference',
            track: 'ross-fcp',
          },
          {
            id: 'q-wasserman',
            title: 'All of Statistics',
            by: 'Larry Wasserman',
            kind: 'book',
            note: 'Where you go once probability is solid and the questions turn to inference, estimation and regression.',
            effort: '8 weeks',
            track: 'wasserman-aos',
          },
        ],
      },
      {
        id: 'quant-puzzles',
        title: 'Puzzles & Brainteasers',
        hint: 'Do Brainstellar end to end before you buy anything else.',
        resources: [
          {
            id: 'q-brainstellar',
            title: 'Brainstellar puzzles',
            by: 'brainstellar.com',
            kind: 'platform',
            note: 'All 101, in the site\u2019s own four tiers. Free, with written solutions.',
            url: 'https://brainstellar.com/',
            effort: 'ongoing',
            track: 'brainstellar',
          },
          {
            id: 'q-puzzledquant',
            title: 'PuzzledQuant',
            by: 'puzzledquant.com',
            kind: 'platform',
            note: 'Company-tagged puzzles. Use it after Brainstellar stops surprising you.',
            url: 'https://www.puzzledquant.com/',
            effort: 'ongoing',
            track: 'puzzledquant',
          },
        ],
      },
      {
        id: 'quant-mental',
        title: 'Mental Maths',
        hint: 'The first screen at most trading firms, and the one people skip until the week before.',
        resources: [
          {
            id: 'q-80in8',
            title: '80 in 8 arithmetic drill',
            by: 'Optiver-style',
            kind: 'platform',
            note: '80 questions, 8 minutes, no calculator. Pure drill \u2014 a session a day until it is reflex.',
            url: 'https://80in8.netlify.app/',
            effort: '10 min a day',
            track: 'mental-math',
          },
          {
            id: 'q-zetamac',
            title: 'Zetamac arithmetic game',
            kind: 'platform',
            note: 'The 120-second drill everyone quotes their score from.',
            url: 'https://arithmetic.zetamac.com/',
            effort: 'ongoing',
          },
        ],
      },
      {
        id: 'quant-cs',
        title: 'Coding & Maths',
        resources: [
          { id: 'q-cf', title: 'Codeforces contest alerts', kind: 'alert', note: 'Live feed lands in the Competitions tab.' },
          {
            id: 'q-dsa',
            title: 'NeetCode Blind 75',
            by: 'NeetCode',
            kind: 'sheet',
            note: 'Quant coding rounds are usually easy-medium DSA. The 75 is more than enough.',
            url: 'https://neetcode.io/practice',
            effort: '4-6 weeks',
            track: 'neetcode-75',
          },
          { id: 'q-linalg', title: 'Linear Algebra & Calculus refresher', kind: 'book', effort: '3 weeks' },
        ],
      },
    ],
  },
  {
    id: 'consult',
    label: 'Consulting',
    tagline: 'Case practice with a partner, every single day. Frameworks come second.',
    companies: ['McKinsey', 'BCG', 'Bain', 'Kearney', 'ZS Associates', 'Accenture Strategy'],
    sections: [
      {
        id: 'con-case',
        title: 'Case Preparation',
        resources: [
          { id: 'c-casebook', title: 'IITM Case Book', kind: 'book', note: 'Insti-specific, closest to what actually gets asked.', effort: '6 weeks' },
          { id: 'c-guide', title: 'Guide to preparing for consulting interviews', kind: 'doc', effort: '1 week' },
          { id: 'c-victor', title: 'Case interview frameworks primer', kind: 'doc', effort: '2 weeks' },
        ],
      },
      {
        id: 'con-guess',
        title: 'Guesstimates',
        hint: 'Practice out loud. Structure beats the number.',
        resources: [
          { id: 'c-guess', title: 'Guesstimate question bank', kind: 'sheet', effort: '3 weeks' },
          { id: 'c-market', title: 'Market sizing walkthroughs', kind: 'video', effort: '1 week' },
        ],
      },
      {
        id: 'con-comp',
        title: 'Case Competitions',
        resources: [
          { id: 'c-alert', title: 'Case competition alerts', kind: 'alert', note: 'Unstop + insti mails, surfaced in Competitions.' },
          { id: 'c-deck', title: 'Winning deck teardowns', kind: 'doc', effort: 'ongoing' },
        ],
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    tagline: 'Aptitude speed plus enough markets knowledge to hold a conversation.',
    companies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Nomura', 'DE Shaw', 'Axis Capital'],
    sections: [
      {
        id: 'fin-apt',
        title: 'Aptitude',
        resources: [
          { id: 'f-apt', title: 'Quantitative aptitude drill set', kind: 'sheet', note: 'Shortlisting tests are speed tests.', effort: '4 weeks' },
          { id: 'f-di', title: 'Data interpretation practice', kind: 'sheet', effort: '2 weeks' },
        ],
      },
      {
        id: 'fin-books',
        title: 'Finance Fundamentals',
        resources: [
          { id: 'f-hull', title: 'Options, Futures and Other Derivatives', by: 'Hull', kind: 'book', effort: '8 weeks' },
          { id: 'f-valuation', title: 'Valuation & financial statements primer', kind: 'book', effort: '4 weeks' },
          { id: 'f-news', title: 'Daily markets reading habit', kind: 'doc', note: '15 min/day. Interviewers open with "what did you read today?"', effort: 'ongoing' },
        ],
      },
      {
        id: 'fin-proj',
        title: 'Projects',
        hint: 'Mined from past shortlisted resumes. These are the ones that got calls.',
        resources: [
          { id: 'f-p1', title: 'Portfolio optimisation & backtesting', kind: 'project', effort: '3 weeks' },
          { id: 'f-p2', title: 'Equity research report on one listed company', kind: 'project', effort: '2 weeks' },
        ],
      },
    ],
  },
  {
    id: 'aiml',
    label: 'AI / ML & Data',
    tagline: 'Build intuition first, then ship two projects you can defend line by line.',
    companies: ['NVIDIA', 'Adobe', 'Sprinklr', 'Fractal', 'Mastercard', 'Samsung R&D'],
    sections: [
      {
        id: 'ai-found',
        title: 'Foundations',
        resources: [
          { id: 'a-3b1b', title: 'Neural Networks series', by: '3Blue1Brown', kind: 'video', note: 'Best intuition-per-minute on the internet.', effort: '1 week' },
          { id: 'a-karpathy', title: 'Zero to Hero', by: 'Andrej Karpathy', kind: 'video', note: 'Build a transformer from scratch. Do not skip the exercises.', effort: '6 weeks' },
          { id: 'a-ml', title: 'Classical ML material', kind: 'course', note: 'Regression, trees, boosting, evaluation metrics.', effort: '4 weeks' },
        ],
      },
      {
        id: 'ai-code',
        title: 'Coding & Data',
        resources: [
          { id: 'a-py', title: 'Python practice platform', kind: 'platform', effort: 'ongoing' },
          {
            id: 'a-sql',
            title: 'SQL problems, in the browser',
            kind: 'platform',
            note: 'Joins, aggregation, window functions and CTEs, judged against a real SQLite. Window functions come up constantly in data interviews.',
            url: '/practice',
            effort: '2 weeks',
          },
          { id: 'a-pandas', title: 'Pandas / NumPy drills', kind: 'sheet', effort: '2 weeks' },
        ],
      },
      {
        id: 'ai-proj',
        title: 'Projects & Hackathons',
        resources: [
          { id: 'a-hack', title: 'Hackathon alerts', kind: 'alert', note: 'Surfaced in Competitions.' },
          { id: 'a-p1', title: 'One end-to-end deployed ML project', kind: 'project', effort: '4 weeks' },
        ],
      },
    ],
  },
  {
    id: 'fmcg',
    label: 'FMCG',
    tagline: 'Aptitude, communication, and a GD you can steer without dominating.',
    companies: ['HUL', 'P&G', 'ITC', 'Nestle', 'Asian Paints', 'Mondelez'],
    sections: [
      {
        id: 'fm-apt',
        title: 'Aptitude & English',
        resources: [
          { id: 'm-apt', title: 'Aptitude material', kind: 'sheet', effort: '4 weeks' },
          { id: 'm-eng', title: 'Verbal ability & reading comprehension', kind: 'sheet', effort: '3 weeks' },
        ],
      },
      {
        id: 'fm-supply',
        title: 'Supply Chain & Operations',
        resources: [
          { id: 'm-sc', title: 'Supply chain fundamentals', kind: 'doc', effort: '3 weeks' },
          { id: 'm-case', title: 'FMCG business case walkthroughs', kind: 'video', effort: '2 weeks' },
        ],
      },
      {
        id: 'fm-gd',
        title: 'Group Discussion',
        hint: 'The differentiator for FMCG shortlists. Practice in groups of six.',
        resources: [
          { id: 'm-gdg', title: 'GD guidelines & scoring rubric', kind: 'doc', effort: '2 days' },
          { id: 'm-gdq', title: 'Example GD questions (past years)', kind: 'sheet', effort: 'ongoing' },
        ],
      },
    ],
  },
  {
    id: 'core',
    label: 'Core',
    tagline: 'Your department fundamentals, taken seriously, plus a project you built.',
    companies: ['Shell', 'Qualcomm', 'Texas Instruments', 'L&T', 'Tata Steel', 'ISRO'],
    sections: [
      {
        id: 'core-dept',
        title: 'Department-specific material',
        hint: 'Curated per branch: CS, EE, ME, CH, CE, AE, MM, BT.',
        resources: [
          { id: 'k-dept', title: 'Core subject revision sheets', kind: 'sheet', effort: '6 weeks' },
          { id: 'k-past', title: 'Past core interview questions by department', kind: 'sheet', effort: '2 weeks' },
        ],
      },
      {
        id: 'core-gen',
        title: 'General tips & videos',
        resources: [
          { id: 'k-tips', title: 'Core placement general tips', kind: 'doc', effort: '1 day' },
          { id: 'k-vid', title: 'Senior experience videos', kind: 'video', effort: '2 hours' },
        ],
      },
    ],
  },
]

/** Shared across every role. The notes call for basic interview guidelines for everyone. */
export const COMMON_SECTION: Section = {
  id: 'common',
  title: 'For every role',
  hint: 'Shared material. Applies no matter which profile you target.',
  resources: [
    { id: 'x-guide', title: 'Basic interview guidelines', kind: 'doc', note: 'Structure, STAR answers, what not to say.', effort: '1 day' },
    { id: 'x-sl', title: 'Shortlisting & CDC process explained', kind: 'doc', note: 'How slots, day-wise ordering and PPOs actually work.', effort: '1 day' },
    { id: 'x-hr', title: 'Common HR questions + strong answers', kind: 'sheet', effort: '3 days' },
    { id: 'x-resume', title: 'Resume building walkthrough', kind: 'video', note: 'IITM one-page format, bullet phrasing, what to cut.', effort: '2 hours' },
  ],
}

export const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<RoleId, Role>
