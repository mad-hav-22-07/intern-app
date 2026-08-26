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
  Moon,
  Sun,
  Flame,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useApp } from '@/context/AppContext'
import { STREAK } from '@/data/user'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/competitions', label: 'Competitions', icon: Trophy },
  { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { to: '/mock-exam', label: 'Mock Exam', icon: FileCheck2 },
  { to: '/blue-book', label: 'Blue Book Analysis', icon: BookMarked },
  { to: '/forum', label: 'Forum', icon: MessagesSquare },
]

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg">
        <Rocket className="size-4.5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight">Internship Prep</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-accent">Drive · IITM</div>
        </div>
      )}
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
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-accent-soft font-medium text-accent'
                : 'text-muted hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'absolute left-0 h-5 w-0.5 rounded-r-full bg-accent transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon className="size-4.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Shell() {
  const { profile, theme, toggleTheme, signOut } = useApp()
  const [open, setOpen] = useState(false)
  const [confirmOut, setConfirmOut] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()

  useEffect(() => setOpen(false), [loc.pathname])

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <Logo />
        <button
          onClick={() => setOpen(false)}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin">
        <NavItems onNavigate={() => setOpen(false)} />
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Flame className="size-4 text-accent" />
            <span>{STREAK.current}-day streak</span>
          </div>
          <div className="mt-2 flex gap-0.5">
            {STREAK.history.slice(-14).map((v, i) => (
              <span
                key={i}
                className={cn(
                  'h-4 flex-1 rounded-[3px]',
                  v === 0 ? 'bg-line' : v === 1 ? 'bg-accent/30' : v === 2 ? 'bg-accent/60' : 'bg-accent',
                )}
                title={v === 0 ? 'Missed' : `${v} sessions`}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {STREAK.todayDone}/{STREAK.todayGoal} tasks done today
          </p>
        </div>

        <button
          onClick={() => setConfirmOut(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-danger/10 hover:text-danger"
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="anim-in absolute inset-y-0 left-0 w-72 border-r border-line bg-surface">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-line text-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4.5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              Welcome back, <span className="text-accent">{profile.name.split(' ')[0]}</span>
            </p>
            <p className="hidden truncate text-[11px] text-muted sm:block">
              {profile.rollNo} · {profile.branch}
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 sm:flex">
            <Flame className="size-3.5 text-accent" />
            <span className="font-mono text-xs">{STREAK.current}d</span>
          </div>

          <button
            onClick={toggleTheme}
            className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-accent"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            onClick={() => nav('/profile')}
            className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent ring-1 ring-accent/25"
            aria-label="Profile"
          >
            {profile.name
              .split(' ')
              .map((s) => s[0])
              .join('')
              .slice(0, 2)}
          </button>
        </header>

        <main className="glow mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      <Modal
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        title="Log out?"
        sub="This is a prototype — your local progress stays saved in this browser."
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
