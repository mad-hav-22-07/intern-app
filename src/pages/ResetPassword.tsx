/**
 * Where the emailed reset link lands.
 *
 * Supabase turns the token in the URL into a temporary session before this
 * renders (`detectSessionInUrl`), so setting a new password is just an
 * authenticated update. If there is no session the link was already used, has
 * expired, or was opened in a different browser, and this says so rather than
 * failing silently on submit.
 */

import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, KeyRound, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { currentUser, isAuthEnabled, passwordChecks, updatePassword } from '@/lib/auth'
import { cn } from '@/lib/cn'

export default function ResetPassword() {
  const nav = useNavigate()
  const [ready, setReady] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isAuthEnabled) {
      setReady('invalid')
      return
    }
    // Supabase parses the recovery token from the URL fragment asynchronously, so
    // give it a tick before deciding the link is dead.
    const timer = setTimeout(() => {
      void currentUser().then((user) => setReady(user ? 'valid' : 'invalid'))
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const rules = passwordChecks(password)
  const mismatch = confirm.length > 0 && password !== confirm
  const canSubmit = rules.every((r) => r.met) && !mismatch && confirm.length > 0 && !busy

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setErr('')
    try {
      const res = await updatePassword(password)
      if (!res.ok) setErr(res.error)
      else setDone(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="anim-in w-full max-w-sm">
        <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
          {done ? <Check className="size-6" /> : <KeyRound className="size-6" />}
        </span>

        {done ? (
          <>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">Password updated</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              You are signed in on this device. Any other device stays signed in on the old session
              until it expires, so sign out there if you were not the one who asked for this.
            </p>
            <Button variant="primary" className="mt-6 w-full" onClick={() => nav('/')}>
              Go to dashboard
            </Button>
          </>
        ) : ready === 'invalid' ? (
          <>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">This link no longer works</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Reset links expire after an hour and can only be used once. They also have to be opened
              in the same browser you requested them from. Ask for a new one.
            </p>
            <Button variant="primary" className="mt-6 w-full" onClick={() => nav('/login')}>
              Back to sign in
            </Button>
          </>
        ) : ready === 'checking' ? (
          <p className="mt-4 text-sm text-muted">Checking your link…</p>
        ) : (
          <>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">Choose a new password</h1>
            <p className="mt-1 text-sm text-muted">
              Pick something you have not used on another site.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  required
                />
                {password && (
                  <ul className="anim-in mt-2 space-y-1">
                    {rules.map((rule) => (
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
                )}
              </div>

              <div>
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={mismatch}
                  required
                />
                {mismatch && <p className="mt-1.5 text-[11px] text-danger">These do not match.</p>}
              </div>

              {err && (
                <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/8 px-3 py-2.5 text-xs text-danger">
                  <AlertCircle className="mt-px size-4 shrink-0" />
                  <span>{err}</span>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={!canSubmit}>
                {busy ? 'Saving…' : 'Set new password'}
              </Button>
            </form>

            <p className="mt-6 flex items-start gap-2 rounded-xl border border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-accent" />
              The new password is hashed on the server. Nobody, including whoever runs this
              platform, can read it back.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
