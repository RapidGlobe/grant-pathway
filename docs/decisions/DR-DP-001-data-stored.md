---
id: DR-DP-001
category: Data & Privacy
status: Decided
---

# DR-DP-001 — What Data the App Will Store

## Question

What data will the app store about charities and their grant applications?

## Context

Deciding what data to store shapes the app's architecture, storage costs, GDPR obligations, and data breach risk. At minimum, the app needs to know something about the charity to generate relevant content. At maximum, it could store a full library of past applications, charity documents, funder profiles, and correspondence. More stored data enables better AI personalisation but increases compliance burden and sensitivity. This decision should be made with a "data minimisation" mindset in line with UK GDPR principles.

## Options

- **Option A: Minimal — session only** — No persistent storage; data entered in a session is not saved after the user leaves
- **Option B: Charity profile only** — Store a basic charity profile (name, mission, beneficiaries, focus areas) to personalise AI outputs
- **Option C: Charity profile + application history** — Store past applications so the AI can learn the charity's voice and reuse content
- **Option D: Full document store** — Store charity documents, past applications, funder notes, and all generated content
- **Option E: User-controlled storage** — Users choose what to save; the app does not store anything without explicit user action

## Decision

**Option C: Charity profile + application history** — The app will store a charity profile (name, mission, beneficiaries, focus areas) and a history of past applications and AI-generated content.

## Rationale

Storing application history transforms the app from a one-off writing aid into a genuinely valuable long-term tool. AI that knows a charity's voice, previous answers, and mission can generate increasingly relevant content over time, saving significant effort for repeat users. Application content describes charitable work rather than personal data about individuals, keeping the GDPR burden manageable. Secure encrypted storage will be a baseline requirement, and charities will have clear visibility and control over their stored data (see DR-DP-003). Full document storage (Option D) is deferred to a future phase.

## Date Decided

2026-04-09
