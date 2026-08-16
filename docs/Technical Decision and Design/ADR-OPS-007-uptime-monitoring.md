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
- ~~UptimeRobot account created and monitor configured before launch (pre-launch checklist — ADR-OPS-002).~~ ✅ **DONE 2026-08-15 (P5.4).** Account created under **RapidGlobe**; monitor "Grant Pathway — production" is **Up**, HTTP/S against `https://grant-pathway-three.vercel.app/api/health`, 5-minute interval, email alerts to WJ. Free plan (50 monitors available, 1 used).
  - **An HTTP monitor is sufficient here, and that is a deliberate conclusion rather than a shortcut.** `/api/health` returns **503** when the database is unreachable, so a plain non-200 check already catches the failure this ADR exists to detect. A keyword check was considered and rejected as unnecessary for this host, which can only ever serve this application.
  - ⚠️ **A keyword monitor _will_ be required for `grantpathway.org.uk` at `P5.6`**, and for a specific reason found on 2026-08-15: the apex currently returns **HTTP 200 while serving GoDaddy's parking page** (a 114-byte redirect to `/lander`). A plain status check against the real domain would therefore report **Up** while the service was entirely unreachable there. Use a **Keyword** monitor looking for `"status":"ok"`.
  - **Add the second monitor rather than re-pointing this one.** Keeping both is diagnostic: both green means healthy; domain red with Vercel green isolates the fault to DNS or the certificate rather than the application; both red means the app itself is down.
  - **Observed:** checks run from **North America** (free plan auto-selects region) with a ~1,930 ms response. Adequate for availability measurement, but it is not a UK-user latency figure and should not be read as one.
- No additional environment variables required — the health endpoint uses the Supabase connection already configured.
- ⚠️ **A SECOND uptime monitor exists and this ADR did not know about it — found 2026-08-16, recorded here rather than removed.** Sentry has been running _"Uptime Monitoring for `https://grant-pathway-three.vercel.app`"_ at **1-minute** intervals, green across the full 14-day window and wired to three alert rules. **It surfaced only because `SentryUptimeBot` appeared in the Axiom log stream** — nothing in this project referenced it, and until this note the document set described a one-monitor world.
  - **They are not duplicates, and deleting either would lose something.** Sentry polls **`/`** and answers _"is the site serving?"_. UptimeRobot polls **`/api/health`**, which returns 503 when the database is unreachable, and answers _"is the service actually working?"_. **A site can serve its pages perfectly while the database is down** — which is exactly the Supabase spend-cap failure mode this ADR's UptimeRobot monitor was justified on, since Supabase sends no warning before the cap bites.
  - **They also fail independently.** An outage at Sentry does not blind UptimeRobot and vice versa. For a service with one operator and no on-call rota, two unrelated watchers is a feature.
  - **The 1-minute interval is the more sensitive of the two**, so in practice Sentry will usually notice an outright outage first and UptimeRobot will be the one that notices a _sick_ service.
  - **Decision owed, not action:** keep both and record why (the position taken here), or drop one deliberately. **What must not happen is a future session finding two monitors, assuming redundancy, and deleting the health-endpoint one** — which is the one that catches the failure that actually threatens this service.

## Observability Stack — Complete Picture

This ADR completes the observability stack for Grant Pathway v1:

| Layer               | Tool                 | What it covers                               | Where to look                         |
| ------------------- | -------------------- | -------------------------------------------- | ------------------------------------- |
| Uptime — service    | UptimeRobot          | `/api/health`, 5 min — is the DB responding? | Email alert and UptimeRobot dashboard |
| Uptime — site       | Sentry               | `/`, 1 min — is the site serving at all?     | Sentry → Monitors → Uptime Monitors   |
| App errors          | Sentry EU            | Unhandled exceptions, AI API failures        | Sentry dashboard (eu.sentry.io)       |
| DB / Auth / Storage | Supabase dashboard   | Slow queries, auth failures, storage errors  | Supabase project dashboard            |
| Deployments         | Vercel dashboard     | Build failures, deployment status            | Vercel dashboard                      |
| Dev debugging       | Vercel function logs | Real-time logs during development            | Vercel CLI or dashboard               |

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
