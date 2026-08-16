// ⚠️ Three-file rule: any init option added here must also be added to
// sentry.client.config.ts and sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'
import { sentryEnvironment } from '@/lib/sentry-environment'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // GAP-107 — see `lib/sentry-environment.ts`. Was `process.env.NODE_ENV`,
  // which reports 'production' for preview deployments too.
  environment: sentryEnvironment,

  // 100% everywhere — raised from 0.1 on 2026-08-16 so GAP-03's P95 monitors
  // have enough samples to mean anything. Full reasoning in
  // sentry.client.config.ts.
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
