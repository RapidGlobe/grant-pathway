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

## Date Decided

2026-07-10
