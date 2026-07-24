// lib/preprocess-text.ts
//
// Lightweight text pre-processing applied to funder guidelines before they
// are passed to Bedrock. Goal: reduce input tokens by 15–25% without losing
// grant-relevant content (ADR-AI-010).
//
// Pure function — no side effects. Caller is responsible for logging.
// Disable entirely at runtime with DISABLE_TEXT_PREPROCESSING=true.
//
// Structural markers (ADR-DATA-007, P6.2a): PDF/docx extraction (lib/extract-
// text.ts) tags text with `[PAGE N]` / `[SECTION: A > B]` markers so a later
// citation has real structure to point at. Every stripping step below must
// leave those markers alone. Pasted text (no file, so no markers yet) gets
// the same section tagging here instead, via looksLikeHeading's existing
// numbered/ALL-CAPS heuristic.
//
// Form-aware truncation (2026-07-16): a plain "keep the first N characters"
// ceiling systematically favours front-loaded guidance/eligibility prose over
// the actual application form, which many funders (Clothworkers, Henry Smith,
// Lloyds, Idlewild) place well into a combined guidance-plus-sample-forms
// PDF. Confirmed on Clothworkers' 54-page pack: the plain ceiling cut off
// mid-way through the real form's most important narrative questions
// ("describe your project", "the difference you expect it to make") while
// keeping only front-matter guidance. findFormStartIndex() below looks for a
// strong "this is the actual sample form" heading; when one is found beyond
// where the ceiling would otherwise land, the ceiling budget is split between
// a short preamble (eligibility/overview context) and the form section
// itself, rather than truncating in raw document order.

import {
  STRUCTURAL_MARKER,
  hasAnyStructuralMarker,
  structuralMarkerGlobal,
} from './structural-markers'

// Default character ceiling. Override via PREPROCESS_CHAR_CEILING env var.
// Applied after all other stripping — a safety net for very large documents.
export const DEFAULT_CHAR_CEILING = 20_000

// Section headings that reliably precede boilerplate content — content that
// does not inform the AI summary (no eligibility criteria, questions, word
// limits, or grant details). Conservative list: when in doubt, omit a pattern
// rather than risk stripping grant-relevant content.
const BOILERPLATE_HEADINGS: RegExp[] = [
  /^contact(ing)?\s+(us|details?|information)\b/i,
  /^get\s+in\s+touch\b/i,
  /^privacy\s+(policy|notice|statement)\b/i,
  /^data\s+protection(\s+(policy|notice|statement))?\b/i,
  /^accessibility(\s+statement)?\b/i,
  /^equal(ity)?\s+(opportunit|divers)\w*/i,
  /^complaints?\s+(procedure|process|policy)\b/i,
  /^freedom\s+of\s+information\b/i,
  /^about\s+us$/i,
  /^about\s+the\s+(foundation|trust|fund|charity|organisation|organization)$/i,
  /^our\s+(history|story|mission|vision|values)$/i,
  /^disclaimer\b/i,
  /^copyright(\s+(notice|statement))?\b/i,
  /^website\s+(terms|disclaimer)\b/i,
]

// Maximum lines to skip per detected boilerplate section. Prevents runaway
// stripping if a heading pattern matches unexpectedly.
const MAX_BOILERPLATE_SECTION_LINES = 60

// Structural markers inserted by lib/extract-text.ts (or by
// tagPastedTextSections below) — must never be stripped as noise. Canonical
// definition lives in lib/structural-markers.ts (2026-07-21) — this used to
// be one of four separately-hardcoded copies of the same pattern.

function isBoilerplateHeading(line: string): boolean {
  const t = line.trim()
  return BOILERPLATE_HEADINGS.some((p) => p.test(t))
}

// Returns true if a line looks like a new section heading — used to detect
// where a boilerplate section ends, and (in tagPastedTextSections) to detect
// pasted-text section boundaries. Matches numbered headings ("1. Title"),
// ALL CAPS headings, short lines, and existing structural markers.
function looksLikeHeading(line: string): boolean {
  const t = line.trim()
  if (STRUCTURAL_MARKER.test(t)) return true
  if (!t || t.length > 100) return false
  if (/^\d+(\.\d+)*\.?\s+\S/.test(t)) return true // "1. Title", "2.3 Section"
  if (t === t.toUpperCase() && /[A-Z]/.test(t) && t.length > 3) return true // ALL CAPS
  return false
}

