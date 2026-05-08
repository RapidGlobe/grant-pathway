---
id: DDR-CS-002
category: Component Style
status: Decided
---

# DDR-CS-002 — Card Design

## Question

How should application cards on the dashboard be visually differentiated from the page background?

## Context

Application cards are the primary component on the dashboard. Each card shows a funder name, grant name, status pill, last-updated date, and action buttons (Continue / View, Delete). On the populated dashboard, a user may have several cards visible simultaneously. The visual treatment of the card -- how it sits on the page, how it signals interactivity, and how it groups its content -- is one of the most important component decisions in the product.

The page background is off-white (#F8FAFC). Cards will sit on top of this background and need to be clearly distinguished from it.

## Options

- **Option A -- Drop shadow:** White card (#FFFFFF) with a soft box shadow (e.g. `0 1px 3px rgba(0,0,0,0.08)`). The shadow creates visual elevation and signals that the card is a clickable/interactive element. Common in modern SaaS products. Shadow can be subtly increased on hover.
- **Option B -- Subtle border:** White card with a light grey border (e.g. 1px solid #E2E8F0). Flat design; no shadow. Clean and minimal. The border defines the card edge without implying elevation. Good for minimal design directions.
- **Option C -- Teal left-border accent:** White card with a 3--4px solid teal (#0D6E6E) left border, no or minimal shadow. The accent border creates visual interest, reinforces the brand colour, and can be used to indicate status (e.g. different accent colour for different application statuses). Distinctive.
- **Option D -- Soft teal background card:** Card uses the soft teal background (#E6F4F4) instead of white, with no border or shadow. Warmer, more distinctive. Works well for the "warm and approachable" design direction. May reduce contrast for text on the card.
- **Option E -- Shadow + border combination:** A white card with both a light border and a subtle shadow. More defined and elevated. Can feel slightly heavy if overdone.

## Decision

**Option A (drop shadow) for Mockups 1 and 3; Option C (teal left-border accent) for Mockup 2.**

| Mockup | Direction | Card treatment |
|--------|-----------|---------------|
| Mockup 1 | Minimal & Professional | White card, very subtle shadow (`0 1px 3px rgba(0,0,0,0.06)`) |
| Mockup 2 | Warm & Approachable | White card, 3--4px solid teal (#0D6E6E) left border, no shadow |
| Mockup 3 | Modern SaaS | White card, moderate shadow (`0 2px 6px rgba(0,0,0,0.10)`) |

**Status-colour left border extension for Mockup 2:** The left border colour reflects the application status, consistent with the status pill colours in screen-requirements.md:
- Not started -- slate (#1E293B)
- In progress -- amber (#D97706)
- Approved -- green (#16A34A)
- Exported -- teal (#0D6E6E)

All cards include a subtle hover state (shadow deepens or border darkens) to confirm interactivity.

## Date Decided

2026-04-17

---

*Status: Decided*
*Created: 2026-04-17*
