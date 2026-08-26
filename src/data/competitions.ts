import type { RoleId } from './roles'

export type Source = 'Unstop' | 'Codeforces' | 'Insti Mail' | 'Devfolio' | 'Kaggle' | 'LinkedIn'

export type Competition = {
  id: string
  title: string
  org: string
  source: Source
  roles: RoleId[]
  /** days from today; negative = already past */
  inDays: number
  timeLabel: string
  prize?: string
  team?: string
  tag: 'Contest' | 'Case Comp' | 'Hackathon' | 'Quiz' | 'Workshop'
}

export const COMPETITIONS: Competition[] = [
  { id: 'c1', title: 'Codeforces Round 998 (Div. 2)', org: 'Codeforces', source: 'Codeforces', roles: ['sde', 'quant'], inDays: 0, timeLabel: '20:05 IST', tag: 'Contest', team: 'Individual' },
  { id: 'c2', title: 'HUL Ideatrophy 2026', org: 'Hindustan Unilever', source: 'Unstop', roles: ['fmcg', 'consult'], inDays: 2, timeLabel: 'Round 1 deadline', prize: '₹4,00,000', team: 'Team of 3', tag: 'Case Comp' },
  { id: 'c3', title: 'Optiver Trading Challenge', org: 'Optiver', source: 'Unstop', roles: ['quant', 'finance'], inDays: 3, timeLabel: 'Registration closes', prize: 'Internship offer', team: 'Individual', tag: 'Contest' },
  { id: 'c4', title: 'Shaastra Hackathon: Applied AI', org: 'Shaastra, IITM', source: 'Insti Mail', roles: ['aiml', 'sde'], inDays: 5, timeLabel: '48 hours', prize: '₹1,50,000', team: 'Team of 4', tag: 'Hackathon' },
  { id: 'c5', title: 'BCG Ignite Case Challenge', org: 'Boston Consulting Group', source: 'Unstop', roles: ['consult'], inDays: 6, timeLabel: 'Submission deadline', prize: 'PPI shortlist', team: 'Team of 2', tag: 'Case Comp' },
  { id: 'c6', title: 'LeetCode Weekly Contest 481', org: 'LeetCode', source: 'Codeforces', roles: ['sde'], inDays: 7, timeLabel: '08:00 IST', tag: 'Contest', team: 'Individual' },
  { id: 'c7', title: 'Kaggle: Demand Forecasting Playground', org: 'Kaggle', source: 'Kaggle', roles: ['aiml'], inDays: 9, timeLabel: 'Closes 23:59 UTC', prize: 'Swag + points', team: 'Team of 5', tag: 'Contest' },
  { id: 'c8', title: 'Goldman Sachs Quant Quiz', org: 'Goldman Sachs', source: 'Insti Mail', roles: ['quant', 'finance'], inDays: 11, timeLabel: '90 min online', prize: 'Interview fast-track', team: 'Individual', tag: 'Quiz' },
  { id: 'c9', title: 'P&G CEO Challenge — Campus Round', org: 'Procter & Gamble', source: 'Unstop', roles: ['fmcg'], inDays: 13, timeLabel: 'Campus round', prize: 'Global finals seat', team: 'Team of 3', tag: 'Case Comp' },
  { id: 'c10', title: 'Ethos Blockchain Hackathon', org: 'Devfolio', source: 'Devfolio', roles: ['sde', 'aiml'], inDays: 16, timeLabel: '36 hours', prize: '$5,000', team: 'Team of 4', tag: 'Hackathon' },
  { id: 'c11', title: 'System Design Workshop by alumni', org: 'CDC, IITM', source: 'Insti Mail', roles: ['sde'], inDays: 18, timeLabel: '2 hours', team: 'Open', tag: 'Workshop' },
  { id: 'c12', title: 'Resume Review Clinic — Consulting', org: 'CDC, IITM', source: 'Insti Mail', roles: ['consult', 'finance'], inDays: 21, timeLabel: 'Slot booking', team: 'Individual', tag: 'Workshop' },
  { id: 'c13', title: 'Quadeye Puzzle Sprint', org: 'Quadeye', source: 'LinkedIn', roles: ['quant'], inDays: -2, timeLabel: 'Closed', team: 'Individual', tag: 'Contest' },
  { id: 'c14', title: 'ITC Interrobang Season 12', org: 'ITC Limited', source: 'Unstop', roles: ['fmcg', 'consult'], inDays: -5, timeLabel: 'Closed', prize: '₹6,00,000', team: 'Team of 2', tag: 'Case Comp' },
]

export const SOURCES: Source[] = ['Unstop', 'Codeforces', 'Insti Mail', 'Devfolio', 'Kaggle', 'LinkedIn']
export const TAGS = ['Contest', 'Case Comp', 'Hackathon', 'Quiz', 'Workshop'] as const

export function dateFor(inDays: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + inDays)
  return d
}

export function relativeLabel(inDays: number) {
  if (inDays < 0) return `${Math.abs(inDays)}d ago`
  if (inDays === 0) return 'Today'
  if (inDays === 1) return 'Tomorrow'
  return `in ${inDays}d`
}
