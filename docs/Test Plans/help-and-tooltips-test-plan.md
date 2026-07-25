# Help Centre Link & Contextual Tooltips — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Low
**Update when:** A tooltip is added, removed, or its content/placement changes (`PDR-UI-008`)

**Version:** 2.0
**Date:** 2026-07-25
**Status:** Under `DR-TEST-001` (capability-based test strategy). HT-01 and HT-02 executed; HT-03 onward not yet run.
**Tester:** WJ

---

## Purpose

`PDR-UI-008` added a persistent help-centre link (nav, footer, dashboard empty state) and 9 contextual tooltips plus one non-tooltip password hint across the app. This is a horizontal, cross-cutting UI concern — it touches Profile, Steps 2-5, and Account Settings — not a specific funder or guideline capability, so it gets its own layer here rather than being folded into the two flagship plans (`AB-Charitable-Trust-test-plan.md`, `MK-Community-Foundation-test-plan.md`) or the capability matrix.

**Simplified 2026-07-25 (`PDR-UI-008` v3.0):** live-testing this plan's original v1.0 (dismiss-and-persist-server-side design) found a missed migration, then a gap in bringing a dismissed tooltip back (`GAP-35`). Standing back, WJ concluded the whole persistence mechanism was over-engineered for a pre-launch product and asked to simplify. Every tooltip is now a plain hover/focus hint with no dismiss button and no memory — it shows the same way every single time, for every user, on every visit. This removed the need for HT-02/03/07 as originally written (dismiss-and-persist, first-click auto-dismiss, cross-device persistence); this version of the plan replaces them with simpler checks that match the new behaviour.

Only `npm run type-check` / `lint` / `test` (95 tests, including 4 component tests for `contextual-tooltip.tsx`) have been verified so far. Live browser testing beyond HT-01/HT-02 has not yet been run against the simplified version.

Every case below can reuse a single pre-seeded account and an in-progress application — following the pattern already established in `regression-test-plan.md` and the capability matrix — since registration/profile mechanics are covered elsewhere and are not the point of this plan.

---

## Test Data — Tooltip Inventory

| Tooltip ID                 | Location                                                       | Behaviour                                                                                                                                |
| -------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `tt-charity-lookup`        | Profile page — Charity Commission search input                 | Shows on hover/focus; no dismiss control; shows every visit                                                                              |
| `tt-guidelines-choice`     | Step 2 — intro paragraph above upload/paste                    | Shows on hover/focus; no dismiss control; shows every visit                                                                              |
| `tt-summary-review`        | Step 3 — "Your funder guidelines — summary" heading            | Shows on hover/focus; no dismiss control; shows every visit                                                                              |
| `tt-budget-no-ai`          | Step 4 — first budget question's warning block                 | Shows on hover/focus; no dismiss control; shows every visit                                                                              |
| `tt-governance-add-it`     | Step 4 — governance "Add it" prompt button                     | Shows on hover/focus; no dismiss control; shows every visit                                                                              |
| `tt-senior-review-confirm` | Step 4 senior-review screen — "Yes — assemble my draft" button | Shows on hover/focus; no dismiss control; shows every visit                                                                              |
| `tt-ai-help-limit`         | Step 4 — first "Help me improve this" button                   | Shows on hover/focus; no dismiss control; clicking still fires the refine action normally                                                |
| `tt-download-docx`         | Step 5 — "Download as Word document (.docx)" button            | Shows on hover/focus; no dismiss control; clicking still starts the download normally                                                    |
| `tt-ready-to-assemble`     | Step 4 — "Ready to assemble" button, common path only          | Only rendered while the button is genuinely disabled; bare button once enabled                                                           |
| `tt-delete-account`        | Account Settings — "Delete my account" button                  | Shows on hover/focus; no dismiss control; shows every visit (unchanged since v1.0 — this was always the pattern all tooltips now follow) |
| `tt-register-password`     | Register page — password field                                 | Not a tooltip at all — a permanent, always-visible hint (see `PDR-UI-008`)                                                               |

Help centre link (`HELP_CENTRE_BASE_URL`) locations: `nav-authenticated.tsx` (account area), `nav-public.tsx` (site nav), `site-footer.tsx`, `dashboard-empty.tsx` (empty-state copy).

---

## Test Results Summary

| Test ID | Test Name                                                             | Result  | Notes                                                                                                                                     |
| ------- | --------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| HT-01   | Help centre links — presence, target, new-tab behaviour               | Pass    |                                                                                                                                           |
| HT-02   | All tooltips — show on hover/focus, no dismiss control, never persist | Pass    | Core behaviour confirmed on all 9; `GAP-36` (`tt-charity-lookup` flash) and `GAP-37` (`tt-summary-review` wrong copy) both fixed same day |
| HT-03   | Hover-disabled tooltip — shows only while disabled                    | Pass    |                                                                                                                                           |
| HT-04   | Non-persisted password hint — always shown, not a dismiss bug         | Pass    |                                                                                                                                           |
| HT-05   | Accessibility pass — axe-core, keyboard-only, screen reader           | Blocked | Steps 1-3 pass (axe-core clean; `GAP-38` keyboard fix; focus order confirmed logical). Step 4 (screen reader) deferred                    |

