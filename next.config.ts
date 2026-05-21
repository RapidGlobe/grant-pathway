import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// In development, React requires 'unsafe-eval' for call stack reconstruction
// and other debugging features. Never included in production.
const isDev = process.env.NODE_ENV === 'development'

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
  // Content Security Policy — tighten iteratively after first production deploy
  // (validate at securityheaders.com per Phase 5 P5.2)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      // Sentry EU ingest added in P3.7 review — must be present or browser SDK is silently blocked
      "connect-src 'self' https://*.supabase.co https://*.ingest.de.sentry.io",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
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
