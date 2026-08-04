# Accessibility — Test Plan (WCAG 2.2 Level AA)

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A new route, modal, or interactive component is added; `ADR-OPS-006`'s manual list changes; or a WCAG success criterion in scope is re-targeted

**Version:** 1.2
**Date:** 2026-08-04
**Status:** Created, not yet executed. This is P5.3's output artefact and its definition of done. **AC-01 carries two known failures and a broken harness — read it from the top; it assumes no prior experience of browser developer tools.**
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

Separately, and confirmed 2026-08-04: the local dev build loads axe-core but its **auto-reporting does not work**, so AC-01 drives axe explicitly rather than watching the console. **Read AC-01 from its first line** — it is written step by step for someone who has never opened browser developer tools, and starting partway in will not work.

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
| Error         | `not-found` (404), the authenticated `error.tsx` boundary, `app/global-error.tsx` (added 2026-08-04)                                 |

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
  const text = lines.join('\n')
  console.log(text)
  if (typeof copy === 'function') {
    copy(text)
    console.log('%c^ copied to your clipboard — paste it straight into your notes', 'color:green;font-weight:bold')
  }
})()
```

6. Press **`Ctrl` + `S`** to save it. The filename stops showing an asterisk when saved.

**That is the setup done.** From now on, on any page, pressing **`Ctrl` + `Enter`** runs this and prints the result into the Console. It also copies the result to your clipboard, so you can paste it straight into your notes without retyping anything.

The snippet stays saved in Chrome. It survives page changes, reloads, and closing the browser.

> If `Ctrl` + `Enter` does nothing, click once on the snippet's name in the left-hand list first, then try again. You can also right-click the snippet name and choose **Run**.

---

### Step 3 — Do one page from start to finish

**Do this exact page first, before the others.** It proves your setup works, because we already know what it should say.

1. Go to `localhost:3000` — the sign-in page. Sign out first if you are signed in.
2. Click the **`Console`** tab so you can see the output.
3. Press **`Ctrl` + `Enter`**.

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

4. **Record it.** The result is already on your clipboard — paste it into the Notes area at the bottom of this case. Then fill in the row for page 1 in the results table in Step 6.

Now do the same thing on every remaining page.

---

### Step 4 — The important habit: make things appear before you run the sweep

**axe can only see what is on the screen at that moment.** If an error message, a pop-up, or a panel is not currently showing, axe does not know it exists and will not check it. A page you simply look at and sweep will come back cleaner than it really is.

So for most pages there is something you need to make happen first. The table in Step 5 tells you what, for each page. For example, "submit the empty form" means: click the main button without typing anything, so the red error messages appear — _then_ press `Ctrl` + `Enter`.

**To go to a page**, type the address into Chrome's address bar. Where the table says `/profile`, that means `localhost:3000/profile`.

---

### Step 5 — Every page to sweep

Work down this list. Do what the middle column says, **then** press `Ctrl` + `Enter`, then paste the result into your notes.

| #   | Go to                   | Make this happen first, then sweep                                                                                                                                                                                                                                          |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/` (signed out)        | ✅ Done in Step 3. Also click the eye icon to show the password, and sweep again.                                                                                                                                                                                           |
| 2   | `/register`             | Click "Create account" with every box empty, so all the red errors appear.                                                                                                                                                                                                  |
| 3   | `/forgot-password`      | Submit with the box empty → error appears. Sweep. Then enter a real address and submit → the confirmation message appears. Sweep again.                                                                                                                                     |
| 4   | `/verify-email`         | Sweep the page as it loads. Then use the "resend" form on it and sweep once the "sent" message appears.                                                                                                                                                                     |
| 5   | `/verify-email/confirm` | Go there directly, with nothing after it in the address. You will get an error state — sweep that. **Write in your notes that you tested the error state**, not the success one (which needs a fresh registration).                                                         |
| 6   | `/privacy`              | Scroll to the very bottom first, then sweep.                                                                                                                                                                                                                                |
| 7   | `/terms`                | Same.                                                                                                                                                                                                                                                                       |
| 8   | `/no-such-page`         | Any made-up address. This shows the "page not found" screen. Sweep it.                                                                                                                                                                                                      |
| 9   | `/dashboard`            | Signed in, with at least one application showing. Open any menu or action on an application row, then sweep.                                                                                                                                                                |
| 10  | `/dashboard` (empty)    | The version with no applications at all. If your test account has applications, **write "not covered — account has applications"** rather than reusing row 9.                                                                                                               |
| 11  | `/profile`              | Three sweeps. (a) Empty a required box and save → errors appear. (b) Type a charity name into the Charity Commission search and sweep with the results list showing. (c) Pick one from the list and sweep once it has filled in the details.                                |
| 12  | `/account`              | Submit the change-password form empty → errors appear. Hover or tab onto any tooltip so it shows, then sweep.                                                                                                                                                               |
| 13  | `/account/delete`       | ⚠️ **Just look at the page and sweep it. Do NOT click the confirm button.** That permanently deletes the account and everything in it.                                                                                                                                      |
| 14  | `/applications/new`     | Click continue with the boxes empty → errors appear.                                                                                                                                                                                                                        |
| 15  | An existing application | Open one from the dashboard. If it jumps straight to a step, note that it did.                                                                                                                                                                                              |
| 16  | Step 1                  | Continue with the boxes empty → errors appear.                                                                                                                                                                                                                              |
| 17  | Step 2                  | Sweep with the upload area showing, then switch to the paste box and sweep again.                                                                                                                                                                                           |
| 18  | Step 3                  | Sweep **while the summary is still generating** (the messages that change as it works), then again once it has finished. Then click a citation link to open the guidelines pop-up and sweep with it open. ⚠️ Regenerating a summary uses one of your 50 monthly AI actions. |
| 19  | Step 4 gate             | The "Before you begin writing" checklist, **before** you tick anything.                                                                                                                                                                                                     |
| 20  | Step 4 (main)           | The big one — see the seven sweeps listed below.                                                                                                                                                                                                                            |
| 21  | Step 5                  | Sweep before ticking the review box, then after. Approve, then trigger the Word export and sweep.                                                                                                                                                                           |
| 22  | Session-timeout pop-up  | See the instructions below.                                                                                                                                                                                                                                                 |
| 23  | Error screen            | See the instructions below. **Recording this as Blocked is acceptable.**                                                                                                                                                                                                    |
| 24  | Whole-site error screen | Same as 23. **Blocked is acceptable.**                                                                                                                                                                                                                                      |

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
5. The pop-up appears. Run the sweep by right-clicking the `axe-sweep` snippet and choosing **Run** (using the keyboard is fine too, but the pop-up is already open so nothing will be disturbed).
6. **Change that line back to `55 * 60 * 1000` and save.** Do not commit the shortened version.

