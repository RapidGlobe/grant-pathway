---
id: ADR-AI-011
category: AI Integration
status: Decided
---

# ADR-AI-011 — Output Truncation Policy

## Context

Both AI routes (`generate-summary`, `refine-answer`) generate structured JSON and are capped by Bedrock's `max_tokens` parameter — an **output-only** ceiling, distinct from the 1,000,000-token context window `ADR-AI-007` governs on the input side. No document had ever stated what determines these ceilings, or what the service promises when a response genuinely can't fit within one.

`SUMMARY_MAX_TOKENS` (`generate-summary`) and `REFINE_MAX_TOKENS` (`refine-answer`) existed only as bare constants in their route files. `GAP-52` (2026-08-07) raised `SUMMARY_MAX_TOKENS` 4000 → 6000 reactively, after a real truncation incident, with no rationale recorded anywhere. `GAP-92` (2026-08-14) found the identical gap on `refine-answer`: `REFINE_MAX_TOKENS` was 800, with no stated basis. `GAP-93` raised this ADR-shaped gap explicitly — both `ai_usage_log.token_count` (the only persisted usage figure) and every design document were silent on how these ceilings were chosen or what "too large" means from the service's perspective.

## Data

Pulled from `ai_usage_log` and `application_items` on `grant-pathway-dev` (2026-08-14; 151 `guideline_summary` and 170 `refine_answer` requests, real QA-testing usage, not synthetic):

- **`generate-summary`:** total `token_count` (input+output combined — the only figure stored) ranged 3,259–24,735 (median 7,151). This does **not** correlate cleanly with the number of extracted items: one request logged 24,110 tokens for 11 items, another logged 11,838 tokens for 27 items. Input document length dominates the combined total and varies independently of output size, so this figure cannot answer "how close to the 6,000-token output ceiling are we" — no output-only figure existed to check.
- **`refine-answer`:** answer word counts across non-budget items showed a median of 5 words but a **max of 630 words**; funder-stated word limits in the same data ran up to 500 words. `GAP-92`'s own arithmetic put a 500-word answer at ~670 output tokens before the JSON wrapper — already 84% of the old 800-token cap. A 630-word answer is a genuine truncation risk under that cap, not a hypothetical one.

## Options Considered

- **Option A — Find a defensible "too large" threshold at the current ceilings and word it honestly for the user.** Rejected: at 800 tokens, the natural threshold sits at roughly 500 words — a number many funders set as their own limit. Calling a normal, funder-permitted answer length "too large" is not honestly explainable to a user; it reflects a ceiling set too low, not a real size limit.
- **Option B — Raise the ceilings well above observed real usage, so truncation becomes a genuine edge case.** Bedrock only generates the tokens a response actually needs and stops at `stop_reason: end_turn`; a higher `max_tokens` costs nothing in latency or spend unless the model genuinely needs that many tokens. Chosen for `refine-answer`.
- **Option C — Persist output tokens (not just the combined total) so future ceiling decisions are data-driven.** Chosen for both routes, since the data above proved the combined figure can't support this kind of decision.

## Decision

1. **`REFINE_MAX_TOKENS` raised 800 → 3,000.** At ~1.3 tokens/word this covers roughly 2,000+ words of output — comfortably above the highest real answer observed (630 words) and any realistic funder word limit — while remaining a fraction of `generate-summary`'s 6,000 (a narrower, single-answer task doesn't need the same headroom a full multi-section JSON summary does).
2. **`ai_usage_log` gains persisted `input_token_count`/`output_token_count` columns**, populated by all three AI call sites (`generate-summary`, `refine-answer`, `charity.ts`'s `charity_paraphrase`) alongside the existing combined `token_count`. `generate-summary`'s JSON-reprompt-parse-error retry path was found, while wiring this up, to never add its own token usage into any total, combined or split — an existing gap in cost accounting, logged separately as `GAP-95` (not fixed here — out of scope for this decision, which is about output-side headroom, not cost-accounting completeness).
3. **`SUMMARY_MAX_TOKENS` is deliberately left at 6,000, not raised in this pass.** The data above shows the combined `token_count` cannot support a real headroom estimate for this route — the new `output_token_count` column exists specifically to answer that question with real data over time, rather than guessing a second number in the same sitting the first number was found to be unjustified.
4. **The "too large" user-facing message is unchanged in substance** — a distinct, non-retryable error (`response_too_long` / `answer_too_long`, `lib/ai-error-handler.ts`) rather than a generic parse failure, per `GAP-52`/`GAP-92`. Only the ceiling that triggers it moves.

## Rationale

- Output ceilings should be set from measured headroom over real usage, not a round number picked once and left unrevisited — that is exactly how `GAP-52` and `GAP-92` both arose.
- A generous `max_tokens` has no downside: Claude stops generating at natural completion well before a high ceiling in the ordinary case, so the cost of raising it is paid only when genuinely needed. The cost of a low ceiling is a truncated response on ordinary input, which is what happened twice.
- The combined `token_count` field cannot support this kind of decision — it is dominated by input length, which varies independently of output size (demonstrated directly by the `generate-summary` data above). A persisted output-only figure is the minimum needed to revisit `SUMMARY_MAX_TOKENS` responsibly in future.

## Consequences

- `REFINE_MAX_TOKENS` in `app/api/refine-answer/route.ts`: 800 → 3,000.
- Migration `20260814000000_gap93_output_token_tracking.sql`: `ai_usage_log.input_token_count`/`output_token_count` added; `update_ai_slot_token_count` RPC extended to accept and persist both (optional params, backward compatible).
- All three AI call sites (`generate-summary`, `refine-answer`, `charity.ts`) now pass the split alongside the existing combined total.
- `SUMMARY_MAX_TOKENS` (6,000) is unchanged. Revisiting it is a future task, gated on enough real `output_token_count` data existing to show actual headroom — not blocked on this ADR, but not done by it either.
- `GAP-95` (the JSON-reprompt retry's uncounted tokens) is logged as a separate, pre-existing gap, found while implementing this decision but not part of it.

## Source

`GAP-93` (`docs/Implementation Plan/ADR-TRACEABILITY.md`), following the pattern `GAP-52` established for `generate-summary` and `GAP-92` extended to `refine-answer`.

## Date Decided

2026-08-14
