import type { RoleId } from './roles'

export type Question = {
  id: string
  text: string
  options: string[]
  answer: number
  explain: string
}

export type Exam = {
  id: string
  title: string
  role: RoleId
  minutes: number
  questionCount: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  attempts: number
  avgScore: number
  yourBest?: number
  questions: Question[]
}

const SAMPLE: Question[] = [
  {
    id: 'q1',
    text: 'A fair coin is tossed 5 times. What is the probability of getting exactly 3 heads?',
    options: ['5/16', '3/8', '5/32', '1/2'],
    answer: 0,
    explain: 'C(5,3) = 10 favourable outcomes out of 2^5 = 32, giving 10/32 = 5/16.',
  },
  {
    id: 'q2',
    text: 'What is the time complexity of building a heap from an unsorted array of n elements?',
    options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'],
    answer: 1,
    explain: 'Bottom-up heapify is O(n). The O(n log n) figure is for n successive insertions, which is a different construction.',
  },
  {
    id: 'q3',
    text: 'A stock rises 25% and then falls 20%. Relative to its starting price, it is now:',
    options: ['5% higher', 'Unchanged', '5% lower', '1% lower'],
    answer: 1,
    explain: '1.25 × 0.80 = 1.00. The percentages cancel exactly in this case.',
  },
  {
    id: 'q4',
    text: 'In a relational database, which isolation level permits phantom reads?',
    options: ['Serializable', 'Repeatable Read', 'Read Committed', 'Both B and C'],
    answer: 3,
    explain: 'Only Serializable prevents phantoms. Repeatable Read prevents non-repeatable reads but, in the SQL standard, still allows phantoms.',
  },
  {
    id: 'q5',
    text: 'You have 8 identical-looking balls, one of which is heavier. Using a balance scale, what is the minimum number of weighings to guarantee finding it?',
    options: ['1', '2', '3', '4'],
    answer: 1,
    explain: 'Split 3-3-2. One weighing narrows it to a group of at most 3, a second weighing isolates the ball. Two weighings suffice.',
  },
]

export const EXAMS: Exam[] = [
  { id: 'e1', title: 'SDE Screening Simulation', role: 'sde', minutes: 60, questionCount: 25, difficulty: 'Medium', attempts: 1284, avgScore: 61, yourBest: 72, questions: SAMPLE },
  { id: 'e2', title: 'Quant Mental Maths Sprint', role: 'quant', minutes: 8, questionCount: 80, difficulty: 'Hard', attempts: 742, avgScore: 44, yourBest: 51, questions: SAMPLE },
  { id: 'e3', title: 'Probability Fundamentals', role: 'quant', minutes: 45, questionCount: 20, difficulty: 'Medium', attempts: 918, avgScore: 58, questions: SAMPLE },
  { id: 'e4', title: 'Consulting Guesstimate Drill', role: 'consult', minutes: 30, questionCount: 6, difficulty: 'Medium', attempts: 511, avgScore: 66, questions: SAMPLE },
  { id: 'e5', title: 'Finance Aptitude: Full Length', role: 'finance', minutes: 60, questionCount: 50, difficulty: 'Medium', attempts: 663, avgScore: 55, yourBest: 64, questions: SAMPLE },
  { id: 'e6', title: 'ML Fundamentals Quiz', role: 'aiml', minutes: 40, questionCount: 30, difficulty: 'Hard', attempts: 489, avgScore: 52, questions: SAMPLE },
  { id: 'e7', title: 'FMCG Aptitude + Verbal', role: 'fmcg', minutes: 50, questionCount: 40, difficulty: 'Easy', attempts: 372, avgScore: 71, questions: SAMPLE },
  { id: 'e8', title: 'Core Fundamentals: Mechanical', role: 'core', minutes: 45, questionCount: 30, difficulty: 'Medium', attempts: 208, avgScore: 63, questions: SAMPLE },
]

export type Friend = {
  id: string
  name: string
  roll: string
  branch: string
  roles: RoleId[]
  streak: number
  weekMinutes: number
  solved: number
  online?: boolean
}

export const FRIENDS: Friend[] = [
  { id: 'f1', name: 'Ananya S', roll: 'CS22B015', branch: 'CSE', roles: ['sde', 'aiml'], streak: 31, weekMinutes: 640, solved: 412, online: true },
  { id: 'f2', name: 'Karthik V', roll: 'MA22B027', branch: 'Maths & Computing', roles: ['quant', 'finance'], streak: 24, weekMinutes: 580, solved: 306, online: true },
  { id: 'f3', name: 'Sneha M', roll: 'ME22B004', branch: 'Mechanical', roles: ['consult'], streak: 18, weekMinutes: 495, solved: 88 },
  { id: 'f4', name: 'Rohit K', roll: 'EE22B091', branch: 'Electrical', roles: ['sde'], streak: 15, weekMinutes: 460, solved: 351, online: true },
  { id: 'f5', name: 'Priya N', roll: 'BT23B019', branch: 'Biotech', roles: ['aiml', 'core'], streak: 9, weekMinutes: 310, solved: 142 },
  { id: 'f6', name: 'Ishaan B', roll: 'CH22B038', branch: 'Chemical', roles: ['consult', 'fmcg'], streak: 7, weekMinutes: 265, solved: 61 },
  { id: 'f7', name: 'Meera L', roll: 'CS22B044', branch: 'CSE', roles: ['aiml'], streak: 5, weekMinutes: 220, solved: 198 },
]

export const REQUESTS = [
  { id: 'rq1', name: 'Vikram T', roll: 'EE23B002', branch: 'Electrical', mutual: 4 },
  { id: 'rq2', name: 'Rhea D', roll: 'MA23B008', branch: 'Maths & Computing', mutual: 2 },
]
