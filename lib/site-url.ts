/**
 * Canonical public base URL for the app, and whether search engines may index it.
 *
 * Added 2026-07-29 (Opus audit M5). `https://grantpathway.org.uk` was hardcoded
 * in nine places — the sitemap, robots, OG/canonical metadata in the root layout,
 * and three transactional emails — while the domain's DNS still pointed at the
 * registrar's parking page rather than at Vercel. Live emails therefore contained
 * links that did not reach the app, and the sitemap advertised URLs that did not
 * resolve.
 *
 * Everything that needs the public origin now reads it from here, so the cutover
 * is one environment variable rather than a code change in nine files.
 */

/**
 * Public origin, no trailing slash.
 *
 * Set `NEXT_PUBLIC_SITE_URL` per environment — e.g.
 * `https://grant-pathway-three.vercel.app` while the domain is not yet live, or a
 * preview/tunnel URL locally. Defaults to the canonical domain so production is
 * correct once DNS is pointed at Vercel and the variable can simply be removed.
 *
 * Note the truthiness check rather than `??`: `vercel env pull` writes an *empty
 * string* for an unset variable, which `??` would not fall back on (it only
 * catches null/undefined). The same trap is documented in `next.config.ts` for
 * `VERCEL_GIT_COMMIT_SHA`.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://grantpathway.org.uk'
).replace(/\/+$/, '')

/**
 * Whether robots.ts should permit crawling.
 *
 * Deliberately **opt-in**: indexing is off unless `NEXT_PUBLIC_ALLOW_INDEXING` is
 * exactly `'true'`. Safe by default — a preview deployment, the pre-launch
 * `vercel.app` host, or a misconfigured environment stays out of search results
 * without anyone having to remember to block it. Set it to `'true'` only on the
 * real production domain at launch.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
