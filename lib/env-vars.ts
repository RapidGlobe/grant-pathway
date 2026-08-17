// The application's environment-variable inventory, and the rule that "set but
// empty" means the same as "not set" (GAP-50).
//
// Separate from `lib/env.ts` because that module validates and throws on
// import — by design, since instrumentation.ts imports it for that side effect.
// That makes it impossible to import from a test without a fully populated
// environment. The same extraction was made for `lib/inactivity.ts` and
// `lib/docx-text.ts`, and for the same reason: logic that cannot be imported
// cannot be tested, and untested logic is how the defect below survived.

/**
 * Every environment variable this application reads.
 *
 * An explicit list rather than a pass over all of `process.env`, because
 * deleting arbitrary empty variables from a process's environment can affect
 * Node, Next or the host OS in ways this file cannot reason about.
 *
 * `__tests__/env-blank-handling.test.ts` scans the codebase for `process.env.X`
 * and fails if anything is read that is not listed here, so the list cannot
 * quietly go stale.
 *
 * `NODE_ENV` and `NEXT_RUNTIME` are deliberately excluded — set by the runtime,
 * never by our configuration, and never blank.
 */
export const APP_ENV_VARS = [
  'AI_ENABLED',
  'APP_VERSION',
  'AWS_ACCESS_KEY_ID',
  'AWS_REGION',
  'AWS_SECRET_ACCESS_KEY',
  'CHARITY_COMMISSION_API_KEY',
  'CRON_SECRET',
  'DISABLE_TEXT_PREPROCESSING',
  'NEXT_PUBLIC_ALLOW_INDEXING',
  'NEXT_PUBLIC_HELP_CENTRE_BASE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  // Both added 2026-08-16 with GAP-107. Supplied by Vercel rather than by us,
  // so they sit closer to the excluded `NODE_ENV` than to the rest of this
  // list — but they are included deliberately, because `.env.local` carries
  // `VERCEL_ENV=` with a blank value, which is exactly the case this list
  // exists to normalise. `lib/sentry-environment.ts` uses `||` as well, since
  // normalisation runs only on the server and the client reads an inlined copy.
  'NEXT_PUBLIC_VERCEL_ENV',
  'PREPROCESS_CHAR_CEILING',
  'RESEND_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'VERCEL_ENV',
  // Added 2026-08-17 with GAP-110. Supplied by Vercel at runtime, never by us,
  // and absent locally — same shape as VERCEL_ENV above. Read only by
  // /api/health, which reports it so the function's execution region can be
  // observed rather than inferred from a dashboard checkbox.
  'VERCEL_REGION',
] as const

/**
 * Deletes any of the above set to an empty or whitespace-only value, so that
 * "set to nothing" and "not set" mean the same thing everywhere.
 *
 * WHY THIS EXISTS (GAP-50, 2026-08-07).
 *
 * `AWS_REGION=` in `.env.local` — name present, value empty — cost most of a
 * session. It passed two guards that both look like they would catch it:
 *
 *   `lib/env.ts`'s `z.string().default('eu-west-2')` — a Zod default only fires
 *   on `undefined`; an empty string satisfies `z.string()` and is returned
 *   unchanged.
 *
 *   `process.env.AWS_REGION ?? 'eu-west-2'` in both AI routes — `??` also only
 *   fires on null/undefined, never on `''`.
 *
 * So the empty region reached the AWS request signer, every Bedrock call
 * returned 403 "signature does not match", and the app booted reporting itself
 * healthy. `lib/env.ts` exists to stop the process starting on bad
 * configuration; it waved this straight through.
 *
 * `APP_VERSION ?? 'dev'` in `lib/version.ts` had the identical defect, found
 * while fixing the first. Two instances is why this normalises every
 * application variable rather than tightening the one that bit us.
 *
 * Mutates `source` (so `process.env` is corrected for every later reader) and
 * returns the names it cleared (so startup can report them, and so the
 * behaviour is testable).
 *
 * Typed as a plain string record rather than `NodeJS.ProcessEnv`: Next augments
 * that interface to require `NODE_ENV`, so a test could not construct a small
 * fixture without also faking a variable irrelevant to what is being tested.
 * `process.env` satisfies this signature.
 */
export function normaliseBlankEnvVars(
  source: Record<string, string | undefined> = process.env,
): readonly string[] {
  const cleared: string[] = []
  for (const name of APP_ENV_VARS) {
    const value = source[name]
    if (value !== undefined && value.trim() === '') {
      delete source[name]
      cleared.push(name)
    }
  }
  return cleared
}
