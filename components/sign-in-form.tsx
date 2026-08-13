'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { signIn } from '@/actions/auth'

interface FieldErrors {
  email?: string
  password?: string
}

interface SignInFormProps {
  /** True when the user has just deleted their account (shows a confirmation banner). */
  accountDeleted?: boolean
  /**
   * True when the user arrived here from the 60-minute inactivity timeout
   * (`/?timeout=true`) — covers both the automatic sign-out and the warning
   * modal's "Sign out now" button, per `technical-design.md` §5. GAP-22.
   */
  signedOutForInactivity?: boolean
}

export function SignInForm({
  accountDeleted = false,
  signedOutForInactivity = false,
}: SignInFormProps) {
  const [state, action, isPending] = useActionState(signIn, { error: null })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors: FieldErrors = {}
    // Trimmed before validation so a trailing space/newline from a copy-paste
    // doesn't fail the email format check or reach the server untrimmed.
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }
    if (!password.trim()) {
      errors.password = 'Please enter your password'
    }

    if (Object.keys(errors).length > 0) {
      // Prevent the Server Action from firing; show inline errors instead
      e.preventDefault()
      setFieldErrors(errors)
      return
    }

    // Validation passed — clear any previous field errors and let the
    // Server Action (action={action} on the form) handle the submission
    setFieldErrors({})
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-2 text-center text-[1.375rem] font-bold text-[#1E293B]">Sign in</h1>

      {/* Tagline */}
      <p className="mb-8 text-center text-[1rem] text-[#64748B]">
        Your free grant writing companion for UK charities
      </p>

      {/*
        Signed out by the inactivity timer (GAP-22). Amber notice rather than
        the red error style: nothing has gone wrong and nothing was lost —
        auto-save (ADR-ARCH-004) has already persisted the user's work.
      */}
      {signedOutForInactivity && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-[0.875rem] text-[#78350F]">
            You&apos;ve been signed out due to inactivity. Your work has been saved — sign in again
            to carry on.
          </p>
        </div>
      )}

      {/* Account deleted confirmation banner */}
      {accountDeleted && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4"
        >
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16A34A]" aria-hidden="true" />
          <p className="text-[0.875rem] text-[#166534]">
            Your account has been deleted. We&apos;ve sent you a confirmation email.
          </p>
        </div>
      )}

      {/* Form-level error: wrong credentials (also covers unknown email — AC-FR-04-03) */}
      {state.error === 'credentials' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[0.875rem] text-[#991B1B]">
            Your email address or password is incorrect. Please try again.
          </p>
        </div>
      )}

      {/* Form-level error: email not verified (AC-FR-03-02) */}
      {state.error === 'unverified' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[0.875rem] text-[#991B1B]">
            Please verify your email address before signing in.{' '}
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="font-medium underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
            >
              Resend verification email
            </Link>
          </p>
        </div>
      )}

      {/* Form-level error: unexpected server failure */}
      {state.error === 'unknown' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[0.875rem] text-[#991B1B]">
            Something went wrong. Please try again in a moment.
          </p>
        </div>
      )}

      <form noValidate action={action} onSubmit={handleSubmit}>
        {/* Email address */}
        <div className="mb-5">
          <Label
            htmlFor="email"
            className="mb-1.5 block text-[0.875rem] font-medium text-[#1E293B]"
          >
            Email address{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={!!fieldErrors.email || undefined}
            aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
            className="h-10 text-[0.875rem]"
          />
          {fieldErrors.email && (
            <p
              id="signin-email-error"
              role="alert"
              className="mt-1.5 text-[0.8125rem] text-[#DC2626]"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
          <Label
            htmlFor="password"
            className="mb-1.5 block text-[0.875rem] font-medium text-[#1E293B]"
          >
            Password{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-required="true"
            aria-invalid={!!fieldErrors.password || undefined}
            aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
          />
          {fieldErrors.password && (
            <p
              id="signin-password-error"
              role="alert"
              className="mt-1.5 text-[0.8125rem] text-[#DC2626]"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Forgot password — right-aligned below password field */}
        <div className="mb-6 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[0.8125rem] text-[#64748B] transition-colors hover:text-[#1E293B]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign in — full width, primary teal */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full bg-[#0D6E6E] text-[0.9375rem] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Register prompt */}
      <p className="mt-6 text-center text-[0.875rem] text-[#64748B]">
        New to Grant Pathway?{' '}
        <Link href="/register" className="font-medium text-[#0D6E6E] hover:underline">
          Register for free
        </Link>
      </p>
    </div>
  )
}
