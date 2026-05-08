---
id: DR-TU-002
category: Target Users
status: Decided
---

# DR-TU-002 — Target Charity Size

## Question

What size of charity is the primary target for the app?

## Context

Charity size affects resources, technical capability, existing tooling, and the severity of the grant application burden. Small grassroots charities (income under £100k) often have no dedicated fundraising staff and the most to gain from AI assistance, but the least capacity to adopt new tools. Mid-size charities (£100k–£1m) often have one or two fundraisers and growing complexity. Large charities (£1m+) may have dedicated fundraising teams with existing CRM and grant management tools. The target size shapes feature priority, pricing (if any), onboarding complexity, and integration requirements.

## Options

- **Option A: Small charities** — Income under £100k, typically volunteer-led or minimal staff
- **Option B: Mid-size charities** — Income £100k–£1m, small professional teams
- **Option C: Large charities** — Income over £1m, dedicated fundraising departments
- **Option D: Small and mid-size** — Focus on charities without large dedicated fundraising teams
- **Option E: All sizes** — No restriction on charity size

## Decision

**Option D: Small and mid-size charities** — Charities with income up to approximately £1m are the primary design target. Larger charities are not excluded from using the app, but design and feature trade-off decisions will prioritise the small/mid-size use case.

## Rationale

This is the cohort where the grant application burden is most acute relative to capacity, and it naturally encompasses the volunteer/non-specialist persona from DR-TU-001. The boundary is intentionally framed as a design priority rather than a hard exclusion — larger charities may use the app and benefit from it, but they are not the audience that design decisions are optimised for. This preserves future flexibility to grow upmarket without compromising focus on the highest-need users now.

## Date Decided

2026-04-09