---

## Test Cases

---

### HT-01 — Help Centre Links — Presence, Target, New-Tab Behaviour

**Prerequisite:** One signed-out browser tab, one signed-in session.

**Steps:**

1. Signed out: load the public landing page, confirm a "Help" link with a help icon is visible in the site nav
2. Signed out: scroll to the footer, confirm a "Help centre" link is present beside Privacy/Terms
3. Signed in: confirm the same Help link is visible in the authenticated nav, beside the account dropdown
4. From the dashboard with zero applications, confirm the empty-state copy includes a working link to the help centre
5. Click each of the four links in turn — confirm each opens the help centre in a **new tab** (`target="_blank"`), and the original app tab is untouched

**Expected result:**

- All four link locations present and pointing at the same help centre base URL
- Every link opens in a new tab, never navigating the app away

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Tested in Google Chrome; a GitBook editor toolbar appeared over the help centre page (visible only because that Chrome profile is signed into the GitBook account used to set up the space — not present in Edge/Comet as a signed-out visitor). Not a Grant Pathway defect, no action needed.

---

### HT-02 — All Tooltips — Show on Hover/Focus, No Dismiss Control, Never Persist

**Prerequisite:** Signed in, application in progress far enough along to reach Steps 3, 4, and 5.

**Background:** As of `PDR-UI-008` v3.0, all 9 tooltips below behave identically — a plain hover/focus hint with no X/dismiss button and no memory of having been shown before. This replaces the original v1.0 plan's separate dismiss-and-persist (old HT-02), first-click auto-dismiss (old HT-03), always-shown-persistent (old HT-05), and cross-device-persistence (old HT-07) cases, which no longer apply now that nothing persists.

**Steps:**

1. Visit each of the following in turn and hover or tab to the named trigger element, confirming the tooltip content appears each time: `tt-charity-lookup` (Profile), `tt-guidelines-choice` (Step 2), `tt-summary-review` (Step 3), `tt-budget-no-ai` (Step 4), `tt-governance-add-it` (Step 4), `tt-senior-review-confirm` (Step 4 senior-review screen), `tt-ai-help-limit` (Step 4, first "Help me improve this" button — confirm it shows the current AI-usage count, e.g. "You've used 12 so far this month"), `tt-download-docx` (Step 5), `tt-delete-account` (Account Settings)
2. Confirm none of the above has an X or other dismiss control
3. For `tt-ai-help-limit` and `tt-download-docx` specifically: click the wrapped button while the tooltip is showing — confirm the button's own action still fires normally (AI refine actually runs; download actually starts)
4. Reload each page and repeat step 1 for that page's tooltip(s) — confirm the tooltip appears again exactly the same way, with no "already seen" suppression
5. Sign out, sign back in (or use a second browser/session with the same account) and repeat step 1 for at least one tooltip — confirm it still appears identically, since there is no per-user state to differ across sessions

**Expected result:**

- Every tooltip listed appears on hover/focus, every time, with no dismiss control anywhere
- Clicking `tt-ai-help-limit`'s or `tt-download-docx`'s wrapped button still performs the button's real action
- Reloading, signing out/in, or using a different session never changes whether a tooltip shows

