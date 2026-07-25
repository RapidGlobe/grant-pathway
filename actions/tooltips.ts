'use server'

// Contextual tooltip dismissed-state Server Actions (PDR-UI-008).
// Kept in its own file rather than folded into applications.ts/auth.ts,
// matching this codebase's one-file-per-feature-area convention -- no
// existing action file reads/writes anything for pure UI-rendering state.

import { createClient } from '@/lib/supabase/server'

// Kept in sync with the CHECK constraint in
// supabase/migrations/20260724000000_user_tooltip_dismissals.sql.
// tt-register-password and tt-delete-account are deliberately excluded --
// see components/contextual-tooltip.tsx for why neither ever persists here.
export type TooltipId =
  | 'tt-charity-lookup'
  | 'tt-guidelines-choice'
  | 'tt-summary-review'
  | 'tt-ai-help-limit'
  | 'tt-budget-no-ai'
  | 'tt-ready-to-assemble'
  | 'tt-governance-add-it'
  | 'tt-senior-review-confirm'
  | 'tt-download-docx'

/**
 * Returns the subset of `tooltipIds` the current user has already dismissed.
 * Read action -- returns an empty Set on any failure (no user, RLS denial,
 * network error) rather than throwing, matching this codebase's read-action
 * convention (getPreviousApplicationForFunder, actions/applications.ts).
 * Absence from the result means "not yet dismissed -- show it."
 */
export async function getDismissedTooltipIds(tooltipIds: TooltipId[]): Promise<Set<TooltipId>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data, error } = await supabase
    .from('user_tooltip_dismissals')
    .select('tooltip_id')
    .eq('user_id', user.id)
    .in('tooltip_id', tooltipIds)

  if (error || !data) return new Set()
  return new Set(data.map((row) => row.tooltip_id as TooltipId))
}

/**
 * Records that the current user has dismissed a tooltip. Idempotent -- an
 * upsert with ignoreDuplicates so a second dismiss (e.g. a second tab, or a
 * retry) is a no-op rather than an error. Write action -- returns
 * { ok }|{ ok:false, error } matching this codebase's write-action
 * convention (saveAnswer, actions/applications.ts).
 */
export async function dismissTooltip(
  tooltipId: TooltipId,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('user_tooltip_dismissals')
    .upsert(
      { user_id: user.id, tooltip_id: tooltipId },
      { onConflict: 'user_id,tooltip_id', ignoreDuplicates: true },
    )

  if (error) {
    return { ok: false, error: 'Could not save your preference. Please try again.' }
  }
  return { ok: true }
}

/**
 * Clears every dismissed-tooltip row for the current user, so all
 * `page-load`/`first-click`/`hover-disabled` tooltips show again (GAP-35).
 * `tt-delete-account` (persistent) and `tt-register-password` (not a row in
 * this table at all) are unaffected -- one always shows, the other never
 * persists here regardless.
 */
export async function resetAllTooltips(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase.from('user_tooltip_dismissals').delete().eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Could not reset your tooltips. Please try again.' }
  }
  return { ok: true }
}
