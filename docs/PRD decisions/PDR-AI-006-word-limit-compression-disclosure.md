---
id: PDR-AI-006
category: AI Integration
status: Decided
---

# PDR-AI-006 — Word-Limit Compression Reliability Disclosure

## Question

When a user is over a funder's word/character limit and uses "Help me improve this," the AI is instructed to compress the answer to fit (FR-30, D-LBF-02) — but LLMs cannot reliably hit an exact word or character count, since they generate text token by token without literally counting as they go. When the AI's suggestion is still over the limit after refining, how — and where — should Grant Pathway communicate this to the user?

## Context

Found live during Clothworkers Foundation testing (IT-CW-09, 2026-07-04): a 200-word test answer against a 50-word limit was refined by AI assist down to 60 words — closer, but still over. This is expected behaviour for the underlying technology, not a defect in this application's implementation, but the average charity-sector user is unlikely to know that AI has this limitation. Without an explanation, a user seeing "60 / 50 words" immediately after clicking "Help me improve this" may reasonably conclude the feature is broken, rather than understanding it did what it could and a bit more manual trimming is needed.

The existing over-limit message ("Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving," per D-LBF-02/FR-30) is shown before AI assist is used. There is currently no message specific to the case where AI assist has been used and the result is still over.

## Options

- **Option A — No additional messaging (status quo):** Rely on the existing over-limit message and the word/character counter alone. Simplest, but leaves the user to infer on their own why the AI "didn't fix it."
- **Option B — Blanket disclaimer on every AI assist use near a limit:** Show a general "AI may not always hit an exact word count" note every time "Help me improve this" is used on a question with a limit, regardless of outcome. Consistent, but adds noise to the majority of cases where the AI does land within the limit — risks alarm fatigue and undermines confidence in AI assist generally.
- **Option C — Conditional inline message, shown only when the suggestion is still over the limit:** Add a short, specific note inside the "Suggested improvement" panel itself, appearing only when the returned suggestion's own word/character count still exceeds the limit. Names the actual shortfall and tells the user what to do next.

## Decision

**Option C — Conditional inline message, shown only when the AI's suggestion is still over the limit.**

Suggested wording, appearing directly under the "Suggested improvement" text when applicable:

> "This suggestion is still \[N\] words over the limit — AI can't always hit an exact word count. Check the counter and trim it further, or try again."

(Adapt "words" to "characters" for character-limited questions, per the funder's `limit_type`.)

**Secondary — user guide update:** `docs/User Guide` Section 7 ("Getting AI Help") currently reads: _"The AI will refine the structure and clarity of your answer while keeping your original wording and staying within the word limit."_ This overstates what the feature reliably does. Revise to set accurate expectations up front:

> "Click **Help me improve this** beneath any answer to ask the AI to refine the text. The AI will refine the structure and clarity of your answer while keeping your original wording, and will try to bring it within the word or character limit if you are over. AI can't always hit an exact count, though — check the counter after accepting a suggestion, and trim further by hand if it's still over."

**Implementation status:** The user guide wording is being updated now (see Document History). The in-app conditional message (Option C, inline in the Q&A interface) is a decided-but-not-yet-built product change — needs a task raised against `components/application-step4-draft.tsx` (or equivalent) to compare the suggestion's own word/character count against the limit and render the message when it's exceeded.

## Rationale

Surfacing the limitation only when it's actually relevant (Option C) keeps trust intact for the majority of cases where AI assist succeeds, while being honest and actionable exactly when a user needs it — the same contextual pattern already used elsewhere in the product (budget-card warnings, eligibility mismatch messaging) rather than a blanket disclaimer that would train users to ignore AI assist messaging generally. Revising the user guide closes the gap between documented and actual behaviour regardless of when the in-app message ships.

## Date Decided

2026-07-04