#### Rows 23 and 24 in detail — the error screens

These are the screens shown when something goes badly wrong. Making them appear on purpose requires deliberately breaking something in the code, which is developer work rather than testing.

**If you would rather not**, write **Blocked — needs a developer to force the error state** in the results table and move on. That is a legitimate result and better than a guess. Flag it and it can be covered separately.

---

### Step 6 — Record everything

Fill in a row for every page, including the clean ones. **A page with no row is an untested page, not a passing one** — that ambiguity is exactly what went wrong with the previous attempt at this case.

| #   | Page | Problems found | Names of the problems | Notes |
| --- | ---- | -------------- | --------------------- | ----- |
|     |      |                |                       |       |

For anything you find, also add a row to the **Defect Log** at the bottom of this plan.

---

### Step 7 — Making sense of the results

- **"Needing a human check" is not a pass.** axe says this when it cannot decide by itself — most often about faint text sitting on top of an image or a gradient. Look at it yourself and write down your verdict. Do not treat it as clean.
- **The same problem on ten elements is usually one fix, not ten.** Record the number, but describe it as one problem with the shared component.
- **Some findings belong to other cases too.** Anything about sizes overlaps AC-11; anything about colour overlaps AC-10. **Write it down once**, in whichever case you found it, and mention the other. Do not log it twice.
- **Severity** — axe labels each as `minor`, `moderate`, `serious` or `critical`. Record what it says; you do not need to judge it yourself.

**Expected result:** no problems on any page, and every "needs a human check" item looked at and cleared.

