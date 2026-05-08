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
  "crons": [{
    "path": "/api/cron/cleanup-storage",
    "schedule": "*/30 * * * *"
  }]
}
```

The route (`app/api/cron/cleanup-storage/route.ts`):
- Verifies the `Authorization: Bearer [CRON_SECRET]` header — rejects unauthorised calls with 401
- Uses the Supabase service role client to list objects in `guidelines-temp`
- Deletes any objects with `created_at` older than 1 hour
- Returns a summary of objects deleted (logged in Vercel function logs)

**Environment variable:** `CRON_SECRET` — a random secret string added to Vercel environment variables and `.env.local`. Added to the pre-launch checklist in ADR-OPS-002.

**Future tasks:**
- Application-level tasks (usage summary emails, inactivity notifications): additional Vercel Cron Job entries in `vercel.json`
- Pure database maintenance (pruning `ai_usage_log` entries older than 3 months): Supabase pg_cron is the better fit for SQL-only operations

## Consequences

- No immediate consequences for v1 if no scheduled jobs are required.
- If a Vercel Cron Job is added, the route it calls must authenticate the request (e.g., check a `CRON_SECRET` header to prevent unauthorised calls).
- Cron job endpoints should be excluded from user-facing rate limiting (ADR-SEC-005).

## Source

ADR-DATA-003 (data retention), ADR-OPS-001.

## Date Decided

2026-04-21
