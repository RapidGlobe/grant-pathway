// ⚠️ Three-file rule: any init option added here must also be added to
// sentry.server.config.ts and sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs'
import { sentryEnvironment } from '@/lib/sentry-environment'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // GAP-107 — see `lib/sentry-environment.ts`. Was `process.env.NODE_ENV`,
  // which reports 'production' for preview deployments too.
  environment: sentryEnvironment,

  // Capture 100% of transactions everywhere, including production.
  //
  // Raised from 0.1 on 2026-08-16 (decision: WJ) when GAP-03's two P95
  // monitors were created. At 10% sampling those monitors are not merely less
  // precise, they are meaningless: a P5.5 run of ~20 summaries would give
  // Sentry two spans, and a 95th percentile of two samples is noise. The 0.1
  // default exists for applications serving millions of requests; this one
  // serves dozens, so full sampling costs effectively nothing and is what
  // makes the alerts trustworthy.
  //
  // Worth knowing if quota is ever reviewed: most sampled volume here is not
  // user traffic. The Sentry uptime monitor hits `/` every minute and
  // UptimeRobot hits `/api/health` every five, so roughly 1,700 requests a day
  // are automated checks. Still far inside quota, but it means "spans used" is
  // a poor proxy for how busy the service actually is.
  tracesSampleRate: 1.0,

  // Strip PII and sensitive content from all events before sending to Sentry.
  // Defensive scrubbing regardless of sendDefaultPii setting (ADR-SEC-006).
  beforeSend(event) {
    // Strip user identity fields
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    // Strip request body (may contain guidelinesText, answerText) and auth headers
    if (event.request) {
      delete event.request.data
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['Authorization']
        delete event.request.headers['Cookie']
      }
    }
    // Strip sensitive keys from breadcrumb data (storage paths, answer content)
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((crumb) => {
        if (!crumb.data) return crumb
        const d = { ...crumb.data }
        delete d['guidelinesText']
        delete d['answerText']
        delete d['answer_text']
        delete d['path']
        delete d['signedUrl']
        return { ...crumb, data: d }
      })
    }
    return event
  },

  debug: false,
})
