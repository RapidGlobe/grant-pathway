'use client'

// Reusable contextual-tooltip wrapper (PDR-UI-008, simplified 2026-07-25).
// Composes the existing components/ui/tooltip.tsx Base UI primitive -- a
// plain hover/focus hint with no dismiss button and no persisted
// seen/dismissed state. The original version persisted dismissal
// server-side per user per tooltip; WJ concluded that mechanism was
// over-engineered for a pre-launch product (a missed migration, an added
// reset control, cross-device state to reason about) relative to the value
// it added, and asked to simplify to an ordinary tooltip instead.

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ContextualTooltipProps {
  content: React.ReactNode
  /** The exact trigger element -- a single ref-forwarding Input/Textarea/Button/Link. */
  children: React.ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * Only pass this when wrapping a control that can be disabled (e.g.
   * "Ready to assemble", gated on approval state) -- when explicitly false,
   * renders `children` bare rather than a tooltip around a control that's
   * no longer disabled. Disabled elements don't reliably fire hover/focus
   * events, so this path wraps the trigger in a focusable span instead of
   * rendering it directly.
   */
  active?: boolean
}

export function ContextualTooltip({
  content,
  children,
  side = 'top',
  active,
}: ContextualTooltipProps) {
  if (active === false) return children

  return (
    <Tooltip>
      {active !== undefined ? (
        <TooltipTrigger tabIndex={0} className="inline-flex" render={<span />}>
          {children}
        </TooltipTrigger>
      ) : (
        <TooltipTrigger render={children} />
      )}
      <TooltipContent side={side} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
