// ⚠️ Three-file rule: any init option added here must also be added to
// sentry.server.config.ts and sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 100% of transactions in dev; reduce in production if needed
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

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
    if (event.breadcrumbs?.values) {
      event.breadcrumbs.values = event.breadcrumbs.values.map((crumb) => {
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
