---
id: DR-BM-003
category: Build & Maintenance
status: Decided
---

# DR-BM-003 — Open Source vs. Closed Source

## Question

Will the app be open source or closed source?

## Context

Open sourcing the app allows the sector to inspect the code, contribute improvements, fork it if needed, and trust that there is no hidden data processing. It aligns with the ethos of a donated tool and supports the succession plan (DR-BM-002). However, open source means the codebase is publicly visible, which may surface security vulnerabilities if not managed carefully. It also means anyone can copy and commercialise the work. Closed source is simpler to manage but limits transparency and community contribution. A middle path (open-core or source-available) is also possible.

## Options

- **Option A: Fully open source** — The entire codebase is publicly available under an open-source licence (e.g. MIT, Apache 2.0, AGPL)
- **Option B: Open source with a non-commercial licence** — Code is public but commercial use is restricted (e.g. Creative Commons NC, BSL)
- **Option C: Closed source** — The codebase is private; charities access the app as a hosted service only
- **Option D: Open-core** — Core functionality is open source; any advanced or hosted features are closed
- **Option E: Source-available** — Code is viewable for transparency and audit purposes but not formally open-source licensed

## Decision

**Option A: Fully open source under the MIT Licence** — The entire codebase will be publicly available under the MIT Licence. No secrets, credentials, or sensitive configuration will ever be committed to the repository.

## Rationale

Every decision made across this set points to open source. The succession plan (DR-BM-002) depends on a public, documented codebase. The CIC model (DR-OD-001) is built on transparency and community benefit. The donation ethos (DR-OD-002, DR-OD-003) means there is no commercial value to protect. The MIT Licence is chosen for its simplicity — it is the most widely understood open-source licence, requires only that the licence notice is retained in copies, and is trusted by both developers and non-technical stakeholders in the charity sector. Commercial exploitation of the codebase is not a significant concern given the tool's nature and audience.

## Date Decided

2026-04-09
