---
id: DDR-VD-001
category: Visual Direction
status: Decided
---

# DDR-VD-001 — Design Directions for Mockups

## Question

What are the three distinct visual design directions that the HTML/CSS mockups will explore?

## Context

The plan is to produce three or more mockup variants before selecting a final design direction to develop. Each variant should explore a meaningfully different aesthetic treatment of the same screens and components -- they should not be minor variations of the same style.

The following design elements are fixed across all variants and must not differ between them:

- Colour palette: teal #0D6E6E, soft teal #E6F4F4, amber #D97706, success green #16A34A, slate #1E293B, off-white #F8FAFC, white #FFFFFF (app-name-and-branding.md)
- Typography: Inter across all text roles (app-name-and-branding.md)
- Navigation structure and page content (information-architecture-and-navigation.md)
- All screen content, labels, and copy (screen-requirements.md)
- WCAG 2.2 AA accessibility compliance (NFR-06)

What can vary between the three directions is the overall visual character: how the palette is applied, what the spatial rhythm feels like, the visual weight of components, and the emotional tone conveyed by the design.

Grant Pathway's target users are charity volunteers and non-specialist staff -- not developers or designers. The final product must feel approachable, trustworthy, and professional without feeling corporate or intimidating.

## Options

The following design directions are proposed as candidates. Three should be selected for the mockup phase.

- **Option A -- Minimal & Professional:** Generous white space, teal used sparingly as an accent only (primarily on interactive elements), flat components with no shadows, Inter at large scale for headings. Clean, modern, confident. Closest to a tool like Stripe or Linear.
- **Option B -- Warm & Approachable:** Soft teal (#E6F4F4) used as page and card backgrounds, rounded corners throughout, amber used prominently for key actions, subtle illustrated or icon-based treatments for empty states. Feels friendly and low-pressure. Closest to tools aimed at non-technical users.
- **Option C -- Modern SaaS:** Moderate use of shadows and elevation, tighter spacing, strong visual hierarchy using teal headers and white card panels on off-white backgrounds. Feels efficient and familiar. Closest to tools like Notion or Airtable.
- **Option D -- Charity-Sector Warmth:** Amber used more prominently alongside teal, larger body text, extra breathing room between elements, minimal iconography, a deliberate "human" feel over a polished tech feel. Designed to feel like it was built for the sector, not adapted from a tech product.
- **Option E -- High-Contrast Accessible:** Maximises contrast ratios well above AA minimum, bold typography, strong borders on all interactive elements, larger touch targets, explicit focus rings. Prioritises accessibility at the expense of aesthetic subtlety. Strong option for users with visual impairments common in older volunteer demographics.

## Decision

**Options A, B, and C selected as the three mockup design directions.**

| Variant  | Name                   | Character                                                                                                                        |
| -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Mockup 1 | Minimal & Professional | Predominantly white, teal as accent only, flat components, generous white space, clean and confident                             |
| Mockup 2 | Warm & Approachable    | Soft teal backgrounds, amber used prominently, rounded corners, card-heavy, friendly and welcoming                               |
| Mockup 3 | Modern SaaS            | White cards on off-white background, moderate shadows, tighter spacing, strong visual hierarchy, familiar productivity-tool feel |

Options D (Charity-Sector Warmth) and E (High-Contrast Accessible) were not selected as standalone mockup directions. Option D is considered a refinement of Mockup 2 rather than a distinct direction. Option E is better applied as an accessibility audit lens to the chosen final direction rather than as a separate mockup.

All three mockups cover the same screens for like-for-like comparison. The fixed constraints (colour palette, Inter font, content, WCAG 2.2 AA) apply equally to all three variants.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
