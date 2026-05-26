'use server'

// Auth Server Actions (Slice 0)
// All Supabase Auth calls are centralised here so components stay thin
// and the auth flow is easy to trace and test.

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { resendRatelimit } from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// S0.1 — Registration
// ---------------------------------------------------------------------------

export type RegisterState = {
  error: 'email_exists' | 'unknown' | null
}

/**
 * Registers a new user via Supabase Auth signUp().
 * On success: creates auth.users row → trigger auto-creates user_profiles row
 *             → redirects to /verify-email.
 * On duplicate email: returns { error: 'email_exists' }.
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
// S0.6 — MFA opt-in (TOTP via Supabase Auth)
// ---------------------------------------------------------------------------

/**
 * Starts TOTP enrollment for the current user.
 * Returns the QR code SVG data URL and the factorId needed to complete
 * enrollment.  Called directly from a client-side event handler (not via
 * useActionState) because it returns structured data rather than FormData.
 */
export type MfaEnrollResult =
  | { ok: true; factorId: string; qrCode: string; secret: string }
  | { ok: false; error: string }

export async function mfaEnroll(): Promise<MfaEnrollResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
  if (error) return { ok: false, error: error.message }
  return {
    ok: true,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  }
}

export type MfaVerifyEnrollmentState = {
  status: 'idle' | 'success' | 'invalid_code' | 'error'
}

/**
 * Verifies the 6-digit TOTP code entered during enrollment.
 * On success the factor is marked verified in Supabase and MFA is active.
 * FormData: factorId (hidden), code (user-entered 6 digits).
 */
export async function mfaVerifyEnrollment(
  _prevState: MfaVerifyEnrollmentState,
  formData: FormData,
): Promise<MfaVerifyEnrollmentState> {
  const factorId = (formData.get('factorId') as string | null) ?? ''
  const code = ((formData.get('code') as string | null) ?? '').replace(/\s/g, '')

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })

  if (error) {
    if (error.status === 422) return { status: 'invalid_code' }
    return { status: 'error' }
  }
  return { status: 'success' }
}

export type MfaUnenrollState = {
  status: 'idle' | 'success' | 'error'
}

/**
 * Removes the user's TOTP factor.  After success the caller should
 * call router.refresh() to re-read the updated MFA status from the server.
 * FormData: factorId (hidden).
 */
export async function mfaUnenroll(
  _prevState: MfaUnenrollState,
  formData: FormData,
): Promise<MfaUnenrollState> {
  const factorId = (formData.get('factorId') as string | null) ?? ''

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })

  if (error) return { status: 'error' }
  return { status: 'success' }
}

export type VerifyMfaState = {
  error: 'invalid_code' | 'unknown' | null
}

/**
 * Completes MFA sign-in by challenging and verifying the TOTP code.
 * Called from MfaChallengeForm on the /mfa page.
 * On success: redirects to /dashboard (session upgraded to aal2).
 * FormData: factorId (hidden), code (user-entered 6 digits).
 */
export async function verifyMfaSignIn(
  _prevState: VerifyMfaState,
  formData: FormData,
): Promise<VerifyMfaState> {
  const factorId = (formData.get('factorId') as string | null) ?? ''
  const code = ((formData.get('code') as string | null) ?? '').replace(/\s/g, '')

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })

  if (error) {
    if (error.status === 422) return { error: 'invalid_code' }
    return { error: 'unknown' }
  }

  redirect('/dashboard')
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
  status: 'idle' | 'success' | 'expired' | 'same_password' | 'error'
}

/**
 * Updates the user's password via Supabase Auth updateUser().
 * Requires an active recovery session set by the /auth/callback route after
 * the user clicks their reset link.
 * On success: returns { status: 'success' }.
 * On expired/missing session: returns { status: 'expired' }.
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
  const { data: { user } } = await supabase.auth.getUser()
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
export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
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

  // Check whether a second factor is required (AC-FR-07-03).
  // If the user has a verified TOTP factor the next required level is aal2;
  // redirect to the MFA challenge page before granting access to the app.
  const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel !== 'aal2') {
    redirect('/mfa')
  }

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// S8.1 — Change password (authenticated)
// ---------------------------------------------------------------------------

export type ChangePasswordResult = {
  status: 'success' | 'wrong_password' | 'error'
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { status: 'error' }

  // Verify the current password before allowing the change
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { status: 'wrong_password' }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { status: 'error' }

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
