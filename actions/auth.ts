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
