---
id: PDR-AI-002
category: AI Integration
status: Decided
---

# PDR-AI-002 — Prompt Strategy

## Question

Will AI prompts be hardcoded in the application, stored in the database, or managed through a configuration file?

## Context

AI prompts are the instructions sent to the Claude API that shape the quality and style of the outputs. Grant Pathway needs prompts for at least two scenarios: funder guideline summarisation and draft answer generation. The way prompts are managed affects how easily they can be improved over time — hardcoded prompts require a code change and redeployment to update, while database-stored prompts can be updated without touching the codebase. However, database-stored prompts add complexity. Given that prompt quality will need to be refined based on user feedback (DR-SM-002), the ability to iterate quickly on prompts post-launch is an important consideration. System prompts also need to enforce the plain English, charity-focused tone of voice established in the branding guidelines.

## Options

- **Option A — Hardcoded in application code:** Prompts written directly in the TypeScript source files where API calls are made. Simple to implement and version-controlled, but requires a code change and redeployment for every prompt update.
- **Option B — Stored in the database (Supabase):** Prompts stored as rows in a database table, fetched at runtime. Allows updates without redeployment but adds significant complexity and removes automatic version control.
- **Option C — Stored in a configuration file:** Prompts centralised in a dedicated file (e.g. `lib/prompts.ts`), separate from API call logic. Version-controlled in git, easy to locate and review, requires redeployment to update but Vercel deploys in under 2 minutes.

## Decision

**Option C — Prompts stored in a dedicated configuration file (`lib/prompts.ts`).**

All AI prompts — including the system prompt, funder guideline summarisation prompt, and draft answer generation prompt — will be defined as named exports in a single `lib/prompts.ts` file. API call functions will import from this file. Prompt updates require editing this file and redeploying to Vercel.

The prompts will enforce:

- Plain English, charity-focused tone of voice (per branding guidelines)
- Appropriate framing for grant writing context
- Instructions to stay within the scope of the provided funder guidelines

## Rationale

Centralising prompts in a dedicated configuration file strikes the right balance for v1. It keeps prompts cleanly separated from API call logic, making them easy to find, review, and iterate on as user feedback informs prompt improvements (DR-SM-002). Git version control provides a full history of prompt changes without any additional tooling. The redeployment overhead is negligible on Vercel. Database-stored prompts (Option B) would add unnecessary complexity for a solo developer at this stage and can be revisited if non-developer prompt editing becomes a requirement in a future phase.

## Date Decided

2026-04-16
