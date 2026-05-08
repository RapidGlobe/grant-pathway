---
id: DR-IN-002
category: Integrations
status: Decided
---

# DR-IN-002 — Live Grant Data from External Sources

## Question

Will the app pull live grant data from external databases or funder sources?

## Context

For a grant discovery feature (see DR-PS-002), the app needs a source of grant opportunities. Options include integrating with existing UK grant databases (e.g. 360Giving's GrantNav, Funding Central, Charity Excellence Framework) or building and maintaining a proprietary database. Live data feeds keep the grant list current but create a dependency on third-party APIs and their reliability. A static or manually curated database is more controllable but may go out of date. This decision is only critical if grant discovery is in scope.

## Options

- **Option A: No live data — manual curation** — A team manually maintains a curated list of grants; no external API dependency
- **Option B: 360Giving / GrantNav integration** — Pull from the open 360Giving data standard, which covers many UK grant-makers
- **Option C: Funding Central or similar** — Integrate with an existing grant search service via API or data partnership
- **Option D: Web scraping** — Automatically scrape funder websites for current grant opportunities (higher maintenance, legal risk)
- **Option E: Hybrid** — Combine a curated list with one or more live data feeds

## Decision

**Option A: No live grant data in v1** — The app will not pull from any external grant database in v1. When grant discovery is built in a future phase (see DR-PS-002), 360Giving/GrantNav is the preferred starting point given its open data ethos and sector credibility.

## Rationale

Grant discovery is deferred to a future phase (DR-PS-002), so no external grant data source is needed for v1. The writing and summarisation capabilities work entirely from information provided directly by the charity and funder. Keeping v1 free of external data dependencies reduces build complexity, eliminates third-party API risk, and allows focus on delivering the core writing tool well. 360Giving is noted as the preferred future integration to avoid revisiting this decision from scratch.

## Date Decided

2026-04-09
