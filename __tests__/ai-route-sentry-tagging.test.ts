// GAP-21 — Sentry route tagging on the AI routes.
//
// `technical-design.md` §14 and `ADR-OPS-005` have specified since 2026-04-21
// that errors in the AI generation routes are tagged so they can be filtered
// apart from the rest of the service. Nothing implemented it: as of 2026-08-07
// neither route imported Sentry at all, so every Bedrock failure reached the
// dashboard as an untagged, unattributed error.
//
// WHY THIS IS A SOURCE SCAN RATHER THAN A BEHAVIOURAL TEST.
//
// There is no pure function to test here — the change is a Sentry call inside
// a catch block, and exercising it for real would mean booting a route handler
// with Supabase, Upstash and Bedrock all mocked, to assert on a side effect in
// a third-party SDK. This project's existing route-level tests (see
// upload-idor.test.ts) deliberately test the extracted logic instead, and here
// there is none to extract.
//
// What this scan actually guards is the regression that produced GAP-21 in the
// first place: **an AI error path that exists without a tag.** It fails if
// someone adds a third Bedrock call, or a third AI route, and does not tag it.
// That is a real and likely omission — it is exactly what happened for the
// three months these two routes went untagged.
//
// It does NOT prove a tagged event arrives in Sentry. Only the Sentry dashboard
// can show that, which is P5.4's work, and GAP-21's task text says to do it in
// that same sitting.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const AI_ROUTES = ['app/api/generate-summary/route.ts', 'app/api/refine-answer/route.ts']

function read(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('GAP-21 — AI routes tag their Bedrock errors for Sentry', () => {
  it.each(AI_ROUTES)('%s imports Sentry', (path) => {
    expect(read(path)).toMatch(/import \* as Sentry from '@sentry\/nextjs'/)
  })

  it.each(AI_ROUTES)('%s tags every Bedrock failure path', (path) => {
    const src = read(path)

    // Every place the route classifies a Bedrock error is a failure path that
    // returns an error to the user, so every one of them should report.
    //
    // Checked site-by-site rather than by counting both and comparing, which is
    // what this originally did. Counting assumed every failure path is a caught
    // exception, and GAP-52 added one that is not: a response that arrives
    // successfully but truncated at `max_tokens` never reaches a catch block and
    // has no error object to classify, yet is very much a failure worth
    // reporting. The count-based form failed on it — correctly noticing a third
    // tag, but for the wrong reason, and the only ways to satisfy it would have
    // been to drop a legitimate tag or to loosen it to `>=`, which would let a
    // catch block quietly lose its tag so long as some other line gained one.
    const sites = [...src.matchAll(/classifyBedrockError\(/g)]
    expect(sites.length).toBeGreaterThan(0)

    for (const site of sites) {
      // The tag follows the classification within the same catch block.
      const block = src.slice(site.index, site.index + 800)
      expect(block, `untagged classifyBedrockError at index ${site.index} in ${path}`).toContain(
        'Sentry.captureException(',
      )
    }

    // Extra tags beyond the caught-exception sites are expected and welcome —
    // the truncation guard is one — but there must never be fewer.
    const taggedReports = src.match(/Sentry\.captureException\(/g)?.length ?? 0
    expect(taggedReports).toBeGreaterThanOrEqual(sites.length)
  })

  it.each(AI_ROUTES)('%s tags with the route name §14 specifies', (path) => {
    const expected = path.includes('generate-summary') ? 'generate-summary' : 'refine-answer'
    expect(read(path)).toContain(`route: '${expected}'`)
  })

  it('has no untagged AI route — the whole point of GAP-21', () => {
    // If a third AI route appears, this fails until it is added to AI_ROUTES
    // above and tagged. `ADR-OPS-005` names "AI generation routes" as a class,
    // not these two files, so the guard has to be against the class.
    const apiDir = join(process.cwd(), 'app/api')
    const bedrockRoutes: string[] = []

    for (const entry of readdirSync(apiDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const routeFile = join(apiDir, entry.name, 'route.ts')
      let src: string
      try {
        src = readFileSync(routeFile, 'utf8')
      } catch {
        continue
      }
      if (src.includes('@anthropic-ai/bedrock-sdk')) {
        bedrockRoutes.push(`app/api/${entry.name}/route.ts`)
      }
    }

    expect(bedrockRoutes.sort()).toEqual([...AI_ROUTES].sort())
  })
})
