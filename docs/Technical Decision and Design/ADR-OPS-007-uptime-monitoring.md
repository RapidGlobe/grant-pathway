---
id: ADR-OPS-007
category: Operations
status: Decided
---

# ADR-OPS-007 — Uptime Monitoring and Application Health

## Context

Grant Pathway has a documented uptime target of 99.5% (NFR-02). Sentry (ADR-OPS-005) captures application errors, but only when requests reach the application. If Vercel has an outage, a deployment breaks the build, or the app becomes completely unreachable, Sentry generates no alerts — because no traffic is reaching it to produce events.

Without an external uptime monitor, the solo developer has no way to:

- Know the app is down before a user reports it
- Measure uptime against the 99.5% target
- Distinguish a deployment failure (app unreachable) from an application error (app running but broken)

A dedicated health endpoint provides a richer signal than pinging the homepage — it confirms that the application and its database dependency are both functioning, not just that a CDN-cached page is loading.

## Options Considered

### Option A — UptimeRobot (free tier)

- **What it is:** External uptime monitoring service. Pings a URL every 5 minutes and sends email alerts when the site goes down.
- **Strengths:** Free. Zero maintenance. Works immediately. 5-minute detection is appropriate for a non-real-time grant writing tool.
- **Weaknesses:** 5-minute polling interval (not 1-minute). Faster checks or SMS alerts require a paid plan.

### Option B — Vercel built-in monitoring

- **What it is:** Vercel Pro includes deployment health checks and some uptime monitoring.
- **Strengths:** No additional service. Integrated with deployments.
- **Weaknesses:** Vercel monitoring checks deployments, not ongoing application health. If Vercel itself has an outage, its own monitoring is also affected — it cannot serve as an independent external check.

### Option C — Checkly or Better Uptime

- **What it is:** Paid uptime and synthetic monitoring services with richer alerting.
- **Strengths:** 1-minute polling, multiple alert channels, synthetic transaction testing.
- **Weaknesses:** Paid. Overkill for v1 — synthetic testing and sub-minute polling are not warranted for this use case and team size.

### Option D — No uptime monitoring

- **What it is:** Rely on Sentry and user reports.
- **Strengths:** Zero effort.
- **Weaknesses:** The documented 99.5% uptime target cannot be measured or defended. Complete outages are invisible until a user reports them.

## Decision

**Option A — UptimeRobot free tier, monitoring a dedicated /api/health endpoint every 5 minutes.**

Two components:

**Component 1 — /api/health endpoint**

A lightweight Next.js API route that confirms both application availability and database connectivity:

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.from('profiles').select('count').limit(1)
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
```

- Returns 200 OK when the application is running and the Supabase database is reachable.
- Returns 503 Service Unavailable if the database query fails.
- No authentication required — the endpoint is public but returns no user data.
- UptimeRobot treats any non-200 response or connection timeout as a failure and triggers an alert.

The endpoint must be excluded from authentication middleware so it can be reached without a session (add /api/health to the public routes matcher in middleware.ts).

**Component 2 — UptimeRobot monitor**

- Monitor type: HTTPS
- URL: https://[production-domain]/api/health
- Check interval: 5 minutes
- Alert contact: developer email address
- Alert condition: non-200 response or connection timeout

**Why not the homepage?**

Pinging the homepage confirms the CDN is responding, but not that the application or database is functional. A broken database connection would return a 200 from a cached CDN response while the app was functionally unusable for every logged-in user.

## Consequences

- app/api/health/route.ts is added to the project.
- /api/health is added to the public routes list in middleware.ts.
- UptimeRobot account created and monitor configured before launch (pre-launch checklist — ADR-OPS-002).
- No additional environment variables required — the health endpoint uses the Supabase connection already configured.

## Observability Stack — Complete Picture

This ADR completes the observability stack for Grant Pathway v1:

| Layer               | Tool                 | What it covers                              | Where to look                         |
| ------------------- | -------------------- | ------------------------------------------- | ------------------------------------- |
| Uptime              | UptimeRobot          | Is the app reachable? Is the DB responding? | Email alert and UptimeRobot dashboard |
| App errors          | Sentry EU            | Unhandled exceptions, AI API failures       | Sentry dashboard (eu.sentry.io)       |
| DB / Auth / Storage | Supabase dashboard   | Slow queries, auth failures, storage errors | Supabase project dashboard            |
| Deployments         | Vercel dashboard     | Build failures, deployment status           | Vercel dashboard                      |
| Dev debugging       | Vercel function logs | Real-time logs during development           | Vercel CLI or dashboard               |

**Supabase logs to check when something goes wrong:**

- Database > Logs > Postgres logs: slow or failed queries
- Authentication > Logs: login failures, expired tokens, auth errors
- Storage > Logs: file upload or access failures

**Vercel logs to check:**

- Production function logs persist for 1 hour on Pro plan — use for post-incident diagnosis
- Real-time log streaming during active development sessions

See ADR-OPS-005 for Sentry error tracking configuration detail.

## Source

NFR-02 (Availability — 99.5% uptime target), ADR-OPS-005 (Error Tracking and Monitoring).

## Date Decided

2026-05-17
