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

const KEY = 'ipd.session.v1'
const PROFILE_KEY = 'ipd.profile.v1'
const THEME_KEY = 'ipd.theme.v1'
const DONE_KEY = 'ipd.done.v1'
const CAL_KEY = 'ipd.calendar.v1'

/** Prototype credentials — no backend, by design. */
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'admin123'

type Ctx = {
  signedIn: boolean
  signIn: (u: string, p: string) => { ok: boolean; error?: string }
  signOut: () => void

  profile: Profile
  setProfile: (p: Profile) => void
  toggleRole: (r: RoleId) => void

  theme: 'dark' | 'light'
  toggleTheme: () => void

  /** resource ids the user has ticked off */
  done: string[]
  toggleDone: (id: string) => void

  /** competition ids added to the personal calendar */
  saved: string[]
  toggleSaved: (id: string) => void
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => read(THEME_KEY, 'dark' as const))
  const [done, setDone] = useState<string[]>(() => read(DONE_KEY, ['r-blind75', 'r-os', 'x-guide']))
  const [saved, setSaved] = useState<string[]>(() => read(CAL_KEY, ['c2', 'c4']))

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(signedIn)), [signedIn])
  useEffect(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)), [profile])
  useEffect(() => localStorage.setItem(DONE_KEY, JSON.stringify(done)), [done])
  useEffect(() => localStorage.setItem(CAL_KEY, JSON.stringify(saved)), [saved])
  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme))
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const signIn = useCallback((u: string, p: string) => {
    if (u.trim() !== DEMO_USER) return { ok: false, error: 'Unknown user. Try the demo account below.' }
    if (p !== DEMO_PASS) return { ok: false, error: 'Incorrect password.' }
    setSignedIn(true)
    return { ok: true }
  }, [])

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
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      done,
      toggleDone: (id) =>
        setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      saved,
      toggleSaved: (id) =>
        setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    }),
    [signedIn, signIn, profile, theme, done, saved],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
