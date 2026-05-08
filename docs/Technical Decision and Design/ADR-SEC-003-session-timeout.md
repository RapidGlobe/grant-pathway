---
id: ADR-SEC-003
category: Security
status: Decided
---

# ADR-SEC-003 — Session Timeout

## Context

Grant Pathway handles personal data for UK charity workers. A session timeout policy protects users whose browser is left open on a shared or unattended computer. The timeout must balance security with usability — a grants officer may spend extended periods writing answers in Step 4.

## Options Considered

- **Option A — 30-minute inactivity timeout:** Aggressive timeout. Appropriate for high-security applications. Too disruptive for a grant writing tool where a user may be reading guidelines and composing answers.
- **Option B — 60-minute inactivity timeout:** Moderate. Gives sufficient time for sustained work sessions. Balances security with usability.
- **Option C — 24-hour session (no inactivity timeout):** Standard for consumer SaaS. Relies on explicit logout. May be appropriate given the low sensitivity of the data.
- **Option D — No timeout, explicit logout only:** Simplest. User is responsible for logging out.

## Decision

**A 60-minute inactivity timeout is applied. The user is warned 5 minutes before timeout with an option to extend the session.**

Supabase Auth default session duration is used as the base. Activity tracking (mouse/keyboard events) resets the timeout timer. A modal warning appears at 55 minutes of inactivity. If the user does not respond, they are signed out and redirected to `/sign-in` with the message "You've been signed out due to inactivity."

## Rationale

- 60 minutes balances security with the practical need to spend extended time on a single application.
- A 5-minute warning with an "I'm still here" button prevents abrupt data loss.
- Auto-save (DDR-INT-002) ensures in-progress answers are saved before timeout.
- GDPR and data protection good practice for applications handling personal data.

## Consequences

- A client-side inactivity timer must be implemented (tracking `mousemove`, `keydown`, `click` events).
- A timeout warning modal must be designed and implemented.
- Auto-save (ADR-ARCH-004) must save the current state before the timeout fires.
- The Supabase Auth session expiry must be aligned with or longer than the application-level 60-minute timeout.

## Source

BRD Section 9 (Data Privacy & Security), DDR-INT-002 (Auto-save).

## Date Decided

2026-04-17
