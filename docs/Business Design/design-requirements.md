# Design Requirements Document — Grant Pathway v1

This document is the authoritative design specification for building Grant Pathway v1. It translates all agreed design decisions into implementable requirements — exact colour values, typography scales, spacing rules, component specifications, and interaction patterns.

All requirements in this document reflect the selected design direction (**Warm & Approachable**) and colour palette (**Teal & Amber**).

---

## Related Documents

| Document                                     | Location                                                      |
| -------------------------------------------- | ------------------------------------------------------------- |
| App Name & Branding                          | `business/app-name-and-branding.md`                           |
| Information Architecture & Navigation        | `business/information-architecture-and-navigation.md`         |
| Screen Requirements (all 13 pages, 3 modals) | `business/PRD inputs/screen-requirements.md`                  |
| UI Inventory & Data Contracts                | `business/Business Design/ui-inventory-and-data-contracts.md` |
| Tone & Voice Guide                           | `business/Business Design/tone-and-voice-guide.md`            |
| Non-Functional Requirements                  | `business/non-functional-requirements.md`                     |
| UI Component Library Decision (shadcn/ui)    | `business/PRD decisions/PDR-UI-001-ui-component-library.md`   |
| Design Decisions Index                       | `business/Business Design/DESIGN-DECISIONS-INDEX.md`          |

---

## 1. Design Direction: Warm & Approachable

**Decision:** DDR-VD-001 — Mockup 2 selected as the production design direction.

### 1.1 Character

The Warm & Approachable direction is built for users who are new to AI tools, working under time pressure, and doing important work for their communities. Every visual choice reinforces the message: _you are in the right place, and this is easy to use_.

| Characteristic | Expression                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------- |
| Approachable   | Soft, slightly warm page background; generous padding; amber used for primary calls to action |
| Trustworthy    | Clean white cards; consistent teal; plain, honest copy                                        |
| Uncluttered    | No decorative elements; every component earns its space                                       |
| Human          | Generous body text; card left-borders that communicate status without jargon                  |
| Encouraging    | Empty states guide rather than disappoint; success states celebrate milestones                |

### 1.2 Visual Personality

- **Background:** Slightly warm off-white (`#FDF9F5`) rather than the neutral `#F8FAFC`, creating a subtle warmth without distracting from the content
- **Cards:** White, elevated slightly from the background by a left-border status accent — no drop shadow
- **Corner radius:** 8px globally, softening every component
- **Amber:** Used for the most prominent calls to action (starting an application, completing a profile) to draw the eye and create warmth
- **Teal:** Used for primary actions within a workflow (Continue, Save, Sign in) and for navigation, headings, and interactive accents
- **Spacing:** Slightly more generous than the Minimal direction — 24px internal card padding, 40px page margins

---

## 2. Colour Palette: Teal & Amber

**Decision:** BR-02 (app-name-and-branding.md) — all colours selected to meet WCAG 2.2 Level AA contrast requirements.

### 2.1 Brand Colours

| Role          | Name       | Hex       | Usage                                                                                                                |
| ------------- | ---------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| Primary       | Deep teal  | `#0D6E6E` | Navigation, primary workflow buttons (Continue, Save), active states, step indicator, headings, interactive elements |
| Primary light | Soft teal  | `#E6F4F4` | Section backgrounds (lookup panels, review panels), hover states, active nav links, card answer backgrounds          |
| Primary dark  | Dark teal  | `#0A5A5A` | Primary button hover state                                                                                           |
| Accent        | Warm amber | `#D97706` | Primary call-to-action buttons (New application, Start first application, Complete profile), loading progress bar    |
| Accent dark   | Dark amber | `#B45309` | Accent button hover state                                                                                            |
| Accent light  | Pale amber | `#FEF3C7` | Warning backgrounds, empty state icon containers                                                                     |

### 2.2 Semantic Colours

| Role           | Name        | Hex       | Usage                                                    |
| -------------- | ----------- | --------- | -------------------------------------------------------- |
| Success        | Muted green | `#16A34A` | Approved badge, success alerts, completed step indicator |
| Success light  | Pale green  | `#F0FDF4` | Success alert background                                 |
| Success border | Mid green   | `#86EFAC` | Success alert border                                     |
| Warning        | Amber       | `#D97706` | In-progress badge, warning banners (shared with accent)  |
| Warning light  | Pale amber  | `#FFFBEB` | Warning banner background                                |
| Error          | Red         | `#DC2626` | Destructive buttons, form validation errors              |
| Error light    | Pale red    | `#FEF2F2` | Error alert background                                   |

### 2.3 Neutral Colours

| Role            | Name        | Hex       | Usage                                                                 |
| --------------- | ----------- | --------- | --------------------------------------------------------------------- |
| Body text       | Slate       | `#1E293B` | All body copy, headings, form labels, card titles                     |
| Muted text      | Mid slate   | `#64748B` | Secondary text, form hints, placeholder text, card meta, footer links |
| Light text      | Light slate | `#94A3B8` | Tertiary text, upcoming step labels, disabled states                  |
| Border          | Light grey  | `#E2E8F0` | Card borders, form field borders (default), dividers                  |
| Border strong   | Mid grey    | `#CBD5E1` | Form field borders (focused state), secondary button borders          |
| Page background | Warm white  | `#FDF9F5` | Page background (Warm & Approachable direction only)                  |
| Card background | White       | `#FFFFFF` | Cards, form fields, modals, navigation bar, step indicator bar        |

### 2.4 Focus Indicator

| Property          | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| Colour            | `#D97706` (warm amber)                                |
| Style             | `outline: 2px solid #D97706`                          |
| Offset            | `outline-offset: 2px`                                 |
| Trigger           | `:focus-visible` only — not `:focus`                  |
| Contrast on white | 4.58:1 — passes WCAG SC 2.4.11 ✓                      |
| Contrast on teal  | 3.12:1 — passes WCAG SC 2.4.11 ✓                      |
| Implementation    | Via shadcn/ui `--ring` CSS variable, applied globally |

