---
id: DDR-IP-001
category: Interaction Pattern
status: Decided
---

# DDR-IP-001 — Approve Application Confirmation Pattern

## Question

How should the confirmation step for the "Approve my application" action be presented?

## Context

On Step 5 of the application flow, the user clicks "Approve my application" to set the application status to `approved` and unlock the export button. This is a significant action -- once approved, the status changes and the export option becomes available. Per the application status model, approving and then re-opening an application resets all `is_approved` flags on answers and reverts the status to `in_progress`, so the user can always reverse the approval -- but they should not do so accidentally.

The screen requirements specify a confirmation prompt with the message: "Are you sure you want to approve this application? You can re-open it to make changes at any time." The form of that confirmation (modal, inline, etc.) is not specified.

Note: PDR-UI-006 established that API error messages should not use modal popups. That principle was specifically about error states (which interrupt flow unexpectedly). A user-initiated confirmation is a different interaction and may justify different treatment -- but consistency across the product is a design quality consideration.

A separate, lower-stakes confirmation also exists: deleting an application from the dashboard. This decision should address both levels.

## Options

**For the Approve application confirmation:**
- **Option A -- Modal dialog:** A popup dialog overlays the screen with the confirmation message, a confirm button (teal), and a cancel button. High visibility; clearly interrupts to make the user pause. Consistent with how many web applications handle significant confirmations. Note: PDR-UI-006 discourages modals for errors but does not prohibit them for confirmations.
- **Option B -- Inline expansion:** The approve button area expands in place to reveal the confirmation message and a "Yes, approve" / "Cancel" button pair. The user never leaves the page and no overlay appears. Lower friction; feels native to the page.
- **Option C -- Confirmation banner:** A teal or amber banner appears at the top of the Step 5 content area with the confirmation message and action buttons. Less intrusive than a modal but clearly requires attention.

**For the Delete application confirmation (dashboard):**
- **Option D -- Inline card expansion:** The application card expands to show a "Are you sure? This cannot be undone." message with Delete and Cancel buttons. Keeps context visible.
- **Option E -- Modal dialog:** Same modal approach as Option A, applied to deletion. Consistent pattern if Option A is chosen above.
- **Option F -- Tooltip-style popover:** A small popover appears anchored to the Delete button with a compact confirmation. Low visual weight; may be too easy to accidentally confirm.

## Decision

**Approve application: Option A -- modal dialog.**
**Delete application: Option E -- modal dialog.**

### Approve application confirmation (Step 5)

A modal dialog appears when the user clicks "Approve my application". The modal interrupts the flow deliberately — the approve action is consequential (it unlocks export, and if the user has already submitted a previous export to a funder, re-approving and re-exporting creates a duplicate submission risk). An inline expansion risks being overlooked; a modal ensures the user actively acknowledges the confirmation before proceeding.

This also gives the product a consistent pattern: every consequential action (approve, re-open, re-export, delete) uses a modal dialog.

Note: PDR-UI-006 discourages modals for *unexpected* interruptions (errors). A user-initiated confirmation is not unexpected — the user clicked a button — so this does not conflict with that principle.

| Element | Detail |
|---------|--------|
| Trigger | User clicks "Approve my application" (teal primary button) |
| Behaviour | Modal dialog overlays the page |
| Confirmation message | "Are you sure you want to approve this application? You can re-open it to make changes at any time." |
| Confirm button | "Approve my application" -- teal primary |
| Cancel button | "Cancel" -- ghost/text (escape action per DDR-CS-003) |
| Colour treatment | Teal/slate -- constructive action, not a warning |

### Delete application confirmation (dashboard)

A modal dialog appears when the user clicks the Delete text link on an application card.

| Element | Detail |
|---------|--------|
| Trigger | User clicks Delete red text link on an application card |
| Behaviour | Modal dialog overlays the page |
| Confirmation message | "Are you sure you want to delete [Grant Name] -- [Funder Name]? This cannot be undone." |
| Confirm button | "Delete application" -- red fill (#DC2626, Level 2 per DDR-CS-003) |
| Cancel button | "Cancel" -- ghost/text |

### Out of scope for this decision
Account deletion (Screen 9) uses the separate DELETE-typing confirmation mechanism defined in screen-requirements.md and is not affected by this decision.

## Date Decided

2026-04-17 (revised 2026-05-18)

---

*Status: Decided*
*Created: 2026-04-17*
*Revised: 2026-05-18 — Approve confirmation changed from inline expansion (Option B) to modal dialog (Option A). Confirm button text set to "Approve my application". Rationale: modal ensures the user actively acknowledges a consequential action; consistent with all other confirmation patterns in the product.*
