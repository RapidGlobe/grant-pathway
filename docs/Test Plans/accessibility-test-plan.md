# Accessibility — Test Plan (WCAG 2.2 Level AA)

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A new route, modal, or interactive component is added; `ADR-OPS-006`'s manual list changes; or a WCAG success criterion in scope is re-targeted

**Version:** 1.15
**Date:** 2026-08-09
**Status:** In execution. This is P5.3's output artefact and its definition of done. **AC-01 now PASSES.** All seven of its logged defects are fixed (`DEF-01`–`DEF-07`); `DEF-06` and `DEF-07`, found by run 3, were resolved the same day. WJ's call (2026-08-09): a fourth full 24-row re-sweep is not required to close this case — unlike `GAP-54`'s harness swap, which changed how every row is detected and so warranted re-checking all of them, these two fixes are isolated hex-value edits to two specific, non-shared elements, each already verified live via `axe-core` at zero violations. There is no plausible path by which an unrelated row could have regressed. AC-02 onward have not started. **Read AC-01 from the top — it assumes no prior experience of browser developer tools.**
**Tester:** WJ

---

## Purpose

`ADR-OPS-006` mandates a manual keyboard / focus / screen-reader / contrast pass **before each release**. Until now no test plan executed that for the product flow. The only accessibility case anywhere was `help-and-tooltips-test-plan.md` HT-05, scoped to tooltips — and that single feature-scoped keyboard step found `GAP-38`: **three of the ten tooltips completely unreachable by keyboard, a real WCAG 2.1.1 failure that had shipped.** One narrow plan found a real failure. Nothing has looked at the rest of the service.

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

Separately, and confirmed 2026-08-04: the local dev build loads axe-core but its **auto-reporting does not work**, so AC-01 drives axe explicitly rather than watching the console. **Read AC-01 from its first line** — it is written step by step for someone who has never opened browser developer tools, and starting partway in will not work.

```bash
npm run dev
```

**2. `.env.local` must hold all eight secrets, filled in by hand.**

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. All eight are flagged **Sensitive** in Vercel, so `vercel env pull` returns them empty for every environment — Development, Preview and Production alike. They must be copied from each provider's own dashboard. (Recorded in HT-05's notes, 2026-07-25.)

**3. A pre-seeded account with an in-progress application.** Following the pattern in `regression-test-plan.md` and the capability matrix: registration and profile mechanics are covered elsewhere and are not the point of this plan. AC-03 and AC-07 walk the full five-step flow, so the account needs an application that can be taken from Step 1 through to export.

**4. Chrome — and for AC-01, an Incognito window.** `ADR-OPS-006` names NVDA + Chrome. Firefox is a valid fallback if Chrome misbehaves, but record which was used.

**Run AC-01 in an Incognito window** (`Ctrl` + `Shift` + `N`). Browser extensions — password managers in particular — inject their own markup into password fields. On 2026-08-05 this produced a React hydration error on the sign-in page and can make axe report violations that belong to the extension, not to Grant Pathway. Incognito starts with extensions disabled, so what axe sees is what the product actually renders. You will have to sign in again in that window; that is the only cost.

_(AC-07 onward still needs a normal window — NVDA and Incognito interact awkwardly, and no password field is being swept by then.)_

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
| Error         | `not-found` (404), the authenticated `error.tsx` boundary, `app/global-error.tsx` (added 2026-08-04)                                 |

**Modals in scope:** the session-timeout modal (`session-timeout-modal.tsx`) and the guideline viewer dialog (`application-step4-draft.tsx`, "Original guidelines — …"). Both use the same `components/ui/dialog.tsx` Base UI primitive.

**Tooltips in scope:** all ten, per the inventory table in `help-and-tooltips-test-plan.md`.

---

## Test Results Summary

| Test ID | Test Name                                      | Result  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01   | axe-core clean sweep, all routes               | ❌ Fail | **Fully swept across three runs** (rows 1–20 on 2026-08-05, remaining rows on 2026-08-09, full 24-row regression re-sweep same day). First 5 defects **all fixed and confirmed non-regressed**: `DEF-01` contrast, `DEF-02` target-size, **`DEF-03` `scrollable-region-focusable` — WCAG 2.1.1 Level A, `GAP-49`**, `DEF-04` broken axe auto-reporting (`GAP-54` — driven off raw `axe-core` instead of `@axe-core/react`), `DEF-05` contrast on the "Answer approved" text. **The regression re-sweep found 2 new, unfixed defects, unrelated to `GAP-54`:** `DEF-06` (dashboard "Complete your profile" button, `GAP-55`) and `DEF-07` (Step 4 word-limit badge, `GAP-56`) — both colour-contrast gaps on UI states no earlier run's account had rendered. **Stays ❌ Fail on these two.** |
| AC-02   | Lighthouse accessibility score (target 95+)    | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-03   | Keyboard-only — full five-step flow            | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-04   | Keyboard — skip link, nav, footer, focus order | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-05   | Focus management — both modals                 | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-06   | Focus Appearance (SC 2.4.11 / 2.4.13)          | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-07   | NVDA — five-step flow, key journeys            | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-08   | NVDA — tooltips (absorbs HT-05 step 4)         | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-09   | NVDA — live regions and status announcements   | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-10   | Colour contrast against the documented ratios  | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-11   | Target Size (SC 2.5.8) and 44×44 touch targets | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-12   | Consistent Help (SC 3.2.6)                     | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-13   | Accessible Authentication (SC 3.3.8)           | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-14   | Redundant Entry (SC 3.3.7)                     | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| AC-15   | Text sizing, 200% zoom, and reflow             | ☐       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

---

## AC-01 — axe-core clean sweep, all routes

**This case is written for someone who has never used browser developer tools.** No prior knowledge is assumed. If a step tells you to press a key, press that key; if it tells you what you should see, and you see something else, stop and write down what you saw — that is a result, not a mistake on your part.

**Roughly how long:** two to three hours for all 24 pages, once set up. It is repetitive rather than difficult. You can stop and resume — just record which rows you have done.

### What this case is actually doing

"axe" is a tool that reads a web page and reports things that would make it unusable for someone with a disability — text too faint to read, a button too small to hit, an image with no description. It is built into this app when it runs on your own machine.

You are going to visit every page of Grant Pathway, run axe on each one, and write down what it says.

> **⚠️ Why the steps below are more involved than they should be.** axe is supposed to report problems into the browser automatically, and it does not — this was found on 2026-08-04. The part of the app that starts it up (`components/axe-provider.tsx`) hides its own failure, so it looks like it is working and finding nothing. It is not working at all. **A blank result means nothing until you have done Step 0.** Instead of waiting for axe to report, you will ask it directly. That works today.

---

### Step 0 — Open the app and the developer tools

**Do this first, once.**

1. Make sure the app is running on your machine. In your terminal, in the project folder, run:

```bash
npm run dev
```

Leave that window open and running. If it says something like `Ready in 2.7s`, you are fine.

2. **Open Chrome.**

3. In the address bar, type `localhost:3000` and press Enter. You should see the Grant Pathway sign-in page.

4. **Sign in** with the test account (Prerequisites 3). Most of the pages you need are only visible once signed in.

5. **Open the developer tools.** Press **`F12`**.

   A panel opens, usually on the right-hand side or along the bottom. This is Chrome's built-in toolkit for inspecting a page. It has a row of tabs along its top: `Elements`, `Console`, `Sources`, `Network`, and others.

   If `F12` does nothing, use **`Ctrl` + `Shift` + `I`** instead.

6. **Click the `Console` tab.** You will see a mostly-empty area with a `>` prompt at the bottom. This is where you can type instructions to the page. Some grey messages about React or HMR may already be there — ignore them, they are normal.

**Leave the developer tools open for the whole of this case.** Closing and reopening is fine, but you will need them on every page.

---

### Step 1 — Check that axe is actually there

Click into the console (next to the `>` prompt), **type** the following, and press Enter:

```
window.axe.version
```

**Type it rather than pasting it.** The first time you paste anything into Chrome's console it refuses, and asks you to type the words `allow pasting` first — a safety feature. Typing this short line avoids the whole detour.

**What you should see:**

- **A version number in quotes, like `'4.12.1'`** → good. axe is loaded. Go to Step 2.
- **A red error saying `Cannot read properties of undefined`** → axe is not loaded at all. **Stop.** Record AC-01 as **Blocked**, and write down exactly that error. This is a worse problem than any individual finding, because it means the accessibility tooling is entirely absent rather than merely quiet. Nothing else in this case can run.

**Either way, record one thing now:** that axe's automatic reporting is broken. It is a defect in its own right — `ADR-OPS-006` requires axe to report violations during development, and it does not. Put it in the Defect Log at the bottom of this plan as its own row, separate from anything you find on a page.

---

### Step 2 — Set up the sweep tool (once only)

Rather than retyping a long instruction on every page, you will save it once and then run it with two keys.

1. In the developer tools, click the **`Sources`** tab.

   If you cannot see `Sources`, the panel is too narrow — click the **`»`** symbol at the end of the tab row and pick it from the list.

2. Along the left of the Sources panel is a second, smaller row of tabs: `Page`, `Filesystem`, `Overrides`, **`Snippets`**. Click **`Snippets`**.

   Again, if you cannot see it, it will be behind a **`»`**.

3. Click **`+ New snippet`**. A file appears in the list, named something like `Script snippet #1`.

4. **Right-click its name → Rename.** Call it `axe-sweep` and press Enter.

5. Click into the large empty editor area on the right, and **paste in the whole block below.** (Pasting is allowed here — the restriction only applies to the Console.)

```
;(async () => {
  if (!window.axe) {
    console.error('AXE IS NOT LOADED — see AC-01 Step 1. Stop and record Blocked.')
    return
  }
  // Snap every in-flight fade/transition to its end state before measuring.
  // Without this, axe can catch a control mid-fade and report a colour-contrast
  // failure that does not exist. See the note under the code block.
  // The try/catch is required, not defensive tidiness: finish() throws
  // "Cannot finish Animation with an infinite target effect end" on any
  // looping animation — a spinner, a pulse — and one throw would abort the
  // whole sweep before axe ran. Found live on Step 4, 2026-08-07.
  document.getAnimations().forEach((a) => {
    try {
      a.finish()
    } catch {
      /* looping animation — nothing to finish */
    }
  })
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
  const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } })
  const count = r.violations.reduce((n, v) => n + v.nodes.length, 0)
  const lines = []
  lines.push('PAGE:   ' + location.pathname)
  lines.push('RESULT: ' + count + ' problem(s), ' + r.incomplete.length + ' needing a human check')
  r.violations.forEach((v) =>
    v.nodes.forEach((n) => {
      lines.push('')
      lines.push('  PROBLEM: ' + v.id + '  (severity: ' + v.impact + ')')
      lines.push('  MEANS:   ' + v.help)
      lines.push('  ON:      ' + n.target.join(' '))
      lines.push(
        '  DETAIL:  ' +
          (n.failureSummary || '')
            .split('\n')
            .slice(1)
            .join(' ')
            .trim()
      )
    })
  )
  if (r.incomplete.length) {
    lines.push('')
    lines.push('  NEEDS A HUMAN CHECK: ' + r.incomplete.map((i) => i.id).join(', '))
  }
  console.log(lines.join('\n'))
})()
```

6. Press **`Ctrl` + `S`** to save it. The filename stops showing an asterisk when saved.

**That is the setup done.** From now on, on any page, you run this by **right-clicking `axe-sweep` in the left-hand snippet list and choosing `Run`.** The result prints into the Console.

