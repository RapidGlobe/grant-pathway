'use client'

import { useActionState, useEffect, useRef } from 'react'
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
  const formRef = useRef<HTMLFormElement>(null)

  // D-012 follow-up: submit automatically the instant this loads in a real
  // browser, rather than waiting for a manual click. Gmail's own link
  // scanning fetches the raw page over HTTP and does not execute
  // JavaScript, so this stays safe against the exact behaviour that caused
  // D-012 -- but a real person now gets a single-click experience (click the
  // email link, land here, confirmation completes immediately) instead of
  // being asked to click twice. The button remains as a fallback in case JS
  // is disabled or this effect doesn't fire.
  useEffect(() => {
    formRef.current?.requestSubmit()
  }, [])

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
    <form ref={formRef} action={action}>
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
