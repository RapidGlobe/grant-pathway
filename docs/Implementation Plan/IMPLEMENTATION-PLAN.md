# Grant Pathway v1 — Implementation Plan

**Version:** 2.7
**Date:** 2026-05-07
**Last updated:** 2026-06-16
**Status:** Ready for development
**Owner:** Rapidglobe Ltd

---

## Overview

This plan follows a three-phase build strategy:

1. **Option E — Static UI Shell:** Build every screen as a static React component with mock data. Validate the full design before touching the backend.
2. **Option D — Risk-First Spikes:** Prove the three highest-risk technical integrations (Amazon Bedrock, Supabase Storage bypass, document pipeline) before committing to production code.
3. **Option B — Vertical Slices:** Wire up each feature slice end-to-end, in the order a user would encounter them.

**Target launch date:** 31 July 2026
**Today:** 2026-05-07
**Available weeks:** ~12

---

## Document Discrepancies Resolved

During planning, conflicts were found between specification documents. These are resolved here; all plan tasks follow the resolution.

| #   | Conflict                                                          | Documents                                                                                                                                                                                                                                                                                                  | Resolution                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Route paths — singular vs plural                                  | `technical-design.md` uses `/application/[id]`; screen requirements and IA use `/applications/[id]`                                                                                                                                                                                                        | **Use `/applications/[id]`** — the PRD explicitly states it takes precedence over source documents, and the screen requirements are a direct PRD input                                               |
| D2  | Landing page — combined vs separate                               | `technical-design.md` defines `/` (landing) and `/sign-in` as separate routes; screen requirements define `/` as Sign In / Landing combined                                                                                                                                                                | **Use `/` as Sign In / Landing combined** — screen requirements take precedence                                                                                                                      |
| D3  | Password reset — one route vs two                                 | `technical-design.md` defines `/forgot-password` and `/reset-password` as separate routes; screen requirements define `/forgot-password` with two states on one URL                                                                                                                                        | **Use `/forgot-password` with two states** — screen requirements take precedence                                                                                                                     |
| D4  | Step routing — URL vs in-page states                              | IA (2026-04-16) describes steps as "states within a single page"; ADR-ARCH-004 (2026-04-21) specifies URL-based step routing                                                                                                                                                                               | **Use URL-based step routing** — ADR-ARCH-004 is the later decision and the architectural specification                                                                                              |
| D5  | Charity profile fields                                            | BRD FR-12 includes `annual income band`, `registered address`, `charitable objects`, and `main activities` as separate fields; screen requirements define three fields only: "What does your charity do?", "Who does your charity help?", "Where do you work?"                                             | **Follow screen requirements** — these are the more recent and detailed specifications. `annual income band` and `registered address` are removed; charitable objects and main activities are merged |
| D6  | Application status values                                         | `technical-design.md` uses `draft, in_progress, complete`; screen requirements use `not_started, in_progress, approved, exported`                                                                                                                                                                          | **Use `not_started, in_progress, approved, exported`** — screen requirements take precedence                                                                                                         |
| D7  | Step 4/5 approval model                                           | BRD FR-32/FR-33 and `technical-design.md` describe per-question approval with three review prompts in Step 4; screen requirements describe editable text areas in Step 4 with a single "Approve my application" button at Step 5                                                                           | **Use Step 5 batch approval** — screen requirements take precedence as a direct PRD input                                                                                                            |
| D8  | Status transition timing                                          | Plan set `in_progress` when user clicks Continue on Step 1; `application-status-model.md` states `not_started → in_progress` occurs when user **saves funder guidelines on Step 2**                                                                                                                        | **Set `in_progress` on Step 2 Continue** — application status model is the authoritative source for transition rules                                                                                 |
| D9  | AI generation trigger (Steps 3 and 4)                             | Plan implied user initiates AI generation; `acceptance-criteria.md` AC-FR-24-01 and AC-FR-28-01 state generation begins **automatically on arriving at the step** (Regenerate is the secondary action)                                                                                                     | **Auto-generate on page load** — acceptance criteria take precedence                                                                                                                                 |
| D10 | Three review prompts location                                     | Plan omitted the three plain-language review prompts from Step 5; `acceptance-criteria.md` AC-FR-32-01 states they appear on Step 5 (Approve & Export), not Step 4                                                                                                                                         | **Show three review prompts on Step 5** — acceptance criteria take precedence                                                                                                                        |
| D11 | Inactivity tracking field                                         | Plan added `last_login_at` to `user_profiles` and proposed updating it in middleware; `data-model.md` section 6 states inactivity deletion uses `auth.users.last_sign_in_at`, managed automatically by Supabase Auth                                                                                       | **Use `auth.users.last_sign_in_at`** — no custom column or middleware update required                                                                                                                |
| D12 | `application_answers.answer_source` missing                       | Plan schema omits the `answer_source` enum field (`ai_generated`, `user_edited`, `user_written`) defined in `data-model.md`                                                                                                                                                                                | **Add `answer_source` to schema and Slice 6 answer handling**                                                                                                                                        |
| D13 | Re-opening must reset answer approval                             | Plan's re-open actions only revert `applications.status`; `data-model.md` states all `application_answers.is_approved` must also be reset to `false`                                                                                                                                                       | **Reset `is_approved = false` on all answers when re-opening**                                                                                                                                       |
| D14 | `charity_profiles.lookup_source` missing                          | `data-model.md` defines `lookup_source` (`charity_commission` or `manual`) on `charity_profiles`; not in plan schema or Slice 1                                                                                                                                                                            | **Add `lookup_source` to schema and Slice 1 save action**                                                                                                                                            |
| D15 | Cross-browser testing absent                                      | Phase 5 pre-launch testing covers accessibility only; `non-functional-requirements.md` NFR-05 requires testing across Chrome, Edge, Firefox, Safari (desktop) and Chrome Android, Safari iOS                                                                                                               | **Add cross-browser testing to Phase 5**                                                                                                                                                             |
| D16 | AI performance targets missing                                    | `non-functional-requirements.md` NFR-01 specifies ≤30s for summary and ≤60s for draft generation; not referenced anywhere in the plan                                                                                                                                                                      | **Add AI timing targets to Phase 2 spike criteria and Phase 5 testing**                                                                                                                              |
| D17 | Word export document structure incomplete                         | Plan has vague "AI disclaimer and footer"; `PDR-DH-003` defines exact structure: title format, specific disclaimer wording including user's full name, Calibri 11pt/14pt font (not Inter), A4 page, 2.54cm margins, no branding in body                                                                    | **Use PDR-DH-003 exact spec for Word export**                                                                                                                                                        |
| D18 | Plain text export priority incorrect                              | Plan marks plain text export FR-38 as "Should Have"; `PDR-DH-003` explicitly marks it "Could Have"                                                                                                                                                                                                         | **Change FR-38 to Could Have throughout**                                                                                                                                                            |
| D19 | AWS Bedrock spend cap missing                                     | `PDR-AI-005` requires a monthly spend cap configured in the AWS/Bedrock console as a backstop; not in any plan task                                                                                                                                                                                        | **Add AWS Bedrock spend cap to Phase 3**                                                                                                                                                             |
| D20 | Hard text truncation contradicts context window decision          | Plan hard-truncates extracted guidelines text at 150,000 characters in Slice 4; `PDR-AI-004` decides on a soft warning only — "the user may proceed with the full document"; the 2026-05-07 review note confirms claude-sonnet-4-6's 1M token context window means truncation is not a technical necessity | **Remove hard truncation; retain soft warning only per PDR-AI-004**                                                                                                                                  |
| D21 | Charity Commission API unavailable state missing Try again button | Plan shows manual entry fallback only; `PDR-UI-006` defines two options on API failure: **Try again** button plus **Enter details manually** fallback                                                                                                                                                      | **Add Try again button to Charity Commission unavailable state**                                                                                                                                     |
| D22 | Persistent AI failure state missing                               | Plan has one AI error state (Try again button); `PDR-UI-006` defines a second state for when the retry also fails: _"If this keeps happening, please try again later. Your work has been saved."_                                                                                                          | **Add persistent failure state to Steps 3 and 4**                                                                                                                                                    |
| D23 | Large-document warning threshold unit conflict                    | `ADR-AI-007` defines the threshold as 150,000 characters; `PDR-AI-004` defines it as 100,000 tokens (≈400,000 characters). These measure completely different sizes.                                                                                                                                       | **Follow PDR-AI-004 (100,000 tokens)** — PRD decisions take precedence over ADRs                                                                                                                     |
| D24 | Responsive strategy conflict                                      | Plan Phase 1 design requirements state "Minimum screen width: 320px — fully responsive"; `ADR-ARCH-005` decides desktop-first with a 1024px optimised viewport                                                                                                                                             | **Reconcile**: desktop-first design per ADR-ARCH-005; must be usable on mobile browsers per C16 and NFR-05 (minimum 320px)                                                                           |
| D25 | Word export font conflict                                         | `ADR-EXPORT-002` specifies Inter font and teal headings; `PDR-DH-003` (D17 resolution) specifies Calibri 11pt/14pt, no branding                                                                                                                                                                            | **Follow PDR-DH-003** — PRD decisions take precedence over ADRs; ADR-EXPORT-002 styling section is superseded                                                                                        |
| D26 | Protected routes list missing from middleware task                | `ADR-SEC-001` still references singular `/application/:path*`; plan P3.4 gives no explicit protected route list, so a developer would fall back to the ADR and get the wrong path                                                                                                                          | **Add explicit protected routes list to P3.4** using resolved plural paths                                                                                                                           |
| D27 | Inactivity deletion deferred by ADRs but included as v1           | `ADR-DATA-003` and `ADR-OPS-004` explicitly defer automated inactivity deletion to post-v1; plan Slice 8 includes it as v1 work (S8.3) with no documented authority for the promotion                                                                                                                      | **Document authority**: `email-notifications.md` and `acceptance-criteria.md` (PRD inputs) establish inactivity deletion as a v1 requirement; PRD inputs take precedence over ADRs                   |
| D28 | AI usage count display missing from dashboard                     | `ADR-AI-008` states as a consequence: "The dashboard should show the user their current month's usage (e.g. '12 of 20 AI requests used this month')"; missing from P1.6 static shell and Slice 2                                                                                                           | **Add AI usage count display to dashboard**                                                                                                                                                          |
| D29 | ADR-SEC-006 env vars list incomplete                              | `ADR-SEC-006` lists only 6 variables; plan P3.2 correctly adds `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`, `SENTRY_DSN`; the ADR is silent on these                                                                                                                               | **Plan is correct**; note in P3.2 that `.env.example` is the authoritative list, not ADR-SEC-006                                                                                                     |
| D30 | `user_profiles` schema differs from ADR-DATA-001                  | `ADR-DATA-001` defines `user_profiles` with `id`, `email`, `full_name`; plan P3.1 (per `data-model.md`) uses `id`, `user_id`, `first_name`, `last_name`, `feedback_consent`                                                                                                                                | **Follow `data-model.md`** — dedicated data model document is the authoritative schema source; ADR-DATA-001 is superseded                                                                            |

---

## Route Reference (Authoritative)

Resolved from screen requirements and ADR-ARCH-004:

