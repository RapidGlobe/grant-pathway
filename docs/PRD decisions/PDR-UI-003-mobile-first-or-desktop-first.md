---
id: PDR-UI-003
category: User Interface & Experience
status: Decided
---

# PDR-UI-003 — Mobile-First or Desktop-First

## Question
Will the UI be designed and built for mobile screens first and scaled up to desktop, or designed for desktop first and scaled down to mobile?

## Context
The application must be fully responsive from 320px upward (C16, NFR-05). The primary persona Margaret uses a personal Windows laptop, and David uses a work laptop — both suggesting desktop as the primary device. However, volunteers and charity workers may access the app on mobile or tablet devices. Mobile-first development typically produces cleaner, more accessible responsive layouts because constraints force simplicity. Desktop-first is often faster when the primary use case involves significant text input, which grant writing does. This decision shapes the entire CSS and layout approach for the build.

## Options
- **Option A — Desktop-only (enforced):** Build for desktop only. Display a message on screens below a minimum width (e.g. 1024px) directing users to a larger screen. No mobile layout built or tested.
- **Option B — Desktop-only (no enforcement):** Build for desktop with no responsive work and no blocking message. Mobile users receive whatever the unstyled layout produces.
- **Option C — Desktop-primary, responsive as a byproduct:** Design and build for desktop as the primary use case. Tailwind CSS and shadcn/ui produce a passable mobile layout by default without any additional effort. No active mobile optimisation is undertaken, but the codebase is structured so that responsive enhancements can be added in a future phase if user feedback supports demand.

## Decision
**Option C — Desktop-primary, responsive as a byproduct.**

Grant Pathway will be designed and built with desktop as the primary and intended use case. Grant writing — involving significant text input, AI content review, and document export — is not well suited to mobile screens. No additional effort will be invested in mobile layout optimisation for v1. However, no mobile blocking will be implemented. The Tailwind CSS and shadcn/ui foundation means that a full mobile-optimised experience can be added in a future phase with targeted enhancements rather than a rebuild, should user feedback indicate demand.

BRD constraint C16 and NFR-05 are updated to reflect desktop-primary intent. Full responsive optimisation is deferred to a future phase.

## Rationale
Grant writing is a desktop activity for the primary personas (Margaret and David both use laptops). Investing development time in mobile optimisation for v1 would not deliver meaningful user value and would consume time better spent on core functionality. Option C avoids that cost while keeping the option open — because shadcn/ui and Tailwind CSS produce structurally sound layouts, adding responsive breakpoints later is an enhancement rather than a rework. A blocking message was considered (Option A) but rejected as unnecessarily exclusionary for tablet users.

## Date Decided
2026-04-16
