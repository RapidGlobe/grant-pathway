# Out of Scope — v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any item is confirmed out of scope or scope boundary changes

The following are explicitly **not in scope** for version 1 of Grant Pathway. Each item is either deferred to a future phase or excluded permanently. Where a future phase is planned, the relevant decision record is referenced.

---

## Grant Discovery

The app does not help charities find or search for grants. Users are expected to have already identified the grant they wish to apply for before using the app. Grant discovery is deferred to a future phase and is the intended v2 capability. _(DR-PS-002)_

## Grant Eligibility Matching

The app does not assess or predict whether a charity is likely to be eligible for a given grant. This capability depends on a grant database and is deferred alongside discovery. _(DR-AI-001, DR-PS-002)_

## Grant Tracking and Pipeline Management

The app does not provide deadline tracking, application status management, or a grant pipeline dashboard. Charities requiring these features should use existing tools (e.g. Trello, Notion, Asana). _(DR-PS-001)_

## Post-Grant Impact Reporting

The app does not assist charities in producing post-award impact reports or funder updates. This may be considered in a future phase. _(DR-PS-001)_

## EU and International Grants

The app is designed exclusively for UK grant applications. EU programmes (e.g. Horizon Europe) and international funders (e.g. USAID, UN funds) are out of scope. _(DR-PS-003)_

## Live Grant Database

The app does not maintain, display, or search a database of available grant opportunities. No integration with 360Giving, GrantNav, Funding Central, or any other grant data source is included in v1. _(DR-IN-002, DR-GK-001, DR-GK-002, DR-GK-003)_

## CRM and Accounting Integrations

The app does not integrate with charity CRM systems (e.g. Salesforce Nonprofit, Beacon) or accounting software (e.g. Xero, QuickBooks). All charity information is entered manually. _(DR-IN-001)_

## Open-Ended AI Chat

The app does not provide a free-form conversational AI interface. All AI interactions are structured and form-driven. _(DR-AI-001, DR-TU-003)_

## Automated AI Output Validation

The app does not automatically cross-reference or fact-check AI-generated content against source documents. Human review is the sole validation mechanism in v1. Automated validation is a future enhancement. _(DR-AI-003)_

## Mobile Application

The app is a web application only. A dedicated native mobile app (iOS or Android) is not in scope for v1. The web application will be designed to be responsive and usable on mobile browsers.

## Multi-Region Data Hosting

Charities cannot select their preferred data hosting region. All data is hosted in UK-region infrastructure. User-selectable data regions are not in scope for v1. _(DR-DP-002)_

## Full Document Store

The app does not store uploaded funder documents, supplementary files, or attachments. Only the charity profile and application history (text content) are stored. _(DR-DP-001)_

## Native Funder Document/Portal Output

The app does not fill a funder's own native Word template or portal application fields. Grant Pathway always produces a generic Word/text export the charity copies from — it never attempts to correctly reproduce an arbitrary, funder-specific document format or submit directly into a funder's portal. This is consistent with the founding "preparation tool, not a submission platform" boundary (BD-01). Declared permanently out of scope 2026-07-11, not deferred to a future phase — the engineering cost of correctly parsing and populating an unbounded variety of funder-specific formats was judged disproportionate given the diversity of funder form methods. _(R9, `ADR-DATA-006`)_

## Funder Coverage Tier Display

A per-funder "Tier 1/2/3" or "Full/Partial/Guidance" coverage badge, originally proposed 2026-05-29 (BD-07, FR-46). Withdrawn 2026-07-11 — never built, and the underlying premise (coverage level as a fixed property of a funder) was disproven: the same funder's actual support level varies by which specific guidelines document is uploaded, not by funder identity, per the finding that also led to retiring the "Structured/Narrative" picker badge (`DR-FD-001` v1.0 → v1.2). Charities are no worse off, since no such display has ever existed. If a coverage signal is wanted in future, it would need to be derived per-application from that upload's Step 3 AI summary, not pre-assigned per funder — a different, unscoped feature. _(BD-07, FR-46)_

**Reconciled 2026-07-13 with P6.6 (Transparency Status, `IMPLEMENTATION-PLAN.md`):** this withdrawal was not cross-checked at the time against `ADR-DATA-006`'s own transparency consequence, specified six days earlier, which reads as the same funder-level premise. P6.6 does **not** reintroduce it: its support-status field is scoped to the specific approved playbook (pinned to a curated guideline version), not to the funder as a standalone identity — a funder with no matching approved playbook falls back to unreviewed/live-extraction status rather than any pre-assigned badge. See `ADR-DATA-006`'s matching 2026-07-13 amendment.

**Amendment (2026-07-14) — P6.6 itself has since been retired, not just reconciled.** P6.5's pivot to private, per-charity reuse (no curator role) removed the only thing P6.6's status could have been scoped to. With no curation step anywhere in the product, every funder is in the identical unreviewed state, so there is no per-funder coverage signal left to show under any name — reconciliation is now moot. `IMPLEMENTATION-PLAN.md`'s P6.6 section and `ADR-DATA-006`'s 2026-07-14 (later same day) amendment are the current record.

## Formal Feedback and Survey Infrastructure

In-app satisfaction surveys, NPS scoring, and formal feedback dashboards are not included in v1. Charity feedback will be gathered through direct user interviews. _(DR-SM-001, DR-SM-002)_

## CIC Formation

The Community Interest Company structure intended as the long-term owner of the app will not be established before or during v1. Individual ownership applies at launch. _(DR-OD-001)_

## Liability Insurance

Professional indemnity or product liability insurance is not in place for v1. This will be reviewed when the CIC is established and usage has grown. _(DR-LC-002)_

## Independent Accessibility Audit

A formal third-party accessibility audit is not required before v1 launch. The app will be built to WCAG 2.2 AA from the outset, with an independent audit deferred to a pre-scaling milestone. _(DR-LC-003)_

---

_Last updated: 2026-07-13_
_Derived from decision records DR-PS-001 through DR-BM-003, plus ADR-DATA-006 (2026-07-11 addition, 2026-07-13 reconciliation note)_
