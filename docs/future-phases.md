# Future Phases — Grant Pathway

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any item is deferred to post-v1, or a previously deferred item is brought back into scope

This document records items that are explicitly out of scope for v1 and are to be confirmed at a later date. Each item has been deferred by a formal decision record. This document serves as a parking lot to ensure nothing is lost.

---

## Status of All Items

| Item  | Description                                                     | Decision Record      | Status                                              |
| ----- | --------------------------------------------------------------- | -------------------- | --------------------------------------------------- |
| FP-01 | Grant discovery phase                                           | DR-PS-002            | To be confirmed post-launch                         |
| FP-02 | 360Giving integration                                           | DR-IN-002            | To be confirmed post-launch                         |
| FP-03 | CIC formation                                                   | DR-OD-001            | To be confirmed post-launch                         |
| FP-04 | Satisfaction survey & feedback framework                        | DR-SM-001, DR-SM-002 | To be confirmed post-launch                         |
| FP-05 | Independent accessibility audit                                 | DR-LC-003            | To be confirmed pre-scaling                         |
| FP-06 | Liability insurance review                                      | DR-LC-002            | To be confirmed when CIC is established             |
| FP-07 | OSCR (Scotland) and CCNI (NI) register lookup                   | BD-02                | **Planned before general release**                  |
| FP-08 | Full question-level typing implementation (BD-04)               | BD-04                | Planned — pre-launch or early post-launch           |
| FP-09 | Thick profile completeness-driven pre-fill for all funder tiers | BD-02, BD-07         | Planned — iterative post-launch                     |
| FP-10 | Streaming AI responses                                          | ADR-AI-010           | Deferred post-v1                                    |
| FP-11 | Rich-text formatting in answer fields                           | WJ, 2026-08-06       | Deferred — revisit only if docx-form demand appears |

---

## FP-01 — Grant Discovery Phase

**Decision record:** DR-PS-002
**Status:** To be confirmed post-launch

Grant discovery — helping charities find grants they are eligible for — is explicitly out of scope for v1. In v1, charities are expected to have already identified the grant they wish to apply for before using the service (A7).

The discovery phase will be scoped and planned once Grant Pathway has an established user base and the v1 writing tool is stable. The scope will be informed by user feedback gathered during v1.

---

## FP-02 — 360Giving Integration

**Decision record:** DR-IN-002
**Status:** To be confirmed post-launch

360Giving and its GrantNav search tool have been identified as the preferred data source for the grant discovery phase. No integration is required for v1.

This will be revisited when the discovery phase is planned (FP-01). The 360Giving data standard and API should be evaluated at that point for suitability, coverage, and licensing terms.

---

## FP-03 — CIC Formation

**Decision record:** DR-OD-001
**Status:** To be confirmed post-launch

Establishing a Community Interest Company (CIC) as the long-term owner and operator of Grant Pathway is the intended structure, but formation is deferred until after the v1 launch. The app will initially be owned and operated by the individual developer.

Key considerations for the CIC formation phase:

- Identify and engage a named potential successor organisation informally before launch (C18)
- CIC formation to be initiated once v1 is stable and evidenced
- Operational funding to be sought from sector funders once the app is established (A20)
- CIC scope to consider whether Grant Pathway is the sole asset or part of a wider basket of tools (DR-OD-001)

---

## FP-04 — Satisfaction Survey & Feedback Framework

**Decision records:** DR-SM-001, DR-SM-002
**Status:** To be confirmed post-launch

Formal satisfaction measurement and advanced impact metrics are deferred from v1. In v1:

- Basic passive usage metrics only (registrations, applications created, returning users) — DR-SM-001
- Users who opt in at registration will be invited to a feedback interview — DR-SM-002

A more structured feedback and survey framework will be planned once a meaningful user base exists. This may be accelerated if required by funders or partner organisations.

---

## FP-05 — Independent Accessibility Audit

**Decision record:** DR-LC-003
**Status:** To be confirmed pre-scaling

WCAG 2.2 Level AA compliance is a design-in requirement for v1 and will be verified through internal testing (see non-functional-requirements.md, NFR-06). An independent third-party accessibility audit is deferred to a pre-scaling milestone.

This item should be triggered before Grant Pathway scales significantly beyond its early user base, or before any formal partnership or endorsement arrangement is entered into.

---

## FP-06 — Liability Insurance Review

**Decision record:** DR-LC-002
**Status:** To be confirmed when CIC is established

Liability insurance appropriate for the CIC's activities will be reviewed and obtained when the CIC is established (FP-03). This is a last-resort consideration — the Terms of Service clearly state that Grant Pathway does not guarantee funding outcomes, does not submit applications on behalf of charities, and makes no representations to funders.

---

---

## FP-07 — OSCR (Scotland) and CCNI (Northern Ireland) Register Lookup

**Decision record:** BD-02
**Status:** Planned before general release

The v1 build integrates the Charity Commission for England and Wales only. Charities registered in Scotland (OSCR — approximately 24,000 charities) and Northern Ireland (CCNI — approximately 7,000 charities) use manual profile entry in v1 and have full access to the application workflow.

OSCR and CCNI publish their own public registers with separate APIs. Integrating these before general release ensures that charities across the whole of the UK benefit from the same seamless register-lookup experience at profile setup. This should be scoped as a pre-launch task in the implementation plan.

---

## FP-08 — Full Question-Level Typing Implementation

