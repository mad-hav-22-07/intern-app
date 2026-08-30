import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  UserRound,
  Users,
  Trophy,
  MessagesSquare,
  BookMarked,
  Mic,
  FileCheck2,
  LogOut,
  Menu,
  X,
  Flame,
  Rocket,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useApp } from '@/context/AppContext'
import { heatmap, intensity } from '@/lib/streak'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/daily', label: "Today's Challenge", icon: Zap },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/competitions', label: 'Competitions', icon: Trophy },
  { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { to: '/mock-exam', label: 'Mock Exam', icon: FileCheck2 },
  { to: '/blue-book', label: 'Blue Book Analysis', icon: BookMarked },
  { to: '/forum', label: 'Forum', icon: MessagesSquare },
]

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/daily': "Today's Challenge",
  '/profile': 'Profile',
  '/friends': 'Friends',
  '/competitions': 'Competitions',
  '/mock-interview': 'Mock Interview',
  '/mock-exam': 'Mock Exam',
  '/blue-book': 'Blue Book Analysis',
  '/forum': 'Forum',
  '/coming-soon': 'Being built',
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-nav-accent text-nav">
        <Rocket className="size-4.5" strokeWidth={2.4} />
      </span>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold tracking-tight text-nav-ink">Internship Prep</div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-nav-accent">Drive · IITM</div>
      </div>
    </div>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm',
              'transition-all duration-200',
              isActive
                ? 'bg-nav-accent/12 font-medium text-nav-accent'
                : 'text-nav-muted hover:bg-nav-2 hover:text-nav-ink',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'absolute left-0 w-0.5 rounded-r-full bg-nav-accent transition-all duration-200',
                  isActive ? 'h-5 opacity-100' : 'h-0 opacity-0',
                )}
              />
              <Icon
                className={cn(
                  'size-4.5 shrink-0 transition-transform duration-200',
                  !isActive && 'group-hover:translate-x-0.5',
                )}
                strokeWidth={2}
              />
              <span className="truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function StreakCard() {
  const { streak, dailyGoal, activity } = useApp()
  const cells = heatmap(activity, 14)

  return (
    <div className="rounded-xl border border-nav-line bg-nav-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-nav-ink">
          <Flame className="size-4 text-nav-accent" />
          {streak.current}-day streak
        </span>
        <span className="tabular-nums text-[10px] text-nav-muted">best {streak.best}</span>
      </div>

      <div className="mt-2.5 flex gap-0.5">
        {cells.map((c) => {
          const level = intensity(c.count, dailyGoal)
          return (
            <span
              key={c.key}
              title={`${c.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${
                c.count === 0 ? 'nothing logged' : `${c.count} done`
              }`}
              className={cn(
                'h-4 flex-1 rounded-[3px] transition-colors duration-300',
                level === 0 && 'bg-nav-line',
                level === 1 && 'bg-nav-accent/30',
                level === 2 && 'bg-nav-accent/60',
                level === 3 && 'bg-nav-accent',
              )}
            />
          )
        })}
      </div>

      <p className="mt-2 text-[11px] text-nav-muted">
        {streak.todayCount}/{dailyGoal} done today
      </p>
    </div>
  )
}

export default function Shell() {
  const { profile, signOut, streak } = useApp()
  const [open, setOpen] = useState(false)
  const [confirmOut, setConfirmOut] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()

  useEffect(() => setOpen(false), [loc.pathname])

  // The drawer is a fixed overlay; the page behind it must not scroll with it.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const title = TITLES[loc.pathname] ?? (loc.pathname.startsWith('/forum') ? 'Forum' : '')

  const sidebar = (
    <div className="pad-safe-b flex h-full flex-col gap-6 bg-nav p-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <Logo />
        <button
          onClick={() => setOpen(false)}
          className="grid size-8 place-items-center rounded-lg text-nav-muted transition-colors hover:bg-nav-2 hover:text-nav-ink lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin">
        <NavItems onNavigate={() => setOpen(false)} />
      </div>

      <div className="space-y-3">
        <StreakCard />
        <button
          onClick={() => setConfirmOut(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-nav-muted transition-colors hover:bg-danger/15 hover:text-danger"
        >
          <LogOut className="size-4.5" strokeWidth={2} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-bg">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade absolute inset-0 bg-scrim" onClick={() => setOpen(false)} />
          <aside className="anim-slide-left absolute inset-y-0 left-0 w-72 shadow-float">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4.5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
            <p className="hidden truncate text-[11px] text-muted sm:block">
              {profile.name} · {profile.rollNo} · {profile.branch}
            </p>
          </div>

          <div
            className="hidden items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 sm:flex"
            title={`${streak.current}-day streak · best ${streak.best}`}
          >
            <Flame className="size-3.5 text-accent" />
            <span className="tabular-nums text-xs">{streak.current}d</span>
          </div>

          <button
            onClick={() => nav('/profile')}
            className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent ring-1 ring-accent/25 transition-transform duration-200 hover:scale-105"
            aria-label="Profile"
          >
            {profile.name
              .split(' ')
              .map((s) => s[0])
              .join('')
              .slice(0, 2)}
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          {/* keyed so every route change replays the entrance */}
          <div key={loc.pathname} className="anim-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        title="Log out?"
        sub="This is a prototype. Your local progress stays saved in this browser."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOut(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={signOut}>
              Log out
            </Button>
          </>
        }
      />
    </div>
  )
}
