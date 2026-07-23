// Guideline citation validation (P6.3, ADR-DATA-007)
//
// The AI extraction prompt (lib/prompts.ts) asks the model to report which
// [PAGE N] / [SECTION: ...] / [ITEM N] marker (lib/extract-text.ts / lib/
// preprocess-text.ts, P6.2a; [ITEM N] added 2026-07-21 as a fallback for
// guidelines with no page or heading structure) each question/section was
// drawn from. A citation is never
// trusted purely on the AI's word — this module cross-checks every reported
// citation against the markers actually present in the text the AI was
// given, so a citation can only ever reference a chunk of guideline text
// that structurally exists (Option B, ADR-DATA-007), never a hallucinated
// page/section.
//
// A citation that doesn't check out is dropped (set to null) rather than
// failing the whole AI response — nothing renders citations to a user yet
// (that's P6.4), so a missing one is a minor, invisible gap.

import type { Json } from './database.types'
import type { GuidelineCitation } from './types'
import { itemMarkerGlobal, pageMarkerGlobal, sectionMarkerGlobal } from './structural-markers'

/** Raw citation shape as the AI returns it — all three keys present, two null. */
export type RawCitation = {
  source_type: 'page' | 'heading' | 'item'
  page_number: number | null
  heading_path: string[] | null
  item_number: number | null
  quote: string
} | null

export type ValidMarkers = {
  pages: Set<number>
  headingPaths: Set<string>
  items: Set<number>
}

// Typographic punctuation variants that are interchangeable for matching
// purposes but not byte-identical (see findQuoteRange below for the original
// rationale and live-bug history). A Word heading's own text can just as
// easily contain a curly apostrophe or en/em dash as a quote can — e.g.
// "Which of the Council’s overarching principles..." — and an AI-reported
// heading_path routinely normalises punctuation to plain ASCII even when
// quoting "verbatim". Both extractValidMarkers and validateCitation below
// normalise through this table before comparing, so a heading citation isn't
// wrongly rejected as pointing at a marker that "doesn't structurally exist"
// purely over a punctuation-normalisation artifact of quoting via an LLM
// (found live, 2026-07-17, Stony Stratford Town Council: this exact heading
// never validated, silently dropping to no citation badge at all).
const EQUIVALENT_PUNCTUATION_CLASSES = [
  ["'", '‘', '’', 'ʼ'], // straight apostrophe, curly left/right single quote, modifier-letter apostrophe
  ['"', '“', '”'], // straight double quote, curly left/right double quote
  ['-', '–', '—'], // hyphen, en dash, em dash
]

// List-bullet glyphs that PDF extraction (lib/extract-text.ts's unpdf path)
// carries through as literal characters in the retained guideline text (e.g.
// "understand:\n■ that you have..."). An AI quoting "verbatim" treats these as
// decorative list formatting, not text, and drops them — so a quote that spans
// across a bullet point (found live, 2026-07-23, Garfield Weston "Your
// finances": "We need to understand: that you have a robust plan..." skips
// over the "■" between "understand:" and "that") must still match even though
// the source has a non-whitespace character sitting between the two words.
const LIST_BULLET_CHARS = ['■', '•', '●', '▪', '◦', '‣', '·']

/** Maps every punctuation-class character to its class's first (canonical) member. */
function normalizePunctuationForMatch(s: string): string {
  let result = ''
  for (const char of s) {
    const equivalenceClass = EQUIVALENT_PUNCTUATION_CLASSES.find((chars) => chars.includes(char))
    result += equivalenceClass ? equivalenceClass[0] : char
  }
  return result
}

/**
 * Extracts the set of page numbers and heading-path strings actually present
 * in the tagged guidelines text, to validate a reported citation against.
 * Heading paths are punctuation-normalised (see EQUIVALENT_PUNCTUATION_CLASSES
 * above) so validateCitation's lookup tolerates the same curly/straight
 * variation findQuoteRange already tolerates for quotes.
 */
export function extractValidMarkers(text: string): ValidMarkers {
  const pages = new Set<number>()
  const headingPaths = new Set<string>()
  const items = new Set<number>()

  for (const m of text.matchAll(pageMarkerGlobal())) {
    pages.add(parseInt(m[1], 10))
  }
  for (const m of text.matchAll(sectionMarkerGlobal())) {
    headingPaths.add(normalizePunctuationForMatch(m[1].trim()))
  }
  // [ITEM N] (2026-07-21 amendment, ADR-DATA-007): fallback marker for
  // guidelines with no page or heading structure at all — see
  // lib/extract-text.ts's tagSectionsFromHtml and lib/preprocess-text.ts's
  // tagPastedTextSections.
  for (const m of text.matchAll(itemMarkerGlobal())) {
    items.add(parseInt(m[1], 10))
  }

  return { pages, headingPaths, items }
}

