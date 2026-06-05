---
id: DDR-CS-001
category: Component Style
status: Decided
---

# DDR-CS-001 — Border Radius

## Question

How rounded should UI components be across the Grant Pathway interface?

## Context

Border radius is one of the most immediate and consistent signals of a product's visual personality. A tight, near-square radius feels precise and professional. A generous, soft radius feels friendly and approachable. Because the same radius value (or a small set of values) is typically applied across all cards, buttons, form fields, modals, and badges, this decision shapes the overall look of every screen.

shadcn/ui (PDR-UI-001) uses a CSS variable (`--radius`) that applies globally to all components, making it straightforward to set a consistent radius across the product. The default shadcn/ui radius is 0.5rem (8px).

The primary user personas (Margaret and David) are non-technical charity workers. The product needs to feel approachable and trustworthy rather than corporate or cold.

## Options

- **Option A -- Sharp (2--4px):** Nearly square corners. Precise and professional. Works well for a minimal or high-contrast design direction. Can feel cold or corporate for a charity-sector audience.
- **Option B -- Moderate (6--8px):** The shadcn/ui default range. Clean and contemporary without being aggressively rounded. The most common choice for modern web applications. Balances professionalism with warmth.
- **Option C -- Rounded (10--14px):** Noticeably soft corners. Friendly and approachable. Works well alongside softer colour applications (e.g. soft teal backgrounds). Can feel less serious if overused on large components.
- **Option D -- Very rounded (16px+, near-pill):** Very prominent rounded corners on cards and panels. Feels friendly but can appear juvenile or toy-like at scale. Usually reserved for badges, tags, and small pill elements rather than cards and panels.
- **Option E -- Mixed:** Use a larger radius (12--16px) on large elements (cards, panels, modals) and a smaller radius (4--6px) on small elements (buttons, inputs, badges). Creates a layered, considered feel but requires more design and development decisions.

## Decision

**Option B -- Moderate (6--8px) as the global default.**

The shadcn/ui `--radius` CSS variable will be set to 6--8px and applied globally across all components (cards, buttons, form fields, modals, panels). Mockup 1 (Minimal & Professional) uses 6px; Mockups 2 and 3 use 8px to provide a marginally softer feel where appropriate.

**Exception:** Status badge pills (Not started, In progress, Approved, Exported) use full pill radius (`border-radius: 9999px`) regardless of the global setting. This is standard convention for pill-shaped status labels and is not affected by this decision.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
