---
id: ADR-OPS-005
category: Operations
status: Decided
---

# ADR-OPS-005 — Error Tracking and Monitoring

## Context

Grant Pathway is a production application that must be monitored for errors. Without error tracking, bugs in production are invisible until a user reports them. This is especially important for:
- AI API call failures (Anthropic errors, timeouts)
- File processing errors (PDF extraction failures)
- Authentication errors
- Database query failures

A single developer cannot actively monitor logs at all times. An automated error tracking tool must surface issues proactively.

## Options Considered

### Option A — Sentry
- **What it is:** Industry-standard error tracking service. Captures unhandled exceptions, provides stack traces, breadcrumbs, and performance monitoring. Has a Next.js SDK with automatic integration.
- **Strengths:** Best-in-class error grouping and alerting. Performance monitoring included. Next.js SDK automatically captures server-side and client-side errors. Free tier: 5,000 errors/month.
- **Weaknesses:** Another third-party service dependency. Minimal configuration required but some initial setup.

### Option B — Vercel Analytics and logs
- **What it is:** Vercel provides built-in function logs (real-time) and Vercel Analytics (performance metrics). No separate service.
- **Strengths:** Already available with Vercel Pro (ADR-OPS-001). No additional setup.
- **Weaknesses:** Function logs are not persistent for long (limited retention). Not designed for error aggregation, alerting, or deduplication. Cannot be searched or filtered easily.

### Option C — LogRocket
- **What it is:** Session replay + error tracking tool. Can replay user sessions that experienced errors.
- **Strengths:** Session replay is very useful for understanding user-facing bugs.
- **Weaknesses:** Higher cost. Privacy implications for session recording (GDPR considerations for UK users). More than needed for v1.

### Option D — No dedicated error tracking (rely on console logs and user reports)
- **What it is:** Errors are logged to the console and appear in Vercel function logs.
- **Strengths:** Zero cost and effort.
- **Weaknesses:** Errors are invisible unless actively monitored. Not appropriate for a production application.

## Decision

**Option A — Sentry, configured for the EU data region with PII scrubbing and AI route tagging.**

Setup via `npx @sentry/wizard@latest --saas` which automatically configures `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` for Next.js App Router.

**Configuration point 1 — PII scrubbing:**

The `beforeSend` hook strips user-identifiable data from all events before they leave the application:

```typescript
// sentry.client.config.ts and sentry.server.config.ts
Sentry.init({
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});
```

This ensures email addresses and names captured in request context are never sent to Sentry's servers — GDPR-compliant by design, not by hope.

**Configuration point 2 — AI route error tagging:**

Errors in AI generation routes are tagged with a `route` label so they can be filtered separately from application bugs. Anthropic API failures have a different profile and resolution path than code errors:

```typescript
// in /api/generate-summary/route.ts and /api/generate-draft/route.ts
Sentry.withScope((scope) => {
  scope.setTag('route', 'generate-summary'); // or 'generate-draft'
  Sentry.captureException(error);
});
```

This allows filtering in the Sentry dashboard to distinguish "Anthropic had a blip" from "our code is broken."

**Alert configuration:** Email alerts on new error types only — not on every occurrence. Prevents alert fatigue while ensuring new issues are surfaced promptly.

**Data residency:** Sentry project created in the EU region (`eu.sentry.io`) for GDPR compliance. `SENTRY_DSN` added to Vercel environment variables for all environments (already in pre-launch checklist — ADR-OPS-002).

**Complement:** Vercel function logs remain useful for real-time debugging during development. Sentry is the production monitoring layer. For the complete observability stack — including Supabase dashboard coverage and uptime monitoring — see ADR-OPS-007.

## Consequences

- `@sentry/nextjs` package is added to the project.
- `sentry.client.config.ts` and `sentry.server.config.ts` are added.
- `SENTRY_DSN` environment variable is required in all environments.
- Sentry data is stored on Sentry's EU servers (for GDPR compliance, select EU data region).

## Source

BRD Section 9 (Data Privacy & Security), NFR (operational requirements).

## Date Decided

2026-04-21