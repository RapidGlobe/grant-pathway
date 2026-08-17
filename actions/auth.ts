'use server'

// Auth Server Actions (Slice 0)
// All Supabase Auth calls are centralised here so components stay thin
// and the auth flow is easy to trace and test.

import * as Sentry from '@sentry/nextjs'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { resendRatelimit } from '@/lib/rate-limit'
import { emailSchema, passwordSchema, nameSchema } from '@/lib/validation'
import type { EmailOtpType } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Input validation (GAP-25, ADR-ARCH-003)
//
// Added 2026-08-05. ADR-ARCH-003 requires Zod validation on all Server Actions;
// this file had none, so `FormData` values reached Supabase Auth unchecked.
// Every action below now parses its input before doing any work.
//
// Two deliberate choices about how failures are reported:
//
//   1. **No new error states.** Each schema failure maps onto a member of the
//      action's existing result union, so no client component changes and no
//      user can reach an unhandled state. A password-rule failure returns the
//      existing `weak_password` (which is what it is, and is already rendered
//      with the right message); anything else returns the existing generic
//      failure.
//
//   2. **Anti-enumeration behaviour is preserved exactly.** `signIn` returns its
//      single generic `credentials` error for malformed input, and
//      `requestPasswordReset` still returns `{ status: 'sent' }` — see the note
//      on that action. A validation error that distinguished "malformed" from
//      "wrong" would hand back information AC-FR-04-03 and AC-FR-05-02 exist to
//      withhold.
//
// These actions are reached from forms that validate client-side first, so in
// normal use these schemas never fail. That is the point: the client check is a
// courtesy to the user, and this is the security boundary. Next.js's Server
// Actions guide is explicit that render-time gating is not a boundary, because
// the action is reachable by anyone who can send the same POST.
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  feedbackConsent: z.boolean(),
})

const confirmEmailSchema = z
  .object({
    code: z.string(),
    tokenHash: z.string(),
    // The Supabase `EmailOtpType` union, spelled out so an arbitrary string
    // cannot reach verifyOtp. Previously this was a bare `as EmailOtpType` cast,
    // which asserts a type without checking one.
    type: z.enum(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']).nullable(),
  })
  // verifyOtp needs both token_hash and type; exchangeCodeForSession needs code.
  // Neither being present was previously handled by a synthetic error object
  // further down; rejecting it here means the action never proceeds on input it
  // cannot act on.
  .refine((v) => v.code !== '' || (v.tokenHash !== '' && v.type !== null), {
    message: 'Neither code nor token_hash supplied',
  })

const emailOnlySchema = z.object({ email: emailSchema })

const passwordOnlySchema = z.object({ password: passwordSchema })

/**
 * Sign-in validates **presence only** — deliberately not the password policy,
 * and deliberately not RFC email format.
 *
 * Not the password policy, because existing accounts predate the 2026-06-29
 * hardening (VQ-009) and a 6-character password created before then must still
 * be able to sign in; rejecting it here would lock the user out of the account
 * rather than protecting it.
 *
 * Not the email format, for the same shape of reason: format validation on the
 * login path buys nothing — the value is only ever handed to GoTrue, which
 * validates it too — while any disagreement between this regex and the one that
 * accepted the address at registration locks a real user out. Presence is the
 * useful check here; correctness is GoTrue's to judge.
 */
const signInSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(1).max(320),
  ),
  password: z.string().min(1),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})

// ---------------------------------------------------------------------------
// Password rejection causes (GAP-106)
// ---------------------------------------------------------------------------

/**
 * Supabase reports three distinct causes as a single `weak_password` code —
 * `@supabase/auth-js` types them as `["length", "characters", "pwned"]` — and
 * `error.code` alone cannot tell them apart. `AuthWeakPasswordError` carries
 * the causes in `reasons`; the generic `AuthError` type does not declare that
 * field, so it is read through a narrow guard rather than a cast.
 *
 * Why this matters (GAP-106): a password rejected for appearing in a breach
 * list has usually already satisfied the length and character rules —
 * `Password123456` is 14 characters with letters and digits — so rendering the
 * rule message tells the user to do something they have already done, with no
 * way forward. The `pwned` case needs its own message.
 *
 * This only became reachable on 2026-08-16, when `password_hibp_enabled` was
 * turned on in production under GAP-104. Before that, length and characters
 * were genuinely the only two causes and the single message was correct.
 */
