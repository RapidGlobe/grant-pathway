# Help Centre Link & Contextual Tooltips — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Low
**Update when:** A tooltip is added, removed, or re-assigned to a different trigger variant (`PDR-UI-008`)

**Version:** 1.0
**Date:** 2026-07-24
**Status:** New plan under `DR-TEST-001` (capability-based test strategy). Not yet executed.
**Tester:** WJ

---

## Purpose

`PDR-UI-008` added a persistent help-centre link (nav, footer, dashboard empty state) and 9 server-persisted contextual tooltips plus one non-persisted password hint across the app. This is a horizontal, cross-cutting UI concern — it touches Profile, Steps 2-5, and Account Settings — not a specific funder or guideline capability, so it gets its own layer here rather than being folded into the two flagship plans (`AB-Charitable-Trust-test-plan.md`, `MK-Community-Foundation-test-plan.md`) or the capability matrix. Doing so would mix concerns and bloat those plans without actually achieving full tooltip coverage, since most tooltips don't sit on either flagship's path anyway.

Only `npm run type-check` / `lint` / `test` (97 tests, including 6 component tests for `contextual-tooltip.tsx`) have been verified so far — see `PDR-UI-008`'s "Verification status" section. Nothing in this plan has been executed against a live browser yet.

Every case below can reuse a single pre-seeded account and an in-progress application — following the pattern already established in `regression-test-plan.md` and the capability matrix — since registration/profile mechanics are covered elsewhere and are not the point of this plan.

---

## Test Data — Tooltip Inventory

| Tooltip ID                 | Variant                         | Location                                                       | Dismiss behaviour                                                           |
| -------------------------- | ------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `tt-charity-lookup`        | `page-load`                     | Profile page — Charity Commission search input                 | X button; persists                                                          |
| `tt-guidelines-choice`     | `page-load`                     | Step 2 — intro paragraph above upload/paste                    | X button; persists                                                          |
| `tt-summary-review`        | `page-load`                     | Step 3 — "Your funder guidelines — summary" heading            | X button; persists                                                          |
| `tt-budget-no-ai`          | `page-load`                     | Step 4 — first budget question's warning block                 | X button; persists                                                          |
| `tt-governance-add-it`     | `page-load`                     | Step 4 — governance "Add it" prompt button                     | X button; persists                                                          |
| `tt-senior-review-confirm` | `page-load`                     | Step 4 senior-review screen — "Yes — assemble my draft" button | X button; persists                                                          |
| `tt-ai-help-limit`         | `first-click`                   | Step 4 — first "Help me improve this" button                   | Auto-dismisses the moment the button is clicked                             |
| `tt-download-docx`         | `first-click`                   | Step 5 — "Download as Word document (.docx)" button            | Auto-dismisses the moment the button is clicked                             |
| `tt-ready-to-assemble`     | `hover-disabled`                | Step 4 — "Ready to assemble" button, common path only          | Only shows while the button is disabled; never persists                     |
| `tt-delete-account`        | `persistent`                    | Account Settings — "Delete my account" button                  | No X button; never dismissible, shows every visit                           |
| `tt-register-password`     | n/a — not a `ContextualTooltip` | Register page — password field                                 | Not built as a tooltip; a permanent, always-visible hint (see `PDR-UI-008`) |

Help centre link (`HELP_CENTRE_BASE_URL`) locations: `nav-authenticated.tsx` (account area), `nav-public.tsx` (site nav), `site-footer.tsx`, `dashboard-empty.tsx` (empty-state copy).

---

## Test Results Summary

| Test ID | Test Name                                                       | Result | Notes |
| ------- | --------------------------------------------------------------- | ------ | ----- |
| HT-01   | Help centre links — presence, target, new-tab behaviour         |        |       |
| HT-02   | Page-load tooltips — dismiss via X persists across reload       |        |       |
| HT-03   | First-click tooltips — auto-dismiss without blocking the action |        |       |
| HT-04   | Hover-disabled tooltip — shows only while disabled              |        |       |
| HT-05   | Persistent tooltip — delete-account warning never dismisses     |        |       |
| HT-06   | Non-persisted password hint — always shown, not a dismiss bug   |        |       |
| HT-07   | Cross-device/cross-session persistence                          |        |       |
| HT-08   | Accessibility pass — axe-core, keyboard-only, screen reader     |        |       |

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

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-02 — Page-Load Tooltips — Dismiss via X Persists Across Reload

