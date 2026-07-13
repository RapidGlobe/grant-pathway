---
id: ADR-DATA-002
category: Data
status: Decided
---

# ADR-DATA-002 — Data That Is Not Stored

## Context

Grant Pathway processes funder guidelines documents (PDF, Word, or pasted text) as part of Step 2. These guidelines may contain commercially sensitive information provided by the funder. The product must define a clear policy on whether this content is retained after processing, both for privacy reasons and to simplify the product's data obligations.

## Options Considered

- **Option A — Store guidelines in Supabase Storage permanently:** Allows users to re-use guidelines across multiple applications to the same funder. Increases storage requirements and data retention obligations.
- **Option B — Store guidelines temporarily (e.g., 24 hours), then delete:** Middle ground. More complex to implement (scheduled deletion job). Still incurs data retention obligations during the window.
- **Option C — Never store funder guidelines:** Guidelines are passed directly to the AI API in the same request. Only the AI-generated summary is stored. No guidelines data is retained after the AI call returns.

## Decision

**Option C — Funder guidelines are never stored in the database or in Supabase Storage.**

The funder guidelines text is extracted client-side (or server-side during the API call), passed as a parameter to the AI generation API route, and discarded after the AI response is returned. Only the AI-generated summary (`ai_summary` on the `applications` table) is persisted.

## Rationale

- Simplifies data retention obligations — funder guidelines are not personal data in most cases, but may be commercially sensitive to the funder.
- Reduces storage costs and complexity.
- The AI summary captures all content required for Step 4 draft generation, so retaining the raw guidelines provides no additional value.
- FR-22 explicitly states: "Funder guidelines are not stored in the database. They are used only for AI processing within the session."

## Consequences

- If the user navigates away after Step 2 and before Step 3 completes, they will need to re-upload or re-paste the guidelines.
- The guidelines text must be passed from the client to the API route in the POST body of the AI summary request. The POST body must not exceed Vercel's 4.5MB request limit — this is addressed by extracting text from the PDF/Word document before sending (text is much smaller than binary).
- The UI should make clear that guidelines are not saved, and prompt the user to re-upload if they return to Step 2 without a summary.

## Source

FR-22, PRD-Grant-Pathway.md (Section 9.3 — Data Not Stored).

## Date Decided

2026-04-17

---

## Revised Decision — 2026-07-10

**Option C ("never store") is reversed in favour of a new Option D, introduced here.** This section supersedes the Decision, Rationale, and Consequences above; the original text is kept intact above for the historical record rather than rewritten.

- **Option D (new, 2026-07-10) — Retain extracted text in Postgres, tied to the owning record's lifecycle:** Store extracted, page/section-tagged guideline _text_ (not the raw PDF/Word file) in Postgres. Retention is not a fixed calendar window — it follows the same lifecycle rules the rest of the data model already uses (`ADR-DATA-003`): cascade-deletes with the owning application, or is retained indefinitely if it backs an approved playbook. This is distinct from all three original options: not Option A (that was the raw file, in Supabase Storage, with no lifecycle tie); not Option B (a fixed short expiry window, explicitly reconsidered and rejected below); not Option C (never store, reversed here).

### What changed

This ADR's Context claimed guidelines "may contain commercially sensitive information provided by the funder." That claim was checked against the actual document corpus Grant Pathway processes (`docs/Grant Org Guidelines/` — 23 real funder documents across 14 funders: Garfield Weston, Henry Smith, Heritage Fund, Idlewild, Lloyds Bank Foundation, MK Community Foundation, Nationwide, Stony Stratford, TNL Community Fund, Walton Charity, Wolfson, Clothworkers, AB Trust, and EYP Early Years Parenting) and found unsupported. These are funders' own publicly published application guidance — documents a funder deliberately makes available so any eligible charity can apply. There is no commercial-sensitivity basis for treating this content as something that must be discarded.

### New decision (Option D)

Funder guideline content is now **retained**, not discarded, with retention tied to the same lifecycle rules the rest of the data model already uses (`ADR-DATA-003`) rather than a fixed calendar-based expiry window:

- **Extracted, page/section-tagged guideline text** (the P6.2a groundwork) is stored **in Postgres** — not the raw PDF/Word file in Supabase Storage — for the life of the specific application it belongs to. It cascade-deletes with that application, exactly like `application_answers` today.
- **Guideline text backing an approved playbook** (`P6.5`) is retained **indefinitely** as part of the playbook record, independent of any single application's or user's lifecycle — it's curated, reusable content, not a per-session artefact.
- No time-based deletion job is introduced. A fixed short window (the original Option B, "e.g. 24 hours"; also considered at 7 days) was reconsidered and rejected — see Rationale.

### Rationale

- The confidentiality concern that justified "never store" no longer holds for the real document corpus (see above). Guidelines were also never personal data ("in most cases," per the original Rationale) — so neither the two concerns that motivated Option C apply any more.
- With no privacy or confidentiality reason left to force an expiry, the simplest and most consistent choice is to apply the _same_ retention rule already governing every other table (`ADR-DATA-003`) rather than invent a new, special-cased time-based deletion mechanism just for this content.
- A fixed short window was explicitly considered and rejected: grant applications routinely take longer than 24 hours or 7 days to complete. If retained guideline content expired on a calendar timer, the Phase 6 guideline source-reference feature (P6.2a's citations, P6.4's "view original guidelines" viewer, P6.5's playbook curation) would silently stop working for exactly the applications that take longest — a worse failure mode than simply not having the feature, since it would work sometimes and not others with no obvious reason why to the user.
- Storing extracted/chunked **text** in Postgres, not the raw file in Supabase Storage, keeps the retained content inside the automatic daily backup coverage already established in `ADR-DATA-005` — that ADR explicitly found Storage objects are excluded from Supabase's automatic backups, DB rows are not.

### Consequences

- Funder guideline text is now stored — this reverses the original Consequences above (re-upload on navigating away from Step 2 is no longer necessary once P6.2a/P6.2 land, though it remains true until then).
- `ADR-DATA-003`'s account-deletion cascade order needs the new guideline-chunk table added (done — see that ADR's 2026-07-10 revision); playbooks are explicitly excluded from any single user's cascade, matching `ADR-SEC-002`'s existing playbook RLS pattern.
- `ADR-ARCH-004` and `ADR-FILE-004` both currently assume guidelines can't be stored and describe `sessionStorage`-based handling because of it — both need a matching update once P6.2a/P6.3 are built (already tracked).
- `FR-22` and its acceptance criteria have been reworded to match this decision — done the same day; see `docs/PRD inputs/acceptance-criteria.md`'s FR-22 section (now four criteria: AC-FR-22-01/02/03 describing target behaviour once built, plus AC-FR-22-04 documenting the actual current discard behaviour until then).
- The Privacy Policy re-review already flagged for `P5.1` needs to reflect that guideline text is retained, not discarded — the "commercially sensitive, therefore discarded" framing no longer applies.
- No raw guideline file (PDF/Word) is ever stored in Supabase Storage under this decision — only extracted, chunked text in the database.

### Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Option C ("never store") reversed. The original "commercially sensitive information" premise in the Context above was checked against the real document corpus (`docs/Grant Org Guidelines/`) and found unsupported. New decision: retain extracted/chunked guideline text in Postgres for the life of the owning application (cascade-deletes per `ADR-DATA-003`), and indefinitely for content backing an approved playbook (`P6.5`) — not a fixed calendar-based expiry window (24 hours and 7 days were both considered and rejected). Driven by the guideline source-reference feature (Phase 6, P6.2a/P6.3/P6.4/P6.5). |
| 2026-07-13 | Clarified that the 2026-07-10 reversal adopts a new **Option D** — this new decision matched none of the original Options A/B/C, and the record previously left that unnamed, which was a fair question to ask of the document. No change to the substance of the decision, only to how it's labelled.                                                                                                                                                                                                                                                                                                                       |