function isPageNumber(line: string): boolean {
  const t = line.trim()
  if (STRUCTURAL_MARKER.test(t)) return false
  return (
    /^\d{1,3}$/.test(t) || // bare number: "1", "12"
    /^-\s*\d+\s*-$/.test(t) || // "- 1 -"
    /^page\s+\d+(\s+of\s+\d+)?$/i.test(t) // "Page 1", "Page 1 of 5"
  )
}

// Returns true if the line at `index` sits immediately next to a structural
// marker — i.e. it is the first non-blank line after a [PAGE N]/[SECTION: ...]
// boundary (a running header) or the last non-blank line before the next one
// (a running footer). Blank lines in between are skipped, since PDF
// extraction commonly leaves a blank line before/after a page's header/footer.
function isAdjacentToMarker(lines: string[], index: number): boolean {
  let before = index - 1
  while (before >= 0 && lines[before].trim() === '') before--
  if (before >= 0 && STRUCTURAL_MARKER.test(lines[before].trim())) return true

  let after = index + 1
  while (after < lines.length && lines[after].trim() === '') after++
  if (after < lines.length && STRUCTURAL_MARKER.test(lines[after].trim())) return true

  return false
}

// Lines appearing 3+ times in identical form, shorter than 120 characters,
// and — critically — sitting at a page/section boundary on EVERY occurrence
// are treated as PDF running header/footer artefacts and removed. Structural
// markers are excluded even if a heading title happens to repeat verbatim
// elsewhere.
//
// The marker-adjacency requirement (2026-07-16) guards against a real bug
// found on Clothworkers' Foundation guidelines: a genuine, load-bearing
// question ("Please describe the difference you expect your capital project
// to make") is repeated verbatim across the funder's 3 separate application
// forms, embedded mid-page each time — a plain "identical 3+ times" rule
// stripped it everywhere, including from the one form that actually needed
// it. A true running header/footer, by contrast, reliably sits as the first
// or last line of every page it appears on. If even one occurrence of a
// repeated line is NOT marker-adjacent, none of its occurrences are
// stripped — erring toward keeping content over losing it.
function detectRepeatedLines(lines: string[]): Set<string> {
  const positions = new Map<string, number[]>()
  lines.forEach((line, index) => {
    const t = line.trim()
    if (t && t.length < 120 && !STRUCTURAL_MARKER.test(t)) {
      const existing = positions.get(t)
      if (existing) {
        existing.push(index)
      } else {
        positions.set(t, [index])
      }
    }
  })

  const repeated = new Set<string>()
  for (const [text, indices] of positions) {
    if (indices.length >= 3 && indices.every((index) => isAdjacentToMarker(lines, index))) {
      repeated.add(text)
    }
  }
  return repeated
}

// Extracts a numbered heading's nesting depth from its prefix: "1." → 1,
// "2.3" → 2, "2.3.1" → 3. Returns null if the line isn't numbered (e.g. an
// ALL CAPS heading, which has no depth signal and is treated as top-level).
function numberedHeadingDepth(line: string): number | null {
  const m = /^(\d+(?:\.\d+)*)\.?\s+\S/.exec(line.trim())
  if (!m) return null
  return m[1].split('.').length
}

/**
 * Pasted guidelines have no file to extract page/heading structure from
 * (unlike PDF/docx, tagged in lib/extract-text.ts). Falls back to the same
 * numbered/ALL-CAPS heading heuristic already used to bound boilerplate
 * sections, inserting `[SECTION: ...]` markers so a citation still has real
 * structure to point at (ADR-DATA-007, P6.2a).
 *
 * `[ITEM N]` fallback (2026-07-21 amendment): if NO line anywhere in the
 * pasted text looks like a heading (a flat, unheaded bullet/paragraph list —
 * the same shape as the Wolfson Foundation docx that motivated this fix),
 * the numbered/ALL-CAPS heuristic has nothing to hang a `[SECTION: ...]`
 * marker off at all. Rather than leave the whole text unmarked, number every
 * non-blank line `[ITEM N]` instead, so a citation still has something real
 * to anchor to. Text with at least one detected heading is unaffected —
 * this only activates when `sawHeading` never becomes true.
 *
 * Skipped entirely if the text already carries markers (it came from
 * extract-text.ts, which tags PDFs/docx itself).
 */
