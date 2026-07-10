---
id: ADR-AI-003
category: AI Integration
status: Decided
---

# ADR-AI-003 — Prompt Storage

## Context

Grant Pathway uses two AI prompts: one for generating the funder guidelines summary (Step 3) and one for generating draft answers (Step 4). Prompts are the core intellectual property of the product. They must be maintainable — updates to prompt wording should not require changes across multiple files.

## Options Considered

- **Option A — Prompts defined inline in API route handlers:** Prompts are written directly in the API route files where they are used.
  - Weaknesses: Prompts are scattered across route files. Harder to review, compare, and update. Mixes infrastructure code with IP.

- **Option B — Centralised prompt file (`lib/prompts.ts`):** All prompts defined as exported constants or functions in a single TypeScript file. API routes import from this file.
  - Strengths: Single source of truth. Easy to review and update prompts. Prompts are separate from routing logic. Version control diffs clearly show prompt changes.

- **Option C — Database-stored prompts:** Prompts stored in the database and fetched at runtime.
  - Strengths: Could allow runtime prompt updates without deployment.
  - Weaknesses: Adds database dependency to every AI call. Prompts are not visible in code review. Overkill for v1 with a small, stable prompt set. Deployment is already fast on Vercel.

- **Option D — Environment variable prompts:** Prompts stored as environment variables.
  - Weaknesses: Environment variables are not designed for multi-line text. Hard to maintain. Not version-controlled in a readable way.

## Decision

**Option B — All prompts are defined as exported constants or builder functions in `lib/prompts.ts`.**

The file exports:

- `MODEL` — the Anthropic model identifier
- `MONTHLY_CAP` / `APPROACHING_LIMIT_THRESHOLD` — shared AI usage-cap constants (ADR-AI-008, ADR-SEC-005)
- `AI_SYSTEM_PROMPT` — the shared system prompt used by all AI routes
- `buildSummaryPrompt(guidelinesText: string, charity: CharityContext | null): string` — constructs the Step 3 summary prompt
- `buildRefinePrompt(questionText: string, answerText: string, wordLimit: number | null): string` — constructs the refine-on-request prompt used by `/api/refine-answer` (S6.6), which rewords/improves a charity-written answer

`buildDraftPrompt(questions: ApplicationQuestion[], charity: CharityContext, aiSummary: string): string` is still physically present in `lib/prompts.ts` (and still covered by `__tests__/prompts.test.ts`), but it is dead code — no API route imports or calls it. See the Note below.

## Rationale

- Single source of truth for all AI prompts.
- Prompts are version-controlled alongside the code — changes are visible in Git diffs.
- Separates prompt IP from routing infrastructure.
- Product Decision PDR-AI-002 specifies `lib/prompts.ts` as the prompt location.

## Consequences

- AI API routes import from `lib/prompts.ts` — they do not contain prompt text.
- Changes to prompts require a deployment, but Vercel deployments are fast and automated.
- `lib/prompts.ts` should be well-commented to document the intent of each prompt section.
- The `MODEL` constant in `lib/prompts.ts` is the single place to update the Claude model version.

## Source

Product Decision PDR-AI-002.

## Date Decided

2026-04-17

## Note — 2026-07-10

This ADR's Decision section described `buildDraftPrompt` as one of the file's live exports, generating Step 4 draft answers directly from the charity profile and AI summary. That model was abandoned on 2026-05-28 in favour of a charity-authored Q&A model: the charity writes each answer themselves, and AI only assists on request via `buildRefinePrompt` (`/api/refine-answer`), which rewords/improves a user-written answer — it never generates one from scratch. The export list above has been corrected to match the live file (`lib/prompts.ts`, verified 2026-07-10). `buildDraftPrompt` itself was not deleted from the codebase and still has test coverage, but no route calls it — it is dead code, not a live export, as of this correction. See `ADR-AI-004`'s matching 2026-07-10 note for the corresponding correction to the Step 4 prompt-construction example. This ADR's own Context section above (unedited, original 2026-04-17 text) still describes "one [prompt] for generating draft answers (Step 4)" — this is the same stale premise this note corrects; left as-is per the convention of not rewriting original ADR text, but flagged here so the two sections aren't read as contradicting each other by accident.

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Decision section's export list corrected: `buildDraftPrompt` removed as a described live export (it is dead code, unused since the 2026-05-28 charity-authored redesign) and replaced with `buildRefinePrompt`, `MONTHLY_CAP`, `APPROACHING_LIMIT_THRESHOLD`, and `AI_SYSTEM_PROMPT` to match the actual current exports of `lib/prompts.ts`. See matching correction in `ADR-AI-004`. |
