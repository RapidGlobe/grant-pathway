'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StepIndicator } from '@/components/step-indicator'
import { approveApplication, reopenApplication } from '@/actions/applications'
import type { ApplicationStatus } from '@/lib/application-guard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnswerRow = {
  id: string
  questionOrder: number
  questionText: string
  wordLimit: number | null
  answerText: string
  answerSource: 'ai_generated' | 'user_edited' | 'user_written' | null
}

interface ApplicationStep5ApproveProps {
  applicationId: string
  funderName: string
  grantName: string
  status: ApplicationStatus
  answers: AnswerRow[]
  assembledDraft: string | null
  lastExportedAt: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function formatExportDate(iso: string): string {
  const d = new Date(iso)
  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${datePart}, ${timePart}`
}

function sourceBadge(
  source: AnswerRow['answerSource'],
): { label: string; className: string } | null {
  if (source === 'ai_generated') {
    return { label: 'AI generated', className: 'bg-[#EEF2FF] text-[#4338CA]' }
  }
  if (source === 'user_edited') {
    return { label: 'AI + edited', className: 'bg-[#F0FDF4] text-[#166534]' }
  }
  if (source === 'user_written') {
    return { label: 'Written by you', className: 'bg-[#F8FAFC] text-[#475569]' }
  }
  return null
}

// ---------------------------------------------------------------------------
// Review checklist items
// ---------------------------------------------------------------------------

const REVIEW_ITEMS = [
  {
    id: 'read',
    label: 'I have reviewed all responses in full and am satisfied with their content.',
  },
  {
    id: 'accurate',
    label: 'The information provided is accurate and complete to the best of my knowledge.',
  },
  {
    id: 'responsibility',
    label:
      'I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted.',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApplicationStep5Approve({
  applicationId,
  funderName,
  grantName,
  status,
  answers,
  assembledDraft,
  lastExportedAt,
}: ApplicationStep5ApproveProps) {
  const router = useRouter()

  // ── Status ─────────────────────────────────────────────────────────────────
  type ApprovalStatus = 'pending' | 'approved' | 'exported'

  function toApprovalStatus(s: ApplicationStatus): ApprovalStatus {
    if (s === 'approved') return 'approved'
    if (s === 'exported') return 'exported'
    return 'pending'
  }

  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(toApprovalStatus(status))
  const [lastExported, setLastExported] = useState<string | null>(lastExportedAt)

  const isApproved = approvalStatus === 'approved' || approvalStatus === 'exported'
  const isExported = approvalStatus === 'exported'

  // ── Review checklist ───────────────────────────────────────────────────────
  const [checked, setChecked] = useState<Record<string, boolean>>({
    read: false,
    accurate: false,
    responsibility: false,
  })
  const allChecked = REVIEW_ITEMS.every((item) => checked[item.id])

  function toggleCheck(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // ── Dialogs ────────────────────────────────────────────────────────────────
  const [showReExportDialog, setShowReExportDialog] = useState(false)
  const [showReOpenDialog, setShowReOpenDialog] = useState(false)
  const [pendingFormat, setPendingFormat] = useState<'docx' | 'txt'>('docx')

  // ── Approve + download action ──────────────────────────────────────────────
  const [approveError, setApproveError] = useState<string | null>(null)

  // ── Re-open action ─────────────────────────────────────────────────────────
  const [isReopening, startReopenTransition] = useTransition()
  const [reopenError, setReopenError] = useState<string | null>(null)

  function handleReOpenConfirm() {
    setReopenError(null)
    startReopenTransition(async () => {
      const result = await reopenApplication(applicationId)
      if (result.ok) {
        setShowReOpenDialog(false)
        router.push(`/applications/${applicationId}/step/4`)
      } else {
        setReopenError(result.error ?? 'Could not re-open. Please try again.')
      }
    })
  }

  // ── Download action ────────────────────────────────────────────────────────
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false)
  const [isDownloadingTxt, setIsDownloadingTxt] = useState(false)
  const isDownloading = isDownloadingDocx || isDownloadingTxt
  const [downloadError, setDownloadError] = useState<string | null>(null)

  async function doDownload(format: 'docx' | 'txt') {
    const setLoading = format === 'docx' ? setIsDownloadingDocx : setIsDownloadingTxt
    setLoading(true)
    setDownloadError(null)
    setApproveError(null)

    // Approve first if not yet approved — covers the re-export dialog path
    // which calls doDownload directly, bypassing handleDownloadClick's approve step.
    if (!isApproved) {
      const result = await approveApplication(applicationId)
      if (!result.ok) {
        setApproveError(result.error ?? 'Could not approve. Please try again.')
        setLoading(false)
        setShowReExportDialog(false)
        return
      }
      setApprovalStatus('approved')
    }

    try {
      const res = await fetch(
        `/api/export/${applicationId}${format === 'txt' ? '?format=txt' : ''}`,
      )
      if (!res.ok) {
        let errMsg = 'Download failed. Please try again.'
        try {
          const data = (await res.json()) as { error?: string }
          if (data.error) errMsg = data.error
        } catch {
          // ignore parse error
        }
        setDownloadError(errMsg)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = grantName
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_')
      a.href = url
      a.download = `${safeName}_Application.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const now = new Date().toISOString()
      setApprovalStatus('exported')
      setLastExported(now)
    } catch {
      setDownloadError('Download failed. Please try again.')
    } finally {
      setLoading(false)
      setShowReExportDialog(false)
    }
  }

  async function handleDownloadClick(format: 'docx' | 'txt') {
    // Show re-export warning if a prior export exists (last_exported_at in DB),
    // regardless of current approval status. This covers the re-open → re-approve
    // → download cycle where isExported resets to false but a prior export exists.
    if (lastExported) {
      setPendingFormat(format)
      setShowReExportDialog(true)
      return
    }

    // If not yet approved, approve first then download in a single action.
    if (!isApproved) {
      setApproveError(null)
      const result = await approveApplication(applicationId)
      if (!result.ok) {
        setApproveError(result.error ?? 'Could not approve. Please try again.')
        return
      }
      setApprovalStatus('approved')
    }

    void doDownload(format)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={5} />

      <h1 className="mb-1 text-[24px] font-bold text-[#1E293B]">
        Review and approve your application
      </h1>
      <p className="mb-6 text-[14px] font-medium text-[#0D6E6E]">
        {funderName}
        {grantName && grantName !== funderName && (
          <span className="font-normal text-[#64748B]"> &middot; {grantName}</span>
        )}
      </p>

      {/* ── Approval status banner ─────────────────────────────────────────── */}
      {isApproved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
          <div>
            <p className="text-[14px] font-medium text-[#166534]">
              {isExported ? 'Application approved and exported.' : 'Application approved.'}
            </p>
            {isExported && lastExported && (
              <p className="mt-0.5 text-[13px] text-[#16A34A]">
                Last exported: {formatExportDate(lastExported)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Review checklist (only shown while pending) ────────────────────── */}
      {!isApproved && (
        <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <p className="mb-3 text-[14px] font-semibold text-[#1E293B]">
            Before you approve, please confirm:
          </p>
          <ul className="space-y-3">
            {REVIEW_ITEMS.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <input
                  id={`check-${item.id}`}
                  type="checkbox"
                  checked={checked[item.id] ?? false}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#CBD5E1] accent-[#0D6E6E]"
                />
                <label
                  htmlFor={`check-${item.id}`}
                  className="cursor-pointer text-[14px] leading-snug text-[#374151]"
                >
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Read-only content ─────────────────────────────────────────────── */}
      <div className="mb-8">
        {assembledDraft ? (
          // Assembled draft view — shown for Q&A model applications (S6.8)
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">
              Assembled draft
            </p>
            {assembledDraft.split('\n\n---\n\n').map((block, i) => {
              const newlineIdx = block.indexOf('\n\n')
              const heading = newlineIdx === -1 ? block.trim() : block.slice(0, newlineIdx).trim()
              const body = newlineIdx === -1 ? '' : block.slice(newlineIdx + 2).trim()
              return (
                <div key={i} className={i > 0 ? 'mt-6 border-t border-[#F1F5F9] pt-6' : ''}>
                  <p className="mb-2 text-[14px] font-semibold text-[#1E293B]">{heading}</p>
                  {body && (
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#374151]">
                      {body}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // Individual answer cards — shown for legacy applications (old AI-on-load model)
          <div className="space-y-5">
            {answers.length === 0 ? (
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 text-center text-[14px] text-[#64748B]">
                No answers found for this application.
              </div>
            ) : (
              answers.map((answer) => {
                const wordCount = countWords(answer.answerText)
                const overLimit = answer.wordLimit !== null && wordCount > answer.wordLimit
                const badge = sourceBadge(answer.answerSource)

                return (
                  <div key={answer.id} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[14px] font-semibold text-[#1E293B]">
                        {answer.questionOrder}.&nbsp;{answer.questionText}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        {badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        )}
                        {answer.wordLimit !== null && (
                          <span
                            className={`text-[12px] font-medium ${overLimit ? 'text-[#DC2626]' : 'text-[#64748B]'}`}
                          >
                            {wordCount} / {answer.wordLimit} words
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={`whitespace-pre-wrap text-[14px] leading-relaxed ${
                        answer.answerText ? 'text-[#374151]' : 'italic text-[#94A3B8]'
                      }`}
                    >
                      {answer.answerText || 'No answer provided.'}
                    </p>
                    {overLimit && (
                      <p className="mt-2 flex items-center gap-1 text-[12px] text-[#DC2626]">
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Answer exceeds the word limit.
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="mb-3 space-y-3">
        {/* Download as Word — clicking this approves + downloads in one step */}
        <Button
          type="button"
          onClick={() => void handleDownloadClick('docx')}
          disabled={(!isApproved && !allChecked) || isDownloading}
          variant={isApproved ? 'outline' : 'default'}
          className={
            isApproved
              ? 'h-10 w-full border-[#0D6E6E] text-[15px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4] disabled:cursor-not-allowed disabled:opacity-40'
              : 'h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:cursor-not-allowed disabled:opacity-40'
          }
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          {isDownloadingDocx ? 'Downloading…' : 'Download as Word document (.docx)'}
        </Button>

        {/* Download as plain text */}
        <Button
          type="button"
          onClick={() => void handleDownloadClick('txt')}
          disabled={(!isApproved && !allChecked) || isDownloading}
          variant="outline"
          className="h-10 w-full border-[#CBD5E1] text-[15px] font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          {isDownloadingTxt ? 'Downloading…' : 'Download as plain text (.txt)'}
        </Button>
      </div>

      {/* Approve error */}
      {approveError && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {approveError}
        </p>
      )}

      {/* Download error */}
      {downloadError && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {downloadError}
        </p>
      )}

      {/* ── Re-open link ─────────────────────────────────────────────────── */}
      {/* Back link is intentionally absent: Step 4 always redirects forward
          to Step 5 when draft_status = 'assembled', so a Back link would loop.
          Re-opening is the only way to return to Step 4 for edits. */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setShowReOpenDialog(true)}
          className="rounded text-[14px] text-[#64748B] underline hover:text-[#1E293B] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Re-open application to make changes
        </button>
      </div>

      {/* ── Re-export warning dialog ───────────────────────────────────────── */}
      <Dialog open={showReExportDialog} onOpenChange={setShowReExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download again?</DialogTitle>
            <DialogDescription>
              {lastExported
                ? `You last exported this application on ${formatExportDate(lastExported)}.`
                : 'You have already exported this application.'}{' '}
              If you have already submitted that version to the funder, please contact them if you
              intend to submit a revised version — funders may treat multiple submissions as
              separate applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReExportDialog(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void doDownload(pendingFormat)}
              disabled={isDownloading}
              className="bg-[#0D6E6E] text-white hover:bg-[#0A5A5A]"
            >
              {isDownloading ? 'Downloading…' : 'Download anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Re-open confirmation dialog ────────────────────────────────────── */}
      <Dialog open={showReOpenDialog} onOpenChange={setShowReOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-open this application?</DialogTitle>
            <DialogDescription>
              Re-opening this application will remove your approval. You will need to review and
              approve your answers again before you can export.
            </DialogDescription>
          </DialogHeader>
          {reopenError && (
            <p className="rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              {reopenError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReOpenDialog(false)}
              disabled={isReopening}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReOpenConfirm}
              disabled={isReopening}
              className="bg-[#0D6E6E] text-white hover:bg-[#0A5A5A]"
            >
              {isReopening ? 'Re-opening…' : 'Re-open application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
