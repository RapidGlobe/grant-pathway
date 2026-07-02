import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// App version, auto-derived from Vercel's build-time Git metadata -- no manual
// bump required (CHANGELOG.md, 2026-07-02). VERCEL_GIT_COMMIT_SHA is injected
// automatically on every real Vercel deployment; falls back to 'dev' locally.
// NOTE: `vercel env pull` writes an *empty string* (not simply absent) for
// this var into .env.local for local development -- a plain `?? 'dev'` does
// not catch that (nullish coalescing only falls back on null/undefined), so
// this must check truthiness instead, or a local build silently produces a
// version with no identifier at all (caught via `npm run build` before this
// ever shipped). Baked in at build time via the `env` key below so
// process.env.APP_VERSION resolves the same way in both Server Components/
// Route Handlers and, if ever needed, Client Components.
const buildDate = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  : 'dev'
const appVersion = `${buildDate}-${commitSha}`

// Content-Security-Policy is set per-request in middleware.ts (item 22, F-08-02)
// so it can carry a per-request nonce replacing 'unsafe-inline' on script-src.
// All other security headers are set statically here as they do not vary per request.
const securityHeaders = [
  // Prevent the page being loaded in an iframe — blocks clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control how much referrer info is sent with requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not used by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Force HTTPS for one year — only active over HTTPS (ignored locally)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  env: {
    APP_VERSION: appVersion,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'rapidglobe-ltd',
  project: 'grant-pathway',
  silent: !process.env.CI,
  widenClientFileUpload: true,
})
