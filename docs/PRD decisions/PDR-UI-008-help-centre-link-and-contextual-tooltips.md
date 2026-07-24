# PDR-UI-008 — Help Centre Link and Contextual Tooltips

**Date:** 2026-07-24
**Status:** Decided ✓ — built and verified (type-check/lint/tests green); live browser/accessibility verification still outstanding (see Document History v2.0)
**Author:** Rapidglobe Ltd

---

## Question

Should Grant Pathway add a persistent link to an external help centre and contextual in-app tooltips at known friction points — and if so, using what implementation approach?

---

## Context

A handoff spec (`grant-pathway-help-integration-spec.md`, written externally against a GitBook help centre not yet reviewed against this codebase) proposed: (A) a persistent "Help" link in the global nav and footer, with optional deep-linking to specific GitBook pages, and (B) contextual tooltips across the app, prioritised P0 (3 items) / P1 (5 items) / P2 (3 items) — **11 tooltips, not 13** as this PDR's v1.0 stated; that "13" was an arithmetic slip when first summarising the spec (3+5+3=11), corrected here — using a coachmark/tour library (`driver.js` or `intro.js`) and a dismissed-state flag persisted server-side or in `localStorage`.

Before committing to the spec's approach, the codebase was checked against its assumptions:

- No tour library (`driver.js`, `intro.js`, `react-joyride`) is installed. A simple hover/focus `Tooltip` primitive already exists (`components/ui/tooltip.tsx`, built on Base UI).
- No user-preferences table or JSONB column exists to persist a "seen" flag server-side — `user_profiles` has only name/consent/timestamp fields.
- Two of the spec's route targets (`prior-export` and `export`) are actually the same page (`applications/[id]/step/5`) in two UI states, not two routes.
- The senior-review "checkbox" the spec describes for `tt-prior-export-signoff` does not exist — `application-step4-senior-review.tsx` has only two buttons ("Back to editing," "Yes — assemble my draft"), no checkbox anywhere; the review-checklist checkboxes the spec likely meant live on Step 5 and aren't senior-review-specific.
- The AI-request counter the spec wants surfaced (`tt-ai-help-limit`) is computed server-side (`reserve_ai_slot`'s `current_usage`) but discarded before the API response reaches the client — no component currently has access to the actual number, only a boolean "approaching limit" flag.
- Two target elements ("Help me improve this," "Ready to assemble") have no stable `id`/`data-*` attribute and, in the case of "Help me improve this," render once per question inside a loop — a single static selector doesn't uniquely identify the right instance.

---

## Options Considered

| Option | Description                                                                                                                                       | Outcome                                                                                                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Adopt the spec as written: add `driver.js`/`intro.js`, use `localStorage` for dismissed-state                                                     | Rejected — adds a dependency for multi-step tour functionality none of the 13 items actually need (all are independent single-point hints, not a sequential tour); `localStorage` doesn't persist across devices, which the spec itself flags as the weaker option |
| 2      | Reuse the existing `Tooltip` primitive; build a small custom "seen-state" wrapper component; persist dismissed-state server-side via a new column | **Selected**                                                                                                                                                                                                                                                       |
| 3      | Ship Part A (help link) only; defer all tooltips                                                                                                  | Rejected — WJ confirmed full scope, both parts, in this session                                                                                                                                                                                                    |

---

## Decision

**Option 2.** Build a reusable `<ContextualTooltip>` component (`components/contextual-tooltip.tsx`) wrapping the existing `components/ui/tooltip.tsx` primitive, supporting the trigger variants the 11 items actually need: on-focus, on-page-load, on-hover-while-disabled, on-first-click, and an always-repeat/non-dismissible variant (for the delete-account warning specifically). No new npm dependency is added for the tooltip mechanism itself.

**Variant assignment corrected during implementation** against the spec's actual per-item trigger column (not the first-pass grouping in this PDR's v1.0, which mis-assigned several): `tt-charity-lookup`, `tt-guidelines-choice`, `tt-summary-review`, `tt-budget-no-ai`, `tt-governance-add-it`, and `tt-senior-review-confirm` are all `page-load`; `tt-ai-help-limit` and `tt-download-docx` are `first-click`; `tt-ready-to-assemble` is `hover-disabled`; `tt-delete-account` is `persistent`.

Dismissed-state is persisted server-side, not in `localStorage`, via a new column/table (exact shape decided during implementation planning) — consistent with the spec's own stated preference once a server-side option exists, and necessary for a user's dismissed-tooltips state to follow them across devices.

The help centre link (Part A) is added to `components/nav-authenticated.tsx`, `components/nav-public.tsx`, and `components/site-footer.tsx`, each already carrying an equivalent pattern (account menu items, legal links respectively) to extend. The base URL is stored as a single config value (`HELP_CENTRE_BASE_URL` or equivalent), per the spec's own recommendation.

`prior-export` and `export` tooltips are both implemented against `application-step5-approve.tsx`, keyed to the page's pre-/post-final-approval state rather than treated as separate routes.

`tt-ai-help-limit` requires a small backend change: `current_usage` (already computed by `reserve_ai_slot`) is threaded through the API response that currently discards it, so the tooltip can display a real count rather than only a boolean.

Both "Help me improve this" and "Ready to assemble" render at ambiguous instances rather than needing a new `id`/`data-*` attribute: "Help me improve this" is targeted via an `index === firstRefineButtonIndex` check computed once against the questions array (not a DOM attribute); "Ready to assemble" has two instances in `application-step4-draft.tsx` — a rare manual-entry-fallback (`questions.length === 0`) and the common path — only the common-path instance gets the tooltip.

