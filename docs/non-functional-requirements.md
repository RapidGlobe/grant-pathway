# Non-Functional Requirements — Grant Pathway v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any change to performance targets, availability, scalability, security, browser support, or accessibility approach

This document captures the agreed non-functional requirements for the v1 build. These inform the BRD and constrain the technical architecture and hosting choices.

---

## NFR-01 — Performance

| Metric                                                                 | Target           |
| ---------------------------------------------------------------------- | ---------------- |
| Page loads and navigation                                              | Under 3 seconds  |
| AI guideline summarisation — standard documents (up to ~8 pages)       | Under 30 seconds |
| AI guideline summarisation — large documents (over 8 pages)            | Under 45 seconds |
| AI answer refine (per question)                                        | Under 15 seconds |
| AI charity-objects paraphrase (profile setup)                          | Under 30 seconds |
| AI guideline summarisation — **eligibility mismatch path** (two calls) | Under 90 seconds |

**The eligibility-mismatch row was added 2026-08-19 (`GAP-115`), and it exists because the path was never budgeted.** When a Step 3 summary returns `eligibilityMismatch: true`, the route makes a **second Bedrock call** to confirm before hard-stopping — `DR-EL-001`'s stop has no override, and a verdict that flips on retry is not the unambiguous mismatch it requires. **The rows above were written for one call and never revisited when the second was added.** **Measured on production 2026-08-19:** a mismatch on a **4-page PDF — a standard document by the 30-second row above — took 58.5 seconds** (26.6s first call, ~29s confirmation; Axiom request `xd7jf-1787150244706-a875c3d9bd42`). That is **more than double this same document's 25-second baseline of 2026-06-04**, and by the size-based rows it would have been judged a pass. ⚠️ **The 90-second target here is honest rather than aspirational:** it reflects what two calls actually cost, not what would be pleasant. **The applicant who waits longest is the one being rejected**, and they are the least likely to complain about it. **Reducing it is `GAP-115` option (c)** — the confirmation call regenerates the entire summary to re-read one boolean, which is the waste worth removing. `maxDuration` on the route was raised 90 → 180 the same day so that a **large** document on this path cannot time out and show a generic failure in place of a correct rejection.

**The paraphrase row was added 2026-08-05 (`P5.0`, register ref R-12).** This document previously specified targets for two of the three user-facing AI operations. The charity-objects paraphrase — which runs during profile setup when a Charity Commission lookup matches, logged as `request_type = 'charity_paraphrase'` — had no target and no evidence anywhere, despite carrying a 60-second function budget (`export const maxDuration = 60` in `app/(authenticated)/profile/page.tsx`). The 30-second target is set by analogy with standard-document summarisation, deliberately well inside the 60s budget, and is **unmeasured** — it joins the `P5.5` measured pass alongside the other two.

**The refine target and its alert threshold are 3.3× apart — recorded, not yet reconciled (2026-08-05, `P5.0`, register ref R-13).** The 15-second target above has **never been measured**; the 2026-06-04 evidence below covers summarisation only. Meanwhile `GAP-03` (a `P5.4` item) will raise a Sentry alert only when refine P95 exceeds **50 seconds**, ahead of the 60s hard limit in `app/api/refine-answer/route.ts` — so a refine running at three times its stated NFR target triggers nothing. That is a defensible pair of numbers (one is a design target, the other a "something is badly wrong" alarm) but the gap should be a deliberate choice rather than an accident. `P5.5`'s measured pass is what settles it: if real refine times cluster near 15s the alert is fine, and if they cluster at 30s the target is wrong.

