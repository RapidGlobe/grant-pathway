---
id: DDR-CS-003
category: Component Style
status: Decided
---

# DDR-CS-003 — Secondary and Destructive Button Styles

## Question

What should secondary buttons and destructive (delete/danger) buttons look like?

## Context

The primary button style is already defined: teal (#0D6E6E) filled background with white text. This is used for all primary actions (Sign in, Continue, Save profile, Approve, Download).

However, the screens include several other button types that need a defined treatment:

**Secondary buttons** appear throughout:

- Back links in the application flow
- Cancel (Step 1 of application flow)
- Regenerate summary / Regenerate answers
- Resend verification email
- Enter details manually (Charity Commission fallback)

**Destructive buttons** appear on:

- Delete application (dashboard card)
- Delete my account (account settings)
- Permanently delete my account (deletion confirmation screen)

Getting these styles right is important for hierarchy and safety. Secondary buttons must be clearly less prominent than primary buttons. Destructive buttons must signal danger without being alarming -- the user needs to feel in control, not frightened.

## Options

**Secondary button options:**

- **Option A -- Teal outline:** White background, teal border, teal text. Clearly related to the primary but obviously secondary. Common choice.
- **Option B -- Grey outline:** White background, grey border, slate text. Neutral; does not compete with the teal primary. Very common in SaaS tools.
- **Option C -- Ghost / text-only:** No border, no background. Slate or teal text only. Minimal visual weight. Good for actions like "Back" or "Cancel" that should feel unobtrusive.
- **Option D -- Soft teal fill:** Soft teal (#E6F4F4) background, teal text, no border. Tonal relationship with the primary button without being as bold. Warm and on-brand.

**Destructive button options:**

- **Option E -- Red filled:** Red (#DC2626 or similar) filled background, white text. Maximum danger signal. Standard for irreversible actions like account deletion.
- **Option F -- Red outline:** White background, red border, red text. Signals danger but less alarming than a filled red button. Appropriate for first-step warnings (e.g. "Delete my account" link on the account settings page).
- **Option G -- Red text link only:** No button styling -- just red text that acts as a link. Very low visual weight; relies on the red colour alone to signal danger. Appropriate for "Delete" on an application card where space is tight.

Note: The screens use different levels of destructive action. "Delete" on a card is a first step (triggers a confirmation). "Permanently delete my account" is the final confirmed action. Different visual weights may be appropriate for these two levels.

## Decision

**Three-tier button hierarchy across all mockup directions:**

| Tier      | Style                                               | Used for                                                                   |
| --------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| Primary   | Teal fill (#0D6E6E), white text                     | All primary actions (Sign in, Continue, Save, Approve, Download)           |
| Secondary | Grey outline (white bg, #E2E8F0 border, slate text) | Substantive secondary actions (Regenerate, Resend, Enter details manually) |
| Escape    | Ghost / text only (no border, no bg, slate text)    | Minor escape actions (Back, Cancel)                                        |

**Destructive button hierarchy:**

| Level                   | Style                                               | Used for                                                                |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| Level 1 -- first step   | Red text link only (#DC2626 text, no border, no bg) | Delete on application card (triggers confirmation; no immediate action) |
| Level 2 -- final action | Red fill (#DC2626 bg, white text)                   | Permanently delete my account (irreversible final action)               |

**Rationale:** The visual weight of each button matches the severity and immediacy of its action. Back and Cancel are ghost links to avoid competing with the primary. Level 1 destructive actions warn without alarming; Level 2 makes the gravity of an irreversible action unmistakable.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