**Prerequisite:** Signed in with a fresh account (or one where none of the 6 `page-load` tooltips below have been dismissed yet). Application in progress, far enough along to reach Steps 3 and 4.

**Background:** Six tooltips share the `page-load` variant: `tt-charity-lookup`, `tt-guidelines-choice`, `tt-summary-review`, `tt-budget-no-ai`, `tt-governance-add-it`, `tt-senior-review-confirm`. Each should appear open automatically on first visit (no hover/focus needed) and, once dismissed via its X button, never reappear for that user.

**Steps:**

1. Visit the Profile page — confirm `tt-charity-lookup` is open on load, anchored to the Charity Commission search input
2. Click its X (dismiss) button — confirm it closes immediately
3. Reload the Profile page — confirm `tt-charity-lookup` does **not** reopen
4. Repeat steps 1-3 for each of the remaining 5 `page-load` tooltips at their respective locations (Step 2 intro, Step 3 heading, Step 4 budget-question warning, Step 4 governance "Add it" button, Step 4 senior-review "Yes — assemble my draft" button)
5. Confirm each X button is a real, clickable 44×44px target (not a small icon-only hit area)

**Expected result:**

- All 6 tooltips open automatically on first page load, no interaction required
- Each disappears on X-click and stays gone after a reload
- Dismissing one tooltip does not affect any other tooltip's shown/dismissed state

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which of the 6 were tested and any that failed to persist):**

---

### HT-03 — First-Click Tooltips — Auto-Dismiss Without Blocking the Action

**Prerequisite:** Signed in, application at Step 4 (for `tt-ai-help-limit`) and Step 5 (for `tt-download-docx`), neither tooltip previously dismissed.

**Background:** `tt-ai-help-limit` and `tt-download-docx` show on hover/focus and are designed to auto-dismiss the instant the user actually clicks the wrapped button — the click that dismisses the tooltip must be the same click that fires the button's own action, not an extra click the user has to make first.

**Steps:**

1. At Step 4, hover or tab to the **first** "Help me improve this" button — confirm the tooltip appears, showing the current AI-usage count (e.g. "12 of 20 uses this month")
2. Click the button — confirm both (a) the AI refine action actually runs (the answer is refined, not just the tooltip closing) and (b) the tooltip does not reappear on a second hover
3. Reload Step 4 — confirm `tt-ai-help-limit` stays dismissed
4. At Step 5, hover or tab to "Download as Word document (.docx)" — confirm the tooltip appears
5. Click the button — confirm both (a) the download actually starts and (b) the tooltip does not reappear on a second hover
6. Reload Step 5 — confirm `tt-download-docx` stays dismissed

**Expected result:**

- Both tooltips show on hover/focus before the first click
- The click that dismisses each tooltip also performs its underlying action — no double-click or blocked action
- Both stay dismissed after reload

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-04 — Hover-Disabled Tooltip — Shows Only While Disabled

**Prerequisite:** Signed in, application at Step 4, not all questions yet approved (so "Ready to assemble" is genuinely disabled).

**Background:** `tt-ready-to-assemble` wraps a real `disabled` button — the tooltip is the only way to explain _why_ it's disabled, since a disabled element fires no hover/focus events on its own. This case also confirms the old native `title` attribute that used to duplicate this same message was actually removed (see `PDR-UI-008` deviation #4) — a native tooltip and this one both firing on hover would double-announce to screen readers.

**Steps:**

1. With at least one question not yet approved, hover or tab to the disabled "Ready to assemble" button
2. Confirm the tooltip appears explaining what's still required before assembling
3. Inspect the button (browser dev tools or accessibility tree) — confirm there is **no** native `title` attribute present alongside the tooltip
4. Approve all remaining questions until the button becomes enabled
5. Hover the now-enabled button — confirm the tooltip no longer appears (this variant only shows while genuinely disabled)

**Expected result:**

- Tooltip visible and legible while disabled, explaining the blocking condition
- No native `title` duplicate present
- Tooltip stops appearing once the button is enabled

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-05 — Persistent Tooltip — Delete-Account Warning Never Dismisses

**Prerequisite:** Signed in, on the Account Settings page.

**Background:** `tt-delete-account` is deliberately non-dismissible — a destructive, irreversible action should not have its warning permanently suppressible. Unlike every other tooltip in this plan, it has no X button and never calls the dismiss action at all.

