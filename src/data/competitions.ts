import type { RoleId } from './roles'

export type Source =
  | 'Unstop'
  | 'Codeforces'
  | 'LeetCode'
  | 'Insti Mail'
  | 'Devfolio'
  | 'Kaggle'
  | 'LinkedIn'

export type CompetitionTag = 'Contest' | 'Case Comp' | 'Hackathon' | 'Quiz' | 'Workshop'

export type Competition = {
  id: string
  title: string
  org: string
  source: Source
  roles: RoleId[]
  /** ISO instant the contest starts, or the deadline falls. */
  startsAt: string
  /** Minutes, when the source publishes a duration. */
  durationMins?: number
  /** What the date means: "Round 1 deadline", "48 hours", … */
  timeLabel: string
  prize?: string
  team?: string
  tag: CompetitionTag
  url?: string
  /** Pulled from a live API rather than the curated list. */
  live?: boolean
}

const HOUR = 3_600_000

/** Local midnight `inDays` from today, plus an optional time of day. */
function at(inDays: number, hour = 18, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() + inDays)
  return d.toISOString()
}

/**
 * Curated listings: the ones a live API can never know about. Insti mails, case
 * comps, workshops. Authored relative to today so the page always has something
 * plausible in view.
 */
export const COMPETITIONS: Competition[] = [
  { id: 'c2', title: 'HUL Ideatrophy 2026', org: 'Hindustan Unilever', source: 'Unstop', roles: ['fmcg', 'consult'], startsAt: at(2, 23, 59), timeLabel: 'Round 1 deadline', prize: '₹4,00,000', team: 'Team of 3', tag: 'Case Comp', url: 'https://unstop.com' },
  { id: 'c3', title: 'Optiver Trading Challenge', org: 'Optiver', source: 'Unstop', roles: ['quant', 'finance'], startsAt: at(3, 23, 59), timeLabel: 'Registration closes', prize: 'Internship offer', team: 'Individual', tag: 'Contest', url: 'https://unstop.com' },
  { id: 'c4', title: 'Shaastra Hackathon: Applied AI', org: 'Shaastra, IITM', source: 'Insti Mail', roles: ['aiml', 'sde'], startsAt: at(5, 10, 0), durationMins: 48 * 60, timeLabel: '48 hours', prize: '₹1,50,000', team: 'Team of 4', tag: 'Hackathon' },
  { id: 'c5', title: 'BCG Ignite Case Challenge', org: 'Boston Consulting Group', source: 'Unstop', roles: ['consult'], startsAt: at(6, 23, 59), timeLabel: 'Submission deadline', prize: 'PPI shortlist', team: 'Team of 2', tag: 'Case Comp', url: 'https://unstop.com' },
  { id: 'c7', title: 'Kaggle: Demand Forecasting Playground', org: 'Kaggle', source: 'Kaggle', roles: ['aiml'], startsAt: at(9, 23, 59), timeLabel: 'Closes 23:59 UTC', prize: 'Swag + points', team: 'Team of 5', tag: 'Contest', url: 'https://kaggle.com/competitions' },
  { id: 'c8', title: 'Goldman Sachs Quant Quiz', org: 'Goldman Sachs', source: 'Insti Mail', roles: ['quant', 'finance'], startsAt: at(11, 19, 0), durationMins: 90, timeLabel: '90 min online', prize: 'Interview fast-track', team: 'Individual', tag: 'Quiz' },
  { id: 'c9', title: 'P&G CEO Challenge: Campus Round', org: 'Procter & Gamble', source: 'Unstop', roles: ['fmcg'], startsAt: at(13, 9, 30), timeLabel: 'Campus round', prize: 'Global finals seat', team: 'Team of 3', tag: 'Case Comp', url: 'https://unstop.com' },
  { id: 'c10', title: 'Ethos Blockchain Hackathon', org: 'Devfolio', source: 'Devfolio', roles: ['sde', 'aiml'], startsAt: at(16, 10, 0), durationMins: 36 * 60, timeLabel: '36 hours', prize: '$5,000', team: 'Team of 4', tag: 'Hackathon', url: 'https://devfolio.co' },
  { id: 'c11', title: 'System Design Workshop by alumni', org: 'CDC, IITM', source: 'Insti Mail', roles: ['sde'], startsAt: at(18, 18, 0), durationMins: 120, timeLabel: '2 hours', team: 'Open', tag: 'Workshop' },
  { id: 'c12', title: 'Resume Review Clinic: Consulting', org: 'CDC, IITM', source: 'Insti Mail', roles: ['consult', 'finance'], startsAt: at(21, 17, 0), timeLabel: 'Slot booking', team: 'Individual', tag: 'Workshop' },
  { id: 'c13', title: 'Quadeye Puzzle Sprint', org: 'Quadeye', source: 'LinkedIn', roles: ['quant'], startsAt: at(-2, 20, 0), timeLabel: 'Closed', team: 'Individual', tag: 'Contest' },
  { id: 'c14', title: 'ITC Interrobang Season 12', org: 'ITC Limited', source: 'Unstop', roles: ['fmcg', 'consult'], startsAt: at(-5, 23, 59), timeLabel: 'Closed', prize: '₹6,00,000', team: 'Team of 2', tag: 'Case Comp' },
]

export const SOURCES: Source[] = [
  'Unstop',
  'Codeforces',
  'LeetCode',
  'Insti Mail',
  'Devfolio',
  'Kaggle',
  'LinkedIn',
]

export const TAGS: CompetitionTag[] = ['Contest', 'Case Comp', 'Hackathon', 'Quiz', 'Workshop']

/** Local midnight of the day `iso` falls on; the calendar's grouping key. */
export function dayOf(iso: string): Date {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Whole days from today. Negative once the date has passed. */
export function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((dayOf(iso).getTime() - today.getTime()) / (24 * HOUR))
}

export function relativeLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d < -1) return `${Math.abs(d)}d ago`
  if (d === -1) return 'Yesterday'
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  return `in ${d}d`
}

/** "20:05 IST". Everything on this platform happens on campus time. */
export function istTime(iso: string): string {
  return `${new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} IST`
}

export function istDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
  })
}