| URL                  | Page                               | Auth                 |
| -------------------- | ---------------------------------- | -------------------- |
| `/`                  | Sign In / Landing                  | Unauthenticated only |
| `/register`          | Register                           | Unauthenticated only |
| `/verify-email`      | Verify Email                       | Unauthenticated only |
| `/forgot-password`   | Forgot Password (two states)       | Unauthenticated only |
| `/dashboard`         | My Applications                    | Authenticated only   |
| `/applications/new`  | New Application (Step 1)           | Authenticated only   |
| `/applications/[id]` | Application (Steps 1–5, URL-based) | Authenticated only   |
| `/profile`           | Charity Profile                    | Authenticated only   |
| `/account`           | Account Settings                   | Authenticated only   |
| `/account/delete`    | Account Deletion Confirmation      | Authenticated only   |

**Step URLs within `/applications/[id]`:**

| URL                         | Step                      |
| --------------------------- | ------------------------- |
| `/applications/[id]`        | Redirects to current step |
| `/applications/[id]/step/1` | Application Details       |
| `/applications/[id]/step/2` | Upload Funder Guidelines  |
| `/applications/[id]/step/3` | AI Summary                |
| `/applications/[id]/step/4` | Draft Answers             |
| `/applications/[id]/step/5` | Approve & Export          |

---

## Phase 0 — Project Bootstrap

**Goal:** Working Next.js project deployed to Vercel with the correct structure, design tokens, and empty route shells.
**Estimated time:** 1–2 days

### P0.1 — Accounts and Prerequisites

Before writing any code, confirm all external accounts are ready:

| Item           | Action                                                             |
| -------------- | ------------------------------------------------------------------ |
| GitHub         | Create account; create public repository `grant-pathway`           |
| Vercel         | Create account; link to GitHub repository                          |
| Node.js 20+    | Verify installed (`node --version`)                                |
| Docker Desktop | Install with WSL2 backend (required for local Supabase in Phase 3) |
| Supabase CLI   | Install globally (`npm install -g supabase`)                       |

AWS, Supabase project, Upstash, Resend, and Sentry accounts are set up in Phase 3. They are not needed for the static UI shell.

### P0.2 — Scaffold the Project

```bash
npx create-next-app@latest grant-pathway \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

### P0.3 — Install Core Dependencies

```bash
# shadcn/ui initialisation (sets up components/ui/, lib/utils.ts, tailwind integration)
npx shadcn@latest init

# shadcn/ui components needed across the UI shell
npx shadcn@latest add button input label form card badge dialog \
  dropdown-menu separator alert progress textarea select toast tooltip

# Icons (included with shadcn/ui but confirm present)
npm install lucide-react

# Validation (needed from Phase 3 onwards, install now for consistency)
npm install zod
```

### P0.4 — Configure Design Tokens

Update `tailwind.config.ts` to add the Grant Pathway colour palette (BRD Section 12):

```typescript
colors: {
  teal: {
    DEFAULT: '#0D6E6E',
    light: '#E6F4F4',
  },
  amber: { DEFAULT: '#D97706' },
  success: { DEFAULT: '#16A34A' },
  'neutral-dark': '#1E293B',
  'neutral-light': '#F8FAFC',
}
```

Configure Inter font via `next/font/google` in the root layout.

### P0.5 — Project Structure

Create the directory structure from `technical-design.md` Section 4, adapted for the resolved route paths:

```
app/
  (public)/
    page.tsx                    # Sign In / Landing (/)
    register/page.tsx
    verify-email/page.tsx
    forgot-password/page.tsx
  (authenticated)/
    layout.tsx                  # Shared nav + footer
    dashboard/page.tsx
    applications/
      new/page.tsx
      [id]/
        page.tsx                # Redirects to current step
        step/
          1/page.tsx
          2/page.tsx
          3/page.tsx
          4/page.tsx
          5/page.tsx
    profile/page.tsx
    account/
      page.tsx
      delete/page.tsx
  api/                          # Empty — populated in Phase 4
actions/                        # Empty — populated in Phase 4
components/
  ui/                           # shadcn/ui components
lib/
  supabase/
    server.ts                   # Stub — populated in Phase 3
    client.ts                   # Stub — populated in Phase 3
    middleware.ts               # Stub — populated in Phase 3
middleware.ts                   # Pass-through stub in Phase 1
```

### P0.6 — Stub Middleware and Deploy

Create a pass-through `middleware.ts` so Vercel preview deployments work without auth:

```typescript
// middleware.ts — stub for Phase 1 (replaced in Phase 3)
export {} from 'next/server'
```

Push to GitHub. Confirm Vercel auto-deploys and the preview URL is accessible.

---

## Phase 1 — Static UI Shell

**Goal:** Every screen in the app is visually complete, with realistic mock data, and viewable at a Vercel preview URL.
**Estimated time:** 8–10 days
**No backend, no auth, no API calls.** Pages load instantly from hardcoded data.

### Design requirements for every screen

- Colour palette: deep teal `#0D6E6E` (primary), soft teal `#E6F4F4` (light), amber `#D97706` (accent), muted green `#16A34A` (success), slate `#1E293B` (neutral dark), off-white `#F8FAFC` (neutral light)
- Typography: Inter — Bold 700 (headings, min 20px), Semi-bold 600 (sub-headings, min 16px), Regular 400 (body, min 16px), Medium 500 (labels/captions, min 14px)
- Desktop-first design (ADR-ARCH-005): optimised for 1024px and above; must remain usable on mobile browsers per C16 and NFR-05 (minimum 320px)
- All interactive components use shadcn/ui (inherits Radix UI ARIA and keyboard handling)
- Tone: plain English, encouraging, honest, concise (BRD Section 12)
- Page titles as specified in screen requirements

### P1.1 — Global Components

Build these before any pages — they appear on every screen.

**Unauthenticated navigation bar:**

- Grant Pathway logo (left, no link — stays on current page)
- Sign in link → `/`
- Register link → `/register`

**Authenticated navigation bar:**

