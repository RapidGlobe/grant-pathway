---
id: DDR-LA-001
category: Layout & Structure
status: Decided
---

# DDR-LA-001 — Application Flow Layout

## Question

Should the application flow screens (Steps 3, 4, and 5) use a single-column or two-column layout?

## Context

Steps 3 to 5 of the application flow involve significant content:

- **Step 3 (AI Summary):** A long AI-generated plain-English digest of the funder guidelines, potentially covering several sections (funder priorities, eligibility, questions, evidence expectations).
- **Step 4 (Draft Answers):** Multiple question-and-answer pairs, each with an editable textarea. The three mandatory review prompts (FR-32) must also appear alongside each answer.
- **Step 5 (Approve & Export):** A read-only view of all questions and answers, plus the approve and export actions.

The layout decision affects how readable and manageable this content feels on a desktop screen. The primary personas (Margaret and David) are both desktop users. The application is not optimised for mobile (PDR-UI-003).

Steps 1 and 2 are simpler (a short form and a file upload area) and are naturally single-column regardless of this decision.

## Options

- **Option A -- Single column:** All content stacks vertically in one column. The step indicator sits at the top, followed by the main content area. Simple to build and familiar to non-technical users. On wide screens, a max-width constraint keeps lines readable. Works well for Step 3 and Step 5. Step 4 can feel long and visually monotonous with many stacked question/answer pairs.
- **Option B -- Two column:** A wider main column on the left holds the primary content (AI summary, draft answers, questions). A narrower panel on the right holds contextual guidance, review prompts (FR-32), or the step summary. Makes better use of desktop width and keeps review prompts visible without interrupting reading flow. More complex layout to build. Requires careful responsive handling if mobile is ever added.
- **Option C -- Single column with sticky sidebar for Step 4 only:** Steps 3 and 5 use single column. Step 4 uses a two-column layout specifically because it needs to display review prompts alongside each answer. Provides the benefit of Option B where it matters most while keeping the majority of steps simple.

## Decision

**Option C -- Single column for Steps 1, 2, and 5; two column for Steps 3 and 4.**

- **Steps 1, 2, and 5** use a single-column layout. These steps contain short forms, a file upload area, and a read-only review respectively -- single column is the right fit for their content weight.
- **Steps 3 and 4** use a two-column layout. The main content column (left, approximately 640--680px) holds the AI summary or draft answers. The contextual panel (right, approximately 280--320px) holds review prompts (FR-32) in Step 4 and a questions-found summary in Step 3.
- The layout shift between steps is natural given the step indicator and page heading anchor each step as a distinct state.

## Date Decided

2026-04-17

---

_Status: Decided_
_Created: 2026-04-17_
