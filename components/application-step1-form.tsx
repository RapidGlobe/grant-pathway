'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepIndicator } from '@/components/step-indicator'
import {
  saveApplicationStep1,
  getPreviousApplicationForFunder,
  type PreviousApplicationOption,
} from '@/actions/applications'

interface FieldErrors {
  funder?: string
  grantName?: string
}

interface ApplicationStep1FormProps {
  applicationId: string
  initialFunderName?: string
  initialGrantName?: string
  /** True when the application was just created and fields are empty. */
  isNew?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApplicationStep1Form({
  applicationId,
  initialFunderName = '',
  initialGrantName = '',
  isNew = false,
}: ApplicationStep1FormProps) {
  const [funderName, setFunderName] = useState(initialFunderName)

  // Other fields
  const [grantName, setGrantName] = useState(initialGrantName)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  // P6.5 — reuse a previous application to the same funder. Checked on blur
  // (not on every keystroke) and once on mount if a funder name was already
  // saved (returning to Step 1 of an existing application). "Same funder" is
  // a soft, name-based match — see getPreviousApplicationForFunder's comment.
  const [previousApplication, setPreviousApplication] = useState<PreviousApplicationOption | null>(
    null,
  )
  const [reuseChoice, setReuseChoice] = useState<'fresh' | 'reuse'>('fresh')
  const [lastCheckedFunderName, setLastCheckedFunderName] = useState('')

  function checkPreviousApplication(name: string) {
    const trimmed = name.trim()
    if (!trimmed) {
      setPreviousApplication(null)
      setLastCheckedFunderName('')
      return
    }
    if (trimmed.toLowerCase() === lastCheckedFunderName) return

    setLastCheckedFunderName(trimmed.toLowerCase())
    getPreviousApplicationForFunder(applicationId, trimmed).then((result) => {
      setPreviousApplication(result)
      setReuseChoice('fresh')
    })
  }

  // Run the same check once on mount for an existing application that
  // already has a saved funder name (mirrors the old picker's behaviour of
  // checking as soon as a funder was known, not just on user interaction).
  useEffect(() => {
    if (initialFunderName.trim()) checkPreviousApplication(initialFunderName)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only
  }, [])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleFunderNameChange(value: string) {
    setFunderName(value)
    setFieldErrors((prev) => ({ ...prev, funder: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedFunderName = funderName.trim()
    const errors: FieldErrors = {}
    if (!trimmedFunderName) errors.funder = "Please enter the funder's name"
    if (!grantName.trim()) errors.grantName = 'Please enter the grant name'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaveError(null)
    startSaving(async () => {
      const result = await saveApplicationStep1(
        applicationId,
        trimmedFunderName,
        grantName.trim(),
        reuseChoice === 'reuse' ? previousApplication?.id : undefined,
      )
      setSaveError(result.error)
    })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={1} />

      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        {isNew ? 'Start a new application' : 'Continue your application'}
      </h1>

      <form noValidate onSubmit={handleSubmit}>
        {/* ------------------------------------------------------------------ */}
        {/* Funder name                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-5">
          <Label
            htmlFor="funderName"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Who is offering this grant?{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="funderName"
            type="text"
            placeholder="e.g. Henry Smith Charity"
            value={funderName}
            onChange={(e) => handleFunderNameChange(e.target.value)}
            onBlur={() => checkPreviousApplication(funderName)}
            aria-invalid={!!fieldErrors.funder || undefined}
            aria-describedby={fieldErrors.funder ? 'funder-error' : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.funder && (
            <p id="funder-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.funder}
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Grant name                                                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-5">
          <Label
            htmlFor="grantName"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            What is the grant called?{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="grantName"
            type="text"
            placeholder="e.g. Awards for All England"
            value={grantName}
            onChange={(e) => setGrantName(e.target.value)}
            aria-invalid={!!fieldErrors.grantName || undefined}
            aria-describedby={fieldErrors.grantName ? 'grantName-error' : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.grantName && (
            <p id="grantName-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.grantName}
            </p>
          )}
        </div>

        {/* P6.5 — Start fresh vs reuse a previous application to this funder */}
        {previousApplication && (
          <div className="mb-5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="mb-3 text-[14px] font-medium text-[#1E293B]">
              You&apos;ve applied to {funderName.trim()} before
            </p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-2 text-[13px] text-[#334155]">
                <input
                  type="radio"
                  name="reuseChoice"
                  checked={reuseChoice === 'fresh'}
                  onChange={() => setReuseChoice('fresh')}
                  className="mt-0.5"
                />
                <span>Start fresh — upload guidelines and let the AI read them again</span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-[13px] text-[#334155]">
                <input
                  type="radio"
                  name="reuseChoice"
                  checked={reuseChoice === 'reuse'}
                  onChange={() => setReuseChoice('reuse')}
                  className="mt-0.5"
                />
                <span>
                  Start from your last application to {funderName.trim()} (
                  {previousApplication.grantName}, updated{' '}
                  {new Date(previousApplication.updatedAt).toLocaleDateString('en-GB')}) — carries
                  across the questions and your previous answers for you to review
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Server-side save error */}
        {saveError && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]"
          >
            {saveError}
          </p>
        )}

        {/* Cancel + Continue */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-70"
          >
            {isSaving ? 'Saving…' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}
