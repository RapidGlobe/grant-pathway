# Application Status Model — Grant Pathway v1

This document defines all application statuses, the rules for transitioning between them, and the user-facing behaviour at each status. It is an input to the Product Requirements Document and to screen requirements for the dashboard and application screens.

---

## Statuses

| Status        | Display label | Meaning                                                                                                        |
| ------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| `not_started` | Not started   | Application record created (funder name and grant name saved) but no guidelines have been added yet            |
| `in_progress` | In progress   | Guidelines added; user is actively working through the flow (AI summary, draft generation, review and editing) |
| `approved`    | Approved      | User has completed the mandatory review and formally approved all draft answers                                |
| `exported`    | Exported      | Approved content has been exported to a Word document at least once                                            |

---

## Transition Rules

```
not_started  →  in_progress   When the user saves their funder guidelines (upload or paste)
in_progress  →  approved      When the user clicks Approve after reviewing all draft answers
approved     →  exported      When the user downloads the Word document for the first time
approved     →  in_progress   When the user re-opens an approved application for editing (see Re-opening below)
exported     →  in_progress   When the user re-opens an exported application for editing (see Re-opening below)
```

---

## Re-opening an Approved or Exported Application

A user may re-open an application that has been approved or exported — for example, to correct an answer before submitting to a funder.

**Behaviour:**
When a user clicks Edit on an Approved or Exported application, a confirmation prompt is displayed before the application is re-opened:

> _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_

**Actions:** Confirm / Cancel

On confirmation, the status reverts to `in_progress` and the user is returned to the application editing screen.

---

## Re-exporting an Exported Application

A user may export an application more than once — for example, after re-opening, editing, and re-approving, or simply to generate a second copy.

**Behaviour:**
Re-exporting is permitted without restriction. However, when a user exports an application whose status is already `exported`, a warning banner is displayed above the download:

> _"You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."_

**Actions:** Download anyway / Cancel

The warning is informational only — the user is free to proceed. Responsibility for managing submissions to the funder remains with the user.

The export date shown in the warning is the date of the most recent previous export.

---

## Deletion

Applications may be deleted at any status. Deletion is permanent and cannot be undone.

| Status at deletion | Confirmation prompt                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started`      | _"Are you sure you want to delete this application? This cannot be undone."_                                                                              |
| `in_progress`      | _"Are you sure you want to delete this application? This cannot be undone."_                                                                              |
| `approved`         | _"Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."_                          |
| `exported`         | _"Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."_ |

---

## Status Display on Dashboard

Application cards on the dashboard display the current status as a colour-coded label:

| Status        | Label text  | Colour          |
| ------------- | ----------- | --------------- |
| `not_started` | Not started | Slate (neutral) |
| `in_progress` | In progress | Amber (#D97706) |
| `approved`    | Approved    | Green (#16A34A) |
| `exported`    | Exported    | Teal (#0D6E6E)  |

---

## Notes

- The `in_progress` status covers all stages of the active application flow (guidelines added, AI summary generated, draft generated, under review). The application screen itself uses a step indicator to show the user where within the flow they are — this is separate from the dashboard status label.
- An application returns to `in_progress` on re-opening regardless of whether it was previously `approved` or `exported`.
- There is no archived or closed status for v1 — applications are either active or deleted.

---

_Last updated: 2026-04-16_
