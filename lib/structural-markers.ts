// Canonical definition of a structural citation marker line (ADR-DATA-007).
//
// Single source of truth for what counts as a "real" marker a citation can
// point at — `[PAGE N]` (PDF), `[SECTION: A > B]` (docx/pasted, from real
// heading structure), or `[ITEM N]` (2026-07-21 amendment: fallback marker,
// one per paragraph/line, used only when a document has neither page nor
// heading structure to anchor to at all).
//
// Before 2026-07-21 this pattern was duplicated across four separate regex
// literals (three in lib/preprocess-text.ts, one in lib/guideline-citations.ts)
// — exactly the shape of bug where a new marker type gets added to some but
// not all of them. Everything that needs to recognize an existing marker
// should build its regex from these exports instead of writing its own copy.
//
// Regexes with the `g` flag are stateful (`lastIndex`), so these are exposed
// as factory functions rather than shared instances — safe to call fresh
// every time, even under concurrent use within the same module.

const STRUCTURAL_MARKER_BODY = String.raw`\[(?:PAGE \d+|SECTION:.*|ITEM \d+)\]`

/** Matches a single line that IS a structural marker (no flags — for `.test()` on one trimmed line). */
export const STRUCTURAL_MARKER = new RegExp(`^${STRUCTURAL_MARKER_BODY}$`)

/** Fresh global+multiline regex matching structural marker lines anywhere in a string. */
export function structuralMarkerGlobal(): RegExp {
  return new RegExp(`^${STRUCTURAL_MARKER_BODY}$`, 'gm')
}

/** True if `text` contains any structural marker line at all (non-global — single `.test()`). */
export function hasAnyStructuralMarker(text: string): boolean {
  return new RegExp(`^${STRUCTURAL_MARKER_BODY}$`, 'm').test(text)
}

/** Fresh global+multiline regex capturing the page number from `[PAGE N]` markers. */
export function pageMarkerGlobal(): RegExp {
  return /^\[PAGE (\d+)\]$/gm
}

/** Fresh global+multiline regex capturing the heading path text from `[SECTION: ...]` markers. */
export function sectionMarkerGlobal(): RegExp {
  return /^\[SECTION: (.+)\]$/gm
}

/** Fresh global+multiline regex capturing the item number from `[ITEM N]` markers. */
export function itemMarkerGlobal(): RegExp {
  return /^\[ITEM (\d+)\]$/gm
}
