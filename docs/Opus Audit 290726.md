# Opus Audit — 29 July 2026

**Tier:** 3 — Stable
**Volatility:** Low
**Update when:** A finding in this report is resolved, or a follow-up audit supersedes it

**Auditor:** Claude Opus 5 (independent review, commissioned by W Jokhia)
**Repository:** https://github.com/RapidGlobe/grant-pathway
**Commit audited:** `d1e6456` — "Fix stale README: de-version AI model/ADR count, add missing CI workflow"
**Branch state:** local `master` level with `origin/master`, working tree clean
**Scope:** (1) alignment between the running service and its documentation; (2) currency of the technical design and technology stack against current practice

**No changes were made to the service or to any existing documentation.** This file is the only artefact added.

**Amendment history**

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-29 | **M6 rewritten** after querying the GitHub API directly. The original said branch protection did not exist; it does — classic protection is live on `master` with all four CI checks required, but `enforce_admins` is `false`, so the only contributor is exempt. Cause differs, practical exposure is the same. A dependency on M2 was identified (admin enforcement cannot be enabled while `audit` is red) and recorded in M2, M6 and §7. |
| 2026-07-29 | **S4's Sentry row corrected — the original finding was wrong.** It claimed the production Sentry DSN was empty and that production had no error visibility. Verified directly: the production bundle carries a live, correctly-regioned EU DSN and Sentry is receiving events. The false claim was inherited from a stale note in `IMPLEMENTATION-STATUS-ARCHIVE.md`. Corrected in S4 and recorded in §2.                                     |
| 2026-07-29 | **O10 added** — `middleware.ts` is deprecated in Next 16 (renamed to Proxy). Found while correcting M1's documentation paths, and traced to the same root cause: the unenforceable check in `AGENTS.md` §1 meant no session ever read the deprecation notice. Recorded as an observation rather than a Low finding because the recommendation is explicitly to migrate _after_ go-live. Added to §6 and §7.                                   |
| 2026-07-29 | **M8 added** — Server Action version skew. Found by investigating a real production Sentry issue while reviewing S4, so it is evidence-led rather than inspection-led: Vercel Skew Protection is off, and Server Action failures surface as unhandled promise rejections with no user-visible error. Added to §4 and §7.                                                                                                                      |

---

## Contents