**Steps:**

1. Hover or tab to the "Delete my account" button
2. Confirm a tooltip appears warning that this action is permanent, and confirm there is **no** X/dismiss button on it
3. Navigate away and back to Account Settings (or reload the page) several times
4. Confirm the tooltip reappears on hover/focus every single time — it should behave identically on the 5th visit as the 1st

**Expected result:**

- Warning tooltip has no dismiss control
- Reappears on every visit, with no persisted "seen" state affecting it

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-06 — Non-Persisted Password Hint — Always Shown, Not a Dismiss Bug

**Prerequisite:** Signed out, on the Register page.

**Background:** `tt-register-password` was a deliberate scope exclusion, not an oversight — `register-form.tsx` already carries a permanent, always-visible hint below the password field, and building a focus-triggered `ContextualTooltip` on top would duplicate it and (since no `user_id` exists pre-authentication) couldn't persist dismissed-state anyway. This case exists to confirm that decision reads correctly in the live UI — i.e. this is expected behaviour, not a tooltip that silently failed to wire up.

**Steps:**

1. Load the Register page and confirm the password-requirements hint ("At least 12 characters, including letters and numbers") is visible below the password field **without any hover or focus needed**
2. Confirm there is no separate hover/focus-triggered tooltip duplicating the same text
3. Confirm there is no dismiss (X) control on this hint — it is static, permanent copy, not a `ContextualTooltip` instance

**Expected result:**

- Exactly one always-visible password-requirements hint, no duplicate tooltip layered on top, no dismiss control

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-07 — Cross-Device / Cross-Session Persistence

**Prerequisite:** One user account, two separate signed-in sessions (e.g. two different browsers, or one normal window plus one private/incognito window signed into the same account).

**Background:** Dismissed-state is persisted server-side specifically so it follows the user across devices — this is the one property `localStorage` could never have provided, and the main reason `PDR-UI-008` added a database table instead. This case is the only one that actually proves that, as opposed to HT-02/03 which only prove same-browser persistence.

**Steps:**

1. In session A, dismiss `tt-summary-review` (or any not-yet-dismissed `page-load` tooltip) at Step 3
2. In session B (same user account, different browser/session), navigate to the same Step 3 screen
3. Confirm the tooltip is **already dismissed** in session B, with no dismiss action taken there

**Expected result:**

- Dismissal made in one session is immediately visible in a second, independent session for the same user — confirms server-side persistence, not per-browser local state

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

### HT-08 — Accessibility Pass

**Prerequisite:** All of HT-01 through HT-07 run at least once, so every tooltip has been rendered at least once during this session.

**Background:** Per `ADR-OPS-006`'s definition of done for UI features, this is a mandatory static + assistive-technology check, not optional polish. `@axe-core/react` is already wired via `components/axe-provider.tsx`.

**Steps:**

1. With the browser dev console open, visit every route touched by this feature (Profile, Steps 2-5, Account Settings, Register, public landing, dashboard) and confirm no `axe-core` violations are logged for any of the new tooltip or help-link elements
2. Keyboard-only pass: using Tab/Shift+Tab only (no mouse), confirm every tooltip trigger element is reachable, and every visible X/dismiss button is reachable and activatable via Enter/Space
3. Confirm focus order around each tooltip is logical (trigger, then its dismiss button, then the next focusable element) — not jumping unexpectedly
4. One screen reader pass (NVDA or VoiceOver) covering at least one tooltip of each variant (`page-load`, `first-click`, `hover-disabled`, `persistent`) — confirm the tooltip's content is actually announced, and that a `page-load` tooltip's forced-open state does not disrupt or delay the page's own initial heading/landmark announcement
5. Confirm the dismiss button in every case announces a meaningful label (e.g. "Dismiss this tip"), not just "button"

**Expected result:**

- Zero axe-core violations across all touched routes
- Every trigger and dismiss control fully reachable and operable by keyboard alone
- Screen reader announces tooltip content and dismiss-button labels correctly, with no disruption to normal page-load announcements

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which screen reader was used and which variant(s) were sampled):**

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, covering `PDR-UI-008` (help centre link + 9 persisted tooltips + 1 non-persisted password hint) as its own horizontal UI layer rather than folding coverage into the flagship or capability-matrix plans. Covers all 5 trigger variants, cross-session persistence, and the ADR-OPS-006 accessibility pass. Not yet executed. |
