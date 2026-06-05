# DR-EL-001 — Eligibility Mismatch Handling

**Date:** 2026-06-02
**Status:** Decided ✓
**Author:** Rapidglobe Ltd

---

## Question

How should Grant Pathway handle cases where the AI detects a clear mismatch between the charity's profile and the funder's eligibility criteria?

---

## Decision

Grant Pathway will surface a **red eligibility warning card** on the Step 3 AI summary screen when the AI detects that the charity is unlikely to be eligible for the grant based on their profile. The warning requires the user to acknowledge it explicitly. On acknowledgement:

- The application status is set to `mismatch`
- The user is returned to the dashboard
- There is **no path to Step 4** (the Q&A interface) — this is a hard stop, with no override

The escape hatch is: the user may update their charity profile to accurately reflect work that aligns with the funder's criteria, then create a new application from the dashboard.

---

## Options Considered

| Option | Description                                      | Outcome                                                                                                  |
| ------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1      | Amber warning, user can proceed anyway           | Rejected — allows ineligible applications to progress; risks funder relationships; wastes user time      |
| 2      | Red warning, acknowledge, hard stop to dashboard | **Selected**                                                                                             |
| 3      | No warning (current behaviour)                   | Rejected — fails to surface a key risk; user wastes time writing answers for a grant they cannot receive |

---

## Rationale

Grant-giving organisations will not welcome a stream of ineligible applications routed via Grant Pathway. A single high-profile case of Grant Pathway being implicated in bulk ineligible submissions would be a serious reputational risk to the product. The hard stop protects the funder relationship and saves the user from investing time writing nine answers for a grant they cannot receive.

The decision to use **red** (not amber) reflects the severity: this is not a caution. It is a clear indication that the application cannot proceed in its current form.

There is no override. If the AI flags a mismatch, the application cannot reach Step 4. The only path forward is to correct the charity profile or choose a different funder.

---

## Data Model Impact

A new `mismatch` value is added to the `application_status` PostgreSQL enum. Applications in `mismatch` state:

- Are displayed on the dashboard with a red "Ineligible" status badge
- Cannot be resumed or continued to Step 4
- Can be deleted by the user
- Remain on the dashboard as a record until deleted

---

## AI Prompt Impact

The summary prompt is extended to return two new fields in the JSON response:

| Field                 | Type           | Description                                                                                                                                    |
| --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `eligibilityMismatch` | boolean        | `true` if the charity profile clearly does not meet the funder's eligibility criteria; `false` otherwise or if no charity profile was provided |
| `mismatchReason`      | string or null | Plain-English 1–2 sentence explanation of the mismatch (shown to the user); `null` if no mismatch                                              |

The AI is instructed to set `eligibilityMismatch: true` only for **clear, unambiguous** mismatches — for example, an arts-only funder and a charity with no arts remit. Borderline cases should default to `false`.

---

## UI Flow

1. Step 3 generates the AI summary as normal
2. If `summary.eligibilityMismatch === true`:
   - A red warning card is displayed at the top of the Step 3 content screen, above all summary cards
   - The warning shows the `mismatchReason` text
   - The warning explains that the user should update their charity profile and start a new application
   - The **Continue button is hidden** and replaced with an **"I understand, return to my dashboard"** acknowledge button
3. Clicking acknowledge calls `setApplicationMismatch(applicationId)` and redirects to `/dashboard`
4. The application appears on the dashboard with a red **"Ineligible"** status badge

---

## Escape Hatch

The user may correct their charity profile to accurately reflect work that aligns with the funder's eligibility criteria, then create a new application. The mismatched application remains on the dashboard as a record and can be deleted at any time.

---

## Document History

| Version | Date       | Author         | Change                                                               |
| ------- | ---------- | -------------- | -------------------------------------------------------------------- |
| 1.0     | 2026-06-02 | Rapidglobe Ltd | Initial decision record — raised during Idlewild Trust IT-04 testing |