**The standard-document target was exceeded on 2026-08-07, measured, and the fix for `GAP-52` widens the gap rather than closing it.** A Stony Stratford Town Council application form (9,005 characters after pre-processing — a standard document by the row above) took **38.6 seconds** end to end, of which 34.6s was the Bedrock call itself, against a **30-second** target. **And the `GAP-52` fix deliberately makes longer responses possible:** `SUMMARY_MAX_TOKENS` was raised 4000 → 6000 because the old ceiling was truncating real documents, and at the ~130 tokens/sec observed that permits generation of roughly **46 seconds** — past this table's 30s standard-document target and past its 45s large-document target too. That was chosen against the 60-second `AbortSignal` in `app/api/generate-summary/route.ts`, not against these numbers, and the two should be reconciled rather than left to disagree quietly. **Neither target has ever been measured at scale** — the 2026-06-04 evidence below is the only summarisation data, and it predates both the citation-extraction work (P6.3) and the several prompt-rule additions since, each of which lengthens the response. `P5.5`'s measured pass is what settles whether 30s is still the right target or was simply never revisited. Recorded here rather than silently accepted, and **for WJ**: raising a ceiling to stop truncation while an NFR says responses must be quicker is a real tension, not a bookkeeping detail.

**Notes:** Grant writing is not a real-time task. Users will tolerate a short wait for AI summary generation and for AI-assisted refinement provided a clear progress indicator is shown. These targets are based on Amazon Bedrock Claude API performance observed during funder test cycles (2026-06-01 to 2026-06-04).

**Performance evidence from funder testing (2026-06-04):**

- LBF Specialist Programme (Word form, ~10 pages): 24 seconds ✅
- Walton Charity (PDF, 4 pages): 25 seconds ✅
- Garfield Weston Foundation (PDF, 11 pages): 33–37 seconds ✅ (under 45s target for large docs)
- Clothworkers' Foundation (PDF, multi-form): 40–47 seconds — approaches the large-document limit; performance improvement recommended before go-live

**⚠️ The figures above are the 2026-06-04 baseline, measured _before_ document pre-processing existed. They have not been re-measured since. See "Status of the pre-launch recommendation" below.**

**Status of the pre-launch recommendation — updated 2026-07-30 (audit finding L3).** This previously read: _"The Clothworkers multi-form PDF reaching 40–47 seconds is close to the upper limit. Investigate document pre-processing or streaming responses before go-live to ensure consistent performance across all funder types."_ That recommendation named two options, and both have since been settled — one built, one deliberately deferred — so it should no longer be read as outstanding work:

| Option                      | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document pre-processing** | ✅ **Built 2026-06-05.** `lib/preprocess-text.ts` strips PDF extraction artefacts and detectable boilerplate before the Bedrock call in `/api/generate-summary`, with `DISABLE_TEXT_PREPROCESSING=true` as an escape hatch. `GAP-30` closed 2026-06-07. Tracked as `P5.PERF1`, the only completed Phase 5 task. Character ceiling: the code default is **20,000** (`DEFAULT_CHAR_CEILING` in `lib/preprocess-text.ts`), overridden to **50,000** in production via the `PREPROCESS_CHAR_CEILING` environment variable after funder testing — both figures appear in the documentation and both are correct, of different things. |
| **Streaming responses**     | ➖ **Deliberately deferred post-v1** as `FP-10` (`docs/future-phases.md`), per `ADR-AI-010`. Not outstanding pre-launch work and not a gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

**What _is_ still outstanding is the measurement, not the engineering (audit observation O6).** Pre-processing was added specifically to create headroom against these targets, and **no timing run has been done since it landed.** So this section currently asserts a 45-second target on the strength of evidence gathered before the mitigation existed. That is now an explicit `P5.5` step — a measured pass with the actual per-document times recorded, against the production deployment — which will either confirm the targets hold or say plainly that they need revising. Until then, treat the 2026-06-04 figures as a floor on performance rather than a description of it.

**Vercel function region (2026-05-29):** Vercel function region was set to London (eu-west-2 / lhr1) to match AWS Bedrock (eu-west-2). This eliminates the transatlantic round trip that previously occurred with the default iad1 (Virginia) region, reducing AI call latency and lowering timeout risk on large guideline documents.

---

## NFR-02 — Availability

| Metric                  | Target    |
| ----------------------- | --------- |
| Uptime target           | 99.5%     |
| Maximum annual downtime | ~44 hours |

**How this is measured (added 2026-08-05, `P5.0`, register ref R-21).** By a **UptimeRobot monitor polling `/api/health` every 5 minutes**, configured at `P5.4`. `/api/health` was built specifically for this (`ADR-OPS-007`). Until that monitor exists there is **no uptime measurement at all** against the target above — recorded here because a target with no instrument is not a requirement, it is an aspiration.

