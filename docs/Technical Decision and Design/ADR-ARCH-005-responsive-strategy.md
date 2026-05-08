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

- A banner or graceful degradation should be shown below 768px informing users the application is designed for desktop.
- Tailwind CSS responsive utilities (`sm:`, `md:`, `lg:`) are used but breakpoints below `lg` (1024px) are not a primary target.
- The design-requirements.md specifies 1024px as the minimum viewport; this ADR confirms that constraint.

## Source

Design Decision DDR-LAY-001, design-requirements.md (Section 4 — Spacing and Layout).

## Date Decided

2026-04-17
