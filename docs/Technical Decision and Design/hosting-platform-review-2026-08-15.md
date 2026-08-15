# Hosting Platform Review — Grant Pathway v1

**Tier:** 3
**Volatility:** Low
**Update when:** A formal decision to change hosting platform is made, or a candidate's region/cron/pricing position materially changes

**Product:** Grant Pathway v1
**Date:** 15 August 2026
**Author:** Rapidglobe Ltd
**Basis:** `ADR-STACK-004` (Hosting) · `ADR-OPS-001` (Vercel Plan Tier) · `ADR-AI-006` (Function Execution Timeout) · `ADR-OPS-004` (Scheduled Job Mechanism) · `C1` (Operating cost budget) · `C13` (UK-region data hosting) · Next.js 16.3.0 bundled documentation
**Status:** **Evaluation only — no decision taken.** `ADR-STACK-004` and `ADR-OPS-001` stand unamended.

---

## Why this review exists

`P5.4a` was raised on 2026-08-14 as a proposal to migrate hosting from Vercel to Railway, recorded in `IMPLEMENTATION-STATUS.md` as "Proposed — not approved, not counted". On 2026-08-15 WJ gave three drivers for it: **function timeouts on long AI calls**, **cron limitations**, and **avoiding vendor lock-in**, and asked whether other options in the market were worth considering before committing to Railway specifically.

They are. Two reasons:

1. **Railway was never actually evaluated.** `ADR-STACK-004` gives it one line ("Container-based deployment, more flexibility, less Next.js optimisation, no built-in preview environments"). `ADR-OPS-001` lumps "Railway, Render, AWS" into a single bullet ending "Not recommended." There is no analysis to update — there is a gap to fill.
2. **The original evaluation answered a different question.** `ADR-STACK-004` (2026-04-17) weighed hosts on Next.js developer experience, preview deployments and CDN reach. None of the three drivers above appear in it. Timeouts appear only as "the Pro plan resolves it"; cron and lock-in are not mentioned at all.

---

## Overall finding

**Two of the three stated drivers are already resolved, and the named candidate fails the project's own data-residency constraint.**

| Driver            | Position                                                                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Function timeouts | **Already resolved.** Vercel Pro permits `maxDuration` up to **300 seconds** (`ADR-AI-006`, Option A). The app is set to 90s; the slowest real summary on record is 40–47s. Roughly 6× unused headroom without changing anything. |
| Cron limitations  | **Already resolved.** `ADR-OPS-004` chose Vercel Cron; all three jobs are live, including the 30-minute `cleanup-guidelines`.                                                                                                     |
| Vendor lock-in    | **Real, and the only driver that survives scrutiny.** Quantified below — it is smaller than expected, but not zero.                                                                                                               |

The 10-second timeout and once-daily cron cap that made these blockers are **Hobby plan limits**. They stopped applying when Vercel Pro was activated. The ADRs still read as though the constraint is live because they were written before the upgrade and never revisited.

**A fourth driver, which WJ did not name, is the most concrete benefit available: cost.** See §5.

---

## 1. What has changed since ADR-STACK-004

`ADR-STACK-004`'s central rationale was: _"Vercel is built by the creators of Next.js and provides first-class support with no deployment configuration required."_ In April 2026 that was a genuine differentiator. **In Next.js 16.3 it is substantially weaker**, and the framework's own bundled documentation is the evidence.

From `node_modules/next/dist/docs/01-app/02-guides/deploying-to-platforms.md`:

> **Minimum Requirements** — To run Next.js, your platform needs **a Node.js server. That's it.**
>
> A single `next start` process handles every Next.js feature correctly: Server Components, ISR, PPR, Cache Components, Server Actions, Proxy, and `after()`. […] The only additional dependency is the `sharp` package, which is required for Image Optimization.

And, on whether Vercel has privileged access to the framework:

> There are no private framework hooks or integration paths: **Vercel's adapter uses the same public API as every other adapter.**

The same document draws the distinction that matters here: **functional fidelity** (every feature works — binary, and any Node.js server achieves it) versus **performance fidelity** (features hit their optimal performance characteristics — a spectrum where platforms differentiate). Vercel's advantage in 16.3 is almost entirely performance fidelity, not functional fidelity.

**This does not mean "move".** It means the strongest argument recorded in favour of staying is weaker than the ADR states, and any future amendment to `ADR-STACK-004` should say so regardless of which way the decision goes.

---

## 2. Criteria

Derived from WJ's answers on 2026-08-15, with weights reflecting what was actually said rather than what a generic evaluation would assume.

