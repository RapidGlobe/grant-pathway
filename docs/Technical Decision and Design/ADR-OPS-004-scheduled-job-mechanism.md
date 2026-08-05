---
id: ADR-OPS-004
category: Operations
status: Decided
---

# ADR-OPS-004 — Scheduled Job Mechanism

## Context

Grant Pathway requires at least one scheduled operation in v1: resetting or maintaining the `ai_usage_log` monthly counter. While the current implementation counts rows within the current calendar month (no reset required), future maintenance tasks may include:

- Pruning old `ai_usage_log` entries (post-v1)
- Sending usage summary emails (post-v1)
- Automatic account deletion after inactivity (if implemented post-v1)

A scheduled job mechanism must be identified even if minimal use is made of it in v1.

## Options Considered

### Option A — Supabase pg_cron (PostgreSQL scheduled jobs)

- **What it is:** Supabase supports the `pg_cron` extension, which allows SQL functions to be run on a schedule directly in PostgreSQL. Enabled in the Supabase dashboard.
- **Strengths:** No additional service. Runs database-native SQL. Free. Simple for database maintenance tasks.
- **Weaknesses:** Limited to SQL operations — cannot call external APIs or run application code. Requires `pg_cron` to be enabled on the Supabase project.

### Option B — Vercel Cron Jobs

- **What it is:** Vercel Pro allows defining cron jobs in `vercel.json` that trigger Next.js API routes on a schedule.
- **Strengths:** Integrated with the application. Can run any application code (call external APIs, send emails, etc.). Defined in `vercel.json` alongside the application config.
- **Weaknesses:** Requires Vercel Pro (already planned — ADR-OPS-001). Cron jobs call API routes, which are subject to function timeouts.

### Option C — GitHub Actions scheduled workflows

- **What it is:** A GitHub Actions workflow with a `schedule:` trigger (cron syntax) that runs a script or calls an API endpoint.
- **Strengths:** Free. Works without any paid services beyond GitHub.
- **Weaknesses:** GitHub Actions is designed for CI/CD, not application scheduling. Scheduled workflows can be delayed under load. Requires maintaining a workflow file.

### Option D — No scheduled jobs in v1

- **What it is:** Defer all scheduled job needs to post-v1.
- **Strengths:** Zero implementation effort.
- **Weaknesses:** May create technical debt if maintenance tasks accumulate.

## Decision

**Option A — Vercel Cron Jobs for application-level tasks; Supabase pg_cron available for future pure database tasks.**

**V1 implementation — Storage cleanup job:**

A single cron job runs every 30 minutes and deletes any objects in the `guidelines-temp` Supabase Storage bucket older than 1 hour. This is the Layer 2 orphan file protection committed to in ADR-FILE-001.

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-guidelines",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

The route (`app/api/cron/cleanup-guidelines/route.ts`):

- Verifies the `Authorization: Bearer [CRON_SECRET]` header — rejects unauthorised calls with 401
- Uses the Supabase service role client to list objects in `guidelines-temp`
- Deletes any objects with `created_at` older than 1 hour
- Returns a summary of objects deleted (logged in Vercel function logs)

**Environment variable:** `CRON_SECRET` — a random secret string added to Vercel environment variables and `.env.local`. Added to the pre-launch checklist in ADR-OPS-002.

**Implemented — inactivity notification cron jobs (Slice 8, S8.3):**

