---
id: PDR-AI-009
category: AI Integration
status: Decided
---

# PDR-AI-009 — AI Refine Relevance-Check Consistency

## Question

When a charity's answer text doesn't genuinely address the question it's attached to (irrelevant filler, boilerplate, off-topic content), what should "Help me improve this" (`buildRefinePrompt()`, `lib/prompts.ts`) do — consistently, regardless of whether the answer is over or under its word/character limit?

## Context

WJ reviewed two live scenarios from Henry Smith Step 4 testing (screenshots supplied 2026-07-16): "Help me improve this" declined to touch a clearly irrelevant/off-topic test answer when it was over its word limit, but passed the same kind of content straight through unchanged — polished, not flagged — when the answer was under its limit.

Investigation (2026-07-17) found this is not a designed safeguard misbehaving — it's the absence of one. `buildRefinePrompt()` contains no relevance-check instruction at all, in either direction. The over-limit case happens to sometimes trigger a decline because the model is separately instructed to compress the answer to fit the limit ("cut less essential detail... rather than trying to preserve every sentence") and, faced with content that has no essential detail to preserve, occasionally produces a refusal-shaped `refinedText` instead of a compressed one. The under-limit case has no such pressure, so the model just does its ordinary structure/grammar pass and lets clearly irrelevant content through untouched. Both behaviours are emergent side effects of unrelated instructions, not a rule anyone wrote — which is why they don't agree with each other.

`DR-AI-003`'s Option A (mandatory human review checklist before approval) is the only actual safety net against irrelevant AI-touched content reaching a submission today. WJ: "A human checklist will not be enough, let's refine the prompt to make it consistent and tighter."

## Options

- **Option A — Always decline, flag clearly, no rewrite produced.** Consistent and the strongest signal, but `refine-answer/route.ts` and the `refinedText`-only JSON contract have no way to represent "declined" distinctly from "here is your polished text" — the UI would need a new response shape and a new panel state to show anything other than a rewrite. Not achievable as a prompt-only change.
- **Option B — Always polish, never decline.** Removes the one case where the model currently pushes back at all (the over-limit decline), extending today's under-limit behaviour to both cases. Simplest, prompt-only, no API/UI change — but it's the opposite of "tighter": it deletes the model's own signal entirely and leaves `DR-AI-003`'s checklist as the sole safeguard, which is exactly what WJ said isn't enough on its own.
- **Option C — Always polish, but prepend a clearly-flagged warning when the content doesn't address the question.** The model always attempts the requested structure/clarity pass (so behaviour no longer depends on word-limit status), but is also instructed to judge whether the answer plausibly addresses the question at all, and — if not — prepend a distinct, unmissable warning line to the same `refinedText` string. No new field, no API change, no UI change: the existing "Suggested improvement" panel already renders `refinedText` as-is, so the warning appears inline automatically.
- **Option D — Leave as-is (status quo).** Rejected — this is the exact inconsistency WJ raised; no change is not an option here.

## Decision

**Option C, approved 2026-07-17.**

`buildRefinePrompt()` will be extended with an explicit, limit-independent instruction: always perform the requested structure/clarity/grammar improvements, but also judge whether the answer text plausibly attempts to address the question it's attached to. If it clearly does not (e.g. placeholder/filler text, boilerplate unrelated to the question, or content answering a different question entirely), prepend a single, clearly-marked warning line to the `refinedText` output — before the polished text, not instead of it — so a reviewing human sees it immediately rather than having to notice its absence. Exact wording of the warning line and the precision of "clearly does not address the question" (avoiding false positives on merely thin or brief-but-genuine answers) is an implementation detail to be verified against real test cases, not re-litigated here.

No change to the `refine-answer` API response shape (`{ refinedText: string, approachingLimit: boolean }`) or to any UI component — the warning is carried inside the existing single string field.

## Rationale

- Option A was ruled out because it isn't achievable without also reworking the API contract and the Step 4 UI — a materially larger change than "refine the prompt," which is specifically what WJ asked for.
- Option B was ruled out because it resolves the inconsistency by deleting the only existing signal, which runs directly counter to WJ's stated goal of making the safety net _tighter_, not looser.
- Option C is the only option that is simultaneously consistent (the same rule applies regardless of word-limit status), additive to `DR-AI-003`'s human checklist rather than a replacement for it (a louder, harder-to-miss signal, not a new automated gate), and a prompt-only change with no knock-on API/UI work — matching WJ's own framing of the fix.
- Option D is rejected on its face — the inconsistency itself is the problem being solved.

## Implementation status

**Built 2026-07-17.** `buildRefinePrompt()` (`lib/prompts.ts`) now carries the relevance-check instruction described above, plus a new exported constant `REFINE_IRRELEVANT_WARNING` holding the exact warning line (kept as a named export so the wording exists in one place, not duplicated across the prompt and any verification code). The instruction is explicit that the model must never decline outright and must apply the relevance judgement identically regardless of word-limit status.

**One risk found and fixed during implementation, not anticipated at decision time:** the "Suggested improvement" panel (`components/application-step4-draft.tsx`) already renders `refinedText` verbatim via `whitespace-pre-wrap`, so the warning displays correctly as its own line with no UI change needed — confirming the "no UI change" premise of Option C. But "Use this improved version" previously saved `refinedText` verbatim as the answer, which would have let the literal warning sentence end up saved as part of the charity's submitted answer if a user clicked through without reading it — the opposite of the intended effect. Fixed with a small, targeted addition: a `stripRefineWarning()` helper (matches `REFINE_IRRELEVANT_WARNING` by exact string, duplicated locally rather than importing `lib/prompts.ts` into this `'use client'` component, which would otherwise bundle the server-only prompt library — full system prompt, JSON schemas — into client JS) strips the warning line before the text is adopted into the answer or saved. The same helper is also applied before computing `PDR-AI-006`'s "still over the limit" word/character count, which would otherwise have been inflated by the warning line's own length (verified: a sample case counted 26 words/147 characters raw vs. the correct 8 words/39 characters once stripped).

Not independently verifiable against a real Bedrock call locally (`dotenvx` redacts AWS credentials for this agent, per established precedent) — the prompt instruction itself, the constant, and the stripping/counting logic are all verified; WJ's next live test against the original two Henry Smith scenarios (plus a genuine on-topic answer, to check for false positives) is the outstanding verification step. `tsc --noEmit`, `eslint --max-warnings 0` clean, all 75 tests pass (unchanged — no existing coverage of `application-step4-draft.tsx`, consistent with prior fixes to this file).

## Date Decided

2026-07-17.