| #   | Criterion                 | Weight      | Basis                                                                                                                                                                                                                                                                                 |
| --- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **UK region available**   | **High**    | `C13` — "All app data must be stored in UK-region cloud infrastructure". WJ: _"some flexibility, so it's a mixture"_ — UK strongly preferred; EU/EEA acceptable but requires rewording `C13`, `DR-DP-002` and the Privacy Policy. Treated as a **ranking factor, not a hard filter**. |
| 2   | **Operational burden**    | **High**    | Sole operator, not a developer (`AGENTS.md`). The incumbent imposes zero ops burden; anything worse is a real cost, not a rounding error.                                                                                                                                             |
| 3   | **Native scheduled jobs** | **High**    | Three live cron jobs (`ADR-OPS-004`), one every 30 minutes. `GAP-31` showed cron correctness here is already subtle.                                                                                                                                                                  |
| 4   | **Long-running requests** | Medium      | 90s today, up to 300s desirable. A container host removes the ceiling entirely.                                                                                                                                                                                                       |
| 5   | **Monthly cost**          | Medium      | `C1` is £150/month total, with only ~£14 unallocated after the Bedrock ceiling (`ADR-OPS-001`).                                                                                                                                                                                       |
| 6   | **Exit cost / lock-in**   | Medium      | The one surviving driver. Quantified in §4.                                                                                                                                                                                                                                           |
| 7   | ~~Preview deployments~~   | **Dropped** | See below.                                                                                                                                                                                                                                                                            |

### Preview deployments — dropped, on evidence

`ADR-STACK-004` lists automatic preview deployments as a main reason for choosing Vercel. **The repository shows they are not used for any human work.** All 15 most recent pull requests are Dependabot dependency bumps; the `master` history is perfectly linear, with every commit of first-party work pushed directly to `master` and no feature branches. The only preview URLs Vercel has ever generated are for dependency bumps, and those are gated by CI (`type-check`, `lint --max-warnings 0`, 280 tests, `next build`) — not by anyone opening a preview.

Preview deployments are therefore **not a selection criterion for this project**, and `ADR-STACK-004`'s rationale overstates their value. This should be corrected in that ADR whichever way the hosting decision goes.

---

## 3. Candidates and the region filter

| Platform               | UK region          | EU region         | Native cron        | Long requests | Ops burden      | Verdict                  |
| ---------------------- | ------------------ | ----------------- | ------------------ | ------------- | --------------- | ------------------------ |
| **Vercel** (incumbent) | ✅ London `lhr1`   | ✅                | ✅ Vercel Cron     | 300s cap      | **None**        | **Qualifies**            |
| **Railway**            | ❌ **None**        | ✅ Amsterdam only | ✅                 | Unbounded     | Very low        | ⚠️ **Fails region**      |
| **Render**             | ❌ **None**        | ✅ Frankfurt only | ✅ Cron Jobs       | Unbounded     | Very low        | ⚠️ **Fails region**      |
| **Fly.io**             | ✅ London `lhr`    | ✅                | ❌ **None native** | Unbounded     | Medium          | Qualifies, with a caveat |
| **Google Cloud Run**   | ✅ `europe-west2`  | ✅                | ✅ Cloud Scheduler | 60 min cap    | **Medium–high** | Qualifies, with a caveat |
| **AWS App Runner**     | ✅ `eu-west-2`     | ✅                | ❌                 | Unbounded     | Medium          | ❌ **Eliminated**        |
| **Self-hosted VPS**    | Provider-dependent | ✅                | ✅ system cron     | Unbounded     | **High**        | ❌ Not recommended       |

### The finding that reorders the proposal

**Railway has no UK region.** Its four regions are US West (California), US East (Virginia), **EU West (Amsterdam)** and Southeast Asia (Singapore). Railway's own documentation notes additional regions "may be added in the future", but Amsterdam is the only European option today.

`C13`'s implementation note records Vercel's function region being pinned to London (`lhr1`) on **2026-05-29 specifically to satisfy this constraint** — "all compute and AI calls now execute in UK region; no international transfer occurs; must be stated in the Privacy Policy". A move to Railway would move app compute to the Netherlands and **make that sentence false**, requiring amendments to `C13`, `DR-DP-002`, and the published Privacy Policy.

This is not fatal — the Netherlands is EEA, adequacy applies, and WJ has indicated flexibility. But it converts "a hosting change" into "a hosting change plus a data-protection documentation change plus a Privacy Policy revision", and `P5.1` (compliance, including independent solicitor review) is already signed off as complete. **Reopening it is a cost the proposal did not account for.**

Render fails the same test for the same reason (Frankfurt).

### AWS App Runner — eliminated

App Runner supports `eu-west-2` (London) and would otherwise have been a reasonable candidate. **It is closed to new customers from 30 April 2026.** Grant Pathway is not an existing App Runner customer, so it is unavailable regardless of merit.

### Fly.io — qualifies on region, fails on cron

