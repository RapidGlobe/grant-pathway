# Eligibility Check — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** Any change to the eligibility-mismatch prompt, the Step 3 mismatch UI, or `DR-EL-001`'s behaviour

**Version:** 1.4
**Date:** 2026-08-14
**Status:** All three cases now executed and clean — no caveats remain. EL-01 Pass; EL-02 re-run deliberately (not as a byproduct) against a fresh throwaway account, all six steps confirmed including the dashboard badge, never independently checked before; EL-03 Pass — no mismatch warning, correctly defaulting to `false` on a partial/adjacent fit, as `DR-EL-001` requires.
**Tester:** WJ

> ⚠️ **Running this against production? Read [`RUNNING-AGAINST-PRODUCTION.md`](RUNNING-AGAINST-PRODUCTION.md) first.** This plan was written against `grant-pathway-dev` and any account it names below is a **dev** account. Production uses one shared account, its own URL, and a different result-recording convention — all held in that document, which **wins** wherever this plan disagrees with it.

---

## Purpose

This plan validates `DR-EL-001` (the eligibility-mismatch hard stop) **once**, with three varied cases, instead of manufacturing a mismatch inside every funder test plan. Per `DR-TEST-001`, repeating this per funder created a structural conflict: a genuine mismatch is a hard stop with no path to Step 4, which contradicts the same plan's later requirement to reach export in one continuous run.

Three cases, not one, because a single pass/fail only proves the **mechanism** works (red card, acknowledge button, hard stop, dashboard badge). It says nothing about whether the AI's eligibility **judgement** is well-calibrated — that is a model-quality question, and one data point is thin evidence for it (WJ, 2026-07-24). The three cases below test three different things:

| Case  | Tests                                                                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EL-01 | The mechanism doesn't false-positive on a genuine match                                                                                                           |
| EL-02 | The mechanism correctly hard-stops on a clear, unambiguous mismatch                                                                                               |
| EL-03 | The judgement doesn't over-trigger on a partial, adjacent-but-not-excluded fit — `DR-EL-001`'s own instruction is that borderline cases should default to `false` |

---

## Prior corroborating evidence (not re-run here)

The hard-stop mechanism itself has already been verified working correctly multiple times, against different funders, before this plan existed:

| Case                                                                                | Funder                               | Pairing                                                          | Result              | Where                                                         |
| ----------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| IT-04 (the origin case for `DR-EL-001`)                                             | Idlewild Trust — Arts programme      | Harry's Rainbow (children's bereavement) — arts-only funder      | ✅ Pass, 2026-06-02 | `docs/Test Plans/archive/Idlewildtrust-test-plan.md`          |
| IT-LBF-03                                                                           | Lloyds Bank Foundation E&W           | Harry's Rainbow — complex social exclusion focus                 | ✅ Pass             | `docs/Test Plans/archive/Lloyds-Bank-Foundation-test-plan.md` |
| IT-MKCF-03 (formerly in the MK Community Foundation flagship, moved out 2026-07-24) | MK Community Foundation — Oak Grants | Elmbridge Families Together (Surrey) — Milton-Keynes-only funder | ✅ Pass, 2026-07-04 | `MK-Community-Foundation-test-plan.md` v1.5 (git history)     |

These three, plus EL-01/EL-02/EL-03 below, mean the hard-stop mechanism has now been exercised against four different funders and mismatch reasons (arts remit, social-exclusion theme, geography, human-rights theme) without a single false negative — reasonable confidence the mechanism itself is robust. What has **not** yet been verified: the escape hatch (correcting the charity profile and successfully reapplying). Idlewild's own IT-11 attempted this and found Harry's Rainbow genuinely cannot be made eligible for Idlewild Arts regardless of profile wording — deferred, never completed with a pairing that actually can be fixed. **Open follow-on, not actioned in this version:** run the escape hatch to completion with a charity/funder pairing where a profile correction plausibly should flip the outcome.

---

## Test Data

