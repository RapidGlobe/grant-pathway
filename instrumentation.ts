export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate required env vars at startup — throws before accepting requests
    // if any are missing or malformed (POST-LAUNCH item 2)
    await import('./lib/env')
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
