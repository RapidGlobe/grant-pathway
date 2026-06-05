---
id: ADR-AI-010
category: AI Integration
status: Decided — Phase 1 (pre-processing) pre-launch; streaming deferred post-v1
---

# ADR-AI-010 — AI Summary Performance Strategy

## Context

ADR-AI-005 chose batch (non-streaming) responses with an animated progress bar for all AI generation steps. That decision was made during the design phase, when 30–60 seconds was an estimated range with no empirical baseline.

Funder test cycles (2026-06-01 to 2026-06-04) produced the first real performance data across three funders and document types:

| Test      | Funder                     | Document type     | Pages | Summary time |
| --------- | -------------------------- | ----------------- | ----- | ------------ |
| IT-LBF-06 | Lloyds Bank Foundation     | Structured PDF    | 3     | 24 s         |
| IT-WC-06  | Walton Charity             | Paste (text only) | N/A   | 25 s         |
| IT-GWF-06 | Garfield Weston Foundation | Narrative PDF     | 11    | 33–37 s      |

NFR-01 specifies two tiers of acceptable performance:

- **Standard tier** (≤8 pages): under 30 seconds
- **Large document tier** (>8 pages): under 45 seconds

Current results are within NFR-01 for all tested funders. However, three observations raise a pre-launch concern:

1. **Clothworkers' Foundation** is a scheduled test funder and publishes multi-document PDF packs. Projections from the 11-page Garfield Weston baseline suggest a 3-form Clothworkers pack could reach 40–47 seconds — within the large-document tier limit, but close to the ceiling.
2. **No headroom is built in.** The current pipeline does zero pre-processing — the full extracted text is passed to Bedrock verbatim, including page headers, footers, eligibility criteria sections, boilerplate legal text, and other content that does not inform the summary.
3. **The user experience during the wait is a static progress bar.** If a document takes 40+ seconds, the bar holds at ~90% for an extended period with no visible progress signal. This may cause users to assume failure and reload.

The question being decided here is: **what, if anything, should be changed to improve summary performance and perceived responsiveness before production launch?**

---

## Current implementation

- `/api/generate-summary` calls AWS Bedrock (`claude-sonnet-4-6`) in batch mode (ADR-AI-005).
- The full PDF text (extracted by `lib/extract-text.ts`) is passed directly to the prompt with no reduction.
- `SUMMARY_MAX_TOKENS = 4000` (response size cap).
- `export const maxDuration = 90` (Vercel function timeout — ADR-AI-006).
- The client shows a timed asymptotic progress bar (DDR-CS-005) — not connected to actual response progress.

---

## Options Considered

### Option A — No change

Accept current batch behaviour. Performance is within NFR-01 for all tested funders. Revisit only if a specific funder breaches the 45-second limit.

**Strengths:** Zero implementation effort. No risk of regression. NFR-01 is currently met.

**Weaknesses:** No headroom. If a multi-PDF Clothworkers or Wolfson pack exceeds 45 seconds, the fix becomes urgent. No improvement to user-perceived responsiveness.

---

### Option B — Document pre-processing (text reduction before AI call)

Before passing extracted text to Bedrock, apply a lightweight cleaning pass:

1. Remove repeated whitespace, form feed characters, and PDF artefacts
2. Strip page headers and footers (detected via repeated short lines at consistent positions)
3. Remove purely boilerplate sections — e.g. "How to apply", "About us", "Contact details" — that do not inform the summary
4. Truncate at a configurable character ceiling (e.g. 20,000 characters) with a logged warning if truncation occurs

**Expected impact:** 15–25% reduction in input tokens for typical funder PDFs. For Garfield Weston (11 pages), this would move the estimate from 33–37 seconds toward 26–30 seconds.

**Strengths:** Low implementation risk — entirely within the existing pipeline. No changes to the API route contract, client, or progress bar. Can be implemented as a single `lib/preprocess-text.ts` module inserted into the existing route. Reversible: a feature flag can disable pre-processing per route if it causes quality issues.

**Weaknesses:** Heuristic-based stripping may occasionally remove relevant content if a funder embeds eligibility criteria in a section that matches a "boilerplate" pattern. Must be tested against all scheduled funders. Does not improve perceived responsiveness — the user still waits for the batch response.

---

### Option C — Streaming responses

