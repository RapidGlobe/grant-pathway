---
id: ADR-ARCH-005
category: Architecture
status: Decided
---

# ADR-ARCH-005 — Responsive Strategy

## Context

Grant Pathway's primary personas (Margaret — volunteer coordinator, Aisha — grants officer) use the application on desktop or laptop. The product is a document-creation tool with multi-column layouts (Step 4 draft answers has a sidebar panel) and form-heavy interactions. Mobile support is a secondary concern for v1.

The design system specifies a minimum viewport of 1024px. WCAG 2.2 Level AA is required.

## Options Considered

- **Option A — Desktop-first, 1024px minimum:** Design and build for desktop. Ensure functionality down to 1024px. Do not optimise for smaller screens in v1.
- **Option B — Mobile-first, full responsive:** Design from 320px up. Ensures compatibility with all devices but significantly increases design and development time for a product primarily used on desktop.
- **Option C — Desktop-only, hard minimum 1280px:** Build exclusively for larger screens with no responsive breakpoints. Simplest to implement. Excludes smaller laptops.

## Decision

**Option A — Desktop-first with a 1024px minimum viewport.**

The application is built desktop-first. Layouts are functional at 1024px and above. Mobile responsiveness (below 1024px) is deferred to a post-v1 iteration. A viewport meta tag and readable text at 1024px ensures WCAG compliance is not compromised.

## Rationale

- Persona research (Margaret, Aisha) confirms primary device is desktop or laptop.
- The two-column layout in Step 4 (draft answers + guidelines panel) requires at least 1024px to be functional.
- Desktop-first development is faster and reduces v1 scope.
- WCAG 2.2 Level AA does not require mobile support; it requires that content is functional and accessible on the target viewport.
- Mobile-first would require re-designing several multi-column layouts, adding significant scope.

## Consequences

- **Below 768px the UI is blocked**, not merely warned: a full-screen banner tells the user Grant Pathway is designed for desktop and asks them to switch to a desktop or laptop browser. Tracked as `GAP-05`.
- **768px to 1023px is supported but not optimised** — the application functions, and layouts may be cramped. No banner is shown in this band. It is below the 1024px design target and above the blocking threshold, deliberately.
- **1024px and above is the optimised target.** Layouts are designed and tested here.
- Tailwind CSS responsive utilities (`sm:`, `md:`, `lg:`) are used but breakpoints below `lg` (1024px) are not a primary target.
- The design-requirements.md specifies 1024px as the minimum **optimised** viewport; this ADR confirms that as the design target, with 768px as the hard functional floor.
- **Mobile browsers are not supported in v1.** Chrome on Android and Safari on iOS on a phone will meet the blocking banner. This is a deliberate consequence of the decision above, not a defect — `NFR-05`, `PRD` §12.5, `C16` and `P5.5`'s cross-browser step were corrected to match on 2026-08-05.

### Amendment 2026-08-05 — the three bands stated explicitly (WJ's decision)

**Raised by `P5.0`** (register refs **R-10** and **R-11**; `docs/Implementation Plan/pre-launch-reconciliation-2026-08-05.md`) and decided by WJ the same day.

This section previously said only "a banner or graceful degradation should be shown below **768px**", while the Decision above sets a **1024px** minimum. Nothing said what happens in the **768–1023px** band — iPad portrait and smaller laptops — which was therefore below the stated minimum, given no banner, and left with no supported layout. The ADR contradicted itself, and `GAP-05` inherited the 768px figure without the gap being resolved.

**WJ's decision: block below 768px, and treat 768–1023px as functional but not optimised.** The reasoning is that the band contains real users on real hardware — iPad portrait and older small laptops are common in small charities — so blocking them to satisfy a design target would cost more than the cramped layout does. Phones, where Step 4's two-column answer-and-guidelines layout genuinely cannot work, are blocked.

**Also settled by the same decision: `NFR-05`'s "320px minimum" claim is withdrawn.** That figure originated in the Mark One BRD (Section 10.5) and was **already overridden by this ADR once** — the retired plan recorded the resolution explicitly ("ADR takes precedence… mobile is post-v1. No action required") — but the resolution never reached the live document set, so five live documents went on promising 320px and mobile-browser support for months. See register ref R-10 for the full instance list.

## Source

Design Decision DDR-LAY-001, design-requirements.md (Section 4 — Spacing and Layout).

## Date Decided

2026-04-17