**Notes:** 99.5% is achievable for a solo developer using managed cloud hosting without requiring complex on-call infrastructure. 99.9% is not considered realistic for a solo build at this stage. Planned maintenance windows should be communicated to users in advance where possible.

---

## NFR-03 — Scalability

| Phase                               | Expected Concurrent Users |
| ----------------------------------- | ------------------------- |
| At launch                           | ~10                       |
| At scale (12–18 months post-launch) | ~100                      |

**Notes:** The architecture should be designed to scale from launch figures to the 12–18 month target without requiring a major rebuild. Managed cloud services (auto-scaling hosting, managed database) are preferred over self-managed infrastructure to keep operational overhead low for a solo developer.

✅ **MEASURED 2026-08-17 — the launch tier is no longer a prediction (`GAP-113`).** Until this date every test this project had run used exactly one user, so the table below was an expectation with nothing behind it. `scripts/load-test.ts` now drives N distinct users, each with their own profile, application and guidelines, through concurrent `POST /api/generate-summary` calls.

| Concurrent users         | Single-user baseline | p50   | p95   | vs baseline | Cross-contamination | Success |
| ------------------------ | -------------------- | ----- | ----- | ----------- | ------------------- | ------- |
| 3                        | 21.3s                | 22.4s | 22.6s | 1.05×       | none                | 3/3     |
| 5                        | 22.8s                | 24.8s | 25.3s | 1.09×       | none                | 5/5     |
| 10                       | 22.6s                | 25.1s | 26.4s | 1.11×       | none                | 10/10   |
| 2 _(re-run 2026-08-20)_  | 22.7s                | 19.7s | 21.8s | 0.87×       | none                | 2/2     |
| 10 _(re-run 2026-08-20)_ | 22.8s                | 22.5s | 23.0s | 0.99×       | none                | 10/10   |

**The launch-tier row below is confirmed as written.** It predicted "All succeed; each takes 20–45s independently; no cross-user interference" — observed at 10 users: every request succeeded, individual durations ran 24.5–26.4s, and **no summary contained another user's canary phrase**. Degradation from 1 to 10 concurrent users is about **11%**, which is close to flat.

✅ **Re-run 2026-08-20 against a fresh build, and the result held — slightly better.** Ten concurrent users came out at **0.99× the single-user baseline** rather than 1.11×, so the near-flat curve is now observed twice, three days apart, on different builds. **No cross-contamination either time.** ⚠️ **The re-run does not lift limit 1 below** — it was again dev-plus-local, so it is a confirmation of the same measurement rather than an extension of it, and **a production run is still owed.** It is recorded because a performance figure observed once is a data point and observed twice is a property; the variance between the two runs (25.1s vs 22.5s at p50) is also useful, since it says the spread between runs is comparable to the spread within one.

**How cross-contamination was checked, since "no interference" is easy to assert and hard to prove:** each user's guideline pack embeds a unique canary string, and every returned summary is searched for every _other_ user's canary. A hit fails the run. This tests the outcome that would actually matter — one charity seeing another's material — rather than testing that the service did not fall over.

⚠️ **Three limits on this evidence, stated so the figures are not over-read:**

1. **Run against `grant-pathway-dev` on a local `next dev` server**, not a production build on Vercel — true of the 2026-08-17 runs and of the 2026-08-20 re-run alike. ⚠️ **A production run turned out to be blocked on credentials, which is worth stating because it is the reason this limit persists:** `.env.local` holds dev credentials, and the harness's production guard checked only the target URL, so aiming it at production would have created its users in dev and failed every sign-in. Fixed 2026-08-20 by requiring `--expect-supabase-project <ref>` to match the credentials actually loaded. ⚠️ **The run itself needs the production keys read from the Supabase dashboard, not from `vercel env pull`** — tried the same day, and Vercel returns the literal string `[SENSITIVE]` for all three Supabase variables, so a pulled file cannot authenticate anything. **What transfers:** Bedrock's behaviour under concurrent load and the cross-contamination result, since both are properties of the AI layer and the request-scoped code, which are identical across environments. **What does not transfer:** Vercel function scaling and cold starts, the production connection pool, and single-region (`lhr1`) execution. A production run is still owed.
2. **The ~100-user tier remains asserted, not demonstrated** (decision: WJ, 2026-08-17 — test 10, extrapolate 100 if asked). The near-flat curve to 10 is encouraging but does not establish 100, and the row below should be read as a design expectation.
3. **p95 at these sample sizes is indicative only.** Ten samples cannot support a meaningful 95th percentile; the figure is reported because the spread is narrow, not because it is statistically robust.

