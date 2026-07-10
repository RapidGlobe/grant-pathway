'use server'

// Auth Server Actions (Slice 0)
// All Supabase Auth calls are centralised here so components stay thin
// and the auth flow is easy to trace and test.

import * as Sentry from '@sentry/nextjs'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { resendRatelimit } from '@/lib/rate-limit'
import type { EmailOtpType } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// S0.1 — Registration
// ---------------------------------------------------------------------------

export type RegisterState = {
  error: 'email_exists' | 'weak_password' | 'unknown' | null
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
  const firstName = ((formData.get('firstName') as string | null) ?? '').trim()
  const lastName = ((formData.get('lastName') as string | null) ?? '').trim()
  const email = (formData.get('email') as string | null) ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  // Checkbox value is 'on' when checked, null when unchecked (standard HTML behaviour)
  const feedbackConsent = formData.get('feedbackConsent') === 'on'

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
      return { error: 'weak_password' }
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
// completing anything; this action only runs when a real person clicks the
// "Confirm my email address" button, which an automated scanner does not do.
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
  const code = (formData.get('code') as string | null) ?? ''
  const tokenHash = (formData.get('token_hash') as string | null) ?? ''
  const type = formData.get('type') as EmailOtpType | null

  const supabase = await createClient()

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: { message: 'confirmEmail called with neither code nor token_hash' } }

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
  const email = (formData.get('email') as string | null) ?? ''
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
  status: 'idle' | 'success' | 'expired' | 'same_password' | 'weak_password' | 'error'
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
  const password = (formData.get('password') as string | null) ?? ''

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
      return { status: 'weak_password' }
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
  const email = (formData.get('email') as string | null) ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Supabase error code for email not yet confirmed
    if (error.code === 'email_not_confirmed') {
      return { error: 'unverified' }
    }
    // All other errors (wrong password, unknown email, rate limit) surface as
    // the same generic credentials message to prevent email enumeration (AC-FR-04-03).
    return { error: 'credentials' }
  }

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// S8.1 — Change password (authenticated)
// ---------------------------------------------------------------------------

export type ChangePasswordResult = {
  status: 'success' | 'wrong_password' | 'weak_password' | 'error'
}

/**
 * Verifies the user's current password then updates it.
 * Verification is done by re-signing-in with the current email + password
 * before calling updateUser — Supabase has no dedicated "verify current
 * password" API, but signInWithPassword validates the credential correctly.
 *
 * Called directly from AccountSettingsForm via useTransition (not FormData).
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { status: 'error' }

  // Verify the current password before allowing the change
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { status: 'wrong_password' }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    // Supabase Auth rejects passwords that don't meet its configured strength
    // requirements with error.code === 'weak_password' (AuthWeakPasswordError).
    if (updateError.code === 'weak_password') {
      return { status: 'weak_password' }
    }
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
  const email = ((formData.get('email') as string | null) ?? '').trim()

  if (!email) return { status: 'missing_email' }

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
