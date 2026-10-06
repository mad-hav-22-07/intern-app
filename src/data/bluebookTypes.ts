import type { RoleId } from './roles'

/**
 * The shape of a real Blue Book entry.
 *
 * The Blue Books are the Placement & Internship Cell's own compilation of last
 * season's companies — job descriptions, selection processes, compensation and
 * student feedback — and they carry an explicit notice that they are IIT Madras
 * property and are not to be shared outside the institute. That is why every
 * page of this app sits behind `RequireAuth`, and why sign-up is restricted to
 * `@smail.iitm.ac.in` when real accounts are configured. **Do not put this data
 * on a route that renders before the auth gate.**
 *
 * Fields are optional wherever the source is inconsistent, which is most of
 * them: these documents are compiled from student feedback forms, so one company
 * lists four interview rounds and stipend to the rupee while the next lists
 * neither. An absent field must render as absent, never as a zero or a guess.
 */

export type BlueBookEdition = '2024-25' | '2025-26' | 'IDDD 2026-27'

export type Company = {
  /** `bb-<edition slug>-<company slug>`; stable, and a localStorage key. */
  id: string
  name: string
  /** Which prep profile this maps onto, so the page can filter by the user's. */
  profile: RoleId
  /** The role title as the book prints it. */
  role: string
  edition: BlueBookEdition

  /** "Day 1 Slot 1", "Day 2", etc. Absent when the book does not say. */
  day?: string
  /** Verbatim as printed — currencies and periods vary wildly. */
  stipend?: string
  /** Full-time CTC, where the book mentions a PPO. */
  ctc?: string
  location?: string

  /** Department codes from `DEPTS`. Empty when the book says "all branches". */
  depts: string[]
  /** True when eligibility is open rather than a department list. */
  allBranches?: boolean
  cgpaCutoff?: string

  /** Only where the book prints real numbers. Never estimate these. */
  applied?: number
  shortlisted?: number
  offers?: number

  /** The selection process, in order. */
  rounds: string[]
  /** The job description, summarised in our own words. */
  jd: string
  /**
   * What students actually said — the most useful part of the book. Paraphrased,
   * never quoted at length, and never attributed to a named student.
   */
  feedback: string[]
  /** Topics the book says to prepare. */
  prepareTopics?: string[]
}

export const DEPTS = [
  'CS', 'EE', 'ME', 'CH', 'CE', 'MA', 'PH', 'AE', 'MM', 'BT', 'NA', 'ED', 'EP', 'CY',
]
