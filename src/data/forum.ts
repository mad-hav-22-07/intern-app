import type { RoleId } from './roles'

export type Comment = {
  id: string
  author: string
  roll: string
  body: string
  ago: string
  votes: number
  replies?: Comment[]
}

export type Post = {
  id: string
  title: string
  body: string
  author: string
  roll: string
  ago: string
  hours: number
  votes: number
  topic: RoleId | 'general'
  flair: string
  pinned?: boolean
  reported?: boolean
  comments: Comment[]
}

export const TOPICS: { id: RoleId | 'general'; label: string; count: number }[] = [
  { id: 'general', label: 'General', count: 148 },
  { id: 'sde', label: 'SDE', count: 96 },
  { id: 'quant', label: 'Quant', count: 61 },
  { id: 'consult', label: 'Consulting', count: 54 },
  { id: 'finance', label: 'Finance', count: 33 },
  { id: 'aiml', label: 'AI / ML & Data', count: 47 },
  { id: 'fmcg', label: 'FMCG', count: 22 },
  { id: 'core', label: 'Core', count: 29 },
]

export const POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Megathread: Intern season 2026 — post your shortlists and rounds here',
    body: 'Keeping one place for everything so the feed does not get clogged. Format: Company | Profile | Round | What was asked. Please do not name interviewers.',
    author: 'Ananya S',
    roll: 'CS22B015',
    ago: '3h ago',
    hours: 3,
    votes: 214,
    topic: 'general',
    flair: 'Megathread',
    pinned: true,
    comments: [
      {
        id: 'p1c1',
        author: 'Rohit K',
        roll: 'EE22B091',
        body: 'Rubrik | SDE | Round 1 — two mediums, one on sliding window and one on LRU cache design. 70 minutes, HackerRank.',
        ago: '2h ago',
        votes: 41,
        replies: [
          { id: 'p1c1r1', author: 'Ananya S', roll: 'CS22B015', body: 'Same set for me. The LRU one wanted O(1) for both get and put, partial credit if you used an ordered map.', ago: '1h ago', votes: 18 },
        ],
      },
      { id: 'p1c2', author: 'Sneha M', roll: 'ME22B004', body: 'BCG | Consulting | Round 2 — profitability case on a regional cinema chain. Interviewer pushed hard on the cost side, be ready to break down fixed vs variable quickly.', ago: '1h ago', votes: 33 },
    ],
  },
  {
    id: 'p2',
    title: 'Optiver quant round — what actually showed up',
    body: 'Did the Optiver test yesterday. 8 minutes of mental maths (arithmetic under time pressure, this is the real filter), then 6 probability questions, then one market-making style question. The mental maths section is trainable — I used arithmetic drills for two weeks and went from 60% to 92%.',
    author: 'Karthik V',
    roll: 'MA22B027',
    ago: '5h ago',
    hours: 5,
    votes: 187,
    topic: 'quant',
    flair: 'Interview Experience',
    comments: [
      { id: 'p2c1', author: 'Divya R', roll: 'PH23B011', body: 'How many did you get right in the mental maths section to clear? Any idea of the cutoff?', ago: '4h ago', votes: 12 },
      { id: 'p2c2', author: 'Karthik V', roll: 'MA22B027', body: 'No official cutoff shared. Of the people I know who cleared, everyone was above ~85%. Below 75% nobody got a call.', ago: '3h ago', votes: 29 },
    ],
  },
  {
    id: 'p3',
    title: 'Is Striver A2Z enough for a Day 1 SDE shortlist, or do I need CP too?',
    body: 'Third year, ME branch, started DSA seriously two months ago. I can do most mediums but I panic in contests. Should I keep grinding the sheet or start doing Codeforces regularly?',
    author: 'Aditya P',
    roll: 'ME23B056',
    ago: '9h ago',
    hours: 9,
    votes: 92,
    topic: 'sde',
    flair: 'Question',
    comments: [
      { id: 'p3c1', author: 'Rohit K', roll: 'EE22B091', body: 'Sheet is enough for the shortlist test at most Day 1 companies. CP helps with speed, not with content. Do one Div 2 a week and keep the sheet as the main track.', ago: '8h ago', votes: 54 },
      { id: 'p3c2', author: 'Nikhil J', roll: 'CS22B073', body: 'Contest panic goes away after about ten contests. That is the whole trick, there is nothing else to it.', ago: '6h ago', votes: 38 },
    ],
  },
  {
    id: 'p4',
    title: 'Case partner wanted — consulting, evenings, starting this week',
    body: 'Looking for one serious partner to do a case a day, 8-9pm, alternating interviewer and interviewee. I have the IITM case book and about 20 cases from other campuses. DM if interested.',
    author: 'Sneha M',
    roll: 'ME22B004',
    ago: '14h ago',
    hours: 14,
    votes: 46,
    topic: 'consult',
    flair: 'Looking for partner',
    comments: [
      { id: 'p4c1', author: 'Ishaan B', roll: 'CH22B038', body: 'In. I can do 8pm most days except Wednesdays.', ago: '12h ago', votes: 9 },
    ],
  },
  {
    id: 'p5',
    title: 'Resume checker gave me 61 — is the "quantify everything" advice actually real?',
    body: 'Every bullet I have is technically true but none of them have numbers because my project did not have users. What do people do here — do you estimate, or leave it qualitative?',
    author: 'Priya N',
    roll: 'BT23B019',
    ago: '20h ago',
    hours: 20,
    votes: 71,
    topic: 'general',
    flair: 'Resume',
    comments: [
      { id: 'p5c1', author: 'Ananya S', roll: 'CS22B015', body: 'Scope counts as a number. "Processed 12k records", "Reduced build time from 4min to 40s", "Handled 3 concurrent services". You almost always have a number, it is just not a user count.', ago: '18h ago', votes: 63 },
      { id: 'p5c2', author: 'Vikram T', roll: 'EE23B002', body: 'Do not invent numbers though. Getting caught fabricating in an interview ends the interview.', ago: '15h ago', votes: 44 },
    ],
  },
  {
    id: 'p6',
    title: 'Compiled: every AI/ML intern question I was asked across 4 companies',
    body: 'Bias-variance, why does dropout work, explain attention without maths, how would you detect data leakage, and one live debugging of a training loop. Full list in the comments, roughly grouped by company type.',
    author: 'Meera L',
    roll: 'CS22B044',
    ago: '2d ago',
    hours: 44,
    votes: 158,
    topic: 'aiml',
    flair: 'Resource',
    comments: [
      { id: 'p6c1', author: 'Tanmay G', roll: 'AE23B021', body: 'The live debugging one is underrated. Two of my interviews had it and nobody prepares for it.', ago: '1d ago', votes: 27 },
    ],
  },
  {
    id: 'p7',
    title: 'HUL GD round format — 6 people, 15 minutes, abstract topic',
    body: 'Topic was "Is convenience making us worse at patience". Panel scored on structure, not volume. Two people who spoke the most did not clear. One person who spoke three times but summarised at the end did.',
    author: 'Ishaan B',
    roll: 'CH22B038',
    ago: '2d ago',
    hours: 50,
    votes: 88,
    topic: 'fmcg',
    flair: 'Interview Experience',
    comments: [
      { id: 'p7c1', author: 'Priya N', roll: 'BT23B019', body: 'Summarising at the end is the single highest ROI move in a GD and it is free.', ago: '2d ago', votes: 31 },
    ],
  },
  {
    id: 'p8',
    title: 'Core placements are not dead, but you have to actually know your department',
    body: 'Three core interviews, all of them opened with second-year course content. Heat transfer, manufacturing processes, one derivation. Nobody asked a single puzzle.',
    author: 'Vikram T',
    roll: 'EE23B002',
    ago: '3d ago',
    hours: 70,
    votes: 64,
    topic: 'core',
    flair: 'Interview Experience',
    comments: [],
  },
  {
    id: 'p9',
    title: 'Selling my "guaranteed shortlist" course, DM for price',
    body: 'Cracked 8 offers, sharing my exact method, limited seats.',
    author: 'anon_9241',
    roll: '—',
    ago: '4d ago',
    hours: 92,
    votes: -37,
    topic: 'general',
    flair: 'Spam',
    reported: true,
    comments: [
      { id: 'p9c1', author: 'Ananya S', roll: 'CS22B015', body: 'Reported. This is the fourth account this week.', ago: '4d ago', votes: 52 },
    ],
  },
  {
    id: 'p10',
    title: 'Finance: how much markets knowledge is actually expected in the first round?',
    body: 'Do they expect you to know current rates and indices, or is it purely aptitude plus behavioural in round one?',
    author: 'Rhea D',
    roll: 'MA23B008',
    ago: '5d ago',
    hours: 118,
    votes: 39,
    topic: 'finance',
    flair: 'Question',
    comments: [
      { id: 'p10c1', author: 'Karthik V', roll: 'MA22B027', body: 'Round one is aptitude. But have one market view you can defend for two minutes, it comes up in the fit round and almost nobody has one ready.', ago: '4d ago', votes: 35 },
    ],
  },
]
