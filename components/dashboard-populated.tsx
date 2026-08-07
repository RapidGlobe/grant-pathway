'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { useFormStatus } from 'react-dom'
import { createApplication, deleteApplication, reopenApplication } from '@/actions/applications'
import type { ApplicationSummary, ApplicationStatus } from '@/actions/applications'

const AI_REQUESTS_LIMIT = 50

// Pill text is 12px, so WCAG 1.4.3 AA requires 4.5:1 against the pill's own
// background — not against the page. Four of these five failed that on
// 2026-08-07 (`DEF-01`); the ratio each now achieves is recorded beside it so a
// future palette change cannot quietly undo the fix.
//
// AC-01 measured only `in_progress` and `mismatch`, because the dashboard it
// swept happened to show no other status. `not_started` and `approved` were
// found by checking the whole config rather than the two rows that were
// visible — worth remembering when reading any "N violations" count as a total.
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string }> = {
  not_started: { label: 'Not started', bg: '#F1F5F9', text: '#475569' }, // 6.92 (was #64748B, 4.34)
  in_progress: { label: 'In progress', bg: '#FEF3C7', text: '#92400E' }, // 6.37 (was #D97706, 2.86)
  approved: { label: 'Approved', bg: '#DCFCE7', text: '#166534' }, // 6.49 (was #16A34A, 3.00)
  exported: { label: 'Exported', bg: '#E6F4F4', text: '#0D6E6E' }, // 5.36 — already passed, unchanged
  mismatch: { label: 'Ineligible', bg: '#FEF2F2', text: '#B91C1C' }, // 5.91 (was #DC2626, 4.41)
}

