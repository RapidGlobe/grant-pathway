'use client'

import { useActionState, useEffect, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { confirmEmail, type ConfirmEmailState } from '@/actions/auth'
import { VerifyEmailResendForm } from '@/components/verify-email-resend-form'

interface Props {
  code: string | null
  tokenHash: string | null
  type: string | null
}

const INITIAL_STATE: ConfirmEmailState = { error: null }

export function ConfirmEmailForm({ code, tokenHash, type }: Props) {
  const [state, action] = useActionState(confirmEmail, INITIAL_STATE)
  const formRef = useRef<HTMLFormElement>(null)

  // D-012 follow-up: submit automatically the instant this loads in a real
  // browser -- no visible button, since we don't expect (or want) a real
  // person to interact with this step at all. Gmail's own link scanning
  // fetches the raw page over HTTP and does not execute JavaScript, so this
  // stays safe against the exact behaviour that caused D-012, while a real
  // person just sees a brief "Confirming..." spinner before landing on the
  // verified screen.
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
          <p className="text-[0.875rem] text-[#991B1B]">
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
      <div role="status" className="flex items-center justify-center gap-2 text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-[0.875rem]">Confirming…</span>
      </div>
    </form>
  )
}
