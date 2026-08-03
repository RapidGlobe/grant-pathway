# Accessibility — Test Plan (WCAG 2.2 Level AA)

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A new route, modal, or interactive component is added; `ADR-OPS-006`'s manual list changes; or a WCAG success criterion in scope is re-targeted

**Version:** 1.0
**Date:** 2026-08-03
**Status:** Created, not yet executed. This is P5.3's output artefact and its definition of done.
**Tester:** WJ

---

## Purpose

`ADR-OPS-006` mandates a manual keyboard / focus / screen-reader / contrast pass **before each release**. Until now no test plan executed that for the product flow. The only accessibility case anywhere was `help-and-tooltips-test-plan.md` HT-05, scoped to tooltips — and that single feature-scoped keyboard step found `GAP-38`: **three of nine tooltips completely unreachable by keyboard, a real WCAG 2.1.1 failure that had shipped.** One narrow plan found a real failure. Nothing has looked at the rest of the service.

This is the seventh test layer under `DR-TEST-001` (WJ's decision, 2026-07-30). It sits alongside `help-and-tooltips-test-plan.md` as a horizontal, cross-cutting plan rather than a funder or guideline-shape plan, because accessibility is a property of every route at once.

**Standard:** WCAG 2.2 Level AA (`DR-LC-003`, `DDR-AC-001`, NFR-06, C15).

### What this plan covers that nothing else does

| Obligation                                                                                                                      | Source                     | Case(s)             |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------- |
| Keyboard-only navigation — all interactive elements reachable and operable                                                      | `ADR-OPS-006` manual list  | AC-03, AC-04        |
| Focus management — modals trap focus, focus returns to trigger on close                                                         | `ADR-OPS-006` manual list  | AC-05               |
| Screen reader — key user journeys with NVDA                                                                                     | `ADR-OPS-006` manual list  | AC-07, AC-08, AC-09 |
| Colour contrast — verified against the documented AA ratios                                                                     | `ADR-OPS-006` manual list  | AC-10               |
| Touch targets — 44×44px minimum                                                                                                 | `ADR-OPS-006` manual list  | AC-11               |
| Guideline viewer (P6.4) — keyboard nav into/through, focus on open/close — **🔵 in `ADR-TRACEABILITY.md`, this plan closes it** | `ADR-OPS-006` Consequences | AC-05               |
| `@axe-core/react` clean across all routes                                                                                       | `ADR-OPS-006` automated    | AC-01               |
| Lighthouse accessibility score 95+                                                                                              | `ADR-OPS-006` automated    | AC-02               |
| **Consistent Help** (SC 3.2.6 — new in 2.2)                                                                                     | P5.3 note, 2026-07-30      | AC-12               |
| **Accessible Authentication** (SC 3.3.8 — new in 2.2)                                                                           | P5.3 note, 2026-07-30      | AC-13               |
| **Redundant Entry** (SC 3.3.7 — new in 2.2)                                                                                     | P5.3 note, 2026-07-30      | AC-14               |
| **Focus Appearance** (SC 2.4.11/2.4.13 — new in 2.2)                                                                            | P5.3 note, 2026-07-30      | AC-06               |
| **Target Size (Minimum)** (SC 2.5.8 — new in 2.2)                                                                               | P5.3 note, 2026-07-30      | AC-11               |
| Text sizing, zoom and reflow                                                                                                    | `design-requirements` §8.6 | AC-15               |
| Tooltip screen-reader announcement (folds in HT-05 step 4)                                                                      | `help-and-tooltips` HT-05  | AC-08               |

### Deliberately out of scope

- **Formal NVDA/VoiceOver sign-off by a specialist.** Deferred to an independent accessibility audit (`DR-LC-003`: "deferred to a later phase but noted as a pre-scaling requirement"). The 2026-07-30 narrowing was explicit that the deferral covers **formal sign-off only**, not screen-reader testing itself — which is what this plan does.
- **VoiceOver/macOS.** `ADR-OPS-006` accepts "NVDA (Windows) **or** VoiceOver (macOS)". The development machine is Windows, so NVDA + Chrome is the target combination throughout.
- **Mobile/touch AT (TalkBack, VoiceOver iOS).** The product is desktop-only by `ADR-ARCH-005`; the sub-768px path is a blocking banner, not a supported experience.

### Known dependency — this plan cannot fully pass yet

`GAP-05`'s mobile viewport banner is **unbuilt** and is P5.3's own development work. AC-11 and AC-15 touch the small-viewport path; run them once the banner exists, or record them Blocked with that reason. Do not mark this plan 🟢 while GAP-05 is open.

---

## Prerequisites

**1. A local dev server. This is not optional and not substitutable.**

`@axe-core/react` mounts only when `NODE_ENV === 'development'` — it is stripped from production and preview builds entirely, so **no deployed Vercel URL can ever be used for AC-01**, regardless of which Supabase project it points at. This was found live on 2026-07-25 when HT-05's axe step was attempted against the deployed site and blocked.

```bash
npm run dev
```

**2. `.env.local` must hold all eight secrets, filled in by hand.**

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. All eight are flagged **Sensitive** in Vercel, so `vercel env pull` returns them empty for every environment — Development, Preview and Production alike. They must be copied from each provider's own dashboard. (Recorded in HT-05's notes, 2026-07-25.)

