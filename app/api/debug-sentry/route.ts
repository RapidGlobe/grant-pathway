// GET /api/debug-sentry — ⚠️ TEMPORARY. DELETE AFTER P5.4's SENTRY SITTING.
//
// Added 2026-08-16 for two jobs in `P5.4-RUNBOOK.md` step 13 that cannot be
// done without an error to look at, and production has never produced one:
//
//   • `GAP-21` — confirm a tagged event genuinely reaches Sentry. The code has
//     been in place since 2026-08-07 and only the observation is outstanding.
//   • Confirm PII scrubbing is active AT RUNTIME. `P5.2` verified the code half
//     — `beforeSend` is live on all three runtimes and correctly wired — but
//     nobody has watched a real event arrive with the fields actually absent.
//
// This route deliberately attaches every field `beforeSend` is supposed to
// strip, using obviously fake values, then captures an exception. That makes
// the scrubbing check a positive test rather than an absence of evidence: if
// the values below appear in Sentry, scrubbing is not working; if the event
// arrives without them, it is. Waiting for a natural error would prove the
// event arrives but say nothing about the fields, because a real error might
// not carry them at all.
//
// Authentication: Authorization: Bearer [CRON_SECRET], matching the cron
// routes (ADR-OPS-004). Not because this is a cron job — it is not — but
// because it is the one shared secret already set in Vercel Production, and an
// unauthenticated endpoint that writes to Sentry is a free way for anyone to
// fill the error quota.
//
// NOT added to `PUBLIC_API` in `middleware.ts` deliberately: it works without
// that (it is not in `PROTECTED`), and a temporary route should touch as few
// files as it can so removing it cannot leave a fragment behind.
//
// TO REMOVE: delete this file. Nothing imports it and nothing references it in
// configuration.

import * as Sentry from '@sentry/nextjs'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Fake values chosen to be unmistakable in a Sentry search and impossible to
 * confuse with real user data. `.invalid` is reserved by RFC 2606 and can
 * never resolve, so this address cannot belong to anyone.
 */
const SCRUB_CANARIES = {
  email: 'scrub-canary@example.invalid',
  username: 'scrub-canary-user',
  guidelinesText: 'SCRUB-CANARY-GUIDELINES-should-not-appear-in-sentry',
  answerText: 'SCRUB-CANARY-ANSWER-should-not-appear-in-sentry',
  path: 'SCRUB-CANARY-PATH/should-not-appear-in-sentry',
  signedUrl: 'https://scrub-canary.example.invalid/should-not-appear-in-sentry',
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Every field `beforeSend` strips, set deliberately so their absence in
  // Sentry is evidence rather than luck.
  Sentry.setUser({ email: SCRUB_CANARIES.email, username: SCRUB_CANARIES.username })

  Sentry.addBreadcrumb({
    category: 'debug-sentry',
    message: 'Scrub canary breadcrumb',
    data: {
      guidelinesText: SCRUB_CANARIES.guidelinesText,
      answerText: SCRUB_CANARIES.answerText,
      path: SCRUB_CANARIES.path,
      signedUrl: SCRUB_CANARIES.signedUrl,
      keep_this_one: 'this key is NOT on the scrub list and SHOULD appear',
    },
  })

  // Tagged the same way the real call sites tag (see `generate-summary`), so
  // this exercises the actual tagging path rather than a special case.
  const eventId = Sentry.captureException(
    new Error('P5.4 deliberate test error — GAP-21 and PII scrubbing check'),
    { tags: { route: 'debug-sentry', step: 'deliberate', ai_error: 'none' } },
  )

  // Serverless functions can be frozen the moment the response is returned, so
  // an un-flushed event is simply lost. This is why the check would otherwise
  // be unreliable rather than merely slow.
  await Sentry.flush(2000)

  Sentry.setUser(null)

  return NextResponse.json({
    sent: true,
    eventId,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    checkInSentry: {
      findBy: `event ID ${eventId}, or tag route:debug-sentry`,
      mustBeAbsent: [
        'user.email',
        'user.username',
        'breadcrumb data: guidelinesText, answerText, path, signedUrl',
      ],
      mustBePresent: [
        'tags route/step/ai_error',
        'breadcrumb data: keep_this_one',
        `environment tag reading "production" (GAP-107)`,
      ],
    },
  })
}
