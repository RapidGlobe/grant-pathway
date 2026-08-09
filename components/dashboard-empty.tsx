'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { Upload, Sparkles, FileText, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { createApplication } from '@/actions/applications'
import { helpCentreUrl } from '@/lib/help-centre'

interface DashboardEmptyProps {
  firstName?: string
  profileIncomplete?: boolean
}

export function DashboardEmpty({
  firstName = 'Sarah',
  profileIncomplete = true,
}: DashboardEmptyProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 py-10">
      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        Welcome to Grant Pathway, {firstName}
      </h1>

      {/* Charity profile incomplete banner */}
      {profileIncomplete && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border-[1.5px] border-[#FDE68A] bg-[#FEF3C7] px-5 py-[14px]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
            <p className="text-[14px] font-medium text-[#92400E]">
              Your charity profile isn&apos;t complete yet. You&apos;ll need to fill it in before
              you can start an application.
            </p>
          </div>
          <Link
            href="/profile"
            className="flex-shrink-0 rounded-md bg-[#B45309] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#92400E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            Complete your profile
          </Link>
        </div>
      )}

      {/* Empty state card */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
        <p className="mb-8 text-[15px] text-[#64748B]">You don&apos;t have any applications yet.</p>

        {/* Start button — disabled with tooltip when profile incomplete */}
        {profileIncomplete ? (
          <Tooltip>
            <TooltipTrigger
              tabIndex={0}
              className="inline-flex cursor-not-allowed"
              render={<span />}
            >
              <Button
                disabled
                className="pointer-events-none h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white opacity-50"
              >
                Start your first application
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Please set up your charity profile first</TooltipContent>
          </Tooltip>
        ) : (
          // Form + Server Action so the creation URL is never added to browser
          // history — pressing Back from Step 1 returns to the dashboard, not
          // to /applications/new (which would create another empty record).
          <form action={createApplication}>
            <StartButton label="Start your first application" />
          </form>
        )}

        {/* Three-step explainer */}
        <div className="mt-12 flex items-start justify-center gap-3">
          <Step
            icon={<Upload className="h-5 w-5 text-[#0D6E6E]" />}
            label="Add funder guidelines"
            step="1"
          />
          <ArrowRight className="mt-5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" aria-hidden="true" />
          <Step
            icon={<Sparkles className="h-5 w-5 text-[#0D6E6E]" />}
            label="Get an AI summary"
            step="2"
          />
          <ArrowRight className="mt-5 h-4 w-4 flex-shrink-0 text-[#CBD5E1]" aria-hidden="true" />
          <Step
            icon={<FileText className="h-5 w-5 text-[#0D6E6E]" />}
            label="Write your answers"
            step="3"
          />
        </div>

        <p className="mt-8 text-[13px] text-[#64748B]">
          Need a hand? Visit our{' '}
          <a
            href={helpCentreUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0D6E6E] underline-offset-2 hover:underline"
          >
            help centre
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          for step-by-step guides to every part of Grant Pathway.
        </p>
      </div>
    </div>
  )
}

/**
 * Submit button that reads pending state from the nearest <form>.
 * useFormStatus must be called inside a component that is a child of the form.
 */
function StartButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center rounded-md bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? 'Creating…' : label}
    </button>
  )
}

function Step({ icon, label, step }: { icon: React.ReactNode; label: string; step: string }) {
  return (
    <div className="flex w-36 flex-col items-center gap-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F4F4]">
        {icon}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
        Step {step}
      </span>
      <span className="text-[13px] font-medium text-[#1E293B]">{label}</span>
    </div>
  )
}