/**
 * Validates a raw AI-reported citation against the markers actually present
 * in the source text. Returns the strict discriminated-union shape
 * `application_items.guideline_reference` requires (the unused key entirely
 * omitted, not set to null — required by that column's CHECK constraint), or
 * null if no citation was offered or it didn't check out.
 */
export function validateCitation(
  raw: RawCitation,
  markers: ValidMarkers,
): { citation: GuidelineCitation | null; wasOffered: boolean; wasValid: boolean } {
  if (!raw) return { citation: null, wasOffered: false, wasValid: false }

  const quote = raw.quote?.trim()

  if (raw.source_type === 'page' && raw.page_number !== null && quote) {
    if (markers.pages.has(raw.page_number)) {
      return {
        citation: { source_type: 'page', page_number: raw.page_number, quote },
        wasOffered: true,
        wasValid: true,
      }
    }
  } else if (
    raw.source_type === 'heading' &&
    raw.heading_path &&
    raw.heading_path.length &&
    quote
  ) {
    if (markers.headingPaths.has(normalizePunctuationForMatch(raw.heading_path.join(' > ')))) {
      return {
        citation: { source_type: 'heading', heading_path: raw.heading_path, quote },
        wasOffered: true,
        wasValid: true,
      }
    }
  } else if (raw.source_type === 'item' && raw.item_number !== null && quote) {
    if (markers.items.has(raw.item_number)) {
      return {
        citation: { source_type: 'item', item_number: raw.item_number, quote },
        wasOffered: true,
        wasValid: true,
      }
    }
  }

  return { citation: null, wasOffered: true, wasValid: false }
}

/**
 * Builds the JSONB value for `application_items.guideline_reference` from a
 * validated GuidelineCitation — the unused key (page_number or heading_path)
 * is an object literal that never includes it, not set to null, since the
 * column's CHECK constraint tests key *presence* (`?` operator), not value.
 */
export function toGuidelineReferenceColumn(citation: GuidelineCitation | null | undefined): Json {
  if (!citation) return null
  if (citation.source_type === 'page') {
    return { source_type: 'page', page_number: citation.page_number, quote: citation.quote }
  }
  if (citation.source_type === 'heading') {
    return { source_type: 'heading', heading_path: citation.heading_path, quote: citation.quote }
  }
  return { source_type: 'item', item_number: citation.item_number, quote: citation.quote }
}

/**
 * Finds where `quote` occurs in `text` (P6.4's "view original guidelines"
 * panel), tolerating three classes of near-miss differences between them:
 *
 * 1. Whitespace — PDF extraction often wraps a line where the AI's quote has
 *    an ordinary space (e.g. "project\nwill address" in the source vs.
 *    "project will address" in the quote). Matches the quote's words in
 *    order, joined by a separator, so any run of whitespace in the source
 *    (space, newline, multiple spaces) satisfies a single space in the quote.
 * 2. Typographic punctuation — the AI frequently normalises curly
 *    quotes/apostrophes and en/em dashes to their plain-ASCII equivalents
 *    even when quoting "verbatim" (see EQUIVALENT_PUNCTUATION_CLASSES
 *    above). Each occurrence of one of these characters in the quote is
 *    matched against its whole equivalence class in the source, not just
 *    that literal character.
 * 3. List bullets — the same separator also swallows a list-bullet glyph
 *    (see LIST_BULLET_CHARS above) sitting amid the whitespace, since the AI
 *    drops these when it quotes across a bullet point (e.g. source
 *    "understand:\n■ that you have" vs. quote "understand: that you have").
 *
 * Returns null if no match is found — the caller shows the text unhighlighted
 * rather than treating this as an error (quotes are validated against real
 * markers, not a verbatim-substring guarantee — see validateCitation above).
 */
export function findQuoteRange(text: string, quote: string): { start: number; end: number } | null {
  const words = quote.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return null

  const escapeRegex = (char: string) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const toPunctuationTolerantPattern = (word: string): string => {
    let result = ''
    for (const char of word) {
      const equivalenceClass = EQUIVALENT_PUNCTUATION_CLASSES.find((chars) => chars.includes(char))
      result += equivalenceClass
        ? `[${equivalenceClass.map(escapeRegex).join('')}]`
        : escapeRegex(char)
    }
    return result
  }

  // Separator tolerates a list-bullet glyph sitting amid the whitespace (see
  // LIST_BULLET_CHARS above) as well as plain runs of whitespace.
  const separator = `[\\s${LIST_BULLET_CHARS.map(escapeRegex).join('')}]+`
  const pattern = words.map(toPunctuationTolerantPattern).join(separator)

  let match: RegExpExecArray | null
  try {
    match = new RegExp(pattern).exec(text)
  } catch {
    return null
  }
  if (!match) return null

  return { start: match.index, end: match.index + match[0].length }
}
