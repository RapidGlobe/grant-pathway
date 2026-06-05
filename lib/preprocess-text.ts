// lib/preprocess-text.ts
//
// Lightweight text pre-processing applied to funder guidelines before they
// are passed to Bedrock. Goal: reduce input tokens by 15–25% without losing
// grant-relevant content (ADR-AI-010).
//
// Pure function — no side effects. Caller is responsible for logging.
// Disable entirely at runtime with DISABLE_TEXT_PREPROCESSING=true.

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

function isBoilerplateHeading(line: string): boolean {
  const t = line.trim()
  return BOILERPLATE_HEADINGS.some((p) => p.test(t))
}

// Returns true if a line looks like a new section heading — used to detect
// where a boilerplate section ends. Matches numbered headings ("1. Title"),
// ALL CAPS headings, and short lines.
function looksLikeHeading(line: string): boolean {
  const t = line.trim()
  if (!t || t.length > 100) return false
  if (/^\d+(\.\d+)*\.?\s+\S/.test(t)) return true // "1. Title", "2.3 Section"
  if (t === t.toUpperCase() && /[A-Z]/.test(t) && t.length > 3) return true // ALL CAPS
  return false
}

function isPageNumber(line: string): boolean {
  const t = line.trim()
  return (
    /^\d{1,3}$/.test(t) || // bare number: "1", "12"
    /^-\s*\d+\s*-$/.test(t) || // "- 1 -"
    /^page\s+\d+(\s+of\s+\d+)?$/i.test(t) // "Page 1", "Page 1 of 5"
  )
}

// Lines appearing 3+ times in identical form and shorter than 120 characters
// are treated as PDF header/footer artefacts and removed.
function detectRepeatedLines(lines: string[]): Set<string> {
  const counts = new Map<string, number>()
  for (const line of lines) {
    const t = line.trim()
    if (t && t.length < 120) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  const repeated = new Set<string>()
  for (const [text, count] of counts) {
    if (count >= 3) repeated.add(text)
  }
  return repeated
}

export type PreprocessResult = {
  text: string
  wasTruncated: boolean
  originalLength: number
  processedLength: number
}

export function preprocessText(raw: string, charCeiling = DEFAULT_CHAR_CEILING): PreprocessResult {
  const originalLength = raw.length

  // 1. Strip PDF artefacts and normalise line endings
  let text = raw
    .replace(/\f/g, '\n') // form feed → newline
    .replace(/\x00/g, '') // null bytes
    .replace(/\r\n/g, '\n') // CRLF → LF
    .replace(/\r/g, '\n') // stray CR → LF

  // 2. Split into lines for line-level processing
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

  // 8. Apply character ceiling — trim to last complete line to avoid
  //    cutting mid-sentence where possible
  let wasTruncated = false
  if (text.length > charCeiling) {
    wasTruncated = true
    let slice = text.slice(0, charCeiling)
    const lastNewline = slice.lastIndexOf('\n')
    // Only snap to last newline if it falls in the final 10% of the slice —
    // avoids losing large amounts of content on single-line-heavy docs
    if (lastNewline > charCeiling * 0.9) {
      slice = slice.slice(0, lastNewline)
    }
    text = slice
  }

  return {
    text,
    wasTruncated,
    originalLength,
    processedLength: text.length,
  }
}
