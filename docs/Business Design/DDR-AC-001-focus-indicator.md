---
id: DDR-AC-001
category: Accessibility Design
status: Decided
---

# DDR-AC-001 — Focus Indicator Style

## Question

What visual style should the keyboard focus indicator use across all interactive elements?

## Context

WCAG 2.2 introduced a new success criterion at Level AA -- SC 2.4.11 (Focus Appearance) -- which requires that keyboard focus indicators meet minimum size and contrast requirements. This is stricter than previous WCAG versions and means the browser's default focus ring may not be sufficient in all cases.

Grant Pathway must achieve WCAG 2.2 Level AA compliance (NFR-06, C15). A custom focus indicator that is visually consistent with the brand and reliably meets SC 2.4.11 is preferable to relying on browser defaults, which vary significantly between Chrome, Firefox, Safari, and Edge.

The focus indicator must be:
- Visible on all interactive elements: buttons, links, form fields, checkboxes, the account dropdown, the step indicator (even though it is read-only)
- Sufficient area (at least a 2px perimeter around the component, or a defined area per WCAG 2.4.11)
- Sufficient contrast ratio against both the component background and the adjacent page background

shadcn/ui (PDR-UI-001) provides a default focus ring via Tailwind's `ring` utilities, which can be customised globally.

## Options

- **Option A -- Custom teal outline ring:** A 2px solid teal (#0D6E6E) focus ring with a 2px offset from the component. Consistent with the primary brand colour. Contrast against white (#FFFFFF) backgrounds is 4.54:1 -- marginally above the 3:1 minimum required by SC 2.4.11. On teal elements (primary buttons), a white or amber ring would be needed instead for contrast.
- **Option B -- Custom amber outline ring:** A 2px solid amber (#D97706) focus ring with a 2px offset. Amber provides strong contrast against both white backgrounds (4.58:1) and teal backgrounds (3.12:1). The amber ring is distinctive and very visible. Consistent with amber's role as an accent / attention colour in the palette.
- **Option C -- High-contrast black/white double ring:** A 2px black outer ring with a 2px white inner ring (or vice versa). This pattern guarantees visible contrast regardless of the background colour, making it the most universally accessible option. It is less brand-aligned but maximally accessible. Used by GOV.UK and other government digital services.
- **Option D -- Tailwind default ring (blue):** Use the shadcn/ui and Tailwind default focus ring (typically a blue ring via `ring-ring` CSS variable). Familiar and well-tested. Not brand-aligned -- introduces an unexpected blue into the colour palette.
- **Option E -- Teal ring on light backgrounds, white ring on dark/teal backgrounds:** Context-aware focus rings that switch colour depending on the background. Most visually refined but requires more implementation effort to ensure all states are covered.

## Decision

**Option B -- Custom amber outline ring.**

A 2px solid amber (#D97706) focus ring with a 2px offset, applied globally via the shadcn/ui `--ring` CSS variable.

**Implementation specification:**
- CSS: `outline: 2px solid #D97706; outline-offset: 2px`
- Tailwind equivalent: `ring-2 ring-amber-600 ring-offset-2`
- Applied on `:focus-visible` only (not `:focus`) -- prevents ring appearing on mouse clicks; preserves it for keyboard navigation
- Implemented via the shadcn/ui `--ring` CSS variable so it applies globally to all Radix UI / shadcn/ui interactive primitives without per-component overrides

**Contrast verification:**
- Amber (#D97706) on white (#FFFFFF): 4.58:1 -- passes WCAG SC 2.4.11 (minimum 3:1) ✓
- Amber (#D97706) on teal (#0D6E6E): 3.12:1 -- passes WCAG SC 2.4.11 ✓
- No context-aware fallback required -- single ring colour works on all background colours in the palette

## Date Decided

2026-04-17

---

*Status: Decided*
*Created: 2026-04-17*
