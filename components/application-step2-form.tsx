'use client'

// Step 2 — Upload Guidelines (S4.1, S4.2, S4.3)
//
// Upload path (S4.1):
//   1. Client-side format/size validation (instant feedback)
//   2. POST /api/upload/signed-url  → { signedUrl, path }
//   3. XHR PUT to Supabase Storage  (real progress bar 0–100%)
//   4. POST /api/upload/process     → { text, isLargeDocument }
//   5. setGuidelines(applicationId, text) into sessionStorage
//
// Paste path (S4.2):
//   1. User types/pastes into textarea
//   2. On Continue: setGuidelines(applicationId, pasteText)
//
// Session restore (ADR-FILE-004):
//   On mount, getGuidelines() checks sessionStorage. If an entry exists
//   (user is returning from a later step), the form shows "Guidelines loaded"
//   so they can continue without re-uploading. Clicking "Remove" clears it.
//
// Re-upload advisory (GAP-19):
//   When current_step >= 3 and sessionStorage has no entry, a note prompts
//   the user to re-upload (guidelines are not persisted to the database).
//
// Continue (S4.1 / S4.2):
//   Calls advanceToStep3() Server Action → sets status=in_progress,
//   current_step=3, redirects to Step 3.

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Upload, FileText, X, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StepIndicator } from '@/components/step-indicator'
import { advanceToStep3 } from '@/actions/applications'
import {
  setGuidelines,
  getGuidelines,
  clearGuidelines,
  setGuidelinesFilename,
} from '@/lib/guidelines-session'

type UploadState = 'idle' | 'uploading' | 'processing' | 'uploaded'
type UploadError = 'format' | 'size' | 'scanned' | 'server' | null

interface ApplicationStep2FormProps {
  applicationId: string
  funderName: string
  grantName: string
  /** Current step from the database — used to show re-upload advisory (GAP-19) */
  currentStep: number
  initialError?: UploadError
  showLargeWarning?: boolean
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

const UPLOAD_ERROR_MESSAGES: Record<Exclude<UploadError, null>, string> = {
  format:
    "We can only accept PDF or Word (.docx) files. Check the funder's website for a version in one of these formats. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below.",
  size: 'Your file is over 10MB. Some funders publish a shorter summary version of their guidelines — check their website first. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below.',
  scanned:
    "We couldn't read the text in your PDF — it looks like a scanned document rather than a digital one. Some funders also publish a Word version of their guidelines — check their website. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below.",
  server:
    'Something went wrong while processing your document. Please try again, or paste the guidelines text directly.',
}

export function ApplicationStep2Form({
  applicationId,
  funderName,
  grantName,
  currentStep,
  initialError = null,
  showLargeWarning = false,
}: ApplicationStep2FormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<UploadError>(initialError)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [largeWarning, setLargeWarning] = useState(showLargeWarning)
  const [pasteText, setPasteText] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [continueError, setContinueError] = useState<string | null>(null)
  const [isContinuing, startContinuing] = useTransition()

  // sessionStorage restore (ADR-FILE-004):
  // Check on mount for previously extracted text from this session.
  // Runs client-side only (sessionStorage is not available server-side).
  const [guidelinesRestored, setGuidelinesRestored] = useState(false)

  useEffect(() => {
    const stored = getGuidelines(applicationId)
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading sessionStorage; can only run client-side in useEffect
      setGuidelinesRestored(true)
    }
  }, [applicationId])

  // Whether the user has usable guidelines ready to continue
  const hasContent = uploadState === 'uploaded' || pasteText.trim().length > 0 || guidelinesRestored

  // ── File validation (client-side, instant) ──────────────────────────────