The snippet stays saved in Chrome. It survives page changes, reloads, and closing the browser.

> **⚠️ Two things that look like they should work, and do not** — both found the hard way on 2026-08-05, which is why the instructions above are worded as they are.
>
> - **`Ctrl` + `Enter` only runs the snippet while your cursor is still inside the code editor.** The moment you click anywhere else — the Console tab, the page, the address bar — the shortcut silently does nothing at all. No error, no output. Since every sweep needs you to click onto the page first, the shortcut is useless for this case. **Right-click → `Run` always works**, wherever the focus is. Use that and nothing else.
> - **The result does not go to your clipboard.** An earlier version of the snippet called `copy()`, which only exists when you type it into the Console yourself — it is not available inside a snippet, so it did nothing. The `copy()` line has been removed. To get the result out: **right-click the output block in the Console → `Copy`.** The snippet deliberately prints everything as one single message, so one right-click takes the lot.
>
> **And one line in the snippet you can ignore, but should not delete.** `document.getAnimations().forEach(a => a.finish())` jumps any fade or slide that is still playing straight to its finished state. Buttons and pop-ups in this app fade in over about 150 milliseconds; if axe measures one halfway through, it sees a half-transparent colour and reports a contrast failure that vanishes the moment you look at it. That happened on 2026-08-05 — a reading of `2.23` on the "Look up charity" button, investigated and discarded as an artefact. The line makes it impossible for the same false alarm to happen again.

---

### Step 3 — Do one page from start to finish

**Do this exact page first, before the others.** It proves your setup works, because we already know what it should say.

1. Go to `localhost:3000` — the sign-in page. Sign out first if you are signed in.
2. Click the **`Console`** tab so you can see the output.
3. Go back to **`Sources` → `Snippets`**, **right-click `axe-sweep`**, and choose **`Run`**. Then click the **`Console`** tab again to read the result.

   (This is the two-tab shuffle you will repeat on every page. It is tedious but reliable. Do not try to shortcut it with `Ctrl` + `Enter` — see the warning at the end of Step 2.)

**You should see something very close to this:**

```
PAGE:   /
RESULT: 2 problem(s), 0 needing a human check

  PROBLEM: color-contrast  (severity: serious)
  MEANS:   Elements must meet minimum color contrast ratio thresholds
  ON:      .text-\[11px\]
  DETAIL:  Element has insufficient color contrast of 2.44 ...

  PROBLEM: target-size  (severity: serious)
  MEANS:   All touch targets must be 24px large, or leave sufficient space
  ON:      .absolute
  DETAIL:  Target has insufficient size (16px by 16px, should be at least 24px by 24px) ...
```

**These two are real problems, not test examples.** The first is the small grey version number at the bottom of the page, too faint to read. The second is the "Show password" eye button, too small to hit reliably.

**This is your check that the tooling works:**

- **You saw both** → your setup is correct. Continue to Step 4.
- **You saw `0 problem(s)`** → **something is wrong with your setup, not with the page.** Do not continue and do not record the other pages as clean — a clean result cannot be trusted until this page reports two. Go back through Steps 1 and 2.
- **You saw a red error** → write down exactly what it says and stop.

4. **Record it.** **Right-click the output block in the Console → `Copy`**, and paste it into the Notes area at the bottom of this case. Then fill in the row for page 1 in the results table in Step 6.

Now do the same thing on every remaining page.

---

### Step 4 — The important habit: make things appear before you run the sweep

**axe can only see what is on the screen at that moment.** If an error message, a pop-up, or a panel is not currently showing, axe does not know it exists and will not check it. A page you simply look at and sweep will come back cleaner than it really is.

So for most pages there is something you need to make happen first. The table in Step 5 tells you what, for each page. For example, "submit the empty form" means: click the main button without typing anything, so the red error messages appear — _then_ run the snippet.

**To go to a page**, type the address into Chrome's address bar. Where the table says `/profile`, that means `localhost:3000/profile`.

---

### Step 5 — Every page to sweep

Work down this list. Do what the middle column says, **then** right-click `axe-sweep` → `Run`, then right-click the Console output → `Copy` and paste it into your notes.

