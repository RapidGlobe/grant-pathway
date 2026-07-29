# Grant Pathway — Deployment Checklist

**Version:** 1.3
**Last updated:** 29 July 2026

**Changes in 1.3 (Opus audit M3):** `AI_ENABLED` documented in the feature-flag table — it is the master kill-switch and was previously absent from the one place an operator would look during an incident. The "feature flag convention," which mandated a per-change flag and was not being followed, is replaced by a **recovery-path convention** requiring a named way to back the change out. New pre-deploy item: a **prompt-change regression check** on any `lib/prompts.ts` change, since the real failure mode has been undetected extraction regressions rather than un-revertable changes. The stale "any affected funder test plan" item was also corrected — `DR-TEST-001` retired per-funder plans.

**Changes in 1.2 (Opus audit M2):** the pre-deploy CI item now names the three real gating jobs instead of three invented labels, and the "Standard deploy" step no longer claims deploys wait for CI — they never have. Whether to make that gate real is an open decision.

This checklist must be completed before deploying any change that touches an API route, database migration, authentication flow, AI prompt, or environment variable. For minor documentation-only changes it may be skipped.

---

## Before you deploy

### Code quality gates

- [ ] GitHub Actions `ci.yml` is passing — all three gating jobs green: `lint-and-typecheck` (type-check, lint, format:check), `test` (Vitest), `validate-migrations`. **This must be checked manually** — see the note under "Standard deploy" below.
- [ ] Vercel preview deployment has been reviewed and behaves as expected
- [ ] **If `lib/prompts.ts` changed — prompt-change regression check.** Re-run one known guideline document end to end and confirm the extracted question count is **unchanged** (or changed only in the way the fix intended). Record the before and after counts in the changelog entry. Use a document whose correct count is already established — the MK Community Foundation Oak Grants PDF and the AB Charitable Trust guidelines are both documented in their flagship test plans. **This is the control that catches silent extraction regressions**, which are the most common defect class in this codebase and are invisible to CI, type-checking and the unit test suite
- [ ] The relevant layer of the test suite has been re-run — see `TEST-DASHBOARD.md` for the current structure (`DR-TEST-001` retired the per-funder plans in favour of capability layers)
- [ ] No `console.error` or unhandled promise rejections visible in Vercel function logs during preview testing

### Database migrations

- [ ] Migration applied to the **dev** Supabase project and verified before applying to production
- [ ] Migration is non-destructive (additive columns, new tables, or nullable changes only) — if destructive, a rollback migration has been written and tested
- [ ] RLS policies on any new table have been reviewed

### Environment variables

- [ ] Any new environment variable is added to `.env.example` with a description
- [ ] Variable is set in Vercel production environment (not just dev/preview)
- [ ] Variable is documented in the relevant ADR or AGENTS.md if it controls behaviour

### Risk assessment

- [ ] Identify the single most likely failure mode for this change (e.g. "AI route returns 500 if new prompt field is missing")
- [ ] Confirm there is a recovery path that does not require a code deploy (feature flag, env var toggle, or Vercel instant rollback)

---

## Deploying

### Standard deploy (push to master)