**3. A pre-seeded account with an in-progress application.** Following the pattern in `regression-test-plan.md` and the capability matrix: registration and profile mechanics are covered elsewhere and are not the point of this plan. AC-03 and AC-07 walk the full five-step flow, so the account needs an application that can be taken from Step 1 through to export.

**4. Chrome.** `ADR-OPS-006` names NVDA + Chrome. Firefox is a valid fallback if Chrome misbehaves, but record which was used.

**5. NVDA installed and working — see the next section.**

---

## NVDA — setup and basic operation

**Read this section before attempting AC-07 onward.** It exists because NVDA operation, not the testing itself, is what blocked the screen-reader pass on 2026-07-25 and again on 2026-07-30. Nothing here is about Grant Pathway; it is about being able to drive the tool at all.

### Install

1. Download from **nvaccess.org** — free, open source, no licence or account needed.
2. Choose **"Install on this computer"**, not the portable copy. The installed version can run at the Windows sign-in screen and works across UAC prompts; the portable copy silently cannot, which produces confusing dead spots.
3. On first run NVDA shows a **Welcome dialog**. Two settings there matter:
   - **Keyboard layout** — choose **Laptop** if the machine has no numeric keypad, **Desktop** if it does. Getting this wrong makes roughly half the published shortcuts do nothing, which is the most common reason NVDA feels broken.
   - **"Use CapsLock as an NVDA modifier key"** — **tick this.** The default NVDA modifier is `Insert`, which many laptop keyboards either lack or bury behind a function-key combination. Nearly every instruction below is written as `NVDA+<key>`; with this ticked, that means `CapsLock+<key>`.

### The five keys that matter most

| Key          | What it does                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `Ctrl`       | **Stops speech immediately.** The single most useful key. Press it whenever NVDA runs on.      |
| `NVDA+Q`     | Quit NVDA (confirms with a dialog).                                                            |
| `NVDA+S`     | Cycle speech mode: talk → beeps → off. A fast way to silence it without quitting.              |
| `NVDA+N`     | Open the NVDA menu (settings, tools, exit).                                                    |
| `NVDA+Space` | Toggle **browse mode** ↔ **focus mode**. See below — this is the concept that trips people up. |

### Browse mode vs focus mode — the thing that makes NVDA feel broken

On a web page NVDA starts in **browse mode**. Arrow keys move a _virtual cursor_ through the document and NVDA reads as it goes; single letter keys are quick-navigation commands, not text input. In **focus mode**, keystrokes pass straight through to the control, which is what you need in order to type into a field.

NVDA switches to focus mode automatically when you Tab into a text field, and back out when you leave. You will hear a short **high-pitched sound** entering focus mode and a **lower one** returning to browse mode. If typing produces nothing, or if pressing `H` jumps you around the page instead of typing an "h", you are in the wrong mode — press `NVDA+Space`.

