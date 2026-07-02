import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ConfirmEmailForm } from '@/components/confirm-email-form'

export const metadata: Metadata = {
  title: 'Confirm your email',
}

interface Props {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>
}

// D-012: reached from /auth/callback, which no longer completes verification
// on page load (Gmail's own link scanning was silently consuming the
// single-use link before the real user ever clicked it). This page requires
// an explicit button click — see components/confirm-email-form.tsx and
// actions/auth.ts's confirmEmail(). See CHANGELOG.md, 2026-07-02, D-012.
export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { code, token_hash: tokenHash, type } = await searchParams

  if (!code && !(tokenHash && type)) {
    redirect('/verify-email?state=expired')
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F4F4]">
            <Mail className="h-8 w-8 text-[#0D6E6E]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Confirm your email address</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Click the button below to finish verifying your email and activate your account.
        </p>

        <ConfirmEmailForm code={code ?? null} tokenHash={tokenHash ?? null} type={type ?? null} />
      </div>
    </div>
  )
}
