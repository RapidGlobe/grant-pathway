# Grant Pathway — Session Plan: 2026-07-02

**Purpose:** Prioritised task list for tomorrow's testing session, prepared 2026-07-01 following the dev/prod schema-gap fix, test dashboard reset, and testing-process hardening completed today. See `docs/Implementation Plan/CHANGELOG.md` (2026-07-01 entries) for full background on everything referenced below.

---

## Priority 1 — Legal document accuracy (found while preparing this list, not yet fixed)

`docs/legal/terms-of-service.md` and `docs/legal/privacy-policy.md` — the actual files the live `/terms` and `/privacy` pages read at request time — both describe AI as generating draft answers from scratch. This is the same stale "AI generates" claim found and corrected in `business-overview.md` yesterday, abandoned as the product model on 2026-05-28, but it was never caught in the legal docs. Specific lines to review:

- `terms-of-service.md` line 68: _"Grant Pathway uses artificial intelligence to summarise funder guidelines and generate draft answers to application questions."_
- `terms-of-service.md` line 76: _"Grant Pathway generates a draft. You decide whether to use it, edit it, or discard it entirely."_
- `terms-of-service.md` line 137: _"Errors, inaccuracies, or omissions in AI-generated content"_ (disclaimer clause)
- `privacy-policy.md` lines 39, 40, 56, 86, 93: multiple references to "draft answers" being generated and "AI-generated content"

**Tasks:**

- [ ] Check whether the uncommitted local change to `docs/legal/grant-pathway-terms-of-service-v1.0.docx` (sitting in the working directory since before 2026-07-01) already addresses this — review it before making further edits
- [ ] Decide on accurate replacement language with WJ (this is a legal document — needs deliberate wording, not a mechanical find-replace)
- [ ] Update `terms-of-service.md` and `privacy-policy.md` to describe the actual model: charity writes every answer, AI refines/improves on request only
- [ ] Verify the live `/terms` and `/privacy` pages render the corrected text
- [ ] Note: solicitor review and effective dates are already recorded as outstanding for P5.1 — this correction should happen before that review, not after

---

## Priority 2 — Finish yesterday's automation

- [ ] Add `SUPABASE_DEV_DB_URL` and `SUPABASE_PROD_DB_URL` secrets in GitHub (Settings → Secrets and variables → Actions) — see connection string instructions in yesterday's chat / `.github/workflows/schema-drift-check.yml` header comment
- [ ] Manually trigger the **Schema Drift Check** workflow once (Actions tab → Run workflow) to confirm it passes cleanly against both environments now that the schema gap is fixed

---

## Priority 3 — Fix the `is_active` data bug

Four funders documented as closed/parked since 2026-06-04 are still `is_active = true` in the database, meaning they're currently selectable in the live funder picker. SQL is in `TEST-DASHBOARD.md`'s Known Issues section.

- [ ] Run the `is_active = false` update on `grant-pathway-dev`
- [ ] Confirm via the funder picker (search "Foyle", "Nationwide", "Motability", "City Bridge" — none should appear)
- [ ] Repeat on `grant-pathway-prod` when it goes live (not urgent today since nothing points to it yet)
- [ ] Update `TEST-DASHBOARD.md` Known Issues section to mark this resolved

---

## Priority 4 — Run the regression test plan (RT-00 through RT-11)

`docs/Test Plans/regression-test-plan.md` v1.1 — this has **never been executed**, and it's the highest-leverage test to run before touching any funder-specific plan, since it validates the shared plumbing every funder depends on.

- [ ] RT-00 (environment/schema check) — should now pass cleanly against dev
- [ ] RT-01–05 (Tier 1 smoke, ~10 min)
- [ ] RT-06–11 (Tier 2 full regression, ~25 min) — this includes RT-09 (approve) and RT-11 (reopen), the two flows broken until yesterday's fix
- [ ] Record results and any defects in the plan's Results Summary and Defect Log

---

## Priority 5 — Re-verify funders (prioritised subset, not all 15 from scratch)

All 7 previously-🟢 funders are downgraded to 🔁 in `TEST-DASHBOARD.md` v2.0 — their last passing results predate the schema fix. Don't blindly re-run all of them; re-verify the two structurally distinct ones fully, then spot-check the rest.

- [ ] **Henry Smith Foundation** — full re-run (10 cases). Also covers the IT-11 escape-hatch/reapplication flow, which touches the same Step 4 assembly path affected by the missing `assembled_draft` column.
- [ ] **Garfield Weston Foundation** — full re-run (13 cases). This is the only funder covering the narrative/free-form path — highest priority if time is short.
- [ ] If both pass cleanly: spot-check (Steps 1–3 only, not full re-run) the remaining 5 — A B Charitable Trust, Clothworkers' Foundation, Wolfson Foundation, Lloyds Bank Foundation, Walton Charity
- [ ] Update `TEST-DASHBOARD.md` RAG status for each as it's confirmed (🔁 → 🟢, or 🔴 if something's actually broken)

---

## Priority 6 — Lower priority, time permitting

These 🟡 funders have never been executed at all (not a regression risk, just never done):

- [ ] MK Community Foundation — Oak Grants (test plan ready, 13 cases; Oak's pass would also cover Seed/Sapling via risk-based assumption)
- [ ] Baily Thomas — General Programme (test plan ready, 13 cases; covers Small Grants via risk-based assumption)
- [ ] CPF Trust (test plan ready, 10 cases)
- [ ] Idlewild Trust IT-11 (escape hatch) — still deferred, needs a funder Harry's Rainbow genuinely qualifies for

---

## Not urgent, but noted

- `app/api/generate-draft` and `advanceToStep5` orphaned-code cleanup, technical-design.md/diagram corrections — all completed 2026-07-01, no action needed
- `target-funder-list.md` retirement — completed 2026-07-01
