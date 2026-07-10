---
id: DDR-CS-006
category: Component Style
status: Decided
---

# DDR-CS-006 — Empty State Treatment

## Question

How should the empty state on the dashboard be visually presented when a user has no applications?

## Context

The dashboard empty state is the first screen a newly registered user sees after completing their charity profile. It must:

- Welcome the user warmly by name
- Guide them clearly towards starting their first application
- Explain the three-step process (Add funder guidelines -> Get AI summary -> Write your answers) without being overwhelming
- Convey that Grant Pathway is easy to use and they are in the right place

The empty state is a critical first impression and directly influences whether a new user feels confident enough to start. For the Margaret persona -- a volunteer with no prior AI experience -- this moment is especially important.

The screen requirements specify the exact content: welcome message, charity profile banner (if incomplete), empty state message, Start button, and three-step explainer. This decision is about the visual treatment of the three-step explainer and the overall visual weight of the empty state.

## Options

- **Option A -- Text and icons only:** The three-step explainer uses small Lucide icons (already available via shadcn/ui) beside each step label. Clean and minimal. Fast to implement. Slightly less engaging for a first-time user.
- **Option B -- Illustrated empty state graphic:** A bespoke or stock illustration (e.g. a person at a desk, a document, a pathway) centred above the empty state message. Warmer and more engaging than icons. Requires an illustration asset to be sourced or created. Risk: generic stock illustrations can feel impersonal.
- **Option C -- Large icon-based three-step explainer:** Each of the three steps is presented as a larger icon (48--64px) in a teal or amber icon container, with a bold step number, a short step label, and a one-line description. Displayed as three equally-weighted columns. More visual weight than Option A but no custom illustration needed.
- **Option D -- Numbered steps with teal accent line:** The three steps are displayed as a horizontal numbered sequence with a teal connector line between them (similar in style to the step indicator in DDR-CS-004). Step numbers in teal circles, step labels in Inter Bold, short descriptions in regular weight below. Consistent visual language with the application flow step indicator.
- **Option E -- Card-based steps:** Each of the three steps is presented as a small card (white, rounded, subtle shadow per DDR-CS-002) with an icon, number, and description. The cards sit side by side. Consistent with the card treatment used elsewhere in the product.

## Decision

**Option C -- Large icon-based three-step explainer.**

The three-step explainer on the dashboard empty state uses three equal-width columns, each containing a large icon (48--64px) in a branded icon container, a bold step number, a short step label, and a one-line description.

| Step | Label                 | Description                                      | Lucide icon candidate    |
| ---- | --------------------- | ------------------------------------------------ | ------------------------ |
| 1    | Add funder guidelines | Upload or paste your funder's guidelines         | `Upload` or `FileText`   |
| 2    | Get an AI summary     | We'll read and summarise the guidelines for you  | `Sparkles` or `Wand2`    |
| 3    | Write your answers    | You write every answer -- AI can help if you ask | `FileCheck` or `PenLine` |

**Icon container colour per mockup direction:**

| Mockup   | Direction              | Icon container colour              |
| -------- | ---------------------- | ---------------------------------- |
| Mockup 1 | Minimal & Professional | Teal (#0D6E6E)                     |
| Mockup 2 | Warm & Approachable    | Amber (#D97706)                    |
| Mockup 3 | Modern SaaS            | Soft teal (#E6F4F4) with teal icon |

Final icon selection from the Lucide library is a development detail. The three-step explainer is visually distinct from the five-step application flow indicator (DDR-CS-004) -- different patterns serve different purposes.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
