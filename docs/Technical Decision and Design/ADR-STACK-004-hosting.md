---
id: ADR-STACK-004
category: Stack
status: Decided
---

# ADR-STACK-004 — Hosting

## Context

Grant Pathway is a Next.js application that requires a hosting platform with zero-configuration deployment, ~~preview environments for testing,~~ and the ability to configure extended function timeouts for AI generation routes (up to 90 seconds). The platform must be cost-effective for a single-developer, bootstrapped product.

**Corrected 2026-08-15 — "preview environments for testing" was never a real requirement of this project** and is struck through above for the same reason as the corresponding Rationale bullet below: the project has no branch-based workflow, so no preview environment has ever been used to test first-party work. Left in the Context section it would have contradicted the correction below, and would have re-entered any future comparison as a stated requirement. **The other two requirements in this sentence stand unchanged**, and the extended function timeout in particular remains the binding one.

## Options Considered

- **Option A — Vercel:** Native Next.js deployment platform. Zero configuration, automatic preview deployments, edge functions, CDN. Hobby tier is free; Pro tier ~$20/month adds extended function timeouts.
- **Option B — Railway:** Container-based deployment, more flexibility, less Next.js optimisation, no built-in preview environments. **Amended 2026-08-15 — the decisive fact was missing: Railway has no UK region.** Its four regions are US West (California), US East (Virginia), EU West (**Amsterdam**) and Southeast Asia (Singapore). This conflicts with `C13` (UK-region data hosting), whose implementation note records Vercel's function region being pinned to London (`lhr1`) on 2026-05-29 expressly to satisfy it. Adopting Railway would require amending `C13`, `DR-DP-002` and the published Privacy Policy. The "less Next.js optimisation" characterisation above is also now overstated — see the Rationale correction below.
- **Option C — AWS (Amplify or EC2):** Maximum flexibility, significantly higher operational overhead, not appropriate for single-developer at this stage.
- **Option D — Render:** PaaS with good Next.js support, no native Next.js optimisations, less ecosystem integration.

## Decision

**Option A — Vercel.**

Vercel is the hosting platform. The Pro plan is required to configure `maxDuration = 90` on AI generation routes (see ADR-OPS-001 and ADR-AI-006).

**Reaffirmed 2026-08-15 (WJ), on evidence rather than by default.** A proposal to migrate to Railway (`P5.4a`, raised 2026-08-14) was evaluated in full against the wider market — see `hosting-platform-review-2026-08-15.md`. The decision is unchanged, but **the reasons for it have changed**, which is why the two Rationale bullets above are corrected rather than left standing:

- **Two of the three drivers for moving were already resolved** on the current plan. Vercel Pro permits `maxDuration` up to **300 seconds** (`ADR-AI-006`), against 90s configured and a slowest recorded summary of 40–47s; and `ADR-OPS-004`'s three cron jobs, including the 30-minute one, already run. Both were **Hobby-plan** limits that ceased to apply when Pro was activated.
- **Railway fails `C13`** (no UK region — see Option B above). Render fails identically (Frankfurt only). **AWS App Runner is eliminated** — it supports `eu-west-2` but has been closed to new customers since 2026-04-30.
- The candidates that **do** preserve UK region are each weaker on operational burden for a sole non-developer operator: **Fly.io** (`lhr`) has no native scheduled-job feature, and **Google Cloud Run** (`europe-west2`) brings Artifact Registry / Cloud Build / IAM configuration and cold starts.
- **Exit cost was measured, not assumed, and is low** — roughly a day of work. That is what tips the decision: lock-in this cheap to escape does not justify pre-empting a launch. Had it come out high, the recommendation would have gone the other way, because migrating a live service post-launch is strictly harder than migrating before production exists.

**Conditional, recorded so it is not lost:** if `C13` is ever formally relaxed to UK-or-EEA, **Railway becomes genuinely viable** and is the strongest candidate on developer experience, scheduled jobs and cost. That is a data-protection decision to be taken on its own merits, not a hosting one.

## Rationale