**Concurrent AI generation behaviour (capacity plan — 2026-06-08):**

Each user has their own per-minute rate limit (5 AI calls / 60 seconds via Upstash Redis). There is no global rate limit across users. Expected behaviour at each scale tier:

| Tier                  | Concurrent AI calls                  | Expected outcome                                                                                                                                         |
| --------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| At launch (~10 users) | Up to 10 simultaneous Bedrock calls  | All succeed; each takes 20–45s independently; no cross-user interference                                                                                 |
| At scale (~100 users) | Up to 100 simultaneous Bedrock calls | Bedrock handles this comfortably; transient 429s handled by `withRetry()`; Supabase connection pool (pgbouncer) absorbs the read/write load              |
| Stress scenario       | >100 simultaneous Bedrock calls      | Bedrock may throttle individual users (429); `withRetry()` handles with 1s/3s backoff; Vercel auto-scales function instances; no single point of failure |

**At the ~100-user tier the binding constraint is spend, not concurrency (added 2026-08-05, `P5.0`, register ref R-14).** The plan above describes only the two throughput controls, and states correctly that there is no global rate limit across users. It omitted the two controls that actually bound cost:

| Control                            | Value                                                          | Where enforced                                                                               |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Per-user burst limit               | 5 AI requests / 60 seconds                                     | `lib/rate-limit.ts` (Upstash sliding window)                                                 |
| **Per-user monthly cap**           | **50 AI requests per calendar month**, user warned at 40 (80%) | `MONTHLY_CAP` in `lib/prompts.ts`, reserved via `reserve_ai_slot`, counted in `ai_usage_log` |
| **Account-wide AWS spend ceiling** | **$127/month ≈ £100**, alert-only at $70 and $127              | `grant-pathway-bedrock-cap` AWS Budget (`PDR-AI-005`)                                        |

Against C1's £150/month total, the ≈£100 Bedrock ceiling sits alongside ~£36 of fixed infrastructure (Vercel Pro + Supabase Pro), leaving ~£14 unallocated. The monthly cap is the control `P5.4` explicitly records as "the real control" on spend — it bounds cost per user rather than failing the whole service, which is why an automated IAM hard-stop was assessed and **accepted as a documented deviation rather than built** (WJ, 2026-07-30): a revocation would cut AI off mid-application for every user at once, with no warning. **C1 was raised from £100 to £150/month on 2026-08-05** (WJ's decision; `P5.0` register ref **R-06**) because the £100 total was already breached by committed spend before a single AI call, and had come to be quoted three incompatible ways across the document set — as a total, as total API spend, and as AI spend alone. It is a **total**.

~~The main risk before the first marketing push is unmeasured AI route latency under concurrent load.~~ **Substantially closed 2026-08-17 — measured at 3, 5 and 10 concurrent users, see above (`GAP-113`).** What remains unmeasured is the same test against production rather than dev, and any tier above 10. Structured latency logging added to the AI routes (2026-06-08, GAP-27 partial) will provide baseline data — **two routes today**, `generate-summary` and `refine-answer`. (Corrected 2026-07-30, audit finding **L2**: this read "all three AI routes", which was true when the logging was added but has not been since `/api/generate-draft` was deleted on 2026-07-01.) Sentry performance monitoring to be configured at P5.4 once production traffic baseline is established.

---

## NFR-04 — Security