function isBreachedPassword(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const { reasons } = error as { reasons?: unknown }
  return Array.isArray(reasons) && reasons.includes('pwned')
}

// ---------------------------------------------------------------------------
// S0.1 — Registration
// ---------------------------------------------------------------------------

export type RegisterState = {
  error: 'email_exists' | 'weak_password' | 'breached_password' | 'unknown' | null
}

/**
 * Registers a new user via Supabase Auth signUp().
 * On success: creates auth.users row → trigger auto-creates user_profiles row
 *             → redirects to /verify-email.
 * On duplicate email: returns { error: 'email_exists' }.
 * On weak password (rejected by Supabase Auth's password strength check):
 *             returns { error: 'weak_password' }.
 * On any other failure: returns { error: 'unknown' }.
 *
 * Called from RegisterForm via useActionState (React 19).
 * Client-side validation runs first; this action is only reached when the
 * form fields are valid (email format, password length, passwords match, terms).
 */
export async function registerUser(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get('firstName') ?? '',
    lastName: formData.get('lastName') ?? '',
    email: formData.get('email') ?? '',
    password: formData.get('password') ?? '',
    // Checkbox value is 'on' when checked, null when unchecked (standard HTML behaviour)
    feedbackConsent: formData.get('feedbackConsent') === 'on',
  })

  if (!parsed.success) {
    // A password-rule failure is reported as what it is, using the state the
    // form already renders with the correct message. Anything else (missing
    // name, malformed email) can only be a direct POST or a client-side
    // regression, so it gets the generic state rather than a new one.
    const passwordFailed = parsed.error.issues.some((issue) => issue.path[0] === 'password')
    return { error: passwordFailed ? 'weak_password' : 'unknown' }
  }

  const { firstName, lastName, email, password, feedbackConsent } = parsed.data

  // Use the request origin to build the emailRedirectTo URL so the
  // verification link in the email points to our /auth/callback route.
  // This works in local dev (http://127.0.0.1:3000) and production alike.
  const origin = (await headers()).get('origin') ?? ''

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Supabase sends the verification email with a link that redirects
      // to this URL after the token is validated server-side.
      emailRedirectTo: `${origin}/auth/callback`,
      // These values are read by the handle_new_user trigger to populate
      // the user_profiles row (first_name, last_name, feedback_consent).
      data: {
        first_name: firstName,
        last_name: lastName,
        feedback_consent: feedbackConsent,
      },
    },
  })

  if (error) {
    // Supabase Auth rejects passwords that don't meet its configured strength
    // requirements (min length / character variety / pwned-password check)
    // with error.code === 'weak_password' (AuthWeakPasswordError). Client-side
    // validation should catch this first, but the server is the source of
    // truth, so surface a specific message rather than the generic fallback.
    if (error.code === 'weak_password') {
      // GAP-106: distinguish the breach-list cause from the rule causes.
      return { error: isBreachedPassword(error) ? 'breached_password' : 'weak_password' }
    }
    Sentry.captureException(error, { tags: { action: 'registerUser' } })
    return { error: 'unknown' }
  }

  // Detect duplicate email when email confirmation is enabled.
  // Supabase returns a user with an empty identities array rather than an error
  // to avoid leaking whether an email address is registered (privacy-preserving).
  // See: https://supabase.com/docs/reference/javascript/auth-signup
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { error: 'email_exists' }
  }

  // Success — redirect to the verification-awaiting state.
  // Pass the email as a query param so the page can display it without
  // needing a session (Supabase does not create a session before email
  // confirmation when enable_confirmations = true).
  redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}

