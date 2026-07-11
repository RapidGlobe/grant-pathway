---
id: PDR-AI-007
category: AI Integration
status: Decided
---

# PDR-AI-007 — Budget/Financial Question Over-Limit Messaging and Trim Assistance

## Question

When a budget/financial question (`is_budget_question`) exceeds its word/character limit, what should Grant Pathway show and offer the charity, given that AI assist is disabled for these questions and the standard over-limit message ("...trim it or use AI...") doesn't apply?

## Context

Confirmed live in `components/application-step4-draft.tsx`: the entire "Help me improve this" block — including the red over-limit warning shown for narrative questions (`AC-FR-29-04`/`D-LBF-02`) — is wrapped in `{!q.isBudgetQuestion && (...)}`. This means budget/financial questions currently show **no over-limit message at all** — just the raw counter (e.g. "503 / 250 words"). The "Before you approve" panel is still correctly hidden while over the limit (gated on `!isOver`), but the charity sees no explanation for why, and — because AI assist is unavailable here by design — no assisted way to fix it either.

First found live during Clothworkers Foundation testing (2026-07-04, IT-CW-09/IT-CW-08 area) and approved by WJ the same day; formalised here as a PDR on 2026-07-11 during the BRD review, alongside a related but distinct gap in the messaging itself.

## Options

**For the message:**

- **Option A — No additional message (status quo):** leave the approve panel silently absent. Confusing — the charity has no way to know why they can't proceed.
- **Option B — Reuse the exact narrative over-limit message** ("...trim it or use AI to bring it within the limit..."): inaccurate for budget questions, since AI assist is disabled for them — actively misleading.
- **Option C — A budget-specific message that omits the AI option entirely.**

**For assistance bringing the answer within limit:**

- **Option D — Nothing further; charity trims manually by hand.** Simplest, but tedious for a large overage (e.g. cutting 503 words to 250 by eye).
- **Option E — Deterministic "Trim to limit" button, no AI/LLM call at all.** Mechanically cuts the text to the last complete sentence within the limit — a starting point, not a rewrite.
- **Option F — Scoped AI assist on budget questions** (condensing prose while guaranteeing no figures/dates altered): reopens the deliberate design decision that AI never touches financial content, and needs its own scrutiny.

## Decision

**Option C (message) + Option E (deterministic trim), approved 2026-07-04. Option F rejected for now.**

Message, shown in place of the narrative version, specifically for `is_budget_question` items over their limit:

> "Your answer exceeds the funder's word limit. Please trim it — AI assist isn't available for financial figures, so this needs to be adjusted manually before approving."

(Adapt "words" to "characters" per the funder's `limit_type`, matching the pattern used for the narrative message.)

Alongside the message, a **"Trim to limit" button** — mechanically cuts the text to the last complete sentence that fits within the limit, giving the charity a starting point instead of manually counting down from e.g. 503 to 250 words by hand. No API call, no LLM involved — chosen specifically because it doesn't touch the existing "AI never sees financial figures" trust guarantee.

**Option F (scoped AI assist on budget questions) is rejected for now** — only to be reconsidered if the deterministic trim proves insufficient in practice.

## Rationale

- Option A leaves a confusing silent gap exactly where the charity most needs guidance — the one question type with no AI safety net at all.
- Option B would actively point the charity toward an option ("use AI") that does not exist for this question type — worse than no message.
- Option C is the only messaging option that is both present (unlike A) and accurate (unlike B) — the same contextual, accurate-messaging principle already applied in `PDR-AI-006`.
- Option D leaves the charity doing tedious manual arithmetic on a long overage with no help at all.
- Option E gives real assistance without reopening a trust-sensitive design decision — a deterministic, non-AI mechanism is a materially different risk profile from AI touching financial figures.
- Option F is deliberately deferred rather than rejected outright — it remains available if E turns out not to be enough, but should not be built speculatively ahead of that evidence.

## Implementation status

**Decided, not yet built — held pending the end of the current testing session (WJ, 2026-07-04).** Build tasks, both in `components/application-step4-draft.tsx` (or equivalent budget-card rendering logic):

1. A budget-specific over-limit message block — parallel to the existing narrative one, but without any AI-assist reference — rendered when `q.isBudgetQuestion && isOver`.
2. A deterministic "Trim to limit" button alongside it, cutting to the last complete sentence within the limit — no AI/LLM call.

Log as a defect/enhancement note against the Clothworkers Foundation test plan (where it was found) as part of the end-of-testing batch pass.

## Date Decided

2026-07-04 (fix approved); formalised as PDR-AI-007 on 2026-07-11.
