/**
 * Sign in, sign up and password reset.
 *
 * With Supabase configured this is real: passwords are hashed server-side, email
 * addresses are confirmed before the account works, one account exists per
 * address and per roll number, and reset links go to the registered inbox. See
 * `lib/auth.ts` and `supabase/migrations/0003_accounts.sql`.
 *
 * Without it, the page falls back to a single hardcoded demo login and says so,
 * so a fresh clone still runs.
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookMarked,
  Mic,
  Trophy,
  FileCheck2,
  MessagesSquare,
  Sparkles,
  MailCheck,
  Check,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { DEMO_PASS, DEMO_USER, hasRealAuth, useApp } from '@/context/AppContext'
import {
  INSTITUTE_DOMAIN,
  emailProblem,
  passwordChecks,
  requestPasswordReset,
  signUp,
} from '@/lib/auth'
import { cn } from '@/lib/cn'

const HIGHLIGHTS = [
  { icon: Sparkles, title: 'Role-aware prep tracks', body: 'Quant, SDE, Finance, Consult, AI/ML, FMCG and Core, each with its own curated material.' },
  { icon: FileCheck2, title: 'AI resume scoring', body: 'Score out of 100 against the profile you are targeting, with concrete rewrites.' },
  { icon: BookMarked, title: 'Blue Book', body: 'Every company from the Placement Cell\u2019s Blue Books \u2014 the rounds, who was eligible, and what students said about each process.' },
  { icon: Mic, title: 'Mock interviews & exams', body: 'Round-by-round practice with feedback, solo or head-to-head against friends.' },
  { icon: Trophy, title: 'Competition radar', body: 'Unstop, Codeforces and insti mails filtered to the roles you actually care about.' },
  { icon: MessagesSquare, title: 'Peer forum', body: 'Interview experiences from the batch above you, moderated and searchable.' },
]

type Mode = 'signin' | 'signup' | 'forgot'

/** Live checklist under the password field, so rules are visible while typing. */
function PasswordRules({ password }: { password: string }) {
  if (!password) return null
  return (
    <ul className="anim-in mt-2 space-y-1">
      {passwordChecks(password).map((rule) => (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-1.5 text-[11px]',
            rule.met ? 'text-accent' : 'text-muted',
          )}
        >
          <span
            className={cn(
              'grid size-3.5 shrink-0 place-items-center rounded-full border',
              rule.met ? 'border-accent bg-accent text-accent-fg' : 'border-line',
            )}
          >
            {rule.met && <Check className="size-2.5" strokeWidth={3.5} />}
          </span>
          {rule.label}
        </li>
      ))}
    </ul>
  )
}

export default function Login() {
  const { signIn } = useApp()
  const nav = useNavigate()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  /** Set after signup or a reset request: the next step is in their inbox. */
  const [sent, setSent] = useState<null | 'signup' | 'reset'>(null)

  const switchTo = (next: Mode) => {
    setMode(next)
    setErr('')
    setSent(null)
    setPass('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        const res = await signIn(email, pass)
        if (!res.ok) setErr(res.error ?? 'Could not sign in.')
        else nav('/')
        return
      }

      if (mode === 'signup') {
        const res = await signUp({ email, password: pass, name })
        if (!res.ok) setErr(res.error)
        else setSent('signup')
        return
      }

      const res = await requestPasswordReset(email)
      if (!res.ok) setErr(res.error)
      else setSent('reset')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  // ------------------------------------------------------------ inbox step
  if (sent) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="anim-in w-full max-w-sm text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
            <MailCheck className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {sent === 'signup' ? (
              <>
                If <b className="text-ink">{email}</b> can hold an account, a confirmation link is on
                its way. The account does not work until you click it.
              </>
            ) : (
              <>
                If <b className="text-ink">{email}</b> has an account, a reset link is on its way. The
                link expires in an hour.
              </>
            )}
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            We say "if" on purpose. Confirming whether an address is registered would let anyone use
            this form to find out who has an account.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => switchTo('signin')}>
            <ArrowLeft className="size-4" /> Back to sign in
          </Button>
        </div>
      </div>
    )
  }

  const demoField = mode === 'signin' && !hasRealAuth

  const headings: Record<Mode, { title: string; sub: string }> = {
    signin: { title: 'Sign in', sub: 'Use your institute account to continue.' },
    signup: { title: 'Create your account', sub: `Open to @${INSTITUTE_DOMAIN} addresses.` },
    forgot: { title: 'Reset your password', sub: 'We will email a link to your institute address.' },
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
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Internship Preparation Drive
            </h1>
            <p className="mt-1 text-sm text-muted">IIT Madras · prep platform for the next batch</p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight">{headings[mode].title}</h2>
            <p className="mt-1 text-sm text-muted">{headings[mode].sub}</p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'signup' && (
              <div>
                <Label>Full name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {/* Only the demo sign-in accepts a bare username; everything else is an email. */}
            <div>
              <Label hint={demoField ? 'or the demo username' : undefined}>
                {demoField ? 'Username or roll number' : 'Institute email'}
              </Label>
              <Input
                type={demoField ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={demoField ? 'admin' : `me23b042@${INSTITUTE_DOMAIN}`}
                autoComplete={mode === 'signup' ? 'email' : 'username'}
                aria-invalid={Boolean(err)}
                autoFocus
                required
              />
              {mode === 'signup' && email && emailProblem(email) && (
                <p className="mt-1.5 text-[11px] text-danger">{emailProblem(email)}</p>
              )}
            </div>

            {mode !== 'forgot' && (
              <div>
                <Label
                  hint={
                    mode === 'signin' ? (
                      <button
                        type="button"
                        onClick={() => switchTo('forgot')}
                        className="text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    ) : undefined
                  }
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="pr-10"
                    required
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
                {mode === 'signup' && <PasswordRules password={pass} />}
              </div>
            )}

            {err && (
              <div className="anim-in flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/8 px-3 py-2.5 text-xs text-danger">
                <AlertCircle className="mt-px size-4 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
              {busy
                ? 'Working…'
                : mode === 'signin'
                  ? 'Sign in'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Send reset link'}
              {!busy && <ArrowRight className="size-4" />}
            </Button>
          </form>

          {mode === 'signin' && !hasRealAuth && (
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_USER)
                setPass(DEMO_PASS)
                setErr('')
              }}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-accent/35 bg-accent-soft px-3.5 py-3 text-left transition-colors hover:border-accent/60"
            >
              <div>
                <p className="text-xs font-medium text-accent">Demo credentials</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {DEMO_USER} / {DEMO_PASS}
                </p>
              </div>
              <Badge tone="accent">Tap to fill</Badge>
            </button>
          )}

          <div className="mt-6 text-center text-xs text-muted">
            {mode === 'signin' ? (
              <>
                New here?{' '}
                <button
                  onClick={() => switchTo('signup')}
                  className="font-medium text-accent hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <button
                onClick={() => switchTo('signin')}
                className="font-medium text-accent hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>

          <p className="mt-6 flex items-start gap-2 rounded-xl border border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
            <ShieldCheck className="mt-px size-3.5 shrink-0 text-accent" />
            {hasRealAuth ? (
              <>
                One account per institute email and per roll number. Passwords are hashed on the
                server and never stored here. Email confirmation is required before an account works.
              </>
            ) : (
              <>
                <b className="text-warn">Demo mode.</b> No database is connected, so this is a
                hardcoded login with no real accounts behind it. Connect Supabase to switch on real
                sign-up, verification and password reset.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