// ---------------------------------------------------------------------------
// S0.2 — Confirm email (explicit click, not a bare page load)
//
// D-012: the /auth/callback route used to complete verification the instant
// its page loaded. Gmail's own server-side link scanning visits links in
// incoming HTML email as part of spam/phishing detection -- entirely
// independent of the recipient's browser -- and was silently consuming the
// single-use link within seconds of every signup email being sent, before
// the real person ever opened it. Confirmed across 5/5 sampled accounts
// going back a month. /auth/callback now redirects here instead of
// completing anything; this action runs automatically via client-side
// JavaScript on page mount (components/confirm-email-form.tsx), with no
// visible button -- Gmail's scanner fetches the raw page over HTTP and never
// executes that JavaScript, so this stays safe against the exact behaviour
// that caused D-012.
// See CHANGELOG.md, 2026-07-02, D-012.
// ---------------------------------------------------------------------------

export type ConfirmEmailState = {
  error: 'invalid' | null
}

/**
 * Completes email verification via verifyOtp() (token_hash flow) or
 * exchangeCodeForSession() (PKCE flow) -- whichever the confirm page
 * received from /auth/callback. Signs the resulting session straight back
 * out, matching resetPassword()'s pattern, so the success screen's
 * "Sign in" link lands on a clean sign-in page rather than /dashboard.
 *
 * Called from ConfirmEmailForm via useActionState.
 */
export async function confirmEmail(
  _prevState: ConfirmEmailState,
  formData: FormData,
): Promise<ConfirmEmailState> {
  const parsed = confirmEmailSchema.safeParse({
    code: formData.get('code') ?? '',
    tokenHash: formData.get('token_hash') ?? '',
    type: formData.get('type') ?? null,
  })

  // Covers the case previously handled by a synthetic error object below
  // ("called with neither code nor token_hash"), plus a `type` that is not a
  // real EmailOtpType — which the old `as EmailOtpType` cast asserted without
  // checking.
  if (!parsed.success) {
    return { error: 'invalid' }
  }

  const { code, tokenHash, type } = parsed.data

  const supabase = await createClient()

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })

  if (error) {
    return { error: 'invalid' }
  }

  await supabase.auth.signOut()
  redirect('/verify-email?state=verified')
}

// ---------------------------------------------------------------------------
// S0.5 — Sign out (called directly from SessionTimeoutProvider timer and
//         from the authenticated nav sign-out button)
// ---------------------------------------------------------------------------

/**
 * Signs the current user out via Supabase Auth signOut().
 * Intentionally does NOT call redirect() — the caller (client component)
 * handles navigation so this works correctly from both form submissions and
 * timer callbacks.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

// ---------------------------------------------------------------------------
// S0.4 — Password reset (request + set new password)
// ---------------------------------------------------------------------------

export type PasswordResetRequestState = {
  status: 'idle' | 'sent'
}

/**
 * Sends a password reset email via Supabase Auth resetPasswordForEmail().
 * Always returns { status: 'sent' } regardless of whether the email is
 * registered — never reveals if an account exists (AC-FR-05-02).
 *
 * Called from ForgotPasswordRequestForm via useActionState.
 */
export async function requestPasswordReset(
  _prevState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const parsed = emailOnlySchema.safeParse({ email: formData.get('email') ?? '' })

  // A malformed address returns { status: 'sent' } exactly as a valid one does,
  // and simply skips the Supabase call. This is deliberate: AC-FR-05-02 requires
  // this action to return the same result unconditionally so it can never be
  // used to probe which addresses are registered. Returning a validation error
  // here would be a behavioural difference an attacker could observe — a
  // smaller leak than confirming registration, but the same kind, and there is
  // no reason to introduce it. There is nothing useful to tell the user either:
  // the page has already told them to check their inbox.
  if (!parsed.success) {
    return { status: 'sent' }
  }

  const { email } = parsed.data
  const origin = (await headers()).get('origin') ?? ''

  const supabase = await createClient()

  // Fire and forget — we do not check the error because we must never reveal
  // whether the email address is registered (AC-FR-05-02).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=reset`,
  })

  return { status: 'sent' }
}

