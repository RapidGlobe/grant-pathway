# Grant Pathway — Deployment Checklist

**Version:** 1.2
**Last updated:** 29 July 2026

**Changes in 1.2 (Opus audit M2):** the pre-deploy CI item now names the three real gating jobs instead of three invented labels, and the "Standard deploy" step no longer claims deploys wait for CI — they never have. Whether to make that gate real is an open decision.

This checklist must be completed before deploying any change that touches an API route, database migration, authentication flow, AI prompt, or environment variable. For minor documentation-only changes it may be skipped.

---

## Before you deploy

### Code quality gates

- [ ] GitHub Actions `ci.yml` is passing — all three gating jobs green: `lint-and-typecheck` (type-check, lint, format:check), `test` (Vitest), `validate-migrations`. **This must be checked manually** — see the note under "Standard deploy" below.
- [ ] Vercel preview deployment has been reviewed and behaves as expected
- [ ] Any affected funder test plan has been re-run if AI prompt logic changed
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

| Variable                          | Effect when set                                                              | When to use                                                           |
| --------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `DISABLE_TEXT_PREPROCESSING=true` | Bypasses the document pre-processing step in `/api/generate-summary`         | If a Prettier or preprocessing regression degrades AI summary quality |
| `PREPROCESS_CHAR_CEILING=<n>`     | Overrides the character ceiling for document pre-processing (default 50,000) | If very large funder documents are being truncated or timing out      |

#### Feature flag convention

Any change in the following categories **must be wrapped in an environment variable flag before it ships**, so it can be disabled without a code rollback if problems appear in production:

- **AI prompt logic** — changes to `lib/prompts.ts` (summary prompt, refine prompt, draft prompt)
- **Funder eligibility rules** — changes to eligibility detection logic or funder-specific overrides
- **Export behaviour** — changes to the Word document generation pipeline

The pattern is a single `process.env` check at the entry point of the affected code path. Add the flag to `.env.example` with a description, set it in Vercel's environment variables, and document it in the table above. Do not ship a significant change in these categories without a flag — the Vercel instant rollback takes ~30 seconds but requires identifying the bad deployment first; a flag toggle is faster and more precise.

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
