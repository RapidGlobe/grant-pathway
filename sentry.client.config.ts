import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 100% of transactions in dev; reduce in production if needed
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Strip PII from all events before sending to Sentry (ADR-SEC-006)
  beforeSend(event) {
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    return event
  },

  debug: false,
})
