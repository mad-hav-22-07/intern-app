/**
 * The sign-in screen.
 *
 * Credentials are a hardcoded check in `AppContext`; there is no auth server. The
 * registration and password-reset dialogs describe how the real flow would work and
 * keep their inputs disabled rather than pretending to submit.
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  BookMarked,
  Mic,
  Trophy,
  FileCheck2,
  MessagesSquare,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DEMO_PASS, DEMO_USER, useApp } from '@/context/AppContext'

const HIGHLIGHTS = [
  { icon: Sparkles, title: 'Role-aware prep tracks', body: 'Quant, SDE, Finance, Consult, AI/ML, FMCG and Core, each with its own curated material.' },
  { icon: FileCheck2, title: 'AI resume scoring', body: 'Score out of 100 against the profile you are targeting, with concrete rewrites.' },
  { icon: BookMarked, title: 'Blue Book analysis', body: 'Every company, round, cutoff and conversion rate, plus a chatbot that answers questions about it.' },
  { icon: Mic, title: 'Mock interviews & exams', body: 'Round-by-round practice with feedback, solo or head-to-head against friends.' },
  { icon: Trophy, title: 'Competition radar', body: 'Unstop, Codeforces and insti mails filtered to the roles you actually care about.' },
  { icon: MessagesSquare, title: 'Peer forum', body: 'Interview experiences from the batch above you, moderated and searchable.' },
]

export default function Login() {
  const { signIn } = useApp()
  const nav = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [modal, setModal] = useState<null | 'register' | 'forgot'>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    setTimeout(() => {
      const res = signIn(user, pass)
      setBusy(false)
      if (!res.ok) setErr(res.error ?? 'Could not sign in.')
      else nav('/')
    }, 450)
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* left: the pitch */}
      <div className="relative hidden flex-col justify-between bg-nav p-10 text-nav-ink lg:flex xl:p-14">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-nav-accent text-nav">
            <Rocket className="size-5" strokeWidth={2.4} />
          </span>
          <div>
            <div className="text-sm font-semibold tracking-tight">Internship Preparation Drive</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-nav-accent">IIT Madras</div>
          </div>
        </div>

        <div className="max-w-lg">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
            Everything you need for
            <span className="text-nav-accent"> intern season</span>, in one place.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-nav-muted">
            Built by seniors who went through it, for the batch going through it next. Pick your
            target profiles and the platform shapes itself around them.
          </p>

          <div className="stagger mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-nav-accent/12 text-nav-accent">
                  <Icon className="size-3.5" />
                </span>
                <div>
                  <p className="text-[13px] font-medium">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-nav-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-nav-muted">
          <span><b className="tabular-nums text-nav-ink">1,240+</b> students</span>
          <span><b className="tabular-nums text-nav-ink">15</b> companies analysed</span>
          <span><b className="tabular-nums text-nav-ink">7</b> prep tracks</span>
        </div>
      </div>

      {/* right: the form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="anim-in w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="grid size-11 place-items-center rounded-xl bg-nav text-nav-accent">
              <Rocket className="size-5" strokeWidth={2.4} />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">Internship Preparation Drive</h1>
            <p className="mt-1 text-sm text-muted">IIT Madras · prep platform for the next batch</p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Use your institute account to continue.</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <Label>Username or roll number</Label>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <Label hint={<button type="button" onClick={() => setModal('forgot')} className="text-accent hover:underline">Forgot password?</button>}>
                Password
              </Label>
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-ink"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs text-danger">
                <AlertCircle className="mt-px size-4 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
              {!busy && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setUser(DEMO_USER)
              setPass(DEMO_PASS)
              setErr('')
            }}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-accent/35 bg-accent-soft px-3.5 py-3 text-left transition-colors hover:border-accent/60"
          >
            <div>
              <p className="text-xs font-medium text-accent">Prototype credentials</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted">
                {DEMO_USER} / {DEMO_PASS}
              </p>
            </div>
            <Badge tone="accent">Tap to fill</Badge>
          </button>

          <p className="mt-6 text-center text-xs text-muted">
            New here?{' '}
            <button onClick={() => setModal('register')} className="font-medium text-accent hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </div>

      <Modal
        open={modal === 'register'}
        onClose={() => setModal(null)}
        title="Registration"
        sub="How sign-up will work in the real build."
        footer={<Button variant="primary" onClick={() => setModal(null)}>Got it</Button>}
      >
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            Accounts will be restricted to <b className="text-ink">@smail.iitm.ac.in</b> addresses via
            Google sign-in, so no passwords are stored and roll number is derived from the email.
          </p>
          <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-4 opacity-60">
            <div>
              <Label>Institute email</Label>
              <Input disabled placeholder="ee23b001@smail.iitm.ac.in" />
            </div>
            <div>
              <Label>Full name</Label>
              <Input disabled placeholder="Your name" />
            </div>
            <Button variant="primary" className="w-full" disabled>Continue with Google</Button>
          </div>
          <p className="text-xs text-muted">
            Disabled in this prototype. Sign in with the demo credentials instead.
          </p>
        </div>
      </Modal>

      <Modal
        open={modal === 'forgot'}
        onClose={() => setModal(null)}
        title="Forgot password"
        sub="Password recovery flow."
        footer={<Button variant="primary" onClick={() => setModal(null)}>Got it</Button>}
      >
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            A reset link would be emailed to your institute address. With Google sign-in this screen
            disappears entirely, which is part of why it is the recommended route.
          </p>
          <div className="rounded-xl border border-line bg-surface-2 p-4 opacity-60">
            <Label>Institute email</Label>
            <Input disabled placeholder="ee23b001@smail.iitm.ac.in" />
            <Button variant="primary" className="mt-3 w-full" disabled>Send reset link</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
