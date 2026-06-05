---
id: ADR-OPS-006
category: Operations
status: Decided
---

# ADR-OPS-006 — Accessibility Testing

## Context

Grant Pathway is required to meet WCAG 2.2 Level AA from day one (DDR-AC-001). The primary persona, Margaret, is a volunteer with limited tech experience. Accessibility is both an ethical requirement and a product quality requirement. Testing must be built into the development workflow, not treated as an afterthought.

## Options Considered

- **Option A — Manual testing only:** Developers test with keyboard navigation and screen reader (NVDA/VoiceOver) during development.
  - Weaknesses: Inconsistent. Depends on developer discipline. WCAG violations can be missed.

- **Option B — Automated testing only (axe, Lighthouse):** Automated accessibility checks run on every build.
  - Weaknesses: Automated tools catch approximately 30–40% of WCAG violations. Keyboard and screen reader issues require manual testing.

- **Option C — Combined automated + manual testing:** Automated tools (axe DevTools, Lighthouse CI) run on every build. Manual keyboard and screen reader testing before each release.
  - Strengths: Catches both structural/semantic issues (automated) and interaction issues (manual). Comprehensive without being burdensome.

## Decision

**Option C — Combined automated and manual accessibility testing.**

**Automated testing:**

- `axe-core` (via `@axe-core/react` in development, or Lighthouse CI in the build pipeline) runs on every development build to surface violations in the browser.
- Lighthouse accessibility audit runs as part of pre-release checks (score target: 95+).

**Manual testing (before each release):**

- Keyboard-only navigation: all interactive elements reachable and operable via Tab / Shift+Tab / Enter / Space / Arrow keys.
- Focus management: modals trap focus correctly; focus returns to trigger element on close.
- Screen reader: key user journeys tested with NVDA (Windows) or VoiceOver (macOS).
- Colour contrast: all text and interactive elements verified against WCAG AA ratios (as documented in design-requirements.md).
- Touch targets: all interactive elements meet the 44×44px minimum.

## Rationale

- shadcn/ui + Radix UI provide strong baseline accessibility (keyboard navigation, ARIA roles) — the testing process verifies this is maintained in custom components.
- Automated tools catch common violations (missing alt text, invalid ARIA, colour contrast) efficiently.
- Manual testing is required for complex interactions (multi-step flow, modal focus trapping, timeout warning modal).
- DDR-AC-001 mandates WCAG 2.2 AA compliance.

## Consequences

- `@axe-core/react` should be added as a dev dependency and conditionally rendered in development mode.
- A Lighthouse CI configuration should be added to check accessibility score on each deployment.
- Accessibility testing is part of the definition of done for each UI feature.
- Findings must be fixed before release — accessibility violations are treated as bugs, not nice-to-haves.

## Source

Design Decision DDR-AC-001, design-requirements.md (Section 8 — Accessibility).

## Date Decided

2026-04-17
