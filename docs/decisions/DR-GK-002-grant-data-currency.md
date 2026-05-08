---
id: DR-GK-002
category: Grant Knowledge Base
status: Deferred
---

# DR-GK-002 — Keeping Grant Data Up to Date

## Question

How will the grant database be kept current?

## Context

Grant programmes open and close, deadlines change, eligibility criteria are updated, and funders change priorities. Stale grant data is worse than no data — it wastes charity time and damages trust in the app. The update process must be sustainable given the resource constraints of the team maintaining it. Automated approaches (scraping, API polling) can run continuously but require technical maintenance. Manual processes are more reliable for accuracy but do not scale. The right approach depends on the size of the grant database and available resources.

## Options

- **Option A: Automated data refresh via API** — Grant data is refreshed automatically from integrated external sources on a scheduled basis
- **Option B: Manual review on a fixed schedule** — A team reviews and updates the database weekly, monthly, or quarterly
- **Option C: User-reported updates** — Charities flag out-of-date information; a moderator reviews and applies changes
- **Option D: Funder partnership** — Funders are invited to maintain their own listings directly in the app
- **Option E: Combination** — Automated refresh for high-volume sources, manual review for smaller funders

## Decision

**Deferred — not applicable to v1.** To be decided when grant discovery is scoped as a future phase (see DR-PS-002).

## Rationale

No grant database exists in v1, so there is nothing to keep current. This decision depends on the source chosen in DR-GK-001 and will be made alongside it when the discovery phase is planned.

## Date Decided

_Deferred — to be revisited when discovery phase is planned._
