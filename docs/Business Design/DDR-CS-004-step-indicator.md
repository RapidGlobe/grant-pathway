---
id: DDR-CS-004
category: Component Style
status: Decided
---

# DDR-CS-004 — Step Indicator Visual Design

## Question

How should the five-step progress indicator look in the application flow?

## Context

The step indicator is displayed at the top of every screen in the application flow (Steps 1 to 5). It shows the user where they are in the journey and provides a clear sense of progress. Per the information architecture document, the step indicator is read-only -- users cannot click steps to jump ahead or back.

The five steps are:

1. Application Details
2. Uploaded Guidelines
3. AI Summary
4. Draft Answers
5. Approve & Export

The step indicator must clearly distinguish three states:

- **Completed** -- steps the user has already passed through
- **Current** -- the step the user is on right now
- **Upcoming** -- steps not yet reached

It must also be accessible -- the current and completed states must meet WCAG 2.2 AA contrast requirements and must not rely on colour alone to convey meaning (NFR-06).

## Options

- **Option A -- Numbered circles with connector line:** Five numbered circles (1--5) connected by a horizontal line. The current step circle is teal-filled with white text. Completed steps show a tick icon on teal. Upcoming steps are white with a grey border and grey number. The connector line between completed steps is teal; between upcoming steps it is grey. This is the most common and widely understood step indicator pattern.
- **Option B -- Named steps with progress bar:** Step names displayed as text labels above a horizontal progress bar. The bar fills from left to right as steps are completed. Less explicit about total step count but communicates overall progress clearly. Step labels may truncate on narrower screens.
- **Option C -- Compact pill tabs:** Five small pill-shaped tabs in a row, each showing the step number or a short label. Active pill is teal-filled. Completed pills are softer teal. Upcoming pills are grey. Compact and unobtrusive but may be less immediately clear about linearity to non-technical users.
- **Option D -- Numbered circles (no connector line):** Five numbered circles without a connecting line. Cleaner and more minimal than Option A. The lack of a line reduces the visual metaphor of a journey but keeps the indicator light and uncluttered.
- **Option E -- Vertical sidebar stepper:** Steps listed vertically in a left sidebar, with the current step highlighted. Requires a sidebar layout (relates to DDR-LA-001). Takes up horizontal space but allows longer step labels and additional context per step.

## Decision

**Option A -- Numbered circles with connector line.**

Five numbered circles connected by a horizontal line, displayed across all five steps of the application flow.

| State                      | Visual treatment                               |
| -------------------------- | ---------------------------------------------- |
| Completed                  | Teal fill (#0D6E6E), white tick icon           |
| Current                    | Teal fill (#0D6E6E), white number              |
| Upcoming                   | White fill, grey border (#E2E8F0), grey number |
| Connector line (completed) | Teal (#0D6E6E)                                 |
| Connector line (upcoming)  | Grey (#E2E8F0)                                 |

Step labels (Application Details, Uploaded Guidelines, AI Summary, Draft Answers, Approve & Export) appear below each circle. The indicator is read-only -- no hover state, no pointer events, no click behaviour.

The step indicator sits in a dedicated horizontal band below the navigation bar and above the page heading, consistent across all five steps and all three mockup directions.

## Date Decided

2026-04-17

---

_Status: Decided_
_Related: DDR-LA-001 (application flow layout)_
_Created: 2026-04-17_