**In practice this case cannot pass on its first run** — the two problems on the sign-in page are already known and real. A populated Defect Log is the expected outcome. The point of the exercise is finding out what else is there.

**Do not reuse the earlier result.** HT-05 swept eight pages on 2026-07-25 and reported no problems. That result is now known to be **worthless rather than merely unrecorded**: it relied on the automatic reporting that does not work, so "no problems" was simply an empty screen. Sweep everything again; carry nothing forward.

**Result:** ☐ Pass &nbsp;&nbsp; ☐ Fail &nbsp;&nbsp; ☐ Blocked

**Notes:**

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

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.2     | 2026-08-04 | Rapidglobe Ltd | **AC-01 rewritten again the same day, this time for a reader with no experience of browser developer tools** — WJ's request, and the correct call: v1.1 was precise but unusable, written in vocabulary ("DevTools", "snippet", "the DOM", "conditional UI", "violation nodes", "blur the field") that assumes the reader already knows the tool. It repeated the exact mistake the NVDA section of this plan exists to prevent, three cases later: **operating the tool, not the testing, is what blocks these passes.** AC-01 now opens the browser, presses `F12`, names the tabs, and explains what axe is for in one sentence before asking for anything. It warns about Chrome's "type `allow pasting`" refusal on first console paste — an unexplained dead end for a first-timer — and sidesteps it by having the one typed command be four words long. The saved snippet now also **copies its result to the clipboard**, so recording is a paste rather than a transcription. **A full worked example on the sign-in page comes before the route list**, with the exact expected output printed, so the tooling is proven on a known answer before twenty-three unknown ones — and `0 problem(s)` there is explicitly labelled a setup failure, not a clean page. Every "make this happen first" instruction rewritten in plain English; time estimate, resumability, and permission to record **Blocked** on the two error-screen rows added, since forcing those is developer work and a guess is worse than a gap.                                                                                                                                                                                                                   |
| 1.1     | 2026-08-04 | Rapidglobe Ltd | **AC-01 rewritten from three lines into an executable procedure, after a pre-flight check found the case unfalsifiable as written.** `@axe-core/react`'s auto-reporting does not work — `axe-provider.tsx` swallows a React 19 incompatibility in a silent `catch`, so the original instruction ("check the dev console, expect zero violations") would have returned a **false Pass**: `/` produced an empty console while carrying two genuine AA violations (`color-contrast` 2.44:1 on the version string; `target-size` 16×16 on the show-password button). Both are now recorded in AC-01 as a **reproduction check** — a run that does not surface them proves the tooling, not the product, is broken. AC-01 now has: a Step 0 availability gate; a saved DevTools snippet that drives `axe.run()` explicitly and survives navigation; a **24-row route table naming the conditional UI to render before each run**, since axe only sees the current DOM and a passively-visited route reports clean on UI that never appeared; seven separate Step 4 states including the M8 "Not saved" banner (never swept — it postdates HT-05); the method for forcing the session-timeout modal without waiting 55 minutes; and guidance on `incomplete` results and on the deliberate overlap with AC-10/AC-11. `app/global-error.tsx` added to the route table. The broken auto-reporting is itself an `ADR-OPS-006` Decision-item defect and is to be logged separately from the violations it hid. HT-05's 2026-07-25 "zero violations across eight routes" is now known to be **worthless rather than merely unevidenced**. Vercel/Supabase production confirmed pointing at `grant-pathway-dev` (WJ, 2026-08-04), closing that open question. |
| 1.0     | 2026-08-03 | Rapidglobe Ltd | Created as the seventh test layer under `DR-TEST-001` and P5.3's output artefact (WJ's decision, 2026-07-30; commissioned 2026-08-03). Covers all five of `ADR-OPS-006`'s manual pre-release items, the two guideline-viewer items in its Consequences, the five WCAG 2.2-specific criteria named in P5.3's 2026-07-30 note, and absorbs `help-and-tooltips-test-plan.md` HT-05 step 4, blocked since 2026-07-25. Includes an NVDA setup-and-operation section, written because NVDA operation — not the testing — was the actual blocker on 2026-07-25 and 2026-07-30. Two observations recorded: the undischarged Lighthouse CI consequence, and the ADR's stale Radix reference.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
