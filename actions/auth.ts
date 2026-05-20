'use server'

// Auth Server Actions (Slice 0)
// All Supabase Auth calls are centralised here so components stay thin
// and the auth flow is easy to trace and test.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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
  // The verify-email page reads the user's email from the active session (S0.2).
  redirect('/verify-email')
}
