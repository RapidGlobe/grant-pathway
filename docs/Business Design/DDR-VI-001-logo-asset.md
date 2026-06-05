---
id: DDR-VI-001
category: Visual Identity
status: Decided
---

# DDR-VI-001 — Logo Asset

## Question

Does Grant Pathway have a visual logo graphic, or will the product name be displayed as styled text in the navigation bar and on the sign-in page?

## Context

Every screen in the application includes a navigation bar with the Grant Pathway name or logo at the top left. The sign-in / landing page also features the logo prominently. The branding document (app-name-and-branding.md) confirms the product name and colour palette but does not reference a logo graphic file. Knowing whether a logo asset exists — and what form it takes — is foundational to designing the navigation bar, the sign-in page layout, and any screen that uses the brand mark.

The three common approaches are:

- **Wordmark only** — the product name "Grant Pathway" in styled Inter type, using teal
- **Icon + wordmark** — a small graphic symbol alongside the styled product name
- **Icon only** — a standalone graphic mark used at small sizes (e.g. favicon, app icon) with the wordmark used at full sizes

## Options

- **Option A — Wordmark only (text-based logo):** Display "Grant Pathway" in Inter Bold, teal #0D6E6E, in the navigation bar and on auth screens. No graphic mark. Simple to implement; no asset dependency.
- **Option B — Icon + wordmark (existing asset):** A logo graphic already exists and will be used. The navigation bar and auth screens use the full logo file.
- **Option C — Icon + wordmark (to be created):** A logo graphic does not yet exist and needs to be designed as part of this design phase before mockups are finalised.

## Decision

**Option B -- Icon + wordmark (existing asset).**

A logo graphic exists: an amber "G" person icon mark alongside the "GrantPathway" wordmark in a rounded sans-serif font. The icon mark and wordmark will be used across the navigation bar and auth screens.

**Asset requirements before development:**

- A transparent-background PNG or SVG version is required for use on light (white or off-white) navigation bars and auth page backgrounds. The existing file uses a white wordmark on a solid teal background, which will only work if the nav bar is teal-filled.
- Two versions are recommended: (1) icon + wordmark with teal or slate wordmark text on transparent background (for light nav bars), and (2) icon + white wordmark on transparent background (for teal nav bars, if that design direction is chosen).
- The icon mark alone (amber G + person) will be used as the favicon (see DDR-VI-002).

**Logo font note:** The wordmark uses a rounded sans-serif font (not Inter). This is acceptable -- the logo mark uses its own font as designed. Inter remains the UI font for all application content.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
