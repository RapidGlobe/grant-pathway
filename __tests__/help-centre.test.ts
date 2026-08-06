// Contextual help deep-links (GAP-45).
//
// What these tests can and cannot do is worth being explicit about, because it
// is the whole reason HT-06 exists as a manual case as well.
//
// They CAN catch: a regex that stops matching after a route is renamed on our
// side, a mapping accidentally deleted or reordered, and the exact URL that
// gets built for the screen WJ raised this on.
//
// They CANNOT catch: a page renamed or moved on the GitBook side. The target is
// an external documentation site, so a slug that is correct here can 404 in
// production with nothing in CI able to see it. That risk is covered only by
// `docs/Test Plans/help-and-tooltips-test-plan.md` HT-06, which clicks Help on
// every screen and is a standing re-run whenever the help centre changes.

import { describe, it, expect } from 'vitest'
import { HELP_CENTRE_BASE_URL, helpCentreUrl, helpPathForRoute } from '@/lib/help-centre'

// A realistic application id, so the patterns are exercised against the shape
// of path the router actually produces rather than a convenient placeholder.
const APP_ID = '3f8a1c42-9d77-4e5b-8a10-6b2c9e4d7f01'

describe('helpPathForRoute', () => {
  it('maps every application step to its own help page', () => {
    expect(helpPathForRoute(`/applications/${APP_ID}/step/1`)).toBe(
      'applications/choosing-your-funder-and-grant',
    )
    expect(helpPathForRoute(`/applications/${APP_ID}/step/2`)).toBe(
      'applications/uploading-funder-guidelines',
    )
    expect(helpPathForRoute(`/applications/${APP_ID}/step/3`)).toBe(
      'applications/reviewing-the-ai-summary',
    )
    expect(helpPathForRoute(`/applications/${APP_ID}/step/4`)).toBe(
      'writing-answers/writing-and-editing-an-answer',
    )
    expect(helpPathForRoute(`/applications/${APP_ID}/step/5`)).toBe('finishing-up/final-review')
  })

  it('maps a new application to the same page as step 1', () => {
    expect(helpPathForRoute('/applications/new')).toBe(
      'applications/choosing-your-funder-and-grant',
    )
  })

  it('maps the profile and account screens', () => {
    expect(helpPathForRoute('/profile')).toBe('getting-started/setting-up-your-charity-profile')
    expect(helpPathForRoute('/account')).toBe('account-settings/changing-your-password')
  })

  it('distinguishes /account/delete from /account', () => {
    // These two are the only nested pair in the map. If either pattern is ever
    // loosened (e.g. anchoring dropped), /account/delete would fall through to
    // the password page and send someone about to delete their account to the
    // wrong instructions.
    expect(helpPathForRoute('/account/delete')).toBe('account-settings/deleting-your-account')
    expect(helpPathForRoute('/account')).not.toBe('account-settings/deleting-your-account')
  })

  it('tolerates a trailing slash', () => {
    expect(helpPathForRoute(`/applications/${APP_ID}/step/4/`)).toBe(
      'writing-answers/writing-and-editing-an-answer',
    )
    expect(helpPathForRoute('/profile/')).toBe('getting-started/setting-up-your-charity-profile')
  })

  it('returns undefined for the dashboard, so Help falls back to the root', () => {
    // Deliberate, not an omission: no help page covers the dashboard cleanly.
    // The nearest is reference-and-faqs/application-status-labels, and whether
    // to use it is an open decision recorded against GAP-45.
    expect(helpPathForRoute('/dashboard')).toBeUndefined()
  })

  it('returns undefined for public routes', () => {
    // GAP-45 was scoped to the authenticated nav. Deep-linking /register and
    // the sign-in pages is recorded as available but not decided.
    expect(helpPathForRoute('/')).toBeUndefined()
    expect(helpPathForRoute('/register')).toBeUndefined()
    expect(helpPathForRoute('/forgot-password')).toBeUndefined()
    expect(helpPathForRoute('/privacy')).toBeUndefined()
  })

  it('returns undefined for an unknown or missing route', () => {
    expect(helpPathForRoute('/applications')).toBeUndefined()
    expect(helpPathForRoute(`/applications/${APP_ID}/step/9`)).toBeUndefined()
    expect(helpPathForRoute('')).toBeUndefined()
    expect(helpPathForRoute(null)).toBeUndefined()
    expect(helpPathForRoute(undefined)).toBeUndefined()
  })
})

describe('helpCentreUrl composed with helpPathForRoute', () => {
  it('builds the exact URL verified against the live sitemap for Step 4', () => {
    // This is the case WJ raised the gap on, and this exact URL was fetched and
    // confirmed live (not a 404) on 2026-08-06.
    expect(helpCentreUrl(helpPathForRoute(`/applications/${APP_ID}/step/4`))).toBe(
      `${HELP_CENTRE_BASE_URL}/writing-answers/writing-and-editing-an-answer`,
    )
  })

  it('falls back to the help centre root where no page applies', () => {
    expect(helpCentreUrl(helpPathForRoute('/dashboard'))).toBe(HELP_CENTRE_BASE_URL)
  })
})
