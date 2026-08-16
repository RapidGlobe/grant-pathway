// The value Sentry tags every event with, resolved once for all three runtimes.
//
// GAP-107 (2026-08-16). All three Sentry configs previously used
// `process.env.NODE_ENV`, which does not distinguish the environments this
// project actually needs to tell apart. Next.js sets `NODE_ENV` to
// 'production' for any production build, and Vercel builds PREVIEW deployments
// in production mode — so preview and production both reported 'production',
// and a Sentry alert rule scoped to production also matched preview traffic.
// `VERCEL_ENV` carries the real distinction ('production' | 'preview' |
// 'development').
//
// Why `||` and not `??`: `.env.local` carries `VERCEL_ENV=` — the name set
// with a blank value — and `??` only falls through on null/undefined, so a
// blank would tag every local event with an empty string. That is GAP-50's
// failure mode exactly (see `lib/env-vars.ts`), and it is why this file uses
// truthiness rather than nullish coalescing.
//
// Why `NEXT_PUBLIC_VERCEL_ENV` first: non-public variables are not available
// in the browser at all — Next.js only inlines `NEXT_PUBLIC_*` into the client
// bundle (confirmed in the bundled Next.js docs,
// `01-app/02-guides/environment-variables.md`). Without the public copy the
// client falls through to `NODE_ENV` and keeps the old, imprecise tag; server
// and edge are correct either way. Vercel supplies the public copy when
// "Automatically expose System Environment Variables" is enabled on the
// project.
//
// Note the inlined client value is frozen at build time, which is correct
// here: each deployment is its own build, so a preview build bakes in
// 'preview' and a production build bakes in 'production'.
export const sentryEnvironment =
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV
