// GAP-50 — "set but empty" must mean the same as "not set".
//
// `AWS_REGION=` in `.env.local` — the name present, the value empty — cost most
// of a session on 2026-08-07. It slipped through two separate guards that both
// look like they would catch it:
//
//   lib/env.ts   AWS_REGION: z.string().default('eu-west-2')
//                a Zod default only fires on `undefined`; '' satisfies
//                z.string() and is returned unchanged
//
//   both AI routes   process.env.AWS_REGION ?? 'eu-west-2'
//                    `??` also only fires on null/undefined, not ''
//
// So an empty region reached the AWS request signer, every Bedrock call
// returned 403 "signature does not match", and the app booted reporting itself
// healthy. `lib/env.ts` exists precisely to stop the process starting with bad
// configuration, and it waved this through.
//
// `APP_VERSION ?? 'dev'` in lib/version.ts had the identical defect, found
// while fixing the first. Two instances is what made this a normalisation pass
// over every application variable rather than a stricter rule on one.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
// Imported from lib/env-vars, not lib/env: the latter validates and throws on
// import, by design, so it cannot be loaded in a test without a fully populated
// environment. That is why the inventory and the rule live in their own module.
import { APP_ENV_VARS, normaliseBlankEnvVars } from '@/lib/env-vars'

describe('GAP-50 — blank environment variables are treated as absent', () => {
  it('deletes an empty value so a `??` fallback can fire', () => {
    const fake: Record<string, string | undefined> = { AWS_REGION: '' }
    normaliseBlankEnvVars(fake)
    expect(fake.AWS_REGION).toBeUndefined()
    // This is the assertion that would have caught the original bug: before
    // the fix, `'' ?? 'eu-west-2'` evaluated to '' and was signed with.
    expect(fake.AWS_REGION ?? 'eu-west-2').toBe('eu-west-2')
  })

  it('deletes a whitespace-only value', () => {
    // A stray space from a copy-paste is as broken as an empty value, and
    // harder to see. It would satisfy `.min(1)` and be signed with.
    const fake: Record<string, string | undefined> = { AWS_SECRET_ACCESS_KEY: '   ' }
    normaliseBlankEnvVars(fake)
    expect(fake.AWS_SECRET_ACCESS_KEY).toBeUndefined()
  })

  it('leaves real values untouched, including their internal spacing', () => {
    const fake: Record<string, string | undefined> = {
      AWS_REGION: 'eu-west-2',
      NEXT_PUBLIC_SITE_URL: 'https://grantpathway.org.uk',
    }
    normaliseBlankEnvVars(fake)
    expect(fake.AWS_REGION).toBe('eu-west-2')
    expect(fake.NEXT_PUBLIC_SITE_URL).toBe('https://grantpathway.org.uk')
  })

  it('does not invent variables that were never set', () => {
    const fake: Record<string, string | undefined> = {}
    normaliseBlankEnvVars(fake)
    expect(Object.keys(fake)).toHaveLength(0)
  })

  it('reports which variables it cleared, so startup can say so', () => {
    const fake: Record<string, string | undefined> = {
      AWS_REGION: '',
      APP_VERSION: 'v1',
      CRON_SECRET: '  ',
    }
    expect([...normaliseBlankEnvVars(fake)].sort()).toEqual(['AWS_REGION', 'CRON_SECRET'])
  })

  it('ignores variables outside the application list', () => {
    // Deleting arbitrary empty variables from a process environment could
    // affect Node, Next or the host OS. The pass is deliberately scoped.
    const fake: Record<string, string | undefined> = { SOME_SYSTEM_THING: '' }
    normaliseBlankEnvVars(fake)
    expect(fake.SOME_SYSTEM_THING).toBe('')
  })
})

describe('GAP-50 — the application variable list cannot go stale', () => {
  // Set by the runtime, never by our configuration, and never blank.
  const RUNTIME_PROVIDED = new Set(['NODE_ENV', 'NEXT_RUNTIME'])

  function sourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) sourceFiles(full, out)
      else if (['.ts', '.tsx'].includes(extname(entry.name))) out.push(full)
    }
    return out
  }

  it('covers every process.env variable the application actually reads', () => {
    const root = process.cwd()
    const dirs = ['app', 'lib', 'actions', 'components'].filter((d) => {
      try {
        return statSync(join(root, d)).isDirectory()
      } catch {
        return false
      }
    })

    // Comments are stripped before matching. Without this the scan reads its
    // own documentation: the modules explaining this rule necessarily write
    // `process.env.NAME` in prose, and the first run of this test duly
    // reported a variable called "X" from the phrase "scans for process.env.X".
    const stripComments = (src: string) =>
      src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

    const found = new Set<string>()
    for (const dir of dirs) {
      for (const file of sourceFiles(join(root, dir))) {
        const src = stripComments(readFileSync(file, 'utf8'))
        for (const m of src.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
          if (!RUNTIME_PROVIDED.has(m[1])) found.add(m[1])
        }
      }
    }

    // A scan that finds nothing passes the assertion below for the wrong
    // reason. Pin a floor and one variable known to be read, so a broken
    // regex, a bad path or an over-eager comment strip fails loudly instead of
    // reporting a clean bill of health.
    expect(found.size).toBeGreaterThan(10)
    expect(found).toContain('AWS_REGION')

    const declared = new Set<string>(APP_ENV_VARS)
    const undeclared = [...found].filter((n) => !declared.has(n)).sort()

    // If this fails, a variable is being read that the blank-normalisation
    // pass does not cover — so `NAME=` in .env.local would silently reach the
    // code as an empty string. Add it to APP_ENV_VARS in lib/env-vars.ts.
    expect(undeclared).toEqual([])
  })
})
