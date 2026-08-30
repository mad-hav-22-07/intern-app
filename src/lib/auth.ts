import { isSupabaseConfigured, supabase } from '@/lib/supabase'

/**
 * Real accounts, via Supabase Auth.
 *
 * Everything that actually protects an account happens on the server: password
 * hashing, email verification, rate limiting, and the domain and roll-number
 * rules enforced by triggers in `0003_accounts.sql`. The checks in this file are
 * there to give fast feedback in the form, not to be the security boundary. A
 * client-side check is a courtesy; anyone can skip it by calling the API directly.
 *
 * When Supabase is not configured the app falls back to a single hardcoded demo
 * login so a fresh clone still runs. That fallback is clearly labelled in the UI
 * and is not, and never should be, used with real student data.
 */

/** Accounts are restricted to institute addresses. Also enforced by a DB trigger. */
export const INSTITUTE_DOMAIN = 'smail.iitm.ac.in'

export const MIN_PASSWORD = 10

export const isAuthEnabled = isSupabaseConfigured

export type AuthUser = {
  id: string
  email: string
  name: string
  rollNo: string
  /** False until the user clicks the link in their inbox. */
  verified: boolean
}

export type AuthResult = { ok: true } | { ok: false; error: string }

/** `me23b042@smail.iitm.ac.in` -> `ME23B042`. */
export function rollFromEmail(email: string): string {
  return email.trim().split('@')[0].toUpperCase()
}

export function emailProblem(email: string): string | null {
  const value = email.trim().toLowerCase()
  if (!value) return 'Enter your institute email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'That is not a valid email address.'
  if (!value.endsWith(`@${INSTITUTE_DOMAIN}`)) {
    return `Accounts are limited to @${INSTITUTE_DOMAIN} addresses.`
  }
  return null
}

/**
 * Every rule the password must satisfy, and whether it currently does. Returned
 * as a list rather than a boolean so the form can show progress while typing
 * instead of rejecting the whole thing at submit.
 */
export function passwordChecks(password: string): { label: string; met: boolean }[] {
  return [
    { label: `At least ${MIN_PASSWORD} characters`, met: password.length >= MIN_PASSWORD },
    { label: 'A letter and a number', met: /[a-zA-Z]/.test(password) && /\d/.test(password) },
    { label: 'Not one of the obvious ones', met: !isCommonPassword(password) },
  ]
}

export function passwordOk(password: string): boolean {
  return passwordChecks(password).every((c) => c.met)
}

/**
 * A tiny deny-list. It is not a substitute for the breach-corpus check Supabase
 * can do server-side (enable "leaked password protection" in the dashboard), it
 * just catches the handful that show up most often on campus signups.
 */
function isCommonPassword(password: string): boolean {
  const value = password.toLowerCase()
  const banned = [
    'password',
    'iitmadras',
    'iitm2026',
    '1234567890',
    'qwertyuiop',
    'admin12345',
    'letmein123',
  ]
  return banned.some((b) => value.includes(b))
}

const NO_BACKEND =
  'Accounts need a database. This build is running in demo mode, so sign in with the demo credentials instead.'

function client() {
  if (!supabase) throw new Error(NO_BACKEND)
  return supabase
}

/** Supabase error text is written for developers; this rewrites the common ones. */
function readable(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'That email and password do not match.'
  if (m.includes('email not confirmed')) {
    return 'Confirm your email first. Check your inbox for the link we sent.'
  }
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'An account already exists for this email. Sign in, or reset your password.'
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  if (m.includes('weak password')) return 'That password is too easy to guess. Pick another.'
  return message
}

function toUser(user: {
  id: string
  email?: string
  email_confirmed_at?: string | null
  user_metadata?: Record<string, unknown>
}): AuthUser {
  const email = user.email ?? ''
  return {
    id: user.id,
    email,
    name: (user.user_metadata?.full_name as string) || rollFromEmail(email),
    rollNo: (user.user_metadata?.roll_no as string) || rollFromEmail(email),
    verified: Boolean(user.email_confirmed_at),
  }
}

/**
 * Creates the account and sends a confirmation email.
 *
 * Supabase enforces one account per email address, so a second signup with the
 * same address fails rather than creating a duplicate. Whether that failure is
 * *visible* depends on the project's email-enumeration setting: with protection
 * on, this returns success either way so an attacker cannot use the form to
 * discover which addresses are registered. The real signal is the email itself.
 */
export async function signUp(input: {
  email: string
  password: string
  name: string
}): Promise<AuthResult> {
  if (!isAuthEnabled) return { ok: false, error: NO_BACKEND }
  const email = input.email.trim().toLowerCase()
  const problem = emailProblem(email)
  if (problem) return { ok: false, error: problem }
  if (!passwordOk(input.password)) return { ok: false, error: 'That password does not meet the rules below.' }
  if (input.name.trim().length < 2) return { ok: false, error: 'Enter your full name.' }

  const { error } = await client().auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: { full_name: input.name.trim(), roll_no: rollFromEmail(email) },
    },
  })

  if (error) return { ok: false, error: readable(error.message) }
  return { ok: true }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await client().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) return { ok: false, error: readable(error.message) }
  return { ok: true }
}

/**
 * Sends a reset link to the address on the account.
 *
 * Deliberately returns success even when no such account exists. Reporting "no
 * account with that email" would turn this form into a way to test which
 * students are registered.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!isAuthEnabled) return { ok: false, error: NO_BACKEND }
  const value = email.trim().toLowerCase()
  const problem = emailProblem(value)
  if (problem) return { ok: false, error: problem }

  const { error } = await client().auth.resetPasswordForEmail(value, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  // Rate limiting is the one failure worth surfacing; the rest stay silent.
  if (error && /rate limit|too many/i.test(error.message)) {
    return { ok: false, error: readable(error.message) }
  }
  return { ok: true }
}

/** Called from the recovery link, where Supabase has already created a session. */
export async function updatePassword(password: string): Promise<AuthResult> {
  if (!isAuthEnabled) return { ok: false, error: NO_BACKEND }
  if (!passwordOk(password)) return { ok: false, error: 'That password does not meet the rules below.' }
  const { error } = await client().auth.updateUser({ password })
  if (error) return { ok: false, error: readable(error.message) }
  return { ok: true }
}

export async function signOut(): Promise<void> {
  await client().auth.signOut()
}

export async function currentUser(): Promise<AuthUser | null> {
  if (!isAuthEnabled) return null
  const { data } = await client().auth.getSession()
  return data.session?.user ? toUser(data.session.user) : null
}

/**
 * Fires on sign in, sign out, token refresh and password recovery. Returns an
 * unsubscribe function.
 */
export function onAuthChange(handler: (user: AuthUser | null) => void): () => void {
  if (!isAuthEnabled) return () => {}
  const { data } = client().auth.onAuthStateChange((_event, session) => {
    handler(session?.user ? toUser(session.user) : null)
  })
  return () => data.subscription.unsubscribe()
}
