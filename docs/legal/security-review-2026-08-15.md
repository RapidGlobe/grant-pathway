# Security Review — Grant Pathway v1

**Tier:** 3
**Volatility:** Low
**Update when:** A new security review is performed, or a finding recorded here is resolved

**Product:** Grant Pathway v1
**Review date:** 15 August 2026
**Reviewer:** Rapidglobe Ltd
**Task:** `P5.2 — Security` (Phase 5 run order, step 1)
**Commit reviewed:** `bd4dadb` (plus the three fixes made during this review — see §9)
**Scope basis:** `IMPLEMENTATION-PLAN.md` §P5.2 · `ADR-SEC-001`–`ADR-SEC-006` · `ADR-OPS-005` · `ADR-FILE-001`

---

## 1. Outcome

**Pass, with four findings — three fixed during the review, one recorded as assessed and accepted.**

| Check                                                  | Result                                              |
| ------------------------------------------------------ | --------------------------------------------------- |
| OWASP Top 10 review — 10 API routes, 27 Server Actions | ✅ Pass, 1 finding (`GAP-99`)                       |
| HTTP security headers, verified on the live host       | ✅ Pass, 2 findings — both fixed                    |
| CSP tested against all pages, no resources blocked     | ✅ Pass                                             |
| No secrets or credentials committed                    | ✅ Pass                                             |
| `.env.local` and credential files ignored              | ✅ Pass                                             |
| `.env.example` holds placeholders only                 | ✅ Pass                                             |
| Server-only secrets not reachable from client code     | ✅ Pass                                             |
| Dependency-vulnerability position                      | ✅ **0 vulnerabilities, all severities**            |
| Cross-user RLS test (`GAP-17`)                         | ✅ **22/22 pass**                                   |
| Storage bucket policies (`GAP-48`)                     | ✅ **7/7 pass** — first time ever verified to grant |
| Supabase session expiry vs 60-minute app timeout       | ✅ Pass                                             |

**Machine-checked total: 30/30 assertions passed** in the RLS and storage harness, after one fixture defect in the harness itself was found and corrected (§6.1).

---

## 2. Scope and its limits — read this before relying on the sign-off

**Every live check ran against `grant-pathway-dev`.** `grant-pathway-prod` is not linked and is not re-entered until `P5.4`. This matters differently for different checks:

- **Carries over unchanged:** OWASP review, secrets handling, dependency position, security-header configuration. These are properties of the code, not of a database or a host.
- **Proves `grant-pathway-dev` only, and must be re-confirmed at `P5.4`/`P5.5`:** the RLS policy behaviour (§6), the storage policy behaviour (§7), and the session-expiry setting (§8). All three read live configuration, and dev and prod have diverged before — the 2026-07-01 migration-tracking reconciliation found six columns and five functions present on one and not the other.

The header checks in §5 were run against the **live deployed host** (`grant-pathway-three.vercel.app`), not a local server, so they are real evidence about a running deployment — but that host is the pre-launch one, not the production domain.

---

## 3. OWASP Top 10 review

Reviewed: all 10 route handlers under `app/api/`, and all 27 exported Server Actions across `actions/applications.ts` (16), `actions/auth.ts` (8) and `actions/charity.ts` (3).

| #   | Category                      | Result | Evidence                                                                                                                                                                        |
| --- | ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | Broken Access Control         | ✅     | Every route carries an auth gate except `/api/health`, which is deliberately public (`ADR-OPS-007` — UptimeRobot must reach it without a session). See §3.1 for the IDOR check. |
| A02 | Cryptographic Failures        | ✅     | HSTS present and live (§5). No secrets in the repository (§4). TLS terminated by the host.                                                                                      |
| A03 | Injection                     | ✅     | No `dangerouslySetInnerHTML` anywhere in the codebase. All database access goes through the Supabase client, which parameterises. See §3.2 on prompt injection.                 |
| A04 | Insecure Design               | ⚠️     | **`GAP-99`** — no application-level rate limiting on the authentication actions. See §9.                                                                                        |
| A05 | Security Misconfiguration     | ⚠️     | **`GAP-96`, `GAP-97`, `GAP-98`** — three header/CSP gaps. All three fixed during this review (§9).                                                                              |
| A06 | Vulnerable Components         | ✅     | `npm audit`: 0 vulnerabilities at every severity (§10).                                                                                                                         |
| A07 | Authentication Failures       | ✅     | User enumeration correctly prevented (§3.3). Session expiry aligned (§8). Subject to `GAP-99`.                                                                                  |
| A08 | Software & Data Integrity     | ✅     | Server Actions carry Next.js's built-in origin check. Version skew mitigated by Vercel Skew Protection (enabled 2026-07-29).                                                    |
| A09 | Logging & Monitoring Failures | ✅     | Sentry `beforeSend` scrubbing present on **all three** runtimes and correctly wired — see §3.4.                                                                                 |
| A10 | Server-Side Request Forgery   | ✅     | No route or action fetches a user-supplied URL. The only outbound calls are to fixed hosts (Bedrock, Supabase, Resend, Charity Commission).                                     |

