---
id: DDR-IP-002
category: Interaction Pattern
status: Decided
---

# DDR-IP-002 — Success Message Style and Placement

## Question

How should success messages be displayed after a user completes a save or update action?

## Context

Several screens display success messages after a user action completes. These are defined in the screen requirements and information architecture document:

| Action                             | Message                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Charity profile saved (first time) | "Your charity profile has been saved. You're ready to start your first application." |
| Charity profile updated            | "Your changes have been saved."                                                      |
| Password changed                   | "Your password has been updated."                                                    |
| Account deleted                    | "Your account has been deleted." (shown on `/` after redirect)                       |

All of these are currently described as "inline" messages -- meaning they appear on the page rather than as floating notifications. The visual form of "inline" is not yet specified.

Success messages should:

- Be clearly positive and reassuring
- Use the success green (#16A34A) from the brand palette
- Be associated with the action that triggered them
- Not block or obscure any other content
- Be accessible (readable by screen readers; not rely solely on colour)

## Options

- **Option A -- Inline alert banner (top of form):** A green alert box appears at the top of the form or page section, below the page heading and above the form fields. Contains a tick icon and the success message text. Stays visible until the user navigates away or takes another action. This is the most common pattern for form success messages.
- **Option B -- Inline alert banner (below the submit button):** The green alert appears directly below the submit/save button that was clicked. Tightly associated with the action; the user's eye naturally falls there after clicking. May be partially off-screen if the form is long.
- **Option C -- Toast / snackbar notification:** A small floating notification appears in the top-right or bottom-right corner of the screen and auto-dismisses after 4--5 seconds. Common in modern SaaS tools. Unobtrusive and does not displace page content. Risk: screen readers may not announce it reliably without careful ARIA implementation; and auto-dismissal means the user must read it quickly.
- **Option D -- Replacing page content:** After save, the form is replaced with a success state (a tick, the message, and a next-action button). Used for the first-time profile save, which already has a "Go to my dashboard" button defined. Less appropriate for repeat saves (e.g. updating profile) where the user may want to remain on the form.
- **Option E -- Mixed approach:** Use an inline alert (Option A or B) for repeat saves (profile update, password change) and a replacing page content state (Option D) for first-time, milestone actions (first profile save, account deletion redirect). Differentiates between transient success and meaningful milestones.

## Decision

**Option E -- mixed approach: page replacement for first-time milestone saves; inline alert below submit button for all transactional saves.**

### Milestone saves -- page replacement (Option D)

| Trigger                                  | Treatment                                  |
| ---------------------------------------- | ------------------------------------------ |
| Charity profile saved for the first time | Form replaced with full-page success state |

**Full-page success state elements:**

- Large teal `CheckCircle` icon (64px)
- Heading: _"Your charity profile has been saved."_
- Body: _"You're ready to start your first application."_
- Primary button (amber): _"Go to my dashboard"_ -- links to `/dashboard`

### Transactional saves -- inline alert below submit button (Option B)

| Trigger                 | Message                             |
| ----------------------- | ----------------------------------- |
| Charity profile updated | _"Your changes have been saved."_   |
| Password changed        | _"Your password has been updated."_ |

**Inline alert elements:**

- Success green background (#16A34A at low opacity, e.g. #F0FDF4) with darker green text
- Lucide `CheckCircle` icon left of message text
- Persistent -- does not auto-dismiss; remains until the user navigates away or makes another change
- Scrolls into view programmatically on display to ensure visibility for keyboard users on longer forms

### Account deleted

Shown on `/` after redirect as an inline message on the sign-in page: _"Your account has been deleted."_ Uses the same inline alert style as transactional saves above. No design decision required -- handled by the redirect behaviour defined in `PRD-Grant-Pathway.md` Section 7, Screen 1 (previously `screen-requirements.md`, retired 2026-07-13).

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
