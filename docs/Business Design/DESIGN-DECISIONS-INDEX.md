# Design Decisions Index -- Grant Pathway v1

This index lists all design decision records for Grant Pathway v1. These decisions must be resolved before the design requirements document is finalised and before the HTML/CSS mockup variants are approved for development.

Decisions are grouped by category and should be worked through in the order shown -- foundational decisions (Visual Identity, Layout & Structure) constrain the options available in later categories.

---

## Status Summary

| Status  | Count |
| ------- | ----- |
| Decided | 15    |
| Pending | 0     |
| Total   | 15    |

---

## A -- Visual Identity

| ID         | Title      | Status  |
| ---------- | ---------- | ------- |
| DDR-VI-001 | Logo Asset | Decided |
| DDR-VI-002 | Favicon    | Decided |

**Recommended order:** Resolve DDR-VI-001 first. DDR-VI-002 options depend on whether a standalone icon exists (DDR-VI-001 Option B or C).

---

## B -- Layout & Structure

| ID         | Title                   | Status  |
| ---------- | ----------------------- | ------- |
| DDR-LA-001 | Application Flow Layout | Decided |
| DDR-LA-002 | Review Prompt Placement | Decided |

**Recommended order:** Resolve DDR-LA-001 before DDR-LA-002. The placement options available for review prompts (DDR-LA-002) depend on whether a two-column layout is used (DDR-LA-001).

---

## C -- Visual Direction

| ID         | Title                         | Status  |
| ---------- | ----------------------------- | ------- |
| DDR-VD-001 | Design Directions for Mockups | Decided |

**Note:** This decision selects the three design directions that the HTML/CSS mockup variants will explore. All component style decisions (Section D) can then be resolved per variant rather than as a single answer.

---

## D -- Component Style

| ID         | Title                                   | Status  |
| ---------- | --------------------------------------- | ------- |
| DDR-CS-001 | Border Radius                           | Decided |
| DDR-CS-002 | Card Design                             | Decided |
| DDR-CS-003 | Secondary and Destructive Button Styles | Decided |
| DDR-CS-004 | Step Indicator Visual Design            | Decided |
| DDR-CS-005 | Loading State During AI Generation      | Decided |
| DDR-CS-006 | Empty State Treatment                   | Decided |
| DDR-CS-007 | Mobile Viewport Banner                  | Decided |

**Note:** DDR-CS-004 (step indicator) is related to DDR-LA-001. A vertical sidebar stepper (Option E in DDR-CS-004) is only viable if a sidebar layout is chosen in DDR-LA-001.

---

## E -- Interaction Patterns

| ID         | Title                                    | Status  |
| ---------- | ---------------------------------------- | ------- |
| DDR-IP-001 | Approve Application Confirmation Pattern | Decided |
| DDR-IP-002 | Success Message Style and Placement      | Decided |

---

## F -- Accessibility Design

| ID         | Title                 | Status  |
| ---------- | --------------------- | ------- |
| DDR-AC-001 | Focus Indicator Style | Decided |

---

## Related Documents

| Document                                            | Location                                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| App Name & Branding (colours, fonts, tone of voice) | `docs/app-name-and-branding.md`                                                                    |
| Information Architecture & Navigation               | `docs/information-architecture-and-navigation.md`                                                  |
| Screen Specifications (all 11 screens)              | `docs/PRD-Grant-Pathway.md` (Section 7 -- previously `screen-requirements.md`, retired 2026-07-13) |
| UI Component Library Decision (shadcn/ui)           | `docs/PRD decisions/PDR-UI-001-ui-component-library.md`                                            |
| Design-First Approach Decision                      | `docs/PRD decisions/PDR-UI-002-design-first-or-code-first.md`                                      |
| Desktop-Primary Decision                            | `docs/PRD decisions/PDR-UI-003-mobile-first-or-desktop-first.md`                                   |
| Navigation Structure Decision                       | `docs/PRD decisions/PDR-UI-004-navigation-structure.md`                                            |
| Dashboard Design Decision                           | `docs/PRD decisions/PDR-UI-005-dashboard-design.md`                                                |
| API Failure UX Decision                             | `docs/PRD decisions/PDR-UI-006-api-failure-user-experience.md`                                     |
| Non-Functional Requirements (WCAG 2.2 AA)           | `docs/non-functional-requirements.md`                                                              |

---

_Last updated: 2026-08-13_
_Status: 15 of 15 decisions resolved_