### 3.1 IDOR on the export route — checked specifically

`/api/export/[applicationId]` takes a user-supplied identifier and is the most obvious IDOR candidate in the codebase. Every query in it chains `.eq('user_id', user.id)` alongside the id filter — four separate queries, all constrained. A non-owner receives **404, not 403**, which is the correct choice: 403 would confirm the record exists.

### 3.2 Prompt injection — noted, not a defect

Funder guidelines are user-supplied text that reaches a model prompt. Prompt injection cannot be eliminated at this architecture. The mitigation is structural rather than technical and is already in force: **`C10` makes human review of all AI output mandatory and the app enforces it** — no generated text reaches a funder without the charity approving it on screen. Recorded so a future reviewer does not read its absence as an oversight.

### 3.3 User enumeration — correctly handled

`requestPasswordReset` returns `{ status: 'sent' }` unconditionally, including for malformed addresses and addresses with no account, and the code carries a comment explaining that this is deliberate. This is the correct behaviour and it is worth noting it was got right without prompting.

### 3.4 Sentry PII scrubbing — verified, including the wiring

`beforeSend` scrubbing is present in `sentry.client.config.ts`, `sentry.server.config.ts` and `sentry.edge.config.ts`, stripping user email/username, request bodies, `authorization`/`cookie` headers, and the sensitive breadcrumb keys (`guidelinesText`, `answerText`, `path`, `signedUrl`).

**The wiring was checked, not assumed.** Next.js 16 uses `instrumentation-client.ts` as the client entry point, which would normally make a separate `sentry.client.config.ts` dead code — and a dead scrubbing config is worse than none, because it reads as protection that is not running. It is not dead here: `instrumentation-client.ts` explicitly does `import './sentry.client.config'`. Client-side scrubbing is live.

This closes the code-level half of `P5.4`'s "confirm PII scrubbing is active — still unverified" item. The runtime half — an event arriving in Sentry with fields genuinely absent — remains `GAP-21`, which needs the production deployment.

---

## 4. Secrets and credentials

| Check                                             | Result | Evidence                                                                                                                             |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Env files tracked by git                          | ✅     | `.env.example` and nothing else.                                                                                                     |
| Any env file ever committed, in the whole history | ✅     | Full history scan for added files matching `.env*`: only `.env.example` has ever been added.                                         |
| Real secret values present in any tracked file    | ✅     | Every value in `.env.local` of 20+ characters was searched for across all tracked files. **No match.**                               |
| `.env.example` contents                           | ✅     | Two populated assignments only — `AWS_REGION=eu-west-2` and `AI_ENABLED=true`. Neither is a secret; both are non-sensitive defaults. |
| `.gitignore` coverage                             | ✅     | `.env*` with an explicit `!.env.example` negation, plus `*.pem`.                                                                     |
| Private keys or credential files tracked          | ✅     | None.                                                                                                                                |
| Server-only secrets reachable from client code    | ✅     | See below — this is the one worth spelling out.                                                                                      |

**Server-only boundary (`ADR-SEC-006` consequence 1).** `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are referenced in 13 files. Every one is server-side: eight route handlers under `app/api/` (server-only by App Router convention), `actions/charity.ts` (carries `'use server'`), one test file, `supabase/config.toml`, and `lib/env.ts` / `lib/env-vars.ts`.

The two `lib/` files were checked properly rather than waved through, because a shared module is the realistic leak path: `lib/env.ts` is imported **only** by `lib/env-vars.ts`'s test and by `instrumentation.ts`, and there only inside a `NEXT_RUNTIME === 'nodejs'` guard via dynamic `await import()`. **No client component references a server-only secret.**

The six `NEXT_PUBLIC_*` variables in use — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SENTRY_DSN`, `SITE_URL`, `ALLOW_INDEXING`, `HELP_CENTRE_BASE_URL` — are all legitimately public. No server secret is exposed through a `NEXT_PUBLIC_` prefix.

