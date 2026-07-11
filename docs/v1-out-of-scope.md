# Out of Scope — v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any item is confirmed out of scope or scope boundary changes

The following are explicitly **not in scope** for version 1 of the AI Grant Accelerator. Each item is either deferred to a future phase or excluded permanently. Where a future phase is planned, the relevant decision record is referenced.

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

## Formal Feedback and Survey Infrastructure

In-app satisfaction surveys, NPS scoring, and formal feedback dashboards are not included in v1. Charity feedback will be gathered through direct user interviews. _(DR-SM-001, DR-SM-002)_

## CIC Formation

The Community Interest Company structure intended as the long-term owner of the app will not be established before or during v1. Individual ownership applies at launch. _(DR-OD-001)_

## Liability Insurance

Professional indemnity or product liability insurance is not in place for v1. This will be reviewed when the CIC is established and usage has grown. _(DR-LC-002)_

## Independent Accessibility Audit

A formal third-party accessibility audit is not required before v1 launch. The app will be built to WCAG 2.2 AA from the outset, with an independent audit deferred to a pre-scaling milestone. _(DR-LC-003)_

---

_Last updated: 2026-07-11_
_Derived from decision records DR-PS-001 through DR-BM-003, plus ADR-DATA-006 (2026-07-11 addition)_