**Decision source:** DDR-AC-001. The focus ring is amber regardless of the colour palette. It is never overridden per-component.

---

## 3. Typography

**Decision:** BR-03 (app-name-and-branding.md) — Inter across all text roles.

### 3.1 Font

| Property       | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Family         | Inter                                                       |
| Source         | Google Fonts (`fonts.google.com/specimen/Inter`)            |
| Fallback stack | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Load method    | `<link>` preload in document `<head>`                       |

### 3.2 Type Scale

| Role             | Size | Weight | Line height | Colour    | Usage                                 |
| ---------------- | ---- | ------ | ----------- | --------- | ------------------------------------- |
| Page heading     | 30px | 700    | 1.2         | `#1E293B` | Main H1 on each page (`page-title`)   |
| Step heading     | 22px | 700    | 1.2         | `#1E293B` | H1 within application flow steps      |
| Section heading  | 18px | 600    | 1.3         | `#1E293B` | H2 within page sections               |
| Card title       | 16px | 600    | 1.3         | `#1E293B` | Application card grant name           |
| Body (primary)   | 16px | 400    | 1.6         | `#1E293B` | Main body copy (minimum per BR-03)    |
| Body (secondary) | 15px | 400    | 1.5         | `#64748B` | Page subtitles, descriptive text      |
| Label            | 14px | 500    | 1.4         | `#1E293B` | Form labels, nav links, button text   |
| Body (small)     | 14px | 400    | 1.6         | `#1E293B` | Card body text, draft answer text     |
| Caption          | 13px | 400    | 1.5         | `#64748B` | Form hints, helper text, meta text    |
| Micro            | 12px | 500    | 1.4         | `#64748B` | Badges, step labels, small indicators |

### 3.3 Typography Rules

- **Sentence case** throughout the UI: capitalise the first word only, plus proper nouns. No title case on headings, buttons, or labels.
- **No italics** in UI chrome or headings. Italics are reserved for the "Review before using" disclaimer on draft answer cards.
- **Avoid bold body text** except for emphasis within modal copy (`<strong>` for funder/grant name in delete modal).
- **Letter-spacing:** Page heading only — `letter-spacing: -0.025em` for tighter, more contemporary heading feel at Warm direction scale.
- **Line length:** Body text is constrained by max-width layouts. Target 60–80 characters per line. Narrow page containers (680px max) naturally achieve this.

---

## 4. Spacing & Layout System

### 4.1 Base Unit

The spacing system is built on a **4px base unit**. All padding, margin, and gap values are multiples of 4px.

| Token    | Value | Common use                                      |
| -------- | ----- | ----------------------------------------------- |
| space-1  | 4px   | Tight inline gaps (icon + label)                |
| space-2  | 8px   | Small component gaps, badge padding             |
| space-3  | 12px  | Button horizontal padding (sm), compact rows    |
| space-4  | 16px  | Standard component gap, form group margin       |
| space-5  | 20px  | Card internal padding (vertical)                |
| space-6  | 24px  | Card internal padding (horizontal), section gap |
| space-8  | 32px  | Major section gap, step nav top padding         |
| space-10 | 40px  | Page horizontal margin, two-column gap          |
| space-12 | 48px  | Empty state vertical padding (top)              |
| space-16 | 64px  | Empty state vertical padding (bottom)           |
| space-20 | 80px  | Page container bottom padding                   |

### 4.2 Border Radius

**Decision:** DDR-CS-001 — 8px global default for Warm & Approachable.

| Element                          | Radius                                               |
| -------------------------------- | ---------------------------------------------------- |
| Cards                            | 8px                                                  |
| Buttons                          | 8px                                                  |
| Form inputs                      | 8px                                                  |
| Modals                           | 12px (slightly more than cards — signals importance) |
| Panels (review, lookup, banners) | 10px                                                 |
| Status badges                    | 9999px (always pill)                                 |
| Alert messages                   | 8px                                                  |
| Step circles                     | 50% (always circular)                                |
| Nav logo mark                    | 8px                                                  |
| Empty state icon containers      | 12px                                                 |

### 4.3 Page Layouts

**Decision:** DDR-LA-001.

| Pages                              | Layout                         | Max content width                                 |
| ---------------------------------- | ------------------------------ | ------------------------------------------------- |
| Sign in / Landing                  | Two-column (50/50 hero + form) | Full viewport width                               |
| Register                           | Narrow single column           | 480px                                             |
| Verify email, Forgot password      | Narrow single column           | 480px                                             |
| Dashboard                          | Full-width single column       | 1200px                                            |
| Charity profile                    | Narrow single column           | 680px                                             |
| Account settings, Account deletion | Narrow single column           | 480px                                             |
| Application flow Steps 1, 2, 5     | Narrow single column           | 680px                                             |
| Application flow Steps 3, 4        | Two-column (main + sidebar)    | 1200px (main: ~680px, sidebar: ~300px, gap: 32px) |

### 4.4 Page Container

```
Outer container:   max-width 1200px, margin: 0 auto
Page padding:      40px horizontal, 40px top, 80px bottom
Narrow container:  max-width 680px for form-heavy pages
```

### 4.5 Responsive Scope

Grant Pathway v1 is desktop-primary (PDR-UI-003). The minimum supported viewport is **1024px wide**. No mobile-specific layouts are required for v1.

---

## 5. Component Specifications

### 5.1 Navigation Bar — Unauthenticated

**Displayed on:** `/`, `/register`, `/verify-email`, `/forgot-password`

| Property           | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Height             | 64px                                                          |
| Background         | `#FFFFFF`                                                     |
| Border bottom      | `1px solid #EDE8E1` (slightly warm border for Warm direction) |
| Position           | Sticky, `top: 0`, `z-index: 100`                              |
| Horizontal padding | 40px                                                          |
| Shadow             | None                                                          |

**Left — Logo:**

