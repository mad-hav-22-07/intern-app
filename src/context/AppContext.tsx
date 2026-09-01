/**
 * The only cross-page state in the app.
 *
 * Everything here is mirrored to `localStorage` on change, so a refresh loses
 * nothing, and read back through a lazy `useState` initialiser on boot. There is no
 * server-side user record: this browser *is* the account.
 *
 * Page-local state (filters, open modals, drafts) deliberately stays in the page.
 * Only values two pages both need are promoted to here.
 */
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
import * as auth from '@/lib/auth'
import { setIdentityKey } from '@/lib/identity'
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
const DAILY_KEY = 'ipd.daily.v1'

/**
 * Demo credentials, used only when Supabase is not configured. With it
 * configured, `auth.ts` takes over and these stop working.
 */
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'admin123'

/** True when real accounts are available; false in demo mode. */
export const hasRealAuth = auth.isAuthEnabled

/** What can put a day on the streak. Used as the label in the activity log. */
export type ActivityKind =
  | 'resource'
  | 'competition'
  | 'forum'
  | 'mock-interview'
  | 'mock-exam'
  | 'daily'
  | 'manual'

type Ctx = {
  signedIn: boolean
  /** Resolves once the session has been restored, so pages never flash the login screen. */
  authLoading: boolean
  /** Gates the admin portal. Demo mode is always admin; real accounts read profiles.is_admin. */
  isAdmin: boolean
  signIn: (u: string, p: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => void

  profile: Profile
  setProfile: (p: Profile) => void
  toggleRole: (r: RoleId) => void

  /** resource ids the user has ticked off */
  done: string[]
  toggleDone: (id: string) => void
  /**
   * Tick or clear a whole batch at once — a chapter of a book, a difficulty band
   * of puzzles. Deliberately does *not* touch the activity log: see the note on
   * the implementation.
   */
  setManyDone: (ids: string[], value: boolean) => void

  /** competition ids the user has committed to; the only things on the calendar */
  registered: string[]
  toggleRegistered: (id: string) => void

  /** `role:dayNumber` keys for daily challenges already solved */
  solvedDaily: string[]
  markDailySolved: (key: string) => void

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
  // In demo mode the flag is the whole session. With real auth, Supabase owns the
  // session and this is just a mirror of it.
  const [signedIn, setSignedIn] = useState(() => (auth.isAuthEnabled ? false : read(KEY, false)))
  const [authLoading, setAuthLoading] = useState(auth.isAuthEnabled)
  // The demo login is the single hardcoded account, so it stands in for the admin.
  const [isAdmin, setIsAdmin] = useState(!auth.isAuthEnabled)
  const [profile, setProfileState] = useState<Profile>(() => read(PROFILE_KEY, DEFAULT_PROFILE))
  const [done, setDone] = useState<string[]>(() => read(DONE_KEY, ['r-blind75', 'r-os', 'x-guide']))
  const [registered, setRegistered] = useState<string[]>(() => read(CAL_KEY, ['c2', 'c4']))
  const [activity, setActivity] = useState<Activity>(() => read(ACTIVITY_KEY, seedActivity()))
  const [dailyGoal, setDailyGoalState] = useState<number>(() => read(GOAL_KEY, 3))
  const [solvedDaily, setSolvedDaily] = useState<string[]>(() => read(DAILY_KEY, []))

  useEffect(() => {
    if (!auth.isAuthEnabled) localStorage.setItem(KEY, JSON.stringify(signedIn))
  }, [signedIn])

  /**
   * Adopt the Supabase session, and keep following it. The listener also fires on
   * token refresh and on sign-out from another tab, so this stays in sync without
   * polling.
   */
  useEffect(() => {
    if (!auth.isAuthEnabled) return

    const adopt = (user: auth.AuthUser | null) => {
      setIdentityKey(user?.id ?? null)
      setSignedIn(Boolean(user))
      if (!user) setIsAdmin(false)
      if (user) {
        void auth.isAdminUser(user.id).then(setIsAdmin)
        // The account is the source of truth for identity; everything else the
        // user edits on the profile page stays local.
        setProfileState((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email,
          rollNo: user.rollNo,
        }))
      }
      setAuthLoading(false)
    }

    void auth.currentUser().then(adopt)
    return auth.onAuthChange(adopt)
  }, [])
  useEffect(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)), [profile])
  useEffect(() => localStorage.setItem(DONE_KEY, JSON.stringify(done)), [done])
  useEffect(() => localStorage.setItem(CAL_KEY, JSON.stringify(registered)), [registered])
  useEffect(() => localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)), [activity])
  useEffect(() => localStorage.setItem(GOAL_KEY, JSON.stringify(dailyGoal)), [dailyGoal])
  useEffect(() => localStorage.setItem(DAILY_KEY, JSON.stringify(solvedDaily)), [solvedDaily])

  const signIn = useCallback(async (u: string, p: string) => {
    if (auth.isAuthEnabled) return auth.signIn(u, p)

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
      authLoading,
      isAdmin,
      signIn,
      signOut: () => {
        if (auth.isAuthEnabled) void auth.signOut()
        setSignedIn(false)
      },
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
      // Bulk marking is bookkeeping, not studying. Someone hitting "mark all" on
      // a chapter is almost always recording work they did before they started
      // using this, and crediting 50 items to *today* would both misdate that
      // work and turn the daily goal into a one-click formality. Individual
      // ticks are the honest signal, and those still log.
      setManyDone: (ids, value) => {
        setDone((prev) => {
          if (!value) return prev.filter((x) => !ids.includes(x))
          const set = new Set(prev)
          for (const id of ids) set.add(id)
          return [...set]
        })
      },
      registered,
      toggleRegistered: (id) => {
        const had = registered.includes(id)
        if (!had) logActivity('competition')
        setRegistered((prev) => (had ? prev.filter((x) => x !== id) : [...prev, id]))
      },
      solvedDaily,
      // Solving is one-way: there is no un-solving a challenge, so unlike the
      // resource checkboxes this can never take activity back off the log.
      markDailySolved: (key) => {
        if (solvedDaily.includes(key)) return
        logActivity('daily')
        setSolvedDaily((prev) => [...prev, key])
      },
      activity,
      logActivity,
      streak,
      dailyGoal,
      setDailyGoal: setDailyGoalState,
    }),
    [
      signedIn,
      authLoading,
      isAdmin,
      signIn,
      profile,
      done,
      registered,
      solvedDaily,
      activity,
      logActivity,
      streak,
      dailyGoal,
    ],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
