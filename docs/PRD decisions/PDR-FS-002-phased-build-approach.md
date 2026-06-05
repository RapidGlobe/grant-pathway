---
id: PDR-FS-002
category: Feature Scope
status: Pending
---

# PDR-FS-002 — Phased Build Approach

## Question

Will v1 be built and released as a single delivery, or broken into smaller internal phases (e.g. authentication and profile first, then AI features)?

## Context

A phased build approach means delivering working software in stages — for example, building and testing the registration, login, and charity profile screens first before moving on to the AI features. This reduces risk by allowing early testing of each layer before the next is built on top. A single delivery means building everything before anything is released. Given the solo developer constraint (C4) and the July 2026 deadline (C2), the build approach has significant implications for timeline and risk management.

## Options

- **Option A — Single Delivery:** Build all 39 Must Have requirements before anything is released. One launch on 31 July 2026.
- **Option B — Phased Internal Build, Single Public Launch:** Break the build into logical internal phases with a single public launch once all Must Haves are complete.
- **Option C — Phased Public Releases:** Release each phase publicly as it is completed.

## Decision

**Option B — Phased Internal Build, Single Public Launch.**

The build will be broken into five internal phases:

| Phase   | Focus                  | Requirements                                                                                               |
| ------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Phase 1 | Foundation             | Authentication, registration, email verification, charity profile, Charity Commission API (FR-01 to FR-14) |
| Phase 2 | Application management | Dashboard, create/save/continue/delete applications (FR-15 to FR-20)                                       |
| Phase 3 | AI features            | Guideline input, summarisation, draft generation, review, approval, export (FR-21 to FR-39)                |
| Phase 4 | Account management     | Deletion, data removal, confirmation (FR-40 to FR-43)                                                      |
| Phase 5 | Should Haves           | FR-08 and FR-44 if time allows before launch                                                               |

Each phase produces working, testable software. The product launches publicly only once all Must Have requirements across all phases are complete.

## Rationale

Option B reduces delivery risk significantly for a solo developer on a fixed deadline. Building in phases means problems are caught early before they compound. Each phase can be tested independently, accessibility checks happen incrementally, and natural milestones maintain momentum. Grant Pathway's value only becomes apparent once the AI features are present, making partial public releases unsuitable — a single complete launch protects first impressions and user trust.

## Date Decided

2026-04-16