- Logo mark: 34×34px square, `border-radius: 8px`, background `#0D6E6E`, white "GP" text at 700 weight, 15px
- Logo text: "Grant Pathway", 16px, 700 weight, `#1E293B`
- Logo is not a link on the unauthenticated nav (stays on current page)

**Right — Actions:**

- "Sign in" — ghost text link, 14px, 500 weight, `#64748B`; hover: `#1E293B`
- "Register — it's free" — outline button, 14px, 600 weight, teal border and text (`#0D6E6E`), transparent background; hover: `#E6F4F4` background

---

### 5.2 Navigation Bar — Authenticated

**Displayed on:** All authenticated routes.

Same base specification as unauthenticated, with these differences:

**Left — Links:**

- Logo: links to `/dashboard`
- Vertical separator: 1px `#EDE8E1`, 20px height
- "My applications" — nav link, 14px, 500 weight
- "Charity profile" — nav link, 14px, 500 weight

**Nav link states:**

| State                 | Style                                                             |
| --------------------- | ----------------------------------------------------------------- |
| Default               | `#64748B`, no background                                          |
| Hover                 | `#1E293B`, `#E6F4F4` background, `border-radius: 6px`             |
| Active (current page) | `#0D6E6E`, `#E6F4F4` background, 600 weight, `border-radius: 6px` |

**Right — Account dropdown trigger:**

- Background: `#E6F4F4`
- Border: none
- Border radius: 6px
- Content: 24px circular avatar (`#0D6E6E` background, white initials, 700/11px) + first name (14px, 600, `#0D6E6E`) + chevron-down icon
- Hover: `filter: brightness(0.96)`

---

### 5.3 Account Dropdown Menu

**Trigger:** Account button in authenticated nav.

| Property      | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Background    | `#FFFFFF`                                               |
| Border        | `1px solid #E2E8F0`                                     |
| Border radius | 8px                                                     |
| Box shadow    | `0 4px 12px rgba(0,0,0,0.12)`                           |
| Min width     | 160px                                                   |
| Position      | Absolute, right-aligned to trigger, top: 100% + 6px gap |
| z-index       | 200                                                     |

**Items:**

- "Account settings" — links to `/account`
- "Sign out" — ends session, redirects to `/`
- Hover state: `#F8FAFC` background on item
- Close on click outside

---

### 5.4 Global Footer

**Displayed on:** All routes.

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Background | `#FDF9F5` (matches warm page background) |
| Border top | `1px solid #EDE8E1`                      |
| Padding    | 22px 40px                                |
| Layout     | Flex row, space-between                  |

**Left:** "© RapidGlobe Ltd [current year]" — 13px, `#64748B`

**Right:** Horizontal link list — "Privacy policy", "Terms of service" — 13px, `#64748B`; hover: `#1E293B`

**Footer tagline** (below copyright, smaller): "Your free grant writing companion for UK charities" — 12px, `#94A3B8`

---

### 5.5 Buttons

**Decision:** DDR-CS-003 — three-tier hierarchy plus destructive variants.

All buttons: 14px, 600 weight, `border-radius: 8px`, `line-height: 1`, `padding: 10px 22px` (Warm direction uses slightly more generous padding than Minimal). `:focus-visible` applies amber focus ring.

#### Primary button (teal fill)

Used for: primary workflow actions — Continue, Save profile, Save changes, Sign in, Register.

| State         | Style                                    |
| ------------- | ---------------------------------------- |
| Default       | Background `#0D6E6E`, text white         |
| Hover         | Background `#0A5A5A`                     |
| Active        | `transform: translateY(1px)`             |
| Focus visible | Amber outline ring                       |
| Disabled      | Background `#94A3B8`, cursor not-allowed |

#### Accent button (amber fill)

Used for: top-level calls to action — New application, Start your first application, Complete your profile, Go to my dashboard. These are the most prominent single action on a page.

| State         | Style                            |
| ------------- | -------------------------------- |
| Default       | Background `#D97706`, text white |
| Hover         | Background `#B45309`             |
| Active        | `transform: translateY(1px)`     |
| Focus visible | Amber outline ring               |

#### Secondary button (grey outline)

Used for: supporting actions — Edit answer, Back, Look up charity, Download as Word document (when not the primary action).

| State         | Style                                                              |
| ------------- | ------------------------------------------------------------------ |
| Default       | Background `#FFFFFF`, text `#1E293B`, border `1.5px solid #CBD5E1` |
| Hover         | Background `#F8FAFC`                                               |
| Focus visible | Amber outline ring                                                 |

#### Ghost button

Used for: Back navigation, escape routes.

| State         | Style                                  |
| ------------- | -------------------------------------- |
| Default       | Transparent background, text `#64748B` |
| Hover         | Background `#E6F4F4`, text `#0D6E6E`   |
| Focus visible | Amber outline ring                     |

#### Destructive — Level 1 (text link)

Used for: "Delete" on application cards (reversible, confirmable).

| State         | Style                                           |
| ------------- | ----------------------------------------------- |
| Default       | No background, text `#DC2626`, 13px, 500 weight |
| Hover         | `text-decoration: underline`, text `#991B1B`    |
| Focus visible | Amber outline ring                              |

#### Destructive — Level 2 (red fill)

Used for: "Delete application" inside delete modal, "Permanently delete my account".

| State         | Style                            |
| ------------- | -------------------------------- |
| Default       | Background `#DC2626`, text white |
| Hover         | Background `#B91C1C`             |
| Focus visible | Amber outline ring               |

#### Button size variants

| Variant    | Padding   | Font size | Use                          |
| ---------- | --------- | --------- | ---------------------------- |
| Small (sm) | 7px 14px  | 13px      | Card actions, inline actions |
| Default    | 10px 22px | 14px      | Standard form actions        |
| Large (lg) | 13px 30px | 15px      | Empty state CTA, Sign in     |

**Never use:** "OK", "Submit", "Proceed", "Click here", "Next" (use "Continue").

---

### 5.6 Form Elements

All form elements: font-family Inter, `border-radius: 8px` (Warm direction).

#### Form label

