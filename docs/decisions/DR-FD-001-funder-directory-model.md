# DR-FD-001 — Funder Directory and Access Control Model

**Version:** 1.4
**Date:** 2026-07-15
**Status:** Superseded ✓ (picker/directory removed — see v1.4 amendment)
**Author:** Rapidglobe Ltd

---

## Question

How should Grant Pathway control which grant-giving organisations end users can create applications for?

---

## Context

Grant Pathway's functionality is validated against a specific set of tested and approved funders (see `docs/Test Plans/TEST-DASHBOARD.md`). During the testing phase (and at initial launch), only these approved funders are known to work correctly with the Step 3 AI extraction and Step 4 Q&A interface. The funder list has grown over time — see the Active Funders table in `docs/Test Plans/TEST-DASHBOARD.md` for the current canonical set (20 funders as of 2026-07-01). Allowing users to freely enter any funder name introduces untested combinations that may produce degraded or misleading output.

_Note (2026-07-01): `docs/target-funder-list.md` (referenced below and in the version history) was retired — it was never updated after the 2026-06-11 MK Community Foundation/Baily Thomas/CPF Trust additions and had drifted out of sync with the live funder directory. `TEST-DASHBOARD.md` is now the single source of truth._

Five options were evaluated:

1. **Curated funder directory (picker only)** — users select from an approved DB-seeded list; no free text
2. **AI-based guidelines upload validation** — AI matches uploaded guidelines to an approved funder at Step 3; rejects unrecognised funders
3. **Invite / access code gating** — beta programme controls the user base rather than the funder list
4. **Hardcoded allowlist in application code** — approved funder list embedded as a constant; changes require a deploy
5. **Hybrid: curated directory + "Request a Funder" escape hatch** — users select from the directory; a clearly labelled request link lets users nominate an unlisted funder for review

---

## Decision

**Option 5 — Hybrid: Curated Funder Directory + "Request a Funder" escape hatch.**

The `funders` table in Supabase is the authoritative source of approved funders. Step 1 (Application Details) presents a searchable picker populated from this table. Users cannot enter a funder name that is not in the approved list. A clearly labelled "My funder isn't listed — request it" link is available at the picker, routing to a simple request form (Tally or mailto in v1). Submitted requests are reviewed by Rapidglobe before a funder is added to the table.

**Amendment (2026-07-11) — hard gate relaxed to free-text fallback, to be trialled in testing.** The original hard gate ("users cannot enter a funder name not in the approved list") was a testing-phase safety measure, premised on funder identity predicting whether Step 3 extraction would work reliably. That premise no longer holds: BD-04's amendment (see consequence 1 above) already established that Step 3/4/5 behaviour is driven dynamically by each application's own `ai_summary`, not by which funder was selected — extraction works on whatever guidelines text is uploaded or pasted, regardless of funder identity. The curated picker therefore no longer protects against a real risk; it only adds friction (the request-and-wait escape hatch) against the "any guideline or form" direction (`ADR-DATA-006`, `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md`).

**Revised behaviour:** the searchable picker over the `funders` table is retained as the default, convenient path — it still surfaces which funders have been tested (`TEST-DASHBOARD.md`) and pre-links to `guidelines_url`/`grant_range`. But a charity may now also enter a funder name directly if it isn't found in the picker, without submitting a request and waiting for review. `applications.funder_id` remains nullable and is simply left null for a free-text entry; `funder_name` (already a required, independent text field) is populated directly. The "My funder isn't listed — request it" link is retained as a secondary path for charities who'd rather flag a funder for future curation than type it themselves.

**Status: to be trialled in upcoming testing**, not yet implemented in code — see Consequences below for the build task.

**Amendment (2026-07-15) — picker and directory removed entirely; free-text only.** The 2026-07-11 free-text-fallback build task above was never actually implemented — investigation found no corresponding task was ever added to `IMPLEMENTATION-PLAN.md`'s tracked list (only the original picker build, `P5.FD1–FD6`, is marked complete there); the decision existed only inside this document and had no operational trigger. Separately, live review of the Step 1 screen (2026-07-15) found the picker itself — not just its hard gate — was worth removing: with extraction driven entirely per-application by the uploaded guidelines (as this document's own 2026-07-11 amendment already established), a curated directory of "known" funders no longer serves the purpose it was built for, and free-text entry alone is simpler and sufficient. `Who is offering this grant?` is now a plain text field — no picker, no directory query, no "Request a Funder" escape hatch (nothing to fail to find). `funder_name` remains the sole record of the funder on `applications`; the `funders` table and `applications.funder_id` are left in place, unused — the same low-priority-cleanup treatment already given to the dormant `funder_type` column (v1.2) rather than an urgent drop migration.

**Consequence for P6.5 (reuse previous application):** `getPreviousApplicationForFunder` previously matched "same funder" by exact `funder_id` equality. With no stable funder identity left, it now matches on a case-insensitive, trimmed `funder_name` comparison instead — a deliberate soft-miss trade-off (WJ, 2026-07-15): if a charity types the same funder's name slightly differently across two applications, the reuse prompt simply won't offer itself, rather than risk ever wrongly matching two different funders.

---

## Rationale

- A hard gate on the funder list is essential during the testing phase: users must not be able to create applications for funders whose guidelines have not been validated against the Step 3 extraction prompt and Step 4 interface.
- A directory-only approach without an escape hatch would frustrate users who arrive with a legitimate funder not yet on the list, driving churn and damaging trust.
- The "request" mechanism converts a dead end into a demand signal, directly informing the priority order for validating new funders.
- Option 1 alone was rejected because it provides no graceful handling for unlisted funders.
- Option 2 (AI matching) was rejected as probabilistic and difficult to test reliably; false positives and negatives are both unacceptable.
- Option 3 (invite gating) was rejected as it does not solve the funder control problem — invited users could still upload guidelines for untested funders.
- Option 4 (hardcoded list) was rejected as it is not maintainable beyond the early beta and requires a code deploy for every funder addition.
- Testing with a compromised workaround (e.g. invite gate only) would yield test results that do not reflect the real product. The decision was taken to implement the near-final product model now so that all test activity reflects the actual user experience.