The inactivity-notification tasks originally speculated about below under "Future tasks" are now built and live, as two further Vercel Cron Job entries alongside the Storage cleanup job:

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/cleanup-guidelines", "schedule": "*/30 * * * *" },
    { "path": "/api/cron/inactivity-warning", "schedule": "0 8 * * *" },
    { "path": "/api/cron/inactivity-deletion", "schedule": "0 9 * * *" }
  ]
}
```

- `app/api/cron/inactivity-warning/route.ts` — runs daily at 08:00 UTC; pages through `auth.admin.listUsers()` and sends an inactivity-warning email (Email 3, `lib/emails/inactivity-warning.ts`) to any user whose `auth.users.last_sign_in_at` falls in the 23-month window (≥23 and <24 months ago). No custom "last active" column was added — `last_sign_in_at` on the existing Supabase Auth user record is used directly.
- `app/api/cron/inactivity-deletion/route.ts` — runs daily at 09:00 UTC; same pagination pattern; cascade-deletes any account with `last_sign_in_at` ≥24 months ago (same cascade order as the user-initiated deletion in ADR-DATA-003/S8.2), then sends the account-deleted email (Email 4, `lib/emails/account-deleted-inactivity.ts`). Deletion failures are logged and skipped so the next run retries.
- Both routes follow the same `CRON_SECRET` authentication pattern as the Storage cleanup job.
- Emails are sent via the direct Resend REST API path (`lib/emails/send.ts`), not Supabase Auth SMTP — see `ADR-OPS-003`'s 2026-07-10 addition.
- Both jobs were confirmed complete and active in the Vercel dashboard per `IMPLEMENTATION-STATUS.md` (S8.3), which was completed no later than the Phase 4 → Phase 5 gate sign-off on 2026-06-17 — the exact completion date for S8.3 specifically is not recorded in `IMPLEMENTATION-STATUS.md` or `CHANGELOG.md` beyond that bound.

**Future tasks (still speculative):**

- Usage summary emails: an additional Vercel Cron Job entry in `vercel.json`, not yet built
- Pure database maintenance (pruning `ai_usage_log` entries older than 3 months): Supabase pg_cron is the better fit for SQL-only operations; not yet built

## Consequences

- If a Vercel Cron Job is added, the route it calls must authenticate the request (e.g., check a `CRON_SECRET` header to prevent unauthorised calls). **Confirmed satisfied** by `cleanup-guidelines`, `inactivity-warning`, and `inactivity-deletion`.
- Cron job endpoints should be excluded from user-facing rate limiting (ADR-SEC-005).
- **Added 2026-07-10:** the inactivity-notification cron jobs are implemented and live (`inactivity-warning`, `inactivity-deletion` — S8.3); this ADR's "Future tasks" section previously described them as not-yet-built speculation, which was stale.
- **Added 2026-08-05 (GAP-31):** a cron job whose eligibility test is a **range** rather than a **threshold** must persist a record of what it has already processed. Vercel Cron gives no per-row execution state, so a range-matching job re-selects the same rows on every run for as long as the range holds — this is normal operation, not a retry scenario, and no double-firing is required for it to go wrong. `inactivity-warning`'s range spans a month and it runs daily, so before `user_profiles.last_inactivity_warned_at` existed it emailed each affected user the same account-deletion warning around thirty times. `inactivity-deletion` needs no equivalent guard because its test is a threshold and deleting a deleted user is a no-op.
- **Added 2026-08-05 (GAP-31):** a cron job that takes an **irreversible** action a user must be told about has to confirm it can send that notification **before** acting, not discover afterwards that it could not. `inactivity-deletion` now returns 503 without deleting anything when `RESEND_API_KEY` is unset — `lib/emails/send.ts` returns normally rather than throwing in that case, so a surrounding `try/catch` cannot detect it, and every account the job touched would have been deleted silently. Send failures in scheduled jobs must reach Sentry (ADR-OPS-005) rather than `console.error` alone, since nobody reads cron logs unless already looking for a problem.

## Source

ADR-DATA-003 (data retention), ADR-OPS-001.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-05 | Two consequences added from GAP-31, both generalised from live defects rather than new decisions. (1) **Range-matching cron jobs must persist processed state.** `inactivity-warning` re-selected the same users on every daily run for the whole month its 23-to-24-month window held, sending each about thirty account-deletion warnings against `email-notifications.md`'s "only one per inactivity cycle"; guarded by `user_profiles.last_inactivity_warned_at`. (2) **A cron taking an irreversible action must verify it can notify the user before acting.** `inactivity-deletion` now aborts with 503 if `RESEND_API_KEY` is unset, because `lib/emails/send.ts` returns without throwing in that configuration and the route's `try/catch` therefore could not detect the one case where every notification fails. Scheduled-job send failures now go to Sentry, not `console.error` alone. |
| 2026-07-10 | Inactivity-notification cron jobs (previously listed under "Future tasks" as speculative) moved into a new "Implemented" section: `inactivity-warning` (daily 08:00 UTC) and `inactivity-deletion` (daily 09:00 UTC), built in Slice 8 (S8.3) and confirmed active in the Vercel dashboard. Usage-summary emails and `ai_usage_log` pruning remain future/not-yet-built. Exact completion date for S8.3 not separately recorded; bounded by the Phase 4 → Phase 5 gate sign-off (2026-06-17).                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-10 | Corrected the Storage cleanup job's route name in the `vercel.json` example and route description — both said `/api/cron/cleanup-storage`, but the route was always implemented at `app/api/cron/cleanup-guidelines/`. Stale name, no behaviour change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
