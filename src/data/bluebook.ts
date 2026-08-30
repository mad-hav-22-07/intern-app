import type { RoleId } from './roles'

export type Company = {
  id: string
  name: string
  profile: RoleId
  role: string
  day: string
  ctc: string
  stipend: string
  depts: string[]
  applied: number
  shortlisted: number
  offers: number
  cgpaCutoff: string
  rounds: string[]
  jd: string
  location: string
  hasVideo?: boolean
}

export const DEPTS = ['CS', 'EE', 'ME', 'CH', 'CE', 'MA', 'PH', 'AE', 'MM', 'BT', 'NA', 'ED']

export const COMPANIES: Company[] = [
  { id: 'b1', name: 'Optiver', profile: 'quant', role: 'Quantitative Trader Intern', day: 'Day 1 Slot 1', ctc: 'n/a', stipend: '₹4,00,000 / month', depts: ['MA', 'CS', 'PH', 'EE'], applied: 412, shortlisted: 24, offers: 3, cgpaCutoff: '8.5', location: 'Amsterdam / Mumbai', hasVideo: true, rounds: ['Online mental maths + probability test', 'Puzzle round (2 interviewers)', 'Market making simulation', 'Final fit round'], jd: 'Work alongside traders on live markets. Expect heavy mental arithmetic under time pressure, probability, and a demonstrated ability to reason about expected value quickly. No finance background required; mathematical maturity is the filter.' },
  { id: 'b2', name: 'Google', profile: 'sde', role: 'Software Engineering Intern', day: 'Day 1 Slot 1', ctc: 'n/a', stipend: '₹1,85,000 / month', depts: ['CS', 'EE', 'MA', 'ME'], applied: 968, shortlisted: 61, offers: 14, cgpaCutoff: '8.0', location: 'Bangalore / Hyderabad', hasVideo: true, rounds: ['Online assessment (2 DSA)', 'Technical interview 1', 'Technical interview 2'], jd: 'Standard SWE intern loop. Two coding interviews, 45 minutes each, medium-to-hard DSA with an emphasis on clean code and communicating your approach before writing it. Some interviewers add a light system design follow-up.' },
  { id: 'b3', name: 'McKinsey & Company', profile: 'consult', role: 'Summer Business Analyst', day: 'Day 1 Slot 2', ctc: 'n/a', stipend: '₹2,20,000 / month', depts: ['ME', 'CS', 'CH', 'EE', 'CE', 'MA'], applied: 604, shortlisted: 38, offers: 6, cgpaCutoff: '8.0', location: 'Gurgaon / Mumbai', hasVideo: true, rounds: ['Solve game (digital assessment)', 'Case interview 1', 'Case interview 2', 'Partner round'], jd: 'Two interviewer-led cases plus a personal experience interview. Structure and communication weigh more than the final number. The Solve game is a separate filter run before campus interviews.' },
  { id: 'b4', name: 'Goldman Sachs', profile: 'finance', role: 'Summer Analyst, Global Markets', day: 'Day 1 Slot 2', ctc: 'n/a', stipend: '₹1,60,000 / month', depts: ['MA', 'CS', 'EE', 'ME', 'CH'], applied: 731, shortlisted: 44, offers: 9, cgpaCutoff: '8.0', location: 'Bangalore', rounds: ['Online aptitude + coding', 'Technical interview', 'HireVue behavioural', 'Superday'], jd: 'Aptitude-heavy first filter. Technical round covers probability, basic derivatives intuition and one guesstimate. Have a market view ready to defend, because it comes up in the fit round almost every year.' },
  { id: 'b5', name: 'NVIDIA', profile: 'aiml', role: 'Deep Learning Intern', day: 'Day 1 Slot 3', ctc: 'n/a', stipend: '₹1,50,000 / month', depts: ['CS', 'EE', 'MA', 'PH'], applied: 389, shortlisted: 27, offers: 5, cgpaCutoff: '8.5', location: 'Pune / Bangalore', hasVideo: true, rounds: ['Resume shortlist', 'ML fundamentals interview', 'Project deep-dive', 'Manager round'], jd: 'The project deep-dive is the round that decides it. Expect to defend every design choice in the projects on your resume, including ones from first year. Solid grasp of backprop, optimisers and evaluation metrics assumed.' },
  { id: 'b6', name: 'Hindustan Unilever', profile: 'fmcg', role: 'UNILEVER Leadership Internship', day: 'Day 1 Slot 3', ctc: 'n/a', stipend: '₹1,25,000 / month', depts: ['ME', 'CH', 'CE', 'EE', 'MM', 'BT'], applied: 556, shortlisted: 42, offers: 8, cgpaCutoff: '7.5', location: 'Mumbai + plant', rounds: ['Aptitude test', 'Group discussion', 'Personal interview', 'Business case presentation'], jd: 'GD is the real differentiator. Panel scores structure and the ability to build on others rather than airtime. Final round is a short business case presented to two managers.' },
  { id: 'b7', name: 'Microsoft', profile: 'sde', role: 'SWE Intern', day: 'Day 1 Slot 4', ctc: 'n/a', stipend: '₹1,70,000 / month', depts: ['CS', 'EE', 'MA', 'ME', 'ED'], applied: 874, shortlisted: 55, offers: 12, cgpaCutoff: '8.0', location: 'Hyderabad / Noida', rounds: ['Online assessment', 'Technical 1', 'Technical 2 + LLD', 'AA round'], jd: 'Second technical round usually includes a small low-level design problem alongside DSA. Behavioural signals are scored explicitly in the AA round.' },
  { id: 'b8', name: 'Quadeye', profile: 'quant', role: 'Quant Research Intern', day: 'Day 1 Slot 5', ctc: 'n/a', stipend: '₹3,00,000 / month', depts: ['MA', 'CS', 'PH', 'EE'], applied: 355, shortlisted: 19, offers: 2, cgpaCutoff: '8.5', location: 'Gurgaon', rounds: ['Online test (probability + coding)', 'Puzzle interview', 'Statistics interview', 'Final round'], jd: 'Probability, stochastic processes and one applied statistics discussion. Coding is Python, moderate difficulty, but the analysis around the code matters more than the code.' },
  { id: 'b9', name: 'Boston Consulting Group', profile: 'consult', role: 'Summer Associate', day: 'Day 2 Slot 1', ctc: 'n/a', stipend: '₹2,10,000 / month', depts: ['ME', 'CS', 'CH', 'EE', 'MA', 'CE'], applied: 521, shortlisted: 34, offers: 5, cgpaCutoff: '8.0', location: 'Mumbai / Bangalore', rounds: ['Online case + Casey chatbot', 'Case interview 1', 'Case interview 2'], jd: 'Cases lean market-entry and profitability. Interviewers push on the maths, so do the arithmetic out loud and state your assumptions before computing.' },
  { id: 'b10', name: 'Adobe', profile: 'aiml', role: 'MTS Intern (ML)', day: 'Day 2 Slot 1', ctc: 'n/a', stipend: '₹1,40,000 / month', depts: ['CS', 'EE', 'MA'], applied: 402, shortlisted: 31, offers: 7, cgpaCutoff: '8.0', location: 'Noida / Bangalore', rounds: ['Online assessment', 'Technical interview', 'ML + project round', 'HR'], jd: 'Mix of DSA and ML. The online assessment is DSA-only, so do not skip coding prep for a pure ML profile.' },
  { id: 'b11', name: 'JP Morgan Chase', profile: 'finance', role: 'Quantitative Research Intern', day: 'Day 2 Slot 2', ctc: 'n/a', stipend: '₹1,45,000 / month', depts: ['MA', 'CS', 'PH', 'EE'], applied: 468, shortlisted: 36, offers: 8, cgpaCutoff: '8.0', location: 'Mumbai', rounds: ['Online test', 'Technical interview 1', 'Technical interview 2', 'HR'], jd: 'Probability, linear algebra and Python. Lighter than a pure quant shop, heavier than a generalist finance role.' },
  { id: 'b12', name: 'Procter & Gamble', profile: 'fmcg', role: 'Summer Intern, Supply Chain', day: 'Day 2 Slot 3', ctc: 'n/a', stipend: '₹1,30,000 / month', depts: ['ME', 'CH', 'CE', 'MM', 'BT'], applied: 434, shortlisted: 29, offers: 6, cgpaCutoff: '7.5', location: 'Hyderabad + plant', rounds: ['PEAK assessment', 'Interview 1 (behavioural)', 'Interview 2 (behavioural)'], jd: 'Almost entirely behavioural, structured around P&G success drivers. Prepare six concrete stories and map each to leadership, ownership and analysis.' },
  { id: 'b13', name: 'Shell', profile: 'core', role: 'Process Engineering Intern', day: 'Day 2 Slot 4', ctc: 'n/a', stipend: '₹95,000 / month', depts: ['CH', 'ME', 'MM'], applied: 218, shortlisted: 22, offers: 7, cgpaCutoff: '8.0', location: 'Bangalore', rounds: ['Technical screening', 'Core technical interview', 'HR'], jd: 'Core department fundamentals from second and third year courses. Thermodynamics, transport phenomena and one derivation are standard.' },
  { id: 'b14', name: 'Texas Instruments', profile: 'core', role: 'Analog Design Intern', day: 'Day 2 Slot 4', ctc: 'n/a', stipend: '₹1,10,000 / month', depts: ['EE', 'ED', 'PH'], applied: 264, shortlisted: 25, offers: 9, cgpaCutoff: '8.5', location: 'Bangalore', rounds: ['Online technical test', 'Analog interview 1', 'Analog interview 2'], jd: 'Deep analog fundamentals: op-amps, biasing, feedback stability. Course grades in the relevant electives are weighted heavily.' },
  { id: 'b15', name: 'Uber', profile: 'sde', role: 'Software Engineer Intern', day: 'Day 2 Slot 5', ctc: 'n/a', stipend: '₹1,75,000 / month', depts: ['CS', 'EE', 'MA', 'ME'], applied: 692, shortlisted: 40, offers: 8, cgpaCutoff: '8.0', location: 'Bangalore', rounds: ['Online assessment', 'Technical 1', 'Technical 2', 'Bar raiser'], jd: 'Two DSA rounds with a strong preference for optimal solutions. The bar raiser adds one open-ended design discussion.' },
]