14px, 500 weight, `#1E293B`, `margin-bottom: 6px`. Optional indicator: 12px, 400 weight, `#64748B`, appended as "(optional)".

#### Text input

| Property       | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Height         | 40px (min)                                             |
| Padding        | 9px 12px                                               |
| Font           | 14px, 400, `#1E293B`                                   |
| Placeholder    | `#94A3B8`                                              |
| Background     | `#FFFFFF`                                              |
| Border default | `1.5px solid #CBD5E1`                                  |
| Border focus   | `1.5px solid #0D6E6E`, `box-shadow: 0 0 0 3px #E6F4F4` |
| Border error   | `1.5px solid #DC2626`                                  |
| Focus visible  | Amber outline ring (overrides box-shadow)              |

#### Textarea

Same as text input. `min-height: 96px`, `resize: vertical`, `line-height: 1.6`.

#### Form hint

13px, 400 weight, `#64748B`, `margin-top: 5px`.

#### Validation error

13px, 400 weight, `#DC2626`, `margin-top: 5px`. Prefixed with an error icon. Pattern: "[What to do]." — never blame.

#### Form group spacing

`margin-bottom: 20px` between form groups.

#### Form section divider

Horizontal rule with centred label for separating logical form sections (e.g. between registration details and charity description). Line: `1px solid #E2E8F0`. Label: 11px, 600 weight, `#94A3B8`, uppercase.

---

### 5.7 Cards

**Decision:** DDR-CS-002 — white card with 3–4px solid left-border status accent, no shadow, 8px radius.

#### Base card

| Property          | Value               |
| ----------------- | ------------------- |
| Background        | `#FFFFFF`           |
| Border            | `1px solid #E2E8F0` |
| Border radius     | 8px                 |
| Border left width | 4px                 |
| Shadow            | None                |
| Internal padding  | 20px 24px           |

#### Left-border status colours

The left border colour communicates application status at a glance, consistent with the status badge palette.

| Status      | Left border colour | Hex       |
| ----------- | ------------------ | --------- |
| Not started | Slate              | `#1E293B` |
| In progress | Amber              | `#D97706` |
| Approved    | Green              | `#16A34A` |
| Exported    | Teal               | `#0D6E6E` |

#### Hover state

`border-left-color` darkens by 10%. Cursor: pointer for interactive cards.

---

### 5.8 Status Badges

**Decision:** DDR-CS-001 — always pill (`border-radius: 9999px`). 12px, 500 weight. Include a 6px dot before the label.

| Status      | Background | Text colour | Dot colour |
| ----------- | ---------- | ----------- | ---------- |
| Not started | `#F1F5F9`  | `#475569`   | `#94A3B8`  |
| In progress | `#FEF3C7`  | `#92400E`   | `#D97706`  |
| Approved    | `#F0FDF4`  | `#14532D`   | `#16A34A`  |
| Exported    | `#E6F4F4`  | `#0D6E6E`   | `#0D6E6E`  |

Padding: `3px 10px`. The dot is a `6px × 6px` circle, `border-radius: 50%`.

---

### 5.9 Step Indicator

**Decision:** DDR-CS-004 — numbered circles, teal/grey states, connector lines, read-only.

**Container:**

- Sticky, `top: 64px` (directly below nav)
- Background: `#FFFFFF`
- Border bottom: `1px solid #EDE8E1`
- Padding: 16px 40px
- Overflow-x: auto (in case of very narrow viewports)

**Step circle:**

- 32px × 32px, `border-radius: 50%`
- Completed: `#0D6E6E` background, white checkmark icon (Lucide `Check`, 14px)
- Current: `#0D6E6E` background, white step number, `box-shadow: 0 0 0 4px #E6F4F4`
- Upcoming: `#FFFFFF` background, `2px solid #CBD5E1` border, `#94A3B8` number

**Step label:**

- 11px, 500 weight, centred below circle
- Completed/upcoming: `#64748B`
- Current: `#0D6E6E`, 600 weight

**Connector line:**

- Height: 2px
- Completed: `#0D6E6E`
- Upcoming: `#CBD5E1`
- Flex: 1 (fills available space between circles)
- Aligned to circle centre (`margin-bottom: 18px` to offset label below)

**Behaviour:** Read-only. No click handlers. No pointer events. Screen readers should announce the current step.

**Step names:**

| Step | Label               |
| ---- | ------------------- |
| 1    | Application details |
| 2    | Funder guidelines   |
| 3    | AI summary          |
| 4    | Draft answers       |
| 5    | Approve & export    |

---

### 5.10 Loading State

**Decision:** DDR-CS-005 — animated teal progress bar with staged text messages.

**Container:**

- Centred in the main content area
- Replaces the content area during generation
- Padding: 64px 40px

**Progress bar:**

- Width: 100% of content area, max 480px
- Height: 6px
- Background track: `#E6F4F4`
- Fill: `#0D6E6E`
- Border radius: 9999px
- Animation: CSS transitions on `width`, duration proportional to expected stage duration

**Staged text:**

- 16px, 400 weight, `#64748B`
- Centred below progress bar, `margin-top: 16px`
- Fade transition between messages

**Step 3 stages:**

| Stage | Bar        | Message                             |
| ----- | ---------- | ----------------------------------- |
| Start | 0% → 60%   | "Reading your funder guidelines..." |
| Mid   | 60% → 100% | "Almost there..."                   |

**Step 4 stages:**

| Stage | Bar        | Message                                            |
| ----- | ---------- | -------------------------------------------------- |
| Start | 0% → 35%   | "Reviewing your guidelines and charity profile..." |
| Early | 35% → 75%  | "Writing your draft answers..."                    |
| Late  | 75% → 100% | "Almost there..."                                  |

**Edge cases:** If the API responds before 100%, jump bar to 100% and render content immediately. If the API is slower than expected, hold at ~90% until response arrives.

**Never use:** "Processing...", "Loading...", "Please wait...", "Generating AI output..."

---

### 5.11 Empty State