- Grant Pathway logo (left, links to `/dashboard`)
- My Applications → `/dashboard`
- Charity Profile → `/profile`
- Account dropdown (right, shows user's first name or email):
  - Account Settings → `/account`
  - Sign Out (no-op in static shell)

**Global footer (all screens):**

- Tagline: "Your free grant writing companion for UK charities"
- Links: Privacy Policy | Terms of Service
- © RapidGlobe Ltd [year]

**Session timeout modal (Client Component):**

- Appears at 55-minute mark
- "You've been inactive for a while. Stay signed in?" with "Stay signed in" button
- On dismiss or ignore: "You've been signed out due to inactivity." + redirect to `/`
- Static shell: mock with a button to trigger the modal

### P1.2 — Sign In / Landing (`/`)

- Tagline prominent below logo: "Your free grant writing companion for UK charities"
- Email field (required), password field (required, show/hide toggle)
- Forgot password link (right-aligned, below password field) → `/forgot-password`
- Sign in button (teal, full width)
- "New to Grant Pathway? Register for free" → `/register`
- Error states (static mock toggles):
  - Incorrect email or password: _"Your email address or password is incorrect. Please try again."_
  - Email not yet verified: _"Please verify your email address before signing in."_ with Resend verification email link
  - Account not found: same message as incorrect password (do not reveal whether the email is registered)
- No marketing content, hero section, or feature list
- Page title: "Sign in — Grant Pathway"

### P1.3 — Register (`/register`)

- Heading: "Create your free account"
- Fields: First name (required), Last name (required), Email (required), Password (required, show/hide toggle), Password confirmation (required, show/hide toggle)
- Terms acceptance checkbox (required): "I have read and agree to the [Terms of Service] and [Privacy Policy]" — both links open in a new tab
- Feedback opt-in checkbox (optional): "I'm happy to be contacted occasionally to share feedback about Grant Pathway"
- Create account button (teal, full width)
- "Already have an account? Sign in" → `/`
- Inline validation error states (mock under each field)
- Page title: "Register — Grant Pathway"

### P1.4 — Verify Email (`/verify-email`)

Three states, shown as a toggle in the static shell:

**State 1 — Awaiting Verification:**

- Heading: "Check your email"
- Message: "We've sent a verification link to [email address]. Click the link in the email to activate your account."
- "Resend verification email" button (secondary)
- "Wrong email address? [Sign in with a different account]" → `/`

**State 2 — Link Clicked (valid):**

- Heading: "Email verified"
- Message: "Your account is now active. Let's get started."
- "Go to my dashboard" button (primary, → `/dashboard`)

**State 3 — Link Expired or Invalid:**

- Heading: "This link has expired"
- Message: "Your verification link is no longer valid. Request a new one below."
- "Send a new verification email" button (primary)

Page title: "Verify your email — Grant Pathway"

### P1.5 — Forgot Password (`/forgot-password`)

Two states, shown as a toggle in the static shell:

**State 1 — Reset Request Form:**

- Heading: "Reset your password"
- Instruction: "Enter the email address for your account and we'll send you a reset link."
- Email field (required)
- "Send reset link" button (teal, full width)
- "Remembered your password? [Sign in]" → `/`
- Post-submission confirmation (mock): _"If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."_ — shown regardless of whether email exists; no further action available on the confirmation

**State 2 — Reset Password Form:**

- Heading: "Choose a new password"
- New password (required, show/hide toggle), Confirm new password (required, show/hide toggle)
- "Save new password" button (teal, full width)
- Success state (mock toggle): _"Your password has been updated."_ + **Sign in** button → `/` (stays on page, does not auto-redirect)
- Expired link state (mock toggle): _"This reset link has expired. Please request a new one."_ + **Request a new link** button → State 1

Page title: "Reset your password — Grant Pathway"

### P1.6 — Dashboard (`/dashboard`)

Two states, toggled in the static shell:

**Empty state (no applications):**

- Heading: "Welcome to Grant Pathway, [first name]"
- Charity profile incomplete banner (shown whenever profile is incomplete or partially completed):
  _"Before you start, add your charity details — we'll use these to personalise your applications."_
  **Set up charity profile** button → `/profile`
- Empty state message: "You don't have any applications yet."
- **Start your first application** button (teal):
  - Disabled when profile incomplete, with tooltip: "Please set up your charity profile first"
  - Enabled when profile complete
- Three-step explainer with icons: "1. Add funder guidelines" → "2. Get an AI summary" → "3. Generate your draft"

**Populated state (one or more applications):**

- Heading: "My Applications"
- Summary strip: "[n] applications — [n] not started · [n] in progress · [n] approved · [n] exported" (all four counts shown even when zero)
- AI usage indicator (per ADR-AI-008): "[n] of 50 AI requests used this month" — shown on the dashboard so users can track their allowance before starting a new application
- **+ New Application** button (teal, top right)
- Charity profile incomplete banner (shown if profile is incomplete — same as above)
- Application cards sorted by most recently updated first

**Application card contents:**

- Funder name — bold, prominent, top of card
- Grant name — below funder name
- Status pill (colour-coded):
  - Not started — slate
  - In progress — amber
  - Approved — green
  - Exported — teal
- "Last updated [DD Month YYYY]" (e.g. "Last updated 14 April 2026")
- **Continue** button (for Not started and In progress); **View** button (for Approved and Exported)
- **Delete** — red text link. Triggers a status-specific confirmation modal (mock toggle for each variant):
  - Not started / In progress: _"Are you sure you want to delete this application? This cannot be undone."_
  - Approved: _"Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."_
  - Exported: _"Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."_
    Cancel + Delete (destructive red) buttons

Page title: "My Applications — Grant Pathway"

### P1.7 — Charity Profile (`/profile`)

Two states toggled in the static shell:

**Setup state (first time):**

- Heading: "Set up your charity profile"
- Charity Commission lookup: search field (by name or number) + **Look up charity** button
- Mock lookup result: pre-populates charity name and registration number; note: "Details retrieved from the Charity Commission register." User may edit if needed
- Mock no-match: "We couldn't find that charity. Please enter your details manually."
- Mock API unavailable: "We couldn't reach the Charity Commission right now. Please try again in a few moments, or enter your charity details manually." — **Try again** button + **Enter details manually** fallback link

Fields (per screen requirements — no registered address, no mission statement, no income band):

| Field label                 | Type       | Required |
| --------------------------- | ---------- | -------- |
| Charity name                | Text input | Yes      |
| Charity registration number | Text input | No       |
| What does your charity do?  | Textarea   | Yes      |
| Who does your charity help? | Textarea   | Yes      |
| Where do you work?          | Text input | Yes      |

- **Save profile** button (teal, full width)
- Success message: "Your charity profile has been saved. You're ready to start your first application." + **Go to my dashboard** button → `/dashboard`

**Edit state (returning):**

- Heading: "Your charity profile"
- Same fields pre-filled with mock data
- **Save changes** button
- Success message: "Your changes have been saved." (stays on `/profile`)

Page title: "Charity Profile — Grant Pathway"

### P1.8 — Application Step 1: Application Details

URLs: `/applications/new` and `/applications/[id]/step/1`

- Step indicator at top (all 5 steps visible; Step 1 highlighted)
- Heading: "Start a new application"
- Funder name field (required). Label: "Who is offering this grant?" Placeholder: "e.g. National Lottery Community Fund"
- Grant name field (required). Label: "What is the grant called?" Placeholder: "e.g. Awards for All England"
- Validation errors: "Please enter the funder's name" / "Please enter the grant name"
- **Continue** button (teal) — creates application record
- **Cancel** link — returns to `/dashboard` without saving
- Page title: "[Grant name] — [Funder name] — Grant Pathway"

### P1.9 — Application Step 2: Upload Funder Guidelines

URL: `/applications/[id]/step/2`

- Step indicator (Step 2 highlighted)
- Heading: "Add the funder's guidelines"
- Instruction: "Upload the funder's guidelines document, or paste the text directly below."
- File upload area: drag and drop or click to browse; accepts PDF and .docx only; max 10MB; upload progress bar (mock animation)
- Paste text area: label "Or paste the guidelines text here" (large textarea)
- **Large document warning** (mock toggle — shown when document exceeds 100,000 tokens):
  _"Your guidelines document is quite long. For the best results, we recommend uploading only the core sections — such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."_
- File upload error states (mock toggles):
  - Wrong format: _"We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."_
  - File too large: _"Your file is over 10MB. Please upload a smaller file or paste the text directly."_
  - Scanned PDF: _"We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead."_
- Back link + **Continue** button

### P1.10 — Application Step 3: AI Summary

URL: `/applications/[id]/step/3`

Two states toggled in the static shell:

**Loading state (starts automatically on arriving at Step 3 — no user action required to trigger generation):**

- Step indicator (Step 3 highlighted)
- Teal progress bar with staged messages: "Reading your funder guidelines…" → "Almost there…"

**Content state:**

- Step indicator (Step 3 highlighted)
- Heading: "Your funder guidelines — summary"
- AI summary content (mock): what the grant is for, grant amount, who can apply, what the funder is looking for, extracted application questions with word limits, and key requirements
- Questions extracted note: _"We found [n] application questions in these guidelines. We'll use these to generate your draft answers in the next step."_
- Questions not found note (mock toggle): _"We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."_
- **Regenerate summary** link (secondary action)
- **This looks right — continue** button (primary, teal)
- Back link
- API failure state (mock toggle): _"We couldn't generate your summary right now. This is usually temporary — please try again."_ + **Try again** button
- Persistent failure state (mock toggle — shown when retry also fails): _"If this keeps happening, please try again later. Your work has been saved."_

### P1.11 — Application Step 4: Draft Answers

URL: `/applications/[id]/step/4`

**Loading state (starts automatically on arriving at Step 4 after clicking "This looks right — continue" from Step 3 — no user action required to trigger generation):**

- Step indicator (Step 4 highlighted)
- Teal progress bar with staged messages: "Reviewing your guidelines and charity profile…" → "Writing your draft answers…" → "Almost there…"

**Content state:**

- Step indicator (Step 4 highlighted)
- Heading: "Your draft answers"
- Each extracted question shown as a bold heading with an AI-generated answer in an editable textarea below. User edits answers directly.
- Manual question entry field shown if no questions were extracted in Step 3
- **Regenerate all answers** link (secondary action — counts as one AI request)
- AI usage warnings (mock toggles):
  - Approaching limit (shown at 16 or more of 20 monthly requests used): soft banner: _"You've used most of your monthly AI allowance."_
  - Limit reached: _"You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch."_ — generate and regenerate buttons disabled
- API failure state (mock toggle): _"We couldn't generate your draft right now. This is usually temporary — please try again."_ + **Try again** button
- Persistent failure state (mock toggle — shown when retry also fails): _"If this keeps happening, please try again later. Your work has been saved."_
- Back link + **"I've reviewed my answers — continue"** button (primary, teal)

### P1.12 — Application Step 5: Approve & Export

URL: `/applications/[id]/step/5`

- Step indicator (Step 5 highlighted)
- Heading: "Review and approve your application"
- Three plain-language review prompts displayed prominently above the answers:
  1. _"Check that your answers are accurate and reflect your charity's work."_
  2. _"Make sure you have answered every question the funder asked."_
  3. _"Read through as if you were the funder — does your application make a strong case?"_
- Read-only view of all questions and answers for final review
- **Approve my application** button (primary, teal):
  - Confirmation prompt: _"Are you sure you want to approve this application? You can re-open it to make changes at any time."_
  - On confirm: sets status to `approved`
- **Download as Word document** button — enabled only after approval; sets status to `exported` on first download
- Re-export warning (mock toggle — shown after application has already been exported):
  _"You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."_
  Actions: **Download anyway** / **Cancel**
- **Re-open application** link (shown when status is `approved` or `exported`): clicking shows confirmation prompt:
  _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_
  On confirm: status reverts to `in_progress`; user is redirected to Step 4
- Back link

### P1.13 — Account Settings (`/account`)

- Heading: "Account settings"
- Read-only email display: "Your email address: [email]" (no change facility in v1)
- Change password section:
  - Heading: "Change your password"
  - Current password (required, show/hide toggle)
  - New password (required, show/hide toggle)
  - Confirm new password (required, show/hide toggle)
  - **Update password** button (teal)
  - Success message (mock): "Your password has been updated." Fields cleared
- Two-factor authentication section (Should Have — FR-07):
  - Heading: "Two-factor authentication"
  - Status indicator: "Not enabled" / "Enabled"
  - **Set up two-factor authentication** button (when disabled); **Remove two-factor authentication** link (when enabled)
- Delete account section:
  - Heading: "Delete your account"
  - Warning: "Deleting your account will permanently remove all your data, including your charity profile and saved applications. This cannot be undone."
  - **Delete my account** button (destructive, red) → `/account/delete`
- Page title: "Account Settings — Grant Pathway"

### P1.14 — Account Deletion (`/account/delete`)

- Heading: "Delete your account"
- Warning: "This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone."
- Data summary list:
  - Your account and login details
  - Your charity profile
  - All saved applications and draft answers
  - Any uploaded funder guidelines
- Confirmation field: label "Type DELETE to confirm" — case-sensitive; only the exact string `DELETE` (uppercase) is accepted
- **Permanently delete my account** button (destructive, red) — disabled until `DELETE` typed exactly
- **Cancel** button (secondary) → `/account`
- Post-deletion state (mock): redirect to `/` with "Your account has been deleted."
- Page title: "Delete Account — Grant Pathway"

### P1.15 — Loading and Error States

Build reusable components for:

- Page-level loading skeleton (Next.js `loading.tsx` files)
- Inline AI error with Try again button
- Form error summary (top of form, for accessibility)
- 404 page (`not-found.tsx`)

---

## Phase 2 — Risk-First Spikes

**Goal:** Prove all three high-risk technical integrations before writing production code. Each spike is an isolated script or throwaway route — not production code.
**Estimated time:** 3–4 days

Prerequisites before starting:

- AWS account with Bedrock Claude Sonnet 4.6 access enabled in `eu-west-2`
- IAM user with `AmazonBedrockFullAccess` policy (narrow before launch)
- Supabase development project created in London region

### P2.1 — Spike 1: Amazon Bedrock Claude Call

**What to prove:** A Next.js API route can call Claude Sonnet 4.6 via Amazon Bedrock eu-west-2 and receive a structured response.

Create a throwaway route `app/api/spike-bedrock/route.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic.AnthropicBedrock({
  awsRegion: 'eu-west-2',
  // credentials from env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
})

export async function POST() {
  const response = await client.messages.create({
    model: 'anthropic.claude-sonnet-4-6',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content:
          'Summarise this grant funder priority in two sentences: "We fund projects that support elderly people in rural communities."',
      },
    ],
  })
  return Response.json({ result: response.content[0] })
}
```

**Pass criteria:**

- Response returns within 30 seconds (NFR-01 target for summary generation)
- Model ID `anthropic.claude-sonnet-4-6` resolves correctly in eu-west-2
- Auth errors are clear (wrong credentials, region not enabled)
- 429 / throttling behaviour is observable

**Delete this route after the spike is done.**

### P2.2 — Spike 2: Supabase Storage Direct Upload

**What to prove:** The client can upload a 10MB file directly to Supabase Storage, bypassing Vercel's 4.5MB limit, and the server can retrieve and delete it.

Steps:

1. Create `guidelines-temp` bucket in Supabase Storage (private)
2. Create a throwaway signed-URL route: `POST /api/spike-upload/signed-url`
3. Write a client-side test that:
   - Requests a signed URL
   - Uploads a 10MB test file directly to Supabase Storage
   - Reports upload progress
4. Create a throwaway process route: `POST /api/spike-upload/process`
   - Retrieves the file using the service role client
   - Logs the first 500 characters
   - Deletes the file in a `try/finally` block

**Pass criteria:**

- 10MB PDF uploads successfully (Vercel never touches the bytes)
- Server retrieves the file and can read its content
- File is deleted from Storage after processing
- `try/finally` deletes the file even when the process route throws an error

**Delete these routes after the spike is done.**

### P2.3 — Spike 3: Full Document Pipeline

**What to prove:** The complete text-extraction-to-Word-export pipeline works end to end.

Install:

```bash
npm install unpdf mammoth docx @anthropic-ai/sdk
```

Write a standalone Node.js script `scripts/spike-pipeline.ts`:

1. **PDF extraction:** Use `unpdf` on a real funder guidelines PDF. Verify text is readable. Verify the <100 character scanned-PDF detection works.
2. **Word extraction:** Use `mammoth` on a real `.docx` guidelines file. Verify headings and paragraph structure survive.
3. **Token estimation:** Confirm token count estimation logic works correctly for the large-document soft warning threshold (100,000 tokens).
4. **Bedrock call:** Pass extracted text to a summary prompt. Observe response quality and timing.
5. **Word generation:** Use the `docx` library to generate a `.docx` from mock approved answers. Open the file in Word to confirm formatting.

**Pass criteria:**

- PDF text extraction works on a real PDF; scanned PDF produces the fallback message
- Mammoth extracts clean text from a real `.docx`
- Bedrock summary call with a large guidelines document completes within 30 seconds (NFR-01)
- Bedrock full-draft call with a large guidelines document completes within 60 seconds (NFR-01)
- Generated `.docx` opens cleanly in Microsoft Word with Calibri font, A4 page, correct margins

**Delete this script after recording results.**

---

## Phase 3 — Infrastructure Setup

**Goal:** All backend infrastructure is in place; the app boots locally against a real Supabase instance.
**Estimated time:** 3–4 days

### P3.1 — Supabase Setup

1. Create two Supabase projects: `grant-pathway-dev` and `grant-pathway-prod` (both in London region)
2. Run `supabase init` in the project root
3. Run `supabase link --project-ref [dev-project-ref]`
4. Write the initial migration `supabase/migrations/[timestamp]_initial_schema.sql` with the full schema from `technical-design.md` Section 6:
   - `user_profiles` — fields: `id`, `user_id`, `first_name`, `last_name`, `feedback_consent` (default `false`), `created_at`, `updated_at`. Note: inactivity deletion uses `auth.users.last_sign_in_at` (Supabase Auth, automatic) — no custom `last_login_at` column needed.
   - `charity_profiles` — include `lookup_source` field (`charity_commission` or `manual`); records whether data was pre-filled from the Charity Commission API or entered manually
   - `applications` — status column uses values `not_started, in_progress, approved, exported` (resolved from D6); include `last_exported_at TIMESTAMPTZ` (updated on every export)
   - `application_answers` — include `answer_source` enum (`ai_generated`, `user_edited`, `user_written`); include `is_approved BOOLEAN` (default `false`)
   - `ai_usage_log`
5. Add RLS policies for all five tables (all policies from `technical-design.md` Section 6)
6. Confirm UPDATE and DELETE are denied on `ai_usage_log`
7. Create `guidelines-temp` private Storage bucket
8. Run `supabase db reset` locally to verify migrations apply cleanly

### P3.2 — Environment Variables

Create `.env.example` (committed) and `.env.local` (gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-2
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=
SENTRY_DSN=
```

`.env.local` must never be committed. Confirm it is in `.gitignore`.

**Note (D29):** `ADR-SEC-006` lists only the 6 Supabase and AWS variables. The `.env.example` above is the authoritative list — `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`, and `SENTRY_DSN` are not in ADR-SEC-006 but are required.

### P3.3 — Supabase Client Instances

Create the three Supabase client files:

- `lib/supabase/server.ts` — `createServerClient` (Server Components, Server Actions)
- `lib/supabase/client.ts` — `createBrowserClient` (Client Components)
- `lib/supabase/middleware.ts` — `createMiddlewareClient`

Install:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### P3.4 — Auth Middleware

Replace the Phase 1 stub `middleware.ts` with the real implementation:

- Read session from cookies
- Refresh session token if close to expiry
- Redirect unauthenticated requests to protected routes → `/`
- Redirect authenticated requests to `/` or `/register` → `/dashboard`

**Protected routes** (use these resolved paths — NOT the singular `/application/:path*` in ADR-SEC-001, which predates D1):

- `/dashboard`
- `/profile`
- `/applications/:path*` (plural — resolved from D1)
- `/account/:path*`

Matcher configuration:

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### P3.5 — HTTP Security Headers

Configure `next.config.js` with all headers from `technical-design.md` Section 13:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy` (initial — tighten after first production deploy)

### P3.6 — Upstash Redis (Rate Limiting)

1. Create Upstash account, create Redis database
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`
3. Install: `npm install @upstash/ratelimit @upstash/redis`
4. Create `lib/rate-limit.ts` with the sliding window limiters for both AI routes (5 req / 60 sec / user)

### P3.7 — Sentry (Error Tracking)

1. Create Sentry project in EU region
2. Install: `npm install @sentry/nextjs`
3. Run `npx @sentry/wizard@latest -i nextjs`
4. Configure `beforeSend` to strip `user.email` and `user.name`
5. Add AI route tagging pattern from `technical-design.md` Section 14
6. Set alert: email on new error types only

### P3.8 — Resend (Email)

1. Create Resend account
2. Verify sending domain (SPF + DKIM DNS records for grantpathway.org.uk)
3. Configure Supabase Auth SMTP with Resend credentials
   - ⚠️ **Prerequisite before testing:** Create the `noreply@grantpathway.org.uk` mailbox in GoDaddy (or configure it to forward/route) before any email sending is tested. Supabase will send from this address and delivery will fail if the mailbox does not exist.
4. Customise Supabase Auth email templates (verification + password reset):
   - Must reference "Grant Pathway"
   - Teal CTA buttons
   - Warm, approachable tone (BRD Section 12)
5. Inactivity emails (Emails 3 + 4) built as code functions in `lib/emails/` (not Resend templates):
   - `lib/emails/inactivity-warning.ts` — exports `buildInactivityWarningEmail(firstName, deletionDate): string`
   - `lib/emails/account-deleted-inactivity.ts` — exports `buildAccountDeletedEmail(firstName): string`
   - Cron jobs in Slice 8 call these functions and pass the resulting HTML to `resend.emails.send()`
   - **Why:** Resend's HTML template editor does not support variable substitution; keeping email HTML in code also separates content from cron logic, making both easier to maintain
   - **Email 3 — Inactivity warning:** subject "Your Grant Pathway account will be deleted in 30 days"; sent at 23 months of no login; includes `{first_name}` and `{deletion_date}` variables; links to sign-in page
   - **Email 4 — Account deleted (inactivity):** subject "Your Grant Pathway account has been deleted"; sent immediately after automated deletion at 24 months; includes `{first_name}` variable; links to registration page

### P3.9 — Seed Data

Write `supabase/seed.sql` with realistic sample data:

- One user with a complete charity profile
- Three applications at different steps and statuses (using `not_started`, `in_progress`, `approved`)
- Several draft answers

Confirm `supabase db reset` loads the seed data and the app boots locally.

### P3.10 — AWS Bedrock Spend Cap

Configure a monthly spend cap in the AWS Billing / Amazon Bedrock console (PDR-AI-005):

- Set a monthly spend alert at £70 (acts as early warning before the £100/month budget limit is breached)
- Set a hard spend cap at £100/month
- This is a secondary backstop — the primary control is the per-user 20 req/month limit in the application
- Confirm the cap is active before any production traffic is sent to Bedrock

### P3.11 — Health Endpoint

Build the `/api/health` endpoint required by ADR-OPS-007. The endpoint provides a richer liveness signal than the homepage — it confirms both application availability and database connectivity, and is the URL that UptimeRobot (configured in P5.4) will poll every 5 minutes.

**1. Create `app/api/health/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.from('user_profiles').select('count').limit(1)
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
```

- Returns `200 OK` when the app is running and the Supabase database is reachable.
- Returns `503 Service Unavailable` if the database query fails.
- No authentication required — returns no user data.
- Note: the ADR code sample queries `profiles`; the correct table name in this project is `user_profiles`.

**2. Add `/api/health` to the public routes matcher in `proxy.ts`**

The endpoint must be reachable without a session or UptimeRobot's requests will be redirected to the sign-in page and treated as failures.

**3. UptimeRobot monitor** — configured in P5.4 (pre-launch infrastructure), once the production domain is live.

### P3.12 — Pre-Phase 4 Gap Resolutions

The following tasks were identified by the ADR consequences sweep (2026-05-20) as missing from the plan. All must be completed or explicitly deferred before Phase 4 slice work begins. See `docs/Implementation Plan/ADR-TRACEABILITY.md` for the full gap register.

**GAP-06 — Add `SUPABASE_DB_PASSWORD` to `.env.example` (ADR-DATA-004)**
Add `SUPABASE_DB_PASSWORD=` to `.env.example` with a comment explaining it is required for `supabase db push` in the deployment checklist. Update the P3.2 env vars note to reference this variable.

**GAP-08 — Server-side re-validation in file process route (ADR-FILE-002)**
In `POST /api/upload/process`, re-validate MIME type (only `application/pdf` or `.docx` permitted) and file size (reject >10MB) before passing to text extraction. Never rely on client-side validation alone.

**GAP-09 — Create `lib/guidelines-session.ts` utility (ADR-FILE-004)**
Create `lib/guidelines-session.ts` exporting:

- `setGuidelines(applicationId: string, text: string): void`
- `getGuidelines(applicationId: string): string | null`
- `clearGuidelines(applicationId: string): void`

All `sessionStorage` access for guidelines text must go through these functions — never accessed directly in components. This keeps `sessionStorage` usage testable and consistent.

**GAP-10 — Clear `sessionStorage` on Step 3 completion (ADR-FILE-004)**
In S5.2 (generate-summary route) or S5.4 (Step 3 wiring), call `clearGuidelines(applicationId)` after the AI summary is successfully saved to the database. Guidelines text should not persist in the browser once the summary exists.

**GAP-11 — Configure GitHub branch protection on `main` (ADR-OPS-002, ADR-STACK-005)**
In GitHub repository settings, configure a branch protection rule on `main`: require the Vercel build to pass before merge. This applies even for solo development — protects against accidentally pushing a broken build to production.

**GAP-14 — Install and wire `@axe-core/react` (ADR-OPS-006)**
Install as a dev dependency: `npm install --save-dev @axe-core/react`.
Add conditional initialisation in `app/layout.tsx` (client-side, development only):

```typescript
if (process.env.NODE_ENV !== 'production') {
  const axe = require('@axe-core/react')
  const React = require('react')
  const ReactDOM = require('react-dom')
  axe(React, ReactDOM, 1000)
}
```

This surfaces accessibility violations in the browser console during development.

**GAP-18 — Confirm Supabase Auth JWT expiry ≥ 60 minutes (ADR-SEC-003)**
In the Supabase dashboard for both dev and prod projects: Authentication → Settings → JWT expiry. Confirm the value is ≥ 3600 seconds (1 hour). If less, increase to 3600s. Document the confirmed value in IMPLEMENTATION-STATUS.md. This ensures the application-level 60-minute inactivity timer fires before the JWT expires and causes a silent logout.

---

The following gaps are lower priority and are folded into their natural Phase 4 task as additional steps. They do not block Phase 4 start but must be addressed at the point of implementing the relevant slice:

- **GAP-01** (S5.1) — `lib/prompts.ts` inline comments
- **GAP-02** (S5.2, S6.2) — Progress bar edge cases (hold at ~90%; snap to 100%)
- **GAP-03** (P3.7 / S5.3) — Sentry alert for AI routes approaching 90s
- **GAP-04** (S5.3) — Documented error response contract for AI routes
- **GAP-05** (Phase 4 intro) — Below-768px degradation banner
- **GAP-07** (S7.2) — Null answer handling in Word export
- **GAP-12** (P5.4) — Git release tagging
- **GAP-13** (S4.4) — Cron routes excluded from rate limiter (document explicitly)
- **GAP-15** (P5.2 / P5.4) — Lighthouse CI automation
- **GAP-16** (Phase 4 intro) — Accessibility as definition of done
- **GAP-17** (P5.2) — RLS cross-user access test
- **GAP-19** (S4.1) — UI message when user returns to Step 2 without `sessionStorage` entry
- **GAP-20** (P5.1) — Dependency licence review

---

## Phase 3 → Phase 4 Gate

**This gate must be signed off before any Slice 0 work begins.**

The gate exists because implementation tasks are written feature-first and ADR consequences are spec-first. Without an explicit check, the gap between the two is invisible until something breaks. See `docs/Implementation Plan/ADR-TRACEABILITY.md` for the full consequences map.

Checklist:

- [ ] All Phase 3 tasks complete (P3.1–P3.12), or any incomplete tasks explicitly deferred with justification
- [ ] ADR Traceability Table reviewed — all ⚠️ Gap rows either have a covering task or a documented N/A justification
- [ ] GAP-06, GAP-08, GAP-09, GAP-10, GAP-11, GAP-14, GAP-18 resolved (High/Medium blockers)
- [ ] Security and GDPR-critical ADRs (ADR-SEC-001 to ADR-SEC-006, ADR-DATA-001 to ADR-DATA-004) reviewed by project owner
- [ ] Phase 3 → Phase 4 gate row in `ADR-TRACEABILITY.md` sign-off table completed
- [ ] Run compliance sweep agent: confirm no new gaps since last sweep

---

## Phase 4 — Vertical Slices

**Goal:** Wire each feature up to the real backend, replacing mock data and adding real functionality. Work in the order a user encounters the feature.
**Estimated time:** 6–7 weeks

**Accessibility — definition of done for every slice (ADR-OPS-006, GAP-16):**
Before marking any slice complete, run `@axe-core/react` in development mode and resolve all console violations. Keyboard navigation through the slice's interactive elements must be fully operable (Tab, Shift+Tab, Enter, Space, Arrow keys where applicable).

For each slice: replace the static mock page with real data fetching, add Server Actions and API routes, and validate against the acceptance criteria in `business/PRD inputs/acceptance-criteria.md`.

---

### Slice 0 — Authentication

**Estimated time:** 2–3 days
**Functional requirements:** FR-01 to FR-08

#### Registration (FR-01 to FR-03)

- Wire `/register` form to Supabase Auth `signUp()`
- Email format validation and 10-character minimum password (FR-02)
- Supabase sends verification email via Resend on signup
- On success: redirect to `/verify-email` (awaiting state)
- On duplicate email: inline error "An account with this email address already exists"

#### Email Verification (FR-03)

- `/verify-email` handles the three states: awaiting / verified / expired
- On verified: "Your account is now active. Let's get started." + "Go to my dashboard" button → `/dashboard`
- On expired: "This link has expired" + "Send a new verification email" button (calls `resend()`)
- Resend is rate-limited to 3 per hour to prevent abuse
- State 1 displays the user's email address; includes "Wrong email address? Sign in with a different account" → `/`

#### Sign In (FR-04)

- Wire `/` form to Supabase Auth `signInWithPassword()`
- On success: redirect to `/dashboard`
- On error: "Your email address or password is incorrect. Please try again." — same message for wrong password AND unregistered email (do not confirm whether an email exists)
- On unverified email: "Please verify your email address before signing in." + Resend link

#### Password Reset (FR-05)

- State 1: wire email field to Supabase Auth `resetPasswordForEmail()`
- Post-submission: always show _"If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."_ — regardless of whether the email exists; do not confirm registration
- State 2: wire new password fields to Supabase Auth `updateUser({ password })`
- On success: display "Your password has been updated." with **Sign in** button → `/` (stay on page, do not auto-redirect)
- On expired/invalid link: "This reset link has expired. Please request a new one." with **Request a new link** button → State 1

#### Session Timeout (FR-06)

- Event listeners (`mousemove`, `keydown`, `click`) reset the inactivity timer
- At 55 minutes: show warning modal
- At 60 minutes: call `supabase.auth.signOut()` + redirect to `/` with "You've been signed out due to inactivity."

#### Opt-In MFA (FR-07 — Should Have)

- Implement as opt-in only; not mandatory; accessible from `/account`

#### Feedback Interview Opt-In (FR-08 — Should Have)

- Checkbox on `/register` records consent; only build if feedback interview programme is confirmed ready for launch

---

### Slice 1 — Charity Profile

**Estimated time:** 2 days
**Functional requirements:** FR-09 to FR-14

#### Profile prompt after activation (FR-09)

- After sign-in to a newly activated account with no profile: show the profile incomplete banner on `/dashboard`

#### Charity Commission lookup (FR-10)

- Search by name or number via Charity Commission for England and Wales public API
- Pre-fill charity name and registration number on match
- Note on match: "Details retrieved from the Charity Commission register."

#### Manual entry fallback (FR-11)

- No match: "We couldn't find that charity. Please enter your details manually."
- API unavailable: "We couldn't reach the Charity Commission right now. Please try again in a few moments, or enter your charity details manually." — **Try again** button + **Enter details manually** fallback (PDR-UI-006)

#### Profile fields (FR-12 — per screen requirements)

The profile contains exactly five fields:

| Field label                 | Type       | Required |
| --------------------------- | ---------- | -------- |
| Charity name                | Text input | Yes      |
| Charity registration number | Text input | No       |
| What does your charity do?  | Textarea   | Yes      |
| Who does your charity help? | Textarea   | Yes      |
| Where do you work?          | Text input | Yes      |

Note: `annual income band`, `registered address`, and separate `mission statement` fields are not included (resolved from D5).

#### Save and edit (FR-13)

- `actions/profile.ts` → `saveCharityProfile(data)` Server Action with Zod validation
- Set `lookup_source = 'charity_commission'` when data was pre-filled from the Charity Commission API; `lookup_source = 'manual'` when entered manually
- First save: "Your charity profile has been saved. You're ready to start your first application." + **Go to my dashboard** button → `/dashboard`
- Subsequent saves: redirect to `/dashboard` (changed from stay-on-page banner — see CHANGELOG 2026-05-26; beta feedback needed)
- Profile incomplete banner hidden once profile is fully saved

#### Profile as AI input (FR-14)

- `charity_profiles` row is fetched and passed to every AI prompt construction call (implemented in Slices 5 and 6)

---

### Slice 2 — Dashboard and Application Management

**Estimated time:** 1–2 days
**Functional requirements:** FR-15 to FR-20

- Fetch applications for the current user from `applications` table (Server Component, SSR), sorted by `updated_at` descending
- Empty state: heading "Welcome to Grant Pathway, [first name]"; profile incomplete banner; three-step explainer; disabled start button with tooltip when no profile
- Populated state: heading "My Applications"; summary strip showing counts for all four statuses; AI usage indicator ("n of 50 AI requests used this month") fetched from `ai_usage_log` current-month count (ADR-AI-008); application cards with funder name first (bold), then grant name, status pill, formatted date, Continue/View button
- Status pills use values `not_started, in_progress, approved, exported` with correct colours (slate/amber/green/teal)
- **+ New Application** button → `/applications/new` (FR-15)
- Click application card → `/applications/[id]` (redirects to `current_step`) (FR-17)
  - For `not_started` or `in_progress`: redirect directly to `current_step`
  - For `approved` or `exported`: show re-opening confirmation prompt before redirecting: _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_ On confirm: set `status = in_progress`, reset `is_approved = false` on all `application_answers` for this application, redirect to Step 4
- Delete: status-specific confirmation modal → `deleteApplication(id)` Server Action (FR-19):
  - `not_started` / `in_progress`: _"Are you sure you want to delete this application? This cannot be undone."_
  - `approved`: _"Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."_
  - `exported`: _"Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."_
- Multiple applications per account supported by data model (FR-20)

---

### Slice 3 — Step 1: Application Details

**Estimated time:** 1 day
**Functional requirements:** FR-15, FR-18

- `/applications/new`: create a new `applications` row with `current_step = 1`, `status = not_started` via `createApplication(data)` Server Action
- Fields: funder name (label: "Who is offering this grant?") and grant name (label: "What is the grant called?") — both required
- On Continue: save to database, advance `current_step` to 2, redirect to Step 2; status remains `not_started` (status transition to `in_progress` happens at Step 2 when guidelines are saved)
- `/applications/[id]/step/1`: load existing application data via SSR; allow editing
- Cancel → `/dashboard` (no row created for `/applications/new`; no change for existing applications)
- Step locking: accessing Step 2+ without completing Step 1 redirects to Step 1

---

### Slice 4 — Step 2: File Upload and Text Extraction

**Estimated time:** 2–3 days
**Functional requirements:** FR-21 to FR-23

#### Upload path

1. `POST /api/upload/signed-url`: verify auth; create 5-minute signed URL for `guidelines-temp` bucket; return `{ signedUrl, path }`
2. Client uploads directly to Supabase Storage with progress bar
3. `POST /api/upload/process { path }`:
   - Retrieve file using service role client
   - Extract text via `lib/extract-text.ts` (PDF: `unpdf`; Word: `mammoth`)
   - `try/finally`: delete from Storage unconditionally
   - Estimate token count of extracted text; if > 100,000 tokens, flag for client to display the large document warning (PDR-AI-004: soft warning only — no hard truncation; claude-sonnet-4-6 has 1M token context window)
   - Store extracted text in `sessionStorage[guidelines_text_${applicationId}]`

#### Paste path

- Paste text area → on Continue: store text in `sessionStorage[guidelines_text_${applicationId}]`

#### Error states (FR-23)

- Wrong format: "We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."
- File too large (>10MB): "Your file is over 10MB. Please upload a smaller file or paste the text directly."
- Scanned PDF (<100 chars extracted): "We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead."

#### Orphan file cron job

- `app/api/cron/cleanup-storage/route.ts`: deletes objects in `guidelines-temp` older than 1 hour
- `vercel.json` cron: `"*/30 * * * *"`
- Validates `Authorization: Bearer [CRON_SECRET]`

#### On Continue

- `status` set to `in_progress` (this is the `not_started → in_progress` transition — triggered by saving funder guidelines)
- `current_step` updated to 3; redirect to Step 3

---

### Slice 5 — Step 3: AI Summary

**Estimated time:** 2 days
**Functional requirements:** FR-24 to FR-27

#### Prompt construction (`lib/prompts.ts`)

```typescript
export const MODEL = 'anthropic.claude-sonnet-4-6'
export const SUMMARY_SYSTEM_PROMPT = `You are an expert grant writer helping UK charities...`
export const buildSummaryPrompt = (guidelinesText: string): string => `...`
```

Prompt instructs the model to produce a structured summary covering: what the grant is for, grant amount, who can apply, what the funder is looking for, extracted application questions with word limits, and key requirements. Questions should be extracted as a structured list so Step 4 can use them.

#### API route (`/api/generate-summary`)

```typescript
export const maxDuration = 90
```

- Verify auth
- Check monthly AI usage count (50 req/user/month cap)
- Apply rate limit (5 req / 60 sec via Upstash)
- Read `guidelines_text` from POST body
- Fetch charity profile from Supabase
- Call `buildSummaryPrompt()` → Bedrock Claude
- On success: save summary to `applications.ai_summary`; insert row into `ai_usage_log`; return summary and extracted questions to client; client calls `clearGuidelines(applicationId)` from `lib/guidelines-session.ts` to remove extracted text from sessionStorage (GAP-10, ADR-FILE-004)
- Error handling via `lib/ai-error-handler.ts` (retries: 2× for 429/500/529 with 1s/3s delays; no retry for 400/auth)
- First failure: "We couldn't generate your summary right now. This is usually temporary — please try again." + **Try again** button
- Persistent failure (retry also fails): "If this keeps happening, please try again later. Your work has been saved." (PDR-UI-006)

#### Auto-generation on load (AC-FR-24-01)

- Summary generation begins **automatically when the user arrives at Step 3** — no button press required
- The loading state is shown immediately on page load; the content state appears when generation completes
- If a summary already exists for this application (e.g. user navigated back), show the content state directly without regenerating

#### Display

- Questions extracted note: "We found [n] application questions in these guidelines. We'll use these to generate your draft answers in the next step."
- Questions not found note (if no questions extracted): "We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."
- Approaching limit banner: shown when the user has used **40 or more** of their 50 monthly AI requests
- **Regenerate summary** link (secondary; counts as one AI request against monthly allowance)
- Continue button: "This looks right — continue"

#### On Continue

- `current_step` updated to 4; redirect to Step 4

---

### Slice 6 — Step 4: Q&A Interview

**Estimated time:** 5–7 days
**Functional requirements:** FR-28 to FR-36 (revised — see `docs/Implementation Plan/archive/STEP4-REDESIGN-PROPOSAL.md`)
**Design decision:** 2026-05-28 — replaces auto-generation model with charity-authored Q&A model

> The old `/api/generate-draft` route is **removed** in this slice. New model: the charity writes
> their own answers, AI assists with structure/clarity only, and a final assembly step formats the
> charity's words into the required funder output format.

#### S6.1 — Extend Step 3 AI prompt and AiSummaryData type

Estimated time: 0.5 days

Add five new fields to the Step 3 Bedrock prompt output and the `AiSummaryData` TypeScript type, plus a new `AiSummarySection` type for free_form funders:

```typescript
funder_type: 'structured' | 'free_form'
  // 'structured': funder uses discrete questions (Heritage Fund, Stony Stratford)
  // 'free_form': funder uses narrative sections only — no numbered questions (Garfield Weston)

funderAiPolicy?: string
  // extracted verbatim from guidelines if present; null if not mentioned

supportingDocuments?: string[]
  // list of supporting document categories the funder requires or recommends

questions: Array<{
  question_text: string
  word_limit?: number
  is_budget_question: boolean  // true for financial/budget questions
}>
  // populated for structured funders; empty [] for free_form

sections?: Array<{             // AiSummarySection type — new 2026-05-29
  number: number
  title: string                // e.g. "About your organisation"
  guidance: string             // 2–3 sentences from funder instructions for this section
  wordLimit?: number
  is_budget_section: boolean
}>
  // populated for free_form funders; empty [] for structured
  // mutually exclusive with questions: exactly one of {questions, sections} will be non-empty
```

Prompt classification instructions:

- `funder_type = 'structured'` if guidelines contain a numbered list of questions or a form with discrete fields
- `funder_type = 'free_form'` if guidelines specify themes/sections for a narrative document with no numbered questions
- `is_budget_question / is_budget_section = true` for any question or section asking for budget, income, expenditure, financial projections, or funding breakdown
- `funderAiPolicy`: extract any statement about AI use (verbatim or close paraphrase); null if none found
- `supportingDocuments`: list all document categories the funder requires or recommends submitting alongside the application
- `sections[].guidance`: derive 2–3 sentences from the funder's own wording to guide the applicant on what to include in each section

**Implementation note (2026-05-29):** `sections?` was added during implementation to support the Step 4 section-by-section interface. The Step 4 page server component derives a `guidanceMap` from `parsedSummary.sections`, keyed by `section.number`, which is passed to `QuestionRow` components as a `guidance` prop — it is not stored in `application_answers`, avoiding duplication.

#### S6.2 — Step 3 UI: funderAiPolicy banner and supportingDocuments aide-memoire

Estimated time: 0.5 days

Two additions to the Step 3 display, shown after the main summary:

1. **`funderAiPolicy` banner** — if non-null, show a blue info banner below the summary and above the "Continue" button:
   - Heading: "This funder's guidance on AI"
   - Body: the extracted `funderAiPolicy` text
   - Not a warning; not a modal — informational only

2. **`supportingDocuments` aide-memoire** — if non-empty, show a read-only section:
   - Heading: "Documents you will need to submit with this application"
   - Bullet list of document names
   - Subtext: "Gather these before you begin Step 4. Grant Pathway does not submit documents on your behalf."
   - No checkboxes; no tracking; read-only

Monthly cap threshold for "approaching limit" banner across all AI routes: **40 of 50** requests (raised from 16/20 — cap raised from 20 to 50 per 2026-05-28 decision).

#### S6.3 — Database migration

Estimated time: 0.5 days

One Supabase migration covering all four new columns:

```sql
-- application_answers: two new columns
ALTER TABLE application_answers
  ADD COLUMN ai_refined_answer  TEXT,
  ADD COLUMN is_budget_question BOOLEAN NOT NULL DEFAULT false;

-- applications: two new columns
ALTER TABLE applications
  ADD COLUMN assembled_draft  TEXT,
  ADD COLUMN draft_status     TEXT NOT NULL DEFAULT 'not_started';
```

No new RLS policies required — `application_answers` inherits the existing user-scoped check via the `applications` join; new `applications` columns are covered by existing RLS.

#### S6.4 — Preparation checklist screen

Estimated time: 0.5 days

Shown once when `draft_status = 'not_started'` and the user arrives at Step 4 for the first time.

Content:

- Heading: "Before you begin writing"
- Body: "The financial sections of this application cannot be completed by AI. Before you start, gather:"
  - Most recent annual accounts or financial statements
  - Projected budget for the grant period (income and planned expenditure)
  - Details of other funding secured or applied for
  - Input from your treasurer, finance lead, or a trustee who understands the budget
- Note: "It is worth involving a senior colleague before reaching the financial questions."
- Button: "I have what I need — start writing" → sets `draft_status = 'in_progress'`; shows Q&A interface

If `draft_status` is already `in_progress`, `ready_to_assemble`, `assembled`, or `exported`: skip preparation screen and go directly to the Q&A interface.

#### S6.5 — Q&A interface

Estimated time: 2 days

Complete rewrite of the Step 4 draft component.

**For `funder_type = 'structured'`** (discrete questions):

- Each `application_answers` row rendered as a card with question text, optional word limit, and a textarea for `user_answer` (user writes from scratch)
- Character/word counter on each textarea
- **Budget questions** (`is_budget_question = true`): amber card background, "£" badge, AI assist button **disabled** with label: "This section requires your actual financial data — do not use AI-generated figures"
- **Non-budget questions**: optional "Help me improve this" button (calls S6.6 route)
- Status indicator per card: complete (green), partial (amber), not started (grey)
- Auto-save on field blur (focus leaves textarea): single `UPDATE` on `application_answers` — no AI involved
- Progress bar: questions answered / total
- On re-entry: restores existing answers with their status indicators

**For `funder_type = 'free_form'`** (narrative sections):

- Named text areas per section (e.g., "About your organisation", "Project description", "Budget narrative")
- Same auto-save, budget distinction, and AI assist rules apply
- Note: "This funder requires a flowing narrative document. Write naturally — the assembly step will format your answers into a coherent document."

**"Ready to assemble" button**: enabled when all non-budget questions have a `user_answer`. Budget questions must also be filled; if empty, show: "Please enter your actual budget figures before assembling." Clicking sets `draft_status = 'ready_to_assemble'` and advances to senior review prompt (S6.7).

#### S6.6 — Per-question refine-answer API route

Estimated time: 1 day

`POST /api/refine-answer`

```typescript
export const maxDuration = 30
```

Request body: `{ applicationId: string, questionIndex: number, userAnswer: string }`

Bedrock prompt instructions:

- Improve **structure and clarity** of the provided answer only
- Do **not** add facts, statistics, or claims not present in the original
- Do **not** change the meaning, emphasis, or specific examples in the original
- Preserve the charity's voice and specific language choices
- Return the refined answer only — no commentary

On success: save to `application_answers.ai_refined_answer`; insert into `ai_usage_log`; return to client. Client shows both versions with "Use this version" / "Keep my original" toggle.

Rate limiting: same pattern as `/api/generate-summary` (5 req / 60 sec via Upstash; 50 req/user/month cap). Approaching limit banner at **40 of 50** requests.

#### S6.7 — Senior review prompt and assembly API route

Estimated time: 1 day

**Senior review prompt** (shown when `draft_status = 'ready_to_assemble'`):

> _Before assembling your final draft, we recommend checking with your CEO, treasurer, or a trustee that:_
>
> - _The budget figures are accurate and approved_
> - _The project description reflects your current priorities_
> - _You have authority to submit this application_

Button: "I've reviewed this — assemble my draft"

`POST /api/assemble-draft`

```typescript
export const maxDuration = 60
```

Inputs: all `application_answers` rows + `applications.ai_summary` + `funder_type`

Bedrock prompt varies by `funder_type`:

- **`structured`**: assemble answers into clean, well-formatted responses for each question — correct grammar, consistent tense, appropriate length for word limit. Do not add content.
- **`free_form`**: weave section answers into a coherent flowing narrative — appropriate transitions, logical structure, consistent voice. Do not add facts. Respect page limit if present in summary.

On success: save assembled text to `applications.assembled_draft`; set `draft_status = 'assembled'`; insert into `ai_usage_log`; redirect to Step 5.

#### S6.8 — Step 5 export (updated)

Estimated time: 0.5 days

Update `GET /api/export/[applicationId]`:

- Read `applications.assembled_draft` as the source — do not reassemble from `application_answers` rows
- **Structured funder** (existing format): title page, Q&A pairs with bold headings, disclaimer
- **Free-form funder**: title page + continuous narrative body — no Q&A heading structure imposed
- Set `draft_status = 'exported'` on first download (alongside existing `status = exported`)
- `docx` library already installed; no new dependencies required

---

### Slice 7 — Step 5: Approve & Export

**Estimated time:** 2 days
**Functional requirements:** FR-37 to FR-39

Per screen requirements (D7): approval is a single action on the whole application at Step 5, not per-question.

#### Approve

- Three plain-language review prompts displayed prominently above the answers (AC-FR-32-01):
  1. _"Check that your answers are accurate and reflect your charity's work."_
  2. _"Make sure you have answered every question the funder asked."_
  3. _"Read through as if you were the funder — does your application make a strong case?"_
- Read-only view of all questions and answers fetched server-side
- **Approve my application** button (teal) with confirmation prompt: "Are you sure you want to approve this application? You can re-open it to make changes at any time."
- On confirm: `updateApplicationStatus(id, 'approved')` Server Action; page refreshes to show approved state

#### Re-opening approved or exported applications (AC-FR-36-03/04)

- **Re-open application** link shown when `status = approved` or `status = exported`
- Clicking shows confirmation: _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_
- On confirm: set `applications.status = in_progress`; reset `is_approved = false` on **all** `application_answers` rows for this application; redirect to Step 4

#### Export (FR-37)

- **Download as Word document** button — enabled only after `status = approved`
- `GET /api/export/[applicationId]`:
  - Verify auth; confirm `applications.user_id = auth.uid()` (403 if not owner)
  - Fetch application + all `application_answers`
  - Generate `.docx` in memory using `docx` library
  - Set `status = exported` on first download
  - Stream as download with correct `Content-Type` and `Content-Disposition` headers
- Document structure (PDR-DH-003):
  - **Title**: `[Grant name] — Application`
  - **Header block**: Funder: `[funder name]`, Exported: `[date]`
  - **Disclaimer**: _"This draft was generated with AI assistance and reviewed by [user's full name]. Please review carefully before submitting to the funder."_
  - **Body**: each application question as a bold heading (Calibri 14pt bold), approved answer in plain text beneath (Calibri 11pt)
  - **Footer on every page**: _"Prepared using Grant Pathway v[version number] — grantpathway.org.uk"_
  - **Formatting**: A4 page, 2.54cm margins, single-column layout; no Grant Pathway logo, colours, or imagery in the document body
- Re-export warning if `status = exported`: display warning before allowing another download

#### Plain text export (Could Have — FR-38)

- **Download as plain text** button — also enabled after approval; follows same structural order as Word export (title, funder, date, disclaimer, Q&A pairs, footer attribution) with plain line breaks

---

### Slice 8 — Account Management and Deletion

**Estimated time:** 1–2 days
**Functional requirements:** FR-40 to FR-44

#### Change password (`/account`)

- Read-only email display: "Your email address: [email]"
- Form: current password + new password (10-char minimum) + confirm
- Call Supabase Auth `updateUser({ password })`; verify current password first
- Success: "Your password has been updated." Form fields cleared.

#### Account deletion flow (FR-40 to FR-44)

- `/account` → **Delete my account** button → `/account/delete`
- `/account/delete` warning + data summary list
- Confirmation: user must type `DELETE` exactly (case-sensitive)
- On confirm: API route using service role client cascades deletion in order:
  1. `application_answers` (all for user)
  2. `applications` (all for user)
  3. `charity_profiles` (for user)
  4. `ai_usage_log` (for user)
  5. `user_profiles` (for user)
  6. Supabase Auth `deleteUser(userId)`
- Send confirmation email (Should Have — FR-44)
- Redirect to `/` with: "Your account has been deleted."

#### Inactivity-based account deletion (FR-40 — scheduled)

**Authority note (D27):** `ADR-DATA-003` and `ADR-OPS-004` deferred inactivity deletion to post-v1. This is overridden by `email-notifications.md` and `acceptance-criteria.md` (PRD inputs), which define Emails 3 and 4 and the 23/24-month deletion process as v1 requirements. PRD inputs take precedence over ADRs.

Two Vercel cron jobs handle automated inactivity deletion. Both validate `Authorization: Bearer [CRON_SECRET]`.

**Inactivity source field:**

- Uses `auth.users.last_sign_in_at` — Supabase Auth updates this automatically on every sign-in. No custom column or middleware update needed (D11 resolution).

**Cron 1 — Inactivity warning (`/api/cron/inactivity-warning`):**

- Schedule: daily at 08:00 UTC (`0 8 * * *` in `vercel.json`)
- Queries `auth.users` via service role client for accounts where `last_sign_in_at` is in the 23rd month window (≥23 months ago and <24 months ago)
- Sends Email 3 via Resend to each matched user

**Cron 2 — Inactivity deletion (`/api/cron/inactivity-deletion`):**

- Schedule: daily at 09:00 UTC (`0 9 * * *` in `vercel.json`)
- Queries `auth.users` via service role client for accounts where `last_sign_in_at` is 24 or more months ago
- For each: executes the same cascade deletion as user-initiated deletion (same order: answers → applications → charity_profiles → ai_usage_log → user_profiles → Supabase Auth `deleteUser`)
- Sends Email 4 via Resend immediately after deletion
- Logs each deletion to Sentry with user ID (not email — PII scrubbing applies)

---

## Phase 4 → Phase 5 Gate

**This gate must be signed off before any Phase 5 task begins.**

Checklist:

- [x] All Phase 4 slices complete (Slice 0–8), or any incomplete slices explicitly deferred with justification
- [x] ADR Traceability Table reviewed — all ⚠️ Gap rows resolved or documented as N/A
- [x] All GAP-01 through GAP-20 resolved or explicitly signed off as deferred
- [x] Run compliance sweep agent: confirm no new gaps introduced during Phase 4
- [x] Security and GDPR-critical ADRs re-reviewed by project owner
- [x] Phase 4 → Phase 5 gate row in `ADR-TRACEABILITY.md` sign-off table completed

**Signed off: WJ, 2026-06-17**

---

## Phase 5 — Pre-Launch

**Goal:** The application is production-ready, compliant, accessible, and monitored.
**Target start:** ~17 July 2026 (two weeks before 31 July launch)
**Estimated time:** 2 weeks

### Funder Directory (DR-FD-001) — ✅ Complete (2026-06-01)

Implemented prior to P5.1 to ensure all Phase 5 testing reflects the real product experience. Decision record: `docs/decisions/DR-FD-001-funder-directory-model.md`.

#### P5.FD1 — Create `funders` Supabase table and RLS policy

Create the `funders` table via a migration file with columns: `id` (uuid PK), `name` (text, unique), `funder_type` (`structured | narrative`), `grant_range` (text, nullable), `guidelines_url` (text, nullable), `is_active` (boolean, default `true`), `created_at` (timestamptz). Apply RLS: all authenticated users can SELECT active funders; only service role may INSERT, UPDATE, or DELETE.

#### P5.FD2 — Seed `funders` table with approved orgs from target funder list

Seed the table with all approved funders from `docs/target-funder-list.md`. Each row must include `funder_type` and `grant_range`. Only active, tested funders are included at launch.

#### P5.FD3 — Add nullable `funder_id` FK column to `applications` table

Add `funder_id uuid REFERENCES funders(id)` as a nullable column to `applications` via a migration file. Nullable to preserve existing records. Populated when a user selects a funder from the picker at Step 1.

#### P5.FD4 — Replace free-text funder name input in Step 1 with searchable picker

Replace the funder name text input in the Step 1 (Application Details) UI with a searchable picker component wired to the `funders` table (active funders only). On selection, write both `funder_id` and `funder_name` to the `applications` row (`funder_name` retained for display and export).

#### P5.FD5 — Add "My funder isn't listed — request it" link below picker

Add a clearly labelled escape hatch below the picker. V1 implementation is a mailto or Tally form link. Users who arrive with a legitimate unlisted funder are not dead-ended; their request becomes a demand signal for the funder validation backlog.

#### P5.FD6 — Wire funder request notification to Rapidglobe

Ensure each funder request submitted via the escape hatch generates a notification to Rapidglobe (email or equivalent) so no request is missed.

---

### Performance (ADR-AI-010) — ✅ Complete (2026-06-05)

Implemented prior to P5.1 following funder testing that revealed long AI summary times for multi-PDF guideline packs. Full decision record: `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`.

#### P5.PERF1 — Document pre-processing (`lib/preprocess-text.ts`) in `generate-summary`

Create `lib/preprocess-text.ts` and insert it into `/api/generate-summary` before the Bedrock call. The utility strips PDF extraction artefacts and detectable boilerplate, and enforces a character ceiling (raised to 50,000 after funder testing) with a logged warning on truncation. A `DISABLE_TEXT_PREPROCESSING=true` env flag is available as an escape hatch. Tested against all 7 required funders before production deployment; all completed within NFR-01 targets.

---

### P5.1 — Compliance (BRD Section 14)

> **⚠️ Ahead-of-time action required (noted 2026-05-20):** The Privacy Policy and Terms of Service documents should be drafted _during Phase 4_, not left until P5.1 begins. Both documents contain commitments (data retention, funder relationships, AI disclaimers) that may influence UI copy written in Phase 4 slices. Claude can produce initial drafts based on the ADRs, BRD, and product requirements — ask when ready. A solicitor should review both documents before publication, particularly the Privacy Policy (UK GDPR compliance).

| Item                      | Action                                                                                                                                                                                                                                                                                   | BRD ref |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| AWS DPA review            | ✅ **Confirmed 2026-06-22** — Model invocation logging disabled in Bedrock eu-west-2; AWS DPA automatically in force via AWS Service Terms. See DR-DP-003, DR-DP-002, and `docs/legal/AWS-DPA-reference.md`.                                                                             | Item 44 |
| Terms of Service          | Draft and publish before launch. Must state: (1) does not guarantee funding, (2) does not submit applications, (3) makes no representations to funders. **Draft during Phase 4.**                                                                                                        | Item 45 |
| Privacy Policy            | Draft and publish before launch. Must cover: data collected, Supabase London storage, Vercel edge network, Bedrock eu-west-2 with EU/EEA Geo fallback, no AI training commitment, user rights, retention period. **Draft during Phase 4. Requires solicitor review before publication.** | Item 46 |
| Dependency licence review | Audit all npm dependencies for licence compatibility (GAP-20)                                                                                                                                                                                                                            | —       |

### P5.2 — Security

- Run OWASP Top 10 review against all API routes and Server Actions
- Validate HTTP security headers at securityheaders.com; tighten CSP iteratively
- Confirm no secrets or credentials are committed to the repository
- Confirm `.env.local` and all credential files are in `.gitignore`
- **Cross-user RLS test (GAP-17):** Using two separate test accounts, attempt to read, modify, and delete the other account's applications, answers, and charity profile — via the UI, API routes, and direct Supabase queries. Confirm all attempts are blocked by RLS.

### P5.3 — Accessibility (WCAG 2.2 Level AA)

- **Mobile viewport banner (GAP-05):** Add a full-screen banner displayed on viewports below 768px informing users that Grant Pathway is designed for desktop. Banner should block the UI (not just warn) and suggest the user switch to a desktop or laptop browser (ADR-ARCH-005).
- **Sentry route tagging (GAP-21):** Wrap the Bedrock call in `generate-summary` and `generate-draft` routes with `Sentry.withScope(scope => { scope.setTag('route', 'generate-summary') ... })` so errors are filterable by route in the Sentry dashboard (ADR-OPS-005, `technical-design.md §14`).
- **Session timeout inactivity banner (GAP-22):** Update the inactivity timer to redirect to `/?timeout=true` instead of `/`. Update the sign-in page to read the `?timeout=true` param and display a banner: "You've been signed out due to inactivity." (`technical-design.md §5`, ADR-SEC-003).
- **Route loading states (GAP-23):** Create a `loading.tsx` file in each authenticated route folder under `app/(authenticated)/` that renders the existing `page-skeleton.tsx` component. This wires up Next.js Suspense boundaries so users see a skeleton loader during server-side data fetching rather than a blank flash (ADR-ARCH-002).
- **Export disclaimer wording (GAP-24):** Fix the disclaimer text in the export route (`app/api/export/[applicationId]/route.ts`). Change from "All content has been checked for accuracy before submission." to "Please review carefully before submitting to the funder." (PDR-DH-003).
- **Zod validation in Server Actions (GAP-25):** Add Zod input validation to `actions/applications.ts` and `actions/auth.ts`. Each Server Action entry point must parse its inputs through a Zod schema before processing. Follow the pattern already in use in `actions/charity.ts` (ADR-ARCH-003).
- **Inactivity cron reliability (GAP-31):** (1) Add `last_inactivity_warned_at` column to `user_profiles` table via a migration; update the inactivity-warning cron to check this column before sending and update it after send — prevents duplicate warning emails if Vercel fires the cron twice. (2) Update the inactivity-deletion cron to surface email send failures to Sentry rather than swallowing them silently (ADR-AI-010, ADR-OPS-004).
- Run `@axe-core/react` in development mode; fix all violations before proceeding
- Lighthouse accessibility audit on all key pages (target 95+)
- Manual keyboard-only navigation test through the full five-step flow
- Screen reader test (NVDA + Chrome) through the full flow
- WCAG 2.2 AA manual checklist review

Accessibility violations are treated as bugs and must be fixed before launch (C15).

### P5.4 — Vercel Pro and Production Infrastructure

- Activate Vercel Pro (~£16/month)
- Confirm `export const maxDuration = 90` is present on both AI routes
- **Activate Supabase Pro plan (~£20/month) on the production project and confirm automated daily backup is enabled** (ADR-DATA-005 — billing dashboard action only; no code change required)
- Set all production environment variables in Vercel Production scope
- Add `CRON_SECRET` to Vercel; confirm cron job appears active in dashboard
- Apply initial migrations to production Supabase project: `supabase db push --db-url [prod-url]`
- Configure Sentry for production; confirm PII scrubbing is active
- Confirm Resend sending domain is verified (SPF + DKIM)
- Confirm email templates in Supabase Auth reference "Grant Pathway" and use correct styling
- Review `next build` output for unexpectedly large bundles; check Vercel dashboard Core Web Vitals after first production deployment (ADR-STACK-001)
- **Sentry AI route performance alert (GAP-03):** In the Sentry dashboard, configure a performance alert on the `generate-summary` and `generate-draft` routes. Set the threshold to trigger when P95 response time exceeds 75 seconds (alert before the 90s hard limit). Requires a production baseline — set up the alert after the first successful production deployment and Vercel Pro is active (ADR-AI-001).
- **Version tag (GAP-12):** After the first successful production deployment, run `git tag -a v1.0 -m "v1.0 production launch"` and push the tag: `git push origin v1.0`. This marks the go-live commit in git history (ADR-OPS-001).
- **Rollback procedure (GAP-28):** Document and follow this rollback procedure for production incidents: (1) In Vercel dashboard → Deployments, click the last known-good deployment and select "Redeploy" (one-click revert, ~60 seconds). (2) Only deploy to production during business hours (09:00–17:00 Mon–Fri) unless responding to a live P1 incident. (3) Before re-deploying after a revert, confirm the root-cause fix is in the branch and all tests pass locally. (4) Record the incident and rollback in `CHANGELOG.md` (ADR-OPS-001, ADR-OPS-004).

### P5.5 — Final Testing

- Full manual test of the five-step flow on the production deployment (new account, new application, end to end)
- Test all error states: AI failure, rate limit, usage cap, file too large, scanned PDF, large document warning
- Test account deletion on a test account; confirm all data is removed
- Test both export formats; open Word export in Microsoft Word and confirm structure, font (Calibri), disclaimer, and footer are correct
- Confirm returning user flow (sign out and sign back in; resume saved application)
- Confirm session timeout fires at 60 minutes
- **Cross-browser testing** (NFR-05): run the full five-step flow in Chrome, Edge, Firefox, and Safari on desktop; confirm usable on Chrome Android and Safari iOS
- **AI performance testing** (NFR-01): confirm summary generation completes within 30 seconds; confirm draft generation completes within 60 seconds under normal load
- **Feedback opt-in verification**: confirm the "I'm happy to be contacted" checkbox on registration correctly writes `feedback_consent = true` to `user_profiles` in Supabase; verify a test registration with the box ticked and one without, and inspect the database to confirm the values. ⚠️ **Post-launch action required:** once real users are registering, establish a process to periodically query `user_profiles` where `feedback_consent = true` and act on it (e.g. contact those users for feedback). The data is being collected — do not let it go unused.

### P5.6 — DNS and Go-Live

- Point `grantpathway.org.uk` DNS to Vercel deployment
- Confirm HTTPS enforced (Vercel handles TLS automatically)
- Confirm `Strict-Transport-Security` header present in production
- Confirm Privacy Policy and Terms of Service pages are live and linked in footer
- Announce via CVS newsletters and sector networks (BRD Section 3.3)

---

## Timeline Summary

| Phase      | Content                    | Estimated Duration | Target Start     |
| ---------- | -------------------------- | ------------------ | ---------------- |
| Phase 0    | Project Bootstrap          | 2 days             | Week 1 (May 8)   |
| Phase 1    | Static UI Shell            | 10 days            | Week 1 (May 11)  |
| Phase 2    | Risk-First Spikes          | 4 days             | Week 3 (May 26)  |
| Phase 3    | Infrastructure Setup       | 4 days             | Week 4 (Jun 1)   |
| Phase 4    | Vertical Slices (8 slices) | 6–7 weeks          | Week 4 (Jun 8)   |
| Phase 5    | Pre-Launch                 | 2 weeks            | Week 11 (Jul 17) |
| **Launch** |                            |                    | **31 July 2026** |

---

## Key References

| Document                  | Path                                                         |
| ------------------------- | ------------------------------------------------------------ |
| BRD                       | `business/BRD-Grant-Pathway-v0.2.md`                         |
| PRD                       | `business/PRD-Grant-Pathway-v1.md`                           |
| Screen Requirements       | `business/PRD inputs/screen-requirements.md`                 |
| Acceptance Criteria       | `business/PRD inputs/acceptance-criteria.md`                 |
| Technical Design          | `business/Technical Decision and Design/technical-design.md` |
| ADR Index                 | `business/Technical Decision and Design/ADR-INDEX.md`        |
| Information Architecture  | `business/information-architecture-and-navigation.md`        |
| MoSCoW Feature Register   | `business/moscow-feature-register.md`                        |
| Constraints & Assumptions | `business/constraints-and-assumptions.md`                    |
| Data Model                | `business/data-model.md`                                     |

---

---

## Document History

| Version | Date       | Author         | Summary of changes                                                                                                                                                                                                                                                 |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-05-07 | Rapidglobe Ltd | Initial plan — phases 0–5 with route reference, discrepancy table (D1–D7), and all slice specifications                                                                                                                                                            |
| 1.1     | 2026-05-07 | Rapidglobe Ltd | Corrected 13 inconsistencies against screen-requirements.md (D1–D7)                                                                                                                                                                                                |
| 1.2     | 2026-05-07 | Rapidglobe Ltd | Corrected 10 inconsistencies against PRD inputs (D8–D10)                                                                                                                                                                                                           |
| 1.3     | 2026-05-07 | Rapidglobe Ltd | Corrected 9 inconsistencies against data-model.md, non-functional-requirements.md, user-personas, PDR-DH-002/003, PDR-AI-003/005 (D11–D19)                                                                                                                         |
| 1.4     | 2026-05-07 | Rapidglobe Ltd | Corrected 3 inconsistencies against PDR-AI-002/004, PDR-DH-001, PDR-UI-004/005/006 (D20–D22)                                                                                                                                                                       |
| 1.5     | 2026-05-20 | Rapidglobe Ltd | Corrected 8 inconsistencies against all 42 ADRs and technical-design.md (D23–D30); added P3.12 gap resolutions                                                                                                                                                     |
| 2.8     | 2026-06-17 | Rapidglobe Ltd | Phase 4→5 gate signed off by WJ (2026-06-17); gate checklist ticked; legal docs consolidated to `docs/legal/` (privacy-policy.md + terms-of-service.md); 7-day backup disclosure corrected in privacy policy; monthly AI cap aligned to 50 across all three routes |
| 2.7     | 2026-06-16 | Rapidglobe Ltd | Added inactivity cron reliability step to P5.3 (GAP-31); added Sentry P95 alert, v1.0 git tag, and rollback procedure steps to P5.4 (GAP-03/12/28)                                                                                                                 |
| 2.6     | 2026-06-16 | Rapidglobe Ltd | Added Zod validation step for Server Actions to P5.3 (GAP-25)                                                                                                                                                                                                      |
| 2.5     | 2026-06-16 | Rapidglobe Ltd | Added export disclaimer wording fix to P5.3 (GAP-24)                                                                                                                                                                                                               |
| 2.4     | 2026-06-16 | Rapidglobe Ltd | Added loading.tsx per authenticated route step to P5.3 (GAP-23)                                                                                                                                                                                                    |
| 2.3     | 2026-06-16 | Rapidglobe Ltd | Added session timeout inactivity banner step to P5.3 (GAP-22)                                                                                                                                                                                                      |
| 2.2     | 2026-06-16 | Rapidglobe Ltd | Added Sentry route tagging step to P5.3 (GAP-21)                                                                                                                                                                                                                   |
| 2.1     | 2026-06-16 | Rapidglobe Ltd | Added mobile viewport banner step to P5.3 (GAP-05)                                                                                                                                                                                                                 |
| 2.0     | 2026-06-16 | Rapidglobe Ltd | Added cross-user RLS test step to P5.2 (GAP-17)                                                                                                                                                                                                                    |
| 1.9     | 2026-06-16 | Rapidglobe Ltd | Added Performance section (P5.PERF1) to Phase 5 — task implemented 2026-06-05 but missing from plan; added for audit trail completeness (ADR-AI-010)                                                                                                               |
| 1.8     | 2026-06-16 | Rapidglobe Ltd | Added Funder Directory section (P5.FD1–FD6) to Phase 5 — tasks implemented 2026-06-01 but missing from plan; added for audit trail completeness (DR-FD-001)                                                                                                        |
| 1.7     | 2026-06-16 | Rapidglobe Ltd | Added bundle size / Core Web Vitals check to P5.4 checklist (ADR-STACK-001 consequence)                                                                                                                                                                            |
| 1.6     | 2026-05-29 | Rapidglobe Ltd | Added AiSummarySection type and sections? field to S6.1 (free_form funders); updated AI usage cap from 20 to 50 in P1.6 and Slice 2; added document history table                                                                                                  |

---

_Implementation Plan v2.8 — Grant Pathway_
_Created: 2026-05-07 | Last updated: 2026-06-17_
_Verified against: BRD v0.2, PRD v0.2, all 42 ADRs, technical-design.md, Screen Requirements, Application Status Model, Email Notifications, Acceptance Criteria, Success Metrics, Data Model, Non-Functional Requirements, Out-of-Scope Document, User Personas & Use Cases, all 17 PDR decisions, MoSCoW Feature Register, Information Architecture, Constraints & Assumptions_