Fly.io offers `lhr` (London), satisfying `C13` unchanged, with no platform or seat fee. **It has no native scheduled-job feature.** Fly's own documented approach is `cron-manager`, a separate application you deploy and maintain that spins up a machine per job. For an app with three production cron jobs — one of which (`inactivity-deletion`) irreversibly deletes user accounts and required `GAP-31`'s dedup guard to stop it misfiring — **introducing a self-maintained scheduler is a material step backwards in reliability**, and it lands on an operator who is not a developer.

### Google Cloud Run — qualifies, but the cold-start and complexity costs are real

Cloud Run supports `europe-west2` (London, Tier 2 pricing) and pairs with Cloud Scheduler, which is a genuine managed scheduler. Two caveats:

- **Cold starts.** Cloud Run scales to zero. At Grant Pathway's traffic — a free service with a small user base — most visits would hit a cold container, adding seconds to first load. Pinning `min-instances=1` removes this but removes the cost advantage with it.
- **Configuration surface.** Artifact Registry, Cloud Build, IAM service accounts, and Secret Manager all have to be configured and kept correct. This is "managed" in the sense that Google runs the servers, not in the sense that Vercel is managed.

### Self-hosted VPS — not recommended

Cheapest by a wide margin and the strongest possible answer to lock-in. It also transfers OS patching, TLS renewal, firewall rules, backups and uptime to WJ. Next.js's own self-hosting guide additionally requires a reverse proxy in front of `next start`, **with response buffering disabled or streaming breaks** — which would silently degrade Server Components and Server Actions, the two things the entire five-step flow depends on. Not appropriate here.

---

## 4. Exit cost — what is actually locked in

Twenty-five files outside `docs/` mention Vercel. **Most are comments.** The genuine functional couplings are:

