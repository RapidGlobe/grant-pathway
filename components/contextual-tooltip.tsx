'use client'

// Reusable contextual-tooltip wrapper (PDR-UI-008). Composes the existing
// components/ui/tooltip.tsx Base UI primitive rather than adding a
// coachmark/tour library -- none of this app's tooltips are a multi-step
// tour, they're independent single-point hints, so step-sequencing/overlay
// machinery isn't needed.
//
// Dismissed-state (`initiallyDismissed`) is prop-drilled from a Server
// Component parent's getDismissedTooltipIds() call, matching every other
// piece of per-request state in this app (e.g. AccountPage -> AccountSettingsForm,
// Step 4's page.tsx -> ApplicationStep4Draft) -- not fetched client-side on
// mount, which would visibly flash every page-load tooltip open before the
// dismissed-check resolves.

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { dismissTooltip, type TooltipId } from '@/actions/tooltips'

export type ContextualTooltipVariant =
  | 'focus' // shows on hover/focus until dismissed via the X
  | 'page-load' // forced open on mount unless already dismissed
  | 'hover-disabled' // wraps a genuinely-disabled control (dashboard-empty.tsx pattern)
  | 'first-click' // shows on hover/focus; auto-dismissed the moment the trigger is activated
  | 'persistent' // always shows, no X, never persisted (tt-delete-account)

interface ContextualTooltipProps {
  /** Omit for variant="persistent", which never calls dismissTooltip. */
  tooltipId?: TooltipId
  variant: ContextualTooltipVariant
  content: React.ReactNode
  /** From the hosting page's getDismissedTooltipIds() call. Ignored for "persistent". */
  initiallyDismissed?: boolean
  /** The exact trigger element -- a single ref-forwarding Input/Textarea/Button/Link. */
  children: React.ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * variant="hover-disabled" only: is the underlying disabled condition
   * currently true? When false, renders `children` bare -- no tooltip DOM
   * around a control that's no longer disabled.
   */
  active?: boolean
}

export function ContextualTooltip({
  tooltipId,
  variant,
  content,
  initiallyDismissed = false,
  children,
  side = 'top',
  active = true,
}: ContextualTooltipProps) {
  const [dismissed, setDismissed] = useState(variant === 'persistent' ? false : initiallyDismissed)
  const [, startTransition] = useTransition()

  function persistDismissal() {
    setDismissed(true)
    if (variant === 'persistent' || !tooltipId) return
    startTransition(() => {
      void dismissTooltip(tooltipId)
    })
  }

  if (dismissed) return children
  if (variant === 'hover-disabled' && !active) return children

  return (
    <Tooltip
      defaultOpen={variant === 'page-load'}
      onOpenChange={
        variant === 'first-click'
          ? (isOpen, eventDetails) => {
              // Base UI's own close-reason signal, not a wrapper onClick --
              // this never touches the child's real handler, so the
              // underlying action can never be blocked or double-fired.
              if (!isOpen && eventDetails.reason === 'trigger-press') persistDismissal()
            }
          : undefined
      }
    >
      {variant === 'hover-disabled' ? (
        <TooltipTrigger tabIndex={0} className="inline-flex" render={<span />}>
          {children}
        </TooltipTrigger>
      ) : (
        <TooltipTrigger render={children} />
      )}
      <TooltipContent side={side} className="max-w-xs">
        <div className="flex items-start gap-2">
          <p className="flex-1">{content}</p>
          {variant !== 'persistent' && (
            <button
              type="button"
              aria-label="Dismiss this tip"
              onClick={persistDismissal}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
