---
id: DR-AI-003
category: AI Strategy
status: Decided
---

# DR-AI-003 — AI Output Validation Before Submission

## Question

How will AI-generated content be validated before a charity submits a grant application?

## Context

AI language models can generate plausible-sounding but inaccurate content — this is especially risky in grant applications where false statements could damage a charity's reputation with funders or breach application terms. A human review step adds friction but protects charities. Automated validation (e.g. fact-checking against the charity's own documents) can catch some issues but not all. The level of validation required is also influenced by the liability position established in DR-LC-002.

## Options

- **Option A: Human review required** — The app explicitly requires the user to review and approve all AI-generated content before it can be used in a submission
- **Option B: Human review encouraged** — The app clearly prompts users to review AI content but does not enforce it
- **Option C: Automated validation** — The app checks AI output against source documents and flags potential inconsistencies
- **Option D: Combination of automated and human review** — Automated checks run first, then human sign-off is required
- **Option E: No enforced validation** — The app generates content and users decide what to do with it; no validation step

## Decision

**Option A: Human review required** — The app will enforce a review and approval step before AI-generated content can be used in a grant application, accompanied by plain-language guidance on what to check.

## Rationale

Enforcing a review step provides the strongest protection for charities and is appropriate given the primary user is a non-specialist (DR-TU-001). To prevent the review becoming a rubber-stamp, the app will pair the enforcement with specific, plain-language prompts guiding the user on what to look for (e.g. factual accuracy, correct figures, relevance to the question asked). Automated validation can be added as a future enhancement. This decision will be reflected in the app's Terms of Service when liability is addressed in DR-LC-002.

## Date Decided

2026-04-09