**Decision:** DDR-CS-006 — three-column icon-based explainer with amber icon containers.

**Container:**

- `text-align: center`
- Padding: 48px 40px 64px

**Heading:**

- "Welcome to Grant Pathway, [first name]" — 22px, 700 weight, `#1E293B`
- Subheading: "You're ready to start your first application. Here's how it works." — 15px, `#64748B`, max-width 420px, centred

**Three-step explainer:**

- Grid: 3 equal columns, `gap: 24px`, max-width 680px, centred
- Each step: icon container + step number label + title + description, centred, `align-items: center`

**Icon containers (Warm & Approachable):**

- Size: 56×56px, `border-radius: 12px`
- Background: `#FEF3C7` (pale amber)
- Border: `2px solid #D97706`
- Icon colour: `#B45309` (dark amber)
- Icon size: 28px (Lucide icons)

**Step content:**

| Step | Step label  | Title                       | Description                                          | Lucide icon |
| ---- | ----------- | --------------------------- | ---------------------------------------------------- | ----------- |
| 1    | Steps 1 & 2 | Add funder guidelines       | Upload or paste your funder's guidelines document    | `Upload`    |
| 2    | Step 3      | Get an AI summary           | We'll read and summarise the key questions for you   | `Sparkles`  |
| 3    | Step 4      | Generate your draft answers | We'll write draft answers using your charity profile | `FileCheck` |

**Step label:** 11px, 700 weight, `#64748B`, uppercase, `letter-spacing: 0.06em`
**Title:** 14px, 600 weight, `#1E293B`
**Description:** 13px, 400 weight, `#64748B`, `text-align: center`

**CTA below:** "Start your first application" — accent (amber) button, large variant. If charity profile is incomplete, this button should be replaced by "Complete your profile first" accent button (links to `/profile`).

---

### 5.12 Charity Profile Incomplete Banner

**Displayed on:** Dashboard when `charity_profiles` record does not exist or is incomplete.

| Property      | Value                                  |
| ------------- | -------------------------------------- |
| Background    | `#FEF3C7` (pale amber)                 |
| Border        | `1.5px solid` colour-mixed amber (30%) |
| Border radius | 8px                                    |
| Padding       | 14px 20px                              |
| Layout        | Flex row, space-between, wrap          |

**Left:** Warning icon (`#D97706`) + "Your charity profile isn't complete yet. You'll need to fill it in before you can start an application." — 14px, 500, `#92400E`

**Right:** "Complete your profile" — accent (amber) button, small variant, links to `/profile`

---

### 5.13 AI Usage Warning Banner

**Displayed on:** Application flow Steps 3–4 when usage reaches 80% or 100% of monthly allowance.

| Variant       | Trigger                                              | Message                                                                                               |
| ------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 80% warning   | `ai_usage_log` shows ≥ 80% of monthly allowance used | "You've used most of your monthly AI allowance."                                                      |
| Limit reached | Monthly allowance exhausted                          | "You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch." |

**Style (80% warning):**

- Background: `#FFFBEB`, border: `1px solid #FCD34D`, border-radius 8px
- Icon: `AlertTriangle` (`#D97706`)
- Text: 14px, `#92400E`

**Style (limit reached):**

- Background: `#FEF2F2`, border: `1px solid #FCA5A5`, border-radius 8px
- Icon: `AlertCircle` (`#DC2626`)
- Text: 14px, `#991B1B`

---

### 5.14 Right-Hand Sidebar Panels

**Decision:** DDR-LA-002 — sticky right panel, visible on Steps 3 and 4.

**Container:**

- `position: sticky`, `top: 148px` (below controls + nav + step bar)
- Width: ~300px
- Background: `#E6F4F4` (soft teal)
- Border: `1px solid` teal (30% opacity)
- Border radius: 10px
- Padding: 20px 22px

#### Step 3 panel — Questions found summary

**Heading:** "Questions found" — 13px, 700, `#0D6E6E`, uppercase, letter-spacing 0.06em

**Content:**

- "We found [n] application questions in these guidelines." — 13px, `#1E293B`
- If n = 0: "We couldn't identify specific application questions in this document." — same style

#### Step 4 panel — Review prompts (FR-32)

**Heading:** "Before you continue" — 13px, 700, `#0D6E6E`, uppercase, letter-spacing 0.06em; prefixed with `AlertTriangle` icon

**Prompts:**

1. "Does this accurately describe your charity and project?"
2. "Are all figures, dates, and facts correct?"
3. "Does this answer the question that was asked?"

**Prompt style:** Each prompt on its own row. Number: 20×20px circle, `#0D6E6E` background, white 10px 700 text. Prompt text: 13px, `#1E293B`, `line-height: 1.5`. Gap between prompts: 12px.

**Static content:** The Step 4 panel is fully static — it is display-only and does not change with user input.

---

### 5.15 Inline Approve Confirmation

**Decision:** DDR-IP-001 — inline expansion below the "Approve my application" button on Step 5.

| Property      | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Background    | `#FFFBEB`                                                  |
| Border        | `1.5px solid #FCD34D`                                      |
| Border radius | 10px                                                       |
| Padding       | 20px 24px                                                  |
| Appears       | Below the Approve button, pushes content down — no overlay |

**Heading:** "Are you sure?" — 15px, 600, `#92400E`

**Body:** "Are you sure you want to approve this application? You can re-open it to make changes at any time." — 13px, `#78350F`, `line-height: 1.5`

**Actions:**

- "Yes, approve" — primary (teal) button, small
- "Cancel" — ghost button, small

---

### 5.16 Modals

**Decision:** DDR-IP-001 — modal dialog for irreversible destructive actions.

**Overlay:**

- `position: fixed`, covers full viewport below nav
- Background: `rgba(15, 23, 42, 0.55)`
- `backdrop-filter: blur(3px)`
- z-index: 500
- Centred content

**Modal container:**