function tagPastedTextSections(text: string): string {
  if (hasAnyStructuralMarker(text)) return text

  const lines = text.split('\n')
  const sawHeading = lines.some((line) => looksLikeHeading(line.trim()))

  if (!sawHeading) {
    let itemNumber = 0
    return lines
      .map((line) => {
        if (line.trim() === '') return line
        itemNumber++
        return `[ITEM ${itemNumber}]\n${line}`
      })
      .join('\n')
  }

  const stack: { depth: number; title: string }[] = []
  const out: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (looksLikeHeading(trimmed)) {
      const depth = numberedHeadingDepth(trimmed) ?? 1
      while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop()
      stack.push({ depth, title: trimmed })
      out.push(`[SECTION: ${stack.map((s) => s.title).join(' > ')}]`)
    } else {
      out.push(line)
    }
  }

  return out.join('\n')
}

// Heading patterns that reliably mark the start of an actual, fillable
// application form — as opposed to a table-of-contents listing (numbered,
// e.g. "4. Sample Small Grants Programme Application Form") or a guidance
// section that merely discusses the form in the abstract (e.g. "THE
// APPLICATION FORM" heading before the real thing). Checked in priority
// order; the first line in the whole document matching either pattern (and
// not a numbered heading) wins, so a document with multiple sample forms
// (e.g. Small Grants, then Large Grants) correctly lands on the first one.
const FORM_START_PATTERNS: RegExp[] = [
  /^SAMPLE\b.{0,80}APPLICATION/i,
  /^(THE\s+)?APPLICATION\s+FORM\b/i,
]

// Share of the character ceiling reserved for pre-form content (eligibility,
// overview, what's funded) when a form-start heading is found beyond where a
// plain ceiling cut would reach. The remainder goes to the form section
// itself — deliberately biased toward the form, since that's where the
// concrete narrative questions live.
const PREAMBLE_MAX_SHARE = 0.4

/**
 * Finds the character offset of the first heading that marks the start of an
 * actual sample/fillable application form, or -1 if none is found. Skips
 * numbered headings (table-of-contents entries) — those list a form's title
 * without containing the form itself.
 */
function findFormStartIndex(text: string): number {
  const lines = text.split('\n')
  const offsets: number[] = []
  let offset = 0
  for (const line of lines) {
    offsets.push(offset)
    offset += line.length + 1 // +1 for the '\n' removed by split
  }

  for (const pattern of FORM_START_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      if (!trimmed || numberedHeadingDepth(trimmed) !== null) continue
      if (!looksLikeHeading(trimmed)) continue
      if (pattern.test(trimmed)) return offsets[i]
    }
  }
  return -1
}

/**
 * Truncates `slice` back to the last complete [PAGE N] / [SECTION: ...]
 * marker it contains, so a page/section that would be cut off mid-way is
 * dropped in its entirety rather than left half-populated with no citation
 * to anchor to. Falls back to a last-newline snap (only if it falls in the
 * final `minKeepRatio` of the slice) when no marker is present at all.
 */
function snapToLastMarker(slice: string, minKeepRatio = 0.9): string {
  const markerPattern = structuralMarkerGlobal()
  let lastMarkerIndex = -1
  let markerMatch: RegExpExecArray | null
  while ((markerMatch = markerPattern.exec(slice)) !== null) {
    lastMarkerIndex = markerMatch.index
  }

  if (lastMarkerIndex > 0) {
    return slice.slice(0, lastMarkerIndex).trimEnd()
  }

  const lastNewline = slice.lastIndexOf('\n')
  if (lastNewline > slice.length * minKeepRatio) {
    return slice.slice(0, lastNewline)
  }
  return slice
}

export type PreprocessResult = {
  text: string
  wasTruncated: boolean
  originalLength: number
  processedLength: number
  /** True if a form-start heading was found and prioritised over blindly keeping the first N characters (2026-07-16). */
  formSectionPrioritized: boolean
}