### Quick navigation (browse mode only)

| Key | Jumps to        | Key       | Jumps to        |
| --- | --------------- | --------- | --------------- |
| `H` | Next heading    | `1`–`6`   | Heading level   |
| `F` | Form field      | `B`       | Button          |
| `K` | Link            | `E`       | Edit field      |
| `D` | Landmark/region | `T`       | Table           |
| `L` | List            | `Shift+…` | Same, backwards |

`NVDA+F7` opens the **Elements List** — every link, heading, form field or button on the page in one dialog. This is the fastest way to audit heading structure and to spot a control with no accessible name (it shows as blank or as raw markup).

`NVDA+DownArrow` reads continuously from the cursor ("say all"). `NVDA+UpArrow` re-reads the current line.

### Turn on the Speech Viewer — do this before AC-07

**NVDA menu (`NVDA+N`) → Tools → Speech Viewer.**

This opens a window showing, as text, everything NVDA speaks. It is the single most useful thing for this plan, for three reasons:

- You can **screenshot what was actually announced**, which is the evidence these cases ask you to record. Otherwise the result is one person's recollection of some speech.
- You can work with the **volume off**, or with headphones off, and still test accurately.
- You can read a long announcement back slowly instead of trying to catch it in real time.

Tick **"Show Speech Viewer on startup"** inside that window so it comes back each session.

### Two more settings worth changing before starting

- **Speech rate** — NVDA menu → Preferences → Settings → Speech. The default is fast for a first-time listener. Slow it to something comfortable; it does not affect what is announced.
- **"Speak typed characters"** — same Settings dialog, Keyboard section. Turning it **off** stops NVDA echoing every keystroke, which makes typing into the Step 4 answer fields far less noisy.

### Common failure modes, and what they actually mean

| Symptom                                     | Cause                                                                                               |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Half the shortcuts do nothing               | Wrong keyboard layout, or CapsLock-as-modifier not enabled at install                               |
| Typing does nothing / letters jump the page | In browse mode where focus mode is needed — `NVDA+Space`                                            |
| NVDA talks over everything and won't stop   | Press `Ctrl`. To silence for longer, `NVDA+S`                                                       |
| Silence, but NVDA is clearly running        | Windows volume, output device, or Focus Assist. Use the **Speech Viewer** and ignore audio entirely |
| Nothing announced when the page changes     | Browser window not focused — click into it once, then use the keyboard only                         |
| Announcements lag badly on Step 4           | Expected on a long page with many live regions; slow down rather than assuming a defect             |

---

## Test Data

**Account:** the pre-seeded test account (see Prerequisites 3).
**Application:** any in-progress application with at least one narrative question and at least one citation on Step 4, so AC-05 can open the guideline viewer.

**Routes in scope** — every route the app serves:

| Group         | Routes                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Public        | `/` (landing + sign-in), `/register`, `/forgot-password`, `/verify-email`, `/verify-email/confirm`, `/privacy`, `/terms`             |
| Authenticated | `/dashboard`, `/profile`, `/account`, `/account/delete`, `/applications/new`, `/applications/[id]`, `/applications/[id]/step/1`–`/5` |
| Error         | `not-found` (404), the authenticated `error.tsx` boundary                                                                            |

**Modals in scope:** the session-timeout modal (`session-timeout-modal.tsx`) and the guideline viewer dialog (`application-step4-draft.tsx`, "Original guidelines — …"). Both use the same `components/ui/dialog.tsx` Base UI primitive.

**Tooltips in scope:** all ten, per the inventory table in `help-and-tooltips-test-plan.md`.

---

## Test Results Summary