**Decision record:** BD-04
**Status:** Planned — pre-launch or early post-launch

Question-level typing (`question_type: narrative | data_entry | financial | dropdown | date | file_upload`) is defined in Mark Two (BD-04) and the data model includes the `question_type` field. Full implementation — where the AI reliably classifies every extracted question by type and the Step 4 interface renders each type appropriately — is an iterative improvement. In early v1, non-narrative types may be partially handled (as reminders or excluded from the writing interface). Full pre-fill from the charity profile for data-entry and financial types, and accurate classification of dropdown/date/file_upload types, should be completed before general release or in an early post-launch release.

---

## FP-09 — Thick Profile Completeness-Driven Pre-fill for All Funder Tiers

**Decision record:** BD-02, BD-07
**Status:** Planned — iterative post-launch

The thick charity profile (BD-02) includes financial fields, contact details, and supporting document status that can pre-fill non-narrative questions across Tier 1 and Tier 2 funders. The completeness indicator on the new application screen (showing which profile fields are missing and which funder questions cannot be pre-filled) will be refined iteratively as more funders are added and the pre-fill mapping between profile fields and funder question types is validated.

---

## FP-10 — Streaming AI Responses

**Decision record:** ADR-AI-010
**Status:** Deferred post-v1

All AI-calling code paths (`/api/generate-summary`, `/api/refine-answer`, and the charity paraphrase step in `actions/charity.ts`) use batch mode: the full response is generated server-side before being returned to the client. This was the correct choice for v1 — streaming requires a design change to the user interface (replacing the current determinate progress bar with an incremental text rendering pattern) and adds complexity to error handling and partial-response recovery.

Streaming would improve perceived responsiveness for large guideline documents where summary generation takes 30–45 seconds. This should be evaluated once the v1 user base provides real latency data from Sentry performance monitoring (P5.4+).

Pre-requisites before scoping streaming:

- Sentry performance baseline established (P5.4)
- Real-world latency distribution measured across funder types
- UX design for incremental text rendering agreed

---

## FP-11 — Rich-Text Formatting in Answer Fields

**Decision record:** WJ, 2026-08-06 (no DR raised — see below)
**Status:** Deferred. Revisit only if evidence appears that users are routinely submitting via downloadable Word forms.

Every answer field in Step 4 is a plain `<Textarea>` holding plain text. There is no bold, italic, bulleted or numbered list support. This was raised on 2026-08-06 after WJ's wife completed a real Stony Stratford Town Council application and hand-formatted a 215-word answer using blank lines and hyphen bullets — the only formatting tools available to her.

**Two separate things came out of that, and they must not be conflated.** The Word export was discarding her line breaks entirely; that is a defect, `GAP-41`, and is being fixed on its own terms. Rich text is the different, larger question of whether the fields should offer real formatting controls at all.

**Deferred, on WJ's reasoning (2026-08-06):** most charity workers transfer these answers into the funder's own web portal, where any rich formatting is stripped on paste regardless of what the service produced. Rich text is therefore only genuinely valuable in the narrower case where the funder still requires a downloadable Word or PDF form — real, but not the common path, and not demonstrated as a demand. Fixing `GAP-41` already delivers line breaks, blank lines and hyphen bullets, which survive a portal paste and cover what the applicant actually reached for.

**What building it would involve, recorded so the cost is not re-derived:** an editor component; a storage format (sanitised HTML or markdown) and a migration of `application_items.answer_text`; XSS sanitisation on stored markup; word and character counting that ignores markup, against the existing limit logic (`PDR-AI-006`, `PDR-AI-012`); preview rendering; docx mapping to real bold runs and real numbering rather than literal characters; graceful degradation in the `format=txt` export; refine prompts that preserve markup on the AI round-trip; and a fresh keyboard/screen-reader pass under `ADR-OPS-006` for a new interactive control.

**Scope note:** "all fields" means all _narrative_ fields. The two governance cards (total annual expenditure, reserves) are single `£` numeric inputs, and the yes/no governance items are dropdowns — formatting does not apply. The budget _narrative_ field (e.g. §5a expenditure details) is an ordinary `Textarea` and would be in scope.

**No DR was raised.** Nothing in any ADR, PDR or requirement document promises rich-text editing, so there is no decision being reversed — this records a considered "not now" and the reasoning behind it, so the question is not re-opened from scratch.

**Trigger to revisit:** user feedback showing repeated submission via downloadable Word/PDF forms rather than portals, or a funder in `target-funder-list.md` requiring formatted submission.

---

## Checklist Coverage

| Checklist Item | Description                                | Status           |
| -------------- | ------------------------------------------ | ---------------- |
| Item 48        | Grant discovery phase                      | Covered by FP-01 |
| Item 49        | 360Giving integration                      | Covered by FP-02 |
| Item 50        | CIC formation                              | Covered by FP-03 |
| Item 51        | Satisfaction survey and feedback framework | Covered by FP-04 |
| Item 52        | Independent accessibility audit            | Covered by FP-05 |
| Item 53        | Liability insurance review                 | Covered by FP-06 |

---

_Last updated: 2026-08-06 (FP-11 added — rich-text formatting in answer fields, deferred by WJ)_
_Sources: BRD Information Gathering Checklist items 48–53; DR-PS-002, DR-IN-002, DR-OD-001, DR-SM-001, DR-SM-002, DR-LC-003, DR-LC-002; v1-out-of-scope.md; BRD Mark Two BD-02, BD-04, BD-07_
