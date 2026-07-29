# Phase 5 Restructure — Proposal

**Tier:** 3 — Stable (record of a planning decision)
**Volatility:** Low
**Update when:** This proposal is approved, amended, or rejected by the project owner

**Version:** 0.1
**Date:** 2026-07-29
**Status:** ⏳ **AWAITING APPROVAL — nothing in `IMPLEMENTATION-PLAN.md` has been changed yet**
**Author:** Rapidglobe Ltd (Claude Opus 5 review, at WJ's request)
**Owner:** WJ

---

## 1. Why this proposal exists

WJ asked, 2026-07-29: _"Does Phase 5 hang together? Are there any missing gaps? For example, should we have a compare of the service against the BRD, PRD, technical design, acceptance criteria?"_

The review found that Phase 5 does **not** hang together, for three separate reasons:

1. **The status accounting is factually wrong** — the live status doc reads as though Phase 5 is finished when only one of its tasks is genuinely done.
2. **P5.3 is mislabelled** — six unbuilt code changes are filed under an "Accessibility" heading, so they can be signed off by a process that would never touch them.
3. **P5.5 predates Phase 6** — "Final Testing" describes a product that no longer exists, and competes with the test-plan layer structure that replaced it.

And the answer to WJ's own question is **yes**: there is no task anywhere in Phase 5 that compares the built service against the requirement documents. That is the largest single gap, and it is proposed below as a new blocking task, `P5.0`.

Every finding in this document was verified against the code, the schema or the documents — not inferred. Verification method is stated per finding.

---

## 2. Findings

### 2.1 The accounting is wrong

| #   | Finding                                                                                                                                                                                                                                                                                                             | Verified by                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| A1  | `IMPLEMENTATION-STATUS.md:80` states _"For the full Phase 0–5 breakdown (all complete, 97 tasks)"_. Phase 5 is not complete. `IMPLEMENTATION-STATUS-ARCHIVE.md:105` gives Phase 5 as **13 tasks, 7 done**, with P5.1–P5.6 each marked "Not started". A reader of the live status doc concludes Phase 5 is finished. | Read both files                                       |
| A2  | Six of those "7 done" are the funder directory (`P5.FD1`–`FD6`), reversed on 2026-07-15 (`DR-FD-001` v1.4). `IMPLEMENTATION-PLAN.md` correctly strikes them through; `IMPLEMENTATION-STATUS-ARCHIVE.md:106–112` still counts them ✅ Complete. **Phase 5's real progress is one task (`P5.PERF1`), not seven.**     | Cross-read plan §Funder Directory vs archive table    |
| A3  | `P5.5b` (Admin Dashboard) appears in the plan but in **no** status table — it is not among the 13 tasks. The Phase 6 → Go-Live Gate says "P5.1–P5.5 complete", which does not name it. Whether the admin dashboard blocks launch is currently undefined.                                                            | `grep P5.5b` across both status files returns nothing |
| A4  | `IMPLEMENTATION-STATUS.md:56` records "Plan version: 3.17". `IMPLEMENTATION-PLAN.md:7` is 3.21.                                                                                                                                                                                                                     | Read both headers                                     |

### 2.2 P5.3 is mislabelled, and hides six unbuilt changes

`P5.3` is headed **"Accessibility (WCAG 2.2 Level AA)"**. Seven of its bullets are not accessibility work:

| GAP    | What it actually is                                            | Derives from                           | Built?                                                      |
| ------ | -------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| GAP-21 | Sentry `withScope` route tagging on AI routes                  | ADR-OPS-005, `technical-design.md §14` | ❌ No — `grep "setTag('route'" app/` returns nothing        |
| GAP-22 | Session-timeout redirect to `/?timeout=true` + sign-in banner  | ADR-SEC-003, `technical-design.md §5`  | ❌ No — `grep "timeout=true"` returns nothing               |
| GAP-23 | `loading.tsx` Suspense boundaries on authenticated routes      | ADR-ARCH-002                           | ❌ No — `find app -name loading.tsx` returns nothing        |
| GAP-24 | Export disclaimer wording                                      | PDR-DH-003                             | ❌ No — `route.ts:216` still has the wrong text             |
| GAP-25 | Zod validation in `actions/applications.ts`, `actions/auth.ts` | ADR-ARCH-003                           | ❌ No — only `actions/charity.ts` imports Zod               |
| GAP-31 | Inactivity cron dedup column + email failure reporting         | ADR-AI-010, ADR-OPS-001                | ❌ No — `last_inactivity_warned_at` absent from `supabase/` |
| GAP-05 | Below-768px degradation banner                                 | ADR-ARCH-005                           | ❌ No — no such component in `components/`                  |

**GAP-24 is the one that matters most and is the cheapest to fix.** Every Word document exported today ends:

> _"Disclaimer: This application was prepared with AI assistance and reviewed by {name}. All content has been checked for accuracy before submission."_

The app cannot make that claim on the charity's behalf. `PDR-DH-003` specifies _"Please review carefully before submitting to the funder."_ This text goes to funders, on the deliverable, in the user's name. It is a one-line change.

**The compounding problem — `✅` in the GAP register means two different things.** `ADR-TRACEABILITY.md` marks GAP-21 through GAP-25 as:

> ✅ 2026-06-16 — {…} step added to P5.3 in IMPLEMENTATION-PLAN.md

That `✅` means **"a task was written"**, not "the code exists". Two rows away, `GAP-26`'s `✅ Resolved 2026-06-15 (commit 372d95b)` means **"the code exists"**. Same column, same tick, opposite meanings.

The consequence is real, not theoretical: the **Phase 4 → Phase 5 gate sign-off** (`ADR-TRACEABILITY.md:347`, signed WJ 2026-06-17) reads _"GAP-05/12/17/21/22/23/24/25/26 resolved"_. Six of those nine are unbuilt code changes. The gate was signed on a true statement that reads as a false one.

### 2.3 P5.5 "Final Testing" describes a product that no longer exists

`P5.5`'s bullet list was written before Phase 6. It contains **no** check for:

- guideline citations (P6.3/P6.4) — the citation badge and text-panel viewer
- governance facts (PDR-AI-008) — auto-detect and manual-add fallback
- the item graph (P6.2) — non-narrative fields being visible at all, which is the reason Phase 6 gates launch
- reuse of a previous application (P6.5)
- the eligibility hard-stop (FR-47 / DR-EL-001)

It also duplicates and contradicts `docs/Test Plans/TEST-DASHBOARD.md` v2.3, which under `DR-TEST-001` (2026-07-24) replaced ad-hoc coverage with five named layers. There are now two competing definitions of "final testing", and the one inside the implementation plan is the stale one.

Related, already logged and still outstanding: the test plans and user guide need refreshing for the MK Community Foundation baseline moving from 10 to 12 questions.

### 2.4 Items assigned to P5.4 elsewhere, but absent from P5.4

Four items are recorded in `IMPLEMENTATION-STATUS-ARCHIVE.md` as belonging to P5.4, and do not appear in P5.4's checklist:

| Item                                              | Recorded at               | Risk if missed                                                                                                                                                                           |
| ------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase prod redirect-URL allowlist**          | archive:940               | **Email verification silently fails on production.** Dev needed `http://localhost:3000/**` added by hand; the prod equivalent was flagged "must be added before launch" and never tasked |
| UptimeRobot monitor (5-min poll of `/api/health`) | archive:850/868, plan:843 | No liveness alerting at launch; `/api/health` was built specifically for this                                                                                                            |
| Bedrock hard-stop IAM action on the spend cap     | archive:871               | Cap is alert-only. Recommend recording this as an accepted risk rather than building it — the per-user 50/month app limit is the real control                                            |
| Placeholder logo replacement                      | archive:641               | Launching with a placeholder SVG in `components/logo.tsx`                                                                                                                                |

### 2.5 Items from the 2026-07-29 Opus audit not yet reflected in Phase 5

| Item                                                                                   | Where it belongs | Why                                                                                                                  |
| -------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Set `NEXT_PUBLIC_ALLOW_INDEXING=true` and remove `NEXT_PUBLIC_SITE_URL` at DNS cutover | P5.6             | Without it the live site keeps serving `Disallow: /` and is invisible to search engines                              |
| Confirm a Sentry **alert rule** exists (not merely that the DSN is set)                | P5.4             | Seven production issues accumulated unnoticed because no rule fires. P5.4 currently only requires the DSN            |
| Dependency **licence** review (GAP-20) still open                                      | P5.1             | The new `security-audit.yml` workflow covers vulnerabilities, not licences. ADR-STACK-005's requirement is untouched |

### 2.6 Smaller defects

| #   | Finding                                                                                                                                                                              | Verified by                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| B1  | `P5.6` cites _"(BRD Section 3.3)"_ for the CVS-newsletter announcement. The BRD has no Section 3 — headings run 2 → 4 (Section 3, Funder Coverage Model, was deleted at BRD v0.6)    | `grep "^## " BRD-Grant-Pathway.md` |
| B2  | `P5.2` requires an OWASP Top 10 review and a securityheaders.com check but names no output artefact, so there is nothing to sign off against and nothing to re-run later             | Read P5.2                          |
| B3  | An empty, untracked `app/mockup/` directory remains on the local working tree after the page was deleted (`git ls-files` and `git status` are both clean — repo is fine, local only) | `ls -la app/mockup`, `git status`  |

---

## 3. Proposed structure

Changes are marked **NEW**, **MOVED**, **REWRITTEN** or **UNCHANGED**.

### P5.0 — Requirements reconciliation — **NEW, blocking**

Compare the built service against every requirement document, and record each divergence with a disposition.

**Scope — one pass per document:**

| Document                                                 | What to check                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `docs/PRD inputs/acceptance-criteria.md`                 | Every `AC-FR-*` marked pass / fail / not-testable against the live app    |
| `docs/PRD-Grant-Pathway.md` §7                           | Each screen's fields, validation rules and error states vs the components |
| `docs/Technical Decision and Design/technical-design.md` | Architecture, API contracts, component design vs code                     |
| `docs/data-model.md`                                     | Every table, column, type and constraint vs `grant-pathway-dev`           |
| `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md`  | FR list vs `moscow-feature-register.md` vs what is built                  |
| `docs/non-functional-requirements.md`                    | Each NFR has a named verification step in P5.2/P5.3/P5.5                  |

**Output:** a written register at `docs/Implementation Plan/pre-launch-reconciliation-<date>.md` — one row per divergence, each dispositioned **fix now** / **amend the doc** / **accept and record**. No divergence may be left undispositioned.

**Sequencing:** must complete **before P5.5**, so that final testing tests the agreed specification rather than a stale one.

**Why this is worth a task of its own:** five separate instances of doc-vs-build drift were found this month, every one of them by accident while doing something else — the Stony Stratford feasibility review, `DR-FD-001`, `DR-TEST-001`, GAP-33 (guideline retention decided but never tasked), and the Opus audit. The pattern is not that the documents are sloppy; it is that nothing in the plan ever _checks_.

### P5.1 — Compliance — **UNCHANGED in substance**

Add one explicit sub-item and one output:

- Dependency licence review (GAP-20) → output `docs/legal/dependency-licences-<date>.md`
- Retain the two open items already tracked: effective dates, solicitor review

### P5.2 — Security — **UNCHANGED in substance**

- Add: record the OWASP review and the securityheaders.com result as a dated artefact (fixes B2)

### P5.3 — Accessibility — **REWRITTEN (narrowed)**

Keeps only accessibility work:

- `@axe-core/react` violations resolved
- Lighthouse 95+ on key pages
- Manual keyboard-only pass through all five steps
- WCAG 2.2 AA checklist
- GAP-05 below-768px banner (viewport degradation — genuinely belongs here)
- NVDA / VoiceOver — remains deferred to the assistive-technology expert, per the 2026-06-07 decision

### P5.3b — Spec-deviation fixes — **NEW (MOVED out of P5.3)**

The six unbuilt changes from §2.2, each traced to the ADR or PDR it derives from: **GAP-24** (do this first — one line, user-facing), GAP-21, GAP-22, GAP-23, GAP-25, GAP-31.

These are code changes with an owner and a definition of done, not audit steps.

### P5.4 — Production infrastructure — **UNCHANGED plus seven additions**

Add: Supabase prod redirect-URL allowlist; UptimeRobot monitor; Sentry alert-rule confirmation; logo replacement; Bedrock hard-stop recorded as accepted risk; and keep the two migration items already present.

### P5.5 — Final testing — **REWRITTEN**

Replace the bullet list with:

1. **Execute the test layers** in `TEST-DASHBOARD.md` against the **production** deployment — `regression-test-plan.md`, both flagships (`AB-Charitable-Trust`, `MK-Community-Foundation`), at least one path through `guideline-capability-matrix-test-plan.md`, `eligibility-check-test-plan.md`, `help-and-tooltips-test-plan.md`.
2. **Prerequisite:** refresh the test plans and user guide for the MKCF 10 → 12 question change and for the Phase 6 features (citations, governance facts, reuse-previous-application) — currently untested by any plan.
3. **Production-only checks no test plan covers:** cross-browser (NFR-05), AI performance (NFR-01), account deletion against prod, feedback opt-in written to `user_profiles`, session timeout at 60 minutes.

This makes `TEST-DASHBOARD.md` the single definition of test coverage and stops the plan carrying a second, stale one.

### P5.5b — Admin dashboard — **RECOMMEND MOVING OUT OF THE LAUNCH GATE**

The dashboard is internal, operator-only, read-only, and has zero user-facing impact. Recommend re-labelling it **post-launch** so it stops blurring the gate. It should not be the thing that delays charities getting the service.

_(If you would rather keep it in, it needs adding to the status tables and naming in the gate — either way A3 has to be resolved.)_

### P5.6 — DNS and go-live — **UNCHANGED plus two**

- Add: set `NEXT_PUBLIC_ALLOW_INDEXING=true`, remove `NEXT_PUBLIC_SITE_URL` at cutover
- Fix the dangling `(BRD Section 3.3)` reference (B1)

---

## 4. Also proposed

| #   | Change                                                                                                                                                                                | Reason                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C1  | Correct A1–A4 in `IMPLEMENTATION-STATUS.md` and `IMPLEMENTATION-STATUS-ARCHIVE.md` — Phase 5 not complete, funder-directory tasks recounted, `P5.5b` given a row, plan version synced | The live status doc currently misstates the position                                        |
| C2  | Split the GAP register's resolution column into **Tasked** and **Built**, or reserve `✅` for built and use `📋` for tasked                                                           | §2.2 — one tick currently carries two meanings, and a signed gate depends on the difference |
| C3  | Restate the Phase 6 → Go-Live Gate's first line as an explicit list — `P5.0`, `P5.1`, `P5.2`, `P5.3`, `P5.3b`, `P5.4`, `P5.5` — and state that `P5.5b` is deliberately excluded       | "P5.1–P5.5" is ambiguous and silently omits `P5.0` and `P5.3b`                              |
| C4  | Note in the Phase 4 → Phase 5 gate row that six of the nine gaps it lists as resolved were tasked, not built                                                                          | Preserves the audit trail rather than rewriting a signed sign-off                           |

---

## 5. What is **not** proposed

- **No change to the launch decision or the Phase 6 gate itself.** Phase 6 still gates launch; that decision stands.
- **No new features.** Every item above is either a correction, an existing unbuilt commitment, or a verification step.
- **No change to the NVDA/VoiceOver deferral** or to any other decision already taken.

---

## 6. Decision required

| Ask                      | Options                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| Approve the restructure? | Approve as drafted / approve with amendments / reject                        |
| `P5.5b` admin dashboard  | Post-launch _(recommended)_ / keep in the launch gate                        |
| Bedrock hard-stop IAM    | Record as accepted risk _(recommended)_ / build it                           |
| Order of work            | Accounting fixes (C1–C4) first, then GAP-24, then the rest / all in one pass |

---

## Document history

| Version | Date       | Author         | Change                                                                                                                                |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-07-29 | Rapidglobe Ltd | Initial draft, at WJ's request, following a line-by-line review of Phase 5 against the code, the schema and the requirement documents |