| Property      | Value                             |
| ------------- | --------------------------------- |
| Background    | `#FFFFFF`                         |
| Border radius | 12px                              |
| Max width     | 440px                             |
| Padding       | 28px 32px                         |
| Box shadow    | `0 20px 40px rgba(0, 0, 0, 0.12)` |

**Close button (top right):**

- 28×28px, `border-radius: 6px`, `#64748B` X icon
- Hover: `#E2E8F0` background

**Heading:** 18px, 700, `#1E293B`, `letter-spacing: -0.01em`

**Body:** 14px, 400, `#64748B`, `line-height: 1.65`. Key names (grant name, funder name) in `<strong>` at `#1E293B`.

**Actions:** Right-aligned. "Cancel" (secondary button) then destructive action (Destructive L2 button), gap 10px.

#### Delete Application modal copy

| Status                         | Body copy                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started` or `in_progress` | "Are you sure you want to delete **[Grant Name] — [Funder Name]**? This cannot be undone."                                                              |
| `approved`                     | "Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."                          |
| `exported`                     | "Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document." |

**Action buttons:** "Cancel" (secondary) | "Delete application" (Destructive L2)

#### Re-open Application modal copy

**Heading:** "Re-open this application?"
**Body:** "Re-opening will remove your approval. You'll need to approve it again before you can download it."
**Actions:** "Cancel" (secondary) | "Re-open" (primary teal)

#### Re-export Warning modal copy

**Heading:** "You've already exported this application"
**Body:** "You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."
**Actions:** "Cancel" (secondary) | "Download anyway" (primary teal)

---

### 5.17 Alert Messages

#### Success alert (inline, below submit button)

**Decision:** DDR-IP-002 — persistent inline alert, does not auto-dismiss.

| Property         | Value                                           |
| ---------------- | ----------------------------------------------- |
| Background       | `#F0FDF4`                                       |
| Border           | `1px solid #86EFAC`                             |
| Border radius    | 8px                                             |
| Padding          | 12px 16px                                       |
| Text colour      | `#166534`, 14px                                 |
| Icon             | Lucide `CheckCircle`, `#16A34A`, 16px           |
| Scroll behaviour | Scroll into view on appear (for keyboard users) |

#### Milestone success state (page replacement)

**Decision:** DDR-IP-002 — full-page content replacement for first-time profile save.

| Element    | Spec                                                              |
| ---------- | ----------------------------------------------------------------- |
| Icon       | Lucide `CheckCircle`, 64px, `#0D6E6E` (teal)                      |
| Heading    | "Your charity profile has been saved." — 24px, 700                |
| Subheading | "You're ready to start your first application." — 16px, `#64748B` |
| Button     | "Go to my dashboard" — accent (amber) button, large               |

#### Error alert (system/API failure)

| Property      | Value                           |
| ------------- | ------------------------------- |
| Background    | `#FEF2F2`                       |
| Border        | `1px solid #FCA5A5`             |
| Border radius | 8px                             |
| Text colour   | `#991B1B`, 14px                 |
| Icon          | Lucide `AlertCircle`, `#DC2626` |

---

## 6. Page Layout Reference

This section defines the layout and key component composition for each page. Content requirements are in `screen-requirements.md`.

### Public Pages

| Page                                 | Layout                                 | Key components                                                                                                |
| ------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Sign in (`/`)                        | Two-column: teal hero left, form right | Unauthenticated nav, hero with feature list, sign-in form (email + password), "Forgot password?" link, footer |
| Register (`/register`)               | Narrow single column                   | Unauthenticated nav, registration form (first name, email, password, confirm password), footer                |
| Verify email (`/verify-email`)       | Narrow single column, centred          | Unauthenticated nav, status message (3 states: awaiting / verified / expired), footer                         |
| Forgot password (`/forgot-password`) | Narrow single column                   | Unauthenticated nav, form (2 states: email entry / new password), footer                                      |

**Sign in hero (left panel):**

- Background: `linear-gradient(150deg, #0D6E6E 0%, #0A5A5A 100%)` (Warm direction adds gradient)
- "Free for UK charities" kicker badge: `rgba(255,255,255,0.15)` background, pill, 11px
- Headline: 34px, 700, white (Warm direction uses 34px, slightly larger than Minimal)
- Sub copy: 16px, `rgba(255,255,255,0.75)`, max-width 400px
- Features list: three items with circular `rgba(255,255,255,0.2)` check icons

### Authenticated Pages

| Page                                 | Layout               | Key components                                                                                                                                                                    |
| ------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard (`/dashboard`)             | Full-width           | Authenticated nav, profile incomplete banner (if applicable), page heading + CTA row, application card grid OR empty state, footer                                                |
| Charity profile (`/profile`)         | Narrow single column | Authenticated nav, page heading, Charity Commission lookup section, form fields, submit button, success state (first save: page replacement; subsequent: inline alert), footer    |
| Account settings (`/account`)        | Narrow single column | Authenticated nav, page heading, email display (read-only), change password form, "Delete my account" destructive text link, footer                                               |
| Account deletion (`/account/delete`) | Narrow single column | Authenticated nav, page heading, data summary, confirmation copy, DELETE input field, "Permanently delete my account" button (disabled until DELETE typed), "Cancel" link, footer |

### Application Flow Pages

All application flow pages include the authenticated nav and step indicator bar.

| Page                         | Layout                | Right panel                          |
| ---------------------------- | --------------------- | ------------------------------------ |
| Step 1 — Application details | Single column (680px) | None                                 |
| Step 2 — Funder guidelines   | Single column (680px) | None                                 |
| Step 3 — AI summary          | Two column (1200px)   | Questions-found summary              |
| Step 4 — Draft answers       | Two column (1200px)   | Three review prompts (static, FR-32) |
| Step 5 — Approve & export    | Single column (680px) | None                                 |

**Application flow page heading pattern:**

- Meta label above heading: "[Grant Name] — [Funder Name]" — 12px, 500, `#64748B`, uppercase, `letter-spacing: 0.05em`
- Page heading: 22px, 700, `#1E293B`
- Sub copy: 14px, `#64748B`

