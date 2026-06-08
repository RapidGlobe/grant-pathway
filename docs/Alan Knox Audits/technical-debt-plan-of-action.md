# Plan of Action — Technical Debt

**Source article:** [Technical Debt: Engineering for Vibe Coders — Alan Knox](https://alanknox.com/technical-debt-engineering-for-vibe-coders/)
**Reviewed:** 2026-06-05
**Completed:** 2026-06-05
**Related ADRs / records:** `docs/Implementation Plan/ADR-TRACEABILITY.md`, `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`

---

## Why this mattered for Grant Pathway

Knox's core argument is that technical debt is not inherently harmful — unmanaged, invisible debt is. Grant Pathway is built with significant AI assistance, which means shortcuts accumulate faster than in traditionally authored codebases: AI sessions have no memory of prior decisions, generate inconsistent patterns across files, and do not flag the tradeoffs they make. Without explicit mechanisms to surface and document debt, it becomes invisible by default.

The review confirmed that Grant Pathway already had several debt-management structures in place, and identified one gap (intentional shortcuts not being formally flagged at the point they are made). The steps below record what was already in place and what was strengthened.

---

## Steps completed

### Step 1 — Intentional debt documented via the GAP system

**Knox principle addressed:** _Identify intentional shortcuts; document temporary decisions so debt is visible and recoverable._

The ADR-TRACEABILITY.md file was created on 2026-05-20 as a formal mechanism to surface ADR consequences that had no corresponding implementation task. Every gap is assigned a GAP number, a severity (High / Medium / Low), a description, and a resolution target. This is the primary vehicle for turning accidental debt into intentional, documented debt.

At the Phase 4→5 gate (2026-05-22), a full ADR consequences sweep identified 26 GAPs (GAP-01 to GAP-26). Each was either:

- Resolved immediately (e.g. GAP-06: missing `SUPABASE_DB_PASSWORD` in `.env.example`; GAP-08: file validation utility missing; GAP-14: `@axe-core/react` not installed)
- Deferred with a documented reason and target phase (e.g. GAP-21: Sentry route tagging deferred to P5.3; GAP-23: `loading.tsx` skeleton wiring deferred to P5.3)
- Escalated as a pre-launch blocker (e.g. GAP-26: application stub page that renders "stub" rather than redirecting — marked Must Fix before P5.5)

Further gaps were raised during funder testing (GAP-27: character limits not supported; GAP-28: non-text questions extracted as text) and resolved within the same phase.

**Outcome:** All known intentional shortcuts are recorded with a severity level and resolution target. No deliberate deferral is undocumented.

### Step 2 — Phase gates enforce a debt sweep before new work begins

**Knox principle addressed:** _Prioritise refactor points; avoid layered quick fixes by reviewing before the next iteration begins._

Every phase transition in Grant Pathway requires a formal ADR consequences sweep before the first task of the new phase can begin. This is documented in AGENTS.md as a mandatory pre-task check and enforced by the phase gate rows in ADR-TRACEABILITY.md.

The rule was added to AGENTS.md specifically because implementation tasks are written feature-first and ADR consequences are spec-first — without a mandatory sweep, the gap between the two is invisible until something breaks. The phase gate is the structural answer to Knox's "avoid layered quick fixes" principle: each phase starts with known debt cleared or explicitly deferred, not with accumulated unknowns.

### Step 3 — Root cause required for every defect fix

**Knox principle addressed:** _Avoid layered quick fixes; treat shortcuts as conscious tradeoffs, not silent workarounds._

The CHANGELOG discipline requires that every defect fix records the root cause, not just the symptom. Examples from Phase 4 funder testing:

- **D-HSF-03** (Step 4 showing "No questions found" after regeneration) — two previous fixes addressed symptoms (upsert hardening, `revalidatePath`). The root cause was identified as a Next.js Router Cache timing issue combined with `redirect()` inside `startTransition`. The fix moved sync to the Server Action and used hard navigation (`window.location.href`) to bypass the cache. Both earlier fixes are retained as resilience layers, documented explicitly.
- **D-WF-04** (re-export warning bypassed after re-open) — root cause was checking `isExported` (session state) rather than `lastExported` (DB state). The quick fix would have been an additional session flag; the correct fix was reading from the authoritative source.
- **GAP-26** (application stub page) — the stub was never connected to the routing logic. Documenting it as a High severity blocker prevents it being buried under feature work and discovered during final testing.

**Outcome:** Layered quick fixes are explicitly discouraged in the AGENTS.md rule set and in the CHANGELOG convention of documenting root causes.

### Step 4 — Modular boundaries maintained across AI-generated code

**Knox principle addressed:** _Use modular boundaries where feasible; separate exploratory components from core components._

Grant Pathway's architecture separates concerns into clearly bounded modules that an AI session cannot accidentally collapse:

- `lib/` — pure utility functions (`prompts.ts`, `preprocess-text.ts`, `ai-error-handler.ts`, `rate-limit.ts`, `file-validation.ts`) with no framework dependencies
- `actions/` — Next.js Server Actions only; no business logic lives in components
- `app/api/` — API routes with a consistent auth → ownership → rate-limit → AI call → DB write pattern
- `components/` — UI only; all data mutations go through Server Actions

This separation means AI-generated code in one layer cannot introduce hidden dependencies on another. Any violation (e.g. a Server Action importing directly from a component) is caught by the ESLint and TypeScript checks put in place by ADR-OPS-008.

### Step 5 — Linting infrastructure closes the "invisible accumulation" loop

**Knox principle addressed:** _Automation reduces repetitive reviews; AI-generated code varies significantly between sessions._

The full linting stack (Prettier + ESLint + Husky pre-commit + GitHub Actions CI + TypeScript strict flags) implemented on 2026-06-05 via ADR-OPS-008 is the direct implementation of Knox's automation recommendation. See the separate [Linting Plan of Action](linting-plan-of-action.md) for full detail.

The two sets of work are complementary: the GAP/phase gate system manages structural and architectural debt; the linting stack manages code consistency debt. Together they cover both layers Knox identifies — invisible structural shortcuts and invisible style/type accumulation.

---

## Limits acknowledged

Knox is explicit that documenting debt and maintaining modular boundaries does not eliminate debt — it makes it visible and manageable. Grant Pathway still carries known deferred items (GAP-21, GAP-22, GAP-23, GAP-25 from the P5.3 backlog; `noUncheckedIndexedAccess` from ADR-OPS-008). These are intentional, documented, and have resolution targets. That is the correct state per Knox's framework.

---

## Outstanding actions

| Item                       | What it is                                                                      | Target      |
| -------------------------- | ------------------------------------------------------------------------------- | ----------- |
| GAP-21                     | Sentry `withScope` + route tag missing on AI routes                             | P5.3        |
| GAP-22                     | Session timeout page does not show "signed out due to inactivity" message       | P5.3        |
| GAP-23                     | No `loading.tsx` Suspense boundaries on authenticated routes                    | P5.3        |
| GAP-25                     | Zod validation missing on `actions/applications.ts` and `actions/auth.ts`       | P5.3        |
| `noUncheckedIndexedAccess` | TypeScript flag deferred — may surface existing issues requiring targeted fixes | Post-launch |