export type ResetPasswordState = {
  status:
    | 'idle'
    | 'success'
    | 'expired'
    | 'same_password'
    | 'weak_password'
    | 'breached_password'
    | 'error'
}

/**
 * Updates the user's password via Supabase Auth updateUser().
 * Requires an active recovery session set by the /auth/callback route after
 * the user clicks their reset link.
 * On success: returns { status: 'success' }.
 * On expired/missing session: returns { status: 'expired' }.
 * On weak password (rejected by Supabase Auth's password strength check):
 *             returns { status: 'weak_password' }.
 * On any other error: returns { status: 'error' }.
 *
 * Called from ResetPasswordForm via useActionState.
 */
export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = passwordOnlySchema.safeParse({ password: formData.get('password') ?? '' })

  // The only possible failure is the password policy, and `weak_password` is
  // both accurate and already rendered by ResetPasswordForm with the correct
  // message — so no new state is needed.
  if (!parsed.success) {
    return { status: 'weak_password' }
  }

  const { password } = parsed.data

  const supabase = await createClient()

  // Verify the recovery session is still valid before attempting the update
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { status: 'expired' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    // Session expired or token no longer valid
    if (
      error.code === 'session_not_found' ||
      error.code === 'user_not_found' ||
      error.status === 401 ||
      error.status === 403
    ) {
      return { status: 'expired' }
    }
    // Supabase rejects a new password that matches the current one
    if (
      error.code === 'same_password' ||
      error.message?.toLowerCase().includes('different from the old password')
    ) {
      return { status: 'same_password' }
    }
    // Supabase Auth rejects passwords that don't meet its configured strength
    // requirements with error.code === 'weak_password' (AuthWeakPasswordError).
    if (error.code === 'weak_password') {
      // GAP-106: distinguish the breach-list cause from the rule causes.
      return { status: isBreachedPassword(error) ? 'breached_password' : 'weak_password' }
    }
    return { status: 'error' }
  }

  // Sign out the recovery session so the "Sign in" button on the success
  // screen lands on a clean sign-in page rather than redirecting to /dashboard.
  await supabase.auth.signOut()

  return { status: 'success' }
}

// ---------------------------------------------------------------------------
// S0.3 — Sign in
// ---------------------------------------------------------------------------

export type SignInState = {
  error: 'credentials' | 'unverified' | 'unknown' | null
}

/**
 * Signs a user in via Supabase Auth signInWithPassword().
 * On success: redirects to /dashboard.
 * On unverified email: returns { error: 'unverified' }.
 * On wrong credentials (or unknown email — same message to prevent enumeration):
 *   returns { error: 'credentials' }.
 * On any other failure: returns { error: 'unknown' }.
 *
 * Called from SignInForm via useActionState (React 19).
 * Client-side validation (email format, non-empty password) runs first.
 */
export async function signIn(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  // Trimmed defensively: a trailing space or newline picked up from a copy-paste
  // (mobile clipboards in particular) otherwise turns a correct password into
  // a silent invalid_credentials failure. Found live, 2026-07-28. The email
  // trim now happens inside signInSchema; the password trim stays here because
  // the schema deliberately does not touch the password value.
  const parsed = signInSchema.safeParse({
    email: formData.get('email') ?? '',
    password: ((formData.get('password') as string | null) ?? '').trim(),
  })

  // Returns the same generic `credentials` error as a wrong password would.
  // AC-FR-04-03 requires one indistinguishable message across wrong password,
  // unknown email and rate limiting; a separate "invalid input" state would let
  // a caller tell malformed input apart from rejected input, which is the
  // beginning of the enumeration this rule exists to prevent.
  if (!parsed.success) {
    return { error: 'credentials' }
  }

  const { email, password } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Supabase error code for email not yet confirmed
    if (error.code === 'email_not_confirmed') {
      return { error: 'unverified' }
    }
    // All other errors (wrong password, unknown email, rate limit) surface as
    // the same generic credentials message to prevent email enumeration (AC-FR-04-03).
    // Logged server-side only (never shown to the user, so this doesn't weaken
    // the anti-enumeration behaviour) — without it, a genuine rate limit or
    // other non-credentials failure is indistinguishable from a real wrong
    // password from the outside, same class of invisible-error problem found
    // in change-password (2026-07-24).
    console.error('[sign-in] signInWithPassword failed:', {
      code: error.code,
      status: error.status,
      message: error.message,
    })
    return { error: 'credentials' }
  }

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// S8.1 — Change password (authenticated)
// ---------------------------------------------------------------------------

