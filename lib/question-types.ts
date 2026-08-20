import type { AiSummaryQuestion } from '@/lib/types'
import type { Database } from '@/lib/database.types'

type ApplicationItemType = Database['public']['Enums']['application_item_type']

/**
 * Map an extracted question's `question_type` onto the `application_items.item_type`
 * enum column (D-021, 2026-08-20).
 *
 * `item_type` has carried 'date' and 'number' since P6.2 (2026-07-14) and neither
 * was ever written — extraction only ever produced 'narrative'. The gap was never
 * the enum; it was that the extraction schema had no field for the model to say
 * which kind of question it had found, so `lib/prompts.ts` resolved the tension by
 * instructing extraction "as a narrative question", and on some fixtures by
 * dropping the question instead. See lib/prompts.ts for the full history.
 *
 * Absent, null or unrecognised input maps to 'narrative'. That is deliberate:
 * the pre-D-021 behaviour is the fallback, so a response from an older prompt or
 * a partially-valid one degrades to what the product did yesterday rather than
 * failing extraction outright.
 *
 * This lives in its own module because two separate paths write these rows — the
 * primary sync in actions/applications.ts and the fallback sync on the Step 4
 * page — and they must not diverge. A shared function is the only thing that
 * guarantees that; duplicating the ternary twice would not.
 */
export function toItemType(questionType: AiSummaryQuestion['question_type']): ApplicationItemType {
  if (questionType === 'date') return 'date'
  if (questionType === 'number') return 'number'
  return 'narrative'
}

/**
 * Whether an item's answer is a single short value rather than prose — and so is
 * rendered as a one-line input with no word counter and no AI assist.
 *
 * Two independent reasons an item qualifies:
 *   - it is one of the 5 fixed governance items (`field_key` is set), which have
 *     rendered as short inputs since 2026-07-15; or
 *   - extraction typed it 'date' or 'number' (D-021).
 *
 * Kept separate from the governance check rather than folded into it, because
 * `field_key != null` also gates governance-specific behaviour — the £ prefix and
 * thousands separators, the Yes/No/Not sure yet select, and the guidance-note
 * rule — none of which applies to an AI-extracted date.
 */
export function isShortAnswerType(
  itemType: string | null | undefined,
  fieldKey: string | null | undefined,
): boolean {
  return fieldKey != null || itemType === 'date' || itemType === 'number'
}
