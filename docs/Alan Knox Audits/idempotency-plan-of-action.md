# Plan of Action — Idempotency

**Source article:** [Idempotency: Engineering for Vibe Coders — Alan Knox](https://alanknox.com/idempotency-engineering-for-vibe-coders/)
**Reviewed:** 8 June 2026
**Related documents:** `components/application-step4-draft.tsx`, `app/api/cron/inactivity-warning/route.ts`, `docs/Implementation Plan/ADR-TRACEABILITY.md`

---

## Why this mattered for Grant Pathway

Knox's article focuses on designing operations to be safe to repeat — preventing duplicate entries, double-sends, and inconsistent state from retried actions. This matters for Grant Pathway because it involves three categories of external calls (Bedrock AI, Resend email, Supabase writes) and a user journey with several points where a frustrated user might click twice.

The audit found the service to be substantially idempotent by design. Almost all database writes use `upsert` with unique constraints. Rate limiting via Upstash Redis caps AI call bursts. Most action buttons disable correctly while in-flight. Two gaps were identified.

---

## Assessment against Knox's recommendations

### "Use unique identifiers — assign request IDs to prevent duplicates"

**Status: Well covered for DB writes — no action required**

All meaningful write paths use upsert patterns:

- `saveManualAnswer()` — upsert on `(application_id, question_order)` unique constraint
- `saveCharityProfile()` — upsert on `user_id`
- `setDraftInProgress()` — upsert on `(application_id, question_order)` for both answer types
- `saveAnswer()` and `approveAnswer()` — updates on primary key rows (inherently idempotent)

Submitting the same data multiple times yields the same database state.

### "Check if actions were already processed — guard before executing"

**Status: No gap — correctly protected by conditional render**

Rate limiting (5 AI requests per 60 seconds per user) prevents rapid-fire Bedrock calls. The "Help me improve this" (refine) button is wrapped in `{refineState.status === 'idle' && ...}` — it is removed from the DOM entirely the moment the first click fires and status transitions to `'loading'`. Double-submission via this button is structurally impossible. All other AI action buttons similarly guard their in-flight state.

### "Store minimal histories of processed requests — track what has run"

**Status: One gap identified — tracked as GAP-31 — ✅ fixed 2026-08-05**

The inactivity warning cron (`app/api/cron/inactivity-warning/route.ts`) recalculates the eligible user list on every invocation with no `last_inactivity_warned_at` flag. If Vercel fires the cron twice in a window (e.g. during a deployment restart), eligible users receive the same warning email twice.

The deletion cron is safe — deleting a deleted user is a no-op.

**Tracked as:** GAP-31 in `ADR-TRACEABILITY.md`. Resolution: add `last_inactivity_warned_at` column to `user_profiles`, check before sending, update after send. Scheduled P5.3.

**Correction on closing this out (2026-08-05).** The finding was right and the prescribed resolution was right, but the impact stated above understates it by an order of magnitude, and that is worth recording because it changes what "recalculates the eligible user list" costs.

No double-fire was ever needed. The eligibility test is a **range** — signed in at least 23 months ago but less than 24 — so it stays true for a whole month, while the cron runs **daily**. A charity that entered that window was emailed _"Your Grant Pathway account will be deleted in 30 days"_ on roughly **thirty consecutive mornings**, and the "30 days" was only accurate on the first: the deletion date in the body is computed from their last sign-in and drew steadily closer while the subject line did not move. `docs/PRD inputs/email-notifications.md` already specified _"Only one inactivity warning email is sent per inactivity cycle"_, so this was a straightforward spec violation on the normal schedule rather than a retry edge case.

The generalisable rule, which this section's framing missed: **a scheduled job whose eligibility test is a range rather than a threshold re-matches the same row on every run, so "store a minimal history of processed requests" is not a defence against retries for it — it is load-bearing for correct behaviour on the happy path.** The observation immediately below, that the deletion cron needs no guard, is correct for exactly the complementary reason: its test _is_ a threshold. That distinction is the useful one to carry into any future scheduled job.

Fixed as described: nullable `user_profiles.last_inactivity_warned_at` (migration `20260805000000`), compared against `auth.users.last_sign_in_at` rather than cleared on login so it needs no reset step, and stamped **after** a successful send so a failure leaves a possible repeat rather than a user deleted having been told nothing.

### "Design operations as safe to repeat — withRetry is not a risk"

**Status: No action required**

The `withRetry<T>()` function in `lib/ai-error-handler.ts` retries Bedrock calls on transient failures. This is intentional — if the first Bedrock call fails, a fresh generation on retry is the correct behaviour. Each retry produces a new response, which is desirable. This is not an idempotency risk; it is expected retry semantics.

---

## Outstanding actions

| Action                                                                            | Owner       | Target                | Status                                                    |
| --------------------------------------------------------------------------------- | ----------- | --------------------- | --------------------------------------------------------- |
| Add `last_inactivity_warned_at` to `user_profiles`; update cron to check/set flag | Development | P5.3b item 2 (GAP-31) | ✅ Built 2026-08-05. Migration still to be applied to dev |

**No outstanding actions from this audit.** The refine button fix is complete, GAP-31 is built, and all other idempotency gaps are either by design or already covered by existing rate limiting and upsert patterns.

The migration itself (`20260805000000_gap31_inactivity_warning_dedup.sql`) awaits `supabase db push` against `grant-pathway-dev`, which needs an interactive database-password prompt and so must be run by WJ from a terminal — see the 2026-08-05 Notes row in `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.