/** Scripted answers for the RAG chatbot mock. */
export const BLUEBOOK_QA: { q: string; a: string }[] = [
  {
    q: 'Which companies took Mechanical students for non-core roles last season?',
    a: 'Nine of the fifteen companies in this Blue Book listed ME as an eligible department for a non-core profile. The largest intakes were McKinsey (6 offers, ME eligible), HUL (8 offers), Google (14 offers) and Microsoft (12 offers). Consulting and FMCG had the highest ME-to-offer conversion; SDE roles took ME students but with a visibly higher CGPA distribution among those shortlisted.',
  },
  {
    q: 'What is the realistic CGPA cutoff for Day 1 Slot 1?',
    a: 'Both Day 1 Slot 1 companies in this book, Optiver and Google, published cutoffs of 8.5 and 8.0 respectively. In practice, the shortlisted cohort skewed higher: the median CGPA among Google shortlists was about 8.6, and no Optiver shortlist was below 8.7. Treat published cutoffs as necessary, not sufficient.',
  },
  {
    q: 'How many rounds should I expect for a consulting role?',
    a: 'Four for McKinsey (Solve game, two cases, partner round) and three for BCG (online case with the Casey chatbot, then two case interviews). Both firms weight structure and communication over arriving at the "right" number, and both push explicitly on arithmetic during the case.',
  },
  {
    q: 'Which profile had the best shortlist-to-offer conversion?',
    a: 'Core roles converted best: Shell went 22 shortlists to 7 offers (32%) and Texas Instruments 25 to 9 (36%). Quant was the harshest: Optiver converted 24 shortlists to 3 offers (12.5%) and Quadeye 19 to 2 (10.5%). SDE sat in the middle at roughly 20-23%.',
  },
]