function deleteModalText(status: ApplicationStatus): string {
  if (status === 'approved') {
    return 'Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered.'
  }
  if (status === 'exported') {
    return 'Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document.'
  }
  return 'Are you sure you want to delete this application? This cannot be undone.'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

interface DashboardPopulatedProps {
  applications: ApplicationSummary[]
  aiRequestsUsed: number
  profileIncomplete?: boolean
}

export function DashboardPopulated({
  applications,
  aiRequestsUsed,
  profileIncomplete = false,
}: DashboardPopulatedProps) {
  const router = useRouter()

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ApplicationSummary | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  // Re-open modal state
  const [reopenTarget, setReopenTarget] = useState<ApplicationSummary | null>(null)
  const [reopenError, setReopenError] = useState<string | null>(null)
  const [isReopening, startReopen] = useTransition()

  const counts = {
    not_started: applications.filter((a) => a.status === 'not_started').length,
    in_progress: applications.filter((a) => a.status === 'in_progress').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    exported: applications.filter((a) => a.status === 'exported').length,
    mismatch: applications.filter((a) => a.status === 'mismatch').length,
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteError(null)
    startDelete(async () => {
      const result = await deleteApplication(id)
      if (result.ok) {
        setDeleteTarget(null)
        router.refresh() // re-fetch the page to remove the deleted card
      } else {
        setDeleteError(result.error)
      }
    })
  }

  function handleReopenConfirm() {
    if (!reopenTarget) return
    const id = reopenTarget.id
    setReopenError(null)
    startReopen(async () => {
      const result = await reopenApplication(id)
      if (result.ok) {
        setReopenTarget(null)
        router.push(`/applications/${id}/step/4`)
      } else {
        setReopenError(result.error)
      }
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 py-10">
      {/* Heading + New Application button */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold text-[#1E293B]">My Applications</h1>
        {/* Form + Server Action prevents /applications/new from entering
            browser history — Back from Step 1 returns here, not to the
            creation intermediary which would spawn another empty record. */}
        <form action={createApplication}>
          <NewApplicationButton />
        </form>
      </div>

      {/* Summary strip */}
      <div className="mb-4 flex flex-wrap items-center gap-x-2 text-[14px] text-[#64748B]">
        <span className="font-semibold text-[#1E293B]">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </span>
        <span aria-hidden="true">—</span>
        <span>{counts.not_started} not started</span>
        <span aria-hidden="true">·</span>
        <span>{counts.in_progress} in progress</span>
        <span aria-hidden="true">·</span>
        <span>{counts.approved} approved</span>
        <span aria-hidden="true">·</span>
        <span>{counts.exported} exported</span>
        <span aria-hidden="true">·</span>
        <span>{counts.mismatch} ineligible</span>
        <span aria-hidden="true" className="mx-2">
          |
        </span>
        <span className="text-[13px]">
          {aiRequestsUsed} of {AI_REQUESTS_LIMIT} AI requests used this month
        </span>
      </div>

      {/* Charity profile incomplete banner */}
      {profileIncomplete && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border-[1.5px] border-[#FDE68A] bg-[#FEF3C7] px-5 py-[14px]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
            <p className="text-[14px] font-medium text-[#92400E]">
              Your charity profile isn&apos;t complete yet. You&apos;ll need to fill it in before
              you can start an application.
            </p>
          </div>
          <Link
            href="/profile"
            className="flex-shrink-0 rounded-md bg-[#D97706] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#B45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            Complete your profile
          </Link>
        </div>
      )}

      {/* Application cards */}
      <div className="flex flex-col gap-4">
        {applications.map((app) => {
          const pill = STATUS_CONFIG[app.status]
          const isViewMode = app.status === 'approved' || app.status === 'exported'
          const isMismatch = app.status === 'mismatch'
          // Display fallback for applications that were created but Step 1 not yet saved
          const displayFunder = app.funderName || 'New application'
          const displayGrant = app.grantName || '—'

          return (
            <div
              key={app.id}
              className="flex items-center justify-between gap-6 rounded-xl border border-[#E2E8F0] bg-white px-6 py-5"
            >
              {/* Left: app details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold text-[#1E293B]">{displayFunder}</p>
                <p className="mt-0.5 truncate text-[14px] text-[#64748B]">{displayGrant}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
                    style={{ backgroundColor: pill.bg, color: pill.text }}
                  >
                    {pill.label}
                  </span>
                  <span className="text-[13px] text-[#64748B]">
                    Last updated {formatDate(app.lastUpdated)}
                  </span>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex flex-shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null)
                    setDeleteTarget(app)
                  }}
                  className="rounded text-[13px] font-medium text-[#DC2626] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
                >
                  Delete
                </button>

                {isMismatch ? null : isViewMode ? (
                  // "Re-open" opens the re-open confirmation (S2.3) — renamed from
                  // "View" 2026-07-13: the action is not read-only, it reverts
                  // status/draft_status/approval, so the label should match what
                  // the modal and reopenApplication() already call it.
                  <Button
                    type="button"
                    onClick={() => {
                      setReopenError(null)
                      setReopenTarget(app)
                    }}
                    className="h-9 border border-[#0D6E6E] bg-white px-4 text-[13px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4]"
                  >
                    Re-open
                  </Button>
                ) : (
                  // Continue navigates directly to the application's current step (S2.3)
                  <Link
                    href={`/applications/${app.id}/step/${app.currentStep}`}
                    className="inline-flex h-9 items-center rounded-md bg-[#0D6E6E] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
                  >
                    Continue
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Delete confirmation modal (S2.4) ──────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-[440px]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-[16px] font-bold text-[#1E293B]">
              Delete application
            </DialogTitle>
            <DialogDescription className="mt-2 text-[14px] text-[#64748B]">
              {deleteTarget ? deleteModalText(deleteTarget.status) : ''}
            </DialogDescription>
            {deleteError && (
              <p role="alert" className="mt-2 text-[13px] text-[#DC2626]">
                {deleteError}
              </p>
            )}
          </DialogHeader>
          <DialogFooter className="px-6 py-4">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  className="border-[#E2E8F0] text-[14px] font-semibold text-[#1E293B]"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-[#DC2626] text-[14px] font-semibold text-white hover:bg-[#B91C1C]"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Re-open confirmation modal (S2.3) ─────────────────────────────── */}
      <Dialog
        open={reopenTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isReopening) setReopenTarget(null)
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-[440px]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-[16px] font-bold text-[#1E293B]">
              Re-open application
            </DialogTitle>
            <DialogDescription className="mt-2 text-[14px] text-[#64748B]">
              Re-opening this application will remove your approval. You will need to review and
              approve your answers again before you can export.
            </DialogDescription>
            {reopenError && (
              <p role="alert" className="mt-2 text-[13px] text-[#DC2626]">
                {reopenError}
              </p>
            )}
          </DialogHeader>
          <DialogFooter className="px-6 py-4">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  disabled={isReopening}
                  className="border-[#E2E8F0] text-[14px] font-semibold text-[#1E293B]"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              onClick={handleReopenConfirm}
              disabled={isReopening}
              className="bg-[#0D6E6E] text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
            >
              {isReopening ? 'Re-opening…' : 'Re-open'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Reads pending state from the nearest <form> via useFormStatus. */
function NewApplicationButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#0D6E6E] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? 'Creating…' : '+ New Application'}
    </button>
  )
}

function DialogHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`} {...props}>
      {children}
    </div>
  )
}