**Result:** ☒ Pass (caveat) &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Core behaviour (hover/focus show, no dismiss control, no persistence) confirmed across all 9 tooltips. `tt-charity-lookup` flashed open for ~2ms on first hover of the Charity Commission search input, then disappeared, rather than staying open — logged as `GAP-36`; root-caused (Base UI's `Tooltip.Trigger` was setting `type`/`name` attributes directly on the input, forcing Chromium to reinitialise the native widget and blur it) and fixed same day via a stable-span wrapper — confirmed live on the deployed build, no longer flashes. `tt-summary-review`'s copy ("if your charity doesn't match this funder's criteria, you'll see a message here explaining why") was factually wrong — logged as `GAP-37`, fixed same day alongside `GAP-38` below; copy now reads "This is an AI-generated summary of the funder's guidelines — check it looks right before continuing. You can regenerate it if anything looks off."

---

### HT-03 — Hover-Disabled Tooltip — Shows Only While Disabled

**Prerequisite:** Signed in, application at Step 4, not all questions yet approved (so "Ready to assemble" is genuinely disabled).

**Background:** `tt-ready-to-assemble` wraps a real `disabled` button — the tooltip is the only way to explain _why_ it's disabled, since a disabled element fires no hover/focus events on its own. This case also confirms there is no native `title` attribute duplicating the same message — a native tooltip and this one both firing on hover would double-announce to screen readers.

**Steps:**

1. With at least one question not yet approved, hover or tab to the disabled "Ready to assemble" button
2. Confirm the tooltip appears explaining what's still required before assembling
3. Inspect the button (browser dev tools or accessibility tree) — confirm there is **no** native `title` attribute present alongside the tooltip
4. Approve all remaining questions until the button becomes enabled
5. Hover the now-enabled button — confirm the tooltip no longer appears (this only shows while genuinely disabled)

**Expected result:**

- Tooltip visible and legible while disabled, explaining the blocking condition
- No native `title` duplicate present
- Tooltip stops appearing once the button is enabled

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Confirmed via dev tools — no `title` attribute on the tooltip-trigger span or the button itself.

---

### HT-04 — Non-Persisted Password Hint — Always Shown, Not a Dismiss Bug

**Prerequisite:** Signed out, on the Register page.

**Background:** `tt-register-password` was a deliberate scope exclusion, not an oversight — `register-form.tsx` already carries a permanent, always-visible hint below the password field, and building a `ContextualTooltip` on top would duplicate it. This case exists to confirm that decision reads correctly in the live UI — i.e. this is expected behaviour, not a tooltip that silently failed to wire up.

**Steps:**

1. Load the Register page and confirm the password-requirements hint ("At least 12 characters, including letters and numbers") is visible below the password field **without any hover or focus needed**
2. Confirm there is no separate hover/focus-triggered tooltip duplicating the same text
3. Confirm there is no dismiss (X) control on this hint — it is static, permanent copy, not a `ContextualTooltip` instance

**Expected result:**

- Exactly one always-visible password-requirements hint, no duplicate tooltip layered on top, no dismiss control

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-05 — Accessibility Pass

**Prerequisite:** All of HT-01 through HT-04 run at least once, so every tooltip has been rendered at least once during this session.

**Background:** Per `ADR-OPS-006`'s definition of done for UI features, this is a mandatory static + assistive-technology check, not optional polish. `@axe-core/react` is already wired via `components/axe-provider.tsx`.

**Steps:**

1. With the browser dev console open, visit every route touched by this feature (Profile, Steps 2-5, Account Settings, Register, public landing, dashboard) and confirm no `axe-core` violations are logged for any of the tooltip or help-link elements
2. Keyboard-only pass: using Tab/Shift+Tab only (no mouse), confirm every tooltip trigger element is reachable and its tooltip appears on focus
3. Confirm focus order around each tooltip trigger is logical, not jumping unexpectedly
4. One screen reader pass (NVDA or VoiceOver) covering at least `tt-charity-lookup` (plain hover/focus) and `tt-ready-to-assemble` (hover-disabled) — confirm each tooltip's content is actually announced

**Expected result:**

- Zero axe-core violations across all touched routes
- Every trigger fully reachable and its tooltip legible by keyboard alone
- Screen reader announces tooltip content correctly

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☒ Blocked

**Notes (record which screen reader was used and which tooltip(s) were sampled):** Step 1 (axe-core) required a local `npm run dev` session — `@axe-core/react` only runs when `NODE_ENV === 'development'` (stripped from production/preview builds entirely), so the deployed Vercel build could never be used for this check regardless of which Supabase environment it points at. Unblocking this also surfaced an unrelated local-environment gap: `.env.local` had all 8 required secrets (`NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID`/`_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`/`_TOKEN`) blank — these are flagged Sensitive in Vercel, so `vercel env pull` can never retrieve them for any environment (Development/Preview/Production all returned empty); WJ filled them in by hand from each provider's own dashboard. Once running locally, WJ tested with dev console open across Profile, Steps 2-5, Account Settings, Register, public landing, and dashboard — zero `axe-core` violations logged on any route (no screenshots taken of every page, verbal confirmation only). Step 2 (keyboard-only) found a real bug: only `tt-ai-help-limit` (wraps a real `<button>`) was reachable via Tab on Step 4 — `tt-budget-no-ai`, `tt-guidelines-choice`, and `tt-summary-review` wrap plain non-interactive elements (`div`/`p`/`h1`) with no `tabIndex`, so keyboard users could never reach them at all (WCAG 2.1.1). Logged as `GAP-38`, fixed same day (`tabIndex={0}` + focus-visible ring added to all three). Step 3 (focus order): confirmed logical, no unexpected jumps — no issues found. Step 4 (screen reader pass, NVDA/VoiceOver) deferred — WJ found NVDA difficult to operate and will come back to this separately; not abandoned, just not part of this session.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0     | 2026-07-25 | Rapidglobe Ltd | Rewritten for `PDR-UI-008` v3.0's simplification (persistence removed). Old HT-02 (dismiss-and-persist), HT-03 (first-click auto-dismiss), HT-05 (persistent variant), and HT-07 (cross-device persistence) collapsed into a single new HT-02, since all 9 tooltips now behave identically (plain hover/focus, no dismiss, no memory). Old HT-04/HT-06/HT-08 renumbered to HT-03/HT-04/HT-05 with dismiss-specific steps removed. HT-01 (Pass) and old HT-02 (Pass, superseded) results carried forward from v1.0 live testing. |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, covering `PDR-UI-008` (help centre link + 9 persisted tooltips + 1 non-persisted password hint) as its own horizontal UI layer rather than folding coverage into the flagship or capability-matrix plans. Covers all 5 trigger variants, cross-session persistence, and the ADR-OPS-006 accessibility pass. Not yet executed.                                                                                                                                                             |
