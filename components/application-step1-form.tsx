'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepIndicator } from '@/components/step-indicator'
import { saveApplicationStep1, type FunderOption } from '@/actions/applications'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REQUEST_FUNDER_EMAIL = 'wjokhia@rapidglobe.com'
const REQUEST_FUNDER_SUBJECT = 'Funder request — Grant Pathway'

interface FieldErrors {
  funder?: string
  grantName?: string
}

interface ApplicationStep1FormProps {
  applicationId: string
  funders: FunderOption[]
  initialFunderId?: string
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
  funders,
  initialFunderId = '',
  initialFunderName = '',
  initialGrantName = '',
  isNew = false,
}: ApplicationStep1FormProps) {
  // Picker state
  const [searchQuery, setSearchQuery] = useState(initialFunderName)
  const [selectedFunder, setSelectedFunder] = useState<FunderOption | null>(
    initialFunderId ? (funders.find((f) => f.id === initialFunderId) ?? null) : null,
  )
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Other fields
  const [grantName, setGrantName] = useState(initialGrantName)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  // ---------------------------------------------------------------------------
  // Filtered list
  // ---------------------------------------------------------------------------

  const filteredFunders = funders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // ---------------------------------------------------------------------------
  // Close dropdown on outside click
  // ---------------------------------------------------------------------------

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        // If user typed but didn't select, revert display to selected name
        if (selectedFunder) setSearchQuery(selectedFunder.name)
        else setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedFunder])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleFunderSelect(funder: FunderOption) {
    setSelectedFunder(funder)
    setSearchQuery(funder.name)
    setIsOpen(false)
    setFieldErrors((prev) => ({ ...prev, funder: undefined }))
  }

  function handleClearFunder() {
    setSelectedFunder(null)
    setSearchQuery('')
    setIsOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errors: FieldErrors = {}
    if (!selectedFunder) errors.funder = 'Please select a funder from the list'
    if (!grantName.trim()) errors.grantName = 'Please enter the grant name'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaveError(null)
    startSaving(async () => {
      const result = await saveApplicationStep1(
        applicationId,
        selectedFunder!.id,
        selectedFunder!.name,
        grantName.trim(),
      )
      setSaveError(result.error)
    })
  }

  // ---------------------------------------------------------------------------
  // Request funder mailto href
  // ---------------------------------------------------------------------------

  const requestHref = `mailto:${REQUEST_FUNDER_EMAIL}?subject=${encodeURIComponent(REQUEST_FUNDER_SUBJECT)}&body=${encodeURIComponent(
    `Hi,\n\nI'd like to request the following funder be added to Grant Pathway:\n\nFunder name: \nGuidelines URL: \n\nThanks`,
  )}`

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
        {/* Funder picker                                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-5" ref={pickerRef}>
          <Label
            htmlFor="funderSearch"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Who is offering this grant?{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>

          {/* Input wrapper */}
          <div className="relative">
            <Input
              id="funderSearch"
              type="text"
              autoComplete="off"
              placeholder="Search for a funder…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedFunder(null)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              aria-invalid={!!fieldErrors.funder || undefined}
              aria-describedby={fieldErrors.funder ? 'funder-error' : 'funder-hint'}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              role="combobox"
              className="h-10 pr-16 text-[14px]"
            />

            {/* Clear button — shown when a funder is selected */}
            {selectedFunder && (
              <button
                type="button"
                onClick={handleClearFunder}
                aria-label="Clear selected funder"
                className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-[#94A3B8] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E]"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Chevron */}
            <ChevronDown
              className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />

            {/* Dropdown */}
            {isOpen && (
              <ul
                role="listbox"
                aria-label="Available funders"
                className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg"
              >
                {filteredFunders.length > 0 ? (
                  filteredFunders.map((funder) => (
                    <li
                      key={funder.id}
                      role="option"
                      aria-selected={selectedFunder?.id === funder.id}
                      onMouseDown={(e) => {
                        e.preventDefault() // prevent blur before click
                        handleFunderSelect(funder)
                      }}
                      className={`flex cursor-pointer items-center px-3 py-2 text-[14px] hover:bg-[#F0FAFA] ${
                        selectedFunder?.id === funder.id
                          ? 'bg-[#F0FAFA] font-medium text-[#0D6E6E]'
                          : 'text-[#1E293B]'
                      }`}
                    >
                      <span>{funder.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-[13px] text-[#64748B]">
                    No funders match your search
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Validation error */}
          {fieldErrors.funder && (
            <p id="funder-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.funder}
            </p>
          )}

          {/* P5.FD5 — Request a funder escape hatch */}
          <p id="funder-hint" className="mt-2 text-[13px] text-[#64748B]">
            Can&apos;t find your funder?{' '}
            <a
              href={requestHref}
              className="font-medium text-[#0D6E6E] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E] focus-visible:ring-offset-1"
            >
              Request it to be added
            </a>{' '}
            — we&apos;ll review and add it as soon as possible.
          </p>
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