| Coupling                                | Where                                     | Severity   | Replacement                                                                                                                                                                           |
| --------------------------------------- | ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VERCEL_GIT_COMMIT_SHA` → `APP_VERSION` | `next.config.ts:16`                       | Trivial    | Every candidate exposes an equivalent commit-SHA variable, or derive from git at build time.                                                                                          |
| Three cron jobs                         | `vercel.json`                             | Medium     | Native cron on Railway/Render/Cloud Run; a maintained app on Fly.io.                                                                                                                  |
| **Vercel Skew Protection**              | dashboard; noted `lib/action-error.ts:15` | **Medium** | See below — replaceable, but with a real behaviour downgrade.                                                                                                                         |
| Function region pin `lhr1`              | dashboard                                 | Medium     | Only Fly.io and Cloud Run preserve UK region.                                                                                                                                         |
| 4.5MB request body limit                | `app/api/upload/signed-url/route.ts`      | **None**   | Already architected around via direct-to-Supabase upload (`ADR-FILE-001`). A container host would remove the constraint, but **the benefit is already banked** — no gain from moving. |

### Skew Protection is the one worth understanding

Vercel Skew Protection was enabled on 2026-07-29 to mitigate Sentry issue `GRANT-PATHWAY-6` — a browser tab open across a deployment posting a Server Action ID the new deployment no longer recognised. 8 events over three weeks, **88% of them on Step 4**, where users are writing grant answers.

Next.js supports this off-Vercel via `deploymentId` in `next.config.ts`, documented in the bundled self-hosting guide. **The behaviours are not equivalent:**

- **Vercel Skew Protection** routes the stale client to the _old_ deployment for 12 hours. The user notices nothing.
- **`deploymentId`** detects the mismatch and forces a **hard page reload**. The Next.js docs state plainly: _"there may be a loss of application state […] component state like `useState` would be lost."_

For Step 4 specifically, that is a user mid-sentence in a grant answer getting a full page reload. Autosave means the text should survive, but "should" is doing work there, and the existing `SAVE_FAILED_MESSAGE` handling exists precisely because this path has bitten before. **This is a genuine, if modest, downgrade on the single screen where it matters most** — and it would need explicit re-testing, not assumption.

**Net exit cost: low but non-zero.** Roughly a day of work plus re-testing, not a rewrite. The architecture is portable; the operational configuration is what moves.

---

## 5. Cost

WJ did not name cost as a driver. **It is nonetheless the most concrete benefit on offer.**

| Platform         | Monthly cost at this traffic                          | Notes                                                                          |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Vercel Pro**   | **~£16** (fixed, $20/seat)                            | Paid regardless of traffic. Bought for the 30-minute cron and `maxDuration`.   |
| Railway Hobby    | ~£4 ($5/mo including $5 credit)                       | Metered beyond credit; a small always-on container lands near the credit line. |
| Railway Pro      | ~£16 ($20/workspace including $20 credit)             | Per workspace, not per seat.                                                   |
| **Fly.io**       | **~£3–6** ($3.19–4.18 for 512MB, $5.70–7.45 for 1GB)  | **No platform or seat fee.** Egress $0.02/GB in Europe; inbound free.          |
| Google Cloud Run | ~£0–2 scaling to zero; ~£10–15 with `min-instances=1` | 2M requests/month free tier. Cold starts are the trade.                        |
| Render           | Not verified — pricing page did not render            | Moot: fails the region test regardless.                                        |

**Why this matters more than it looks.** `ADR-OPS-001` records ~£14/month unallocated against `C1`'s £150 ceiling, after ~£36 fixed infrastructure and the ≈£100 Bedrock ceiling. Saving ~£12/month on hosting would **roughly double the unallocated headroom** on a budget already described as breached once. That is a real result for a free service funded personally until CIC funding lands.

It is not, however, a reason to move _before launch_ rather than after.

---

## 6. Recommendation

**Stay on Vercel through launch. Revisit hosting post-launch as a deliberate, scheduled decision.**

The evaluation does not produce a clear winner among the alternatives:

- The candidate with the best developer experience and the smallest migration (**Railway**) is the one that **fails the UK-region constraint**, and reopening `C13`, `DR-DP-002` and the Privacy Policy after `P5.1` closed is a cost the proposal never priced.
- The candidates that **preserve** UK region are each worse on the criterion weighted highest after region: **Fly.io** has no native scheduler for an app with three crons, one of which deletes accounts; **Cloud Run** brings hyperscaler configuration complexity and cold starts to a low-traffic app run by a non-developer.
- Two of the three drivers that motivated the proposal **are already solved on the current plan**, and the third — lock-in — is measurably small (§4).

Set against that, `P5.4` is the largest remaining task in Phase 5 and is entirely Vercel-shaped. Inserting a migration ahead of it adds a substantial unplanned piece of work and invalidates `P5.5`'s production test pass before it has been run once.

### The honest argument against this recommendation

**Migrating after launch means migrating a live service with real charities on it.** That is strictly harder than migrating now, while production does not yet exist. If lock-in genuinely concerns WJ, _now_ is the cheapest it will ever be. That is the real case for `P5.4a` — and it is not the case the proposal currently makes, which rests on two drivers that turn out to be already resolved.

The counterweight is §4's finding that exit cost is low. **Lock-in that costs roughly a day to escape does not justify pre-empting a launch.** If the exit cost had come out high, this recommendation would go the other way.

### Conditional

**If `C13` is formally relaxed to UK-or-EEA, Railway becomes genuinely viable** and is the strongest candidate on developer experience, cron support and cost. That is a data-protection decision, not a hosting one, and it should be taken on its own merits rather than as a side effect of wanting a different host.

---

## 7. If the decision is to move anyway

Recorded so the work is not re-derived. In order:

1. **Take the `C13` decision first, in writing**, as its own decision record. It selects the shortlist; nothing else can be sequenced before it.
2. Amend `ADR-STACK-004` and `ADR-OPS-001` to supersede rather than edit — both carry rationales (first-class Next.js support; preview deployments) that this review found overstated, and the audit trail should show that.
3. Build on a **staging deployment pointed at `grant-pathway-dev`**, leaving `grant-pathway-prod` untouched and unlinked, matching the scoping convention every Phase 6 task already uses.
4. Replace the three `vercel.json` crons and **re-verify `GAP-31`'s dedup guard on the new scheduler** — a different scheduler's retry and overlap semantics are exactly where that bug class lives.
5. Set `deploymentId` in `next.config.ts` and **explicitly re-test the Step 4 mid-answer reload path** (§4).
6. Re-point `NEXT_PUBLIC_SITE_URL`, `APP_VERSION`, Sentry release credentials, and the Axiom log drain.
7. Update `C13`, `DR-DP-002`, the Privacy Policy and `technology-stack.md` **before** go-live, not after.
8. Only then re-run `P5.5` against production.

---

## Sources

Platform facts verified 2026-08-15 against vendor documentation. Next.js facts verified against the bundled 16.3.0 documentation in `node_modules/next/dist/docs/`, per `AGENTS.md` §1.

- [Railway — Regions](https://docs.railway.com/reference/regions)
- [Railway — Pricing](https://railway.com/pricing)
- [Fly.io — Pricing](https://fly.io/docs/about/pricing/)
- [Fly.io — Task scheduling guide](https://fly.io/docs/blueprints/task-scheduling/)
- [Google Cloud Run — Locations](https://docs.cloud.google.com/run/docs/locations)
- [AWS App Runner — London region release note](https://docs.aws.amazon.com/apprunner/latest/relnotes/release-2023-11-08-new-regions.html)
- [AWS App Runner — region availability](https://awsfundamentals.com/regions/service/aws-app-runner)
- [Azure Container Apps — Jobs](https://learn.microsoft.com/en-us/azure/container-apps/jobs)
- [Render — EU region and cron jobs](https://danubedata.ro/blog/render-com-alternatives-europe-2026)
