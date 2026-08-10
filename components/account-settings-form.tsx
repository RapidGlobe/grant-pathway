'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { changePassword } from '@/actions/auth'
import { ContextualTooltip } from '@/components/contextual-tooltip'

interface FieldErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface AccountSettingsFormProps {
  /** Real email address from auth.users — passed from the Server Component. */
  email: string
}

export function AccountSettingsForm({ email }: AccountSettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')

    const errors: FieldErrors = {}
    if (!currentPassword) errors.currentPassword = 'Please enter your current password'
    if (!newPassword) {
      errors.newPassword = 'Please enter a new password'
    } else if (
      newPassword.length < 12 ||
      !/[a-zA-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      errors.newPassword =
        'Your password must be at least 12 characters and include both letters and numbers'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    startTransition(async () => {
      const result = await changePassword(currentPassword, newPassword)
      if (result.status === 'success') {
        setPasswordUpdated(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setFieldErrors({})
      } else if (result.status === 'wrong_password') {
        setFieldErrors({ currentPassword: 'Your current password is incorrect' })
      } else if (result.status === 'weak_password') {
        setFieldErrors({
          newPassword:
            'Your password must be at least 12 characters and include both letters and numbers',
        })
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <h1 className="mb-8 text-[24px] font-bold text-[#1E293B]">Account settings</h1>

      {/* ── Email address ──────────────────────────────────────────────────── */}
      <section aria-labelledby="email-heading" className="mb-8">
        <h2 id="email-heading" className="mb-4 text-[16px] font-semibold text-[#1E293B]">
          Email address
        </h2>
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <p className="text-[14px] text-[#374151]">
            <span className="font-medium">Your email address:</span> <span>{email}</span>
          </p>
        </div>
      </section>

      <hr className="mb-8 border-[#E2E8F0]" />

      {/* ── Change password ────────────────────────────────────────────────── */}
      <section aria-labelledby="password-heading" className="mb-8">
        <h2 id="password-heading" className="mb-4 text-[16px] font-semibold text-[#1E293B]">
          Change your password
        </h2>

        {/* Success message */}
        {passwordUpdated && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" aria-hidden="true" />
            <p className="text-[14px] text-[#166534]">Your password has been updated.</p>
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <p className="text-[14px] text-[#991B1B]">{serverError}</p>
          </div>
        )}

        <form noValidate onSubmit={handlePasswordSubmit}>
          {/* Current password */}
          <div className="mb-4">
            <Label
              htmlFor="currentPassword"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Current password{' '}
              <span className="text-[#DC2626]" aria-hidden="true">
                *
              </span>
            </Label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-required="true"
              aria-invalid={!!fieldErrors.currentPassword || undefined}
              aria-describedby={fieldErrors.currentPassword ? 'currentPassword-error' : undefined}
              toggleLabel="current password"
            />
            {fieldErrors.currentPassword && (
              <p
                id="currentPassword-error"
                role="alert"
                className="mt-1.5 text-[13px] text-[#DC2626]"
              >
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          {/* New password */}
          <div className="mb-4">
            <Label
              htmlFor="newPassword"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              New password{' '}
              <span className="text-[#DC2626]" aria-hidden="true">
                *
              </span>
            </Label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-required="true"
              aria-invalid={!!fieldErrors.newPassword || undefined}
              aria-describedby={fieldErrors.newPassword ? 'newPassword-error' : 'newPassword-hint'}
              toggleLabel="new password"
            />
            {fieldErrors.newPassword ? (
              <p id="newPassword-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
                {fieldErrors.newPassword}
              </p>
            ) : (
              <p id="newPassword-hint" className="mt-1.5 text-[13px] text-[#64748B]">
                At least 12 characters, including letters and numbers
              </p>
            )}
          </div>

          {/* Confirm new password */}
          <div className="mb-5">
            <Label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Confirm new password{' '}
              <span className="text-[#DC2626]" aria-hidden="true">
                *
              </span>
            </Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-required="true"
              aria-invalid={!!fieldErrors.confirmPassword || undefined}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              toggleLabel="confirm password"
            />
            {fieldErrors.confirmPassword && (
              <p
                id="confirmPassword-error"
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
            className="h-10 bg-[#0D6E6E] px-5 text-[14px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
          >
            {isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </section>

      <hr className="mb-8 border-[#E2E8F0]" />

      {/* ── Delete account ─────────────────────────────────────────────────── */}
      <section aria-labelledby="delete-heading">
        <h2 id="delete-heading" className="mb-2 text-[16px] font-semibold text-[#1E293B]">
          Delete your account
        </h2>
        <p className="mb-5 text-[14px] text-[#374151]">
          Deleting your account will permanently remove all your data, including your charity
          profile and saved applications. This cannot be undone.
        </p>
        <ContextualTooltip content="This permanently deletes your charity profile and all saved applications. This can't be undone.">
          <Button
            render={<Link href="/account/delete" />}
            className="h-10 bg-[#DC2626] px-5 text-[14px] font-semibold text-white hover:bg-[#B91C1C]"
          >
            Delete my account
          </Button>
        </ContextualTooltip>
      </section>
    </div>
  )
}
