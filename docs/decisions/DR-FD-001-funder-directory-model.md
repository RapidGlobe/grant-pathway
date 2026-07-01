# DR-FD-001 — Funder Directory and Access Control Model

**Version:** 1.0
**Date:** 2026-06-01
**Status:** Decided ✓
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

---

## Document history

| Version | Date       | Author         | Change                                                                                                                                                      |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-06-01 | Rapidglobe Ltd | Initial decision — funder directory model adopted following options review                                                                                  |
| 1.1     | 2026-06-11 | Rapidglobe Ltd | Updated funder count reference — now refers to target-funder-list.md v1.3 (19 entries, 18 active) following addition of MKCF ×4, Baily Thomas ×3, CPF Trust |
