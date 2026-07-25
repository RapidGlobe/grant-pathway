'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, CheckCircle, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { lookupCharity, saveCharityProfile, type CharityProfileData } from '@/actions/charity'
import { ContextualTooltip } from '@/components/contextual-tooltip'

type LookupState = null | 'match' | 'no-match' | 'unavailable'

interface FieldErrors {
  charityName?: string
  whatDoes?: string
  whoHelps?: string
  whereWorks?: string
}

interface CharityProfileFormProps {
  /**
   * Existing profile data passed from the server — pre-fills all fields (S1.3).
   * Null/undefined when the user is setting up their profile for the first time.
   */
  initialData?: CharityProfileData | null
  /** Derived from initialData in the page — true when an existing profile was found. */
  isEdit?: boolean
}

export function CharityProfileForm({ initialData, isEdit = false }: CharityProfileFormProps) {
  const router = useRouter()
  const [lookupQuery, setLookupQuery] = useState('')
  const [lookupResult, setLookupResult] = useState<LookupState>(null)
  const [isLookingUp, startLookup] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)

  // Controlled field values — pre-filled from initialData when editing (S1.3),
  // or pre-filled by the Charity Commission lookup on match (S1.1).
  const [charityName, setCharityName] = useState(initialData?.charityName ?? '')
  const [regNumber, setRegNumber] = useState(initialData?.registrationNumber ?? '')
  const [whatDoes, setWhatDoes] = useState(initialData?.whatDoes ?? '')
  const [whoHelps, setWhoHelps] = useState(initialData?.whoHelps ?? '')
  const [whereWorks, setWhereWorks] = useState(initialData?.whereWorks ?? '')

  /**
   * True when Bedrock successfully paraphrased the charitable objects on
   * the most recent lookup. Drives the AI-generated-content review banner
   * and condensed hint text on whatDoes / whoHelps (S1.1 CHANGELOG 2026-05-18).
   */
  const [paraphrasedFromLookup, setParaphrasedFromLookup] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saved, setSaved] = useState(false)

  // ── Charity Commission lookup ──────────────────────────────────────────────

  function handleLookup() {
    if (!lookupQuery.trim()) return
    // Reset paraphrase flag on every new lookup attempt
    setParaphrasedFromLookup(false)
    startLookup(async () => {
      const result = await lookupCharity(lookupQuery.trim())
      if (result.ok) {
        setLookupResult('match')
        // Pre-fill name and registration number (AC-FR-10-01).
        // Fields remain editable — the user can correct anything before saving.
        setCharityName(result.charityName)
        setRegNumber(result.registrationNumber)
        // Pre-fill AI-paraphrased descriptions when Bedrock returns content (S1.1).
        // Only set if non-empty so a partial Bedrock failure does not clear existing input.
        if (result.whatDoes) setWhatDoes(result.whatDoes)
        if (result.whoHelps) setWhoHelps(result.whoHelps)
        if (result.whatDoes || result.whoHelps) setParaphrasedFromLookup(true)
      } else if (result.reason === 'not_found') {
        setLookupResult('no-match')
      } else {
        setLookupResult('unavailable')
      }
    })
  }

  function handleLookupKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLookup()
    }
  }

  // ── Form submission ────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Client-side validation
    const errors: FieldErrors = {}
    if (!charityName.trim()) errors.charityName = 'Please enter your charity name'
    if (!whatDoes.trim()) errors.whatDoes = 'Please tell us what your charity does'
    if (!whoHelps.trim()) errors.whoHelps = 'Please tell us who your charity helps'
    if (!whereWorks.trim()) errors.whereWorks = 'Please tell us where your charity works'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaveError(null)
    startSaving(async () => {
      const result = await saveCharityProfile({
        charityName: charityName.trim(),
        registrationNumber: regNumber.trim() || undefined,
        whatDoes: whatDoes.trim(),
        whoHelps: whoHelps.trim(),
        whereWorks: whereWorks.trim(),
        paraphrasedFromLookup,
      })
      if (result.ok) {
        if (isEdit) {
          router.push('/dashboard')
        } else {
          setSaved(true)
        }
      } else {
        setSaveError(result.error)
      }
    })
  }

  // ── First-time save success screen ────────────────────────────────────────

  if (saved && !isEdit) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#16A34A]" aria-hidden="true" />
          <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Profile saved</h1>
          <p className="mb-6 text-[15px] text-[#374151]">
            Your charity profile has been saved. You&apos;re ready to start your first application.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-md bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            Go to my dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        {isEdit ? 'Your charity profile' : 'Set up your charity profile'}
      </h1>

      {/* ── Charity Commission lookup ────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#EDE8E1] bg-[#FDF9F5] p-5">
        <p className="mb-3 text-[14px] font-medium text-[#1E293B]">
          Find your charity on the Charity Commission register
        </p>
        <div className="flex gap-2">
          <ContextualTooltip
            side="bottom"
            content="Search by name or registration number — most UK charities are found automatically from the Charity Commission database."
          >
            <Input
              id="charity-lookup"
              type="search"
              placeholder="Search by charity name or registration number"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              onKeyDown={handleLookupKeyDown}
              aria-label="Search by charity name or registration number"
              className="h-10 flex-1 text-[14px]"
              disabled={isLookingUp}
            />
          </ContextualTooltip>
          <Button
            type="button"
            onClick={handleLookup}
            disabled={isLookingUp || !lookupQuery.trim()}
            className="h-10 shrink-0 bg-[#0D6E6E] px-4 text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
          >
            <Search className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {isLookingUp ? 'Searching…' : 'Look up charity'}
          </Button>
        </div>

        {/* Match found (AC-FR-10-01) */}
        {lookupResult === 'match' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
            <p className="text-[13px] text-[#065F46]">
              Details retrieved from the Charity Commission register. You can edit these fields
              before saving.
            </p>
          </div>
        )}

        {/* AI-generated descriptions banner (S1.1 — shown when Bedrock paraphrase succeeded) */}
        {lookupResult === 'match' && paraphrasedFromLookup && (
          <div
            role="note"
            className="mt-2 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
            <p className="text-[13px] text-[#78350F]">
              The descriptions below were drafted by AI from your Charity Commission entry. Please
              review and personalise them before saving.
            </p>
          </div>
        )}

        {/* No match (AC-FR-10-02) */}
        {lookupResult === 'no-match' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
            <p className="text-[13px] text-[#78350F]">
              We couldn&apos;t find that charity. Please enter your details manually.
            </p>
          </div>
        )}

        {/* API unavailable (AC-FR-11-01) */}
        {lookupResult === 'unavailable' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
            <p className="text-[13px] text-[#78350F]">
              We couldn&apos;t reach the Charity Commission right now. You can try again using the{' '}
              <span className="font-semibold">Look up charity</span> button above, or fill in your
              details manually in the fields below.
            </p>
          </div>
        )}
      </div>

      {/* ── Profile fields (AC-FR-11-02: always editable without lookup) ─── */}
      <form noValidate onSubmit={handleSubmit}>
        {/* Charity name */}
        <div className="mb-5">
          <Label
            htmlFor="charityName"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Charity name{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="charityName"
            type="text"
            autoComplete="organization"
            value={charityName}
            onChange={(e) => setCharityName(e.target.value)}
            aria-invalid={!!fieldErrors.charityName || undefined}
            aria-describedby={fieldErrors.charityName ? 'charityName-error' : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.charityName && (
            <p id="charityName-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.charityName}
            </p>
          )}
        </div>

        {/* Charity registration number */}
        <div className="mb-5">
          <Label
            htmlFor="regNumber"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Charity registration number{' '}
            <span className="text-[14px] font-normal text-[#64748B]">(optional)</span>
          </Label>
          <Input
            id="regNumber"
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="h-10 text-[14px]"
          />
        </div>

        {/* What does your charity do? */}
        <div className="mb-5">
          <Label htmlFor="whatDoes" className="mb-1 block text-[14px] font-medium text-[#1E293B]">
            What does your charity do?{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <p id="whatDoes-hint" className="mb-1.5 text-[13px] text-[#64748B]">
            {paraphrasedFromLookup
              ? 'Drafted from your Charity Commission entry — edit to personalise.'
              : 'Your Charity Commission entry (see the lookup above) lists your charitable objects — this is a good starting point. Your website’s ‘About us’ page is another useful source.'}
          </p>
          <Textarea
            id="whatDoes"
            value={whatDoes}
            onChange={(e) => setWhatDoes(e.target.value)}
            rows={3}
            aria-invalid={!!fieldErrors.whatDoes || undefined}
            aria-describedby={
              ['whatDoes-hint', fieldErrors.whatDoes ? 'whatDoes-error' : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            className="text-[14px]"
          />
          {fieldErrors.whatDoes && (
            <p id="whatDoes-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.whatDoes}
            </p>
          )}
        </div>

        {/* Who does your charity help? */}
        <div className="mb-5">
          <Label htmlFor="whoHelps" className="mb-1 block text-[14px] font-medium text-[#1E293B]">
            Who does your charity help?{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <p id="whoHelps-hint" className="mb-1.5 text-[13px] text-[#64748B]">
            {paraphrasedFromLookup
              ? 'Drafted from your Charity Commission entry — edit to personalise.'
              : 'Think about the people your charity serves — their age, background, or circumstances. Your Charity Commission entry may also describe your beneficiaries.'}
          </p>
          <Textarea
            id="whoHelps"
            value={whoHelps}
            onChange={(e) => setWhoHelps(e.target.value)}
            rows={3}
            aria-invalid={!!fieldErrors.whoHelps || undefined}
            aria-describedby={
              ['whoHelps-hint', fieldErrors.whoHelps ? 'whoHelps-error' : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            className="text-[14px]"
          />
          {fieldErrors.whoHelps && (
            <p id="whoHelps-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.whoHelps}
            </p>
          )}
        </div>

        {/* Where do you work? */}
        <div className="mb-8">
          <Label htmlFor="whereWorks" className="mb-1 block text-[14px] font-medium text-[#1E293B]">
            Where do you work?{' '}
            <span className="text-[#DC2626]" aria-hidden="true">
              *
            </span>
          </Label>
          <p id="whereWorks-hint" className="mb-1.5 text-[13px] text-[#64748B]">
            Enter a town, county, or region — for example, &lsquo;Leeds&rsquo; or &lsquo;South
            Yorkshire&rsquo;. If you work across the whole country, enter &lsquo;National&rsquo;. If
            you&apos;re not sure, use the town or city where your charity is based.
          </p>
          <Input
            id="whereWorks"
            type="text"
            value={whereWorks}
            onChange={(e) => setWhereWorks(e.target.value)}
            aria-invalid={!!fieldErrors.whereWorks || undefined}
            aria-describedby={
              ['whereWorks-hint', fieldErrors.whereWorks ? 'whereWorks-error' : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            className="h-10 text-[14px]"
          />
          {fieldErrors.whereWorks && (
            <p id="whereWorks-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.whereWorks}
            </p>
          )}
        </div>

        {saveError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]"
              aria-hidden="true"
            />
            <p className="text-[14px] text-[#991B1B]">{saveError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSaving}
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Save profile'}
        </Button>
      </form>
    </div>
  )
}
