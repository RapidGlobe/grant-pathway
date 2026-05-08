---
id: DR-PS-002
category: Purpose & Scope
status: Decided
---

# DR-PS-002 — Grant Discovery vs. Grant Writing

## Question

Will the app be primarily a grant discovery tool, a grant writing tool, or both?

## Context

Grant discovery (finding relevant funding opportunities) and grant writing (drafting and structuring application content) are distinct problems requiring different data, AI capabilities, and user journeys. Building both in v1 increases complexity significantly. A focused tool often delivers more value than a broad one, especially for an early-stage product. This decision shapes the product's identity and how it is described to charities.

## Options

- **Option A: Discovery only** — The app helps charities find grants they are eligible for; no writing assistance
- **Option B: Writing only** — The app helps charities draft and structure applications; assumes they already know which grant they are applying for
- **Option C: Both** — The app covers discovery and writing in an end-to-end workflow
- **Option D: Writing first, discovery later** — Launch with writing assistance, add discovery in a future phase

## Decision

**Option D: Writing first, discovery later** — The app launches as a grant writing tool. Grant discovery is explicitly deferred to a future phase and not excluded permanently.

## Rationale

Writing delivers the highest AI value and requires no grant database, making it the right focus for v1. Framing this as "writing first" rather than "writing only" keeps the product vision open — discovery is a natural and valuable second phase once the writing tool is proven. This is consistent with DR-PS-001 and reduces v1 scope and risk without closing the door on a more complete future product.

## Date Decided

2026-04-09
