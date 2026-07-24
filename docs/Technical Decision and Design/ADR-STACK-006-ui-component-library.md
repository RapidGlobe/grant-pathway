---
id: ADR-STACK-006
category: Stack
status: Decided
---

# ADR-STACK-006 — UI Component Library

## Context

Grant Pathway requires a set of accessible, composable UI components covering forms, modals, dropdowns, and tables. The design system uses Tailwind CSS for styling. Components must meet WCAG 2.2 Level AA (DDR-AC-001). A single developer cannot build accessible components from scratch for every interaction pattern.

## Options Considered

- **Option A — shadcn/ui + Radix UI + Tailwind CSS:** Copy-paste component library built on Radix UI primitives with Tailwind CSS styling. Components live in the codebase and are fully customisable. Radix handles accessibility and keyboard interactions.
- **Option B — Chakra UI:** Styled component library with built-in theming. Components are imported from npm, limiting customisation. Not Tailwind-native.
- **Option C — Headless UI (Tailwind Labs):** Headless components from the Tailwind team. Smaller component set than shadcn/ui; Radix has broader coverage.
- **Option D — Build all components from scratch:** Maximum control, extremely time-consuming, accessibility risk for a single developer.
- **Option E — Material UI (MUI):** Comprehensive library with strong accessibility, but opinionated Material Design aesthetic that conflicts with the Warm & Approachable design direction.

## Decision

**Option A — shadcn/ui with Radix UI primitives and Tailwind CSS.**

shadcn/ui is the UI component library. Components are initialised into the codebase using the shadcn CLI and customised to match the design system in design-requirements.md. Lucide React is used as the icon library (already a shadcn/ui dependency).

**Amendment (2026-07-24, found while building PDR-UI-008):** the actual primitives underneath `components/ui/` are **Base UI** (`@base-ui/react`), not Radix UI — see `components/ui/tooltip.tsx`, `components/ui/dialog.tsx`. shadcn/ui itself switched its default primitive from Radix to Base UI at some point after this ADR was written (2026-04-17); this ADR's Decision/Rationale text was never updated to match. `ADR-OPS-006`'s own 2026-07-14 revision already correctly references Base UI. No functional impact — shadcn/ui's Tailwind-native, in-codebase model and WCAG-compliant primitive behaviour hold regardless of which underlying library it wraps; only this document's wording was stale.

## Rationale

- Base UI (formerly documented here as Radix UI — see the 2026-07-24 amendment above) provides WCAG-compliant keyboard navigation and ARIA attributes for all interactive components (dialogs, dropdowns, popovers, tooltips).
- shadcn/ui components live in `components/ui/` in the codebase — they are not an external dependency lock-in.
- Tailwind CSS is used throughout the product; shadcn/ui is Tailwind-native.
- Lucide icons are included and already used in the design system (DDR-CS-006 references specific Lucide icons).
- The design-requirements.md specifies exact Tailwind class mappings, making shadcn/ui customisation straightforward.

## Consequences

- All form inputs, modals, dropdowns, and interactive components should use shadcn/ui primitives to inherit accessibility behaviour.
- Custom components built on top of shadcn/ui must maintain ARIA roles and keyboard event handling.
- Tailwind CSS configuration (`tailwind.config.ts`) must define the design token colour values from design-requirements.md.
- `cn()` utility (clsx + tailwind-merge) is used for conditional class composition throughout.

## Source

Product Decision PDR-UI-001, Design Decision DDR-AC-001, design-requirements.md.

## Date Decided

2026-04-17
