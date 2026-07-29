/**
 * User-facing messages for Server Action *transport* failures.
 *
 * Added 2026-07-29 (Opus audit M8). The Server Actions in `actions/` already
 * return `{ ok, error }` result objects for expected errors, and those are
 * surfaced properly. This module covers the other category: the call itself
 * failing before any result comes back — the request succeeds at HTTP level but
 * the response is not a parseable Server Action payload, so the promise rejects
 * and React throws "An unexpected response was received from the server."
 *
 * Two causes, both observed:
 *
 *  1. **Version skew** — a deployment landed while the page was open, so the
 *     browser posts a Server Action ID the new deployment no longer recognises.
 *     Now mitigated by Vercel Skew Protection (enabled 2026-07-29, 12-hour
 *     window), but not eliminated: a tab older than the window still breaks.
 *  2. **Session expiry** — the 60-minute inactivity timeout has passed, so the
 *     request is redirected to sign-in and React receives HTML it cannot parse.
 *
 * Before this, such failures reached `window.onunhandledrejection` with nothing
 * shown in the UI — Sentry issue `GRANT-PATHWAY-6`, 8 events over three weeks,
 * 88% of them on Step 4. A user writing grant answers got no error, no retry
 * prompt, and no indication the submit had failed.
 *
 * The two causes are not reliably distinguishable from the client, so the copy
 * covers both and leads with the recovery action. It deliberately says the text
 * is still on screen: the answer is not lost, and the user can copy it before
 * reloading if they want to be certain.
 */

/**
 * Shown when an auto-save or explicit save did not reach the server. Names the
 * consequence first, because "not saved" is the part the user must act on.
 */
export const SAVE_FAILED_MESSAGE =
  'This answer could not be saved. The app may have been updated, or your session may have timed out. Your text is still on screen — copy it if you want to be safe, then reload the page and sign in again if asked.'

/**
 * Shown when any other Step 4 action (approve, add item, continue) failed to
 * reach the server.
 */
export const ACTION_FAILED_MESSAGE =
  'We could not reach the server. The app may have been updated, or your session may have timed out. Please reload the page and sign in again if asked — your answers are safe.'
