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

## Source

ADR-DATA-003 (data retention), ADR-OPS-001.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Inactivity-notification cron jobs (previously listed under "Future tasks" as speculative) moved into a new "Implemented" section: `inactivity-warning` (daily 08:00 UTC) and `inactivity-deletion` (daily 09:00 UTC), built in Slice 8 (S8.3) and confirmed active in the Vercel dashboard. Usage-summary emails and `ai_usage_log` pruning remain future/not-yet-built. Exact completion date for S8.3 not separately recorded; bounded by the Phase 4 → Phase 5 gate sign-off (2026-06-17). |
| 2026-07-10 | Corrected the Storage cleanup job's route name in the `vercel.json` example and route description — both said `/api/cron/cleanup-storage`, but the route was always implemented at `app/api/cron/cleanup-guidelines/`. Stale name, no behaviour change.                                                                                                                                                                                                                                       |
