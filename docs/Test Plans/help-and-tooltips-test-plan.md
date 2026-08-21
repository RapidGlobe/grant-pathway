# Help Centre Link & Contextual Tooltips — Test Plan

**Tier:** 2 — Check if relevant
**Volatility:** Low
**Update when:** A tooltip is added, removed, or its content/placement changes (`PDR-UI-008`)

**Version:** 2.4
**Date:** 2026-08-14
**Status:** ✅ **All six cases now Pass.** Under `DR-TEST-001` (capability-based test strategy). HT-01 through HT-05 all Pass — HT-05's screen-reader step ran live as `accessibility-test-plan.md` AC-08 and passed (`GAP-80`–`GAP-82` found and fixed). **HT-06 run live 2026-08-14 and Pass, no further observations** — every screen's Help button opened its own page in a new tab, no 404s, and the footer/empty-state links still open the root as intended.
**Tester:** WJ

> ⚠️ **Running this against production? Read [`RUNNING-AGAINST-PRODUCTION.md`](RUNNING-AGAINST-PRODUCTION.md) first.** This plan was written against `grant-pathway-dev` and any account it names below is a **dev** account. Production uses one shared account, its own URL, and a different result-recording convention — all held in that document, which **wins** wherever this plan disagrees with it.

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

| Test ID | Test Name                                                             | Result | Notes                                                                                                                                                                                                  |
| ------- | --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HT-01   | Help centre links — presence, target, new-tab behaviour               | Pass   |                                                                                                                                                                                                        |
| HT-02   | All tooltips — show on hover/focus, no dismiss control, never persist | Pass   | Core behaviour confirmed on all 10; `GAP-36` (`tt-charity-lookup` flash) and `GAP-37` (`tt-summary-review` wrong copy) both fixed same day                                                             |
| HT-03   | Hover-disabled tooltip — shows only while disabled                    | Pass   |                                                                                                                                                                                                        |
| HT-04   | Non-persisted password hint — always shown, not a dismiss bug         | Pass   |                                                                                                                                                                                                        |
| HT-05   | Accessibility pass — axe-core, keyboard-only, screen reader           | Pass   | Steps 1-3 pass (axe-core clean; `GAP-38` keyboard fix; focus order confirmed logical). Step 4 (screen reader) now Pass via `accessibility-test-plan.md` AC-08, which found and fixed `GAP-80`–`GAP-82` |
| HT-06   | Contextual help deep-links — every screen opens the right page        | Pass   | Run live 2026-08-14 by WJ, no further observations — every screen opened its own help page, new tab, no 404s                                                                                           |

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

**Background:** As of `PDR-UI-008` v3.0, all 10 tooltips below behave identically — a plain hover/focus hint with no X/dismiss button and no memory of having been shown before. This replaces the original v1.0 plan's separate dismiss-and-persist (old HT-02), first-click auto-dismiss (old HT-03), always-shown-persistent (old HT-05), and cross-device-persistence (old HT-07) cases, which no longer apply now that nothing persists.

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