| Test ID | Test Name                                      | Result | Notes |
| ------- | ---------------------------------------------- | ------ | ----- |
| AC-01   | axe-core clean sweep, all routes               | ☐      |       |
| AC-02   | Lighthouse accessibility score (target 95+)    | ☐      |       |
| AC-03   | Keyboard-only — full five-step flow            | ☐      |       |
| AC-04   | Keyboard — skip link, nav, footer, focus order | ☐      |       |
| AC-05   | Focus management — both modals                 | ☐      |       |
| AC-06   | Focus Appearance (SC 2.4.11 / 2.4.13)          | ☐      |       |
| AC-07   | NVDA — five-step flow, key journeys            | ☐      |       |
| AC-08   | NVDA — tooltips (absorbs HT-05 step 4)         | ☐      |       |
| AC-09   | NVDA — live regions and status announcements   | ☐      |       |
| AC-10   | Colour contrast against the documented ratios  | ☐      |       |
| AC-11   | Target Size (SC 2.5.8) and 44×44 touch targets | ☐      |       |
| AC-12   | Consistent Help (SC 3.2.6)                     | ☐      |       |
| AC-13   | Accessible Authentication (SC 3.3.8)           | ☐      |       |
| AC-14   | Redundant Entry (SC 3.3.7)                     | ☐      |       |
| AC-15   | Text sizing, 200% zoom, and reflow             | ☐      |       |

---

## AC-01 — axe-core clean sweep, all routes

**Prerequisite:** local `npm run dev`, browser dev console open. See Prerequisites 1.

**Steps:**

1. Visit every route in the Test Data table above, signed in where required.
2. On each, check the dev console for `axe-core` violations. Interact enough to render conditional UI — open the Step 4 governance panel, trigger a validation error on Profile, open both modals.
3. Record the route and rule ID for every violation.

**Expected result:** zero violations on every route.

**Note on scope creep:** HT-05 already ran this on 2026-07-25 across Profile, Steps 2–5, Account Settings, Register, landing and dashboard, with zero violations — but verbally, with no screenshots, and before Step 4's "Not saved" banner (M8) existed. Re-run it; do not carry that result forward.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-02 — Lighthouse accessibility score

**Steps:**

1. In Chrome DevTools → Lighthouse, run the **Accessibility** category against: `/`, `/register`, `/dashboard`, `/profile`, and Steps 1–5.
2. Record the score per page and every failing audit.

**Expected result:** 95+ on every page (`ADR-OPS-006`).

**This manual run is the agreed substitute for Lighthouse CI, not a shortfall against it.** `ADR-OPS-006` Consequences ask for "a Lighthouse CI configuration… on each deployment", and none exists — no `lighthouserc*` file, no step in `ci.yml`. That is **`GAP-15`, an accepted deviation**: a manual audit in P5.3 was accepted in place of CI automation for v1 on the grounds that this is a single-developer project and `@axe-core/react` catches regressions during development, with automation deferred post-v1 (decision: WJ, 2026-06-16; `ADR-TRACEABILITY.md` carries it as ➖). So AC-02 **is** the discharge of that consequence as amended — which is precisely why it must actually be run, rather than assumed green.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-03 — Keyboard-only, full five-step flow

**No mouse. No trackpad.** If you reach for the pointer, that is the finding — record where and why.

**Steps:**

1. Sign in from `/` using only the keyboard.
2. Set up or verify the charity profile, including the **Charity Commission lookup** (search field, results, selection).
3. Create a new application; complete Step 1 (funder and grant name).
4. Step 2 — reach and use both the upload control and the paste path.
5. Step 3 — read the summary; reach every citation link; open and close the guideline viewer (see AC-05).
6. Step 4 gate — the "Before you begin writing" preparation checklist; tick every item and continue.
7. Step 4 — enter a narrative answer, use "Help me improve this", approve the answer, add a manual governance item, and reach "Ready to assemble".
8. Step 5 — tick the review checkbox, approve, and trigger the Word export.

**Expected result:**

- Every interactive element reachable via Tab/Shift+Tab in a logical order (`design-requirements` §8.5)
- Enter/Space activates every button; Escape closes dropdowns
- No keyboard trap anywhere outside an open modal
- Every control that receives focus shows the amber focus ring (verified in detail by AC-06)