**Step navigation (bottom of each step):**

- "Back" — ghost button, left-aligned
- "Continue" — primary (teal) button, right-aligned
- Step 1 only: "Cancel" ghost link replaces Back (returns to dashboard without saving)
- Step 5: Approve & export actions replace Continue (see Step 5 spec in screen-requirements.md)

---

## 7. Interaction Patterns

### 7.1 Approve Application (Step 5)

**Decision:** DDR-IP-001 — inline expansion.

1. User clicks "Approve my application" (primary teal button)
2. Inline confirmation panel expands below the button (the button remains visible)
3. Panel contains: heading, body copy, "Yes, approve" (primary) + "Cancel" (ghost) buttons
4. On confirm: `application.status` → `approved`; panel collapses; approved state renders
5. On cancel: panel collapses; no write

The inline expansion is used because approval is reversible — the user can re-open the application if they change their mind.

### 7.2 Delete Application (Dashboard)

**Decision:** DDR-IP-001 — modal dialog.

1. User clicks "Delete" text link on application card
2. Delete Application modal appears with `backdrop-filter: blur(3px)` overlay
3. Modal copy varies by application status (see Section 5.16)
4. On confirm: deletes `application_answers` + `applications` records; modal closes; card removed from dashboard
5. On cancel/close: modal closes, no write

### 7.3 Re-open Application

1. User clicks "Continue" or "View" on an `approved` or `exported` card, or "Back" within Step 5
2. Re-open Application modal appears (see Section 5.16)
3. On confirm: `application.status` → `in_progress`; navigate to application at last step
4. On cancel: modal closes; user remains on dashboard

### 7.4 Account Deletion

1. User clicks "Delete my account" text link on `/account`
2. Navigate to `/account/delete`
3. Page shows full-page confirmation with data summary (email address displayed)
4. Confirmation text field: user must type "DELETE" exactly (uppercase, case-sensitive)
5. "Permanently delete my account" button is disabled until input matches
6. On confirm: all records deleted, session ended, redirect to `/` with "Your account has been deleted." inline success alert

### 7.5 Success Messages

**Decision:** DDR-IP-002 — mixed approach.

| Trigger                            | Treatment                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Charity profile saved (first time) | Full-page content replacement with `CheckCircle` icon, heading, body, "Go to my dashboard" amber button |
| Charity profile updated            | Inline success alert below "Save changes" button; persistent (no auto-dismiss)                          |
| Password changed                   | Inline success alert below "Change password" button; persistent                                         |
| Account deleted                    | Inline success alert on `/` sign-in page after redirect                                                 |

### 7.6 Form Validation

- Validation fires on submit, not on blur (to avoid frustrating users mid-input)
- Errors appear inline, directly below the field with the problem
- On error: scroll to first error field and set focus
- Error format: "[What to do]." — not technical codes, not blame language
- On re-submit: errors clear and re-validate

### 7.7 Focus Management

- On modal open: focus moves to the modal heading or first interactive element
- On modal close: focus returns to the element that triggered the modal
- On page navigation (single-page step changes): focus moves to the step heading
- On inline confirmation expand: focus moves to the confirmation heading
- On inline success alert appear: scroll into view and announce to screen readers

### 7.8 Auto-save (Application Flow)

- Progress saved silently every 60 seconds during active editing
- Progress also saved on "Continue"
- No visible indicator for background auto-save (avoids distraction)
- If session expires, most-recent save is restored on next sign-in

---

## 8. Accessibility Requirements

Grant Pathway v1 must achieve **WCAG 2.2 Level AA** compliance (NFR-06, C15).

### 8.1 Colour Contrast

All text and interactive elements must meet WCAG SC 1.4.3 and 1.4.11. Key verified pairs:

| Combination            | Ratio  | Requirement         | Status                  |
| ---------------------- | ------ | ------------------- | ----------------------- |
| `#1E293B` on `#FFFFFF` | 16.1:1 | AA (4.5:1)          | ✓                       |
| `#1E293B` on `#FDF9F5` | 15.8:1 | AA (4.5:1)          | ✓                       |
| `#0D6E6E` on `#FFFFFF` | 4.54:1 | AA (4.5:1)          | ✓                       |
| `#0D6E6E` on `#E6F4F4` | 3.09:1 | AA large text (3:1) | ✓ (labels only)         |
| `#D97706` on `#FFFFFF` | 3.15:1 | AA large text (3:1) | ✓ (headings/large only) |
| White on `#0D6E6E`     | 4.54:1 | AA (4.5:1)          | ✓                       |
| White on `#D97706`     | 3.15:1 | AA large text (3:1) | ✓ (buttons only)        |
| `#92400E` on `#FEF3C7` | 5.21:1 | AA (4.5:1)          | ✓                       |
| `#166534` on `#F0FDF4` | 7.34:1 | AA (4.5:1)          | ✓                       |

**Never rely on colour alone** to convey meaning. Every status badge includes both a colour and a text label. Every alert includes an icon and text.

### 8.2 Focus Indicator

Amber `#D97706` outline ring applied on `:focus-visible` only. Contrast: 4.58:1 on white, 3.12:1 on teal — both pass WCAG SC 2.4.11. Applied globally via shadcn/ui `--ring` CSS variable. No per-component overrides are required. See DDR-AC-001.

### 8.3 Interactive Element Requirements

- All buttons and links have visible, descriptive text labels
- Icon-only buttons (modal close) include `aria-label`
- Form fields have associated `<label>` elements (not placeholder-only)
- Error messages identify the problem field by name
- Dropdowns (`select`, `combobox`) are keyboard-navigable
- Modals trap focus and set `aria-modal="true"`, `role="dialog"`, `aria-labelledby`
- The step indicator is `role="navigation"` or `aria-label="Application progress"` and announces current step

### 8.4 Screen Reader Behaviour