| Item                  | EL-01 (positive)                                | EL-02 (clear negative)                                                                  | EL-03 (borderline)                                                                                             |
| --------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Test account          | grantpathway+mkcf1@gmail.com (reused, existing) | grantpathway+ABC@gmail.com (reused, existing)                                           | New account — grantpathway+eltest1@gmail.com                                                                   |
| Charity               | MK Minds Matter                                 | Harry's Rainbow                                                                         | Harry's Rainbow (fresh profile, worded as originally, not the AB flagship's adjusted version)                  |
| Charity focus         | Adult mental health support, Milton Keynes      | Children's bereavement support, Milton Keynes                                           | Children's bereavement support, therapeutic groups, Milton Keynes                                              |
| Funder                | MK Community Foundation — Oak Grants            | A B Charitable Trust                                                                    | Wolfson Foundation — Health & Disability programme                                                             |
| Funder's stated focus | Milton Keynes residents, any charitable cause   | Access to Justice, Human Rights, Migrants and Refugees, Justice System and Penal Reform | Health and disability — no explicit child/bereavement exclusion, but not the programme's headline focus either |
| Expected outcome      | Pass — no mismatch                              | Mismatch — hard stop                                                                    | Pass — no mismatch (calibration should default to false on a partial fit)                                      |

---

## Test Results Summary

| Test ID | Test Name                                               | Result | Notes                                                                                                                              |
| ------- | ------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| EL-01   | Positive match — no false mismatch on a genuine fit     | Pass   | Live-tested 2026-07-28, no eligibility issues to report                                                                            |
| EL-02   | Clear negative — hard stop on an unambiguous mismatch   | Pass   | Re-run deliberately 2026-08-14 against a fresh account — all six steps confirmed, including the dashboard badge for the first time |
| EL-03   | Borderline — no over-trigger on a partial, adjacent fit | Pass   | Live-tested 2026-07-28, Harry's Rainbow vs Wolfson Foundation — no mismatch warning, as expected                                   |

---

## Test Cases

---

### EL-01 — Positive Match: No False Mismatch on a Genuine Fit

**Prerequisite:** An application exists (or is created) pairing MK Minds Matter against MK Community Foundation — Oak Grants. If run as part of the same session as the MK Community Foundation flagship plan, this can be satisfied by that plan's own MKCF-04 result rather than a separate run.

**Steps:**

1. With the MK Minds Matter charity profile and MK Community Foundation — Oak Grants guidelines uploaded, generate the Step 3 AI summary
2. Confirm no red eligibility-mismatch card appears
3. Confirm the **Continue** button (not an acknowledge-only button) is available

**Expected result:**

- No mismatch triggered for a charity that is a genuine, unambiguous fit for the funder's stated criteria (same Milton Keynes geography, broad remit)

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Live-tested 2026-07-28, no eligibility issues to report.

---

### EL-02 — Clear Negative: Hard Stop on an Unambiguous Mismatch

**Prerequisite:** Sign in to `grantpathway+ABC@gmail.com`. Start a new application: funder "A B Charitable Trust", any grant name (e.g. "Eligibility Check Test").

**Background:** AB Charitable Trust funds Access to Justice, Human Rights, Migrants and Refugees, and The Justice System and Penal Reform. Harry's Rainbow provides children's bereavement support — no stated overlap with any of AB's four categories. This should read as a clear, unambiguous mismatch under `DR-EL-001`'s "clear, unambiguous mismatches only" instruction.

**Steps:**

1. Upload the A B Charitable Trust guidelines PDF at Step 2
2. On Step 3, observe whether a red eligibility-mismatch warning card appears
3. If it appears, confirm it cites AB's actual focus areas (not a generic or vague reason)
4. Confirm the **Continue** button is replaced by an **"I understand — return to my dashboard"** acknowledge button
5. Click acknowledge
6. On the dashboard, confirm the application shows a red **"Ineligible"** status badge and cannot be resumed

**If no mismatch appears (unexpected):**

- Record as a defect — this is the clearest mismatch case in this plan; the AI failing to flag it would suggest a real calibration problem, not just a borderline judgement call
- Do not proceed further with this application

**Expected result:**

- Red mismatch warning displayed, citing AB's actual focus areas
- Continue button hidden; only the acknowledge button available
- Application status set to `mismatch`; dashboard shows the red "Ineligible" badge; no path to Step 4

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (2026-08-14 — deliberate re-run, closing the fixture/step-6 gap below):** Run solo against a fresh throwaway account (created and deleted via the Supabase admin API, local dev server) rather than reusing or restoring the overwritten fixture — a clean, reproducible result was more useful than reconstructing the old one. Harry's Rainbow profile entered per this plan's own Test Data (children's bereavement support and counselling, Milton Keynes); A B Charitable Trust's actual guidelines pasted at Step 2 (funding categories, financial-information questions, and the Trust's real address/charity number, extracted from the source PDF). All six steps confirmed directly, including the one never independently checked before:

1. Red mismatch card appeared on Step 3
2. Citation is accurate, not generic — the card named all four of AB's real focus areas (Access to Justice, Human Rights, Migrants and Refugees, Justice System and Penal Reform) and described Harry's Rainbow's actual bereavement-support work correctly
3. (as above)
4. Continue was replaced by "I understand — return to my dashboard"; no other path forward existed
5. Acknowledge clicked
6. **Dashboard confirmed showing a genuinely red "Ineligible" badge** (`getComputedStyle` read back `color: rgb(185, 28, 28)` on `background-color: rgb(254, 242, 242)` — not just text styled to look passing), the "1 ineligible" tally incremented, and the application card offered only a **Delete** action — no link or button to resume it. This closes the one step this case had never actually verified since it was first logged in 2026-07-27.

**Historical note, superseded by the above:** the original 2026-07-27 byproduct result (via `grantpathway+ABC@gmail.com`'s Harry's Rainbow profile, before it was overwritten the same day starting the AB Charitable Trust flagship's v2.1 re-run) confirmed steps 1–5 but never independently checked step 6, and that account can no longer reproduce the result. Superseded rather than deleted from the record — the byproduct result was genuine evidence at the time, just incomplete on step 6 and no longer reproducible.

---

### EL-03 — Borderline: No Over-Trigger on a Partial, Adjacent Fit

**Prerequisite:** Register a new account (`grantpathway+eltest1@gmail.com`) and set up a Harry's Rainbow charity profile (children's bereavement support, therapeutic groups for children 0–25, Milton Keynes). Start a new application: funder "Wolfson Foundation", grant name "Health and Disability — Eligibility Check".

**Background:** Wolfson's Health & Disability programme doesn't exclude child-focused or mental-health-adjacent work, but bereavement support isn't its headline focus either — a partial, adjacent fit rather than a clean match or a clean exclusion. `DR-EL-001` instructs the AI to flag `eligibilityMismatch: true` only for clear, unambiguous mismatches, and to default borderline cases to `false`. This case tests that restraint directly — the risk being tested is a false positive (over-flagging a charity that could plausibly still apply), not a false negative.

**Steps:**

1. Upload the Wolfson Foundation Health & Disability guidelines document at Step 2
2. On Step 3, observe whether a red eligibility-mismatch warning card appears
3. If a warning does appear, read the stated reason and assess whether it identifies a genuine, unambiguous exclusion or is over-reaching on a thematic near-miss

**Expected result:**

- No mismatch warning — the AI should default to `false` on this partial fit and allow the user to continue and make their own eligibility judgement
- If a mismatch **does** appear, this is not automatically a defect — record the exact reason given and assess whether Wolfson's guidelines contain a genuine exclusion this test's Background didn't anticipate, versus the AI over-triggering on a surface-level theme mismatch. Either finding is useful: it either corrects this test's assumption or surfaces a real calibration issue worth its own defect.

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Live-tested 2026-07-28 with Harry's Rainbow (children's bereavement support, Milton Keynes) against Wolfson Foundation's Health & Disability guidelines. No eligibility-mismatch warning appeared. Initially logged as a possible failure since no warning showed, but this is the case's actual expected result (see Expected result above) — the AI correctly defaulted to `false` on a partial/adjacent fit rather than over-triggering, exactly as `DR-EL-001` requires for borderline cases. Not a defect; test passes.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.4     | 2026-08-14 | Rapidglobe Ltd | **EL-02 re-run deliberately, closing the last open item in this plan.** Run solo against a fresh throwaway account (Harry's Rainbow vs A B Charitable Trust, per this plan's own Test Data) rather than the overwritten fixture. All six steps confirmed, including step 6 (dashboard "Ineligible" badge, genuinely red by computed style, application not resumable) — the one step never independently checked since this case was first logged in 2026-07-27. EL-02 moves from Pass (caveat) to a clean Pass; this plan's Status line no longer carries any caveat. |
| 1.3     | 2026-07-28 | Rapidglobe Ltd | EL-01 and EL-03 both live-tested and passed. EL-01: MK Minds Matter vs MK Community Foundation, no eligibility issues. EL-03: Harry's Rainbow vs Wolfson Foundation Health & Disability — no mismatch warning appeared, which is the case's expected (passing) result, not a failure — the AI correctly defaulted to `false` on a partial/adjacent fit per `DR-EL-001`.                                                                                                                                                                                                |
| 1.2     | 2026-07-27 | Rapidglobe Ltd | `grantpathway+ABC@gmail.com`'s charity profile was reset to Asylum Justice while starting the AB Charitable Trust flagship's v2.1 re-run, before the mix-up was caught and that run correctly moved to a new account. The EL-02 pass recorded below (v1.1) still stands as historical evidence, but this account no longer holds the Harry's Rainbow profile it depended on and can't reproduce the result — flagged in EL-02's Notes and the header Status line.                                                                                                      |
| 1.1     | 2026-07-27 | Rapidglobe Ltd | EL-02 logged as completed (caveat): occurred as a byproduct of AB Charitable Trust flagship testing (its Harry's Rainbow charity, before that plan's charity swap to Asylum Justice the same day) rather than a deliberate run of this test case. Steps 1–5 confirmed; step 6 (dashboard "Ineligible" badge) not independently checked. `grantpathway+ABC@gmail.com` is now a dedicated fixture for this case, no longer incidentally shared with the flagship plan (which moved to a new account).                                                                    |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, replacing the per-funder manufactured-mismatch pattern. EL-01 reuses the MK Community Foundation flagship's positive result; EL-02 and EL-03 are new, not yet executed. Prior corroborating hard-stop passes (Idlewild IT-04, Lloyds IT-LBF-03, MKCF's former Elmbridge case) catalogued for reference rather than re-run. Escape-hatch verification (profile correction → successful reapplication) flagged as an open follow-on — never completed in any prior session.                                                        |