| Control                           | Requirement                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encryption in transit             | TLS 1.2 or higher (HTTPS everywhere); no unencrypted HTTP connections permitted                                                                                                                                                                                                                                                                                                                      |
| Encryption at rest                | Database-level encryption enabled on all data stores                                                                                                                                                                                                                                                                                                                                                 |
| Passwords                         | Minimum 12 characters; must contain both letters and digits; **leaked-password check enabled (HaveIBeenPwned); secure password change enabled; current password required in order to change password** (hardened 2026-06-29 following pre-launch security review; the three additional controls were always in force but recorded only in the PRD — added here 2026-08-05, `P5.0` register ref R-15) |
| Multi-factor authentication (MFA) | Not offered. Removed 2026-06-12 (FR-07 demoted to Won't Have). Risk analysis confirmed worst-case password compromise is low severity — no payment data, no submission capability, charity profile data is publicly registered.                                                                                                                                                                      |
| Session timeout                   | Automatic logout after 60 minutes of inactivity, preceded by a countdown warning dialog at **55 minutes** ("Are you still there?"). Activity resets the timer **only while that dialog is not open** — fixed 2026-07-28 (`D-013`), because activity toward the dialog's own buttons was dismissing it before it could be clicked (warning dialog added here 2026-08-05, `P5.0` register ref R-16)    |
| Security baseline                 | OWASP Top 10 used as the standard checklist for web application security                                                                                                                                                                                                                                                                                                                             |
| Secrets management                | No credentials, API keys, or secrets committed to the repository, public or private (aligned with C17 — proprietary, closed-source licence)                                                                                                                                                                                                                                                          |

**Notes:** MFA removed 2026-06-12. The OWASP Top 10 provides a practical, well-recognised baseline for a solo developer.

---

## NFR-05 — Browser and Device Support

| Category                 | Supported                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Desktop browsers         | Google Chrome (latest 2 versions)                                                     |
|                          | Microsoft Edge (latest 2 versions)                                                    |
|                          | Mozilla Firefox (latest 2 versions)                                                   |
|                          | Apple Safari (latest 2 versions)                                                      |
| Mobile browsers (phones) | **Not supported in v1** — viewports below 768px meet a blocking banner (`GAP-05`)     |
| Optimised viewport       | **1024px and above** — designed and tested here                                       |
| Functional floor         | **768px to 1023px** — works, not optimised, no banner (iPad portrait, small laptops)  |
| Blocked                  | **Below 768px** — full-screen banner asking the user to switch to a desktop or laptop |
| Internet Explorer        | Not supported (end-of-life June 2022)                                                 |

**Three bands, corrected 2026-08-05 (WJ's decision; `P5.0` register refs R-10 and R-11).** This table previously read "Minimum screen width — **320px** (small mobile) and above", with Chrome Android and Safari iOS listed as supported. That contradicted `ADR-ARCH-005` (1024px minimum) and, more concretely, the `GAP-05` task in `P5.3`, which adds a banner **blocking** the UI below 768px. Both could not be true, and `P5.5`'s cross-browser step was asking a tester to confirm mobile usability that the banner would make impossible.

**The 320px figure came from the Mark One BRD (Section 10.5) and had already been overridden by `ADR-ARCH-005` once.** The retired plan recorded the resolution explicitly — _"ADR takes precedence… mobile is post-v1. No action required"_ — and **that resolution never reached the live document set**, so five live documents went on promising mobile support for months. WJ's 2026-08-05 decision settles it in the direction the ADR always intended, and additionally fills the gap the ADR left unspecified: the **768–1023px band** is functional but not optimised, rather than being blocked, because iPad portrait and older small laptops are common in small charities and blocking them would cost more than a cramped layout does. Phones are blocked, because Step 4's two-column answer-and-guidelines layout genuinely cannot work at that width. Full detail in `ADR-ARCH-005`'s 2026-08-05 amendment.

**Notes:** The application is designed desktop-primary (PDR-UI-003) and **is not a mobile product in v1**. Full mobile support is deferred to a future phase if user feedback supports demand. Chrome and Edge cover the majority of UK charity workers. Safari is required for Mac users on desktop. Internet Explorer 11 is not supported — supporting it would add significant development cost for negligible benefit given its retirement. Note `C16` ("web application only; no native mobile app") remains correct on its own terms — there is no native app — but its implication column was corrected in the same pass, having read "must be responsive and usable on mobile browsers".

---

## NFR-06 — Accessibility Testing Approach

WCAG 2.2 Level AA compliance is a design-in requirement from day one (C15). An independent accessibility audit is deferred to a pre-scaling milestone (DR-LC-003). The following testing approach applies for v1:

| Stage                     | Method                                               | Tool                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| During development        | Automated accessibility scanning on every new screen | axe DevTools browser extension (free) or Lighthouse in Chrome DevTools — **plus `@axe-core/react`, which is currently inert; see the warning below** |
| During development        | Keyboard-only navigation testing                     | Manual — tab through every screen without using a mouse                                                                                              |
| During development        | Screen reader testing                                | NVDA (free) with Chrome on Windows                                                                                                                   |
| Pre-launch                | Manual WCAG 2.2 AA checklist review                  | Work through all Level AA success criteria against each screen — executed by `accessibility-test-plan.md`                                            |
| Pre-launch                | Colour contrast verification                         | WebAIM Contrast Checker (free, online tool) — executed by `accessibility-test-plan.md`                                                               |
| Pre/post-launch           | Assistive technology expert review                   | Engaged via trusted contact — professional AT expertise (see note below)                                                                             |
| Post-launch / pre-scaling | Independent accessibility audit                      | Deferred — triggered when the user base justifies formal audit investment                                                                            |

**How this approach is executed (added 2026-08-05, `P5.0`, register ref R-19).** The four pre-launch rows above are discharged by **`docs/Test Plans/accessibility-test-plan.md`** (created 2026-08-03, 15 cases AC-01–15), the seventh test layer under `DR-TEST-001` and `P5.3`'s definition of done. Before that plan existed this table specified methods with nothing to execute them, which is how `ADR-OPS-006`'s mandated pre-release keyboard / focus / screen-reader / contrast pass went unrun for the product flow — the only accessibility case anywhere was `help-and-tooltips-test-plan.md` HT-05, scoped to tooltips.

> **⚠️ The "during development" automated-scanning row does not currently work (added 2026-08-05, `P5.0`, register ref R-17).**
>
> `@axe-core/react` is installed and wired into `app/layout.tsx` (`components/axe-provider.tsx`), and `ADR-TRACEABILITY.md` marks `GAP-14` **✅ resolved** on that basis. But its `catch` for a known `@axe-core/react` v4 / React 19 incompatibility is **silent**, so the component mounts, fails, and reports nothing. Confirmed 2026-08-04: a route carrying **two real AA violations produced an empty console**.
>
> The practical consequence is that automated scanning has not actually run on any screen built since the project moved to React 19 — the browser-extension and Lighthouse routes above still work, but they are manual and were not what "on every new screen" relied on. A fix (log the failure loudly, plus a route-change fallback that runs axe explicitly) is scheduled for **2026-08-05**, immediately after `accessibility-test-plan.md` AC-01 is executed, so the tooling is not changed mid-test.
>
> This also bears on **`GAP-15`**, the accepted deviation that waived Lighthouse CI automation for v1: part of what made that waiver reasonable was automated in-development scanning catching regressions. That half of the justification has not held since React 19. The deviation may still be the right call — but it currently rests on a premise that is false, and that is a decision for WJ rather than a documentation fix.

**Notes:** Accessibility is not a retrofit — it must be considered at the design and build stage of every screen. The combination of automated scanning, keyboard testing, and screen reader testing provides a practical and cost-effective approach for a solo developer. The deferred independent audit provides a formal assurance milestone before the app scales significantly.

**Screen reader / AT testing (updated 2026-06-07; narrowed 2026-07-30, recorded here 2026-08-05 — `P5.0`, register ref R-18).** Formal NVDA/VoiceOver **sign-off** is deferred to a trusted contact with professional assistive technology expertise, who will review the live service at an appropriate point. That provides more reliable real-world coverage than a developer-led test, and is a stronger signal of genuine WCAG compliance.

**The deferral applies to formal sign-off only — not to whether any screen-reader testing happens at all.** This was narrowed by WJ on 2026-07-30, because as originally worded it had come to mean no screen-reader coverage whatsoever pending an engagement. NVDA is free and runs on the development machine (Windows 11) and VoiceOver is on WJ's iPhone, so basic coverage does not wait: it is `accessibility-test-plan.md` **AC-08**, which is why that plan carries an NVDA setup-and-operation section — operating NVDA, not the testing itself, is what blocked the pass on 2026-07-25 and again on 2026-07-30. **If a screen reader cannot be run locally, that raises the value of the expert engagement rather than lowering it** — record the outcome either way in the test plan.

---

## Checklist Coverage

| Checklist Item | Description                                          | Status            |
| -------------- | ---------------------------------------------------- | ----------------- |
| Item 30        | Performance — acceptable AI response time            | Covered by NFR-01 |
| Item 31        | Availability — uptime target                         | Covered by NFR-02 |
| Item 32        | Scalability — concurrent users at launch vs at scale | Covered by NFR-03 |
| Item 33        | Security — encryption, MFA, session management       | Covered by NFR-04 |
| Item 34        | Browser and device support                           | Covered by NFR-05 |
| Item 35        | Accessibility testing approach                       | Covered by NFR-06 |

---

## Revision History

**This table did not exist until 2026-08-05.** Its absence is why `P5.0` singled this document out as the one genuinely unreviewed requirement document — there was no place to record that a review had happened, so no review could be shown to have happened, and the footer date drifted five weeks behind the content. Record every future change here.

| Version | Date        | Author         | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | ≤2026-06-30 | Rapidglobe Ltd | Original document and all changes up to the previously-recorded footer date of 2026-06-30, reconstructed as a single baseline — no per-change record was kept.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 1.1     | 2026-07-30  | Rapidglobe Ltd | Two Opus audit findings, applied at the time but never recorded here (found by `P5.0`, register ref R-20 — the footer still read 2026-06-30 afterwards). **L2:** NFR-03's structured-latency-logging note corrected from "all three AI routes" to two, `generate-summary` and `refine-answer`, `/api/generate-draft` having been deleted 2026-07-01. **L3:** NFR-01's "investigate document pre-processing or streaming before go-live" recommendation resolved — pre-processing built 2026-06-05 (`P5.PERF1`), streaming deliberately deferred as `FP-10` — and the 2026-06-04 figures flagged as a pre-mitigation baseline, with the outstanding work identified as the **measurement** (audit observation **O6**), now a `P5.5` step.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 1.2     | 2026-08-05  | Rapidglobe Ltd | **Full `P5.0` reconciliation pass against live code — the first review this document has had.** Register: `docs/Implementation Plan/pre-launch-reconciliation-2026-08-05.md`. **NFR-01:** charity-objects paraphrase target added (R-12, the third AI operation, previously absent); refine target vs `GAP-03`'s 50s alert threshold recorded as an open 3.3× gap (R-13). **NFR-03:** per-user 50/month cap and the AWS spend ceiling added — at ~100 users the binding constraint is spend, not concurrency (R-14). **NFR-04:** password row completed with the leaked-password check, secure password change and current-password requirement (R-15); session-timeout row completed with the 55-minute warning dialog and `D-013` (R-16). **NFR-05:** ⚠️ **open conflict flagged, deliberately not resolved** — 320px/mobile-usable contradicts `ADR-ARCH-005` and the `GAP-05` blocking banner, and the 768–1023px band is unspecified (R-10, R-11, awaiting WJ). **NFR-06:** `@axe-core/react` recorded as **inert since React 19**, with the `GAP-15` consequence (R-17); screen-reader deferral narrowed to formal sign-off only, per WJ 2026-07-30 (R-18); `accessibility-test-plan.md` named as the artefact that executes the pre-launch rows (R-19). **This history table created** (R-20). **NFR-02:** measurement mechanism cross-referenced (R-21). Verified accurate and unchanged: NFR-03's 5-per-60s Upstash burst limit (`lib/rate-limit.ts`), NFR-04's remaining rows, NFR-05's browser matrix, the Checklist Coverage table. |

---

_Last updated: 2026-08-05 (`P5.0` reconciliation — see Revision History above)_
_Sources: BRD Information Gathering Checklist items 30–35; constraints-and-assumptions.md (C15, C16, C17); DR-LC-003; PDR-UI-003 (desktop-primary decision)_
