// Guideline citation validation (P6.3, ADR-DATA-007)
//
// The AI extraction prompt (lib/prompts.ts) asks the model to report which
// [PAGE N] / [SECTION: ...] marker (lib/extract-text.ts / lib/preprocess-
// text.ts, P6.2a) each question/section was drawn from. A citation is never
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

/** Raw citation shape as the AI returns it — both keys present, one null. */
export type RawCitation = {
  source_type: 'page' | 'heading'
  page_number: number | null
  heading_path: string[] | null
  quote: string
} | null

export type ValidMarkers = {
  pages: Set<number>
  headingPaths: Set<string>
}

/**
 * Extracts the set of page numbers and heading-path strings actually present
 * in the tagged guidelines text, to validate a reported citation against.
 */
export function extractValidMarkers(text: string): ValidMarkers {
  const pages = new Set<number>()
  const headingPaths = new Set<string>()

  for (const m of text.matchAll(/^\[PAGE (\d+)\]$/gm)) {
    pages.add(parseInt(m[1], 10))
  }
  for (const m of text.matchAll(/^\[SECTION: (.+)\]$/gm)) {
    headingPaths.add(m[1].trim())
  }

  return { pages, headingPaths }
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
    if (markers.headingPaths.has(raw.heading_path.join(' > '))) {
      return {
        citation: { source_type: 'heading', heading_path: raw.heading_path, quote },
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
  return { source_type: 'heading', heading_path: citation.heading_path, quote: citation.quote }
}

// Typographic punctuation variants that are interchangeable for matching
// purposes but not byte-identical: the AI's generated quote routinely comes
// back with plain ASCII (straight apostrophe/quotes, hyphen) even when the
// source PDF/docx uses proper typesetting (curly quotes, en/em dashes) — a
// single-character mismatch that a literal match would otherwise miss
// entirely (found live, 2026-07-15: MK Community Foundation's "six months'
// free reserves" vs the source's "six months' free reserves"). Each entry's
// characters are treated as equivalent to one another when building the
// match pattern below; the ORIGINAL text is still what gets sliced/displayed,
// so the on-screen highlight always shows the source's real typesetting.
const EQUIVALENT_PUNCTUATION_CLASSES = [
  ["'", '‘', '’', 'ʼ'], // straight apostrophe, curly left/right single quote, modifier-letter apostrophe
  ['"', '“', '”'], // straight double quote, curly left/right double quote
  ['-', '–', '—'], // hyphen, en dash, em dash
]

/**
 * Finds where `quote` occurs in `text` (P6.4's "view original guidelines"
 * panel), tolerating two classes of near-miss differences between them:
 *
 * 1. Whitespace — PDF extraction often wraps a line where the AI's quote has
 *    an ordinary space (e.g. "project\nwill address" in the source vs.
 *    "project will address" in the quote). Matches the quote's words in
 *    order, joined by `\s+`, so any run of whitespace in the source (space,
 *    newline, multiple spaces) satisfies a single space in the quote.
 * 2. Typographic punctuation — the AI frequently normalises curly
 *    quotes/apostrophes and en/em dashes to their plain-ASCII equivalents
 *    even when quoting "verbatim" (see EQUIVALENT_PUNCTUATION_CLASSES
 *    above). Each occurrence of one of these characters in the quote is
 *    matched against its whole equivalence class in the source, not just
 *    that literal character.
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

  const pattern = words.map(toPunctuationTolerantPattern).join('\\s+')

  let match: RegExpExecArray | null
  try {
    match = new RegExp(pattern).exec(text)
  } catch {
    return null
  }
  if (!match) return null

  return { start: match.index, end: match.index + match[0].length }
}
