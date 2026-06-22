// Client-side Sentry initialisation hook (Next.js 15 instrumentation-client.ts).
// Runs once when the app boots in the browser. Sentry is also initialised via
// sentry.client.config.ts through the webpack plugin, but this hook ensures
// the client SDK is ready before the first route renders.

import './sentry.client.config'
