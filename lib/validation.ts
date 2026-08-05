// Shared input-validation schemas for Server Actions (GAP-25, ADR-ARCH-003)
//
// ADR-ARCH-003 requires Zod input validation on all Server Actions and API
// Routes. Until 2026-08-05 only `actions/charity.ts` did so; `applications.ts`
// and `auth.ts` reached the database with unvalidated input.
//
// Why these live in one module rather than beside each action:
//
//   The 12-character password rule was already written out four times — in
//   `register-form.tsx`, `reset-password-form.tsx`, `account-settings-form.tsx`
//   and (as prose) in `non-functional-requirements.md` NFR-04. The PRD's own
//   0.3 and 0.4 revisions record a live front-end/back-end password
//   inconsistency being found and fixed once already. A rule duplicated per
//   call site diverges; a rule imported from one place cannot.
//
// Zod 4 idioms are used deliberately (`z.email()`, `z.uuid()` rather than
// `z.string().email()`), matching the installed 4.4.3 — the chained forms are
// deprecated in Zod 4.
//
// IMPORTANT — what this module does NOT do. Schema validation checks the
// *shape* of input, never the caller's right to the row it names. Next.js's
// own Server Actions guide is explicit: "A well-formed Item object can still
// refer to a row the caller does not own." Ownership is enforced separately,
// by re-reading `auth.getUser()` server-side and filtering every query on
// `user_id`, backed by RLS. See `assertOwnsApplication` in
// `actions/applications.ts` for the case where a client-supplied id names a
// parent row that RLS alone does not protect.

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Password policy — single source of truth (NFR-04, PRD §12.4, VQ-009)
// ---------------------------------------------------------------------------

/** Minimum password length. Hardened from 6 to 12 on 2026-06-29 (VQ-009). */
export const PASSWORD_MIN_LENGTH = 12

/**
 * The one user-facing password message. Kept identical to the text the three
 * client forms already show, so a server-side rejection reads the same as a
 * client-side one rather than looking like a different failure.
 */
export const PASSWORD_MESSAGE =
  'Your password must be at least 12 characters and include both letters and numbers'

/**
 * Password rule as enforced by this application: at least 12 characters,
 * containing at least one letter and at least one digit.
 *
 * Note this is the *application's* rule. Supabase Auth independently enforces
 * its own configured strength requirements plus a HaveIBeenPwned leaked-password
 * check, and can still reject a password that satisfies this schema — that path
 * surfaces as `error.code === 'weak_password'` and is handled separately in
 * `actions/auth.ts`. Validating here means an obviously-bad password is rejected
 * without a network round trip to GoTrue, not that this is the only check.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MESSAGE)
  .regex(/[a-zA-Z]/, PASSWORD_MESSAGE)
  .regex(/[0-9]/, PASSWORD_MESSAGE)

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Email address. Trimmed before validation because a trailing space or newline
 * from a mobile clipboard paste otherwise turns a correct address into a
 * validation failure — the same class of problem found live in sign-in on
 * 2026-07-28, which is why that action trims defensively.
 */
export const emailSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.email('Please enter a valid email address'),
)

/**
 * A database row id. Every id this application passes across the Server Action
 * boundary is a Postgres `uuid`, so anything that is not a UUID cannot name a
 * real row and is rejected before it reaches a query.
 */
export const uuidSchema = z.uuid('Invalid identifier')

/** A required free-text field, trimmed, with no imposed maximum. */
export const requiredText = (message: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(1, message),
  )

/**
 * Free text the user may legitimately leave empty — trimmed, and normalised to
 * an empty string rather than `undefined` so callers can pass it straight to a
 * column without a null check.
 */
export const optionalText = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : (value ?? '')),
  z.string(),
)

/**
 * A person's name as entered at registration. Deliberately permissive on
 * character set — names legitimately contain apostrophes, hyphens, accents and
 * non-Latin scripts, and a charity worker whose name this rejects cannot
 * register at all. Length is capped only to stop an absurd payload reaching the
 * `user_profiles` row.
 */
export const nameSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().min(1, 'Please enter your name').max(100, 'That name is too long'),
)

// ---------------------------------------------------------------------------
// Answer text
// ---------------------------------------------------------------------------

/**
 * A charity-written answer. No minimum — a blank answer is a legitimate
 * intermediate state, saved constantly by Step 4's debounced auto-save.
 *
 * The 100,000-character ceiling is a backstop against a malformed or malicious
 * payload, not a product limit: real word limits are per-question and enforced
 * in the UI (`word_limit` / `char_limit`), and the longest limit seen in the
 * funder corpus is far below this. Note Server Action request bodies are capped
 * at 1MB by Next.js regardless.
 */
export const answerTextSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value : ''),
  z.string().max(100_000, 'That answer is too long to save'),
)
