import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { VerifyEmailResendForm } from '@/components/verify-email-resend-form'

export const metadata: Metadata = {
  title: 'Verify your email',
}

interface Props {
  searchParams: Promise<{ state?: string; email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { state, email: emailParam } = await searchParams

  // Resolve the user's email address.
  // Priority: ?email= query param (set by registerUser redirect) → session
  // (set when email confirmation is disabled, e.g. local dev) → empty string.
  let email = emailParam ?? ''
  if (!email) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    email = user?.email ?? ''
  }

  if (state === 'verified') {
    return <VerifiedState />
  }

  if (state === 'expired') {
    return <ExpiredState email={email} />
  }

  return <AwaitingState email={email} />
}

// ── State 1: Awaiting verification ──────────────────────────────────────────

function AwaitingState({ email }: { email: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F4F4]">
            <Mail className="h-8 w-8 text-[#0D6E6E]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Check your email</h1>

        <p className="mb-1 text-[15px] text-[#64748B]">We&apos;ve sent a verification link to</p>
        {email && <p className="mb-6 text-[15px] font-semibold text-[#1E293B]">{email}</p>}
        <p className="mb-8 text-[15px] text-[#64748B]">
          Click the link in the email to activate your account.
        </p>

        <VerifyEmailResendForm email={email} mode="awaiting" />

        <p className="mt-6 text-[14px] text-[#64748B]">
          Wrong email address?{' '}
          <Link
            href="/"
            className="font-medium text-[#0D6E6E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
          >
            Sign in with a different account
          </Link>
        </p>
      </div>
    </div>
  )
}

// ── State 2: Email verified ──────────────────────────────────────────────────

function VerifiedState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
            <CheckCircle className="h-8 w-8 text-[#16A34A]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Email verified</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Your account is now active. Sign in to get started.
        </p>

        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D6E6E] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

// ── State 3: Link expired or invalid ────────────────────────────────────────

function ExpiredState({ email }: { email: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
            <Clock className="h-8 w-8 text-[#D97706]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">This link has expired</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Your verification link is no longer valid. Request a new one below.
        </p>

        <VerifyEmailResendForm email={email} mode="expired" />
      </div>
    </div>
  )
}
