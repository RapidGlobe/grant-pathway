---
id: DR-LC-003
category: Legal & Compliance
status: Decided
---

# DR-LC-003 — Accessibility Standard

## Question

What accessibility standard must the app meet?

## Context

Digital accessibility ensures the app can be used by people with disabilities, including those using screen readers, keyboard navigation, or other assistive technologies. The Web Content Accessibility Guidelines (WCAG) are the international standard. For a tool serving UK charities — many of which support beneficiaries with disabilities and will expect an accessible tool — accessibility is both an ethical and practical requirement. The Equality Act 2010 also applies to digital services in the UK. The minimum viable standard is WCAG 2.1 Level AA. Achieving this from the start is far cheaper than retrofitting it later.

## Options

- **Option A: WCAG 2.1 Level AA** — Meet the current standard minimum for UK public-facing digital services; this is the most common requirement
- **Option B: WCAG 2.2 Level AA** — The most recent version of the guidelines, adding some additional criteria; recommended for new builds
- **Option C: WCAG 2.1 Level A only** — A lower baseline; not recommended for a public service
- **Option D: Accessibility as a future phase** — Launch without a formal accessibility standard and retrofit later (not recommended)
- **Option E: Commission an accessibility audit** — Build to a target standard and have it independently audited before launch

## Decision

**Option B: WCAG 2.2 Level AA** — The app will be built to meet WCAG 2.2 Level AA from day one. Accessibility is a design-in requirement, not a retrofit. An independent accessibility audit is deferred to a later phase but noted as a pre-scaling requirement.

## Rationale

This is a new build in 2026 and WCAG 2.2 is the current standard — there is no good reason to target an older version. The additional criteria over WCAG 2.1 are modest and the benefit is a more inclusive product for users with disabilities, which is especially important for a tool serving the charity sector. The Equality Act 2010 makes accessibility a legal baseline, not a nice-to-have. Building accessibly from the start is significantly cheaper than retrofitting later. An independent audit will be considered before any significant public launch or when applying for grant funding where accessibility compliance may be a funder requirement.

## Date Decided

2026-04-09
