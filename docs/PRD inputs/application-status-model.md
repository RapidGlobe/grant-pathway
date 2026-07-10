# Application Status Model — Grant Pathway v1

This document defines all application statuses, the rules for transitioning between them, and the user-facing behaviour at each status. It is an input to the Product Requirements Document and to screen requirements for the dashboard and application screens.

---

## Statuses

| Status        | Display label | Meaning                                                                                                                                                                                                                                                      |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `not_started` | Not started   | Application record created (funder name and grant name saved) but no guidelines have been added yet                                                                                                                                                          |
| `in_progress` | In progress   | Guidelines added; user is actively working through the flow (AI summary, charity-authored answers with on-request AI assist, review and editing) -- corrected 2026-07-10, previously said "draft generation," a holdover from the abandoned auto-draft model |
| `approved`    | Approved      | User has completed the mandatory review and formally approved all draft answers                                                                                                                                                                              |
| `exported`    | Exported      | Approved content has been exported to a Word document at least once                                                                                                                                                                                          |
| `mismatch`    | Ineligible    | AI detected a clear eligibility mismatch between the charity's profile and the funder's criteria on Step 3 (FR-47); terminal status, no override path (added 2026-07-10 -- this table predates FR-47, added 2026-06-02, and was never updated)               |

---

## Transition Rules

```
not_started  →  in_progress   When the user saves their funder guidelines (upload or paste)
in_progress  →  approved      When the user clicks Approve after reviewing all draft answers
in_progress  →  mismatch      When the AI detects a clear eligibility mismatch on Step 3 and the user
                              acknowledges the warning (added 2026-07-10, FR-47) -- terminal, no transition out
approved     →  exported      When the user downloads the Word document for the first time
approved     →  in_progress   When the user re-opens an approved application for editing (see Re-opening below)
exported     →  in_progress   When the user re-opens an exported application for editing (see Re-opening below)
```

---

## Re-opening an Approved or Exported Application

A user may re-open an application that has been approved or exported — for example, to correct an answer before submitting to a funder.

**Behaviour:**
When a user clicks Edit on an Approved or Exported application, a confirmation prompt is displayed before the application is re-opened. **Corrected 2026-07-10** -- this can be triggered from two places with slightly different wording. From the dashboard card (`components/dashboard-populated.tsx`):

> _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_

From a re-open action on the Step 5 page itself (`components/application-step5-approve.tsx`), which omits "this application":

> _"Re-opening will remove your approval. You will need to review and approve your answers again before you can export."_

**Actions:** Confirm / Cancel

On confirmation, the status reverts to `in_progress` and the user is returned to the application editing screen.

---

## Re-exporting an Exported Application

A user may export an application more than once — for example, after re-opening, editing, and re-approving, or simply to generate a second copy.

**Behaviour:**
Re-exporting is permitted without restriction. However, when a user exports an application whose status is already `exported`, a confirmation dialog titled "Download again?" is displayed:

> _"You last exported this application on [date]."_ (or _"You have already exported this application."_ if no date is recorded) _"If you have already submitted that version to the funder, please contact them if you intend to submit a revised version — funders may treat multiple submissions as separate applications."_

**Corrected 2026-07-10** -- previously quoted "please contact them to let them know a revised version is being submitted" and omitted the no-date fallback case; verified against `components/application-step5-approve.tsx`.

**Actions:** Download anyway / Cancel

The warning is informational only — the user is free to proceed. Responsibility for managing submissions to the funder remains with the user.

The export date shown in the warning is the date of the most recent previous export.

---

## Deletion

Applications may be deleted at any status. Deletion is permanent and cannot be undone.

| Status at deletion | Confirmation prompt                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started`      | _"Are you sure you want to delete this application? This cannot be undone."_                                                                                                                                               |
| `in_progress`      | _"Are you sure you want to delete this application? This cannot be undone."_                                                                                                                                               |
| `approved`         | _"Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."_                                                                                           |
| `exported`         | _"Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."_                                                                  |
| `mismatch`         | Same generic prompt as `not_started`/`in_progress` -- _"Are you sure you want to delete this application? This cannot be undone."_ (no special case in the live `deleteModalText()`; added 2026-07-10, previously missing) |

---

## Status Display on Dashboard

Application cards on the dashboard display the current status as a colour-coded label:

**Corrected 2026-07-10 -- verified against `components/dashboard-populated.tsx`'s `STATUS_CONFIG`; `mismatch` was missing entirely.**

| Status        | Label text  | Colour          |
| ------------- | ----------- | --------------- |
| `not_started` | Not started | Slate (#64748B) |
| `in_progress` | In progress | Amber (#D97706) |
| `approved`    | Approved    | Green (#16A34A) |
| `exported`    | Exported    | Teal (#0D6E6E)  |
| `mismatch`    | Ineligible  | Red (#DC2626)   |

---

## Notes

- The `in_progress` status covers all stages of the active application flow (guidelines added, AI summary generated, charity-authored answers with on-request AI assist, under review) -- corrected 2026-07-10, previously said "draft generated." The application screen itself uses a step indicator to show the user where within the flow they are — this is separate from the dashboard status label.
- An application returns to `in_progress` on re-opening regardless of whether it was previously `approved` or `exported`.
- There is no archived or closed status for v1 — applications are either active or deleted, **with one exception added 2026-07-10: `mismatch`, a terminal status reached from `in_progress` (FR-47) with no transition back out and no re-opening path.** This document predated FR-47 (added 2026-06-02) and had never been updated to include it until this pass.

---

_Last updated: 2026-07-10_
