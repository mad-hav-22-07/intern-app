import type { RoleId } from './roles'

export type Profile = {
  name: string
  rollNo: string
  branch: string
  email: string
  year: string
  cgpa: string
  targetRoles: RoleId[]
}

export const DEFAULT_PROFILE: Profile = {
  name: 'Madhav R',
  rollNo: 'ME23B042',
  branch: 'Mechanical Engineering',
  email: 'me23b042@smail.iitm.ac.in',
  year: '3rd year',
  cgpa: '8.74',
  targetRoles: ['sde', 'quant', 'consult'],
}

export const BRANCHES = [
  'Aerospace Engineering',
  'Biotechnology',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Engineering Design',
  'Mechanical Engineering',
  'Metallurgical & Materials Engineering',
  'Naval Architecture',
  'Physics',
  'Mathematics & Computing',
]

/** Example output of the resume checker described in the notes. Static for now. */
export const RESUME_REVIEW = {
  fileName: 'Madhav_R_Resume_v4.pdf',
  uploadedAt: '2 days ago',
  score: 78,
  targetRole: 'sde' as RoleId,
  breakdown: [
    { label: 'Impact & quantification', score: 62, note: '4 of 11 bullets carry a number' },
    { label: 'Technical depth', score: 88, note: 'Strong projects, clear stack' },
    { label: 'IITM format compliance', score: 91, note: 'One page, correct section order' },
    { label: 'Role alignment (SDE)', score: 71, note: 'Light on systems / scale work' },
  ],
  suggestions: [
    {
      severity: 'high' as const,
      title: 'Quantify seven more bullets',
      body: '"Improved API performance" reads as noise. "Cut p95 latency from 840ms to 210ms across 12 endpoints" survives a 20-second skim.',
    },
    {
      severity: 'medium' as const,
      title: 'Lead with the outcome, not the tool',
      body: 'Three bullets open with "Used React to...". Interviewers scan the first four words — put the result there and the stack at the end.',
    },
    {
      severity: 'low' as const,
      title: 'Trim the coursework section',
      body: 'Six lines of coursework buys you nothing for an SDE shortlist. Reclaim the space for a third project.',
    },
  ],
}
