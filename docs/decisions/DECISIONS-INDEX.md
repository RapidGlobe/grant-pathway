# Decision Records Index — AI Grant Accelerator

This index lists all business and idea-level decisions that must be made before building the Business Requirements Document (BRD). Each record contains exactly one question to be answered.

**Status key:** `Pending` · `Decided` · `Deferred` · `Revised`

---

## Purpose & Scope

| ID | Question | Status |
|----|----------|--------|
| [DR-PS-001](DR-PS-001-pain-points.md) | What specific grant application pain points will the app solve? | Decided ✓ |
| [DR-PS-002](DR-PS-002-discovery-vs-writing.md) | Will the app be primarily a grant discovery tool, a grant writing tool, or both? | Decided ✓ |
| [DR-PS-003](DR-PS-003-geographic-scope.md) | Will the app support UK-only grants, or also EU and international grants? | Decided ✓ |

---

## Target Users

| ID | Question | Status |
|----|----------|--------|
| [DR-TU-001](DR-TU-001-primary-users.md) | Who is the primary user of the app within a charity? | Decided ✓ |
| [DR-TU-002](DR-TU-002-charity-size.md) | What size of charity is the primary target for the app? | Decided ✓ |
| [DR-TU-003](DR-TU-003-technical-literacy.md) | What level of technical literacy should the app be designed for? | Decided ✓ |

---

## Ownership & Distribution

| ID | Question | Status |
|----|----------|--------|
| [DR-OD-001](DR-OD-001-long-term-ownership.md) | Who will own and operate the app long-term? | Decided ✓ |
| [DR-OD-002](DR-OD-002-access-model.md) | How will charities access the app — and will they pay for it? | Decided ✓ |
| [DR-OD-003](DR-OD-003-donation-recipient.md) | Will the app be donated to one specific charity, or made available to the charity sector as a whole? | Decided ✓ |

---

## AI Strategy

| ID | Question | Status |
|----|----------|--------|
| [DR-AI-001](DR-AI-001-ai-capabilities.md) | Which AI capabilities will the app provide? | Decided ✓ |
| [DR-AI-002](DR-AI-002-ai-provider.md) | Which AI provider or providers will power the app? | Revised ↺ 2026-05-07 |
| [DR-AI-003](DR-AI-003-output-validation.md) | How will AI-generated content be validated before a charity submits a grant application? | Decided ✓ |

---

## Data & Privacy

| ID | Question | Status |
|----|----------|--------|
| [DR-DP-001](DR-DP-001-data-stored.md) | What data will the app store about charities and their grant applications? | Decided ✓ |
| [DR-DP-002](DR-DP-002-data-hosting.md) | Where will the app's data be hosted, and must it remain within the UK? | Revised ↺ 2026-05-07 |
| [DR-DP-003](DR-DP-003-data-ownership.md) | Who owns the data charities input into the app, and can it be used to train AI models? | Revised ↺ 2026-05-07 |

---

## Integrations

| ID | Question | Status |
|----|----------|--------|
| [DR-IN-001](DR-IN-001-tool-integrations.md) | Will the app integrate with existing tools that charities already use? | Decided ✓ |
| [DR-IN-002](DR-IN-002-live-grant-data.md) | Will the app pull live grant data from external databases or funder sources? | Decided ✓ |

---

## Grant Knowledge Base

| ID | Question | Status |
|----|----------|--------|
| [DR-GK-001](DR-GK-001-grant-data-source.md) | Where will the app's information about available grants come from? | Deferred ⏸ |
| [DR-GK-002](DR-GK-002-grant-data-currency.md) | How will the grant database be kept current? | Deferred ⏸ |
| [DR-GK-003](DR-GK-003-grant-data-maintenance.md) | Who will be responsible for maintaining the grant database? | Deferred ⏸ |

---

## Success Metrics

| ID | Question | Status |
|----|----------|--------|
| [DR-SM-001](DR-SM-001-success-metrics.md) | How will success be measured for the app? | Decided ✓ |
| [DR-SM-002](DR-SM-002-charity-feedback.md) | How will charities provide feedback on the app? | Decided ✓ |

---

## Legal & Compliance

| ID | Question | Status |
|----|----------|--------|
| [DR-LC-001](DR-LC-001-sector-regulations.md) | Does the app need to comply with specific charity sector regulations, and if so, which ones? | Decided ✓ |
| [DR-LC-002](DR-LC-002-ai-liability.md) | What is the liability position if AI-generated content leads to a failed or incorrect grant application? | Decided ✓ |
| [DR-LC-003](DR-LC-003-accessibility.md) | What accessibility standard must the app meet? | Decided ✓ |

---

## Build & Maintenance

| ID | Question | Status |
|----|----------|--------|
| [DR-BM-001](DR-BM-001-who-builds.md) | Who will build and maintain the app? | Decided ✓ |
| [DR-BM-002](DR-BM-002-succession-plan.md) | What happens to the app if the primary maintainer can no longer support it? | Decided ✓ |
| [DR-BM-003](DR-BM-003-open-source.md) | Will the app be open source or closed source? | Decided ✓ |

---

## Funder Directory

| ID | Question | Status |
|----|----------|--------|
| [DR-FD-001](DR-FD-001-funder-directory-model.md) | How should Grant Pathway control which grant-giving organisations end users can create applications for? | Decided ✓ |

---

## Revision History

| Date | Records Revised | Summary |
|------|----------------|---------|
| 2026-05-07 | DR-AI-002, DR-DP-002, DR-DP-003 | AI inference layer changed from Anthropic direct API (US) to Amazon Bedrock Claude Sonnet 4.6 (eu-west-2, In-Region) to achieve UK data residency. EU Geo routing established as operational fallback within 7 EEA regions. Anthropic DPA/SCC requirement removed. No-training commitment unchanged; contractual mechanism updated to AWS Bedrock arrangement. |
| 2026-06-01 | DR-FD-001 (new) | Funder directory and access control model decided. Hybrid curated directory + "Request a Funder" escape hatch adopted. Users select from a DB-seeded approved funder list; unlisted funders can be requested via a simple form. Prevents untested funder combinations entering the system while preserving user experience. |

---

_Total decisions: 29 · Decided: 23 · Revised: 3 · Deferred: 3 · Pending: 0_
