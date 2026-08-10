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
import { cn } from '@/lib/utils'

interface ContextualTooltipProps {
  content: React.ReactNode
  /** The exact trigger element -- a single ref-forwarding Input/Textarea/Button/Link. */
  children: React.ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * Only pass this when wrapping a control that can be disabled (e.g.
   * "Ready to assemble", gated on approval state) -- when explicitly false,
   * renders `children` bare rather than a tooltip around a control that's
   * no longer disabled. Also triggers the stable-span wrapper below (see
   * `wrapInStableSpan`), since disabled elements don't reliably fire
   * hover/focus events either.
   */
  active?: boolean
  /**
   * Wrap the trigger in a stable, focusable `<span>` instead of composing
   * the tooltip's own props directly onto `children`. Required for any
   * native form control (`<input>`, `<textarea>`, `<select>`) -- GAP-36
   * found that Base UI's `Tooltip.Trigger` applies button-oriented default
   * props (`type`, `name`) when rendering onto a polymorphic target, and
   * setting `type` on a real `<input>` forces Chromium to reinitialise the
   * native widget, blurring it instantly and closing the tooltip. Verified
   * live: an identical Base UI `Input` on the same page with no tooltip
   * showed no such attribute churn -- only the tooltip-wrapped one did.
   * Buttons/links/plain text elements aren't affected (no `type`-dependent
   * native behaviour), so they don't need this.
   */
  wrapInStableSpan?: boolean
  /** Extra classes for the stable span wrapper (e.g. `flex-1` to preserve the trigger's sizing within its flex container). Ignored unless the span wrapper is in use. */
  spanClassName?: string
}

export function ContextualTooltip({
  content,
  children,
  side = 'top',
  active,
  wrapInStableSpan,
  spanClassName,
}: ContextualTooltipProps) {
  if (active === false) return children

  const useSpanWrapper = active !== undefined || wrapInStableSpan
  // The span itself only needs to be a tab stop when it's standing in for a
  // control that can go keyboard-unreachable (a disabled Button drops out of
  // the tab order entirely). A native form control wrapped via
  // wrapInStableSpan is already focusable on its own -- giving the span its
  // own tabIndex too just creates a second, redundant stop, and the
  // wrapper's computed accessible name ends up echoing the input's own
  // aria-label, so screen readers announce the label twice.
  const spanIsFocusTarget = active !== undefined

  return (
    <Tooltip>
      {useSpanWrapper ? (
        <TooltipTrigger
          tabIndex={spanIsFocusTarget ? 0 : undefined}
          className={cn('inline-flex', spanClassName)}
          render={<span />}
        >
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