**Watch for specifically:** the three tooltip triggers fixed under `GAP-38` (`tt-budget-no-ai`, `tt-guidelines-choice`, `tt-summary-review`) wrap non-interactive elements and were given `tabIndex={0}` by hand. Confirm the fix holds and that they have not regressed.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-04 — Skip link, navigation, footer, focus order

**Steps:**

1. On a public page, press Tab once from a fresh page load. The **"Skip to main content"** link should become visible (it is `sr-only` until focused, in both `nav-public.tsx` and `nav-authenticated.tsx`).
2. Activate it and confirm focus lands inside `<main id="main-content">`.
3. Repeat on an authenticated page.
4. Tab through the full nav and footer on both layouts. Confirm the Help centre links announce their new-tab behaviour — each carries a visually hidden "(opens in a new tab)".
5. Confirm the step indicator (`step-indicator.tsx`, `<nav aria-label="Application progress">`) is reachable and its current step is discoverable.

**Expected result:** skip link works on both layouts; focus order runs top-left to bottom-right; no element receives focus that should not.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-05 — Focus management, both modals

This case discharges the two manual items `ADR-OPS-006`'s Consequences attach to the P6.4 guideline viewer, plus the general modal requirement.

**Guideline viewer** (Step 4, click a citation — "Original guidelines — …"):

1. Open it from the keyboard. Confirm focus **moves into the dialog** on open.
2. Tab through the whole panel, including scrolling to the highlighted quote. Confirm focus is trapped inside while open.
3. Close with Escape, then again with the close button. Confirm focus **returns to the citation link that opened it** both times.
4. Confirm the dialog exposes `role="dialog"`, `aria-modal="true"` and an accessible name from its title (`design-requirements` §8.3). The Base UI primitive should supply all three — verify rather than assume.

**Session-timeout modal** (`session-timeout-modal.tsx`):

5. Trigger it (or force it in dev). Confirm focus moves into it and is trapped.
6. Confirm both buttons — "Sign out now" and "I'm still here" — are keyboard-operable.
7. **Press Escape.** Record precisely what happens. This modal is rendered `<Dialog open={isOpen}>` with **no `onOpenChange` handler** and `showCloseButton={false}`, so there is a genuine question whether Escape dismisses it, and if so whether the session is extended or merely the warning hidden. `design-requirements` §8.5 says "Escape key closes all modals"; a timeout warning that can be dismissed without extending the session would be worse than one that cannot be dismissed at all. Whatever the behaviour, it should be deliberate.

**Related history:** `D-013` (fixed 2026-07-28) was this modal dismissing on mouse movement. Escape is the same class of question, untested.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-06 — Focus Appearance (SC 2.4.11, 2.4.13 — new in WCAG 2.2)

**Steps:**

1. Tab through every interactive element on: `/`, `/register`, `/profile`, `/dashboard`, Steps 1–5, `/account`.
2. Confirm each shows the amber `#D97706` `:focus-visible` ring.
3. Confirm the ring is never clipped by an ancestor's `overflow`, and never obscured by a sticky element — check the Step 4 progress bar and the "Not saved" banner in particular, both of which are sticky.
4. Confirm the ring appears on `:focus-visible` only — clicking a button with the mouse should not leave a ring.
5. Spot-check the ring against both backgrounds it must work on: white (documented 4.58:1) and teal `#0D6E6E` (3.12:1).

**Expected result:** a visible, unobscured, sufficiently contrasting focus indicator on every focusable element. Per `DDR-AC-001` the ring is never overridden per-component — a control that styles its own focus state is a finding.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-07 — NVDA, five-step flow

**Prerequisite:** the NVDA section above, with the **Speech Viewer open** so announcements can be captured.

Walk the same journey as AC-03, keyboard-only, with NVDA running. At each step record what is announced — paste from the Speech Viewer rather than paraphrasing.

**Steps and what to check:**

