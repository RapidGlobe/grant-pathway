import { describe, it, expect } from 'vitest'
import { subMonths, isInWarningWindow, isDueForDeletion, shouldSendWarning } from '@/lib/inactivity'

// Tests for the inactivity retention rules shared by the two S8.3 crons
// (GAP-31, PDR-DH-002). These decide whether a charity is emailed an
// account-deletion warning and whether their account is deleted, so the cases
// that matter are the boundaries and the repeat-send guard.
//
// The crons' Supabase and Resend calls are not exercised here — what is tested
// is every decision the routes make about a user.

// A fixed "now" so these never depend on the day they run.
const NOW = new Date('2026-08-05T08:00:00.000Z')

describe('subMonths', () => {
  it('subtracts whole months', () => {
    expect(subMonths(NOW, 24).toISOString()).toBe('2024-08-05T08:00:00.000Z')
    expect(subMonths(NOW, 23).toISOString()).toBe('2024-09-05T08:00:00.000Z')
  })

  it('does not mutate the date passed in', () => {
    const original = new Date(NOW)
    subMonths(original, 24)
    expect(original.toISOString()).toBe(NOW.toISOString())
  })

  it('rolls forward rather than clamping when the target month is shorter', () => {
    // 31 March minus one month is 3 March, not 28 February — JavaScript's own
    // behaviour, documented in lib/inactivity.ts rather than worked around.
    //
    // Asserted on local calendar components, not an ISO string: setMonth()
    // operates in local time, so on a machine observing DST this same call
    // shifts the underlying UTC instant by an hour. Vercel runs UTC, and an
    // hour either way on a 23-month retention boundary is immaterial, but the
    // assertion must not depend on the runner's timezone.
    const rolled = subMonths(new Date(2026, 2, 31), 1)
    expect(rolled.getMonth()).toBe(2)
    expect(rolled.getDate()).toBe(3)
  })
})

describe('isInWarningWindow — the 23rd month of inactivity', () => {
  it('includes a user who signed in exactly 23 months ago', () => {
    // The moment eligibility starts. `< subMonths(now, 23)` is strict, so the
    // exact boundary is not yet in the window.
    const exactly23 = subMonths(NOW, 23)
    expect(isInWarningWindow(exactly23, NOW)).toBe(false)
    expect(isInWarningWindow(new Date(exactly23.getTime() - 1), NOW)).toBe(true)
  })

  it('includes a user midway through the window', () => {
    expect(isInWarningWindow(new Date('2024-08-20T00:00:00.000Z'), NOW)).toBe(true)
  })

  it('includes a user who signed in exactly 24 months ago', () => {
    expect(isInWarningWindow(subMonths(NOW, 24), NOW)).toBe(true)
  })

  it('excludes a user past 24 months — they belong to the deletion cron', () => {
    expect(isInWarningWindow(new Date(subMonths(NOW, 24).getTime() - 1), NOW)).toBe(false)
  })

  it('excludes a recently active user', () => {
    expect(isInWarningWindow(new Date('2026-08-04T00:00:00.000Z'), NOW)).toBe(false)
  })

  it('is a whole month wide — which is why the dedup guard is needed', () => {
    // The window is not a single day, and the cron runs daily ("0 8 * * *").
    // Without shouldSendWarning() one user matched on roughly thirty
    // consecutive runs and was emailed on every one of them (GAP-31).
    const signedIn = new Date('2024-08-20T00:00:00.000Z')
    let daysMatched = 0
    for (let day = 0; day < 40; day++) {
      const runDate = new Date('2026-07-15T08:00:00.000Z')
      runDate.setDate(runDate.getDate() + day)
      if (isInWarningWindow(signedIn, runDate)) daysMatched++
    }
    expect(daysMatched).toBeGreaterThan(25)
  })
})

describe('isDueForDeletion — 24 months', () => {
  it('does not delete at exactly 24 months, matching the warning window', () => {
    // isInWarningWindow includes this instant, so the two must not both claim
    // it — a user should never be warned and deleted on the same day.
    const exactly24 = subMonths(NOW, 24)
    expect(isDueForDeletion(exactly24, NOW)).toBe(false)
    expect(isInWarningWindow(exactly24, NOW)).toBe(true)
  })

  it('deletes once past 24 months', () => {
    expect(isDueForDeletion(new Date(subMonths(NOW, 24).getTime() - 1), NOW)).toBe(true)
    expect(isDueForDeletion(new Date('2020-01-01T00:00:00.000Z'), NOW)).toBe(true)
  })

  it('does not delete a user still inside the warning window', () => {
    expect(isDueForDeletion(new Date('2024-08-20T00:00:00.000Z'), NOW)).toBe(false)
  })

  it('never claims the same user as the warning cron', () => {
    // The two crons run an hour apart against the same user list. Any instant
    // must belong to at most one of them.
    for (let days = 0; days < 800; days += 7) {
      const lastSignIn = new Date(NOW)
      lastSignIn.setDate(lastSignIn.getDate() - days)
      const warned = isInWarningWindow(lastSignIn, NOW)
      const deleted = isDueForDeletion(lastSignIn, NOW)
      expect(warned && deleted).toBe(false)
    }
  })
})

describe('shouldSendWarning — the GAP-31 deduplication guard', () => {
  const lastSignIn = new Date('2024-08-20T00:00:00.000Z')

  it('sends when the user has never been warned', () => {
    expect(shouldSendWarning(lastSignIn, null)).toBe(true)
  })

  it('does not send again when already warned for this period of inactivity', () => {
    // The case that was sending thirty emails.
    const warnedYesterday = new Date('2026-08-04T08:00:00.000Z')
    expect(shouldSendWarning(lastSignIn, warnedYesterday)).toBe(false)
  })

  it('sends again when the stamp predates the current period of inactivity', () => {
    // The user was warned, signed in (resetting the clock), then went quiet for
    // another 23 months. They are owed a fresh warning, and get one without the
    // column ever being cleared.
    const warnedInAnEarlierPeriod = new Date('2022-01-01T00:00:00.000Z')
    expect(shouldSendWarning(lastSignIn, warnedInAnEarlierPeriod)).toBe(true)
  })

  it('sends when the stamp exactly equals the last sign-in', () => {
    // Degenerate and near-impossible, but it must resolve toward sending: a
    // duplicate warning is recoverable, a silent deletion is not.
    expect(shouldSendWarning(lastSignIn, new Date(lastSignIn))).toBe(true)
  })

  it('suppresses every run after the first across a month of daily runs', () => {
    // The end-to-end property GAP-31 asked for: one warning per period of
    // inactivity, not one per cron invocation.
    const signedIn = new Date('2024-08-20T00:00:00.000Z')
    let warnedAt: Date | null = null
    let sends = 0

    for (let day = 0; day < 40; day++) {
      const runDate = new Date('2026-07-15T08:00:00.000Z')
      runDate.setDate(runDate.getDate() + day)
      if (!isInWarningWindow(signedIn, runDate)) continue
      if (!shouldSendWarning(signedIn, warnedAt)) continue
      sends++
      warnedAt = runDate // what the route writes after a successful send
    }

    expect(sends).toBe(1)
  })
})
