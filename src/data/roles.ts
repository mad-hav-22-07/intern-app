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
  /** companies juniors will recognise — purely illustrative */
  companies: string[]
  sections: Section[]
}

/**
 * Placeholder curriculum transcribed from the handwritten plan (notes/IMG_1002-1003).
 * Links are intentionally left empty where the real material has not been collected yet —
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
            id: 'r-striver',
            title: "Striver's Ultimate DSA Sheet (A2Z)",
            by: 'takeUforward',
            kind: 'sheet',
            note: 'Full coverage, topic-ordered. The backbone of the SDE track.',
            effort: '10-12 weeks',
          },
          {
            id: 'r-blind75',
            title: 'NeetCode Blind 75',
            by: 'NeetCode',
            kind: 'sheet',
            note: 'Use for quick revision in the last 2 weeks before a shortlist.',
            effort: '2 weeks',
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
          { id: 'r-sql', title: 'SQL & DBMS', kind: 'doc', note: 'Joins, indexing, normalisation, transactions.', effort: '2 weeks' },
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
        hint: 'Non-negotiable. Every quant round opens here.',
        resources: [
          { id: 'q-blitzstein', title: 'Introduction to Probability', by: 'Blitzstein & Hwang', kind: 'book', effort: '8 weeks' },
          { id: 'q-fifty', title: 'Fifty Challenging Problems in Probability', by: 'Mosteller', kind: 'book', effort: '3 weeks' },
          { id: 'q-heard', title: 'Heard on the Street', by: 'Timothy Crack', kind: 'book', note: 'Classic interview question bank.', effort: '4 weeks' },
        ],
      },
      {
        id: 'quant-puzzles',
        title: 'Puzzles & Brainteasers',
        resources: [
          { id: 'q-brainstellar', title: 'Brainstellar puzzles', kind: 'platform', note: 'Sorted by difficulty, closest to real interview style.', effort: 'ongoing' },
          { id: 'q-quantbox', title: 'QuantBox puzzle sets', kind: 'platform', effort: 'ongoing' },
        ],
      },
      {
        id: 'quant-cs',
        title: 'Coding & Maths',
        resources: [
          { id: 'q-cf', title: 'Codeforces contest alerts', kind: 'alert', note: 'Live feed lands in the Competitions tab.' },
          { id: 'q-dsa', title: "Striver's Ultimate DSA Sheet", kind: 'sheet', note: 'Quant coding rounds are usually easy-medium DSA.', effort: '6 weeks' },
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
        hint: 'Mined from past shortlisted resumes — these are the ones that got calls.',
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
          { id: 'a-sql', title: 'SQL for data roles', kind: 'sheet', note: 'Window functions and CTEs come up constantly.', effort: '2 weeks' },
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
        hint: 'Curated per branch — CS, EE, ME, CH, CE, AE, MM, BT.',
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

/** Shared across every role — the notes call for basic interview guidelines for everyone. */
export const COMMON_SECTION: Section = {
  id: 'common',
  title: 'For every role',
  hint: 'Shared material — applies no matter which profile you target.',
  resources: [
    { id: 'x-guide', title: 'Basic interview guidelines', kind: 'doc', note: 'Structure, STAR answers, what not to say.', effort: '1 day' },
    { id: 'x-sl', title: 'Shortlisting & CDC process explained', kind: 'doc', note: 'How slots, day-wise ordering and PPOs actually work.', effort: '1 day' },
    { id: 'x-hr', title: 'Common HR questions + strong answers', kind: 'sheet', effort: '3 days' },
    { id: 'x-resume', title: 'Resume building walkthrough', kind: 'video', note: 'IITM one-page format, bullet phrasing, what to cut.', effort: '2 hours' },
  ],
}

export const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<RoleId, Role>
export const ROLE_LABEL = (id: RoleId) => ROLE_MAP[id]?.label ?? id