1. **Page identity.** On each route, is the page announced with a meaningful title and an `<h1>`? Use `NVDA+F7` → Headings to check the heading structure is a sensible hierarchy with no skipped levels.
2. **Landmarks.** Press `D` to cycle landmarks. Is there a `main`, a `nav`, and a `contentinfo` (footer)?
3. **Forms.** Tab into every field on Profile, Step 1 and Register. Is each field's **label** announced, not just its placeholder (`design-requirements` §8.3)? Are required fields and validation errors announced, naming the field?
4. **Step indicator.** Is the current step announced — "Step 1 of 5, Application details" or equivalent (§8.4)?
5. **Step 3 summary and citations.** Are citation links announced as links with a meaningful name, rather than "link" alone?
6. **Step 4 answers.** Each answer textarea carries `aria-label={q.questionText}`. Confirm the question text is actually announced when focus enters the field, and that it is not so long it becomes unusable.
7. **Step 4 approval.** Is the approved/unapproved state of each item announced, not conveyed by colour or icon alone (§8.1: never rely on colour alone)?
8. **Step 5 and export.** Is the download control announced meaningfully, and is completion announced?

**Expected result:** a person who cannot see the screen could complete an application. Where that is not true, record the specific point at which they would be stuck.

**Record:** NVDA version, browser and version, and the Speech Viewer transcript for at least Steps 3, 4 and 5.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-08 — NVDA, tooltips

**This case absorbs `help-and-tooltips-test-plan.md` HT-05 step 4**, which has been Blocked since 2026-07-25. When AC-08 passes, update HT-05 to point here and re-RAG that plan.

**Steps:**

1. With NVDA running, Tab to `tt-charity-lookup` (Profile, Charity Commission search input — the plain hover/focus case). Confirm the tooltip content is **announced**, not merely rendered.
2. Tab to `tt-ready-to-assemble` (Step 4, while the button is genuinely still disabled — the `hover-disabled` case). Confirm its content is announced. This one is the awkward case by construction: `ContextualTooltip` wraps it in a focusable `<span>` because disabled controls do not reliably fire hover or focus events.
3. Sample at least two of the three `GAP-38` tooltips (`tt-budget-no-ai`, `tt-guidelines-choice`, `tt-summary-review`) — these are focusable only because `tabIndex={0}` was added by hand, so confirm they announce as well as receive focus.
4. Confirm no tooltip creates a keyboard trap, and that moving focus away dismisses it.

**Expected result:** every sampled tooltip's content reaches the screen reader. A tooltip that is visible but never announced is a failure — it is decoration for sighted mouse users only.

**Record:** which screen reader, which tooltips sampled, and the transcript.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-09 — NVDA, live regions and status announcements

The five-step flow leans heavily on dynamic updates. These are exactly what a sighted user notices and a screen-reader user misses.

**Steps:**

1. **Step 3 summary generation.** The staged loading messages use `aria-live="polite"` (§8.4). Confirm each message change is announced, and that the announcements are not so frequent they drown the page.
2. **Step 4 autosave.** Confirm the save status region (`aria-live="polite"`) announces saved state.
3. **Step 4 "Not saved" banner.** Built under audit finding **M8** with `role="alert"` so it interrupts rather than waits. Force a transport failure — type an answer, go offline in DevTools, blur the field — and confirm NVDA announces it. This banner exists precisely because the failure was previously silent; a banner a screen-reader user is not told about would reproduce the original defect for them.
4. **Step 4 progress bar.** `role="progressbar"` with `aria-valuenow`/`valuemin`/`valuemax` and an `aria-label` of "Questions approved" or "Sections approved". Approve an item and confirm the change is conveyed.
5. **Inline errors.** Several use `role="alert"`. Trigger at least two and confirm each is announced once, not repeatedly.
6. **Success alerts.** Confirm inline success messages announce on appear (§8.4).

**Expected result:** every state change a sighted user can see is announced to a screen-reader user, exactly once, in a comprehensible order.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-10 — Colour contrast

**Steps:**

