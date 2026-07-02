'use client'

import { useActionState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmEmail, type ConfirmEmailState } from '@/actions/auth'
import { VerifyEmailResendForm } from '@/components/verify-email-resend-form'

interface Props {
  code: string | null
  tokenHash: string | null
  type: string | null
}

const INITIAL_STATE: ConfirmEmailState = { error: null }

export function ConfirmEmailForm({ code, tokenHash, type }: Props) {
  const [state, action, isPending] = useActionState(confirmEmail, INITIAL_STATE)

  if (state.error === 'invalid') {
    return (
      <div className="text-left">
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[14px] text-[#991B1B]">
            We couldn&apos;t confirm your email with this link. It may have already been used, or
            it&apos;s no longer valid. If you&apos;ve already verified, try signing in below —
            otherwise, request a new link.
          </p>
        </div>
        <VerifyEmailResendForm email="" mode="expired" />
      </div>
    )
  }

  return (
    <form action={action}>
      {code && <input type="hidden" name="code" value={code} />}
      {tokenHash && <input type="hidden" name="token_hash" value={tokenHash} />}
      {type && <input type="hidden" name="type" value={type} />}
      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
      >
        {isPending ? 'Confirming…' : 'Confirm my email address'}
      </Button>
    </form>
  )
}