`tt-register-password` is **not built** as a tooltip: `register-form.tsx` already shows a permanent, always-visible hint below the password field ("At least 12 characters, including letters and numbers") that says exactly what the spec's tooltip would say. A focus-triggered tooltip repeating the same text would be pure duplication — flagged and skipped during implementation rather than built for its own sake. It is also structurally impossible to persist server-side regardless, since no `user_id` exists pre-authentication.

10 of the 11 tooltips are built in this pass (all of P0 except `tt-register-password`, all of P1, all of P2), per WJ's decision to proceed with full scope rather than the P0-only slice.

---

## Rationale

- The existing `Tooltip` primitive plus a thin custom wrapper covers every trigger pattern the spec needs without pulling in tour-library machinery (step sequencing, overlay dimming, "next/prev" navigation) that nothing here uses — cheaper to build and one less dependency to maintain.
- Server-side persistence was already the spec's own preferred option "if there's an existing user preferences table" — there isn't one, so this decision adds the table/column rather than defaulting to the weaker `localStorage`-only path.
- Treating `prior-export`/`export` as one page with two states reflects the actual component structure; forcing them to behave like two separate route-triggered tooltips would fight the real code rather than work with it.
- The AI-counter and duplicate-button issues are real, small, one-time fixes that unblock specific tooltips — better to fix them now than have `tt-ai-help-limit` ship showing no number, or `tt-help-improve`/`tt-approve-required` attach to the wrong instance.

---

## Consequences

### Built (2026-07-24)

1. Migration `supabase/migrations/20260724000000_user_tooltip_dismissals.sql` — normalized `user_tooltip_dismissals(user_id, tooltip_id, dismissed_at)` table, `text` + `CHECK` (not a Postgres `enum` — `ALTER TYPE ... ADD VALUE` can't run in the same transaction it's added in, which would make a future 12th tooltip a two-deploy exercise), RLS in the hardened form, grants to both `authenticated` and `service_role` in the same migration (a prior table's grant-`authenticated`-only migration caused a real 42501 failure on 2026-07-23).
2. `components/contextual-tooltip.tsx` — the reusable wrapper, 5 variants as corrected above.
3. `actions/tooltips.ts` — `getDismissedTooltipIds`/`dismissTooltip`, following this codebase's existing read/write action-return-shape conventions.
4. `lib/help-centre.ts` (`HELP_CENTRE_BASE_URL`, `helpCentreUrl()`); help links added to `nav-authenticated.tsx`, `nav-public.tsx`, `site-footer.tsx`; dashboard empty-state copy in `dashboard-empty.tsx`.
5. `app/api/refine-answer/route.ts` now returns `currentUsage` (previously computed and silently discarded); `application-step4-draft.tsx` and its `page.tsx` had a **second**, separate discard fixed too — the page-load `currentUsage` value was computed but never passed as a prop at all, and the client's refine-response type silently dropped `approachingLimit`. Both needed fixing for a live, accurate count.
6. 10 of 11 tooltips wired (see Decision section for `tt-register-password`'s exclusion).
7. Deep-linking table (Part A) — **not built this pass**; the spec marks it optional for v1, and base link + config helper (`helpCentreUrl(path)`) already leaves it a one-line addition later.
8. New dev-only test infrastructure: `@testing-library/react`, `@testing-library/jest-dom`, `happy-dom` added (no such component-testing setup existed before — `vitest.config.ts` was `environment: 'node'`, `.test.ts` only). `vitest.config.ts` extended to also pick up `.test.tsx`, with a per-file `// @vitest-environment happy-dom` docblock so existing `.test.ts` files keep their `node` environment unchanged. `__tests__/contextual-tooltip.test.tsx` covers all 5 variants.
9. Incidental fix: 3 stale `eslint-disable-next-line react-hooks/set-state-in-effect` comments in `application-step3-summary.tsx`, found unused by ESLint once this file was touched — removed, no logic change.

### Verification status

`npm run type-check`, `npm run lint`, and `npm test` (97 tests, including the 6 new component tests) all pass. **Live browser and accessibility verification (axe-core, keyboard-only pass, NVDA/VoiceOver) could not be performed in the implementing session** — this project's local dev server requires Supabase/AWS/Resend/Upstash credentials that are redacted in that environment (a known, pre-existing limitation, not new to this feature). WJ's own live testing is needed to confirm the tooltips render, dismiss, and persist correctly, and to run the accessibility pass ADR-OPS-006 requires as part of this feature's definition of done.

### Not in scope

- A full guided multi-step product tour — explicitly out of scope in the source spec, unaffected by this decision.
- Tooltip content localisation — English-only, as specified.
- Deep-linking (Part A) — see item 7 above.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | Initial decision — full scope (help link + all 13 tooltips) approved by WJ; implementation approach corrected against the actual codebase (no new tour dependency, server-side state, real route/counter/selector facts) rather than the source spec's untested assumptions.                                                                                                                                                                                                                                                                                                                                                   |
| 2.0     | 2026-07-24 | Rapidglobe Ltd | Built. Corrected the "13" tooltip count to 11 (own arithmetic error); corrected 4 tooltips' variant assignment against the spec's actual trigger column (v1.0 had mis-assigned them); found the senior-review "checkbox" doesn't exist; `tt-register-password` deliberately not built (already redundant with a permanent visible hint, and structurally can't persist pre-auth). Added dev-only component-testing infrastructure (none existed before). Type-check/lint/tests all green; live browser and accessibility verification still outstanding, blocked by this environment's known dev-server credential limitation. |
