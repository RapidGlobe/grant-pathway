---
id: DR-IN-001
category: Integrations
status: Decided
---

# DR-IN-001 — Integration with Existing Charity Tools

## Question

Will the app integrate with existing tools that charities already use?

## Context

Many charities use CRM systems (Salesforce, Beacon), accounting software (Xero, QuickBooks), or the Charity Commission's public register. Integrating with these tools could reduce duplicate data entry and make the app more valuable, but integrations add significant build complexity and maintenance burden. For v1, integrations may not be essential — charities could manually input the information needed. This decision affects the technical architecture and should consider the tools most commonly used by the target charity size (see DR-TU-002).

## Options

- **Option A: No integrations in v1** — The app is standalone; charities enter all information manually; integrations considered for a future phase
- **Option B: Charity Commission register integration** — Pull basic charity data (name, registered number, objects) from the public Charity Commission API to reduce data entry
- **Option C: CRM integration** — Integrate with one or more common charity CRMs (e.g. Salesforce Nonprofit, Beacon)
- **Option D: Accounting software integration** — Integrate with Xero or similar to pull financial data for application budget sections
- **Option E: Multiple integrations from day one** — Build an integration layer supporting several tools at launch

## Decision

**Option B: Charity Commission register integration only** — The app will integrate with the Charity Commission for England and Wales public API to pre-populate basic charity data at onboarding. OSCR (Scotland) and CCNI (Northern Ireland) equivalents to be added incrementally. All other integrations are deferred to future phases.

## Rationale

The Charity Commission API is free, public, and requires no authentication — making it a low-effort, high-value integration. Pre-populating charity name, registered number, charitable objects, and income band reduces onboarding friction and creates a positive first impression for time-poor volunteers. It also provides light validation that the user represents a registered UK charity. CRM and accounting integrations are deferred as the primary target audience (small charities) largely does not use these tools, and the build complexity is not justified for v1.

## Date Decided

2026-04-09
