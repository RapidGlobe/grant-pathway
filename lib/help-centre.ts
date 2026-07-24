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
