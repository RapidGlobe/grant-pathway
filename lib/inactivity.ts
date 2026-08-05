// Date arithmetic and eligibility rules for the two inactivity crons
// (app/api/cron/inactivity-warning, app/api/cron/inactivity-deletion — S8.3).
//
// Extracted 2026-08-05 with GAP-31. subMonths() was previously copied verbatim
// into both routes, and the new deduplication guard is the kind of rule that
// should be exercised by tests directly rather than re-implemented in them.
//
// Retention policy: PDR-DH-002 — warn at 23 months of inactivity, delete at 24.

/**
 * Subtract whole months. Two quirks of Date, both left in place deliberately:
 *
 * - Short months roll forward rather than clamping — 31 March minus one month
 *   is 3 March, not 28 February.
 * - setMonth() works in local time, so on a host observing DST the resulting
 *   UTC instant can move by an hour. Vercel runs UTC, so this does not arise in
 *   production.
 *
 * Both shift a retention boundary by at most a few days on a 23-month
 * timescale, and both crons call this same function, so the warning window and
 * the deletion threshold stay consistent with each other — which is the
 * property that actually matters (see the "never claims the same user"
 * assertion in __tests__/inactivity.test.ts).
 */
export function subMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

/**
 * True when a user sits in the 23rd month of inactivity: signed in at least
 * 23 months ago but less than 24 months ago.
 *
 * Note this window is a whole month wide while the cron runs daily, which is
 * why shouldSendWarning() below exists — see GAP-31.
 */
export function isInWarningWindow(lastSignIn: Date, now: Date): boolean {
  return lastSignIn >= subMonths(now, 24) && lastSignIn < subMonths(now, 23)
}

/**
 * True when the account has been inactive for 24 months or more and is due for
 * deletion.
 */
export function isDueForDeletion(lastSignIn: Date, now: Date): boolean {
  return lastSignIn < subMonths(now, 24)
}

/**
 * The GAP-31 deduplication guard: send the inactivity warning only if this
 * period of inactivity has not already been warned about.
 *
 * A stamp is treated as covering the current period only when it is later than
 * the user's last sign-in. That makes the guard self-healing — signing in moves
 * last_sign_in_at past the old stamp, so a user who goes quiet again years
 * later is warned again without the column ever being cleared, and without the
 * sign-in path needing to know this column exists.
 *
 * Callers must have already established that the user is in the warning
 * window; this answers only the "have we told them yet?" half.
 */
export function shouldSendWarning(lastSignIn: Date, lastWarnedAt: Date | null): boolean {
  if (!lastWarnedAt) return true
  return lastWarnedAt <= lastSignIn
}
