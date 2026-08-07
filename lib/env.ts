// Validates all required environment variables at server startup.
// Imported in instrumentation.ts so the process throws before accepting any
// requests if configuration is incomplete.
//
// Public vars (NEXT_PUBLIC_*) are included so a misconfigured deployment fails
// fast rather than silently serving a broken client.
//
// NOTE: nothing imports the `env` object below. This module exists for its side
// effects — the blank-normalisation pass, the warnings, and the throw. Every
// consumer reads `process.env` directly, which is why blanks are corrected
// there rather than only inside the parsed result. See GAP-50, and
// `lib/env-vars.ts` for the inventory and the reasoning.

import { z } from 'zod'
import { normaliseBlankEnvVars } from '@/lib/env-vars'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // AWS Bedrock
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  // `.min(1)` as well as `.default()`: the default covers "not set", the
  // minimum covers a value that somehow arrives blank anyway. Belt and braces
  // on the one variable that has already caused this (GAP-50).
  AWS_REGION: z.string().min(1).default('eu-west-2'),

  // Resend (email)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

  // Upstash Redis (rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
})

/**
 * Configuration that is optional by design, but whose absence changes what the
 * user sees. Warned about at startup rather than thrown on.
 *
 * `CHARITY_COMMISSION_API_KEY` is the case this was written for. The profile
 * lookup degrades gracefully without it — the user can type their charity's
 * details by hand — so it must not block startup. But the only visible symptom
 * of an absent key is "We couldn't reach the Charity Commission right now",
 * which reads as an outage at the Charity Commission rather than as missing
 * local configuration. On 2026-08-07 that cost real time before the cause was
 * found, and AC-01 rows 11c/11d were recorded as blocked on the strength of it.
 */
const OPTIONAL_WITH_VISIBLE_EFFECT: ReadonlyArray<{ name: string; consequence: string }> = [
  {
    name: 'CHARITY_COMMISSION_API_KEY',
    consequence:
      'charity lookup will report "We couldn\'t reach the Charity Commission right now" for every ' +
      'request. That is missing configuration here, not an outage at the Charity Commission.',
  },
]

function validateEnv() {
  // Must run before parsing. This is what makes `.default()` below — and every
  // `??` fallback elsewhere in the codebase — behave correctly on a blank.
  const cleared = normaliseBlankEnvVars()
  if (cleared.length > 0) {
    console.warn(
      `[env] Set but empty, so treated as not set: ${cleared.join(', ')}. ` +
        'An empty value is almost always a mistake — either give it a value or remove the line.',
    )
  }

  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    throw new Error(`[env] Missing or invalid environment variables:\n${missing.join('\n')}`)
  }

  for (const { name, consequence } of OPTIONAL_WITH_VISIBLE_EFFECT) {
    if (!process.env[name]) {
      console.warn(`[env] WARNING: ${name} is not set — ${consequence}`)
    }
  }

  return result.data
}

export const env = validateEnv()
