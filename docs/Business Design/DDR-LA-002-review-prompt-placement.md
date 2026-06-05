---
id: DDR-LA-002
category: Layout & Structure
status: Decided
---

# DDR-LA-002 — Review Prompt Placement

## Question

Where should the three mandatory review prompts (FR-32) appear in relation to each draft answer on Step 4?

## Context

FR-32 requires that three plain-language review prompts appear alongside every AI-generated draft answer before the user can approve it:

1. "Does this accurately describe your charity and project?"
2. "Are all figures, dates, and facts correct?"
3. "Does this answer the question that was asked?"

These prompts exist to ensure the user actively reads and considers the answer before approving it. They must be visible and clearly associated with each answer -- they cannot be buried or easy to skip past. However, they also must not overwhelm the answer text itself, since the user needs to read and potentially edit the answer.

This decision is related to DDR-LA-001 (application flow layout) -- the placement options available depend partly on whether a two-column layout is used.

## Options

- **Option A -- Inline above each answer:** The three prompts appear as a checklist or list above each answer text area. The user reads the prompts, then reads/edits the answer below. Clear association with the answer, but adds significant vertical height to each question block.
- **Option B -- Inline below each answer:** The three prompts appear below each answer text area. The user reads/edits the answer first, then sees the prompts as a reminder before moving on. Feels like a natural review flow.
- **Option C -- Right-hand sidebar panel (requires two-column layout):** The review prompts appear in a fixed or sticky right-hand panel, visible while the user edits the answer to the left. Always visible without adding vertical height to the answer block. Requires Option B or C from DDR-LA-001.
- **Option D -- Collapsible section beneath each answer:** The prompts are hidden under a "Things to check" disclosure toggle below each answer. Reduces visual noise but risks users collapsing and ignoring them. May not satisfy the intent of FR-32's "must be present" requirement.
- **Option E -- Single shared panel at the top of Step 4:** One instance of the three prompts displayed at the top of the page, applying to all answers. Minimal visual impact but weakest association with individual answers -- users may not connect the prompts to each specific answer.

## Decision

**Option C -- Right-hand sticky sidebar panel.**

The three mandatory review prompts (FR-32) will be displayed in the right-hand contextual panel in Step 4, consistent with the two-column layout decided in DDR-LA-001. The panel uses CSS `position: sticky` so it remains visible as the user scrolls through all question/answer pairs. A single instance of the three prompts applies to all answers on the page.

The right-hand panel content per step is:

- **Step 3:** Questions-found summary (number of questions extracted, key notes)
- **Step 4:** The three mandatory review prompts (FR-32) -- always visible while the user edits answers

## Date Decided

2026-04-17

---

_Status: Decided_
_Related: DDR-LA-001 (application flow layout)_
_Created: 2026-04-17_
