# App Name & Branding — Grant Pathway v1

**Tier:** 2 — Check if relevant to the task
**Volatility:** Medium
**Update when:** Any change to product name, domain, branding guidelines, or tone decisions

This document captures the confirmed product name, branding guidelines, and domain for Grant Pathway. These inform the BRD and all user-facing content, design, and communications.

---

## BR-01 — Official Product Name

|                             |                      |
| --------------------------- | -------------------- |
| **Official name**           | Grant Pathway        |
| **Working title (retired)** | AI Grant Accelerator |
| **Domain**                  | Grantpathway.org.uk  |

**Rationale:**
Grant Pathway positions the app as a guide and companion for charities navigating the grant application process. The name is warm, mission-aligned, and consistent with charity sector language. It does not lead with AI, which is intentional — the AI capability supports the user rather than defining the product. This aligns with the vision statement: "the trusted, free writing companion for UK charities."

The `.org.uk` domain extension signals non-commercial, public-benefit intent — appropriate for a free tool donated to the charity sector.

---

## BR-02 — Colour Palette

All colours are selected to meet WCAG 2.2 Level AA contrast requirements (C15).

| Role          | Name        | Hex Code  | Usage                                                  |
| ------------- | ----------- | --------- | ------------------------------------------------------ |
| Primary       | Deep teal   | `#0D6E6E` | Navigation, primary buttons, headings, key UI elements |
| Primary light | Soft teal   | `#E6F4F4` | Backgrounds, highlights, hover states                  |
| Accent        | Warm amber  | `#D97706` | Call-to-action buttons, key prompts, alerts            |
| Success       | Muted green | `#16A34A` | Confirmations, approved content, completed steps       |
| Neutral dark  | Slate       | `#1E293B` | Body text — softer than pure black, easier on the eye  |
| Neutral light | Off-white   | `#F8FAFC` | Page backgrounds                                       |
| White         | White       | `#FFFFFF` | Cards, panels, form fields                             |

**Rationale:**
The teal and amber combination is trustworthy and warm without being corporate or cold. Teal is distinctive within the charity tech space, where blue dominates. Amber provides energy and warmth for calls to action. The palette avoids pure black text on pure white backgrounds, which can cause visual stress for users with certain visual impairments.

---

## BR-03 — Typography

| Role              | Font  | Weight          | Minimum Size |
| ----------------- | ----- | --------------- | ------------ |
| Headings          | Inter | Bold (700)      | 20px         |
| Sub-headings      | Inter | Semi-bold (600) | 16px         |
| Body text         | Inter | Regular (400)   | 16px         |
| Labels & captions | Inter | Medium (500)    | 14px         |

**Source:** Google Fonts (free, open licence) — [fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)

**Rationale:**
Inter was designed specifically for screen readability and is one of the most widely used web fonts for application interfaces. Using a single font family across all text roles keeps the design clean and consistent. The 16px minimum body size exceeds WCAG guidance and improves readability for older users and those with visual impairments — both relevant in the charity volunteer demographic.

---

## BR-04 — Tone of Voice

Grant Pathway speaks to charity workers as capable professionals who are experts in their own work. The app supports them — it does not talk down to them.

| Principle         | Description                                                         | In Practice                                                                  |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Plain English** | No jargon, no AI-speak, no technical terminology                    | Write "here's a draft answer" not "AI-generated output has been synthesised" |
| **Encouraging**   | Acknowledge the user is doing something valuable                    | "You're making great progress on this application"                           |
| **Honest**        | Clear about what the app does and does not do                       | "This is a starting point — please review carefully before using"            |
| **Respectful**    | Non-patronising; charities know their work better than the app does | Avoid over-explaining context the user already understands                   |
| **Concise**       | Short sentences, active voice, no padding                           | Guidance and help text should never be longer than necessary                 |

**Key phrases to use:**

- "Draft answer" (not "AI output" or "generated content")
- "Review before using" (not "validate" or "verify")
- "Your application" (not "the application" — it belongs to them)
- "Funder guidelines" (not "prompt" or "input document")

**Key phrases to avoid:**

- Any reference to prompts, tokens, models, or inference
- "AI will now…" — keep AI in the background
- Passive voice where active is clearer
- Promises about funding outcomes

---

## BR-05 — Domain

|               |                                                           |
| ------------- | --------------------------------------------------------- |
| **Domain**    | Grantpathway.org.uk                                       |
| **Status**    | Registered ✅                                             |
| **Next step** | Point DNS to Vercel deployment once hosting is configured |

---

## Checklist Coverage

| Checklist Item | Description                                         | Status                         |
| -------------- | --------------------------------------------------- | ------------------------------ |
| Item 41        | Confirmed official product name                     | Covered by BR-01               |
| Item 42        | Branding guidelines — colours, fonts, tone of voice | Covered by BR-02, BR-03, BR-04 |
| Item 43        | Domain name                                         | Covered by BR-05               |

---

_Last updated: 2026-04-13_
_Sources: BRD Information Gathering Checklist items 41–43; vision-statement.md; constraints-and-assumptions.md (C15)_
