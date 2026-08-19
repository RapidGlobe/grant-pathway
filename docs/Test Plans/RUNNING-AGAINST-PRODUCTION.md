# Running the Test Plans Against Production

**Tier:** 1 — Always check
**Volatility:** Medium
**Update when:** Any test plan is run against an environment other than `grant-pathway-dev`, or any convention below changes

**Version:** 1.0
**Date:** 2026-08-19

---

## Why this exists

Every test plan in this folder was written against **`grant-pathway-dev`** and every green result in them was earned there. `P5.5` is the first time the suite has been run against **`grant-pathway-prod`**, and on 2026-08-19 that exposed a set of assumptions the plans share — none of which is wrong on dev, and all of which bite on production.

WJ's own words during that run: _"All the test plans including regression need amending, because they were fine for dev but not for prod."_

**This document holds the conventions once, rather than editing the same four paragraphs into seven plans.** Each plan links here from its header. Where a plan's own text disagrees with this document about environment, accounts, fixtures or result recording, **this document wins** and the plan should be corrected.

---

## 1. Environment

|                             |                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Production URL**          | `https://grant-pathway-three.vercel.app`                                          |
| **Production Supabase ref** | `mvmjryipieepvsjudche`                                                            |
| **Dev Supabase ref**        | `stanwaejdvlvremtffkf`                                                            |
| **`grantpathway.org.uk`**   | ⚠️ **Not the product** — serves a 123 Reg parking page until `P5.6`'s DNS cutover |

**Confirm which project you are on before recording anything**, using `RT-00` step 1: DevTools → Application → Cookies → `sb-<project-ref>-auth-token`. Vercel's dashboard cannot be relied on for this — sensitive variables cannot be revealed once saved.

⚠️ **Run `RT-00` in full before any other case on a fresh environment.** Its steps 5 and 6 (`npm run parity` and one real AI call) exist because the version without them passed on 2026-08-18 while five tables were unusable and no AI feature worked at all.

---

## 2. Test accounts

**Plan headers name dev accounts. They are not valid on production.** Do not create a production account per plan — WJ's standing decision of 2026-08-19 is to **keep the number of real accounts on production small**, because they are real rows in a real database subject to the real retention and deletion rules.

| Environment                               | Account                           |
| ----------------------------------------- | --------------------------------- |
| Production (all plans, 2026-08-19 onward) | `grantpathway+RT01test@gmail.com` |
| Dev                                       | as named in each plan's header    |

**Reusing one production account across plans is permitted** and does not weaken coverage:

- The flagship coverage rule (`AGENTS.md` §3) requires _"account registration **or login for returning test user**"_ — login is explicitly allowed.
- `RT-01a` covers fresh registration on whichever environment it runs against, so registration is never untested.

⚠️ **A charity profile is one per account** (`data-model.md` §2). Running a plan whose charity differs **overwrites** the previous one. That is usually harmless, but note it in the plan's results, because a later case reading the profile will see the new charity, not the one its own text names.

⚠️ **The verification-email limiter is shared between environments.** `resendRatelimit` is keyed by email address and Upstash is a single database, so **three resends on dev leave none for that address on production for the hour.** A verification email that never arrives is usually this, not a production fault.

---

## 3. Fixtures

**Every guideline document a plan uses must be in `docs/Grant Org Guidelines/` before the run starts.**

This was not true on 2026-08-19: `RT-04` was run against The Radcliffe Trust application form, which **existed nowhere in the repository** — not in the guidelines folder, not in the funder list, not in any document. It was copied in mid-run.

**Why it matters:** a result recorded against a document nobody else can open is not reproducible, and the next session cannot tell whether a changed count means the product changed or the document did. `MK-Community-Foundation-test-plan.md` v2.3 exists precisely because a refreshed source document changed the expected question count.

**Before running:** confirm the file is committed, and reference it by repository path in the plan's Test Data.

---

## 4. Order — the suite's numbering is not its running order

**`regression-test-plan.md`'s cases are not independent, and its numbering does not reflect its dependencies.** `RT-03` reads a dashboard carrying completed applications; **no such application existed on production until the two flagships created one**, so a case numbered third could not run until much later.

**On a fresh environment, the working order is:**

1. `RT-00` in full — including `npm run parity` and one real AI call
2. `RT-01a` / `RT-01b` — registration and profile
3. **A flagship end-to-end plan** — this is what creates completed applications
4. `RT-03` onward, plus any case assuming existing data
5. The remaining plans

⚠️ **This is a property of the plans, not of that session.** Anyone running the suite on a new environment will hit it again unless the plans are reordered — which has not been done, deliberately, because renumbering cases would break every historical reference to them.

---

## 5. Recording results

**Each case carries one Result checkbox and one Notes block, and both were written for a single environment.** Until that changes, the convention is:

- **Add a new note headed `**Notes — YYYY-MM-DD, production run:**`** above the existing notes. **Do not overwrite the dev result** — it is the record of what was true when it was earned.
- **Leave the Result checkbox reflecting the most recent run**, and say in the note which environment that was.
- **A dev pass is not evidence about production.** Say so where a plan's status line might imply otherwise.
- ⚠️ **Record a caveat as a caveat.** `ABC-10` passed on production while the multi-line export check went unexercised, because the answers written happened to be single paragraphs — the same hole `RT-09` passed through over `D-015`, a High defect that then hid for six days. **A pass that did not exercise the thing the case exists to test is `Pass (caveat)`, not `Pass`.**

---

## 6. What a production run costs

Worth knowing before starting, because these are real, metered resources rather than a dev sandbox:

- **AI calls are capped at 50 per user per month** (`ADR-AI-008`). A full flagship uses several; an eligibility mismatch uses **two per attempt** (`GAP-115`).
- **Emails are real**, sent from the charity-facing sender, and rate-limited as above.
- **Accounts and applications are real rows**, subject to the deletion and retention rules. Delete test applications when finished with them, rather than leaving them to accumulate.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-08-19 | Rapidglobe Ltd | Created during `P5.5`'s production run, at WJ's direction, after the run exposed that every plan assumes `grant-pathway-dev`. Holds the environment, account, fixture, ordering, result-recording and cost conventions once instead of repeating them across seven plans. |
