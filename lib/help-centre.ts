// Help centre link configuration (PDR-UI-008).
//
// A single source for the GitBook help centre base URL, so a future URL or
// custom-domain change is a one-line update here rather than a find-replace
// across nav-authenticated.tsx, nav-public.tsx, site-footer.tsx, and
// dashboard-empty.tsx. `helpCentreUrl(path)` also gives future deep-linking
// (e.g. linking Step 2's upload screen straight to the relevant help page)
// a one-line call site rather than a redesign.

const DEFAULT_HELP_CENTRE_BASE_URL = 'https://rapidglobe.gitbook.io/grant-pathway'

export const HELP_CENTRE_BASE_URL =
  process.env.NEXT_PUBLIC_HELP_CENTRE_BASE_URL || DEFAULT_HELP_CENTRE_BASE_URL

/** `helpCentreUrl()` returns the help centre root; `helpCentreUrl('some/page')` deep-links to a specific page. */
export function helpCentreUrl(path?: string): string {
  if (!path) return HELP_CENTRE_BASE_URL
  return `${HELP_CENTRE_BASE_URL}/${path.replace(/^\/+/, '')}`
}

// ── Contextual help (GAP-45) ────────────────────────────────────────────────
//
// Maps an app route to the help page that screen is about, so the nav "Help"
// button opens (say) "Writing and editing an answer" from Step 4 rather than
// the help centre front page the user then has to navigate from.
//
// ⚠️ THESE PATHS POINT AT AN EXTERNAL GITBOOK. A page renamed or moved on the
// GitBook side silently 404s that route's Help button, nothing in CI can catch
// it, and no runtime fallback is possible — a GitBook 404 is invisible to us,
// so we cannot detect one and drop back to the root. Two things guard this:
// every path lives in this one array (one file to check), and
// `docs/Test Plans/help-and-tooltips-test-plan.md` HT-06 clicks Help on every
// screen and is a standing re-run whenever the help centre is restructured.
// Slugs below were verified against the live sitemap on 2026-08-06 (21 pages).
//
// A route with no entry falls through to the help centre root, which is the
// deliberate behaviour for /dashboard (no page covers it cleanly — the nearest
// is reference-and-faqs/application-status-labels) and for every public route
// (WJ scoped this to the authenticated nav on 2026-08-06). Both are decisions
// awaiting his confirmation, not oversights — see GAP-45.
const ROUTE_HELP_PAGES: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/applications\/new\/?$/, 'applications/choosing-your-funder-and-grant'],
  [/^\/applications\/[^/]+\/step\/1\/?$/, 'applications/choosing-your-funder-and-grant'],
  [/^\/applications\/[^/]+\/step\/2\/?$/, 'applications/uploading-funder-guidelines'],
  [/^\/applications\/[^/]+\/step\/3\/?$/, 'applications/reviewing-the-ai-summary'],
  [/^\/applications\/[^/]+\/step\/4\/?$/, 'writing-answers/writing-and-editing-an-answer'],
  [/^\/applications\/[^/]+\/step\/5\/?$/, 'finishing-up/final-review'],
  [/^\/profile\/?$/, 'getting-started/setting-up-your-charity-profile'],
  // /account/delete must precede /account — both are anchored so order is not
  // load-bearing today, but it would become so if either pattern is loosened.
  [/^\/account\/delete\/?$/, 'account-settings/deleting-your-account'],
  [/^\/account\/?$/, 'account-settings/changing-your-password'],
]

/**
 * The help page for a given app route, or `undefined` when none applies —
 * pass straight to `helpCentreUrl()`, which treats `undefined` as the root.
 */
export function helpPathForRoute(pathname: string | null | undefined): string | undefined {
  if (!pathname) return undefined
  return ROUTE_HELP_PAGES.find(([pattern]) => pattern.test(pathname))?.[1]
}
