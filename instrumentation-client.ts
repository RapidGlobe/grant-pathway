// Client-side Sentry initialisation hook (Next.js 15 instrumentation-client.ts).
// Runs once when the app boots in the browser. Sentry is also initialised via
// sentry.client.config.ts through the webpack plugin, but this hook ensures
// the client SDK is ready before the first route renders.

import * as Sentry from '@sentry/nextjs'

import './sentry.client.config'

// Instruments App Router client-side navigations (P5.4, Opus audit O12).
//
// Without this export the Sentry SDK produces no transaction for any
// client-side route change — it warns about the omission on every boot. That
// matters disproportionately here because the five-step application flow is
// almost entirely client-side navigation: the journey users actually take was
// the part with the least observability.
//
// Must be a named export from this file specifically; Sentry reads it by name.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
