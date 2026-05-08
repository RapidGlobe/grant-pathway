---
id: PDR-UI-006
category: User Interface & Experience
status: Decided
---

# PDR-UI-006 — API Failure User Experience

## Question
What does the user see and what can they do when the Charity Commission API or the AI service is unavailable or returns an error?

## Context
Grant Pathway depends on two external APIs: the Charity Commission API (used during charity profile setup) and the Amazon Bedrock Claude API (used for summarisation and draft generation — see DR-AI-002). Both can be temporarily unavailable due to outages, rate limiting, or connectivity issues. The user experience during these failures is important — a confusing or alarming error message could cause users to lose confidence in the app or abandon their work. The functional requirements specify plain-language error messages and retry options (FR-11, FR-27), but the exact screens, messages, and recovery paths need to be defined for the PRD.

## Options
- **Option A — Inline error messages only:** Errors appear inline where the failure occurred with a retry button. No modal popups or blocking overlays.
- **Option B — Modal error dialogs:** A popup dialog appears on API failure with a message and retry/dismiss options. More attention-grabbing but interrupts user flow.
- **Option C — Inline errors with manual fallback for Charity Commission API:** Inline error messages for both APIs, plus a manual data entry fallback specifically for the Charity Commission API so users are never blocked from completing their charity profile.

## Decision
**Option C — Inline errors with manual fallback for Charity Commission API.**

### Charity Commission API failure
- Inline plain-language message: *"We couldn't reach the Charity Commission right now. Please try again in a few moments, or enter your charity details manually."*
- **Try again** button
- **Enter details manually** fallback option — the user can type their charity details directly so they are never blocked from completing their profile

### Claude API failure (summarisation or draft generation)
- Inline plain-language message replaces the loading spinner: *"We couldn't generate your content right now. This is usually temporary — please try again."*
- **Try again** button
- All uploaded guidelines and previously saved content are preserved — no data is lost on failure
- If the error persists after retry: *"If this keeps happening, please try again later. Your work has been saved."*
- No manual fallback for the Claude API — retry is the only recovery path

### General principles
- No modal popups or blocking overlays for API errors
- Error messages use plain English with no technical language or error codes visible to the user
- Error states are inline and contextual — the user stays on the same page and can act immediately
- All error messages comply with the plain-language tone of voice (FR-11, FR-27)

## Rationale
Inline errors keep the user in context and are less alarming than modal dialogs, which can feel like something has gone seriously wrong. The manual fallback for the Charity Commission API is essential because some charities may not appear in the register (e.g. very new charities, exempt charities) and without it those users would be completely blocked. The Claude API has no equivalent fallback — AI generation cannot be approximated manually — so retry is the appropriate recovery path. Preserving user data on API failure is non-negotiable to maintain trust.

## Date Decided
2026-04-16