export function preprocessText(raw: string, charCeiling = DEFAULT_CHAR_CEILING): PreprocessResult {
  const originalLength = raw.length

  // 1. Strip PDF artefacts and normalise line endings
  let text = raw
    .replace(/\f/g, '\n') // form feed → newline
    .replace(/\x00/g, '') // null bytes
    .replace(/\r\n/g, '\n') // CRLF → LF
    .replace(/\r/g, '\n') // stray CR → LF

  // 2. Tag section boundaries for pasted plain text (no file-level structure
  //    to draw on) — must run before the stripping steps below so the new
  //    markers are protected by the same checks that guard extract-text.ts's
  //    markers (ADR-DATA-007, P6.2a).
  text = tagPastedTextSections(text)

  // 3. Split into lines for line-level processing
  let lines = text.split('\n')

  // 3. Identify repeated header/footer lines across the whole document
  const repeatedLines = detectRepeatedLines(lines)

  // 4. Remove page numbers and repeated header/footer artefacts
  lines = lines.filter((line) => {
    const t = line.trim()
    if (isPageNumber(t)) return false
    if (repeatedLines.has(t)) return false
    return true
  })

  // 5. Strip boilerplate sections
  const cleaned: string[] = []
  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (isBoilerplateHeading(trimmed)) {
      i++ // skip the heading line itself
      let skipped = 0
      while (i < lines.length && skipped < MAX_BOILERPLATE_SECTION_LINES) {
        if (lines[i].trim() && looksLikeHeading(lines[i].trim())) break
        i++
        skipped++
      }
    } else {
      cleaned.push(lines[i])
      i++
    }
  }

  // 6. Collapse runs of 3+ blank lines down to 2
  const collapsed: string[] = []
  let blankRun = 0
  for (const line of cleaned) {
    if (line.trim() === '') {
      blankRun++
      if (blankRun <= 2) collapsed.push(line)
    } else {
      blankRun = 0
      collapsed.push(line)
    }
  }

  // 7. Rejoin, trim trailing whitespace per line, trim the whole string
  text = collapsed
    .map((l) => l.trimEnd())
    .join('\n')
    .trim()

  // 8. Apply character ceiling. Plain case: snap back to the last complete
  //    [PAGE N] / [SECTION: ...] marker before the ceiling (ADR-AI-007,
  //    P6.2a), so a page/section that would be cut off is dropped in its
  //    entirety rather than left half-populated with no citation to anchor
  //    to. Form-aware case (2026-07-16): if an actual application form starts
  //    beyond where the plain ceiling would land, a plain cut would silently
  //    drop the form's real questions while keeping only front-matter
  //    guidance — instead, split the budget between a short preamble and the
  //    form section itself.
  let wasTruncated = false
  let formSectionPrioritized = false
  if (text.length > charCeiling) {
    wasTruncated = true
    const formStartIndex = findFormStartIndex(text)

    // Trigger whenever a form section exists at all, not only when it starts
    // beyond the ceiling — even a form starting well before the ceiling can
    // still get cut off mid-way if the plain [0, ceiling) window doesn't
    // leave it enough room (confirmed on Clothworkers: header/footer removal
    // shrinks the document enough that the form heading lands at ~36k chars
    // against a 50k ceiling, yet the plain path still lost the form's last
    // two questions — capping the preamble share frees up real room for it).
    if (formStartIndex > 0) {
      formSectionPrioritized = true
      const preambleBudget = Math.min(formStartIndex, Math.floor(charCeiling * PREAMBLE_MAX_SHARE))
      const preamble = snapToLastMarker(text.slice(0, preambleBudget))
      const formBudget = charCeiling - preambleBudget
      const formSlice = text.slice(formStartIndex, formStartIndex + formBudget)
      const formPart = snapToLastMarker(formSlice)
      text = `${preamble}\n\n${formPart}`
    } else {
      text = snapToLastMarker(text.slice(0, charCeiling))
    }
  }

  return {
    text,
    wasTruncated,
    originalLength,
    processedLength: text.length,
    formSectionPrioritized,
  }
}