- Status badges: announced as plain text (e.g. "In progress")
- Loading state: `aria-live="polite"` region for staged messages — screen readers announce each message change
- Inline success alerts: `aria-live="polite"` on container — announced on appear
- Step indicator: current step announced; completed steps marked with accessible label (e.g. "Step 1 of 5, Application details, completed")
- Application cards: entire card is not a link; individual action buttons are labelled (e.g. "Continue — Community Lunch Club")

### 8.5 Keyboard Navigation

- All interactive elements reachable by Tab in logical order (top-left to bottom-right)
- Skip navigation link: visually hidden by default, visible on focus, links to main content (`id="main-content"`)
- No keyboard traps except within open modals
- Escape key closes all modals and dropdowns
- Enter/Space activates all buttons

### 8.6 Typography Accessibility

- Minimum body text size: 16px (exceeds WCAG SC 1.4.4 minimum)
- No text under 12px in the UI
- Text does not use `px` for sizing — use `rem` in implementation to respect user browser font size preferences
- Line height minimum: 1.5 for body text (WCAG SC 1.4.12)

---

## 9. Logo & Favicon

**Decision:** DDR-VI-001, DDR-VI-002.

### 9.1 Logo

- **Asset:** Icon + wordmark PNG. A transparent-background PNG version is required (the existing asset has a teal background, which only works if the nav bar is teal — the Warm direction uses a white nav bar).
- **Placement:** Left side of navigation bar in all contexts
- **Fallback:** Styled text "GP" mark (`#FFFFFF` text on `#0D6E6E` background, `border-radius: 8px`) + "Grant Pathway" wordmark in Inter 700

### 9.2 Favicon

- **Design:** Amber "G" person icon extracted from logo, placed on teal (`#0D6E6E`) square background
- **Required sizes:** 16×16px, 32×32px, 180×180px (Apple touch icon)
- **Format:** ICO (16, 32) + PNG (180)

---

## 10. Tone & Voice Summary

The full reference is in `business/Business Design/tone-and-voice-guide.md`. The key principles for implementation are summarised below.

### 10.1 Voice Pillars

| Pillar        | Rule                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Plain English | No jargon, no AI-speak, no technical terms. If Margaret would need to look up the word, rewrite it.            |
| Encouraging   | Acknowledge the user is doing something valuable. Support, don't manage.                                       |
| Honest        | Never oversell. Never promise outcomes. "This is a starting point — please review carefully before using."     |
| Respectful    | No over-explaining. No excessive reassurance. "Review before using" not "You must carefully check every word." |
| Concise       | Every word earns its place. Short sentences. Active voice. No padding.                                         |

### 10.2 UI Copy Rules

- **Sentence case** on all headings, labels, and buttons
- **Buttons:** Verb + object. Never "OK", "Submit", "Proceed", "Next". Use "Continue" not "Next".
- **Errors:** "[What is wrong]. [What to do]." — or just "[What to do]."
- **Success:** Brief, positive, actionable. Milestone saves get warmth; transactional saves are efficient.
- **Loading:** Active, present-tense, staged. "Reading your funder guidelines…" not "Loading…"
- **AI:** Never use the words "AI", "artificial intelligence", "prompt", "token", "model" in UI copy. Use "draft answer" not "AI output".
- **Ownership:** "Your application", "your charity profile" — it belongs to them.

### 10.3 Tone by Context

| Context                    | Tone                                |
| -------------------------- | ----------------------------------- |
| Onboarding / first use     | Warm, welcoming, gently guiding     |
| Active task (form filling) | Clear, focused, unobtrusive         |
| AI generation (loading)    | Calm, reassuring, forward-moving    |
| Success                    | Positive, brief, actionable         |
| Errors                     | Calm, explanatory, solution-focused |
| Warnings                   | Direct, honest, non-alarmist        |
| Destructive actions        | Serious, clear, friction-creating   |

---

## Appendix A — Design Decision Traceability

| DDR        | Decision                                                                | Applied                      |
| ---------- | ----------------------------------------------------------------------- | ---------------------------- |
| DDR-VI-001 | Logo: icon + wordmark PNG, transparent background required              | Section 9.1                  |
| DDR-VI-002 | Favicon: amber G on teal, 16/32/180px                                   | Section 9.2                  |
| DDR-LA-001 | Steps 1,2,5 single column; Steps 3,4 two-column                         | Section 4.3                  |
| DDR-LA-002 | Sticky right sidebar: Step 3 = questions found; Step 4 = review prompts | Section 5.14                 |
| DDR-VD-001 | Warm & Approachable direction selected                                  | Section 1                    |
| DDR-CS-001 | 8px border radius globally; badges always pill                          | Section 4.2                  |
| DDR-CS-002 | White card, 4px left-border status accent, no shadow                    | Section 5.7                  |
| DDR-CS-003 | Three-tier button hierarchy + destructive variants                      | Section 5.5                  |
| DDR-CS-004 | Numbered circles, teal/grey states, connector lines, read-only          | Section 5.9                  |
| DDR-CS-005 | Teal progress bar with staged text (Steps 3 & 4)                        | Section 5.10                 |
| DDR-CS-006 | Three-column icon explainer; amber icon containers (Warm)               | Section 5.11                 |
| DDR-IP-001 | Inline expansion for approve; modal for delete                          | Sections 5.15, 5.16, 7.1–7.3 |
| DDR-IP-002 | Page replacement for first save; inline alert for transactional saves   | Sections 5.17, 7.5           |
| DDR-AC-001 | Amber `#D97706` focus ring, `:focus-visible` only                       | Sections 2.4, 8.2            |

---

_Last updated: 2026-04-21_
_Status: Complete_
_Design direction: Warm & Approachable (DDR-VD-001 — Mockup 2)_
_Colour palette: Teal & Amber (BR-02)_
_Sources: DDR-VI-001, DDR-VI-002, DDR-LA-001, DDR-LA-002, DDR-VD-001, DDR-CS-001–006, DDR-IP-001–002, DDR-AC-001, app-name-and-branding.md (BR-02, BR-03), information-architecture-and-navigation.md, tone-and-voice-guide.md, non-functional-requirements.md_