**Notes:** Core behaviour (hover/focus show, no dismiss control, no persistence) confirmed across all 10 tooltips. `tt-charity-lookup` flashed open for ~2ms on first hover of the Charity Commission search input, then disappeared, rather than staying open — logged as `GAP-36`; root-caused (Base UI's `Tooltip.Trigger` was setting `type`/`name` attributes directly on the input, forcing Chromium to reinitialise the native widget and blur it) and fixed same day via a stable-span wrapper — confirmed live on the deployed build, no longer flashes. `tt-summary-review`'s copy ("if your charity doesn't match this funder's criteria, you'll see a message here explaining why") was factually wrong — logged as `GAP-37`, fixed same day alongside `GAP-38` below; copy now reads "This is an AI-generated summary of the funder's guidelines — check it looks right before continuing. You can regenerate it if anything looks off."

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
4. **Moved 2026-08-03 — run this as `accessibility-test-plan.md` AC-08, not here.** One screen reader pass (NVDA or VoiceOver) covering at least `tt-charity-lookup` (plain hover/focus) and `tt-ready-to-assemble` (hover-disabled) — confirm each tooltip's content is actually announced. It moved because it had been Blocked since 2026-07-25 for a reason that has nothing to do with tooltips: NVDA was hard to operate. The new plan carries an NVDA setup-and-operation section and an equivalent step (AC-08) that also samples the three `GAP-38` tooltips. **This step passes when AC-08 passes**; do not run it twice. **Update 2026-08-12: AC-08 has passed — see below.**

**Expected result:**

- Zero axe-core violations across all touched routes
- Every trigger fully reachable and its tooltip legible by keyboard alone
- Screen reader announces tooltip content correctly

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes (record which screen reader was used and which tooltip(s) were sampled):** Step 1 (axe-core) required a local `npm run dev` session — `@axe-core/react` only runs when `NODE_ENV === 'development'` (stripped from production/preview builds entirely), so the deployed Vercel build could never be used for this check regardless of which Supabase environment it points at. Unblocking this also surfaced an unrelated local-environment gap: `.env.local` had all 8 required secrets (`NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID`/`_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`/`_TOKEN`) blank — these are flagged Sensitive in Vercel, so `vercel env pull` can never retrieve them for any environment (Development/Preview/Production all returned empty); WJ filled them in by hand from each provider's own dashboard. Once running locally, WJ tested with dev console open across Profile, Steps 2-5, Account Settings, Register, public landing, and dashboard — zero `axe-core` violations logged on any route (no screenshots taken of every page, verbal confirmation only). Step 2 (keyboard-only) found a real bug: only `tt-ai-help-limit` (wraps a real `<button>`) was reachable via Tab on Step 4 — `tt-budget-no-ai`, `tt-guidelines-choice`, and `tt-summary-review` wrap plain non-interactive elements (`div`/`p`/`h1`) with no `tabIndex`, so keyboard users could never reach them at all (WCAG 2.1.1). Logged as `GAP-38`, fixed same day (`tabIndex={0}` + focus-visible ring added to all three). Step 3 (focus order): confirmed logical, no unexpected jumps — no issues found. Step 4 (screen reader pass, NVDA/VoiceOver) deferred — WJ found NVDA difficult to operate and will come back to this separately; not abandoned, just not part of this session. **Update 2026-08-03: step 4 has moved to `accessibility-test-plan.md` AC-08 and is no longer tracked here.** It sat Blocked for nine days for a reason that was never about tooltips — NVDA operation — so it belonged in a plan that could carry the setup instructions and test the rest of the service at the same time. **Update 2026-08-12: AC-08 has run live and passed.** WJ drove NVDA through all four of AC-08's steps and found three distinct causes of tooltip content never being announced, none of them fixable by the same mechanism — `GAP-80` (a native form control wrapped in a stable span for `aria-describedby`, where real focus lands on the input inside it, not the span), `GAP-81` (a disabled button in the same span shape, where NVDA reports the nested disabled descendant's own state instead of the span's description), and `GAP-82` (a bare role-less `div`/`span`/`p` trigger, where NVDA never announces `aria-describedby` on a role-less element regardless of an added `role="group"`, which was tried live and ruled out). All three fixed and live-verified — see `ADR-TRACEABILITY.md`'s `GAP-80`–`GAP-82` rows (v2.58) and `accessibility-test-plan.md`'s AC-08 write-up (v1.32) for the full detail. This case's Result now flips to Pass, as its own instruction above said it would — steps 1–3 were already Pass.

---

### HT-06 — Contextual Help Deep-Links — Every Screen Opens the Right Page

**Status: Pass, run live 2026-08-14.** `GAP-45` was built on 2026-08-06, later the same day this case was written — the case was written before the feature so the coverage could not be lost between logging and building. All eight targets were fetched and confirmed to resolve during the build, and WJ's live run confirms they still resolve correctly today.

**Prerequisite:** Signed in, with at least one application far enough through the flow to reach Step 5.

**Background:** The nav "Help" button currently opens the help centre **root** from every screen. `GAP-45` wires it to `lib/help-centre.ts`'s existing `helpCentreUrl(path)` so each route opens its own page. **This case matters more than a normal UI check because the target is an external GitBook.** A page renamed or moved on the GitBook side silently 404s one route's Help button, **nothing in CI can detect it**, and no client-side fallback is possible — a GitBook 404 is invisible to the app. This case is the only mechanism that will catch it.

**Steps:**

1. From each screen below, click **Help** in the authenticated nav
2. Confirm it opens in a **new tab** (unchanged behaviour, `AC-FR-49-01`) and lands on the page named — not the root, and not a 404
3. Note any that 404 or land on the wrong page

| Screen                   | Expected help page                             |
| ------------------------ | ---------------------------------------------- |
| Step 1 / new application | Choosing your funder and grant                 |
| Step 2                   | Uploading funder guidelines                    |
| Step 3                   | Reviewing the AI summary                       |
| **Step 4**               | **Writing and editing an answer**              |
| Step 5                   | Final review                                   |
| Profile                  | Setting up your charity profile                |
| Account settings         | Changing your password                         |
| Delete account           | Deleting your account                          |
| Dashboard                | Help centre root (no clean match — see GAP-45) |

4. Confirm the **footer** "Help centre" link and the dashboard empty-state link still open the **root** — they are general-purpose and deliberately not deep-linked
5. Re-run step 2 for every row whenever the help centre is restructured

**Expected result:**

- Every screen opens its own help page, in a new tab, with no 404s
- Footer and empty-state links unchanged, still landing on the root

**Result:** ☒ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:** Slugs verified against the live GitBook sitemap on 2026-08-06 (21 pages), and the Step 4 target was fetched and confirmed live rather than assumed. Two rows remain WJ's call: the Dashboard has no clean match (nearest is `reference-and-faqs/application-status-labels`), and whether the public routes deep-link too (`/register` → creating-your-account, sign-in and forgot-password → signing-in) — currently scoped to the authenticated nav only. **Six of the 21 help pages cover Step 4 alone**; one nav link can only target one, so landing users in the right section and letting GitBook's sidebar do the rest is the intended outcome, not a shortfall.

**2026-08-14:** Run live by WJ, no further observations. Every screen's Help button opened in a new tab and landed on its named page — no 404s, no wrong-page landings. Footer and dashboard empty-state links confirmed still opening the root, as intended. This closes the case and, with it, this plan's last open item — all six HT cases now Pass.

---

---

## Help centre content requirements — raised 2026-08-21, OUTSTANDING

⚠️ **These are GitBook edits, not code changes.** The help centre is external (`rapidglobe.gitbook.io/grant-pathway`), so nothing in this repository can make them and nothing in CI can verify them. Recorded here because `HT-06` is the standing check that exercises these pages, and this plan is the only place that reliably gets re-read when the help centre changes.

### 1. "Before you begin writing" is undocumented — raised by WJ during `HT-06`, 2026-08-21

**What happened.** WJ pressed **Help** on the Step 4 preparation gate — the _"Before you begin writing"_ screen — and landed on **"Writing and editing an answer"**, which does not mention that screen at all. The page opens, is the right page for the route, and does not 404, **so `HT-06` still passes on its own terms** — this is a content gap, not a link defect.

**Why it cannot be fixed by re-pointing the link, which is the obvious first instinct.** `lib/help-centre.ts`'s `ROUTE_HELP_PAGES` maps `/applications/[id]/step/4` to `writing-answers/writing-and-editing-an-answer`. **The gate and the answer cards are the same route** — the gate is a state within Step 4, not a page of its own — so the mapping cannot distinguish them without threading UI state into the help link. **Therefore the fix is content on the existing page, not a new page plus a new mapping.**

**Where it goes:** at the **top** of `writing-answers/writing-and-editing-an-answer`, above the existing _"Each question or section extracted from the guidelines appears as a separate card"_ — because the gate is what the user sees first, and help text that opens by describing the cards answers a question they have not reached yet.

**What it needs to say** — the substance, since the gate exists for a reason a user cannot infer from the screen:

- The checklist is deliberate, not an obstacle.
- Some questions ask for figures — annual accounts, project budget, funding already secured — and **AI cannot answer these**, because they are facts only the organisation holds (`PDR-AI-008`).
- Reaching them without the numbers means stopping and coming back.
- The list also includes anything **this particular funder** asks to be submitted alongside the application, which varies per application.
- Involving a senior colleague — CEO, treasurer or trustee — is worth doing **before** the financial questions rather than after.
- The way forward is the **"I have what I need — start writing"** button.

### 2. Where a Word export lands on iPad and iPhone — `GAP-120`, 2026-08-21

**WJ's own requirement**, raised with `GAP-120`: _"prelaunch we will need to put something in the user guide/help centre."_ On iOS and iPadOS, Safari previews the exported document rather than saving it, so the help centre should say where it goes and how to keep it: **Files → On My iPad → Downloads**. **Due before launch even if `GAP-120`'s code fix is not**, since the code fix is deferred to the next iteration and the export works on every platform today — users just cannot find the file.

**Both edits are GitBook and should be made in one sitting.** ⚠️ **Re-run `HT-06` afterwards** — the standing warning in `lib/help-centre.ts` is that a page renamed or moved on the GitBook side silently 404s that route's Help button, nothing in CI can catch it, and no runtime fallback is possible.

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.4     | 2026-08-14 | Rapidglobe Ltd | **HT-06 run live and Pass, no further observations — this plan's last open item is closed, all six cases now Pass.** WJ clicked through every screen's Help button: each opened its own page in a new tab, no 404s, no wrong-page landings; footer and dashboard empty-state links confirmed still opening the root as intended. `TEST-DASHBOARD.md` row moves 🟡 → 🟢.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.2     | 2026-08-06 | Rapidglobe Ltd | **`GAP-45` built later the same day, so HT-06 flips from "not runnable" to "not yet executed".** The authenticated nav Help button now deep-links to the help page for the current screen. All eight targets were fetched and confirmed to resolve during the build, and a 10-case unit test pins the route→page map — but **neither can catch what HT-06 exists for**: a page renamed on the GitBook side, which 404s silently with nothing in CI able to see it. HT-06 also has not been clicked through in a browser, because Step 4 and the nav sit behind authentication and the author does not enter credentials. **What was verified live: the public nav and footer Help links still open the root**, which is the intended, deliberate behaviour.                                                                                                                                                                   |
| 2.1     | 2026-08-06 | Rapidglobe Ltd | **HT-06 added ahead of the feature it tests (`GAP-45`, contextual help deep-links).** The nav Help button currently opens the help centre root from every screen; `GAP-45` wires it to the per-route page. The case is written now, marked **not runnable**, for a specific reason: the help centre is an **external GitBook**, so a page renamed on that side silently 404s one route's Help button, **nothing in CI can detect it**, and no client-side fallback is possible because a GitBook 404 is invisible to the app. HT-06 is the only mechanism that will catch it, and step 5 makes it a standing re-run whenever the help centre is restructured. All nine target slugs verified against the live sitemap on 2026-08-06 (21 pages), with the Step 4 target fetched and confirmed live rather than assumed. Two rows left as WJ's call: the Dashboard has no clean match, and whether public routes deep-link too. |
| 2.0     | 2026-07-25 | Rapidglobe Ltd | Rewritten for `PDR-UI-008` v3.0's simplification (persistence removed). Old HT-02 (dismiss-and-persist), HT-03 (first-click auto-dismiss), HT-05 (persistent variant), and HT-07 (cross-device persistence) collapsed into a single new HT-02, since all 10 tooltips now behave identically (plain hover/focus, no dismiss, no memory). Old HT-04/HT-06/HT-08 renumbered to HT-03/HT-04/HT-05 with dismiss-specific steps removed. HT-01 (Pass) and old HT-02 (Pass, superseded) results carried forward from v1.0 live testing.                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.0     | 2026-07-24 | Rapidglobe Ltd | New plan created under `DR-TEST-001`, covering `PDR-UI-008` (help centre link + 9 persisted tooltips + 1 non-persisted password hint) as its own horizontal UI layer rather than folding coverage into the flagship or capability-matrix plans. Covers all 5 trigger variants, cross-session persistence, and the ADR-OPS-006 accessibility pass. Not yet executed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
