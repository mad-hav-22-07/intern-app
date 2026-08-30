import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_PROFILE, type Profile } from '@/data/user'
import type { RoleId } from '@/data/roles'
import {
  seedActivity,
  streakStats,
  todayKey,
  type Activity,
  type StreakStats,
} from '@/lib/streak'

const KEY = 'ipd.session.v1'
const PROFILE_KEY = 'ipd.profile.v1'
const DONE_KEY = 'ipd.done.v1'
const CAL_KEY = 'ipd.calendar.v1'
const ACTIVITY_KEY = 'ipd.activity.v1'
const GOAL_KEY = 'ipd.goal.v1'

/** Prototype credentials — no backend, by design. */
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'admin123'

/** What can put a day on the streak. Used as the label in the activity log. */
export type ActivityKind =
  | 'resource'
  | 'competition'
  | 'forum'
  | 'mock-interview'
  | 'mock-exam'
  | 'manual'

type Ctx = {
  signedIn: boolean
  signIn: (u: string, p: string) => { ok: boolean; error?: string }
  signOut: () => void

  profile: Profile
  setProfile: (p: Profile) => void
  toggleRole: (r: RoleId) => void

  /** resource ids the user has ticked off */
  done: string[]
  toggleDone: (id: string) => void

  /** competition ids the user has committed to — the only things on the calendar */
  registered: string[]
  toggleRegistered: (id: string) => void

  /** { 'YYYY-MM-DD': things done that day } */
  activity: Activity
  logActivity: (kind: ActivityKind, amount?: number) => void
  streak: StreakStats
  dailyGoal: number
  setDailyGoal: (n: number) => void
}

const AppCtx = createContext<Ctx | null>(null)

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(() => read(KEY, false))
  const [profile, setProfileState] = useState<Profile>(() => read(PROFILE_KEY, DEFAULT_PROFILE))
  const [done, setDone] = useState<string[]>(() => read(DONE_KEY, ['r-blind75', 'r-os', 'x-guide']))
  const [registered, setRegistered] = useState<string[]>(() => read(CAL_KEY, ['c2', 'c4']))
  const [activity, setActivity] = useState<Activity>(() => read(ACTIVITY_KEY, seedActivity()))
  const [dailyGoal, setDailyGoalState] = useState<number>(() => read(GOAL_KEY, 3))

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(signedIn)), [signedIn])
  useEffect(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)), [profile])
  useEffect(() => localStorage.setItem(DONE_KEY, JSON.stringify(done)), [done])
  useEffect(() => localStorage.setItem(CAL_KEY, JSON.stringify(registered)), [registered])
  useEffect(() => localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)), [activity])
  useEffect(() => localStorage.setItem(GOAL_KEY, JSON.stringify(dailyGoal)), [dailyGoal])

  const signIn = useCallback((u: string, p: string) => {
    if (u.trim() !== DEMO_USER) return { ok: false, error: 'Unknown user. Try the demo account below.' }
    if (p !== DEMO_PASS) return { ok: false, error: 'Incorrect password.' }
    setSignedIn(true)
    return { ok: true }
  }, [])

  const logActivity = useCallback((_kind: ActivityKind, amount = 1) => {
    setActivity((prev) => {
      const key = todayKey()
      const next = Math.max(0, (prev[key] ?? 0) + amount)
      return { ...prev, [key]: next }
    })
  }, [])

  const streak = useMemo(() => streakStats(activity), [activity])

  const value = useMemo<Ctx>(
    () => ({
      signedIn,
      signIn,
      signOut: () => setSignedIn(false),
      profile,
      setProfile: setProfileState,
      toggleRole: (r) =>
        setProfileState((prev) => ({
          ...prev,
          targetRoles: prev.targetRoles.includes(r)
            ? prev.targetRoles.filter((x) => x !== r)
            : [...prev.targetRoles, r],
        })),
      done,
      // Ticking something off counts toward today. Un-ticking takes it back, so
      // the log can't be farmed by toggling the same checkbox.
      //
      // The activity call sits outside the state updater on purpose: StrictMode
      // invokes updaters twice in development, which would log every tick twice.
      toggleDone: (id) => {
        const had = done.includes(id)
        logActivity('resource', had ? -1 : 1)
        setDone((prev) => (had ? prev.filter((x) => x !== id) : [...prev, id]))
      },
      registered,
      toggleRegistered: (id) => {
        const had = registered.includes(id)
        if (!had) logActivity('competition')
        setRegistered((prev) => (had ? prev.filter((x) => x !== id) : [...prev, id]))
      },
      activity,
      logActivity,
      streak,
      dailyGoal,
      setDailyGoal: setDailyGoalState,
    }),
    [signedIn, signIn, profile, done, registered, activity, logActivity, streak, dailyGoal],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