Redesign `/api/generate-summary` to stream tokens from Bedrock to the client using `ReadableStream`. The client renders the summary text as it arrives.

**Strengths:** User sees content building immediately — perceived responsiveness is dramatically improved even if total time is unchanged. Aligns with the streaming approach used by most modern AI interfaces.

**Weaknesses:**

- Requires replacing the batch `fetch` in the client with `EventSource` or a streaming `fetch` reader — a non-trivial client change.
- The asymptotic progress bar (DDR-CS-005) must be replaced with an in-place text render — a design change requiring new UI work.
- `/api/generate-summary` currently saves the full summary to Supabase (`ai_summary` column) on completion. Streaming complicates this — the route must accumulate the stream, then save, while simultaneously forwarding tokens to the client.
- The `generate-draft` route (Step 4) returns a structured JSON array of question answers. Streaming partial JSON is significantly more complex to parse incrementally and is out of scope for v1.
- Total implementation time: estimated 4–6 hours. Higher regression risk.

---

### Option D — Hybrid: pre-processing + streaming

Implement Option B first (pre-processing) to reduce input tokens and bring performance headroom within range. Implement Option C (streaming) post-v1 once the batch pipeline is stable.

---

## Decision

**Option D — Hybrid approach, phased.**

- **Pre-v1 (pre-launch):** Implement Option B (document pre-processing) in `/api/generate-summary`. Target: reduce median summary time by 15–25% and build headroom before the large-document tier ceiling.
- **Post-v1:** Evaluate Option C (streaming) as a quality-of-life improvement. This will require a design change to Step 3 (replace progress bar with incremental text render) and is scoped as a post-launch enhancement.

The `generate-draft` route (Step 4) is **excluded** from streaming consideration in v1. Structured JSON streaming is a separate, more complex problem.

---

## Rationale

- Pre-processing is additive — it slots into the existing pipeline without changing the API contract, the client, or the UI. Risk is low.
- The 15–25% token reduction creates meaningful headroom against the 45-second large-document tier limit without requiring a UI redesign.
- Streaming improves perceived responsiveness but does not reduce actual AI processing time. For v1, where funder documents are ≤11 pages and within NFR-01, perceived responsiveness is secondary to shipping a stable product.
- Streaming the summary route while leaving `generate-draft` in batch mode would create an inconsistent UX — one step streams, the other does not. A coherent streaming strategy (if adopted) should cover both routes simultaneously, which is post-v1 scope.
- ADR-AI-005 is not superseded — batch mode remains the decision for v1. This ADR documents the performance optimisation strategy that operates within that batch architecture.

---

## Consequences

- A `lib/preprocess-text.ts` module is to be created and inserted into `/api/generate-summary` before the Bedrock call. It must:
  - Strip PDF artefacts and excess whitespace
  - Remove detectable boilerplate sections (configurable patterns)
  - Enforce a character ceiling (default 20,000 characters) with a logged warning on truncation
  - Return the cleaned string — pure transformation, no side effects
- Pre-processing must be tested against all scheduled funders before production deployment (Clothworkers', Henry Smith, Wolfson, Idlewild, A B Charitable Trust).
- If pre-processing causes a measurable quality regression in any funder's summary, the relevant section patterns must be excluded from stripping. A feature flag (`DISABLE_TEXT_PREPROCESSING=true`) must be available as an escape hatch.
- Post-v1 streaming evaluation is logged as a future enhancement — see GAP-27 update below.
- NFR-01 large-document tier (≤45s) is retained as the performance target. If any funder exceeds this after pre-processing is applied, escalate to streaming immediately.
- ADR-AI-005 (batch mode) remains in force for v1. This ADR does not change that decision.

---

## Related decisions

- ADR-AI-005 — AI Response Mode (Streaming vs Batch) — superseded for streaming; batch retained for v1
- ADR-AI-006 — Function Execution Timeout (`maxDuration = 90`)
- ADR-AI-007 — Context Window Management (text length advisory)
- NFR-01 — AI summarisation performance targets (two-tier: ≤30s standard, ≤45s large)
- GAP-27 — Performance observability (latency logging in `generate-summary`)

## Source

- Funder test cycle performance observations: 2026-06-01 to 2026-06-04
- NFR-01 (revised 2026-06-04, two-tier performance targets)
- Session investigation: streaming vs pre-processing options (2026-06-04)

## Date Decided

2026-06-05
