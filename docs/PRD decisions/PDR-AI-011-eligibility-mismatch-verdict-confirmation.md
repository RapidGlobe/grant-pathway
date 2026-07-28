---
id: PDR-AI-011
category: AI Integration
status: Decided
---

# PDR-AI-011 — Eligibility Mismatch Verdict Confirmation

## Question

`eligibilityMismatch` gates a hard stop with no override (`DR-EL-001`) — a `true` verdict permanently dead-ends an application. Given the verdict can flip between two identical calls on unchanged input, how should Grant Pathway make the hard stop reliable enough to justify having no override?

## Context

Found live-testing `guideline-capability-matrix-test-plan.md` GCM-01, 2026-07-27 (Defect Log #2): National Opera Studio against Idlewild Trust Arts guidelines failed the eligibility hard-stop on one run, then passed on an immediate retry with no profile changes.

Root-caused 2026-07-28. `temperature: 0` is already set on the `generate-summary` Bedrock call (`app/api/generate-summary/route.ts`, added 2026-07-15 for a different, already-fixed determinism regression on question extraction). That rules out a missing-setting bug. The actual cause: temperature 0 does not guarantee bit-identical output from Bedrock-hosted Claude across separate calls — batched-inference floating-point non-determinism can shift token probabilities at the margin even under greedy decoding. This is a documented, industry-wide limitation of hosted LLM inference, not something fixable by prompt changes or application code.

This matters specifically for `eligibilityMismatch` because it isn't a low-stakes field. Per `DR-EL-001`, one `true` verdict sets `applications.status = 'mismatch'`, hides the Continue button, and provides **no route back to Step 4** — the user must edit their charity profile and start an entirely new application. And the GCM-01 case wasn't a genuine borderline call either: the test plan's own notes confirm National Opera Studio does fit Idlewild's early-career-professional-development remit, so the "fail" run was a false positive, not a coin flip on a fairly ambiguous pairing. `DR-EL-001` already requires the AI to flag only "clear, unambiguous" mismatches — a verdict that flips on an identical retry is, by definition, not that.

## Options

- **Option A — Confirm with a second call.** When the first call returns `eligibilityMismatch: true`, silently issue a second, identical Bedrock call before showing anything to the user. Only proceed to the hard stop if both calls agree; if they disagree, treat the verdict as `false` and let the user through to Step 4 as normal. One extra Bedrock call, but only on the (expected to be rare) mismatch path. Asymmetric by design: a false "not a mismatch" costs nothing extra (the user proceeds exactly as if no issue had been flagged), while a false "mismatch" costs the user a deleted-and-restarted application — so the confirmation is one-sided, biased toward not blocking.
- **Option B — Require agreement across 3 calls (2-of-3 majority).** Same idea, higher confidence: two further calls, hard-stop only on 2-of-3 or 3-of-3 agreement. Further reduces the false-hard-stop rate but doubles the extra-call cost of Option A on the mismatch path, and adds proportionally more latency to an already ~35 s Step 3 generation.
- **Option C — Soften the hard stop (allow override).** Contradicts `DR-EL-001`'s explicit rationale (reputational risk of ineligible applications reaching funders) — not pursued; the reliability problem should be solved without reopening a decision that wasn't in question.
- **Option D — Leave as-is.** Rejected — a hard stop with no override that can fire on a false positive is the exact problem being solved.

## Decision

**Option A, approved 2026-07-28.**

`app/api/generate-summary/route.ts` now issues a second Bedrock call (same prompt, same `temperature: 0`) whenever the first call's parsed response has `eligibilityMismatch: true`. If the second call's response parses successfully and reports `eligibilityMismatch` as anything other than `true`, the route overwrites the summary's `eligibilityMismatch` to `false` and `mismatchReason` to `null` before saving/returning — the user never sees the unconfirmed mismatch warning. If the second call fails outright (network/timeout error) or returns an unparseable response, the route falls back to trusting the first call's verdict unchanged, since that preserves the pre-existing behaviour rather than risking a wrongly-lifted hard stop on a broken confirmation attempt.

Both calls' token usage are summed into the same AI-usage log row — the confirmation call is accounted as part of the same logical Step 3 generation request, not a second monthly-cap slot (`reserve_ai_slot` is not called again).

## Rationale

- Option A is the minimum change that removes the specific failure mode found (a single unlucky call permanently blocking a genuinely eligible charity) while adding cost only on the rare path where it's flagged at all.
- The asymmetric fallback (trust the first verdict on confirmation failure, but require agreement to keep a `true`) matches the actual cost asymmetry in `DR-EL-001`: false "not blocked" is free to correct (the eligibility warning simply doesn't appear, no worse than before this fix existed); false "blocked" costs the user a deleted application and a fresh charity-profile edit.
- Option B was not chosen because Option A already addresses the concrete failure observed; escalating to 3 calls adds cost and ~35 s-per-call latency on every future mismatch case without evidence that 2-call agreement is insufficient. Revisit if a confirmed-mismatch case is later found to have been a false positive on both calls.
- Option C was rejected outright — `DR-EL-001`'s rationale for no override was not undermined by this finding; the finding is about verdict _reliability_, not about whether the policy itself is too strict.

## Implementation status

**Built 2026-07-28.** `app/api/generate-summary/route.ts` — confirmation call added between the primary JSON-parse step and citation reconciliation. `tsc --noEmit`, `eslint --max-warnings 0`, and the full `vitest` suite (98 tests) all pass unchanged (no existing test coverage of this route — Bedrock calls cannot be exercised locally, `dotenvx` redacts AWS credentials for this agent, per established precedent).

Not yet independently verified against a live Bedrock call. WJ's next live regeneration of the National Opera Studio / Idlewild Trust pairing (ideally repeated a few times, matching the conditions that originally surfaced the flip) is the outstanding verification step.

## Date Decided

2026-07-28.
