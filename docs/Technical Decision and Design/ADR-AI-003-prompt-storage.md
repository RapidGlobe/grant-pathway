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
- `buildSummaryPrompt(guidelinesText: string): string` — constructs the Step 3 summary prompt
- `buildDraftPrompt(summary: string, charityProfile: CharityProfile, questions: Question[]): string` — constructs the Step 4 draft generation prompt

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