1. Using DevTools' contrast inspector or a contrast checker, verify each documented pair in `design-requirements` §8.1 as it actually renders — not as the table claims.
2. Pay attention to the three pairs documented as passing only at **large-text** thresholds: `#0D6E6E` on `#E6F4F4` (3.09:1, labels only), `#D97706` on `#FFFFFF` (3.15:1, headings/large only), white on `#D97706` (3.15:1, buttons only). Confirm none of the three is used for small body text anywhere.
3. Check the states the table does not cover: disabled controls, placeholder text, the amber warning block (`#92400E` on `#FEF3C7`), the red error text (`#DC2626`), and the muted greys (`#64748B`, `#94A3B8` — the latter appears at 12px on Step 4).
4. Confirm no status is conveyed by colour alone (§8.1) — every badge has a text label, every alert an icon and text.

**Expected result:** all text meets 4.5:1, or 3:1 where genuinely large. Any pair used outside its documented constraint is a finding.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-11 — Target Size (SC 2.5.8, new in 2.2) and touch targets

Two overlapping requirements, deliberately tested together: WCAG 2.2 SC 2.5.8 requires **24×24 CSS px** minimum (with exceptions for inline and spaced targets), while `ADR-OPS-006`'s manual list sets a stricter **44×44px** house standard.

**Steps:**

1. Measure every interactive element with DevTools. Focus on the small ones: icon-only buttons, the modal close button (`size="icon-sm"`), the Step 4 inline action buttons carrying `h-3.5 w-3.5` icons, and the citation links.
2. Record any target under 24×24 (a WCAG failure) separately from any between 24×24 and 44×44 (a house-standard deviation, not a WCAG failure).
3. Check spacing — closely packed small targets fail 2.5.8 even when individually sized, and Step 4 has several action buttons in a row.

**Expected result:** nothing under 24×24. Anything between 24×24 and 44×44 is recorded as a deviation with a decision attached — met, or accepted and documented.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-12 — Consistent Help (SC 3.2.6, new in 2.2)

The help-centre link is exactly what this criterion is about: where a help mechanism appears on multiple pages, it must appear in the **same relative order** on each.

**Steps:**

1. Confirm the Help link's position in `nav-public.tsx`, `nav-authenticated.tsx` and `site-footer.tsx` is consistent relative to the other items in each container.
2. Confirm it appears on every page in the flow, not only some.
3. Confirm `dashboard-empty.tsx`'s help reference does not contradict the nav placement.
4. Confirm each instance announces its new-tab behaviour (the `sr-only` "(opens in a new tab)").

**Expected result:** the help mechanism is in a consistent, predictable place throughout, and its behaviour is disclosed.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-13 — Accessible Authentication (SC 3.3.8, new in 2.2)

This criterion prohibits a cognitive function test in authentication without an alternative — and specifically requires that **paste is not blocked** in password fields.

**Steps:**

1. On `/` (sign-in), `/register`, and Account Settings' change-password form, confirm a password can be **pasted** into every password field, including the confirm field.
2. Confirm no field blocks autofill or a password manager.
3. Confirm there is no puzzle, CAPTCHA, or memory test in the authentication path.
4. Confirm the always-visible password-requirements hint on Register (`tt-register-password`, not a tooltip) is announced by NVDA and is programmatically associated with the field rather than sitting as loose adjacent text.

**Relevant history:** `D-015` covers password/paste handling, and the change-password flow was reworked on 2026-07-24 when GoTrue's `current_password` requirement was found. Both touch this path; neither was tested against this criterion.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-14 — Redundant Entry (SC 3.3.7, new in 2.2)

This criterion requires that information already entered is either auto-populated or available to select, rather than demanded again.

**Steps:**

1. Exercise P6.5's "start from one of your own earlier applications" path. Confirm previously entered content is genuinely carried over and not re-requested.
2. Confirm the charity profile pre-fills wherever it is relevant, rather than asking again — including the Charity Commission register lookup, which pre-fills the organisation profile.
3. Step through the five steps and note any point where information already given earlier in the same flow must be typed again.

**Expected result:** nothing already provided is demanded a second time within a flow.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## AC-15 — Text sizing, 200% zoom, and reflow

**Steps:**

