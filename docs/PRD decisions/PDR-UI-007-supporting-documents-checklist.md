---
id: PDR-UI-007
category: User Interface & Experience
status: Decided
---

# PDR-UI-007 — Surfacing Extracted Supporting Documents

## Question

The Step 3 AI summary prompt extracts `supportingDocuments` — a list of document categories the funder requires or recommends alongside the application (e.g. "Most recent annual accounts", "Governing document / constitution") — on every summarisation call. This field was validated in the Zod schema and typed, but never rendered anywhere in the app. Should it be displayed, or removed from extraction entirely?

## Context

Unlike `funderAiPolicy` (also extracted but deliberately not displayed, with an explanatory comment in `components/application-step3-summary.tsx`), `supportingDocuments` had no such comment — it was extracted on every call and silently discarded, with no record of why. Separately, Step 4 already showed a "Before you begin writing" preparation checklist (`components/application-step4-prep-checklist.tsx`, S6.4) with a **hardcoded, generic** list of items to gather (annual accounts, projected budget, other funding details, senior colleague input) — identical for every funder, regardless of what that funder actually asks for.

## Options

- **Option A — Display on Step 3 only:** Add a card to the Step 3 summary grid, matching the existing "Key requirements" card. Low effort, but the information appears once during reading and isn't present at the moment the user is about to start gathering documents (Step 4).
- **Option B — Remove from extraction:** Strip `supportingDocuments` from the prompt, Zod schema, and `AiSummaryData` type. Reduces extraction scope slightly on every summarisation call. Discards the only funder-specific "what to gather" signal the extraction produces.
- **Option C — Merge into the Step 4 preparation checklist:** Pass the extracted list into `ApplicationStep4PrepChecklist` and show it as a second checklist, alongside (not replacing) the standing financial-prep advice, headed "[Funder name] also asks you to submit:". Shown only when the array is non-empty.

## Decision

**Option C — Merge into the Step 4 preparation checklist.**

- `app/(authenticated)/applications/[id]/step/4/page.tsx` parses `ai_summary` before the `draft_status === 'not_started'` branch (previously parsed only later, for question sync) and passes `funderName` and `supportingDocuments` into `ApplicationStep4PrepChecklist`.
- The standing financial checklist (4 hardcoded items) is unchanged and always shown — it reflects Grant Pathway's own policy advice (treasurer involvement, budget projections), not funder-specific requirements, so it is not a candidate for replacement.
- The funder-specific list is additive, not a replacement, and may overlap with the standing checklist (e.g. both can mention annual accounts) — this is accepted rather than deduplicated, since exact-string matching against AI-extracted phrasing is unreliable and the two lists serve different framings (general advice vs. this funder's stated requirement).
- See AC-FR-28-09 (`docs/PRD inputs/acceptance-criteria.md`) and the "Step 4 — Preparation Checklist" content in `docs/PRD-Grant-Pathway.md` Section 7, Screen 7 (previously in the now-retired `screen-requirements.md`).

## Rationale

Option A surfaces the data but at the wrong moment — reading a summary is not the same moment as "go and gather this." Option B throws away the only funder-specific signal the extraction produces, for a marginal token saving. Option C puts the data where it is actually actionable: the existing Step 4 gate that already interrupts the user with "go get your documents" advice, just today with a one-size-fits-all list. No new AI call, no schema change, and no removal of existing Step 4 advice — the two lists sit side by side.

## Proposed extension — repeat the checklist before export (raised 2026-08-19)

**Status: PROPOSED, not decided.**

**Origin: WJ's wife, from her own use of the live service**, and independently the strongest evidence in this file — she is the only person to have completed a genuine application through Grant Pathway (a real Stony Stratford Town Council submission, 2026-08-06, which also found `GAP-41`).

**The suggestion:** show this same checklist a second time, **between Step 4 (writing) and Step 5 (approve and export)**.

**The argument for it, which is a real one.** The checklist currently appears only at the moment the user is about to _start writing_ — before they have written a word. That is the right moment to say "go and gather things", but it is the **wrong moment to be reminded what is still outstanding**, because nothing is outstanding yet. By the end of Step 4 the user has answered every question Grant Pathway asked and **the product's own framing invites them to think they are finished** — the next button is approve and export. ⚠️ **They are not finished:** the funder still wants accounts, a safeguarding policy, a constitution, and — for A B Charitable Trust — **a 2 to 2½ page overview document that Grant Pathway has not helped them write.**

**This interacts directly with the D5 question** (`docs/impact-assessment-supporting-document-questions.md`). A second showing is where "you still have a document to write" lands hardest, and it delivers a meaningful part of that assessment's value **without any of option C's cost** — no extraction change, no writing surface, no export work, no AI usage. It does not replace option C; it makes the gap visible at the point it matters.

**Sketch of the work:** `ApplicationStep4PrepChecklist` already takes `funderName` and `supportingDocuments`; the Step 5 page already parses `ai_summary`. This is largely reuse with different framing text — the heading would need to change from "Before you begin writing" to something like "Before you submit", and the standing financial-prep advice ("gather these before you start") reads oddly at the end and may need different wording or omitting. **Small.**

**Open questions for the decision:**

- Second full showing, or a condensed reminder? A verbatim repeat risks being skimmed as something already seen.
- Does the standing 4-item financial checklist belong there at all, or only the funder-specific list?
- Is it a blocking gate (like Step 4's) or passive information? ⚠️ **A gate the user cannot satisfy inside the product would be a poor gate** — Grant Pathway cannot know whether they have attached their accounts.

## Date Decided

2026-07-10
