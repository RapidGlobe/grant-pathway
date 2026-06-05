'use client'

import { useActionState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resendVerificationEmail, type ResendState } from '@/actions/auth'

interface Props {
  /** Known email address — pre-fills the input / hidden field. */
  email: string
  /**
   * "awaiting" — email is displayed as text above; use a hidden input +
   *              outline button.
   * "expired"  — show a labelled email input (user can correct it) +
   *              primary button.
   */
  mode: 'awaiting' | 'expired'
}

const INITIAL_STATE: ResendState = { status: 'idle' }

export function VerifyEmailResendForm({ email, mode }: Props) {
  const [state, action, isPending] = useActionState(resendVerificationEmail, INITIAL_STATE)

  // ── Success ───────────────────────────────────────────────────────────────
  if (state.status === 'sent') {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-left"
      >
        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16A34A]" aria-hidden="true" />
        <p className="text-[14px] text-[#166534]">Verification email sent — check your inbox.</p>
      </div>
    )
  }

  return (
    <form action={action}>
      {/* Email field — hidden in awaiting mode when email is known; visible
          in expired mode OR when email is unknown (e.g. user navigated
          directly to /verify-email without the ?email= query param). */}
      {mode === 'awaiting' && email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <div className="mb-4 text-left">
          <Label
            htmlFor="resend-email"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Email address
          </Label>
          <Input
            id="resend-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={email}
            placeholder="you@example.com"
            className="h-10 text-[14px]"
          />
        </div>
      )}

      {/* Rate-limited warning */}
      {state.status === 'rate_limited' && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4 text-left"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D97706]" aria-hidden="true" />
          <p className="text-[14px] text-[#92400E]">
            You&apos;ve reached the limit of 3 verification emails per hour. Please try again later.
          </p>
        </div>
      )}

      {/* Generic error */}
      {(state.status === 'error' || state.status === 'missing_email') && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-left"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[14px] text-[#991B1B]">
            {state.status === 'missing_email'
              ? 'Please enter your email address.'
              : 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        variant={mode === 'awaiting' ? 'outline' : 'default'}
        className={
          mode === 'awaiting'
            ? 'h-10 w-full border-[#0D6E6E] text-[14px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4] disabled:opacity-60'
            : 'h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60'
        }
      >
        {isPending
          ? 'Sending…'
          : mode === 'awaiting'
            ? 'Resend verification email'
            : 'Send a new verification email'}
      </Button>
    </form>
  )
}