1. [Method and coverage](#1-method-and-coverage)
2. [Verification results](#2-verification-results)
3. [Severe — must be resolved before go-live](#3-severe--must-be-resolved-before-go-live)
4. [Medium — must be resolved before go-live or the service is handicapped](#4-medium--must-be-resolved-before-go-live-or-the-service-is-handicapped)
5. [Low — nice to resolve before go-live](#5-low--nice-to-resolve-before-go-live)
6. [Observations](#6-observations)
7. [Suggested order of work](#7-suggested-order-of-work)

---

## 1. Method and coverage

| Check                          | How                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build and type health          | `npm run type-check`, `npm run lint`, `npm run format:check`, `npm test`, `npm audit --audit-level=high`                                                  |
| CI reality vs documented gates | `gh run list` / `gh run view` on the last 12 `ci.yml` runs and 5 `schema-drift-check.yml` runs                                                            |
| Documentation cross-references | Automated scan of all 210 markdown files for broken relative links, and of every backticked file path for referents that do not exist                     |
| Index completeness             | Every ADR / DR / PDR / DDR file on disk checked against its index                                                                                         |
| Doc governance                 | Every live doc checked for the `**Tier:**` header AGENTS.md mandates                                                                                      |
| Code vs docs                   | `data-model.md` vs `supabase/migrations/`, `technical-design.md` and `technology-stack.md` vs `app/` `lib/` `actions/`, PRD/NFR claims vs route inventory |
| Stack currency                 | `package.json` and `package-lock.json` vs installed tree; Node/Next/React support windows; open Dependabot PRs                                            |
| AI layer                       | `lib/prompts.ts`, both Bedrock call sites, model ID format, request parameters, forward-compatibility                                                     |
| Security surface               | `middleware.ts` route gating, rate-limit coverage, env validation, secrets handling                                                                       |
| Go-live readiness              | `IMPLEMENTATION-STATUS.md`, `IMPLEMENTATION-STATUS-ARCHIVE.md`, `ADR-TRACEABILITY.md` GAP register, `DEPLOYMENT-CHECKLIST.md`, `docs/legal/`              |

**What I could not verify.** Vercel environment-variable values (all eight required secrets are marked Sensitive and cannot be read back), live Supabase schema state (read only through the Schema Drift Check workflow result), and anything requiring an authenticated browser session against the running app. Findings that depend on these are attributed to the repository's own records and labelled as such.

---

## 2. Verification results

Everything in this table passes. It is recorded so the findings below are read in proportion.

| Check                                             | Result                                                                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run type-check`                              | Pass — 0 errors                                                                                                                                                 |
| `npm run lint` (ESLint, `--max-warnings 0`)       | Pass — clean                                                                                                                                                    |
| `npm test` (Vitest)                               | Pass — 10 files, 101 tests, 0 failures                                                                                                                          |
| CI `lint-and-typecheck` job                       | Pass on latest `master`                                                                                                                                         |
| CI `test` job                                     | Pass on latest `master`                                                                                                                                         |
| CI `validate-migrations` job                      | Pass on latest `master`                                                                                                                                         |
| `ADR-INDEX.md` vs 49 ADR files                    | Complete — no orphans, no phantom entries                                                                                                                       |
| `DECISIONS-INDEX.md` vs 31 DR files               | Complete                                                                                                                                                        |
| `PRD-DECISIONS-INDEX.md` vs 26 PDR files          | Complete                                                                                                                                                        |
| `DESIGN-DECISIONS-INDEX.md` vs 14 DDR files       | Complete                                                                                                                                                        |
| Broken relative links in live (non-archived) docs | None                                                                                                                                                            |
| Bedrock model ID format                           | Correct — `anthropic.` prefix, no date suffix                                                                                                                   |
| Dormant schema documented rather than hidden      | Yes — `funders` / `funder_id` marked dormant in `data-model.md` with the deciding DR and date                                                                   |
| Internal vs external legal copies in sync         | Yes — identical section headings, delta is exactly the internal changelog blockquotes                                                                           |
| Production error reporting (added 2026-07-29)     | **Working** — live EU-region DSN in the production bundle, Sentry receiving `production` events. Corrects the original S4 claim; see the correction note in S4. |

---

## 3. Severe — must be resolved before go-live

### S1 — There is currently no production database, and the drift alarm has been ringing for over three weeks

The `Schema Drift Check` workflow has failed on **every daily run** for at least the last five days, and per the project's own record has been failing since 2026-07-06. `IMPLEMENTATION-STATUS.md` marks P6.1, P6.2 and P6.5 as "✅ Complete — **dev only**", and the archive records that "production env vars still point at the dev Supabase project, so the (empty) prod project receives no API activity."

Taken together: the production Supabase project holds no schema and no data, the production deployment is running against the **development** database, and three phases of migrations exist only on dev. This is the single largest go-live blocker. It also means every "live-verified" test result to date was verified against dev.

The workflow that exists to catch exactly this has been red for 23+ days. A permanently-red alarm is not a working alarm.

**Fix:** the P5.4 production-infrastructure task — apply all 29 migrations to `mvmjryipieepvsjudche` in order, repoint production env vars, then confirm the drift check goes green and _keep_ it green.

### S2 — Live legal pages are published with no effective date

`/terms` and `/privacy` are live and statically prerendered. Both source documents carry:

```
**Effective date: [TO BE CONFIRMED]**
```

RapidGlobe Ltd is the registered data controller (ICO ZC168720) and the service processes charity personal data today. A published privacy policy with no effective date is not a defensible position for a data controller, and P5.1 (Compliance) — which carries the solicitor review — has not started.

**Fix:** set both effective dates, complete the solicitor review, and mirror the change into `terms-of-service-external.md` / `privacy-policy-external.md` (the files the pages actually render).

### S3 — An internal design mock-up is publicly reachable on the production site

`app/mockup/page.tsx` sits outside both the `(public)` and `(authenticated)` route groups. `middleware.ts` gates access with an **allow-list** (`PROTECTED`), and `/mockup` is not in it, so the page requires no authentication. `app/robots.ts` disallows only `/api/`, `/account/` and `/dashboard/`, so `/mockup` is also indexable.

The page contains internal product-strategy text, including:

- "Already built — covers 10 of 12 target funders"
- "Does not handle narrative funders (Garfield Weston, City Bridge)"
- "Implement **Option B** for narrative funders alongside the existing structured Q&A"

The file's own header says _"Not connected to real data. Safe to delete after design sign-off."_ Sign-off happened — Option B was built. This is dead code that was never removed and is now serving internal roadmap notes on a public URL, with an external tester beta beginning.

**Fix:** delete `app/mockup/` (the header already authorises it). If it is still wanted for reference, move it into `docs/Business Design/` as static HTML alongside `mockup.html`, which is where the equivalent artefact already lives.

### S4 — Phase 5 has not started, and it is the go-live gate

`IMPLEMENTATION-STATUS-ARCHIVE.md` shows P5.1 Compliance, P5.2 Security review, P5.3 Accessibility, P5.4 Production infrastructure and P5.5 Final testing **all "Not started"**, while the Phase 6 → Go-Live Gate requires P5.1–P5.5 _and_ P6.1–P6.5 complete. This is tracked and known, not an audit discovery — but three items inside it carry independent audit weight because they are live gaps right now, during a beta:

| Gap                                        | Consequence today                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| UptimeRobot monitor not configured         | No uptime measurement at all, against a documented 99.5% target (NFR-02)                   |
| Production Supabase still on the free tier | No automated backups, contrary to `ADR-DATA-005`, which makes Pro a pre-launch requirement |

**Correction, 2026-07-29 — this table originally listed a fourth gap, "Production Vercel Sentry DSN is empty / no error visibility in production." That was wrong and has been removed.** Verified directly: `vercel env ls` shows both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` present in the Production environment, and the deployed production JavaScript bundle carries a live DSN on `o4511417358745600.ingest.de.sentry.io` — the correct EU region, matching the org ID recorded in `IMPLEMENTATION-PLAN.md:1587` and the only Sentry host the CSP permits. Sentry is receiving production events. The false claim was inherited from `IMPLEMENTATION-STATUS-ARCHIVE.md:830`, a P3.7-era note reading _"production Vercel DSN is empty — to be set at P5.4"_ that was never updated after the DSN was set. **That stale line should be corrected** so it does not mislead again. §1 flagged that Vercel Sensitive values could not be read back and that such findings rested on the repository's own records; this is the case where the record was wrong and the finding should have been pressed further before being written.

One genuinely unverified part of the same P5.4 item remains: `IMPLEMENTATION-PLAN.md:1587` also requires PII scrubbing confirmed active and **email alerts configured for new error types**. Seven issues have accumulated in Sentry without being noticed, which suggests no alert rule exists. Errors that arrive but are never read provide little more protection than errors that never arrive.

Also inside P5.4 and easy to lose: the production Supabase redirect-URL allowlist has never been populated. The dev equivalent had to be added manually before email verification worked at all — the same omission in production would break registration for every user on day one.

---

## 4. Medium — must be resolved before go-live or the service is handicapped

### M1 — AGENTS.md's most-emphasised rule points at paths that do not exist

AGENTS.md §1 is the first mandatory pre-task check, framed in the strongest terms in the file: _"This is NOT the Next.js you know… read the corresponding guide before touching any code… If the guide contradicts your training data, the guide wins."_ It then gives five paths under `node_modules/next/dist/docs/`:

```
app-router/building-your-application/routing/
app-router/building-your-application/data-fetching/
app-router/building-your-application/routing/middleware.md
app-router/building-your-application/routing/route-handlers.md
app-router/api-reference/next-config-js/
```

**None of these exist.** There is no `app-router` directory anywhere in the installed package. The real tree is:

| Area                               | Actual path (verified in the installed Next 16.2.11)                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Routing, layouts, pages            | `01-app/01-getting-started/03-layouts-and-pages.md`, `01-app/03-api-reference/03-file-conventions/` |
| Server Components / Server Actions | `01-app/02-guides/server-actions.md`                                                                |
| Middleware                         | `01-app/03-api-reference/03-file-conventions/` (see also `01-app/02-guides/`)                       |
| Route Handlers                     | `01-app/01-getting-started/15-route-handlers.md`                                                    |
| `next.config.ts`                   | `01-app/03-api-reference/05-config/01-next-config-js/`                                              |

Every AI session that has followed AGENTS.md literally has found nothing at these paths and has either skipped the check or improvised. The rule exists specifically to stop training-data-era Next.js patterns entering the codebase, and it lists the past bugs it was written to prevent. It has been structurally unenforceable. This also directly undermines `DR-BM-002` (succession plan), which depends on AGENTS.md being followable by a future maintainer.

I have not corrected it, per your instruction. It is a five-line fix.

### M2 — The documented deploy gate does not exist, and CI has been red on every push for a month

`DEPLOYMENT-CHECKLIST.md` states two things that are not true in practice:

1. Pre-deploy: _"GitHub Actions CI is passing (type-check, lint, format:check all green)"_
2. Deploying: _"On CI pass, Vercel builds and deploys to production automatically"_

The last 12 `ci.yml` runs on `master` show **11 failures and 1 success** — the `audit` job has been red continuously since roughly 2026-07-25. Deploys have continued throughout. So Vercel is not in fact gated on CI passing; it deploys on push regardless. The checklist describes a safety gate the project does not have.

Two sub-problems:

- **The `audit` job being permanently red desensitises the whole CI signal.** I understand the red is known and accepted (`brace-expansion` via `eslint`/`eslint-config-next`, both devDependencies, unfixable short of the deferred ESLint 10 upgrade in PR #70) and I am not reopening that decision. The issue is different: while `audit` is red, the run-level status is red, so a genuine failure in `test`, `lint-and-typecheck` or `validate-migrations` produces the same red you have learned to ignore. I confirmed the other three jobs currently pass — but nothing would have told you if they did not.
- **The checklist lists three checks; CI runs four jobs.** It omits `test`, `audit` and `validate-migrations` entirely, and uses names (`Quality`/`Tests`/`Security`/`Migrations`, also used in `README.md` and `technology-stack.md` TS-08) that match no actual job name.

**A third consequence, found while pushing this report (see M6):** `master` has branch protection requiring all four checks, so while `audit` is red the requirement is **unsatisfiable** — no push can ever legitimately satisfy it, and every push proceeds only because admins are exempt. The red job is therefore not merely noise; it has made the branch-protection rule structurally impossible to meet, which is very likely why admin enforcement was left off in the first place. Fixing `audit` unblocks M6.

**Fix (either is enough for the desensitisation):** allow the known advisory so `audit` goes green and a real failure is visible again, or split `audit` into a separate non-blocking workflow so `ci.yml` reflects only gating checks. Then either configure Vercel's Ignored Build Step to gate on CI, or amend the checklist to say plainly that deploys are not CI-gated and CI must be checked manually.

### M3 — The mandatory feature-flag convention is not being followed

`DEPLOYMENT-CHECKLIST.md` §"Feature flag convention" is unambiguous: _"Any change in the following categories **must be wrapped in an environment variable flag before it ships**… AI prompt logic — changes to `lib/prompts.ts`… Do not ship a significant change in these categories without a flag."_

Only two flags exist, both about preprocessing (`DISABLE_TEXT_PREPROCESSING`, `PREPROCESS_CHAR_CEILING`). Meanwhile these `lib/prompts.ts` changes have shipped since, none flagged:

- `temperature: 0` plus an anti-merge rule (Step 3 extraction determinism fix, 2026-07-15)
- The table-format budget-question rule (2026-07-27)
- The `[ITEM N]` fallback citation marker (2026-07-21)
- Governance-fact detection and the manual-add fallback (`PDR-AI-008`)

Each of these is exactly the category the convention names, and each was found by live testing — i.e. precisely the risk profile the convention was written for. Separately, `AI_ENABLED` **is** a real kill-switch in both AI routes and in `.env.example`, but it does not appear in the checklist's feature-flag table, so the one flag that matters most in an incident is undocumented where an operator would look for it.

**Fix:** either add `AI_ENABLED` to the table and start honouring the convention, or amend the convention to match what you actually do (rely on Vercel instant rollback for prompt changes). The current state — a mandatory rule that is routinely not followed — is worse than either.

### M4 — CI runs an end-of-life Node version, and nothing pins Node at all

`ci.yml` pins `node-version: '20'` in all three Node jobs. **Node 20 reached end-of-life on 30 April 2026** — it receives no further security patches. Related:

- `package.json` has **no `engines` field**, so nothing declares or enforces a Node version.
- Local development is on Node **v24.14.1** — a four-major-version gap from CI, so CI is not testing the runtime the code is developed on.
- `README.md` says "Node.js 18+", which is below the installed Next 16.2.11's own declared requirement of `>=20.9.0`. Following the README would produce a build that cannot run.

**Fix:** move CI to Node 22 (current LTS) or 24, add `"engines": { "node": ">=22" }`, correct the README, and confirm the Vercel project's Node version matches.

### M5 — `grantpathway.org.uk` is hardcoded throughout, but the domain does not resolve yet

`technology-stack.md` TS-10 records the domain as registered with "DNS to be pointed to Vercel pre-launch". The live app is `grant-pathway-three.vercel.app`. Meanwhile the domain is hardcoded in nine places:

| File                                                                                           | Consequence right now                                                                                                                        |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/emails/account-deleted-user.ts`, `account-deleted-inactivity.ts`, `inactivity-warning.ts` | **Live transactional emails link to a non-resolving domain.** A tester who deletes their account gets a confirmation email with a dead link. |
| `app/sitemap.ts`                                                                               | `sitemap.xml` advertises five URLs that do not resolve                                                                                       |
| `app/robots.ts`                                                                                | Points crawlers at a sitemap that does not resolve — and `allow: '/'` means the pre-launch `vercel.app` host is itself indexable             |
| `app/layout.tsx` (`metadataBase`, OG `url`)                                                    | Canonical and social metadata point at a dead domain                                                                                         |

The DNS cutover is a P5.4 step, so this largely self-resolves at launch — but it is broken today, during the external beta, and the pre-launch site being indexable is worth closing now regardless.

**Fix:** derive the base URL from an environment variable with the domain as the default, and add `disallow: '/'` to `robots.ts` until the domain is live.

### M6 — Branch protection is configured but exempts the only person who pushes, and GAP-11's status is out of date

_Amended 2026-07-29 after querying the GitHub API directly. The original wording said branch protection did not exist. It does — the finding is narrower and more specific than first written._

`ADR-TRACEABILITY.md` GAP-11 is marked 🔴 BLOCKED, stating that branch protection on `master` "requires GitHub Pro for private repos" and that the workaround is _"team enforces PR review manually."_ Both halves are now inaccurate:

**Classic branch protection is live on `master`** (`GET /repos/RapidGlobe/grant-pathway/branches/master/protection`):

| Setting                                  | Value                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `required_status_checks.contexts`        | `lint-and-typecheck`, `test`, `audit`, `validate-migrations` — all four |
| `required_status_checks.strict`          | `true` (branch must be up to date before merging)                       |
| `allow_force_pushes` / `allow_deletions` | `false` / `false`                                                       |
| **`enforce_admins`**                     | **`false`**                                                             |
| `required_pull_request_reviews`          | **absent — PR review is not required at all**                           |

So the protection exists and is correctly specified, but `enforce_admins: false` exempts repository admins — which in a solo project is the only person who ever pushes. Every push therefore bypasses it. This was demonstrated while committing this very report; the remote responded:

```
remote: Bypassed rule violations for refs/heads/master:
remote: - 4 of 4 required status checks are expected.
```

That push was documentation-only and harmless, but the mechanism is identical for a code change. The practical position is unchanged from the original finding — nothing stands between an unreviewed commit and an automatic production deploy — but the cause is different: not an absent rule, an unenforced one. There is also no PR-review requirement, so GAP-11's "team enforces PR review manually" workaround describes a process that neither happens nor is required.

**Separately, there is dead configuration:** a repository _ruleset_ named "Protect Master" (id `16804175`, created 2026-05-24) exists with `enforcement: "disabled"`. It has no effect. It appears to be the abandoned first attempt that GAP-11 records as blocked — worth deleting so it isn't mistaken for live protection later.

**Fix — and note the ordering dependency, which matters:** setting `enforce_admins: true` is the real fix, but **it must come after M2**. While the `audit` job stays red, the four-check requirement is unsatisfiable, so enabling admin enforcement today would block every push to `master` — including the P5.4 production work. Fix the red `audit` job first, then enable enforcement, then delete the disabled ruleset and rewrite GAP-11 to describe the actual configuration. If admin enforcement is judged too rigid for a solo developer, that is a legitimate call — but record it as an explicit risk acceptance rather than leaving GAP-11 asserting a blocker that no longer exists and a review process that does not happen.

### M7 — Dependency backlog is stale, and `node_modules` no longer matches the lockfile

Twenty Dependabot PRs are open on `origin`, several already superseded — `next` 16.2.9 **and** 16.2.10 are both open while 16.2.11 is what the lockfile pins; `lucide-react` has three open bumps (1.16, 1.17, 1.23) against 1.23 already in `package.json`. A backlog this size stops functioning as a signal.

Separately, the local install has drifted: `npm ls react` reports `react@19.2.7 deduped invalid: "19.2.8" from the root project`. The lockfile correctly pins 19.2.8; the installed tree is 19.2.7. CI is unaffected (it runs `npm ci`), but local runs are not testing the pinned versions.

**Fix:** run `npm ci` locally to resync, close the superseded PRs, and consider grouping Dependabot updates so the queue stays readable. ESLint 10 / PR #70 stays deferred as already decided.

### M8 — Deploying over an open tab breaks Server Actions, and the failure is silent

_Added 2026-07-29. Found by investigating a real production Sentry issue while verifying S4, so this is evidence-led rather than inspection-led — it has already happened eight times in production._

Sentry issue `GRANT-PATHWAY-6` — "An unexpected response was received from the server", unhandled, 8 events over three weeks, most recently 2026-07-25. The breadcrumb trail is unambiguous:

| Time (BST)   | Event                                                              |
| ------------ | ------------------------------------------------------------------ |
| 16:41:27–28  | Three navigation fetches — dashboard, terms, dashboard — all `200` |
| _~2h02m gap_ | nothing                                                            |
| 18:43:36.620 | `POST /profile` → **`200`**                                        |
| 18:43:36.637 | Unhandled promise rejection, 17 ms later                           |

The request **succeeded** at HTTP level and then React failed to parse the body, via `auto.browser.global_handlers.onunhandledrejection` with `handled: false`. That is the signature of a **Server Action** whose response was not a valid flight payload.

**Cause.** The event's release tag is `5895146465b3` — commit `5895146`, 16:39:22 that day. The tab loaded two minutes later, so it was running that build. But commit `40453bf` deployed at **17:30:42**, an hour before the failed submit. The browser was still executing the older build's JavaScript and posting a Server Action ID the new deployment no longer recognised. This is **version skew**, and it is expected behaviour when Vercel's Skew Protection is disabled — which it was at the time of the audit.

> **Resolved 2026-07-29.** WJ enabled Skew Protection (maximum age 12 hours) and it is verified active in production: every asset URL now carries a deployment-pinning query parameter, e.g. `/_next/static/chunks/….js?dpl=dpl_FGoKRGXkqQzQ4CkdN4KJCmysDHQc`. **Note the correct verification method** — an earlier check here looked for a `__vdpl` cookie and found none. That was the wrong signal: Next.js on Vercel implements skew protection by pinning the deployment ID into asset requests, not by setting that cookie, so its absence proves nothing either way. Twelve hours was judged sufficient because the exposure window is bounded by the 60-minute session timeout rather than by tab lifetime — an idle tab is a signed-out tab, and signing back in loads the current build. That reasoning depends on `D-013` (fixed 2026-07-28), which had previously stopped the client signing users out at all.

The exposure scales with deploy frequency, and the frequency is high: **14 commits were pushed to `master` on 2026-07-25 alone**, each one a production deploy, each invalidating Server Actions for every tab already open.

A second mechanism compounds it. The 2h02m gap is well past the 60-minute session timeout, and on 2026-07-25 the `D-013` defect meant the client never actually signed the user out — so the tab sat looking authenticated. `D-013` was fixed on 2026-07-28, reducing but not removing this path: an expired session hitting a Server Action produces the same unhandled rejection.

**The more serious half is the handling, not the cause.** The `url` tag shows **88% of the 8 events occurred on `.../step/4`** — the answer-writing screen — not on `/profile`. A tester writing grant answers who hits this gets no error message, no retry prompt, and no indication the submit failed; the rejection goes to the global handler and nothing surfaces in the UI. Silent failure on the one screen where losing work costs the user most.

**Fix, in two parts:**

1. **Enable Vercel Skew Protection** (available on the project's Pro plan, a settings toggle, no code change). Suggested maximum age 1 day. Applies to deployments made after enabling.
2. **Handle Server Action failures visibly.** Catch the rejection and surface a recoverable message — "your session expired, please sign in again" or "something went wrong, please try again" — rather than letting it reach the global handler. Step 4 is the priority.

**Not yet distinguished.** The 8 events split into roughly 7 in early July (all release `efd0136c63f8`, all on `step/4`) plus the single 2026-07-25 event analysed above. Either all are skew from a heavy-deploy period, or the early cluster is a genuine Step 4 fault in that release that has since been fixed. The discriminator: check whether the early events also show a long gap between the last successful navigation fetch and the failing POST. A long gap means skew or session expiry; adjacent timestamps mean a real code fault.

---

## 5. Low — nice to resolve before go-live

| #   | Finding                                                                                                                                                                                                                                                                                                                                                | Location                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Document title still reads **"Technology Stack — AI Grant Accelerator v1"**. The product has been Grant Pathway throughout; "AI Grant Accelerator" is only the local working-folder name. Its Document History table is also out of version order (1.8 above 1.0, then 1.1–1.7).                                                                       | `docs/Technical Decision and Design/technology-stack.md:1`                                                                                                                      |
| L2  | Present-tense "all three AI routes" claims survive the deletion of `/api/generate-draft` on 2026-07-01. Only two AI routes exist. `PRD-Grant-Pathway.md` contradicts itself — line 522 correctly says two, line 1232 says three.                                                                                                                       | `technology-stack.md` TS-07 ("and the draft generation route"); `PRD-Grant-Pathway.md:1232`; `non-functional-requirements.md:65`; `DEPLOYMENT-CHECKLIST.md:82` ("draft prompt") |
| L3  | NFR-01's "**Pre-launch recommendation:** investigate document pre-processing… before go-live" is stale — pre-processing was built on 2026-06-05 and GAP-30 closed. The recommendation reads as outstanding work.                                                                                                                                       | `docs/non-functional-requirements.md:29`                                                                                                                                        |
| L4  | Pre-deploy item "Any affected **funder test plan** has been re-run" predates `DR-TEST-001`, which retired per-funder plans for capability layers. The document is also still v1.1 / 15 June 2026 and carries no `**Tier:**` header.                                                                                                                    | `docs/Implementation Plan/DEPLOYMENT-CHECKLIST.md:16`                                                                                                                           |
| L5  | 147 of 174 live docs lack the `**Tier:**` header AGENTS.md §3 mandates. Most are fine in practice — AGENTS.md's own tier tables assign tiers by folder for DR/ADR/PDR/DDR files. The actionable subset is docs AGENTS.md names individually by tier that still have no header: **`docs/PRD-Grant-Pathway.md` (Tier 1)** and `DEPLOYMENT-CHECKLIST.md`. | repo-wide                                                                                                                                                                       |
| L6  | A live flagship test plan cites `docs/Grant Org Guidelines/mkcf-oak-grants-criteria.pdf`; the actual file is `MK Comm oak-grants-criteria-final-nov-2025.pdf`. A tester following the plan cannot find the input document.                                                                                                                             | `docs/Test Plans/MK-Community-Foundation-test-plan.md:15`                                                                                                                       |
| L7  | Consequences still require **two** extraction utilities (`lib/extract-pdf-text.ts`, `lib/extract-docx-text.ts`). The same ADR's Decision section, and the code, use **one** (`lib/extract-text.ts`). Internally inconsistent.                                                                                                                          | `docs/Technical Decision and Design/ADR-FILE-003-pdf-text-extraction.md:74–75`                                                                                                  |
| L8  | **GAP-20** (dependency licence review, `ADR-STACK-005`) has an **empty status cell** — the only GAP with no recorded action at all. Assigned to P5.1, which has not started. Relevant given the proprietary-licence position: no one has confirmed the dependency tree permits closed-source redistribution.                                           | `docs/Implementation Plan/ADR-TRACEABILITY.md`                                                                                                                                  |
| L9  | 24 broken relative markdown links. **All** are in `docs/**/archive/`, `docs/Old/` or `CHANGELOG-ARCHIVE.md` — no live document has a broken link. Cosmetic; noted for completeness and because it interacts with the deferred Implementation Plan tidy-up.                                                                                             | `docs/Implementation Plan/CHANGELOG-ARCHIVE.md` (16), `docs/Test Plans/archive/` (6), 2 others                                                                                  |
| L10 | No `.gitattributes`, with `core.autocrlf=true`. On Windows, `npm run format:check` reports **23 false failures** (pure CRLF-vs-LF), and `npm run format` would rewrite 23 files as line-ending churn. CI is unaffected (LF checkout). Also `supabase/.temp/` is missing from `.prettierignore` — it is the one genuine local format failure.           | repo root                                                                                                                                                                       |

---

## 6. Observations

**O1 — Documentation discipline is genuinely strong, and that is the headline.** All four decision indexes are complete across 120 decision records with no orphans and no phantom entries. No live document has a broken link. Dormant schema is labelled dormant with the deciding record and date rather than quietly abandoned. The GAP register tracks 38 items with resolution dates and honest "accepted deviation" markers. `IMPLEMENTATION-STATUS.md` records not just what was built but what was found wrong and when. For a vibe-coded project this is well above the norm — most of my findings are _staleness at the edges of good documentation_, not absence of documentation. That distinction matters: it means the fixes are small edits, not reconstruction.

**O2 — The technology stack is current and needs no strategic change.** Next 16.2.11 (App Router), React 19.2, TypeScript 6, Tailwind 4, Vitest 4, Zod 4, Supabase, Vercel, Sentry, Upstash, `@base-ui/react`. Nothing legacy, no Pages Router residue, no deprecated framework patterns, no abandoned libraries. The UK/EEA data-residency story is coherently enforced end to end rather than just asserted: Supabase London, Bedrock eu-west-2, Vercel function region lhr1, Sentry EU. Aside from the Node version (M4), I found nothing in the stack I would argue against. The architecture — Server Actions plus route handlers for AI, RLS for tenancy, an item-graph data model — is a reasonable and current shape for this problem.

**O3 — The AI model is fine; there is a specific forward-compatibility trap.** `lib/prompts.ts` pins `anthropic.claude-sonnet-4-6`. That is a **correctly formatted** Bedrock ID (`anthropic.` prefix, no date suffix), and Sonnet 4.6 is still an active, supported model — not deprecated, not retired. Per your standing position, nothing here is actionable. For information: Claude Sonnet 5 is now the current Sonnet tier.

The trap is in the upgrade path, and it is worth recording _now_ while the reason is fresh. There are three `temperature: 0` calls in `app/api/generate-summary/route.ts` — that is the Step 3 extraction determinism fix from 2026-07-15 that resolved the 12→10 question regression. **`temperature` is rejected with a 400 on Sonnet 5 and Opus 5** (non-default sampling parameters were removed). So a future model upgrade will not merely change extraction determinism — it will fail the request outright, and the determinism fix would have to be re-implemented by other means (prompt constraints, or `output_config.effort`). Suggest a one-line note in `PDR-AI-001` or `ADR-AI-002` so whoever does the upgrade does not rediscover this the hard way.

**O4 — De-versioning the model has quietly made the docs inaccurate.** Following your de-versioning preference, the docs now say "Anthropic's latest Claude Sonnet model" (`technology-stack.md` TS-10 and Stack Summary, README, `technical-design.md`). Sonnet 4.6 is no longer the latest Sonnet, so that phrasing is now literally wrong — the drift it was meant to prevent has reappeared in a different form. A formulation that stays accurate without pinning: _"the Claude Sonnet model recorded in `lib/prompts.ts`'s `MODEL` constant"_. The README already does something close to this in its prerequisites section; the pattern just needs applying consistently.

**O5 — Extraction reliability could move from prompt engineering to API guarantees, post-launch.** Extraction currently relies on XML-tag fencing, Zod `safeParse` and a retry (`DR-AI-003`). It works and it is well tested. But the record shows repeated sessions spent on extraction correctness — question-count regressions, merged compound questions, missing budget questions, citation marker handling. Bedrock supports structured outputs (`output_config.format`) and strict tool use (`strict: true`), which move schema conformance into the API rather than the prompt. Not a defect and not a go-live item — but if extraction keeps costing sessions after launch, that is the lever, and it would pair naturally with the model upgrade in O3.

**O6 — NFR-01's performance target has not been re-measured since preprocessing landed.** NFR-01 sets 45s for large documents; the recorded evidence has Clothworkers at 40–47s and summary times of 25–47s observed in later testing. Preprocessing was added specifically to create headroom, but I found no post-preprocessing timing run. One measured pass at P5.5 would either confirm the target holds or tell you it needs revising — currently the document asserts a target the evidence does not quite support.

**O7 — Test coverage is unit-level; every flow test is manual.** The Vitest suite is 10 files / 101 tests, covering `lib/` utilities plus two component tests. There are **no route-handler tests, no Server Action tests, and no automated end-to-end tests**. All flow coverage is manual via the `DR-TEST-001` layers. That is a defensible choice for a solo build and I am not proposing E2E infrastructure before launch. The consequence to be aware of: the CI `test` job cannot catch a regression in the AI routes, the export pipeline, or the item graph — which is exactly where the last month of defects was found, all by manual testing. Post-launch, a handful of route-handler tests around `generate-summary`'s extraction contract would give the best return per unit of effort.

**O8 — Two stale local branches.** `dependabot/npm_and_yarn/prettier-3.8.4` and `dependabot/npm_and_yarn/typescript-6.0.3` exist locally; both are superseded by what is already in `package.json`. Harmless, tidy-up only.

**O9 — On the placement of this file.** I put it at `docs/Opus Audit 290726.md`. There is no existing `reports/` directory, and `docs/Alan Knox Audits/` belongs to a different audit series with its own tracker, so I did not want to file it there. Move it if you would rather it lived elsewhere. Note that if you commit it, AGENTS.md §5 requires `npx prettier --write "docs/Opus Audit 290726.md"` first — it was written from outside the normal edit workflow, so the pre-commit hook will not format it and CI `format:check` would catch it.

**O10 — `middleware.ts` is deprecated in Next 16; migrate after go-live, not before.** _Added 2026-07-29, found while correcting M1's documentation paths._

There is no middleware documentation left in the installed Next 16.2.11 tree — searching it for "middleware" returns no file. The reason is a rename: **as of Next.js 16, Middleware is called Proxy**, and `01-app/03-api-reference/03-file-conventions/proxy.md` states that "the `middleware` file convention is deprecated and has been renamed to `proxy`." Functionality is unchanged. Next ships a codemod that renames both the file and the exported function:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

This project still uses `middleware.ts`, which carries the route allow-list, the per-request CSP nonce, and session handling. It works today and Next will not remove the old convention before v17, so **nothing is broken and nothing is urgent.**

**Recommendation: do not migrate before go-live.** It is a rename with tooling, but it touches authentication and security headers — the two things least worth disturbing while production infrastructure work is outstanding. Best done after launch, or folded into the eventual Next 17 upgrade when it becomes mandatory.

**How it went unnoticed is the more useful part of this finding.** Three things aligned: (1) Next 16 entered the project on 2026-05-20 via commit `b369a95`, titled "fix: update dependencies to resolve security vulnerabilities" — a major framework upgrade arriving inside a security patch, so the release notes announcing the rename were never read; (2) the deprecation is silent, producing no build warning, no lint error and no CI signal; (3) `AGENTS.md` §1, the check written specifically to catch this class of change, was pointing at paths that did not exist (**M1**), so no session ever opened the Proxy page. M1 and O10 are the same root failure surfacing two months apart. With M1 fixed, the next session working in that file will see the deprecation notice.

---

## 7. Suggested order of work

Grouped by dependency rather than severity, since several items share a single work session.

| Order | Work                                                                                                                                                                                 | Covers                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 1     | Delete `app/mockup/`; add `disallow: '/'` to `robots.ts`                                                                                                                             | S3, part of M5 — minutes, and closes a live public exposure                       |
| 1b    | **Enable Vercel Skew Protection** (settings toggle, Pro plan, suggested max age 1 day) and redeploy; then handle Server Action failures visibly, Step 4 first                        | M8 — the toggle takes minutes and should precede the next external tester session |
| 1c    | Configure a Sentry alert rule for new issues, and confirm PII scrubbing is active                                                                                                    | The one part of S4's Sentry item that is genuinely unverified                     |
| 2     | Fix AGENTS.md §1's five documentation paths                                                                                                                                          | M1 — five lines, and every subsequent AI session benefits                         |
| 3     | Get the `audit` job green (or move it out of `ci.yml`); reconcile the checklist's CI section with the four real jobs                                                                 | M2 — restores a working CI signal before the riskiest work below                  |
| 4     | Move CI to Node 22/24, add `engines`, correct the README prerequisite                                                                                                                | M4                                                                                |
| 5     | Make the base URL environment-driven                                                                                                                                                 | M5                                                                                |
| 6     | **P5.4 production infrastructure** — apply all migrations to prod, repoint env vars, prod Sentry DSN, Supabase Pro, redirect-URL allowlist, UptimeRobot, DNS cutover, `git tag v1.0` | S1, S4, remainder of M5                                                           |
| 7     | **P5.1 compliance** — legal effective dates, solicitor review, dependency licence review                                                                                             | S2, L8                                                                            |
| 8     | Documentation staleness sweep in one pass                                                                                                                                            | L1–L7, L9                                                                         |
| 9     | Decide the feature-flag question: honour the convention or amend it; document `AI_ENABLED` either way                                                                                | M3                                                                                |
| 10    | Set `enforce_admins: true` on `master` (**only after step 3** — unsatisfiable while `audit` is red); delete the disabled "Protect Master" ruleset; rewrite GAP-11 to match reality   | M6                                                                                |
| 11    | `npm ci`; close superseded Dependabot PRs; delete stale local branches                                                                                                               | M7, O8                                                                            |
| 12    | **Post-launch:** migrate `middleware.ts` → `proxy.ts` via `npx @next/codemod@canary middleware-to-proxy .`, with auth and CSP retested                                               | O10 — deliberately _not_ pre-go-live                                              |
| 13    | Record the `temperature`/Sonnet 5 upgrade trap in `PDR-AI-001` or `ADR-AI-002`                                                                                                       | O3                                                                                |

---

_Audit produced 29 July 2026. No service or documentation changes were made._