| #   | Go to                                   | Make this happen first, then sweep                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `/` (signed out)                        | ✅ Done in Step 3. Also click the eye icon to show the password, and sweep again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2   | `/register`                             | Click "Create account" with every box empty, so all the red errors appear.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3   | `/forgot-password`                      | Submit with the box empty → error appears. Sweep. Then enter a real address and submit → the confirmation message appears. Sweep again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4   | `/verify-email`                         | Sweep the page as it loads. Then use the "resend" form on it and sweep once the "sent" message appears.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 5   | `/verify-email/confirm`                 | Go there directly, with nothing after it in the address. You will get an error state — sweep that. **Write in your notes that you tested the error state**, not the success one (which needs a fresh registration). ⚠️ **The sweep will print `PAGE: /verify-email`, not `/verify-email/confirm`** — the route redirects. That is expected, not a mistake; note by hand which state you were actually looking at, because the printed path cannot tell you and the two rows will otherwise look identical. The same applies to the `?state=expired` variant.                                                                                                                                                                                                       |
| 6   | `/privacy`                              | Scroll to the very bottom first, then sweep.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7   | `/terms`                                | Same.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 8   | `/no-such-page`                         | Any made-up address. This shows the "page not found" screen. Sweep it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 9   | `/dashboard`                            | Signed in, with at least one application showing. **Three sweeps.** (a) The page as it loads. (b) Click **`Delete`** on any row — a confirmation pop-up appears — sweep, then click **`Cancel`**. (c) Click **`Re-open`** on any row that shows it (only completed applications do; in-progress ones show `Continue` instead) — sweep that pop-up, then **`Cancel`**. ⚠️ **There is no menu on a row.** An earlier version of this line said to "open any menu or action", which sent the tester hunting for a three-dots button that does not exist. The actions are plain `Delete` and `Re-open`/`Continue` buttons, always visible.                                                                                                                             |
| 10  | `/dashboard` (empty)                    | The version with no applications at all. If your test account has applications, **write "not covered — account has applications"** rather than reusing row 9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 11  | `/profile`                              | **Four sweeps.** (a) Empty a required box and save → errors appear. (b) Type a real charity name or registration number into the Charity Commission box, click **Look up charity**, and sweep once the name and number have filled themselves in. (c) Look up a name that does not exist (`Zzzz Charity`) and sweep the "we couldn't find that" message. (d) Optional, and already covered once: the "we couldn't reach the Charity Commission" failure message. ⚠️ **There is no list of results to pick from.** An earlier version of this row described sweeping "with the results list showing" and then picking one — that UI does not exist. `lookupCharity()` takes the first match only and fills the fields straight away, so (b) is one action, not two. |
| 12  | `/account`                              | Submit the change-password form empty → errors appear. Hover or tab onto any tooltip so it shows, then sweep.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 13  | `/account/delete`                       | ⚠️ **Just look at the page and sweep it. Do NOT click the confirm button.** That permanently deletes the account and everything in it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 14  | `/applications/new`                     | Click continue with the boxes empty → errors appear.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 15  | An existing application                 | Open one from the dashboard. If it jumps straight to a step, note that it did.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 16  | Step 1                                  | Continue with the boxes empty → errors appear.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 17  | Step 2                                  | **One sweep, not two.** The upload area and the paste box are both on screen at the same time — there is nothing to switch between, so a single sweep covers both. (An earlier version asked for two sweeps and described switching between them; that was wrong.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 18  | Step 3                                  | Sweep **while the summary is still generating** (the messages that change as it works), then again once it has finished. ~~Then click a citation link to open the guidelines pop-up and sweep with it open.~~ **Correction, 2026-08-09: no citation link exists on Step 3.** The guideline-viewer dialog lives only in `application-step4-draft.tsx`; this instruction described the same pop-up row 20.6 already covers on Step 4. ⚠️ Regenerating a summary uses one of your 50 monthly AI actions.                                                                                                                                                                                                                                                              |
| 19  | Step 4 gate, "Before you begin writing" | **Needs a brand-new application** — the gate appears once per application and every application already on the account has passed it. Do not create one just for this row: it is free alongside any `GCM-` case, which all start fresh. Sweep the gate before ticking through it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 20  | Step 4 (main)                           | The big one — see the seven sweeps listed below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 21  | Step 5                                  | Sweep before ticking the review box, then after. Approve, then trigger the Word export and sweep.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 22  | Session-timeout pop-up                  | See the instructions below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 23  | Error screen                            | See the instructions below. **Recording this as Blocked is acceptable.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 24  | Whole-site error screen                 | Same as 23. **Blocked is acceptable.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

---

#### Row 20 in detail — Step 4 needs seven separate sweeps

Step 4 has several different things that can be on screen, and they cannot all be showing at once. Sweep after each.

1. **Just arrived** — nothing answered yet.
2. **An answer typed in**, not yet approved.
3. **The "Not saved" warning.** To make it appear: type something into an answer box, then — in the developer tools — click the **`Network`** tab, find the dropdown that says **`No throttling`**, and change it to **`Offline`**. Now click outside the answer box. An orange "Not saved" bar should appear. Sweep it. **Then set that dropdown back to `No throttling`.** This bar has never been checked by anything, so it is worth getting right.
4. **The governance panel open**, and add a governance item by hand.
5. **At least one answer approved** — the progress bar and the approved badge change.
6. **The guidelines pop-up open**, from a citation link on this step.
7. **A tooltip showing.** Include the three that were recently fixed: the "no AI on budgets" one, the "guidelines choice" one, and the "summary review" one.

#### Row 22 in detail — making the session-timeout pop-up appear

This pop-up normally appears after **55 minutes** of doing nothing. You are not going to wait that long, so you will shorten it temporarily. This does involve editing one line of code.

1. Open the file `components/session-timeout-provider.tsx` in your editor.
2. Find this line near the top (line 9):

```
const WARNING_MS = 55 * 60 * 1000 // Show modal at 55 minutes
```

3. Change `55 * 60 * 1000` to `10 * 1000`. Save the file. The app reloads by itself.
4. Go to any signed-in page and **take your hands off the mouse and keyboard for ten seconds.** Do not move the mouse — mouse movement counts as activity and restarts the timer.
5. The pop-up appears. Run the sweep by right-clicking the `axe-sweep` snippet and choosing **Run**. Clicking in the Sources panel does not count as activity on the page, so the pop-up stays open.
6. **Change that line back to `55 * 60 * 1000` and save.** Do not commit the shortened version.

#### Rows 23 and 24 in detail — the error screens

These are the screens shown when something goes badly wrong. Making them appear on purpose requires deliberately breaking something in the code, which is developer work rather than testing.

**If you would rather not**, write **Blocked — needs a developer to force the error state** in the results table and move on. That is a legitimate result and better than a guess. Flag it and it can be covered separately.

---

### Step 6 — Record everything

Fill in a row for every page, including the clean ones. **A page with no row is an untested page, not a passing one** — that ambiguity is exactly what went wrong with the previous attempt at this case.

For anything you find, also add a row to the **Defect Log** at the bottom of this plan.

#### Run 1 — 2026-08-05 (partial: rows 1–20)

**Environment.** axe-core 4.12.1, `localhost:3000`, tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`. Counts are **node counts** — the number of individual elements failing — grouped by identical failure text, not the number of distinct problems. Rows 1–9 were run by WJ in a Chrome Incognito window; rows 10–21 were driven by Claude through Claude-in-Chrome against WJ's signed-in Chrome profile.

**The two environments agree.** `/dashboard` returned exactly 18 and Step 4 exactly 12 in both, which is what makes the two halves of this run comparable rather than two separate partial runs.

| #     | Page                                                   | Problems found | Names of the problems                               | Notes                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------ | -------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `/` signed out, and again with the password shown      | 2              | `color-contrast`, `target-size`                     | The reproduction check in Step 3. Both are `DEF-01` and `DEF-02`                                                                                                                                                                          |
| 2     | `/register`, all errors showing                        | —              | `target-size` ×2                                    | Two more eye buttons, same component as row 1. Per-row count not recorded                                                                                                                                                                 |
| 3     | `/forgot-password`, error state and confirmation state | —              | `color-contrast` (footer)                           | Per-row count not recorded                                                                                                                                                                                                                |
| 4     | `/verify-email`, as loaded and after resend            | —              | `color-contrast` (footer)                           | Per-row count not recorded                                                                                                                                                                                                                |
| 5     | `/verify-email/confirm`, error state                   | —              | `color-contrast` (footer)                           | Error state only. `?state=expired` not covered. Per-row count not recorded                                                                                                                                                                |
| 6     | `/privacy`                                             | —              | `color-contrast` (footer)                           | Per-row count not recorded                                                                                                                                                                                                                |
| 7     | `/terms`                                               | —              | `color-contrast` (footer)                           | Per-row count not recorded                                                                                                                                                                                                                |
| 8     | `/no-such-page` (404)                                  | —              | `color-contrast` (footer)                           | Per-row count not recorded                                                                                                                                                                                                                |
| 9     | `/dashboard`, populated                                | 18             | `color-contrast`, `target-size`                     | Cross-check row — same count in both environments                                                                                                                                                                                         |
| 10    | `/dashboard`, empty                                    | —              | —                                                   | **Not covered** — the test account holds 12+ applications                                                                                                                                                                                 |
| 11    | `/profile`, as loaded                                  | 1              | `color-contrast`                                    | Footer only                                                                                                                                                                                                                               |
| 11    | `/profile`, required fields emptied, 4 errors showing  | 1              | `color-contrast`                                    | No new problems from the error state                                                                                                                                                                                                      |
| 11b   | `/profile`, charity lookup — "couldn't reach" failure  | 2              | `color-contrast` ×2                                 | This swept the **`unavailable`** state only: `CHARITY_COMMISSION_API_KEY` was empty locally, so the action returned before ever calling the API. One reading discarded as an artefact, see below                                          |
| 11c   | `/profile`, lookup succeeded, fields populated         | —              | —                                                   | **Not covered in run 1** (recorded then as "blocked — no results list to pick from"; the row was describing UI that does not exist). **Unblocked 2026-08-07** — the real key is in `.env.local` and verified working against the live API |
| 11d   | `/profile`, charity not found                          | —              | —                                                   | **Not covered.** Also unreachable in run 1: with no key the action returns `unavailable` and never `not_found`, so this state could not be produced                                                                                       |
| 12    | `/account`, as loaded                                  | 4              | `color-contrast`, `target-size` ×3                  | **New:** three further eye buttons, same component again                                                                                                                                                                                  |
| 12    | `/account`, change-password submitted empty, 3 errors  | 4              | as above                                            | No new problems from the error state                                                                                                                                                                                                      |
| 12    | `/account`, "Delete my account" tooltip showing        | 4              | as above                                            | No new violations; one new `incomplete` (`color-contrast`)                                                                                                                                                                                |
| 13    | `/account/delete`, confirm **not** clicked             | 1              | `color-contrast`                                    | Footer only                                                                                                                                                                                                                               |
| 14/16 | Step 1, as loaded                                      | 5              | `color-contrast`                                    | Step labels under the progress bar                                                                                                                                                                                                        |
| 14/16 | Step 1, Continue clicked empty, 2 errors showing       | 5              | `color-contrast`                                    | No new problems from the error state                                                                                                                                                                                                      |
| 17    | Step 2, upload area and paste box (both visible)       | 4              | `color-contrast`                                    | One sweep covers both — see the corrected row 17 above                                                                                                                                                                                    |
| 18    | Step 3, summary already generated                      | 4              | `color-contrast`                                    | The generating state was not caught                                                                                                                                                                                                       |
| 18    | Step 3, citation pop-up                                | —              | —                                                   | **Not covered** — no citation link on the application tested                                                                                                                                                                              |
| 19    | Step 4 gate, "Before you begin writing"                | **0**          | —                                                   | ✅ Swept 2026-08-07 alongside `GCM-06`'s live re-run — **0 violations, 0 `incomplete`**. Blocked since 2026-08-05 only for want of a fresh application, which that case creates anyway                                                    |
| 20.1  | Step 4, just arrived                                   | 12             | `color-contrast`                                    | Cross-check row — same count in both environments                                                                                                                                                                                         |
| 20.2  | Step 4, answer typed, not approved                     | —              | —                                                   | **Not done** — would modify a live answer                                                                                                                                                                                                 |
| 20.3  | Step 4, offline "Not saved" bar                        | —              | —                                                   | **Not done** — needs DevTools Network → Offline                                                                                                                                                                                           |
| 20.4  | Step 4, governance panel open                          | 12             | `color-contrast`                                    | No new problems from the panel                                                                                                                                                                                                            |
| 20.5  | Step 4, at least one answer approved                   | —              | —                                                   | **Not done** — changes application state                                                                                                                                                                                                  |
| 20.6  | Step 4, guidelines pop-up from a citation link         | 13             | `color-contrast`, **`scrollable-region-focusable`** | **The one new class of defect in this run.** `DEF-03` / `GAP-49`                                                                                                                                                                          |
| 20.7  | Step 4, tooltip showing                                | 12             | `color-contrast`                                    | No new problems from the tooltip                                                                                                                                                                                                          |
| 21    | Step 5                                                 | —              | —                                                   | **Blocked** — the approved application offered no route to Step 5                                                                                                                                                                         |
| 22    | Session-timeout pop-up                                 | —              | —                                                   | Not reached                                                                                                                                                                                                                               |
| 23/24 | Error screens                                          | —              | —                                                   | Not reached. `Blocked` is acceptable per Step 5                                                                                                                                                                                           |

**Why rows 2–8 have no count.** They were run in chat and only their findings were carried forward; the per-row node counts were not written down at the time and are not recoverable. What each row _found_ is recorded and is complete — every finding on those pages belongs to `DEF-01` or `DEF-02`. Re-run them to get the numbers. This is the whole reason results are now banked in the repo the same day they are gathered rather than left in a session.

**One reading discarded as an automation artefact, not a defect.** `2.23 — #fefcfa on #85b4b2` on the "Look up charity" button, row 11b. The tab was in the background, where Chrome freezes CSS transitions, so axe measured the button halfway through a 150 ms fade. Forcing a repaint settled it to full opacity. The snippet now finishes all animations before running, so this cannot recur.

**Needing a human check (axe `incomplete`) — resolved 2026-08-09 below (`aria-hidden-focus`), one still outstanding:**

- ~~`aria-hidden-focus` — the dashboard Delete and Re-open pop-ups, and the Step 4 guidelines pop-up. **Question to answer:** with the pop-up open, can you Tab to the buttons behind it?~~ **Resolved 2026-08-09 — Pass**, see run 2 below.
- `color-contrast` — recurring on the step pages, the `/account` tooltip, and Step 4. axe could not measure some text and needs an eyeball. Per Step 7, this is **not a pass**. Still outstanding; flagged for AC-10, per `DEF-01`'s resolution note on placeholder text.

**Row 19 came off that list on 2026-08-07**, swept as a by-product of GCM-06's live re-run — that test needed a brand-new application, which is exactly the state row 19 had been blocked on. Worth noting as a scheduling lesson rather than a result: the row was never hard, it just needed a fresh application, and one existed for twenty minutes during an unrelated test.

**Unblocked 2026-08-07:** the real `CHARITY_COMMISSION_API_KEY` is now in `.env.local` and was verified against the live API (HTTP 200, real charity returned). Rows **11c** and **11d** are testable. Note this is two states rather than the two rows run 1 recorded — see the corrected row 11 above; the "results list" it described does not exist.

**Housekeeping left over from run 1:** delete the draft application named "AC-01 sweep — please delete" from the test account. Not present on the account when run 2 started — either already cleared, or never created under that exact name; nothing further to do.

#### Run 2 — 2026-08-09 (rows 10, 11c, 11d, 18, 20.2, 20.3, 20.5, 21, 22, 23, 24, plus both manual checks)

**Environment.** Same axe-core 4.12.1 and tag set as run 1, `localhost:3000`, driven by Claude through Claude-in-Chrome against WJ's signed-in Chrome profile — same arrangement run 1 used for rows 10–21.

**A stale `.next` build cache produced a false start, not a product defect.** A fresh `npm run dev` 404'd every `/applications/[id]/...` route, including the base redirect. The `.next/BUILD_ID` was dated 2026-07-31, three dependency bumps behind the current `next@16.2.12` — the manifest simply didn't match the installed framework version. Deleting `.next` and restarting fixed it completely; recorded here so a future session facing the same 404 checks the cache age before assuming a code regression.

**Rows 20.2, 20.5 and 21 needed the GCM-07 application re-opened** (Prerequisites' Re-open confirmation dialog, already covered by row 9) to get back to an unapproved-then-approved state. Re-opening it correctly reset all 23 answers to unapproved without touching the answer text itself — approving them one at a time (scripted, since this is mechanical) reached both 20.2 and 20.5 in sequence, then the same application was carried through to a real Step 5 export for row 21.

| #    | Page / state                                                   | Problems found | Names of the problems | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------- | -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 10   | `/dashboard`, empty                                            | —              | —                     | **Still not covered** — the test account holds 3–4 applications throughout this session                                                                                                                                                                                                                                                                                                                                              |
| 11c  | `/profile`, lookup succeeded ("British Red Cross")             | 0              | —                     | Clean                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 11d  | `/profile`, charity not found                                  | 0              | —                     | Clean. **Could not be reached by searching a made-up name** — see the defect below; reached instead via a bogus registration number (`9999999`), whose branch already handles a 404 correctly                                                                                                                                                                                                                                        |
| 18   | Step 3 citation pop-up                                         | n/a            | —                     | **Not a real state** — see the row 18 correction above. No sweep performed; the actual pop-up is row 20.6, already swept in run 1                                                                                                                                                                                                                                                                                                    |
| 20.2 | Step 4, answer typed, not approved                             | 0              | —                     | Clean — confirms `DEF-01`'s contrast fix holds on this page                                                                                                                                                                                                                                                                                                                                                                          |
| 20.5 | Step 4, at least one answer approved                           | 1              | `color-contrast`      | **New finding — `DEF-05`.** The green "Answer approved — edit above to revise" text; never seen before because no earlier sweep had approved anything                                                                                                                                                                                                                                                                                |
| 20.3 | Step 4, offline "Not saved" bar                                | 16             | `color-contrast`      | Same `DEF-05` token, now at scale — 16 of 17 answers on the application used already showed the approved state alongside the banner. The red "Not saved" banner itself had no violations                                                                                                                                                                                                                                             |
| 21   | Step 5 — before ticking, after ticking/approving, after export | 0 (all three)  | —                     | Clean throughout, including a real `.docx` download                                                                                                                                                                                                                                                                                                                                                                                  |
| 22   | Session-timeout pop-up                                         | 0              | —                     | Clean                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 23   | Authenticated `error.tsx` boundary                             | 0              | —                     | Clean. Forced via a temporary `throw` in `dashboard/page.tsx`, reverted after                                                                                                                                                                                                                                                                                                                                                        |
| 24   | `app/global-error.tsx`                                         | n/a            | —                     | **axe cannot run here at all — a structural limit, not a gap.** `AxeProvider` mounts inside the root layout that this boundary replaces, so `window.axe` never loads. Forced via a temporary `throw` in `app/layout.tsx`, reverted after. Manual check instead: single `<h1>`, `lang="en"` set, one reachable non-disabled button, white-on-black button (21:1) and near-black heading on cream background — all comfortably over AA |

**Manual check — `aria-hidden-focus`: Pass.** Tabbed 8–16 times with each of the three dialogs open (session-timeout modal, dashboard Delete confirmation, Step 4 guidelines viewer) and confirmed focus never reached `header`, `#main-content` or `footer` in any of them — it stayed cycling on the dialog's own buttons throughout. axe's `incomplete` flag on this rule is a known false-flag for a correctly-implemented focus trap (Base UI's focus-guard spans), not a defect.

**One functional bug found while reaching row 11d, not an accessibility finding — fixed same day.** `actions/charity.ts`'s charity-name search branch (`searchCharityName`) was missing the `res.status === 404` check that the registration-number branch already had, so a genuine "no match" search misreported as "we couldn't reach the Charity Commission right now" (`unavailable`) instead of "we couldn't find that charity" (`not_found`). Confirmed directly against the live API — `curl` against `searchCharityName/Zzzz%20Charity` returns a real `404`, not an empty `200` array, which the code's `!res.ok` catch-all was swallowing into the wrong branch. **Fixed 2026-08-09** by adding the same check already present in the sibling branch; verified live by re-running the same search and seeing the correct message. No new test added — this file has no existing test coverage of any kind to extend, and a full mock of its auth/fetch/Bedrock chain for a one-line fix would be disproportionate; raised as `GAP-53` in `ADR-TRACEABILITY.md`.

**Housekeeping completed 2026-08-09:** GCM-07 (`Stony Stratford Town Counci`) deleted from the test account now that rows 20.2, 20.5 and 21 are banked, per the standing instruction.

#### Run 3 — 2026-08-09 (full 24-row re-sweep, requested by WJ after `GAP-54` closed `DEF-04`)

**Purpose: confirm the harness swap (`@axe-core/react` → raw `axe-core`, `GAP-54`) introduced no regressions.** Every row was re-run from a fresh throwaway account rather than the long-lived seeded one, because the sandboxed browser driving this run had no signed-in session and the repo's local-only `supabase/seed.sql` account does not exist in the shared `grant-pathway-dev` project. A confirmed test user was created and later deleted via the Supabase admin API (`SUPABASE_SERVICE_ROLE_KEY`, already present in `.env.local` for the app's own use), on WJ's explicit choice between three options offered. Same axe-core 4.12.1, same five WCAG tag set, same snippet logic — run programmatically via `window.axe.run()` at each state rather than by hand, which is the same call the manual DevTools snippet makes.

**Result: every row DEF-01/02/03/04/05 had already fixed stayed fixed. No regression from the harness swap anywhere.** `color-contrast` on the sign-in version string, `target-size` on every eye button, `scrollable-region-focusable` on the guidelines dialog, and the "Answer approved" text all came back clean exactly where prior runs left them — including on brand-new UI states these prior runs never reached (a fresh unapproved answer, a second approved answer, a governance card added moments earlier). Rows 1–8, 11, 12, 13, 14/16, 17, 18 (main states), 19, 22, 23 and Step 5's three states (including a real `.docx` export) all reported **0 problems**.

**But the point of a real re-sweep is that it can find things a superficial check would miss, and this one did — two new defects, neither caused by `GAP-54` and neither seen by any prior run, because a fresh account reaches states the long-lived seeded account never has.**

- **Row 10 (`/dashboard`, empty) is reachable for the first time** — every prior run recorded it "not covered" because the test account always held applications. A fresh account's empty dashboard also carries a "Complete your profile" call-to-action, never swept before, and it fails contrast: white text on `#D97706`, 13px, **3.18:1** against the 4.5:1 AA floor. Logged as `DEF-06`.
- **Row 20 (Step 4, every sub-state with at least one question card)** carries a word-limit badge ("200 words", "250 words") that fails contrast: `#64748B` — `DEF-01`'s own replacement colour, the one already confirmed safe on three other backgrounds — on `#F1F5F9`, 11px, **4.34:1**. This is not `DEF-01` recurring; it is the same token failing on a fourth background nobody checked, on a UI element (`DEF-01`'s fix covered word-_count_ pills, not the word-_limit_ badge shown before a count exists) no prior sweep's pre-seeded application happened to render in this exact shape. Present at 3 instances on arrival, 4 once a governance card was added; 0 new instances from typing, approving, or opening the governance panel — same "count is a floor" pattern this project has recorded three times now (`DEF-01`, `DEF-02`, `DEF-05`). Logged as `DEF-07`.

**Two rows could not be reproduced this run and are recorded as such, not silently passed:**

- **Row 20.3 (offline "Not saved" bar)** — the documented method uses DevTools' real Network→Offline throttle, which this sandboxed session's tooling has no equivalent for. A scripted `fetch` rejection was tried instead and did not trigger the save path (the component's dirty-tracking did not register the scripted edit), so this state was not re-verified this run. It was swept clean in run 2 (16 instances of the pre-existing `DEF-05`, since fixed; the banner itself carried no violations) and there is no reason tied to `GAP-54` to expect a change, but "no reason to expect a change" is not the same as "confirmed," so this is flagged rather than assumed.
- **Row 20.6 (guidelines pop-up from a citation link)** — needs source text with page markers to produce a citation; this run's throwaway application used a short plain-text paste with none. Already reverified clean during this session's `DEF-03` fix work earlier today (0 violations, real `ArrowDown` scroll confirmed) on a different application, which is why it is not re-flagged as a gap in coverage so much as a note on why this particular run's account could not reach it.

**`aria-hidden-focus`, the dashboard Delete and Re-open dialogs, and the session-timeout modal:** all three opened cleanly with the expected `incomplete` count (2, matching run 1/2's pattern) and no violations. This run did not repeat run 2's manual tab-through of each dialog by hand — that was a first-time verification and stands from run 2; this pass is a regression check, and the axe `incomplete` pattern matching prior verified-safe behaviour was judged sufficient rather than re-deriving it from scratch.

**AC-01 stays ❌ Fail — for a new reason.** Every defect fixed so far stays fixed and the harness swap introduced nothing new; but `DEF-06` and `DEF-07` are open, unfixed findings, which is what keeps this case from passing. Neither is a `GAP-54` regression: both are pre-existing colour-token gaps that simply required a UI state (empty dashboard, a word-limit badge) that no account used across three runs had ever rendered.

**Addendum, same day: both fixed, and AC-01 now Pass.** WJ approved fixes for both immediately after this run's write-up — see each defect's own "✅ Resolved" section above (`DEF-06`, `DEF-07`) for the fix and its live verification. WJ then confirmed a fourth full re-sweep is not needed to close this case: unlike `GAP-54`'s harness swap, which changed the detection mechanism for every row, these two fixes are isolated hex-value edits to specific, non-shared elements, each already verified live at zero violations. AC-01's Result above is updated to Pass on that basis.

---

### Step 7 — Making sense of the results

- **"Needing a human check" is not a pass.** axe says this when it cannot decide by itself — most often about faint text sitting on top of an image or a gradient. Look at it yourself and write down your verdict. Do not treat it as clean.
- **The same problem on ten elements is usually one fix, not ten.** Record the number, but describe it as one problem with the shared component.
- **Some findings belong to other cases too.** Anything about sizes overlaps AC-11; anything about colour overlaps AC-10. **Write it down once**, in whichever case you found it, and mention the other. Do not log it twice.
- **Severity** — axe labels each as `minor`, `moderate`, `serious` or `critical`. Record what it says; you do not need to judge it yourself.

**Expected result:** no problems on any page, and every "needs a human check" item looked at and cleared.

**In practice this case cannot pass on its first run** — the two problems on the sign-in page are already known and real. A populated Defect Log is the expected outcome. The point of the exercise is finding out what else is there.

**Do not reuse the earlier result.** HT-05 swept eight pages on 2026-07-25 and reported no problems. That result is now known to be **worthless rather than merely unrecorded**: it relied on the automatic reporting that does not work, so "no problems" was simply an empty screen. Sweep everything again; carry nothing forward.

**Result:** ☑ **Pass** &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked — _fully swept across three runs: rows 1–20 on 2026-08-05, the remainder on 2026-08-09, then a full 24-row regression re-sweep the same day after `GAP-54`. Coverage is complete and all seven logged defects (`DEF-01`–`DEF-07`) are now fixed, including `DEF-06`/`DEF-07` the same day they were found. WJ's call: a fourth full sweep to re-confirm the two colour fixes is not required — both are isolated hex-value changes to specific, non-shared elements, each independently verified live via `axe-core` at zero violations, with no mechanism by which any other row could have regressed._

**Notes:**

**Failed, and fails on complete coverage, as predicted.** Five defects are logged. `DEF-01` and `DEF-02` reproduce the two problems Step 3 predicted (both since fixed). `DEF-03` is a WCAG **Level A** failure (open). `DEF-05`, found in run 2, is a WCAG AA contrast failure that could not have been caught any earlier — it only appears once at least one answer is approved, a state run 1 never reached (open).

**Coverage is now complete.** Every row is either swept, confirmed not applicable (row 18 — see the correction above), or confirmed genuinely not coverable on this account (row 10). Two items remain outside AC-01 itself: the `color-contrast` `incomplete` still needs a human eyeball verdict (flagged for AC-10, consistent with `DEF-01`'s resolution note on placeholder text), and row 24 (`global-error.tsx`) can never be swept by axe at all for structural reasons explained in the run 2 table — a manual check stood in instead. `aria-hidden-focus`, the other `incomplete` from run 1, is now resolved: **Pass**, confirmed by hand across all three dialogs in the product.

**Four of five defects are fixed; one is open.** `DEF-01` and `DEF-02` — fixed 2026-08-07, WJ's decision. `DEF-05` — fixed 2026-08-09, WJ's decision, same day it was found: recoloured to `#065F46`, verified live (0 violations on the page that had shown 16). `DEF-03`/`GAP-49` — also fixed 2026-08-09, same day: scroll container given `tabIndex`, `role="region"` and a citation-specific accessible name, verified live with real keyboard scrolling and a clean axe re-sweep. Only `DEF-04` remains open — the broken axe harness itself, feeding `GAP-15`.

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

| #        | Case  | Severity | WCAG SC                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Status                                                                                                                                                                     |
| -------- | ----- | -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEF-01` | AC-01 | serious  | 1.4.3 Contrast (Minimum), AA      | **One colour token, not many bugs.** `#94A3B8` fails AA on every background it is used on. Five variants, listed in the table below. Overlaps AC-10 — recorded here, not twice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ✅ **FIXED 2026-08-07** (WJ's decision) — Light slate retired as a text colour; 4 of 5 status pills recoloured. See below                                                  |
| `DEF-02` | AC-01 | serious  | 2.5.8 Target Size (Minimum), AA   | **One component, six instances.** The show/hide-password eye button renders 16×16 against a 24×24 minimum: sign-in (1), `/register` (2), `/account` (3). Overlaps AC-11 — recorded here, not twice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ **FIXED 2026-08-07** (WJ's decision) — extracted to a shared `PasswordInput`; 28×28. **Eight instances, not six** — see below                                           |
| `DEF-03` | AC-01 | serious  | **2.1.1 Keyboard, Level A**       | **The only Level A failure found, and the most serious.** Step 4, the guidelines pop-up opened from a "Page N of the guidelines" citation link: the scrolling box holding the guideline text (`.max-h-[60vh]`) cannot be reached or scrolled by keyboard. Detail below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ✅ **FIXED 2026-08-09** (`GAP-49`) — scroll container given `tabIndex={0}`, `role="region"` and a citation-specific `aria-label`. See below                                |
| `DEF-04` | AC-01 | —        | n/a — `ADR-OPS-006` Decision item | **The harness, not the product.** `@axe-core/react`'s automatic reporting does not work: `components/axe-provider.tsx` swallows a React 19 incompatibility in a silent `catch`, so a page with real violations produces an empty console. Found 2026-08-04, confirmed on this run.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ✅ **FIXED 2026-08-09** (`GAP-54`) — `@axe-core/react` replaced with raw `axe-core`, driven manually instead of through the incompatible React binding. See below          |
| `DEF-05` | AC-01 | serious  | 1.4.3 Contrast (Minimum), AA      | **A state no earlier sweep had reached.** The green "Answer approved — edit above to revise" text (`#059669` on `#F0FDF4`, 13px, measured **3.6:1**) fails the 4.5:1 AA floor. Invisible to every prior sweep because nothing had been approved yet when they ran — found only in run 2, on rows 20.5 and 20.3, once an answer was actually approved. Detail below.                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ **FIXED 2026-08-09** (WJ's decision) — text recoloured to `#065F46`, the darker green already used for this same icon-plus-text pairing elsewhere in the app. See below |
| `DEF-06` | AC-01 | serious  | 1.4.3 Contrast (Minimum), AA      | **A state no earlier run's account had ever rendered.** The dashboard's "Complete your profile" call-to-action, shown only when the charity profile is incomplete: white text on `#D97706`, 13px, measured **3.18:1** against the 4.5:1 AA floor. Every prior run used a long-lived account whose profile was already complete; run 3's fresh throwaway account reached row 10 (`/dashboard`, empty) for the first time and found this alongside it. Detail below.                                                                                                                                                                                                                                                                                                                    | ✅ **FIXED 2026-08-09** (WJ's decision) — background darkened to `#B45309`, the button's own existing hover shade. See below                                               |
| `DEF-07` | AC-01 | serious  | 1.4.3 Contrast (Minimum), AA      | **`DEF-01`'s own replacement colour, failing on a background nobody checked.** Step 4's word-limit badge ("200 words", "250 words", shown on every question card before an answer is typed): `#64748B` — the colour `DEF-01` moved 11 text uses to, confirmed safe on three backgrounds at the time — on `#F1F5F9`, 11px, measured **4.34:1** against the 4.5:1 floor. Not `DEF-01` recurring: a fourth background this project's contrast fix was never checked against, on a badge (target word limit) distinct from the word-_count_ pills `DEF-01` covered. 3 instances on arrival, 4 once a governance card was added; found by run 3's fresh account, whose freshly-extracted questions render this badge in a shape no pre-seeded application happened to match. Detail below. | ✅ **FIXED 2026-08-09** (WJ's decision) — this one badge's text darkened to `#475569`; the shared `#64748B` token is unchanged elsewhere. See below                        |

### `DEF-01` in detail — the five contrast failures

| Foreground | Background | Ratio    | Size    | Where                                                          |
| ---------- | ---------- | -------- | ------- | -------------------------------------------------------------- |
| `#94A3B8`  | `#FDF9F5`  | **2.44** | 11–12px | Footer version line; step labels under the progress bar        |
| `#94A3B8`  | `#FFFFFF`  | **2.56** | 12–13px | Dashboard card metadata; Step 4 word counts                    |
| `#94A3B8`  | `#FFFBEB`  | **2.47** | 12px    | Step 4 word counts inside amber cards                          |
| `#D97706`  | `#FEF3C7`  | **2.86** | 12px    | Amber status pill, dashboard                                   |
| `#DC2626`  | `#FEF2F2`  | **4.41** | 12px    | Red status pill, dashboard — a near miss against the 4.5 floor |

All five are below the 4.5:1 floor AA requires for text under 18.66px.

### ✅ Resolved 2026-08-07 — WJ's decision

**`#94A3B8` is retired as a text colour.** All eleven text uses moved to **Mid slate `#64748B`**.

**There was no middle option, and that is what decided it.** Every candidate between the two tokens still fails — `#7C8AA0` 3.34, `#748196` 3.77, `#6B7A8F` 4.17 — and `#64748B` is the lightest slate that passes at all (4.54 / 4.76 / 4.59). **Making the text larger does not help either:** large text needs only 3:1 and `#94A3B8` scores 2.56, failing even that.

**Accepted cost:** the three-tier text hierarchy becomes two tiers for text; size and weight now carry the distinction. Recorded as a deliberate trade-off, not an oversight.

**`#94A3B8` survives for two exempt uses** — decorative icons marked `aria-hidden="true"` (Step 2's upload icon, the 404 icon) and the disabled-button background, since inactive controls are excluded from 1.4.3.

**Two findings this sweep had missed, both fixed in the same pass:**

| Where                  | Was                               | Now                     | Why AC-01 missed it                                             |
| ---------------------- | --------------------------------- | ----------------------- | --------------------------------------------------------------- |
| "Not started" pill     | `#64748B` on `#F1F5F9` — **4.34** | `#475569` — 6.92        | The dashboard swept showed no application with this status      |
| "Approved" pill        | `#16A34A` on `#DCFCE7` — **3.00** | `#166534` — 6.49        | Same — that status was not on screen                            |
| Word count, near limit | `#D97706` — **3.19** / **3.07**   | `#92400E` — 7.09 / 6.84 | The sweep never typed enough text to reach the near-limit state |

**So four of the five status pills were failing, not the two recorded above.** Worth stating plainly: a sweep sees only the states that happen to be rendered, and `DEF-01`'s original five rows were a floor, not a total. The two AC-01 did catch are fixed too — "In progress" `#D97706` → `#92400E` (6.37), "Ineligible" `#DC2626` → `#B91C1C` (5.91). "Exported" already passed at 5.36 and is unchanged.

Current pill values and their ratios are recorded inline in `components/dashboard-populated.tsx`'s `STATUS_CONFIG`, so a future palette change cannot quietly undo this.

**Verified live, not only by arithmetic.** A script measuring computed styles against computed backgrounds across `/` and `/register` reports **zero** small-text contrast failures on both. The authenticated pages could not be re-measured in the same session — they need a signed-in browser — so the pills and Step 4 counts rest on the recorded ratios until AC-01 run 2.

**Still open, and not part of `DEF-01`:** placeholder text. `design-requirements.md` specifies `#64748B`, but `components/ui/input.tsx` and `textarea.tsx` use `placeholder:text-muted-foreground`, resolving to `oklch(0.556 0 0)` — a neutral grey outside this palette. Never measured. Flagged for **AC-10**.

### `DEF-02` in detail — and both halves of how it was recorded were wrong

**✅ Resolved 2026-08-07, WJ's decision.** Extracted to a shared `components/ui/password-input.tsx`; the toggle is now **28×28**, comfortably over SC 2.5.8's 24×24 floor. The icon stays 16×16 and **does not move** — the button's offset was set so the icon's centre sits exactly where it always did, measured at 20px from the field's right edge before and after.

**It was eight instances, not six.** `reset-password-form.tsx` holds two that this sweep never saw, because reaching that page needs a real password-reset link from an email. Same shape as `DEF-01`: the recorded count was a floor, not a total.

**And it was four copies of the same markup, not "one component".** sign-in (1), `/register` (2), reset-password (2), `/account` (3). The original note said one component and six instances; both numbers came from the sweep rather than from the code.

**Why extraction rather than four one-line patches.** The toggle's markup and classes were byte-identical in all eight, varying only in `autoComplete` and the `aria-label` noun — so the extraction is two props, not a props-explosion. `GAP-25` had already found the password _policy_ copy-pasted into three of these same four files, with a live client/server divergence recorded in the PRD as the result. The parts most likely to drift here are the accessible name and the target size, both invisible until somebody tests with a keyboard or a screen reader — which is exactly how eight instances went unnoticed.

**Verified in the browser** on `/` and `/register`: every toggle measures 28×28, the icon 16×16, the button sits inside the field's 40px right padding without overlapping text, `type="button"` (so revealing a password cannot submit a half-filled form), and the reveal/re-mask round-trip works with the accessible name changing between "Show password" and "Hide password".

⚠️ **Two pages could not be verified in the browser and are not claimed as such.** `/account` needs a signed-in session and **`/reset-password` needs a live reset link from an email** — the same reason its two instances were missed in the first place. Both render the same component with the same classes, and 9 unit tests cover the size, the distinct accessible names and the prop pass-through, so the residual risk is low. It is not zero. **Confirm both by eye during AC-01 run 2.**

9 new tests, suite **224 → 233**. One is a scan asserting no inline `type={show… ? 'text' : 'password'}` remains anywhere in `components/`, so a ninth copy cannot quietly appear.

### `DEF-03` in detail — the Level A keyboard failure

- **Rule:** `scrollable-region-focusable` — "Element should have focusable content / Element should be focusable"
- **Element:** the `.max-h-[60vh]` scroll container in the guidelines dialog (`application-step4-draft.tsx`)
- **What actually happens:** a keyboard-only user can open the pop-up and can close it, but cannot scroll the text inside it. Everything below the fold is unreachable without a mouse.
- **Why it is worse than the count suggests:** the entire purpose of this feature is to show the user the funder's original wording. For a keyboard-only user it does not do that — it fails at the one thing it exists for, rather than degrading.
- **Likely fix:** `tabIndex={0}` on the scroll container, plus `role="region"` and an accessible name so a screen reader announces what has been focused. Not applied here — this run is recording findings, and the fix wants AC-05's focus-management pass alongside it.

### ✅ Resolved 2026-08-09 — GAP-49 built

**Fixed exactly as predicted.** `GuidelineTextPanel`'s scroll container (`application-step4-draft.tsx`) now carries `tabIndex={0}`, `role="region"`, and `aria-label={`Original guideline text — ${label}`}`, where `label` is the same citation label already shown in the dialog's title (e.g. "Original guideline text — 7. FINANCES OF YOUR GROUP.") — a screen reader now announces exactly what has been focused, not an anonymous group. `label` is threaded in from the existing `citationLabel(viewingCitation)` call already used for the dialog's own title, so no new lookup was needed.

**Verified live, not just by inspection.** Opened the real dialog (the same "7. FINANCES OF YOUR GROUP." citation used throughout this plan), confirmed via computed properties that Base UI's dialog auto-focuses the region on open (`tabIndex=0`, `scrollHeight` 7954 against `clientHeight` 496 — genuinely overflowing content), then drove real `ArrowDown` key presses and watched `scrollTop` move from 0 → 200. A keyboard-only user can now reach and read everything below the fold. A fresh axe sweep of the same page returns **0 violations** — `scrollable-region-focusable` no longer fires. The two remaining `incomplete` items are the already-understood `aria-hidden-focus` (verified Pass elsewhere in this plan) and `color-contrast` (flagged for AC-10) — nothing new.

**`AC-05` itself (the dedicated focus-management test case) has not been formally run** — this fix closes the specific `DEF-03`/`GAP-49` defect and was verified against its own failure mode, but the broader AC-05 checklist (focus trapping through the whole panel while scrolling to the highlighted quote, Escape/close-button focus return, `role="dialog"`/`aria-modal` on the outer dialog) is still a separate, not-yet-executed case. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new test added — this is a three-attribute JSX change with no new logic to unit test, verified instead by the live keyboard/scroll/axe check above.

### `DEF-04` in detail — the harness, not the product

- **Rule:** none — this is an `ADR-OPS-006` Decision-item defect (the automated half of Option C's testing regime), not a WCAG success criterion.
- **What actually happens:** `@axe-core/react` v4 is incompatible with React 19's read-only module exports. `components/axe-provider.tsx` wrapped its `axe(React, ReactDOM, 1000)` call in a `try/catch` to stop the incompatibility crashing the app, so the call threw silently on every page — a page carrying real WCAG violations produced an empty console, indistinguishable from a genuinely clean page.
- **Why it is worse than a missing nice-to-have:** it is the one thing `ADR-OPS-006`'s Decision explicitly requires — "`axe-core`... runs on every development build to surface violations in the browser" — and it silently did not, for as long as the project has targeted React 19. Every AC-01 sweep this plan records had to fall back to a manual DevTools snippet for exactly this reason.
- **Feeds `GAP-15`:** that gap's 2026-06-16 accepted deviation (waiving Lighthouse CI for v1) was partly justified on "`@axe-core/react` catches regressions during development" — half a justification that had been false since React 19.

### ✅ Resolved 2026-08-09 — GAP-54 built

**Fixed by dropping the incompatible half, not by patching it.** `@axe-core/react`'s own React-integration glue is what breaks on React 19 — the `axe-core` engine underneath it has no such dependency, and it is the exact same engine the manual DevTools snippet in this plan already drives via `window.axe.run()`. `components/axe-provider.tsx` now imports `axe-core` directly (removed as a dependency: `@axe-core/react`; added: `axe-core`, already present transitively at the same `4.12.1`) and runs it itself: once on mount, then again whenever a `MutationObserver` on `document.body` sees the DOM settle (a 1000ms debounce after the last mutation) — covering route changes, dialogs opening, and validation errors appearing, without patching React internals to detect re-renders. Violations are logged to the console in the same `PAGE` / `RESULT` / `PROBLEM` shape as this plan's manual snippet, so the output is immediately recognisable. `window.axe` is still set on load, so the manual snippet in Step 3 is entirely unaffected and keeps working exactly as documented.

**Verified live, not just by inspection.** A fresh `npm run dev`, sign-in page: the two violations `DEF-01`/`DEF-02` originally seeded there are themselves now fixed, so a clean initial load proved nothing on its own. A genuine `color-contrast` violation (`#94A3B8` on white, 12px) was injected into the live DOM via a script — no manual sweep triggered — and within the 1000ms debounce the console printed `axe: 1 problem(s) on /` followed by the violation detail, unprompted. Removing the injected element was itself confirmed as the trigger, not a page reload. `window.axe.version` also confirmed present and unchanged (`'4.12.1'`) throughout. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new automated test — this replaces a dev-only harness with no product-facing behaviour, verified live instead.

**Not yet done: a full AC-01 re-sweep.** This closes the specific defect (the harness now reports) and was verified against its own failure mode, but the 24-row route sweep itself has not been re-run with the fixed harness to confirm no regressions and reach a clean `0 problem(s)` result across the board — see the plan's Status line and AC-01's own note.

### `DEF-05` in detail — the "Answer approved" contrast failure

- **Rule:** `color-contrast` — "Elements must meet minimum color contrast ratio thresholds"
- **Element:** `.text-\[\#059669\].font-medium` — the "Answer approved — edit above to revise" line shown under every approved answer in `application-step4-draft.tsx`
- **Measured:** `#059669` on `#F0FDF4`, 13px → **3.6:1**, computed from the actual rendered `color`/`background-color` in the browser, not read off the source. Below the 4.5:1 AA floor for text under 18.66px.
- **Why run 1 could not have found this:** run 1's Step 4 sweeps (rows 20.1–20.7) never approved an answer, because doing so "changes application state" and was deliberately deferred to run 2 (see run 1's notes on rows 20.2/20.5). The text this finding is about only renders once at least one answer is approved — it was invisible on every page run 1 actually swept.
- **Scale:** 1 instance where only one answer was approved (GCM-07, row 20.5); 16 instances on an application where 16 of 17 answers were already approved (row 20.3) — the same "a sweep sees only the states rendered" lesson `DEF-01` and `DEF-02` already recorded for this project, showing up a third time.
- **Likely fix:** the same family of fix as `DEF-01` — `#059669` is a lighter green than the palette's other approved/success indicators (`#166534`, used for the dashboard "Approved" pill after `DEF-01`'s fix), so darkening this token to something in that range would likely clear the floor. Needs the same design sign-off `DEF-01` needed rather than a unilateral code change.

### ✅ Resolved 2026-08-09 — WJ's decision

**Text recoloured to `#065F46`.** Rather than introducing a third dark-green token, this reuses the shade already paired with a `#059669` decorative checkmark in two other places in the codebase — `charity-profile-form.tsx`'s "Details retrieved" success banner and `application-step3-summary.tsx`'s question-count line — both of which already darken the accompanying text while leaving the icon at `#059669` (exempt, `aria-hidden`). This fix follows that existing convention rather than inventing a new one.

**Measured 6.8:1 in the browser**, comfortably over the 4.5:1 AA floor — `rgb(6, 95, 70)` confirmed via computed style, and a live axe sweep of the same page that produced 16 `DEF-05` violations (row 20.3's application, `stony stratford town council`) now returns **0 violations, 0 incomplete**.

**The decorative `CheckCheck` icon stays `#059669`** — `aria-hidden="true"`, exempt from 1.4.3, and left alone to match how the other two icon-plus-text pairs in the codebase already handle this (lighter icon, darker text).

### `DEF-06` in detail — the empty-dashboard "Complete your profile" button

- **Rule:** `color-contrast` — "Elements must meet minimum color contrast ratio thresholds"
- **Element:** the "Complete your profile" link/button rendered on `/dashboard` only when `charity_profiles` has no row for the signed-in user
- **Measured:** white (`#ffffff`) text on `#D97706` background, 13px → **3.18:1**, computed from the actual rendered `color`/`background-color`. Below the 4.5:1 AA floor for text under 18.66px.
- **Why no earlier run found this:** every account used across runs 1 and 2 was long-lived with a complete charity profile, so this banner never rendered. Row 10 (`/dashboard`, empty) was itself recorded "not covered" in both prior runs for the same reason — a fresh account was needed to reach either state, and run 3's throwaway account reached both at once.
- **Related but distinct from `DEF-01`:** `DEF-01` already examined `#D97706` once, as the _foreground_ text colour of the dashboard's amber status pill (`#D97706` on `#FEF3C7`, fixed to `#92400E`). This is the same token used the other way round — as a _background_ under white text — on a different component, and was never checked.
- **Likely fix:** the same family as `DEF-01` and `DEF-05` — either darken the background (e.g. the `#B45309` already used for this button's own hover state measures noticeably better) or darken nothing and instead confirm whether white text was ever the intended pairing for this shade. Needs the same design sign-off `DEF-01` needed rather than a unilateral code change.

### ✅ Resolved 2026-08-09 — WJ's decision

**Background darkened to `#B45309`, the button's own existing hover shade, promoted to the base colour.** No new colour introduced — this is the same amber family already in the button's own `hover:` state. Computes to **5.0:1**, comfortably over the 4.5:1 floor. The hover state itself darkened further, to `#92400E`, so a hover state still exists once the base colour moved into its place. Applied identically in both places this button renders — `dashboard-populated.tsx` and `dashboard-empty.tsx` share the exact same markup.

**Verified live, not just by calculation.** A fresh throwaway account (created via the Supabase admin API, deleted after use) reaches the dashboard with an incomplete profile by default — no setup needed to render this button. Computed style confirmed `rgb(180, 83, 9)` (`#B45309`) background, white text; a live `axe-core` scan of the same page (`wcag2aa` ruleset) returned **zero `color-contrast` violations**. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new test — a two-value CSS change with no new logic, verified live instead.

### `DEF-07` in detail — the Step 4 word-limit badge

- **Rule:** `color-contrast` — "Elements must meet minimum color contrast ratio thresholds"
- **Element:** the small badge naming a question's word limit (e.g. "200 words"), rendered on every Step 4 question card
- **Measured:** `#64748B` on `#F1F5F9`, 11px → **4.34:1**, computed from the actual rendered styles. Below the 4.5:1 AA floor.
- **This is `DEF-01`'s own fix colour, on a background `DEF-01` never tested against.** `DEF-01`'s resolution moved 11 text uses to `#64748B` after confirming it passes on `#FDF9F5` (5.9), `#FFFFFF` (7.1) and `#FFFBEB` (6.7-ish, see `DEF-01`'s table) — three backgrounds, not four. `#F1F5F9` is a fourth, lighter background this project's palette also uses, and `#64748B` fails on it by the same margin (4.34) that made `#94A3B8` fail everywhere before `DEF-01`'s fix.
- **Why no earlier run found this:** the badge shows a question's word _limit_, not its current word _count_ — a different element from the word-count pills `DEF-01`'s table already covers ("Step 4 word counts", "amber near-limit cards"). Runs 1 and 2 used a pre-seeded, already-answered application; run 3's fresh account generated new questions from a fresh AI extraction, rendering this specific badge shape for the first time this project has swept it.
- **Scale:** 3 instances on arrival (one per extracted question), 4 once a manually-added governance card was in play; 0 new instances introduced by typing, approving an answer, or opening the governance panel — consistent with the "count is a floor, not a total" pattern `DEF-01`, `DEF-02` and `DEF-05` have each already shown this project.
- **Likely fix:** the same design decision `DEF-01` needed — either a darker text colour for this specific pairing (matching how `DEF-01` resolved the dashboard pills case-by-case) or a background change, needs WJ's sign-off rather than a unilateral code change.

### ✅ Resolved 2026-08-09 — WJ's decision

**Only this one badge's text darkened, to `#475569` — the shared `#64748B` token stays untouched everywhere else.** `#64748B` is used in 30+ other places in this codebase, on backgrounds `DEF-01` already confirmed it passes against; touching the token itself would have meant re-verifying all of them for no reason, when the actual defect is one badge on one background. `#475569` is not a new colour — it is already used elsewhere in the app for hover states. Computes to **6.9:1** on this badge's `#F1F5F9` background, comfortably over the 4.5:1 floor. Only `application-step4-draft.tsx`'s badge (line 963) changed.

**Verified live twice, not just by calculation.** First, on the fresh throwaway account's dashboard, the exact Tailwind classes (`bg-[#F1F5F9] ... text-[#475569]`) were injected into a live element and the computed style confirmed the classes compiled to `rgb(241, 245, 249)` / `rgb(71, 85, 105)` exactly as intended — proving the arbitrary-value utility exists in the compiled CSS, not just in source. A live `axe-core` scan of that element returned **zero `color-contrast` violations**. This is a lighter-weight check than reaching Step 4 through a full AI extraction (which this session judged disproportionate for a single hex-value change already confirmed by direct computation); it confirms the same underlying colour pairing the real badge renders, since Tailwind emits one shared utility class for a given arbitrary value regardless of where it is used. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new test — a one-value CSS change with no new logic.

---

## Observations recorded while writing this plan

Neither is a test result; both were found by reading the governing documents against the code, and both are recorded so the next session does not rediscover them.

1. **`ADR-OPS-006` Consequences row 5 (the P6.4 guideline viewer) is the one item this plan can actually close.** `ADR-TRACEABILITY.md` carries it as 🔵 "Built 2026-07-14, not yet manually tested" — the only ADR-OPS-006 consequence in that state. **AC-05 is its test.** When AC-05 passes, flip that row to ✅ and cite AC-05; until then it stays 🔵 no matter how much other accessibility work is done.
2. **`ADR-OPS-006`'s Rationale names "shadcn/ui + Radix UI" as the accessibility baseline.** The codebase uses `@base-ui/react` throughout `components/ui/`, with no `@radix-ui/*` dependency — the same stale reference corrected in `technology-stack.md` v1.6 and `PDR-UI-001` on 2026-07-13. It does not change the decision (both primitives provide a comparable baseline) and the ADR is Tier 3, so it is flagged rather than edited. It matters only because a reader verifying expected keyboard or ARIA behaviour might check the wrong library's documentation.

**A correction worth recording, because it is the failure mode this project keeps finding in itself.** The first draft of this plan asserted that the Lighthouse CI consequence was undischarged and that a P5.3 task should be added. It is not undischarged — `GAP-15` closed it as an accepted deviation on 2026-06-16 with WJ's decision recorded in two places. The claim came from checking the code (no `lighthouserc*`, no CI step — both true) without then checking the register that records why. Absence in the codebase is not evidence of an unmade decision.

---

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.15    | 2026-08-09 | Rapidglobe Ltd | **AC-01 marked Pass — WJ's explicit call that a fourth full re-sweep is not needed.** All seven logged defects are fixed (`DEF-01`\u2013`DEF-07`); the last two, `DEF-06` and `DEF-07`, were fixed the same day run 3 found them. Asked directly whether another 24-row sweep would add value, the answer given was no: `GAP-54`'s harness swap changed how every single row gets detected, so re-checking all of them was the only way to know nothing broke; these two fixes are isolated hex-value edits to two specific, non-shared elements (the dashboard button's own background/hover, one badge's text colour), each already verified live via `axe-core` at zero violations. No shared token or component logic was touched, so there is no mechanism by which an unrelated row could have regressed. AC-01's Result changed from Fail to Pass on this basis; Step 7's caption and the run 3 write-up's addendum both updated to match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.14    | 2026-08-09 | Rapidglobe Ltd | **`DEF-06`/`GAP-55` and `DEF-07`/`GAP-56` fixed the same day they were found, both WJ's decision.** `DEF-06`: the empty-dashboard "Complete your profile" button's background darkened from `#D97706` to `#B45309` — the button's own existing hover shade, promoted to its base colour (5.0:1, passes AA); hover darkened further to `#92400E`. `DEF-07`: only the Step 4 word-limit badge's text darkened, from `#64748B` to `#475569` (6.9:1) — the shared `#64748B` token, used in 30+ other places on backgrounds already confirmed safe, is unchanged. Both verified live via `axe-core`: a fresh throwaway account's dashboard scanned at zero `color-contrast` violations after the button fix; the badge's exact Tailwind classes were injected into a live page and scanned clean, confirming the compiled CSS matches the source change. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new tests — both are isolated hex-value changes with no new logic. **All seven of AC-01's logged defects are now fixed.** AC-01 is left at Fail rather than marked Pass, because a fourth full 24-row sweep confirming these two fixes introduced no regressions elsewhere has not been run this session — the same standard `GAP-54`'s run 3 itself was held to. `design-requirements.md` updated to match: the "Complete your profile" button is now a documented exception to the Accent button's default colours, and the contrast-audit table records both new pairings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 1.13    | 2026-08-09 | Rapidglobe Ltd | **Full 24-row regression re-sweep (run 3), requested by WJ after `GAP-54`.** Confirms the `@axe-core/react` → `axe-core` harness swap introduced zero regressions: all five previously-fixed defects (`DEF-01`–`DEF-05`) stayed fixed across every row, including brand-new states (a fresh unapproved answer, a second approved answer, a governance card added moments earlier) none of which had been swept before. Run from a fresh throwaway account (created and later deleted via the Supabase admin API, on WJ's explicit choice) rather than the long-lived seeded one, since the sandboxed session driving this run had no signed-in browser and the repo's local-only `supabase/seed.sql` account does not exist in the shared `grant-pathway-dev` project. **The re-sweep itself found two new defects, neither a `GAP-54` regression:** `DEF-06` — the empty-dashboard "Complete your profile" button, white on `#D97706`, 3.18:1, reachable for the first time because every prior account had a complete profile (raised as `GAP-55`); `DEF-07` — Step 4's word-limit badge, `DEF-01`'s own replacement colour `#64748B` failing on a fourth background (`#F1F5F9`) nobody had checked it against, 4.34:1 (raised as `GAP-56`). Both need a WJ design decision, same class as `DEF-01`. **Two rows not reproduced this run, flagged rather than assumed:** row 20.3 (offline "Not saved" bar) — this sandboxed session has no DevTools Network-throttle equivalent, and a scripted `fetch` rejection did not trigger the save path; row 20.6 (guidelines citation pop-up) — this run's plain-text application had no page markers to produce a citation, though already reverified clean elsewhere this session during the `DEF-03` fix work. **AC-01 stays ❌ Fail — for a new reason**: not unconfirmed regression risk any more, but two open, unfixed, pre-existing colour-contrast gaps.                                                                                                                                                                                                                                                                                                                                                                                                            |
| 1.12    | 2026-08-09 | Rapidglobe Ltd | **`DEF-04`/`GAP-54` fixed — the last of AC-01's five defects, and the only one that was a harness problem rather than a page problem.** `@axe-core/react`'s own React-integration glue is incompatible with React 19's read-only module exports and had been silently swallowing its own crash since the project moved to React 19, producing an empty console on every page regardless of real violations. Replaced, not patched: `components/axe-provider.tsx` now imports `axe-core` directly (the engine underneath `@axe-core/react`, with no such incompatibility, and the same engine this plan's manual snippet already drives via `window.axe.run()`), running it on mount and again whenever a `MutationObserver` on `document.body` sees the DOM settle. `window.axe` is still set on load, so the manual snippet is unaffected. Dependency swapped in `package.json`: `@axe-core/react` removed, `axe-core` added (same `4.12.1`, previously only transitive). **Verified live by injection, not by inspection:** the sign-in page's own seeded violations are already fixed by `DEF-01`/`DEF-02`, so a clean initial load proved nothing; a genuine `color-contrast` violation was injected into the live DOM via script, with no manual sweep triggered, and the console printed `axe: 1 problem(s)` and the violation detail unprompted within the debounce window. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new automated test — a dev-only harness swap with no product-facing behaviour, verified live instead. **AC-01's defect log is now fully closed, five for five** — but the plan itself stays ❌ Fail until a full re-sweep with the fixed harness confirms zero regressions. `GAP-15`'s accepted-deviation note ("`@axe-core/react` catches regressions during development") is restored to true rather than reopened.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.11    | 2026-08-09 | Rapidglobe Ltd | **`DEF-03`/`GAP-49` fixed — the run's only WCAG Level A failure, closed the same day as `DEF-05`.** The Step 4 guidelines-dialog scroll container (`GuidelineTextPanel` in `application-step4-draft.tsx`) now carries `tabIndex={0}`, `role="region"` and a citation-specific `aria-label` (e.g. "Original guideline text — 7. FINANCES OF YOUR GROUP."), threaded from the same `citationLabel()` call already used for the dialog's title. **Verified with real keyboard input, not just inspection:** opened the live dialog, confirmed Base UI auto-focuses the region on open, drove actual `ArrowDown` key presses and watched `scrollTop` move 0 → 200 — a keyboard-only user can now read everything below the fold. A fresh axe sweep of the same page returns 0 violations; `scrollable-region-focusable` no longer fires. **`AC-05` itself remains not yet formally run** — this closes the specific defect and its own failure mode, not the broader focus-management checklist (trap-through-scroll, close-button focus return, `role="dialog"`/`aria-modal`), which stays a separate case. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no new test — a three-attribute JSX change with no new logic, verified live instead. **AC-01 now stands at 4 of 5 defects fixed** — only `DEF-04` (the broken `@axe-core/react` harness, `GAP-15`) remains open.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 1.10    | 2026-08-09 | Rapidglobe Ltd | **`DEF-05` fixed, same day it was found (WJ's decision).** The "Answer approved" text recoloured from `#059669` to `#065F46` — reusing the darker green already paired with a `#059669` decorative checkmark in two other places in the codebase (`charity-profile-form.tsx`, `application-step3-summary.tsx`) rather than inventing a third dark-green token. Measures 6.8:1, comfortably over the 4.5:1 AA floor. Verified live: computed style confirms `rgb(6, 95, 70)`, and a fresh axe sweep of the same application that had shown 16 violations (row 20.3) now returns 0. The decorative icon stays `#059669`, exempt as `aria-hidden`, matching the existing convention. `type-check`, `lint --max-warnings 0` and all 266 tests pass; no test coverage added or needed (CSS-only change). **AC-01's defect count is now 3 fixed, 2 open** (`DEF-03`/`GAP-49`, `DEF-04`/`GAP-15`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 1.9     | 2026-08-09 | Rapidglobe Ltd | **AC-01 finished — run 2 swept every row that remained, and the case now has complete coverage for the first time.** Rows 10, 11c, 11d, 20.2, 20.3, 20.5, 21 (all three Step 5 states, including a real `.docx` export), 22, 23 and 24 all swept; row 18 corrected rather than swept, since it described a citation link that does not exist on Step 3 (the real pop-up is row 20.6, already covered). **One new defect: `DEF-05`**, a `color-contrast` failure on the green "Answer approved" text (`#059669` on `#F0FDF4`, measured 3.6:1 against a 4.5:1 floor) — invisible to run 1 because nothing had been approved when it ran; found at 1 instance and then 16 once an application with more approved answers was checked, the same "a sweep only sees rendered states" lesson `DEF-01`/`DEF-02` already taught this project. **The `aria-hidden-focus` `incomplete` from run 1 is resolved: Pass** — manually tabbed 8–16 times with each of the three dialogs (session-timeout, dashboard delete, Step 4 guidelines viewer) open and confirmed focus never escaped to `header`/`main`/`footer`. Row 24 (`app/global-error.tsx`) turned out to be structurally unsweepable by axe — `AxeProvider` lives inside the root layout this boundary replaces — so a manual check (contrast, heading, button state) stood in instead; both rows 23 and 24 were forced via a temporary `throw`, reverted immediately after. **One functional bug found and fixed along the way, not an accessibility finding:** `actions/charity.ts`'s by-name search was missing the 404 check its by-number sibling already had, so a genuine "not found" search misreported as "couldn't reach the Charity Commission" — confirmed against the live API directly, fixed by adding the missing check, verified live; raised as `GAP-53`. **A stale `.next` cache, not a code regression**, initially 404'd every application route on a fresh `npm run dev` — three dependency bumps behind the installed Next.js version; clearing it fixed it. Housekeeping closed: `GCM-07` deleted from the test account now that the rows needing it are banked. **AC-01 stays Fail** — `DEF-03` and `DEF-04` remain open from run 1, `DEF-05` is newly open — but the coverage caveat that has qualified every result since 2026-08-05 is gone. |
| 1.8     | 2026-08-07 | Rapidglobe Ltd | **Row 19 corrected in both tables — it was recorded wrongly in two different ways when it was banked earlier today.** The result (`**0**`) had been written **over the instruction text** in the case's step table, destroying what the row tells a tester to do, while the results table still read "**Blocked** — every application on the account has already passed the gate", which had stopped being true hours earlier. Anyone reading this plan would have found no instruction and a stale blocker. Both fixed: the instruction now says the row needs a brand-new application and that it is **free alongside any `GCM-` case**, all of which start fresh — which is the actual lesson, since the row was never hard and had sat blocked since 2026-08-05 purely for want of a state nothing had been arranging. The results row records the real sweep: **0 violations, 0 `incomplete`**. **Rows 20.2, 20.5 and 21 are now unblocked too** and their reasons are stale for the same reason — `GCM-07`'s application was taken through a typed answer, an approval, Step 5 and a Word export, so all three states exist on the account and no longer need arranging.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 1.7     | 2026-08-07 | Rapidglobe Ltd | **Row 19 swept and clean, and a bug in this plan's own sweep snippet fixed.** The Step 4 gate had been Blocked since 2026-08-05 because every application on the account had already passed it; GCM-06's live re-run needed a brand-new application, so the state existed for twenty minutes and the row was swept while it was there — **0 violations, 0 `incomplete`**. Worth recording as a scheduling lesson rather than a result: the row was never hard, it just needed a state nothing had been arranging. **The snippet bug is the more important entry.** The `document.getAnimations().forEach(a => a.finish())` guard added to the snippet earlier today — itself a fix, for axe measuring a control mid-fade — **throws** on any looping animation (`Cannot finish Animation with an infinite target effect end`), and one throw aborts the sweep before axe runs at all. It would have failed silently-ish on every page carrying a spinner or a pulse, which is most of the app's loading states. Now wrapped in try/catch with the reason recorded inline so it is not tidied away. **Found only because the snippet was run for real** — the same point `GAP-40` made about prompt tests on the same day.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 1.6     | 2026-08-07 | Rapidglobe Ltd | **`DEF-02` resolved (WJ's decision), and both halves of how this case recorded it were wrong.** The log said "one component, six instances". It was **eight instances across four files** — `reset-password-form.tsx` holds two the sweep never saw, because reaching that page needs a real reset link from an email — and **four copies of the same markup, not one component**. Neither correction changes the severity; both change the fix, because "patch one component" was never available. Extracted to `components/ui/password-input.tsx`: the eight copies were byte-identical apart from `autoComplete` and the `aria-label` noun, so the shared component takes two props. **Toggle is now 28×28, above the 24×24 floor, and the icon does not move** — it stays 16×16 with its centre measured at 20px from the field's right edge before and after. Verified in the browser on `/` and `/register`; **`/account` and `/reset-password` were not, and are not recorded as if they were** — one needs a session, the other a live reset email, which is the same barrier that hid its two instances. Both flagged for confirmation in run 2. 9 new tests including a scan that fails if an inline toggle reappears anywhere in `components/`. **This closes AC-01's defect list** — `DEF-01` and `DEF-02` fixed, `DEF-03` is `GAP-49`, `DEF-04` feeds `GAP-15` — but the case stays **Fail**: twelve of twenty-four rows are still unswept. Fixing defects does not create coverage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.5     | 2026-08-07 | Rapidglobe Ltd | **`DEF-01` resolved (WJ's decision), and resolving it found three failures this sweep had missed.** `#94A3B8` is retired as a text colour: all 11 text uses moved to `#64748B`. **The decision turned on there being no middle option** — every candidate between the two tokens still fails (3.34 / 3.77 / 4.17), `#64748B` is the lightest that passes at all, and enlarging the text does not help because `#94A3B8` scores 2.56 against the 3:1 large-text floor. Accepted cost recorded: the text hierarchy drops from three tiers to two. `#94A3B8` survives only for `aria-hidden` icons and the disabled-button background, both exempt from 1.4.3. **Four of the five status pills were failing, not the two this case recorded** — "Not started" (4.34) and "Approved" (3.00) never appeared, because no application on the dashboard held those statuses — and the Step 4 word count's near-limit state (3.19 / 3.07) never appeared either, because the sweep never typed enough text to trigger it. All fixed; ratios now 5.9–7.1 and recorded inline in `STATUS_CONFIG` so a palette change cannot undo them. **The transferable lesson is about this case's own method:** `DEF-01`'s five rows read like a complete list and were a floor — the real count was eight. AC-01's Step 4 already warns that axe only sees what is on screen; this is that warning coming true inside the results table. Verified live on `/` and `/register` by measuring computed styles (zero small-text failures); the authenticated pages rest on calculated ratios until run 2, stated rather than implied. **Placeholder text flagged for AC-10, not folded in** — it uses `placeholder:text-muted-foreground` (`oklch(0.556 0 0)`), a token outside this palette, and has never been measured.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 1.4     | 2026-08-07 | Rapidglobe Ltd | **A sixth wrong instruction in AC-01, and rows 11c/11d unblocked.** Row 11 told the tester to sweep the charity lookup "with the results list showing" and then "pick one from the list". **There is no list.** `lookupCharity()` takes the first match only and `charity-profile-form.tsx` fills the fields immediately — one action, not two. This was not a typo but a row describing a UI that has never existed, and it propagated into the run 1 results, where `11c` was recorded as "blocked — the lookup cannot return results to pick from". Row 11 rewritten around the three states that are real: populated after a successful lookup, "not found", and "couldn't reach the Charity Commission". The results table now shows `11b` as what it actually swept (the `unavailable` state), with `11c` (populated) and new `11d` (not found) as uncovered. **Both are now testable:** the real `CHARITY_COMMISSION_API_KEY` was added to `.env.local` today and verified against the live API (HTTP 200, real charity returned). Worth recording that **`11d` was unreachable for a non-obvious reason** — with no key the action returns `unavailable` before it ever calls the API, so the "not found" path could not be produced at all, not merely left untested.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 1.3     | 2026-08-07 | Rapidglobe Ltd | **AC-01's first run recorded — results banked two days after they were gathered, which is the point of this entry.** Rows 1–20 were swept on 2026-08-05 (WJ in Incognito for 1–9, Claude-in-Chrome for 10–21) and **nothing was written into the repo**: the results table was still empty checkboxes and the findings existed only in a session scratchpad under the OS temp directory. They survived by luck. Run 1 is now in Step 6 with per-row detail, and AC-01 is marked **Fail**. Four defects logged: `DEF-01` `color-contrast` — **one token, `#94A3B8`, failing on all five backgrounds it is used on**, not five separate bugs, and a design decision for WJ rather than a code fix; `DEF-02` `target-size` — **one component, six instances** of the 16×16 show/hide-password eye button; `DEF-03` **`scrollable-region-focusable`, the run's only WCAG Level A failure** — the Step 4 guidelines pop-up can be opened but not scrolled by keyboard, so the feature fails entirely for the user it most matters to, **raised as `GAP-49`**; `DEF-04` the broken `@axe-core/react` auto-reporting, which feeds `GAP-15`. One reading discarded as an automation artefact and recorded as such. **Five wrong instructions in the case itself corrected, all of which cost real time on day one:** `Ctrl` + `Enter` does not run a snippet once focus has left the editor (right-click → `Run` is now the only method given); the snippet's `copy()` call never fired, because Console Utilities do not exist inside a snippet (removed, replaced with right-click → `Copy`); row 9 sent the tester hunting for a row menu that does not exist, when the actions are plain `Delete` and `Re-open` buttons opening confirmation dialogs; row 17 asked for two sweeps of Step 2 when the upload area and paste box are visible together; row 5 needed a note that the sweep prints `/verify-email` for `/verify-email/confirm`. Two additions from the same run: **Incognito is now a prerequisite for AC-01** (extensions inject into password fields, causing a hydration error and phantom violations), and the snippet now calls `document.getAnimations().forEach(a => a.finish())` before measuring, so a control caught mid-fade can never again be reported as a contrast failure.                      |
| 1.2     | 2026-08-04 | Rapidglobe Ltd | **AC-01 rewritten again the same day, this time for a reader with no experience of browser developer tools** — WJ's request, and the correct call: v1.1 was precise but unusable, written in vocabulary ("DevTools", "snippet", "the DOM", "conditional UI", "violation nodes", "blur the field") that assumes the reader already knows the tool. It repeated the exact mistake the NVDA section of this plan exists to prevent, three cases later: **operating the tool, not the testing, is what blocks these passes.** AC-01 now opens the browser, presses `F12`, names the tabs, and explains what axe is for in one sentence before asking for anything. It warns about Chrome's "type `allow pasting`" refusal on first console paste — an unexplained dead end for a first-timer — and sidesteps it by having the one typed command be four words long. The saved snippet now also **copies its result to the clipboard**, so recording is a paste rather than a transcription. **A full worked example on the sign-in page comes before the route list**, with the exact expected output printed, so the tooling is proven on a known answer before twenty-three unknown ones — and `0 problem(s)` there is explicitly labelled a setup failure, not a clean page. Every "make this happen first" instruction rewritten in plain English; time estimate, resumability, and permission to record **Blocked** on the two error-screen rows added, since forcing those is developer work and a guess is worse than a gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 1.1     | 2026-08-04 | Rapidglobe Ltd | **AC-01 rewritten from three lines into an executable procedure, after a pre-flight check found the case unfalsifiable as written.** `@axe-core/react`'s auto-reporting does not work — `axe-provider.tsx` swallows a React 19 incompatibility in a silent `catch`, so the original instruction ("check the dev console, expect zero violations") would have returned a **false Pass**: `/` produced an empty console while carrying two genuine AA violations (`color-contrast` 2.44:1 on the version string; `target-size` 16×16 on the show-password button). Both are now recorded in AC-01 as a **reproduction check** — a run that does not surface them proves the tooling, not the product, is broken. AC-01 now has: a Step 0 availability gate; a saved DevTools snippet that drives `axe.run()` explicitly and survives navigation; a **24-row route table naming the conditional UI to render before each run**, since axe only sees the current DOM and a passively-visited route reports clean on UI that never appeared; seven separate Step 4 states including the M8 "Not saved" banner (never swept — it postdates HT-05); the method for forcing the session-timeout modal without waiting 55 minutes; and guidance on `incomplete` results and on the deliberate overlap with AC-10/AC-11. `app/global-error.tsx` added to the route table. The broken auto-reporting is itself an `ADR-OPS-006` Decision-item defect and is to be logged separately from the violations it hid. HT-05's 2026-07-25 "zero violations across eight routes" is now known to be **worthless rather than merely unevidenced**. Vercel/Supabase production confirmed pointing at `grant-pathway-dev` (WJ, 2026-08-04), closing that open question.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.0     | 2026-08-03 | Rapidglobe Ltd | Created as the seventh test layer under `DR-TEST-001` and P5.3's output artefact (WJ's decision, 2026-07-30; commissioned 2026-08-03). Covers all five of `ADR-OPS-006`'s manual pre-release items, the two guideline-viewer items in its Consequences, the five WCAG 2.2-specific criteria named in P5.3's 2026-07-30 note, and absorbs `help-and-tooltips-test-plan.md` HT-05 step 4, blocked since 2026-07-25. Includes an NVDA setup-and-operation section, written because NVDA operation — not the testing — was the actual blocker on 2026-07-25 and 2026-07-30. Two observations recorded: the undischarged Lighthouse CI consequence, and the ADR's stale Radix reference.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