1. Merge to `master` — GitHub Actions CI runs automatically
2. Vercel builds and deploys to production automatically. **Note: this is not gated on CI.** Vercel deploys on push regardless of whether `ci.yml` passes or fails — the two run independently and in parallel. This document previously stated "on CI pass, Vercel builds and deploys," which was never true in practice (corrected 2026-07-29, Opus audit **M2**). **So CI must be checked manually before and after deploying** — a red run does not stop the code reaching production. Whether to make the gate real (via Vercel's Ignored Build Step) is an open decision.
3. Monitor Vercel function logs for the first 5 minutes after deploy
4. Check Sentry for any new errors in the first 10 minutes

### If a database migration is required

1. Apply migration to dev Supabase project via Supabase dashboard SQL editor
2. Verify in dev that the application behaves correctly
3. Apply migration to **production** Supabase project (`mvmjryipieepvsjudche`) via the dashboard
4. Deploy the code change immediately after — do not leave production in a state where code and schema are out of sync for more than a few minutes

---

## If something goes wrong

### Vercel instant rollback

Vercel keeps a full deployment history. To roll back to the last known good deployment:

1. Open the [Vercel dashboard](https://vercel.com) → Grant Pathway project → Deployments
2. Find the last successful deployment before the problem
3. Click the three-dot menu → **Promote to Production**
4. The previous build is live within ~30 seconds — no rebuild required

This is the fastest recovery path for any code-level issue. Use it first.

### Feature flags

The following environment variables act as feature flags and can be toggled in Vercel without a code deploy (changes take effect on the next request after Vercel propagates the variable):

| Variable                          | Effect when set                                                                                                                                                                                                                                                                                        | When to use                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **`AI_ENABLED=false`**            | **Master kill-switch — turns off every AI call in the service.** `/api/generate-summary` and `/api/refine-answer` return `503` and the user sees the "AI service busy" message; the charity-objects paraphrase in `actions/charity.ts` silently skips instead of failing, so profile setup still works | **A runaway-cost incident, a Bedrock outage, or any AI behaviour bad enough that no AI is better than wrong AI** |
| `DISABLE_TEXT_PREPROCESSING=true` | Bypasses the document pre-processing step in `/api/generate-summary`                                                                                                                                                                                                                                   | If a Prettier or preprocessing regression degrades AI summary quality                                            |
| `PREPROCESS_CHAR_CEILING=<n>`     | Overrides the character ceiling for document pre-processing (default 50,000)                                                                                                                                                                                                                           | If very large funder documents are being truncated or timing out                                                 |

**`AI_ENABLED` must be exactly the string `false` to disable AI.** Any other value — including unset, `0`, `no`, or `FALSE` — leaves AI enabled. It is checked in three places: both AI route handlers and the charity paraphrase. This is the first thing to reach for in an AI incident, so it is listed first deliberately.

#### Recovery-path convention

**Every change to AI prompt logic, funder eligibility rules, or export behaviour must have a named recovery path recorded before it ships.** State in the commit or the changelog entry how the change would be backed out. Any of the following counts:

- **Vercel instant rollback** — redeploy the previous deployment. The default, and sufficient for most changes
- **`AI_ENABLED=false`** — for anything where degraded AI output is worse than no AI output
- **A dedicated environment-variable flag** — for a change that needs to be switched off _without_ also reverting everything else deployed alongside it, or where the risk is confined to one code path (as with the two preprocessing flags above)

**This replaced an earlier rule (2026-07-29, Opus audit M3)** which required every change in those categories to be wrapped in its own environment-variable flag before shipping. That rule was not being followed: only the two preprocessing flags ever existed, while at least four `lib/prompts.ts` changes shipped without one — the Step 3 determinism fix, the table-format budget-question rule, the `[ITEM N]` fallback citation marker, and governance-fact detection.

It was replaced rather than reinstated because it guarded the wrong risk. Every one of those four changes was itself a **fix** for a defect found during live testing. The problem in each case was not that a bad change could not be undone — Vercel rollback handles that in about a minute — but that the defect was not detected until a human tested manually. A per-change feature flag would not have helped with that at all, which is precisely why the rule was ignored. A mandatory rule that is routinely broken is worse than an honest one: it teaches everyone that the checklist is optional.

The detection gap is addressed by the prompt-change regression check in the pre-deploy list above, which is the control that would actually have caught the 12→10 question regression.

### Database rollback

If a migration causes data issues, apply the rollback migration (must have been written before deploy — see pre-deploy checklist above). There is no automated DB rollback. Supabase Pro daily backups provide a 7-day recovery window for catastrophic data loss (see ADR-DATA-005), but restoring from backup affects all users and should be a last resort.

### Escalation

If an issue cannot be resolved within 15 minutes via rollback or feature flag:

1. Take Vercel offline temporarily if necessary (Settings → Domains → remove domain) to prevent users hitting a broken state
2. Investigate root cause in Vercel function logs and Sentry
3. Fix, test on preview deployment, then re-deploy

---

## Post-deploy verification

- [ ] Open the production app and complete at least one action that exercises the changed code path
- [ ] Confirm Sentry shows no new errors 10 minutes after deploy
- [ ] Confirm UptimeRobot status is green
- [ ] Update `IMPLEMENTATION-STATUS.md` and `CHANGELOG.md` if the deploy completes a planned task or resolves a known defect

---

_Maintained by: RapidGlobe Ltd_