1. Set the browser text size to 200% (SC 1.4.4) on `/`, `/profile`, Step 3 and Step 4. Confirm no text is clipped, overlapped, or lost, and that no horizontal scrolling is required at 1280px wide (SC 1.4.10).
2. Confirm body text is at least 16px and nothing in the UI is under 12px (`design-requirements` §8.6).
3. Confirm line height is at least 1.5 for body text (SC 1.4.12).
4. Change the **browser's default font size** (not zoom) and confirm the UI responds.

**⚠️ Step 4 is likely to fail, and the plan says so deliberately.** `design-requirements` §8.6 states: "Text does not use `px` for sizing — use `rem` in implementation to respect user browser font size preferences." The components use hardcoded pixel sizes extensively — `text-[14px]`, `text-[13px]`, `text-[12px]`, `text-[18px]` appear throughout `application-step4-draft.tsx`, `session-timeout-modal.tsx` and the nav components. Text set in `px` does not scale with the browser's font-size preference (though it does scale with page zoom, which is why step 1 may well pass while step 4 fails).

This is a documented requirement contradicted by the built code, not a new opinion. Record it as a finding with a scope estimate; do not fix it inside a test run. It is plausibly a large mechanical change and needs its own decision — including the option of amending §8.6 if `px` plus zoom is judged sufficient for AA.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

---

## Defect Log

Record every finding here. Per `ADR-OPS-006`, "findings must be fixed before release — accessibility violations are treated as bugs, not nice-to-haves." A finding deferred needs an explicit accepted-deviation decision, not silence.

| #   | Case | Severity | WCAG SC | Description | Status |
| --- | ---- | -------- | ------- | ----------- | ------ |
|     |      |          |         |             |        |

---

## Observations recorded while writing this plan

Neither is a test result; both were found by reading the governing documents against the code, and both are recorded so the next session does not rediscover them.

1. **`ADR-OPS-006` Consequences row 5 (the P6.4 guideline viewer) is the one item this plan can actually close.** `ADR-TRACEABILITY.md` carries it as 🔵 "Built 2026-07-14, not yet manually tested" — the only ADR-OPS-006 consequence in that state. **AC-05 is its test.** When AC-05 passes, flip that row to ✅ and cite AC-05; until then it stays 🔵 no matter how much other accessibility work is done.
2. **`ADR-OPS-006`'s Rationale names "shadcn/ui + Radix UI" as the accessibility baseline.** The codebase uses `@base-ui/react` throughout `components/ui/`, with no `@radix-ui/*` dependency — the same stale reference corrected in `technology-stack.md` v1.6 and `PDR-UI-001` on 2026-07-13. It does not change the decision (both primitives provide a comparable baseline) and the ADR is Tier 3, so it is flagged rather than edited. It matters only because a reader verifying expected keyboard or ARIA behaviour might check the wrong library's documentation.

**A correction worth recording, because it is the failure mode this project keeps finding in itself.** The first draft of this plan asserted that the Lighthouse CI consequence was undischarged and that a P5.3 task should be added. It is not undischarged — `GAP-15` closed it as an accepted deviation on 2026-06-16 with WJ's decision recorded in two places. The claim came from checking the code (no `lighthouserc*`, no CI step — both true) without then checking the register that records why. Absence in the codebase is not evidence of an unmade decision.

---

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-08-03 | Rapidglobe Ltd | Created as the seventh test layer under `DR-TEST-001` and P5.3's output artefact (WJ's decision, 2026-07-30; commissioned 2026-08-03). Covers all five of `ADR-OPS-006`'s manual pre-release items, the two guideline-viewer items in its Consequences, the five WCAG 2.2-specific criteria named in P5.3's 2026-07-30 note, and absorbs `help-and-tooltips-test-plan.md` HT-05 step 4, blocked since 2026-07-25. Includes an NVDA setup-and-operation section, written because NVDA operation — not the testing — was the actual blocker on 2026-07-25 and 2026-07-30. Two observations recorded: the undischarged Lighthouse CI consequence, and the ADR's stale Radix reference. |
