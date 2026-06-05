'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword, type ResetPasswordState } from '@/actions/auth'

interface FieldErrors {
  password?: string
  confirmPassword?: string
}

interface ResetPasswordFormProps {
  /** True when the reset link was already expired before the user reached
   *  this page (i.e. /auth/callback redirected to ?state=expired). */
  isExpired?: boolean
}

const INITIAL_STATE: ResetPasswordState = { status: 'idle' }

export function ResetPasswordForm({ isExpired = false }: ResetPasswordFormProps) {
  const [state, action, isPending] = useActionState(resetPassword, INITIAL_STATE)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // ── Expired view ─────────────────────────────────────────────────────────
  // Shown when: (a) the link was expired on arrival (isExpired prop), or
  // (b) the recovery session expired while the user was on the form.
  if (isExpired || state.status === 'expired') {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
            <Clock className="h-8 w-8 text-[#D97706]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">This link has expired</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Your reset link is no longer valid. Please request a new one.
        </p>

        <Link
          href="/forgot-password"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D6E6E] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  // ── Success view ─────────────────────────────────────────────────────────
  if (state.status === 'success') {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
            <CheckCircle className="h-8 w-8 text-[#16A34A]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Password updated</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">Your password has been updated.</p>

        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D6E6E] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors: FieldErrors = {}

    if (!password || password.length < 10) {
      errors.password = 'Your password must be at least 10 characters'
    }
    if (!confirmPassword || confirmPassword !== password) {
      errors.confirmPassword = 'Your passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault()
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
  }

  // ── Reset form ────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-8 text-[22px] font-bold text-[#1E293B]">Choose a new password</h1>

      {/* Same password error */}
      {state.status === 'same_password' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[14px] text-[#991B1B]">
            Your new password must be different from your current password. Please choose a
            different one.
          </p>
        </div>
      )}

      {/* Server error */}
      {state.status === 'error' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[14px] text-[#991B1B]">Something went wrong. Please try again.</p>
        </div>
      )}

      <form noValidate action={action} onSubmit={handleSubmit}>
        {/* New password */}
        <div className="mb-5">
          <Label
            htmlFor="new-password"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            New password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? 'new-password-error' : 'new-password-hint'}
              className="h-10 pr-10 text-[14px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="new-password-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.password}
            </p>
          ) : (
            <p id="new-password-hint" className="mt-1.5 text-[13px] text-[#64748B]">
              At least 10 characters
            </p>
          )}
        </div>

        {/* Confirm new password */}
        <div className="mb-6">
          <Label
            htmlFor="confirm-new-password"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!fieldErrors.confirmPassword || undefined}
              aria-describedby={
                fieldErrors.confirmPassword ? 'confirm-new-password-error' : undefined
              }
              className="h-10 pr-10 text-[14px]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p
              id="confirm-new-password-error"
              role="alert"
              className="mt-1.5 text-[13px] text-[#DC2626]"
            >
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </div>
  )
}