`ADR-SEC-006` asks for "a lint rule or code review check" to confirm this. **No lint rule exists**; this review is the code-review half being performed and recorded. A future session may wish to add the lint rule so this stops depending on someone remembering to look.

---

## 5. HTTP security headers

Verified against a **live response from the deployed host**, not by reading the config:

```
curl -sSI https://grant-pathway-three.vercel.app/
```

| Header                      | Value                                      | Result             |
| --------------------------- | ------------------------------------------ | ------------------ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`      | ✅                 |
| `X-Frame-Options`           | `DENY`                                     | ✅                 |
| `X-Content-Type-Options`    | `nosniff`                                  | ✅                 |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`          | ✅                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()` | ✅                 |
| `Content-Security-Policy`   | Per-request, with a real per-request nonce | ✅                 |
| `X-Powered-By`              | `Next.js` — **present before this review** | ⚠️ `GAP-98`, fixed |

**Incidental confirmation of `C13`.** The response carried `X-Vercel-Id: lhr1::lhr1::…`. This is independent evidence that compute is executing in London, which `C13` and `DR-DP-002` assert and which had only ever been recorded from a dashboard setting.

### CSP as found

```
default-src 'self'; script-src 'self' 'nonce-…'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.ingest.de.sentry.io;
frame-ancestors 'none'
```

Strong where it matters: `script-src` carries a per-request nonce and **no `'unsafe-inline'`** in production. `'unsafe-eval'` is added in development only.

`style-src 'unsafe-inline'` is retained. This is a genuine constraint of the Tailwind/Next.js styling pipeline rather than an oversight, and it is a substantially lower risk than the script equivalent. **Assessed and accepted.**

Two gaps were found — `GAP-96` and `GAP-97` — both now fixed (§9).

### CSP tested against all pages (`ADR-SEC-004` consequence 2)

This is the check that the policy does not silently **break** anything, which the headers check above does not cover. Seven routes were loaded in a real browser with the console watched for violations and every network request checked for a blocked resource:

| Route                       | Access        | CSP violations | Blocked resources |
| --------------------------- | ------------- | -------------- | ----------------- |
| `/` (sign-in)               | Public        | None           | None              |
| `/register`                 | Public        | None           | None              |
| `/privacy`                  | Public        | None           | None              |
| `/dashboard`                | Authenticated | None           | None              |
| `/profile`                  | Authenticated | None           | None              |
| `/applications/[id]/step/4` | Authenticated | None           | None              |
| `/account`                  | Authenticated | None           | None              |

All resource requests returned 200. The authenticated routes were reached by signing in as a real seeded account, not by bypassing the gate.

---

## 6. Cross-user RLS test — `GAP-17`

**Method.** Two throwaway confirmed users (A and B) were created via the Supabase admin API. A's data was seeded with the service role so that seeding could not itself be blocked by the policies under test. **Every attack was then run from a client built on the anon key carrying B's real JWT** — never the service role, which bypasses RLS entirely and would have made every assertion pass regardless. Both users were deleted afterwards.

**Positive controls were included deliberately.** A policy that denies everyone passes a negative-only test, which is exactly how `GAP-48`'s storage policies denied every request for eleven weeks without anyone noticing. Six positive assertions confirm A can reach and modify its own data before any negative assertion is trusted.

| Assertion group                                         | Tables covered                                                                                     | Result |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| **Positive controls** — A can SELECT its own rows       | `applications`, `application_items`, `application_guidelines`, `charity_profiles`, `user_profiles` | 5/5 ✅ |
| **Positive control** — A can UPDATE its own application | `applications`                                                                                     | 1/1 ✅ |
| **B cannot SELECT A's rows**                            | the five above, plus `ai_usage_log`                                                                | 6/6 ✅ |
| **B cannot UPDATE A's rows**                            | the five above                                                                                     | 5/5 ✅ |
| **B cannot DELETE A's rows**                            | `application_items`, `application_guidelines`, `applications`, `charity_profiles`                  | 4/4 ✅ |
| **B cannot INSERT a row owned by A** (`WITH CHECK`)     | `applications`                                                                                     | 1/1 ✅ |
| **Integrity** — A's data unmodified after every attempt | `applications`                                                                                     | 1/1 ✅ |

**22/22 passed.** The forged-insert case is worth calling out: it is the `WITH CHECK` class of bug, where a policy correctly hides other users' rows on read but permits a row to be _created_ under another user's id. It was rejected.

### 6.1 A fixture defect in the harness, found and corrected

The storage assertions initially reported three failures with the message `mime type text/plain is not supported`. The cause was the test fixture, not the policy: the `guidelines-temp` bucket restricts `allowed_mime_types` to PDF and DOCX (`ADR-FILE-002`).

**This mattered for more than the three failures.** The bucket's MIME check runs _before_ the RLS policy is consulted, so the three **deny** assertions in the same group had been passing for the wrong reason — a `text/plain` upload would have been rejected whether the policy worked or not. Re-running with a genuine PDF fixture was necessary to make any of the storage results meaningful. Recorded because a security test that passes for the wrong reason is worse than one that fails.

---

## 7. Storage bucket policies — `GAP-48`

The three `guidelines-temp` policies on `storage.objects` were rewritten on 2026-08-06. Their own migration states they had **never been verified to grant, in either their old or new form** — the original gated on a folder layout that does not exist and denied everything from 2026-05-19, and the replacement's behaviour was "so far only argued, not observed."

**It has now been observed.** Run with the anon key plus real user JWTs, using a valid PDF fixture:

| Assertion                                            | Expected | Result |
| ---------------------------------------------------- | -------- | ------ |
| A can INSERT its own `<A_id>_<ts>` object            | grant    | ✅     |
| A can SELECT its own object                          | grant    | ✅     |
| A can DELETE its own object                          | grant    | ✅     |
| A cannot INSERT an object named with B's id          | deny     | ✅     |
| A cannot INSERT `<A_id>x…` — no underscore separator | deny     | ✅     |
| B cannot SELECT A's object                           | deny     | ✅     |
| B cannot DELETE A's object                           | deny     | ✅     |

**7/7 passed.** The separator case is the one most likely to be lost to a future "simplification": the trailing underscore in `starts_with(name, uid || '_')` is what stops one user id that is a string prefix of another from matching. It is enforced.

Note these policies remain **defence in depth, not the primary control** — all real access is service-role behind a route that checks the `{user_id}_` prefix, exactly as `ADR-FILE-001` accepts. What has changed is that the tripwire is now known to work.

---

## 8. Session expiry — `ADR-SEC-003` consequence 4

Measured from a real sign-in by decoding the returned JWT rather than reading a dashboard setting.

| Value                                        | Measured                                      |
| -------------------------------------------- | --------------------------------------------- |
| Supabase access-token lifetime (`exp - iat`) | **3600 seconds (60 minutes)**                 |
| `session.expires_in`                         | 3600 seconds                                  |
| Refresh token issued                         | Yes                                           |
| Application inactivity timeout               | 3600 seconds (`session-timeout-provider.tsx`) |

**Pass** — the consequence requires the Supabase session expiry to be "aligned with or longer than" the 60-minute application timeout, and it is exactly aligned.

**One observation, not a finding.** The two values being _exactly_ equal means they would expire simultaneously if refresh-token rotation ever failed, and which one wins is not deterministic. In practice the browser client auto-refreshes well before expiry, so this does not arise. Recorded because "exactly equal" satisfies the ADR by the narrowest possible margin, and a future change to either number should be made in awareness of the other. **Re-confirm on `grant-pathway-prod` at `P5.4`**, alongside the `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` reconciliation already listed there.

---

## 9. Findings

### `GAP-96` — CSP had no `base-uri` or `form-action` — **Medium — FIXED 2026-08-15**

`base-uri` and `form-action` are the two directives in this policy that **do not fall back to `default-src`** — the CSP fallback chain covers fetch directives only. `default-src 'self'` therefore provided no protection whatsoever on either axis:

- Without `base-uri`, an injected `<base>` tag silently retargets every relative URL on the page, including the Next.js chunk paths.
- Without `form-action`, an injected `<form>` can post to an attacker's origin. **This is the one that matters most here** — Step 4 holds the charity's drafted answers in form state.

**Fixed** in `middleware.ts` by adding `base-uri 'self'` and `form-action 'self'`.

### `GAP-97` — CSP had no explicit `object-src` — **Low — FIXED 2026-08-15**

`object-src` _does_ inherit from `default-src`, so this was a tightening rather than a hole: plugin content was already restricted to same-origin. Nothing in the app loads a plugin, so `'none'` is strictly narrower than the inherited `'self'`. **Fixed** in `middleware.ts`.

### `GAP-98` — `X-Powered-By: Next.js` disclosed the framework — **Low — FIXED 2026-08-15**

Confirmed present on the live deployed host before the fix. Information disclosure only — knowing the framework grants nothing by itself — but it hands an attacker free reconnaissance for choosing which framework-specific advisories to try. **Fixed** by setting `poweredByHeader: false` in `next.config.ts`, the documented option (verified against the bundled Next.js 16.3 documentation per `AGENTS.md` §1).

### `GAP-99` — No application-level rate limiting on authentication actions — **Low–Medium — ASSESSED, NOT FIXED**

`lib/rate-limit.ts` defines two Upstash limiters and both are correctly applied: `aiRatelimit` (5 per 60s) on `/api/generate-summary`, `/api/refine-answer` and `actions/charity.ts`'s lookup; `resendRatelimit` (3 per hour) on `resendVerificationEmail`.

**`signIn`, `registerUser` and `requestPasswordReset` carry no application-level limit.** They rely entirely on Supabase Auth's own built-in rate limiting, which is a real control — but this project has never verified what that hosted limit actually is, and `supabase/config.toml`'s `[auth.rate_limit] email_sent = 2` governs the **local development** instance only, not the hosted projects.

**Not fixed, deliberately.** Adding an application-level limit to sign-in is not a free win: too tight and a legitimate charity locks itself out of its own grant application, which for this product is a worse outcome than the attack being mitigated. That is a product judgement, not a security one.

**Recommended action, for `P5.4`:** read and record the actual auth rate limits configured on `grant-pathway-prod`'s dashboard (Authentication → Rate Limits). If they are at Supabase's defaults, record that as the accepted control with its numbers. **The gap is that nobody has looked** — not that the control is known to be absent.

---

## 10. Dependency-vulnerability position

**Re-run at sign-off, as `P5.2` requires — this is a dated snapshot, not a settled fact.**

```
$ npm audit --audit-level=high        → found 0 vulnerabilities
$ npm audit --json (all severities)   → {"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}
```

**Result, 15 August 2026: 0 vulnerabilities at every severity.** There is no accepted deviation to record.

`security-audit.yml` (weekly Mondays plus manual, deliberately not a required check) remains the standing control. The position has changed three times in three weeks — `brace-expansion` accepted as unfixable 2026-07-30, resolved by Dependabot PR #94 on 2026-08-09, `nanoid` surfacing the same night and fixed 2026-08-14. **Anyone relying on this line should re-run the command rather than trust the date.**

Two Dependabot PRs remain open and deliberately held (#97, dev-dependency group with a genuinely red check; #98, bumping `next` itself). Neither carries a security advisory.

---

## 11. Sign-off

The checks required by `P5.2` have been performed and recorded above, with the scope limits in §2 stated rather than implied. Three findings were fixed during the review and verified; one is recorded as assessed with a named follow-up action.

**Verification of the three fixes:** `type-check` clean, `lint --max-warnings 0` clean, **280/280 tests pass**, and a clean `next build` from an empty `.next`. The tightened CSP was confirmed live — the three new directives present in the response header, `X-Powered-By` absent, sign-in working under `form-action 'self'`, and no CSP violation or blocked resource on any of the seven routes swept.

> **An earlier build run failed** with parse errors in `.next/dev/types/routes.d.ts`. That was the running dev server writing generated types while the build type-checked, not a defect in the change: with the dev server stopped and `.next` removed, the build completes cleanly. Recorded so the failure is not rediscovered and misattributed.

**Not covered by this review, and deliberately so:**

- Anything requiring the production database or the production host — see §2. `P5.4` and `P5.5` cover these.
- Penetration testing by an independent third party. Not in v1 scope; `C15`'s equivalent for accessibility is likewise deferred to a pre-scaling milestone.
- `GAP-21` (an error genuinely arriving in Sentry), which needs the production deployment.

**Signed:** Rapidglobe Ltd
**Date:** 15 August 2026
