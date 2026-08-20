/**
 * Concurrency / load harness — GAP-113, NFR-03
 * ---------------------------------------------------------------------------
 * Drives N distinct users through a real AI summary generation at the same
 * moment, against a running instance of the app, and reports what happened.
 *
 * WHY THIS EXISTS
 * `NFR-03` commits to roughly 10 concurrent users at launch, up to 10
 * simultaneous Bedrock calls, with the expected outcome "All succeed; each
 * takes 20–45s independently; no cross-user interference". Until this script,
 * every test this project has ever run used exactly one user. The claim was
 * asserted, never observed.
 *
 * WHAT IT CHECKS, in order of how much it would matter if it failed:
 *   1. CROSS-CONTAMINATION — each user's summary must be about that user's own
 *      guidelines. Every user is given a guideline pack carrying a unique
 *      canary phrase; a summary containing another user's canary is a
 *      confidentiality failure and a launch blocker, not a finding.
 *   2. SUCCESS RATE — all requests complete; no 429s, 500s or timeouts.
 *   3. FAIR-USE ISOLATION — each user's `ai_usage_log` count increments by
 *      exactly one. The monthly cap is per user, so a shared counter would be
 *      a real defect.
 *   4. LATENCY — p50/p95 against NFR-01's 30s standard / 45s large-document
 *      targets, compared with a single-user baseline the script measures first.
 *
 * SAFETY
 * Refuses to run against production unless `--i-know-this-is-production` is
 * passed. Production carries an enabled Supabase spend cap which, if exceeded,
 * takes the service READ-ONLY with no warning email (`ADR-DATA-005`) — a load
 * test is the most likely thing to trip it. Develop and iterate on dev.
 *
 * USAGE
 *   npx tsx scripts/load-test.ts --users 2
 *   npx tsx scripts/load-test.ts --users 10 --keep
 *   npx tsx scripts/load-test.ts --users 10 --base-url https://... --i-know-this-is-production
 *
 * A non-local URL additionally requires `--expect-supabase-project <ref>`,
 * checked against the credentials actually loaded. Users are created in the
 * project the credentials point at, but signed in against the target URL's own
 * project; if those differ, every sign-in fails and test users are left behind
 * in the wrong project. Supply the target's own credentials, e.g.
 *   vercel env pull .env.production.local --environment=production
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from the
 * environment (`.env.local` by default). Creates its own users, cleans them up
 * afterwards unless `--keep` is passed.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type Args = {
  users: number
  baseUrl: string
  keep: boolean
  allowProduction: boolean
  baseline: boolean
  expectProject: string | undefined
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag)
    return i === -1 ? undefined : argv[i + 1]
  }
  return {
    users: Number(get('--users') ?? 2),
    baseUrl: (get('--base-url') ?? 'http://localhost:3000').replace(/\/$/, ''),
    keep: argv.includes('--keep'),
    allowProduction: argv.includes('--i-know-this-is-production'),
    baseline: !argv.includes('--no-baseline'),
    expectProject: get('--expect-supabase-project'),
  }
}

function loadEnv(): { url: string; serviceKey: string; anonKey: string } {
  // Read .env.local directly rather than depending on a runner that loads it,
  // so the script behaves the same however it is invoked.
  let file = ''
  try {
    file = readFileSync('.env.local', 'utf-8')
  } catch {
    // Fall through to process.env — CI or an explicitly exported environment.
  }
  const fromFile = (key: string): string | undefined => {
    const line = file.split('\n').find((l) => l.trim().startsWith(`${key}=`))
    if (!line) return undefined
    const raw = line.slice(line.indexOf('=') + 1).trim()
    // Strip surrounding quotes; treat an empty value as absent, which is the
    // same normalisation `lib/env-vars.ts` applies (GAP-50).
    const value = raw.replace(/^["']|["']$/g, '').trim()
    return value === '' ? undefined : value
  }
  const pick = (key: string): string => {
    const value = process.env[key] ?? fromFile(key)
    if (!value) throw new Error(`Missing ${key} — set it in .env.local or the environment`)
    return value
  }
  return {
    url: pick('NEXT_PUBLIC_SUPABASE_URL'),
    serviceKey: pick('SUPABASE_SERVICE_ROLE_KEY'),
    anonKey: pick('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}

// ---------------------------------------------------------------------------
// Guideline fixture
//
// Each user gets the same structure with a unique canary, so a summary can be
// attributed to exactly one user. The text is deliberately substantial — a
// trivial pack would finish too fast to represent real load, and NFR-01's
// 45-second tier is about large documents.
// ---------------------------------------------------------------------------

function guidelinesFor(canary: string): string {
  return `
${canary} Foundation — Grant Guidelines 2026

About ${canary} Foundation
The ${canary} Foundation is an independent grant-making trust supporting registered
charities working with disadvantaged communities across the United Kingdom. Our
reference for all correspondence is ${canary}.

What we fund
We make grants of between £5,000 and £50,000 towards project and core costs for
organisations with an annual income below £1 million. Priority is given to work
addressing social isolation, financial hardship and access to education.

What we do not fund
Individuals, statutory bodies, work outside the United Kingdom, retrospective
funding, or organisations that have received a grant from ${canary} Foundation in
the previous twelve months.

Application questions

1. Please describe your organisation, its history, and the community it serves.
   (500 words maximum)

2. What is the specific problem or need your project addresses? Please include
   evidence. (500 words maximum)

3. Describe the activities the grant would fund, and who will deliver them.
   (750 words maximum)

4. How many people will benefit, and how will you measure the difference made?
   (500 words maximum)

5. How will the work continue after this grant ends? (300 words maximum)

6. Total annual expenditure of your organisation in the last financial year.

7. Level of free reserves currently held, and your reserves policy.

8. Are any of your trustees related to one another by family or business ties?

9. How many bank signatories does your organisation have?

Assessment
Applications are assessed quarterly by the ${canary} Foundation trustees. We aim to
respond within twelve weeks. Incomplete applications will not be considered.
`.trim()
}

// ---------------------------------------------------------------------------
// Session cookie
//
// The AI routes authenticate from the Supabase SSR cookie, not a bearer token
// (`lib/supabase/server.ts` builds its client from `cookies()`), so the harness
// has to present the same cookie a browser would. @supabase/ssr stores the
// session as `sb-<project-ref>-auth-token` = "base64-" + base64(JSON), chunked
// across `.0`, `.1`… when it exceeds the browser's per-cookie limit.
// ---------------------------------------------------------------------------

const CHUNK_SIZE = 3180

function sessionCookie(projectRef: string, session: unknown): string {
  const encoded = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64')
  const name = `sb-${projectRef}-auth-token`

  if (encoded.length <= CHUNK_SIZE) return `${name}=${encoded}`

  const chunks: string[] = []
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + CHUNK_SIZE))
  }
  return chunks.map((c, i) => `${name}.${i}=${c}`).join('; ')
}

function projectRefFrom(url: string): string {
  const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)
  if (!match) throw new Error(`Cannot derive project ref from ${url}`)
  return match[1]
}

// ---------------------------------------------------------------------------
// Test users
// ---------------------------------------------------------------------------

type TestUser = {
  index: number
  canary: string
  email: string
  password: string
  userId: string
  applicationId: string
  cookie: string
}

async function createUser(
  admin: SupabaseClient,
  anon: SupabaseClient,
  url: string,
  index: number,
  runId: string,
): Promise<TestUser> {
  const canary = `Canary${runId.toUpperCase()}${String(index).padStart(2, '0')}`
  const email = `loadtest+${runId}-${index}@grantpathway.invalid`
  const password = `Lt-${randomUUID()}`

  // email_confirm bypasses the verification email deliberately: this harness
  // tests the AI path under concurrency, and sending N verification emails
  // would collide with Supabase's 30-per-hour email limit (GAP-99) while
  // proving nothing about concurrency.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createError || !created.user) {
    throw new Error(`User ${index}: create failed — ${createError?.message}`)
  }
  const userId = created.user.id

  const { error: profileError } = await admin.from('charity_profiles').insert({
    user_id: userId,
    charity_name: `${canary} Community Trust`,
    what_charity_does: `Runs weekly support groups and advice sessions. Internal reference ${canary}.`,
    who_charity_helps: 'Older people experiencing social isolation, and their carers.',
    where_charity_works: 'Milton Keynes and the surrounding villages.',
  })
  if (profileError) throw new Error(`User ${index}: profile failed — ${profileError.message}`)

  const { data: app, error: appError } = await admin
    .from('applications')
    .insert({
      user_id: userId,
      funder_name: `${canary} Foundation`,
      grant_name: `${canary} Main Grant Programme`,
      current_step: 3,
    })
    .select('id')
    .single()
  if (appError || !app) throw new Error(`User ${index}: application failed — ${appError?.message}`)

  const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError || !signIn.session) {
    throw new Error(`User ${index}: sign-in failed — ${signInError?.message}`)
  }

  return {
    index,
    canary,
    email,
    password,
    userId,
    applicationId: app.id,
    cookie: sessionCookie(projectRefFrom(url), signIn.session),
  }
}

// ---------------------------------------------------------------------------
// The request under test
// ---------------------------------------------------------------------------

type Result = {
  index: number
  canary: string
  ok: boolean
  status: number
  ms: number
  summary: string
  error?: string
}

async function generateSummary(baseUrl: string, user: TestUser): Promise<Result> {
  const started = Date.now()
  try {
    const response = await fetch(`${baseUrl}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: user.cookie },
      body: JSON.stringify({
        applicationId: user.applicationId,
        guidelinesText: guidelinesFor(user.canary),
      }),
    })
    const ms = Date.now() - started
    const text = await response.text()
    return {
      index: user.index,
      canary: user.canary,
      ok: response.ok,
      status: response.status,
      ms,
      summary: text,
      error: response.ok ? undefined : text.slice(0, 300),
    }
  } catch (error) {
    return {
      index: user.index,
      canary: user.canary,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      summary: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  // Nearest-rank. With 10 samples a p95 is two samples at best, so this figure
  // is indicative rather than statistically meaningful — say so in the report
  // rather than letting a precise-looking number imply precision.
  const rank = Math.ceil((p / 100) * sorted.length)
  return sorted[Math.min(rank, sorted.length) - 1]
}

function report(results: Result[], users: TestUser[], baselineMs: number | null): boolean {
  const durations = results.filter((r) => r.ok).map((r) => r.ms)
  const failures = results.filter((r) => !r.ok)

  console.log('\n' + '='.repeat(72))
  console.log(`CONCURRENCY RESULT — ${results.length} users, GAP-113 / NFR-03`)
  console.log('='.repeat(72))

  // 1. Cross-contamination — the check that matters most.
  const bleeds: string[] = []
  for (const result of results) {
    if (!result.ok) continue
    for (const other of users) {
      if (other.canary === result.canary) continue
      if (result.summary.includes(other.canary)) {
        bleeds.push(`user ${result.index} (${result.canary}) contains ${other.canary}`)
      }
    }
  }

  // The count that matters here is how many summaries were actually SEARCHED,
  // not how many users were fired. Reporting `results.length` claimed a pass
  // over summaries that did not exist: a run where every request 500'd printed
  // "PASS — no summary contained another user's canary (2 checked)" having
  // checked nothing at all (observed 2026-08-20, when a malformed Upstash token
  // made every request fail). **A check that cannot run has not passed** — the
  // same false-reassurance shape as an empty log query read as a clean result,
  // which this project has now been bitten by three times.
  const searched = results.filter((r) => r.ok).length

  console.log('\n1. CROSS-CONTAMINATION')
  if (bleeds.length > 0) {
    console.log("   *** FAIL — one user's summary contains another user's content ***")
    bleeds.forEach((b) => console.log(`   ${b}`))
    console.log('   This is a confidentiality failure and a launch blocker. Stop here.')
  } else if (searched === 0) {
    console.log('   NOT TESTED — no request returned a summary, so nothing could be')
    console.log("   searched for another user's canary. This is not a pass. See the")
    console.log('   failures under SUCCESS RATE below and fix those first.')
  } else if (searched < results.length) {
    console.log(
      `   PARTIAL — no bleed in the ${searched} summary/summaries returned, but ` +
        `${results.length - searched} request(s) failed and could not be checked.`,
    )
  } else {
    console.log(`   PASS — no summary contained another user's canary (${searched} checked)`)
  }

  // 2. Success rate
  console.log('\n2. SUCCESS RATE')
  console.log(`   ${results.length - failures.length}/${results.length} succeeded`)
  failures.forEach((f) => console.log(`   FAILED user ${f.index}: HTTP ${f.status} — ${f.error}`))

  // 3. Latency
  console.log('\n3. LATENCY (NFR-01: 30s standard, 45s large documents)')
  if (durations.length > 0) {
    const p50 = percentile(durations, 50)
    const p95 = percentile(durations, 95)
    console.log(`   min ${(Math.min(...durations) / 1000).toFixed(1)}s`)
    console.log(`   p50 ${(p50 / 1000).toFixed(1)}s`)
    console.log(`   p95 ${(p95 / 1000).toFixed(1)}s  (indicative only at this sample size)`)
    console.log(`   max ${(Math.max(...durations) / 1000).toFixed(1)}s`)
    if (baselineMs !== null) {
      const factor = p50 / baselineMs
      console.log(
        `   single-user baseline ${(baselineMs / 1000).toFixed(1)}s — p50 is ${factor.toFixed(2)}x baseline`,
      )
    }
    const over = durations.filter((d) => d > 45_000).length
    if (over > 0) console.log(`   ${over} request(s) exceeded NFR-01's 45s large-document target`)
  } else {
    console.log('   no successful requests to measure')
  }

  console.log('\n' + '='.repeat(72))
  const passed = bleeds.length === 0 && failures.length === 0
  console.log(passed ? 'RESULT: PASS' : 'RESULT: FAIL — see above')
  console.log('='.repeat(72) + '\n')
  return passed
}

async function checkUsage(
  admin: SupabaseClient,
  users: TestUser[],
  expectedFor: (u: TestUser) => number,
) {
  // The expectation is per user, not uniform: when a baseline is measured it
  // is measured on user 1 only, so user 1 legitimately has one more logged
  // request than the rest. The first version of this check applied a single
  // expected value to everybody and reported user 2 as UNEXPECTED on a clean
  // run — a harness bug that would have read as an application defect.
  console.log(
    '4. FAIR-USE ISOLATION (per-user expectation; user 1 also carries the baseline request)',
  )
  for (const user of users) {
    const expected = expectedFor(user)
    const { count, error } = await admin
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.userId)
    if (error) {
      console.log(`   user ${user.index}: could not read usage — ${error.message}`)
      continue
    }
    const flag = count === expected ? 'ok' : '*** UNEXPECTED ***'
    console.log(`   user ${user.index}: ${count} (expected ${expected}) ${flag}`)
  }
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

async function cleanup(admin: SupabaseClient, users: TestUser[]) {
  console.log('Cleaning up test users…')
  for (const user of users) {
    // Deleting the auth user cascades to profile, application and usage rows.
    const { error } = await admin.auth.admin.deleteUser(user.userId)
    if (error) console.log(`   user ${user.index}: delete failed — ${error.message}`)
  }
  console.log(`   ${users.length} user(s) removed\n`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv)
  const env = loadEnv()

  const isProduction = !args.baseUrl.includes('localhost') && !args.baseUrl.includes('127.0.0.1')

  if (isProduction && !args.allowProduction) {
    console.error(
      '\nRefusing to run against a non-local URL without --i-know-this-is-production.\n' +
        "Production's Supabase spend cap is enabled: exceeding quota takes the\n" +
        'service READ-ONLY with no warning email (ADR-DATA-005), and a load test is\n' +
        'the most likely thing to trip it. Check Organisation → Usage first.\n',
    )
    process.exit(1)
  }

  // The URL guard above is not enough on its own. It checks where the REQUESTS
  // go; it says nothing about which Supabase project the script CREATES ITS
  // USERS IN, which comes from the environment. Point `--base-url` at the
  // production app while `.env.local` still holds dev credentials and the run
  // creates its users in dev, then tries to sign them in against production,
  // where they do not exist — a confusing failure that also leaves junk users
  // behind in the wrong project. Found 2026-08-20 while preparing a production
  // run: `.env.local` pointed at dev, and nothing here would have said so.
  //
  // This is deliberately NOT inferred. A deployment's Supabase project cannot
  // be read from its URL — `grant-pathway-three.vercel.app` says nothing about
  // which project backs it — so any heuristic here either misses the real
  // mismatch or blocks every legitimate remote run. Instead the operator must
  // state which project they believe they are driving, and the script checks
  // that belief against the credentials actually loaded. The ref is the
  // subdomain of the Supabase URL, and is visible in the browser as the
  // `sb-<ref>-auth-token` cookie on the target site (the method RT-00 uses).
  const projectRef = env.url.replace(/^https?:\/\//, '').split('.')[0]

  if (isProduction) {
    if (!args.expectProject) {
      console.error(
        `\nRefusing to run against a remote URL without --expect-supabase-project.\n\n` +
          `  target:           ${args.baseUrl}\n` +
          `  credentials load: ${projectRef}\n\n` +
          'Users are created in the project above, then signed in against the\n' +
          'target URL, which uses whatever project ITS deployment is configured\n' +
          'with. If those differ, every sign-in fails and test users are left\n' +
          'behind in the wrong project — so the intended project must be stated,\n' +
          'not guessed.\n\n' +
          `Confirm the target's project ref (DevTools → Application → Cookies →\n` +
          '`sb-<ref>-auth-token` on the target site), then re-run with\n' +
          '  --expect-supabase-project <ref>\n\n' +
          "To supply a different project's credentials:\n" +
          '  vercel env pull .env.production.local --environment=production\n',
      )
      process.exit(1)
    }
    if (args.expectProject !== projectRef) {
      console.error(
        `\nSupabase project mismatch — refusing to run.\n\n` +
          `  --expect-supabase-project: ${args.expectProject}\n` +
          `  credentials actually load: ${projectRef}\n\n` +
          'The loaded credentials are for a different project than the one you\n' +
          'named. Running would create users in the wrong project. Load the\n' +
          "intended project's credentials, e.g.\n" +
          '  vercel env pull .env.production.local --environment=production\n',
      )
      process.exit(1)
    }
  }

  console.log(`\nTarget:  ${args.baseUrl}`)
  console.log(`Supabase: ${env.url}`)
  console.log(`Users:   ${args.users}\n`)

  const admin = createClient(env.url, env.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const anon = createClient(env.url, env.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const runId = randomUUID().slice(0, 6)
  const users: TestUser[] = []

  try {
    console.log('Creating users, profiles and applications…')
    for (let i = 1; i <= args.users; i++) {
      users.push(await createUser(admin, anon, env.url, i, runId))
      process.stdout.write(`   ${i}/${args.users}\r`)
    }
    console.log(`   ${args.users}/${args.users} ready\n`)

    // Warm the route before measuring anything. In `next dev` the first request
    // to a route triggers on-demand compilation, which put the first observed
    // baseline at 111.4s against a 24.2s concurrent p50 — an absurd result that
    // said nothing about load. An invalid body compiles the route and returns
    // 400 without reaching Bedrock, so this costs nothing.
    console.log('Warming the route (no AI call)…')
    const warmStarted = Date.now()
    await fetch(`${args.baseUrl}/api/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: users[0].cookie },
      body: '{}',
    }).catch(() => undefined)
    console.log(`   ${((Date.now() - warmStarted) / 1000).toFixed(1)}s
`)

    // A single-user baseline, so "slower under load" has something to be slower
    // than. Without it, a 40-second result is unattributable.
    let baselineMs: number | null = null
    let baselineTaken = false
    if (args.baseline && users.length > 1) {
      console.log('Measuring single-user baseline…')
      const baseline = await generateSummary(args.baseUrl, users[0])
      baselineTaken = true
      baselineMs = baseline.ok ? baseline.ms : null
      console.log(
        baseline.ok
          ? `   ${(baseline.ms / 1000).toFixed(1)}s\n`
          : `   baseline failed: HTTP ${baseline.status} — ${baseline.error}\n`,
      )
    }

    console.log(`Firing ${users.length} concurrent requests…`)
    const results = await Promise.all(users.map((u) => generateSummary(args.baseUrl, u)))

    const passed = report(results, users, baselineMs)
    // User 1 has an extra request when a baseline was taken — checked against
    // the concurrent run only, so the expectation stays uniform.
    await checkUsage(admin, users, (u) => (baselineTaken && u.index === 1 ? 2 : 1))

    if (!args.keep) await cleanup(admin, users)
    else
      console.log(`\n--keep: ${users.length} user(s) left in place. Run IDs: loadtest+${runId}-*\n`)

    process.exit(passed ? 0 : 1)
  } catch (error) {
    console.error('\nHarness error:', error instanceof Error ? error.message : error)
    if (users.length > 0 && !args.keep) await cleanup(admin, users)
    process.exit(1)
  }
}

void main()