- ~~Vercel is built by the creators of Next.js and provides first-class support with no deployment configuration required.~~ **Corrected 2026-08-15 — this overstates the position as of Next.js 16.3.** The framework's own bundled documentation (`node_modules/next/dist/docs/01-app/02-guides/deploying-to-platforms.md`) states that to run Next.js "your platform needs **a Node.js server. That's it**", that a single `next start` process handles Server Components, ISR, PPR, Cache Components, Server Actions, Proxy and `after()` correctly, and — directly on the point — that "there are **no private framework hooks or integration paths**: Vercel's adapter uses the same public API as every other adapter." The accurate statement is narrower: **Vercel requires no deployment configuration, and leads on _performance_ fidelity (CDN-latency static shells, sub-second ISR propagation) rather than on _functional_ fidelity, which any Node.js server achieves.** That is still a real advantage; it is not the categorical one this bullet claimed. Was likely accurate when written on 2026-04-17.
- ~~Automatic preview deployments for every pull request support the development workflow.~~ **Corrected 2026-08-15 — this is not true of how the project is actually developed, and appears never to have been.** All 15 most recent pull requests are Dependabot dependency bumps, and `master`'s history is perfectly linear: every commit of first-party work is pushed directly to `master`, with no feature branches. The only preview deployments Vercel has ever generated are for dependency bumps, and those are gated by CI (`type-check`, `lint --max-warnings 0`, the test suite, `next build`) rather than by anyone opening a preview URL. **Preview deployments carry no weight in this decision** and should not be cited in any future hosting comparison.
- Vercel's CDN and Edge Network provide optimal performance for a UK-based user base.
- The Pro plan resolves the Vercel function timeout blocker (60-second AI generation vs 10-second Hobby limit).
- Monthly cost of ~$20 is within the C1 budget constraint of £150/month operating cost. _C1 raised from £100 to £150/month on 2026-08-05 (WJ's decision; `P5.0` register ref **R-06**) — the £100 total was already breached by committed spend before a single AI call._

## Consequences

- Vercel Pro plan is a required operating cost (ADR-OPS-001 must confirm this).
- The 4.5MB request body limit on Vercel means file uploads must bypass Vercel entirely (ADR-FILE-001 BLOCKER).
- AI generation routes must explicitly set `export const maxDuration = 90` in the route file.
- Environment variables are managed in the Vercel dashboard (ADR-SEC-006).
- **Function Regions must be London (`lhr1`) only, and this must be re-checked after any Vercel project change.** Added 2026-08-17 — see the region decision below. It is a **dashboard-only setting with no representation in the repository**, so nothing in a code review or a CI run would reveal a change to it. It belongs in `DEV-PROD-PARITY-CHECKLIST.md` for that reason.

## Function region — decided 2026-08-17 (WJ)

**Decision: London (`lhr1`) alone. Dublin (`dub1`) considered as a secondary region and rejected.**

⚠️ **This was not a free choice being made for the first time — it corrects a default nobody had looked at.** Vercel's default Function Region for all new projects is **Washington, D.C. (`iad1`)**, and this project had both `lhr1` and `iad1` selected. Raised as **`GAP-110`**.

✅ **Verified 2026-08-17: `/api/health` returns `region: "lhr1"`.** Functions execute in London. The route reports `VERCEL_REGION`, which Vercel sets inside the running function, so this is the system stating its own region rather than a dashboard stating an intention.

⚠️ **The gap was raised on evidence that turned out to be wrong, and the correction matters more than the fix.** Axiom's `vercel.region` field showed roughly half of all `source == "lambda"` execution in US regions (`fra1` 28, `sfo1` 21, `iad1` 5, `cle1` 1, `lhr1` 1 in one window), and that was read as US execution. **`fra1` was consistently the largest value while Frankfurt has never been ticked in Function Regions** — which should have been the tell. The field does not report execution region; it is almost certainly the edge location that received the request. **`iad1` genuinely was selected and the setting was genuinely wrong. The claim that half of all execution was happening in the United States was not established, and now cannot be** — the only measurement taken has been discredited.

**Why `lhr1` alone, and not `lhr1` + `dub1`:**

1. **Multi-region compute buys no real resilience while the database is single-region.** Supabase and Bedrock are both `eu-west-2` (London). If London fails, Dublin functions still reach for a London database and a London AI endpoint, and fail too — with an extra sea crossing first. The failover cannot fire in the scenario that would justify it.
2. **`C13` says UK, not UK-or-EEA.** Dublin is Ireland — benign under the adequacy decision, but it reintroduces a "why is this one different" paragraph into a privacy policy we are trying to simplify. This ADR already records that relaxing `C13` to UK-or-EEA reopens the hosting decision itself, so that relaxation is not a small edit.
3. **Latency would get worse, not better.** With two regions Vercel routes to the nearest **region**, not the nearest **database**. An Irish or northern-UK user could land on `dub1` and round-trip to London on every query.

**Revisit triggers:** the database gaining a read replica or a multi-region configuration, or real `lhr1` outages appearing in UptimeRobot. Both are post-launch concerns.

**Minor note for whoever reads Vercel's docs next:** the documentation's own screenshot says "up to 3 regions on your current Pro plan"; the live panel on this project says **5**. Go by the panel.

## Source

technology-stack.md (TS-04 — Hosting Platform), NFR-01 (AI response time targets), C1 (Operating cost budget).

## Date Decided

2026-04-17

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-15 | **Decision reaffirmed; two Rationale bullets corrected; Option B (Railway) amended.** The "built by the creators of Next.js / first-class support" claim is overstated as of Next.js 16.3, whose own documentation states that Vercel's adapter uses the same public API as every other adapter. The preview-deployments claim does not match how the project is developed and appears never to have. Option B was missing the decisive fact that Railway has no UK region. Source: `hosting-platform-review-2026-08-15.md`. Table added on this date — this ADR previously had no revision history. |
