---
id: DR-AI-001
category: AI Strategy
status: Decided
---

# DR-AI-001 — AI Capabilities to Include

## Question

Which AI capabilities will the app provide?

## Context

"AI" covers a wide range of capabilities and each one has different implementation complexity, cost, and value to users. Being specific about which capabilities are in scope for v1 prevents overbuilding and ensures the AI features are genuinely useful rather than superficial. Capabilities range from text generation (writing application answers) to document understanding (summarising funder guidelines) to eligibility matching (assessing fit between a charity and a grant).

## Options

- **Option A: Text generation only** — AI drafts and improves grant application text based on user prompts and charity information
- **Option B: Document summarisation** — AI reads and summarises funder guidelines, application forms, and grant criteria
- **Option C: Eligibility matching** — AI assesses whether a charity is likely eligible for a given grant
- **Option D: Question answering / chat** — Users can ask the AI questions about grants, eligibility, or how to improve their application
- **Option E: Combination** — Multiple capabilities in scope (specify which)

## Decision

**Options A + B: Text generation and document summarisation** — The app will provide AI-powered grant application text generation and AI summarisation of funder guidelines and application forms.

## Rationale

These two capabilities work together to cover the full writing journey for a non-specialist user. Summarisation first demystifies the funder's guidelines and what each question is really asking. Text generation then helps the user draft compelling answers based on their charity's information. Together they address the core writing burden without requiring open-ended AI interaction. Eligibility matching (C) and chat (D) are better suited to future phases — matching depends on a grant database (deferred in DR-PS-002), and chat requires higher AI literacy than the target user has (DR-TU-003).

## Date Decided

2026-04-09