  function validateFileClient(file: File): UploadError {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) return 'format'
    if (file.size > MAX_FILE_BYTES) return 'size'
    return null
  }

  // ── Upload flow (S4.1) ───────────────────────────────────────────────────

  async function processFile(file: File) {
    // Client-side validation first — avoids a round-trip for obvious errors
    const clientError = validateFileClient(file)
    if (clientError) {
      setUploadError(clientError)
      return
    }

    // If sessionStorage had a previous entry, dismiss the "restored" state
    setGuidelinesRestored(false)
    setUploadError(null)
    setUploadedFileName(file.name)
    setUploadProgress(0)
    setUploadState('uploading')

    try {
      // Step 1: Get signed upload URL
      const signedUrlRes = await fetch('/api/upload/signed-url', { method: 'POST' })
      if (!signedUrlRes.ok) throw new Error('signed_url_failed')
      const { signedUrl, path } = (await signedUrlRes.json()) as {
        signedUrl: string
        path: string
      }

      // Step 2: Upload directly to Supabase Storage with XHR for progress tracking
      await uploadWithProgress(file, signedUrl, (pct) => setUploadProgress(pct))

      // Step 3: Extract text from the uploaded file
      setUploadState('processing')

      const processRes = await fetch('/api/upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, applicationId }),
      })

      const processData = (await processRes.json()) as {
        text?: string
        isLargeDocument?: boolean
        error?: string
      }

      if (!processRes.ok || !processData.text) {
        const err = processData.error ?? 'server'
        // Map server-side validation errors to client-side UploadError types
        if (err === 'scanned_pdf') {
          setUploadError('scanned')
        } else if (err === 'invalid_type') {
          setUploadError('format')
        } else if (err === 'too_large') {
          setUploadError('size')
        } else {
          setUploadError('server')
        }
        setUploadState('idle')
        return
      }

      // Step 4: Store extracted text in sessionStorage (ADR-FILE-004)
      setGuidelines(applicationId, processData.text)
      setGuidelinesFilename(applicationId, file.name)

      if (processData.isLargeDocument) {
        setLargeWarning(true)
      }

      setUploadState('uploaded')
    } catch {
      setUploadError('server')
      setUploadState('idle')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleRemove() {
    clearGuidelines(applicationId)
    setGuidelinesRestored(false)
    setUploadState('idle')
    setUploadError(null)
    setUploadedFileName(null)
    setUploadProgress(0)
    setLargeWarning(false)
  }

  // ── Continue (S4.1 / S4.2) ──────────────────────────────────────────────

  function handleContinue() {
    // For the paste path: store the text in sessionStorage before advancing
    if (pasteText.trim() && uploadState !== 'uploaded' && !guidelinesRestored) {
      setGuidelines(applicationId, pasteText.trim())
      setGuidelinesFilename(applicationId, 'Pasted text')
    }

    setContinueError(null)
    startContinuing(async () => {
      // On success, advanceToStep3 calls redirect() and never returns.
      // Only reaches the next line on a DB error.
      const result = await advanceToStep3(applicationId)
      setContinueError(result.error)
    })
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={2} />

      <h1 className="mb-1 text-[24px] font-bold text-[#1E293B]">
        Add the funder&apos;s guidelines
      </h1>
      <p className="mb-1 text-[14px] font-medium text-[#0D6E6E]">
        {funderName}
        {grantName && grantName !== funderName && (
          <span className="font-normal text-[#64748B]"> &middot; {grantName}</span>
        )}
      </p>
      <p className="mb-6 text-[15px] text-[#64748B]">
        Upload the funder&apos;s guidelines document, or paste the text directly below.
      </p>

      {/* Re-upload advisory (GAP-19) — shown when returning to Step 2 after
          advancing past it and sessionStorage no longer has an entry */}
      {currentStep >= 3 && !guidelinesRestored && uploadState === 'idle' && !uploadError && (
        <div
          role="note"
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-4"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
          <p className="text-[13px] text-[#1E40AF]">
            Your guidelines are not saved between sessions — please upload or paste them again to
            continue.
          </p>
        </div>
      )}

      {/* ── File upload area ── */}
      <div className="mb-4">
        {/* Idle — dropzone */}
        {uploadState === 'idle' && !uploadError && !guidelinesRestored && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file — click to browse or drag and drop"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2 ${
              isDragOver
                ? 'border-[#0D6E6E] bg-[#E6F4F4]'
                : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0D6E6E] hover:bg-[#F0F9F9]'
            }`}
          >
            <Upload
              className={`h-8 w-8 ${isDragOver ? 'text-[#0D6E6E]' : 'text-[#94A3B8]'}`}
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="text-[14px] font-medium text-[#1E293B]">
                Drag and drop your document here, or{' '}
                <span className="text-[#0D6E6E] underline">click to browse</span>
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">PDF or Word (.docx) · max 10MB</p>
            </div>
          </div>
        )}

        {/* Uploading — real XHR progress bar */}
        {uploadState === 'uploading' && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <FileText className="h-5 w-5 shrink-0 text-[#64748B]" aria-hidden="true" />
              <span className="truncate text-[14px] text-[#1E293B]">{uploadedFileName}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#0D6E6E] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(uploadProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#64748B]">Uploading…</p>
          </div>
        )}

        {/* Processing — extraction in progress */}
        {uploadState === 'processing' && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <FileText className="h-5 w-5 shrink-0 text-[#64748B]" aria-hidden="true" />
              <span className="truncate text-[14px] text-[#1E293B]">{uploadedFileName}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              {/* Indeterminate animation while server extracts text */}
              <div
                className="h-full animate-pulse rounded-full bg-[#0D6E6E]"
                style={{ width: '100%' }}
                role="progressbar"
                aria-label="Processing document"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#64748B]">Processing document…</p>
          </div>
        )}

        {/* Uploaded — success */}
        {uploadState === 'uploaded' && (
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
            <FileText className="h-5 w-5 shrink-0 text-[#0D6E6E]" aria-hidden="true" />
            <span className="flex-1 truncate text-[14px] text-[#1E293B]">{uploadedFileName}</span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove ${uploadedFileName}`}
              className="rounded text-[#64748B] transition-colors hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Session restored — guidelines loaded from this session */}
        {guidelinesRestored && uploadState === 'idle' && !uploadError && (
          <div className="flex items-center gap-3 rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] p-4">
            <FileText className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
            <span className="flex-1 text-[14px] text-[#15803D]">
              Guidelines loaded from this session
            </span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove guidelines and upload a different document"
              className="rounded text-[#64748B] transition-colors hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div>
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <p className="text-[14px] text-[#991B1B]">{UPLOAD_ERROR_MESSAGES[uploadError]}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 rounded text-[13px] text-[#64748B] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              Try a different file
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Large document warning */}
      {largeWarning && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
          <p className="text-[13px] text-[#78350F]">
            Your guidelines document is quite long. For the best results, we recommend uploading
            only the core sections — such as eligibility criteria, application questions, and
            assessment criteria. Very long documents may reduce the quality of your AI summary.
          </p>
        </div>
      )}

      {/* Paste text area */}
      <div className="mb-8">
        <Label htmlFor="pasteText" className="mb-1.5 block text-[14px] font-medium text-[#1E293B]">
          Or paste the guidelines text here
        </Label>
        <Textarea
          id="pasteText"
          value={pasteText}
          onChange={(e) => {
            setPasteText(e.target.value)
            // Typing new paste text dismisses the restored state
            if (guidelinesRestored && e.target.value.trim()) {
              setGuidelinesRestored(false)
              clearGuidelines(applicationId)
            }
          }}
          rows={8}
          placeholder="Paste the full text of the funder's guidelines here…"
          className="text-[14px]"
        />
      </div>

      {/* Server-side continue error */}
      {continueError && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#DC2626]"
        >
          {continueError}
        </p>
      )}

      {/* Back + Continue */}
      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/1`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          disabled={
            !hasContent ||
            isContinuing ||
            uploadState === 'uploading' ||
            uploadState === 'processing'
          }
          onClick={handleContinue}
          className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isContinuing ? 'Saving…' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

// ── XHR upload helper ────────────────────────────────────────────────────────

/**
 * Uploads a file to a Supabase Storage signed URL via XMLHttpRequest.
 * Uses XHR instead of fetch so we get real upload progress events for the
 * progress bar (ADR-FILE-001 — client-side upload progress shown).
 */
function uploadWithProgress(
  file: File,
  signedUrl: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        reject(new Error(`Storage upload failed: ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(file)
  })
}
