'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset, type PasswordResetRequestState } from '@/actions/auth'

interface FieldErrors {
  email?: string
}

const INITIAL_STATE: PasswordResetRequestState = { status: 'idle' }

export function ForgotPasswordRequestForm() {
  const [state, action, isPending] = useActionState(requestPasswordReset, INITIAL_STATE)

  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors: FieldErrors = {}

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault()
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
  }

  // Success state — shown after the Server Action returns { status: 'sent' }.
  // Same message for registered and unregistered emails (AC-FR-05-01/02).
  if (state.status === 'sent') {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F4F4]">
            <Mail className="h-8 w-8 text-[#0D6E6E]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-4 text-[22px] font-bold text-[#1E293B]">Check your email</h1>

        <p className="text-[15px] text-[#64748B]">
          If an account exists for that email address, you&apos;ll receive a reset link shortly.
          Check your spam folder if it doesn&apos;t arrive within a few minutes.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Reset your password</h1>

      <p className="mb-8 text-[15px] text-[#64748B]">
        Enter the email address for your account and we&apos;ll send you a reset link.
      </p>

      <form noValidate action={action} onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label
            htmlFor="reset-email"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Email address{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={!!fieldErrors.email || undefined}
            aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.email && (
            <p id="reset-email-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-[#64748B]">
        Remembered your password?{' '}
        <Link href="/" className="font-medium text-[#0D6E6E] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
