---
id: PDR-AI-012
category: AI Integration
status: Decided
---

# PDR-AI-012 — Aggregate Word Limit Across Split Sections

## Question

When a free_form funder states a single word limit governing the whole application/response, but the AI (correctly) splits that response into several distinct topic sections, how should Grant Pathway show and enforce that limit — given no single extracted section carries it?

## Context

Found live-testing `guideline-capability-matrix-test-plan.md` GCM-03, 2026-07-27 (Defect Log #3): CPF Trust's guidance caps the whole application (a single email submission) at 500 words. `buildSummaryPrompt()` correctly split this into 3 sections reflecting the funder's own 5 named required pieces of information — merging charity name+description, keeping the core "how the grant would be used" narrative, and splitting out "grant amount requested" as its own budget-flagged section. That splitting is itself correct and was confirmed as a better representation of the source than one undifferentiated card. But none of the 3 resulting section cards shows any word-limit badge, since the 500-word cap belongs to the application as a whole, not to any one of the sections it was split across — so nothing on screen stops the applicant writing well past 500 words in total.

Agreed the same evening (2026-07-27): a live combined word counter shown across the linked cards — a soft nudge, not a hard block, consistent with how Grant Pathway treats every other word/character limit (AC-FR-29-04 only ever hides the approve button for a section's own individually-stated limit; nothing in the product currently hard-blocks on a limit at all).

## Options

- **Option A — New `overallWordLimit` field + live combined counter.** Extend the Step 3 summary extraction with a new optional top-level field, populated only when the guidelines state a single limit spanning multiple sections (never invented, never summed from separate per-section limits). Step 4 sums the live word count of every section carrying no limit of its own and displays it against this aggregate figure, pinned near the approval progress bar so it's visible while scrolling through the linked cards. Each contributing card gets a small badge explaining why it has no limit of its own ("Counts toward N-word total") instead of leaving that unexplained.
- **Option B — Merge the split sections back into one card.** Force a single undifferentiated textarea whenever an aggregate limit is detected, so the existing per-card counter already covers it with no new field or UI. Rejected: this is exactly the "single card" assumption GCM-03 already found to be a worse representation of CPF Trust's own guidance (5 distinct named pieces of information) than the AI's 3-section split — reintroducing it to solve the counter problem would trade a real UX improvement for a display convenience.
- **Option C — Do nothing; leave the gap.** Rejected — the whole reason this is Medium/Low severity rather than ignorable is that a charity can silently exceed a funder's stated cap with no on-screen signal at all.

## Decision

**Option A, approved 2026-07-28.**

`AiSummaryData` (`lib/types.ts`) gains an optional `overallWordLimit: number | null` field. `buildSummaryPrompt()` (`lib/prompts.ts`) instructs the AI to populate it only for free_form funders, only when the guidelines state one limit spanning multiple sections as a group — never invented, never a sum of separately-stated per-section limits. When set, the sections it covers carry no individual `wordLimit` of their own (the limit belongs to the group, not any one member).

Step 4 (`components/application-step4-draft.tsx`) sums the live word count of every narrative section with no individual limit of its own and displays it as `Combined across N linked sections: X / <limit> words`, pinned inside the existing sticky progress-bar region so it stays visible while scrolling the linked cards. It turns amber near the limit and red once exceeded, exactly like every individual per-section counter already does — never disabling Approve or Ready to assemble. Each contributing card shows a small `Counts toward <limit>-word total` badge in place of the (absent) individual limit badge, so its lack of an individual limit reads as intentional rather than a gap.

## Rationale

- Option A is the only option that keeps GCM-03's already-confirmed improvement (a meaningful multi-section split over one undifferentiated card) while still giving the applicant a visible signal for the limit that actually governs their overall submission.
- The badge on each contributing card exists because a card showing no limit at all, with no explanation, would read as another missing-data gap rather than a deliberate design choice — the same reasoning already applied to `PDR-AI-010`'s reframed financial-section guidance.
- Consistent with every other limit already in the product (AC-FR-29-04): a soft, visually-escalating nudge, never a hard block. A charity is still free to submit over the stated total; Grant Pathway's job is to make that visible before they do, not to prevent it.

## Implementation status

**Built 2026-07-28.** `lib/types.ts` (new field), `lib/prompts.ts` (extraction rule + schema example), `app/api/generate-summary/route.ts` (zod schema), `app/(authenticated)/applications/[id]/step/4/page.tsx` (prop plumbing from the already-parsed `ai_summary`, no new DB column needed), `components/application-step4-draft.tsx` (combined counter + per-card badge). No database migration — `overallWordLimit` lives in the existing `applications.ai_summary` JSONB column, read the same way `sections`/`governanceFacts` already are.

Automated coverage added: `__tests__/step4-combined-word-limit.test.tsx` (3 tests) — verifies the combined count only sums sections with no individual limit of their own, updates live as text is typed in any contributing section, is unaffected by typing in a section that has its own separate limit, turns red once the aggregate is exceeded, and renders nothing at all when `overallWordLimit` is null. `tsc --noEmit`, `eslint --max-warnings 0`, and the full `vitest` suite (101 tests, including the 3 new ones) all pass.

**Live-verified by WJ, 2026-07-28:** retested CPF Trust — `overallWordLimit` correctly extracted (500), the combined counter displayed and updated live across the 3 linked sections (confirmed showing "600 / 500 words" in red once over), and the badge/soft-nudge behaviour worked as designed.

**Follow-up, same day:** WJ found the counter easy to miss against the sticky progress bar and asked for more visual weight. Bumped from `text-[12px]` to `text-[14px] font-bold`, with the resting-state colour darkened from `#64748B` to `#334155` for better contrast now that the text is bold. Confirmed by WJ as an improvement on retest.

## Date Decided

2026-07-28.