---

## Consequences

### Immediate build tasks (Phase 5 — Pre-Launch)

1. Create `funders` table in Supabase with columns: `id`, `name`, `funder_type` (`structured | narrative`), `grant_range`, `guidelines_url`, `is_active`, `created_at`

   **Amendment (2026-07-04):** `funder_type` picked a fixed `structured`/`narrative` label per funder without ever defining what the terms meant, and was decided here — as a database-schema convenience — two days after the actual product decisions (Mark Two BRD, BD-01–BD-07, 2026-05-29), which never mention it. Reviewing the real funder guidelines documents in `docs/Grant Org Guidelines/` found the label doesn't reflect a stable property of the funder at all: several funders (Henry Smith, Idlewild) have _both_ a discrete-question form and free-form guidance, depending on which document happens to be uploaded — the "same" funder can be either. Separately, the picker's `funderType` badge was never connected to the mechanism that actually matters for processing: Step 3/4/5 behaviour is driven by a _different_, dynamically-derived `funder_type` (`structured`/`free_form`) parsed fresh from each application's own `ai_summary`, not from this DB column — so the column was purely a cosmetic, pre-committed guess with no functional role beyond the picker badge. Removed the column from the Step 1 picker query and dropped the "Structured"/"Narrative" badge from the funder picker UI (`getActiveFunders()` in `actions/applications.ts`; `components/application-step1-form.tsx`) — the `funder_type` DB column itself is left in place, unused, as low-priority cleanup rather than an urgent migration. The dynamic per-application classification is unaffected and continues to drive actual behaviour correctly.

2. Seed the table with the 12 approved funders from `docs/Test Plans/target-funder-list.md`
3. Add RLS policy: all authenticated users can read active funders; only service role can insert/update/delete
4. Replace the free-text funder name field in Step 1 (Application Details) with a searchable picker component wired to the `funders` table
5. Store the selected `funder_id` (FK) on the `applications` table alongside the existing `funder_name` text field (retained for display)
6. Add a "My funder isn't listed — request it" link below the picker; v1 implementation is a mailto or Tally form link
7. Add a `funder_request_notifications` email or equivalent so Rapidglobe receives each request

### Not in scope for v1

- Admin UI for managing the funder list (funders are added directly to the DB or via Supabase dashboard)
- Funder approval workflow with automated notifications to the requesting user
- Auto-detection of funder type from uploaded guidelines

### Impact on existing features

- `applications` table requires a `funder_id` column (nullable FK to `funders`; nullable to preserve existing records during migration)
- Step 1 UI component (`application-step1.tsx` or equivalent) requires replacing the funder text input with a picker
- `FR-15` in `moscow-feature-register.md` is revised: funder selection is now via picker, not free-text entry

### Build task — free-text fallback (2026-07-11 amendment)

1. `components/application-step1-form.tsx`: when no picker match is selected, allow the typed value to be submitted directly as a free-text funder name instead of blocking with "Please select a funder from the list"
2. `actions/applications.ts` (create-application path): accept a free-text funder name with `funder_id` left null; continue to populate `funder_name` as today
3. `FR-15` in `moscow-feature-register.md` and the PRD to be updated to reflect the relaxed gate once this lands
4. No database migration required — `funder_id` is already nullable, `funder_name` is already an independent required text field

---

## Document history

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-01 | Rapidglobe Ltd | Initial decision — funder directory model adopted following options review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 1.1     | 2026-06-11 | Rapidglobe Ltd | Updated funder count reference — now refers to target-funder-list.md v1.3 (19 entries, 18 active) following addition of MKCF ×4, Baily Thomas ×3, CPF Trust                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.2     | 2026-07-04 | Rapidglobe Ltd | Retired the `funder_type` picker badge (see amendment under consequence 1) — found not to reflect a stable property of the funder, and disconnected from the mechanism that actually drives Step 3/4/5 behaviour. Badge removed from the Step 1 funder picker; DB column left in place, unused.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1.3     | 2026-07-11 | Rapidglobe Ltd | Hard gate relaxed to a free-text fallback, to be trialled in testing (see amendment under Decision, and new build task under Consequences). The original rationale — funder identity predicts whether Step 3 extraction will work — was already disproven by BD-04's finding that processing is driven dynamically per-application, not by funder identity. Picker retained as the default convenient path (still surfaces tested funders); free-text entry now allowed as a fallback instead of a request-and-wait escape hatch. Not yet implemented in code.                                                                                                                                                                                                                                            |
| 1.4     | 2026-07-15 | Rapidglobe Ltd | Picker and directory removed entirely — plain free-text funder field only. The 2026-07-11 free-text-fallback task above was found never to have been built (no corresponding entry ever existed in `IMPLEMENTATION-PLAN.md`'s tracked task list). Live review of Step 1 prompted going further than a fallback: with extraction already driven per-application rather than by funder identity, the curated directory no longer serves its original purpose. `funders` table and `applications.funder_id` left in place, unused. `getPreviousApplicationForFunder` (P6.5) now matches "same funder" by trimmed, case-insensitive `funder_name` instead of `funder_id` — a deliberate soft-miss trade-off. Built same day: `actions/applications.ts`, `components/application-step1-form.tsx`, Step 1 page. |