export type ChangePasswordResult = {
  status: 'success' | 'wrong_password' | 'weak_password' | 'breached_password' | 'error'
}

/**
 * Verifies the user's current password then updates it.
 * Verification is done by re-signing-in with the current email + password
 * before calling updateUser — Supabase has no dedicated "verify current
 * password" API, but signInWithPassword validates the credential correctly.
 *
 * `current_password` is also passed to `updateUser` itself (2026-07-24 fix):
 * this Supabase project has `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD`
 * enabled, which makes GoTrue reject any password update that omits it —
 * regardless of the signInWithPassword re-verification immediately above,
 * which GoTrue has no way to know happened. Found live: every change-password
 * attempt failed with `code: 'current_password_required'` until this was added.
 *
 * Called directly from AccountSettingsForm via useTransition (not FormData).
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword })

  if (!parsed.success) {
    // An empty current password is reported as `wrong_password`, which is
    // honest — it is not the user's password — and avoids a new state. A new
    // password failing the policy is `weak_password`, already rendered by
    // AccountSettingsForm with the right message.
    const newPasswordFailed = parsed.error.issues.some((issue) => issue.path[0] === 'newPassword')
    return { status: newPasswordFailed ? 'weak_password' : 'wrong_password' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) {
    console.error('[change-password] No authenticated user on session')
    return { status: 'error' }
  }

  // Verify the current password before allowing the change
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { status: 'wrong_password' }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  })
  if (updateError) {
    // Supabase Auth rejects passwords that don't meet its configured strength
    // requirements with error.code === 'weak_password' (AuthWeakPasswordError).
    if (updateError.code === 'weak_password') {
      // GAP-106: distinguish the breach-list cause from the rule causes.
      return {
        status: isBreachedPassword(updateError) ? 'breached_password' : 'weak_password',
      }
    }
    // Logged so the real cause (e.g. a GoTrue-side setting the app doesn't
    // implement, rate limiting, session/reauth issues) is visible in
    // `vercel logs` instead of only ever surfacing as a generic client-side
    // "Something went wrong" — see the account-deletion 42501 fix (2026-07-23)
    // for why this class of error was previously invisible.
    console.error('[change-password] Failed to update password:', {
      code: updateError.code,
      status: updateError.status,
      message: updateError.message,
    })
    return { status: 'error' }
  }

  return { status: 'success' }
}

// ---------------------------------------------------------------------------
// S0.2 — Resend verification email
// ---------------------------------------------------------------------------

export type ResendState = {
  status: 'idle' | 'sent' | 'rate_limited' | 'missing_email' | 'error'
}

/**
 * Resends the signup verification email.
 * Rate-limited to 3 requests per hour per email address (AC-FR-03-06).
 * Called from VerifyEmailResendForm via useActionState.
 */
export async function resendVerificationEmail(
  _prevState: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const raw = ((formData.get('email') as string | null) ?? '').trim()

  // Empty keeps its existing, more specific state; malformed falls to the
  // generic one. Both are already handled by VerifyEmailResendForm.
  if (!raw) return { status: 'missing_email' }

  const parsed = emailOnlySchema.safeParse({ email: raw })
  if (!parsed.success) return { status: 'error' }

  const { email } = parsed.data

  // App-level rate limit (3/hour per email) — Supabase also enforces its own
  // server-side rate limit, but this gives us deterministic UI feedback.
  const { success } = await resendRatelimit.limit(email)
  if (!success) return { status: 'rate_limited' }

  const origin = (await headers()).get('origin') ?? ''
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) return { status: 'error' }
  return { status: 'sent' }
}
