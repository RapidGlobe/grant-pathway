---
id: PDR-FS-001
category: Feature Scope
status: Pending
---

# PDR-FS-001 — MoSCoW Feature Prioritisation

## Question

Which of the 44 functional requirements (FR-01 to FR-44) from the BRD are Must Have, Should Have, Could Have, and Won't Have for v1?

## Context

The BRD defines 44 functional requirements across 9 categories. Not all of them need to be built on day one to deliver a usable, valuable product. Formally prioritising them using the MoSCoW method (Must Have, Should Have, Could Have, Won't Have) ensures the build focuses on the features that matter most, reduces risk of scope creep, and gives a clear definition of the v1 MVP. This decision will directly drive the feature list in the PRD.

## Options

- **Option A — Strict MVP:** Minimise Must Haves, push as much as possible to Should Have or Could Have. Fastest path to launch.
- **Option B — Build Everything:** Treat all 44 requirements as Must Have. Complete at launch but high risk of missing the July 2026 deadline.
- **Option C — Balanced Prioritisation:** Identify a clear Must Have core that delivers a complete, safe, compliant user journey. Formally designate the remainder as Should Have or Could Have.

## Decision

**Option C — Balanced Prioritisation**, with the following breakdown:

### Must Have (39 requirements)

FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25, FR-26, FR-27, FR-28, FR-29, FR-30, FR-31, FR-32, FR-33, FR-34, FR-35, FR-36, FR-37, FR-39, FR-40, FR-41, FR-42, FR-43

### Should Have (2 requirements)

FR-08 — Feedback interview opt-in at registration
FR-44 — Confirmation email after account deletion

### Could Have (2 requirements)

FR-07 — Optional MFA
FR-38 — Plain text export (.txt) _(Word export covers the primary need; plain text useful only for edge cases)_

### Won't Have

None — all 44 requirements remain within v1 scope at some priority level.

## Rationale

Option C gives a realistic build order for a solo developer on a fixed deadline without compromising on legal, compliance, or core user experience requirements. Legal and GDPR-related requirements (FR-06, FR-22, FR-40 to FR-43) are Must Have regardless of timeline. The mandatory review flow (FR-32 to FR-34, FR-36) is non-negotiable given the product's liability position (DR-LC-002). FR-19, FR-23, FR-29, FR-31, and FR-35 were moved from Should Have to Must Have on the basis that each addresses a real moment where a user could lose confidence in the tool and all carry low build effort. FR-38 (plain text export) remains Could Have as Word export covers the primary use case.

## Date Decided

2026-04-16
