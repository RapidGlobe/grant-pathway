---
id: PDR-UI-001
category: User Interface & Experience
status: Decided
---

# PDR-UI-001 — UI Component Library

## Question
Will Grant Pathway use a pre-built accessible UI component library, or will UI components be built from scratch?

## Context
A UI component library provides ready-made, pre-styled, and accessibility-tested components (buttons, forms, modals, inputs, navigation) that can be dropped into the application. This significantly reduces build time and provides a strong baseline for WCAG 2.2 AA compliance (C15). The alternative — building components from scratch — gives complete design control but requires significantly more time and accessibility expertise. Given the solo developer constraint (C4) and the July 2026 deadline (C2), this decision has a direct impact on delivery speed and accessibility quality.

## Options
- **Option A — Build from scratch:** Write all UI components (buttons, forms, modals, inputs, navigation) without any library. Maximum design control, but significantly higher build time and accessibility risk.
- **Option B — shadcn/ui (built on Radix UI):** Use shadcn/ui, a component collection built on accessible Radix UI primitives and styled with Tailwind CSS. Components are copied into the codebase and owned outright — no runtime dependency.
- **Option C — MUI (Material Design):** Use Material UI, a comprehensive component library following Google's Material Design system. Opinionated visual style that may conflict with Grant Pathway branding.
- **Option D — Chakra UI:** Use Chakra UI, a component library with built-in accessibility and theming. Good accessibility baseline but less aligned with Next.js App Router patterns.

## Decision
**Option B — shadcn/ui built on Radix UI.**

Grant Pathway will use shadcn/ui as its UI component library. Components will be installed into the codebase using the shadcn/ui CLI and customised to match Grant Pathway brand colours (teal #0D6E6E, amber #D97706) and typography (Inter). Radix UI provides the accessible primitive behaviour (keyboard navigation, focus management, ARIA roles) and shadcn/ui provides the ready-styled components on top.

## Rationale
shadcn/ui directly supports the WCAG 2.2 AA accessibility requirement (C15, NFR-06) without requiring custom accessibility implementation. Unlike a traditional dependency, shadcn/ui copies component source code directly into the project — giving full ownership and the ability to customise without fighting a library's constraints. It integrates cleanly with Next.js and Tailwind CSS (already in the technology stack), and is widely used in production Next.js applications. For a solo developer on a fixed deadline, this approach delivers accessible, production-quality components quickly while keeping full design control.

## Date Decided
2026-04-16
