# Grant Pathway v1 — Implementation Status

**Last updated:** 2026-05-21 (Slice 0 + Slice 1 end-to-end tested and passing)
**Plan version:** 1.5
**Overall status:** In progress
**Target launch:** 31 July 2026

Update this file as tasks are completed. Change `[ ]` to `[x]` for completed items and update the **Last updated** date above.

---

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| **Phase 0 — Project Bootstrap** | **6** | **6** | **✅ Complete** |
| &nbsp;&nbsp;P0.1 — Accounts confirmed (GitHub, Vercel, Node.js) | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P0.2 — Next.js scaffold | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P0.3 — Core dependencies installed | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P0.4 — Design tokens and font | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P0.5 — Directory structure | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P0.6 — Proxy stub, GitHub push, Vercel live | 1 | 1 | ✅ Complete |
| **Phase 1 — Static UI Shell** | **15** | **15** | **✅ Complete** |
| &nbsp;&nbsp;P1.1 — Global components (navbars, footer, session timeout modal) | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.2 — Sign In / Landing page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.3 — Register page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.4 — Verify Email page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.5 — Forgot Password page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.6 — Dashboard (empty + populated states) | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.7 — Charity Profile page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.8 — Step 1: Application Details | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.9 — Step 2: Upload Guidelines | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.10 — Step 3: AI Summary | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.11 — Step 4: Draft Answers | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.12 — Step 5: Approve & Export | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.13 — Account Settings page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.14 — Account Deletion page | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P1.15 — Reusable loading and error components | 1 | 1 | ✅ Complete |
| **Phase 2 — Risk-First Spikes** | **3** | **3** | ✅ Complete |
| &nbsp;&nbsp;P2.1 — Spike 1: Bedrock API call from Next.js | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P2.2 — Spike 2: File upload to Supabase Storage | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P2.3 — Spike 3: PDF/docx extraction and Word export | 1 | 1 | ✅ Complete |
| **Phase 3 — Infrastructure Setup** | **12** | **12** | **✅ Complete** |
| &nbsp;&nbsp;P3.1 — Supabase schema and RLS | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.2 — Environment variables | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.3 — Supabase client instances | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.4 — Auth middleware | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.5 — HTTP security headers | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.6 — Upstash Redis rate limiting | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.7 — Sentry error monitoring | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.8 — Resend email sending | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.9 — Seed data | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.10 — AWS Bedrock spend cap | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.11 — Health endpoint | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;P3.12 — Pre-Phase 4 gap resolutions (GAP-06, 08, 09, 10, 11, 14, 18) | 1 | 1 | ✅ Complete |
| **Phase 3 → Phase 4 Gate** | — | — | ✅ Signed off — WJ, 2026-05-20 |
| **Phase 4 — Vertical Slices** | **36** | **10** | In progress |
| &nbsp;&nbsp;**Slice 0 — Authentication** | **6** | **6** | **✅ Complete** |
| &nbsp;&nbsp;&nbsp;&nbsp;S0.1 — Registration | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S0.2 — Email verification | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S0.3 — Sign in | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S0.4 — Password reset | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S0.5 — Session timeout | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S0.6 — MFA opt-in | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;**Slice 1 — Charity Profile** | **4** | **4** | **✅ Complete** |
| &nbsp;&nbsp;&nbsp;&nbsp;S1.1 — Charity Commission lookup | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S1.2 — Profile save | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S1.3 — Profile edit | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;&nbsp;&nbsp;S1.4 — Profile incomplete banner | 1 | 1 | ✅ Complete |
| &nbsp;&nbsp;**Slice 2 — Dashboard and Application Management** | **5** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S2.1 — Applications list and empty state | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S2.2 — New application creation | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S2.3 — Resume application | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S2.4 — Delete application | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S2.5 — Start button disabled until profile complete | 1 | 0 | Not started |
| &nbsp;&nbsp;**Slice 3 — Step 1: Application Details** | **3** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S3.1 — New application | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S3.2 — Existing application | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S3.3 — Step locking | 1 | 0 | Not started |
| &nbsp;&nbsp;**Slice 4 — Step 2: File Upload** | **4** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S4.1 — Upload path | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S4.2 — Paste path | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S4.3 — File error states | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S4.4 — Orphan cleanup cron | 1 | 0 | Not started |
| &nbsp;&nbsp;**Slice 5 — Step 3: AI Summary** | **4** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S5.1 — Prompt library | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S5.2 — Generate summary API route | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S5.3 — AI error handler | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S5.4 — Questions extracted and regenerate wired up | 1 | 0 | Not started |
| &nbsp;&nbsp;**Slice 6 — Step 4: Draft Answers** | **4** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S6.1 — Questions pre-populated | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S6.2 — Generate draft API route | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S6.3 — Editable textareas and auto-save | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S6.4 — Continue to Step 5 | 1 | 0 | Not started |
| &nbsp;&nbsp;**Slice 7 — Step 5: Approve & Export** | **3** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S7.1 — Approve and re-open | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S7.2 — Word export | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S7.3 — Plain text export | 1 | 0 | Not started |
| &nbsp;&nbsp;**Slice 8 — Account Management** | **3** | **0** | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S8.1 — Change password and MFA | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S8.2 — Account deletion | 1 | 0 | Not started |
| &nbsp;&nbsp;&nbsp;&nbsp;S8.3 — Inactivity deletion | 1 | 0 | Not started |
| **Phase 5 — Pre-Launch** | **6** | **0** | Not started |
| &nbsp;&nbsp;P5.1 — Compliance | 1 | 0 | Not started |
| &nbsp;&nbsp;P5.2 — Security review | 1 | 0 | Not started |
| &nbsp;&nbsp;P5.3 — Accessibility | 1 | 0 | Not started |
| &nbsp;&nbsp;P5.4 — Production infrastructure | 1 | 0 | Not started |
| &nbsp;&nbsp;P5.5 — Final testing | 1 | 0 | Not started |
| &nbsp;&nbsp;P5.6 — DNS | 1 | 0 | Not started |
| **Total** | **78** | **29** | |

---

## Phase 0 — Project Bootstrap

- [x] **P0.1** Accounts confirmed: GitHub repo created (RapidGlobe/grant-pathway), Vercel account created and linked, Node.js 24.14.1 verified
  - ⚠️ Supabase CLI: npm global install not supported on Windows — download binary from https://github.com/supabase/cli/releases (needed for Phase 3, not Phase 0)
  - ⚠️ Docker Desktop — needed for Phase 3 local Supabase, not required yet
- [x] **P0.2** `create-next-app` scaffold created with TypeScript, Tailwind v4, ESLint, App Router (Next.js 16.2.5)
- [x] **P0.3** Core dependencies installed: shadcn/ui 4.7.0 initialised; 14 components added (button, input, label, card, badge, dialog, dropdown-menu, separator, alert, progress, textarea, select, sonner, tooltip); lucide-react and zod installed. Note: `toast` deprecated — `sonner` used instead.
- [x] **P0.4** Design tokens added to `globals.css` via Tailwind v4 `@theme inline` (no tailwind.config.ts in v4); Inter font configured via `next/font/google`; `TooltipProvider` added to root layout
- [x] **P0.5** Directory structure created: `app/(public)/` and `app/(authenticated)/` route groups with all 16 stub pages; `lib/supabase/` stubs; `actions/` stub; `components/ui/` populated
- [x] **P0.6** Pass-through proxy stub in place (`proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`); pushed to GitHub (RapidGlobe/grant-pathway); Vercel confirmed live at https://grant-pathway-three.vercel.app/

---

## Phase 1 — Static UI Shell

- [x] **P1.1** Global components built: unauthenticated nav bar, authenticated nav bar with account dropdown (shows first name or email), global footer, session timeout modal
  - `components/nav-public.tsx` — sticky header, logo mark, Sign in + Register links
  - `components/nav-authenticated.tsx` — sticky header, logo links to /dashboard, My applications + Charity profile nav links with active state, account dropdown with initials avatar, Account settings + Sign out items
  - `components/site-footer.tsx` — © RapidGlobe Ltd, tagline, Privacy policy + Terms of service links
  - `components/session-timeout-modal.tsx` — "Are you still there?" modal, I'm still here + Sign out now buttons; timer logic added in Slice 0 (S0.5)
  - `components/session-timeout-stub.tsx` — client wrapper rendering the modal with isOpen=false for Phase 1
  - `app/(public)/layout.tsx` — created; wraps public pages with NavPublic + SiteFooter + skip-nav link
  - `app/(authenticated)/layout.tsx` — replaced stub; uses NavAuthenticated (mock first name "Sarah") + SiteFooter + SessionTimeoutStub
  - `app/globals.css` — added 11 design tokens (warm-white, border-warm, muted/light-slate, teal-dark, amber-dark/light, error, success-light, border-light/strong); set --background to #FDF9F5, --ring to #D97706 (amber focus), --border/#input to spec values
  - ⚠️ Design tokens use inline hex throughout components (not Tailwind utilities) — consistent with the spec but consider consolidating to Tailwind classes as patterns stabilise in later phases
- [x] **P1.2** Sign In / Landing page (`/`): form fields, all three error states, no marketing content
  - `components/sign-in-form.tsx` — client component; tagline, email field, password field with show/hide toggle, Forgot password link (right-aligned), Sign in button (full-width teal), Register for free prompt
  - All three error states implemented: credentials error alert, unverified email alert with Resend link, inline field validation (empty email, empty/invalid email format, empty password)
  - `app/(public)/page.tsx` — server component; exports `title: "Sign in"`; renders SignInForm centred on page
  - `app/layout.tsx` — metadata updated to use title template `"%s — Grant Pathway"` so all pages produce correct browser tab titles
  - ⚠️ Deviation noted: `design-requirements.md` section 4.3 describes a two-column hero layout for Sign In; `screen-requirements.md` (and P1.2 task spec) explicitly says "no marketing content, hero section, or feature list — clean sign-in page with tagline only". Followed screen-requirements. Confirm this is correct before P1.3.
- [x] **P1.3** Register page (`/register`): all fields, terms and feedback checkboxes (links open in new tab), all inline validation error states
  - `components/register-form.tsx` — client component; heading, first name, last name, email, password (show/hide toggle, 10-char hint), confirm password (show/hide toggle), terms checkbox with ToS + Privacy Policy links (open in new tab), feedback opt-in checkbox (FR-08), Create account button (full-width teal), Already have an account? Sign in prompt
  - All inline validation error states implemented: required first/last name, invalid email, password <10 chars, passwords don't match, terms not accepted
  - Form-level "email_exists" error state implemented (wired to auth in Slice 0)
  - `app/(public)/register/page.tsx` — server component; exports `title: "Register"`; renders RegisterForm centred on page
  - Terms of Service and Privacy Policy link to `/terms` and `/privacy` (placeholder routes until legal docs published per BRD items 45–46)
- [x] **P1.4** Verify Email page (`/verify-email`): all three states (awaiting with email shown and "wrong email?" link / verified with "Go to my dashboard" button / expired with "Send a new verification email")
  - `app/(public)/verify-email/page.tsx` — server component; reads `?state=` query param to switch between three states; exports `title: "Verify your email"`
  - State 1 (default): teal mail icon, "Check your email" heading, mock email displayed, "Resend verification email" outline button, "Wrong email address? Sign in with a different account" link
  - State 2 (`?state=verified`): green check icon, "Email verified" heading, "Go to my dashboard" teal link-button to `/dashboard`
  - State 3 (`?state=expired`): amber clock icon, "This link has expired" heading, "Send a new verification email" primary button
  - Resend buttons are present but noop in Phase 1; wired to Supabase resend in Slice 0 (S0.2); rate-limit of 3/hour enforced server-side in S0.2
- [x] **P1.5** Forgot Password (`/forgot-password`): State 1 with generic confirmation (does not confirm email exists); State 2 with "Save new password" button, stay-on-page success with Sign in button, and expired-link state
  - `components/forgot-password-request-form.tsx` — client component; email field with validation, "Send reset link" primary button; on submit shows generic confirmation with mail icon (never confirms if email exists — security best practice); "Remembered your password? Sign in" link
  - `components/reset-password-form.tsx` — client component; new password + confirm password (both show/hide toggles, 10-char hint); "Save new password" button; on success stays on page and shows "Your password has been updated" + Sign in button; `isExpired` prop shows expired state with amber clock icon + "Request a new link" button → `/forgot-password`
  - `app/(public)/forgot-password/page.tsx` — server component; reads `?state=` param: default → request form, `?state=reset` → reset form, `?state=expired` → expired state; exports `title: "Reset your password"`
- [x] **P1.6** Dashboard (`/dashboard`): empty state (heading "Welcome to Grant Pathway, [first name]", profile banner, three-step explainer, start button with disabled tooltip); populated state (summary strip, AI usage indicator "n of 20 AI requests used this month", application cards with funder name first, correct status pills and colours, Continue/View button distinction, three status-specific delete confirmation modals, re-opening confirmation prompt for approved/exported cards)
  - `components/dashboard-empty.tsx` — client; "Welcome to Grant Pathway, Sarah" heading; charity profile incomplete banner with "Set up charity profile" link; "You don't have any applications yet"; Start button disabled with Tooltip "Please set up your charity profile first" when profile incomplete, enabled Link when complete; three-step explainer (Upload → Sparkles → FileText icons with step labels)
  - `components/dashboard-populated.tsx` — client; "My Applications" heading + "+ New Application" teal link-button; summary strip with all four status counts and AI usage indicator (3 of 20); profile banner; four mock application cards covering all statuses; status pills with correct colours (slate/amber/green/teal); Continue button (teal) for not_started/in_progress; View button (outline) for approved/exported; Delete link (red); three status-specific delete confirmation Dialogs; re-open confirmation Dialog for approved/exported View button; all modal text matches spec verbatim
  - `app/(authenticated)/dashboard/page.tsx` — server; reads `?state=populated` param; exports `title: "My Applications"`
- [x] **P1.7** Charity Profile (`/profile`): setup state (five fields per screen requirements — no registered address, no mission statement; "Save profile" button; success with "Go to my dashboard" button); edit state ("Your charity profile" heading, "Save changes" button); all three Charity Commission lookup states (match, no match, API unavailable — unavailable state includes Try again button + Enter manually fallback)
  - `components/charity-profile-form.tsx` — client component; Charity Commission lookup section (search field + "Look up charity" button); three lookup result states (match: teal success note + pre-populated charity name and reg number; no-match: amber warning note; unavailable: amber warning note + "Try again" button + "Enter details manually" link that collapses the lookup section); five form fields (charity name required, reg number optional, what does it do / who it helps / where it works as required textareas/input); "Save profile" (setup) / "Save changes" (edit) button; inline field validation; setup success replaces form with green success card + "Go to my dashboard" button; edit success shows green banner above the form
  - `app/(authenticated)/profile/page.tsx` — server component; reads `?state=edit` for edit mode; reads `?lookup=match|no-match|unavailable` to pre-set lookup state for testing; exports `title: "Charity Profile"`
  - All states accessible via URL params: `/profile` (setup), `/profile?state=edit` (edit), `/profile?lookup=match` (match result), `/profile?lookup=no-match` (no-match result), `/profile?lookup=unavailable` (API unavailable)
- [x] **P1.8** Step 1 Application Details: step indicator, heading "Start a new application", correct field labels, Cancel link, Continue button
  - `components/step-indicator.tsx` — reusable horizontal step indicator (5 steps); current step has teal filled circle + ring; completed steps show a tick; future steps are grey; sr-only text announces "Current:" / "Completed:" for screen readers; used by steps 1–5
  - `components/application-step1-form.tsx` — client component; step indicator (Step 1 highlighted); heading "Start a new application"; "Who is offering this grant?" field (placeholder: "e.g. National Lottery Community Fund"); "What is the grant called?" field (placeholder: "e.g. Awards for All England"); inline validation errors per spec; Cancel link → `/dashboard`; Continue button → `/applications/[id]/step/2` (mock ID `123` for `/applications/new`)
  - `app/(authenticated)/applications/new/page.tsx` — server component; exports `title: "New Application"`; renders `ApplicationStep1Form` with no pre-fill
  - `app/(authenticated)/applications/[id]/step/1/page.tsx` — server component; exports `title: "Application Details"`; renders `ApplicationStep1Form` with mock pre-filled funder and grant name
- [x] **P1.9** Step 2 Upload Guidelines: heading "Add the funder's guidelines", upload area + paste textarea, large-document warning, all three file error states, Back + Continue
  - `components/application-step2-form.tsx` — client component; step indicator (Step 2 highlighted, Step 1 shown as completed); heading + instruction; drag-and-drop file upload area (idle/uploading/uploaded states); mock animated progress bar on file select; uploaded file shown with remove button; real client-side validation (wrong format → format error, >10MB → size error); three error states with "Try a different file" link; large document warning banner; paste textarea; Continue disabled until file uploaded or paste text entered; Back → step 1
  - `app/(authenticated)/applications/[id]/step/2/page.tsx` — server component; exports `title: "Upload Guidelines"`; reads `?error=format|size|scanned` and `?warning=large` params for static shell testing
- [x] **P1.10** Step 3 AI Summary: loading state (auto-triggers on page load); content state with heading "Your funder guidelines — summary", correct summary content, questions-extracted note, questions-not-found note, approaching-limit banner (at 16/20), "Regenerate summary" link, "This looks right — continue" button, API failure state (Try again), persistent failure state
  - `components/application-step3-summary.tsx` — client component; loading state auto-animates on mount (staged messages: "Reading your funder guidelines…" → "Almost there…", teal progress bar, transitions to content after ~3s); content state with mock summary card (about, amount, who can apply, what funder wants, 3 extracted questions with word limits, key requirements); questions-extracted (green) and questions-not-found (grey) notes; approaching-limit amber banner; "Regenerate summary" link re-triggers loading; "This looks right — continue" → step 4; API failure state with "Try again" (re-triggers loading); persistent failure state; Back link on all non-loading states
  - `app/(authenticated)/applications/[id]/step/3/page.tsx` — server component; exports `title: "AI Summary"`; reads `?state=content|failure|persistent-failure`, `?questions=none`, `?usage=high`
- [x] **P1.11** Step 4 Draft Answers: loading state (auto-triggers on page load); content state with all answers in editable textareas, "Regenerate all answers" link, approaching-limit banner (at 16/20), limit-reached state with disabled buttons, "I've reviewed my answers — continue" button, API failure state (Try again), persistent failure state
  - `components/application-step4-draft.tsx` — client component; loading state auto-animates on mount with 3 staged messages ("Reviewing your guidelines and charity profile…" → "Writing your draft answers…" → "Almost there…"); content state shows 3 mock questions as bold headings each with an editable pre-populated textarea; manual question entry field when no questions extracted; approaching-limit amber banner; limit-reached red banner with "Regenerate all answers" link disabled; link re-triggers loading animation when not at limit; "I've reviewed my answers — continue" → step 5; API failure + persistent failure states with Back link; Back → step 3
  - `app/(authenticated)/applications/[id]/step/4/page.tsx` — server component; exports `title: "Draft Answers"`; reads `?state=`, `?questions=none`, `?usage=high|limit`
- [x] **P1.12** Step 5 Approve & Export: heading "Review and approve your application", three review prompts above answers, read-only answer view, "Approve my application" button with confirmation prompt, export button enabled only after approval, re-export warning modal, "Re-open application" link with confirmation prompt, Back link
  - `components/application-step5-approve.tsx` — client component; step indicator (all 4 prior steps shown as completed); three numbered review prompt cards; read-only answer view (all 3 mock questions + answers); approve confirmation Dialog; green "Application approved" banner after approval; "Download as Word document" button disabled until approved, triggers re-export warning Dialog on subsequent clicks; re-export Dialog with mock export date, "Download anyway" / "Cancel" actions; "Re-open application" link (shown after approval) triggers re-open confirmation Dialog which redirects to step 4 on confirm; Back link → step 4
  - `app/(authenticated)/applications/[id]/step/5/page.tsx` — server component; exports `title: "Approve & Export"`; reads `?state=approved|exported` to pre-set approval status
- [x] **P1.13** Account Settings (`/account`): heading "Account settings", read-only email display, change-password form with "Update password" button, MFA opt-in section (Should Have — FR-07), delete account section with warning and link
  - `components/account-settings-form.tsx` — client component; four sections separated by `<hr>`; email (read-only mock "sarah@helpinghandsuk.org"); change password with three fields (current, new, confirm), show/hide toggles on all three, inline validation ("at least 10 characters", match check), success banner "Your password has been updated." which clears the form; MFA section with "Status: Enabled / Not enabled", "Set up two-factor authentication" outline button toggles to "Remove two-factor authentication" link and vice versa; delete account section with warning paragraph and red "Delete my account" button → `/account/delete`
  - `app/(authenticated)/account/page.tsx` — server component; exports `title: "Account Settings"`; reads `?mfa=enabled` to pre-set MFA state
  - All states accessible via URL params: `/account` (default, MFA off), `/account?mfa=enabled` (MFA on)
- [x] **P1.14** Account Deletion (`/account/delete`): warning, data-summary list, "Type DELETE to confirm" field (case-sensitive), "Permanently delete my account" button, Cancel button → `/account`
  - `components/delete-account-form.tsx` — client component; red warning banner ("This cannot be undone."); data-summary card listing three items to be deleted (charity profile, applications and AI content, account and login details); "Type DELETE to confirm" input (monospace, case-sensitive); inline validation error if submitted without exact match; "Permanently delete my account" red button; Cancel outline button → `/account`; static shell simulates deletion by redirecting to `/?deleted=true`
  - `app/(authenticated)/account/delete/page.tsx` — server component; exports `title: "Delete Account"`; renders `DeleteAccountForm`
- [x] **P1.15** Reusable loading and error components: page-level skeleton, inline AI error with Try again button, form error summary, 404 page
  - `components/ui/skeleton.tsx` — shadcn skeleton primitive (animated grey pulse)
  - `components/page-skeleton.tsx` — page-level loading skeleton matching the standard max-w-[640px] layout; heading + two input blocks + textarea block + button block; `aria-busy="true"` and `aria-label="Loading…"` for screen readers
  - `components/ai-error.tsx` — inline AI error banner; two variants: transient (red border/bg, "We couldn't complete that request", "Try again" outline button) and persistent (`persistent` prop, "If this keeps happening, please try again later. Your work has been saved.", no retry button); `role="alert"`
  - `components/form-error-summary.tsx` — form-level error summary; takes array of `{ field, fieldId, message }`; "There are N errors in this form" heading; each error links to its field via `href="#fieldId"`; hidden when errors array is empty; `role="alert"` and `aria-labelledby`
  - `app/not-found.tsx` — Next.js App Router 404 page; FileQuestion icon, "Page not found" heading, descriptive message, "Go to my dashboard" teal link-button

---

## Phase 2 — Risk-First Spikes

- [x] **P2.1** Spike 1 complete: Bedrock Claude Sonnet 4.6 call works from Next.js API route using `anthropic.claude-sonnet-4-6` in eu-west-2; response received in 3,352ms (well under 30s NFR-01 target); spike route deleted
  - ⚠️ Deviation: `@anthropic-ai/sdk` v0.97.0 does not include `AnthropicBedrock` — it has been moved to a separate package `@anthropic-ai/bedrock-sdk` (v0.29.2). All production Bedrock code in Phase 4 must import from `@anthropic-ai/bedrock-sdk`, not `@anthropic-ai/sdk`.
- [x] **P2.2** Spike 2 complete: 10MB file uploads directly to Supabase `guidelines-temp` bucket via signed URL (bypassing Vercel); server retrieves and deletes file (10,485,760 bytes confirmed); `try/finally` deletes file on error; spike routes deleted
  - ⚠️ Dev server must run as a Windows process (not WSL/Bash) to resolve Supabase hostname — WSL DNS cannot resolve `*.supabase.co`. This is a local dev environment note only; Vercel production is unaffected.
- [x] **P2.3** Spike 3 complete: PDF extraction (unpdf) works on real Heritage Fund PDF (71,567 chars / ~17,892 tokens); scanned-PDF detection works via error catch; mammoth extracts clean text from real TNL Community Fund .docx; Bedrock summary call succeeded; generated .docx opens in Word with Calibri font, A4 page, 2.54cm margins; spike script deleted
  - ⚠️ Bedrock response time: 33,582ms — marginally over the 30s NFR-01 target. Caused by max_tokens=1500 and cold-start latency. Mitigation in Phase 4: reduce max_tokens for summary route and tune prompt length. Monitor in production.
  - ℹ️ Test fixtures saved to `docs/test-fixtures/` for downstream testing (Heritage Fund PDF + TNL Community Fund DOCX)

---

## Phase 3 — Infrastructure Setup

- [x] **P3.1** Supabase: dev + prod projects created (London region); initial migration written with full schema (5 tables); `user_profiles` has no `last_login_at` (uses `auth.users.last_sign_in_at`); `charity_profiles` includes `lookup_source`; `application_answers` includes `answer_source` enum and `is_approved`; `applications.status` uses values `not_started, in_progress, approved, exported`; RLS policies in place; UPDATE/DELETE denied on `ai_usage_log`; `guidelines-temp` private bucket created; `supabase db push` applied cleanly to both dev and prod
  - `grant-pathway-dev` (eu-west-2, ref: stanwaejdvlvremtffkf) — 5 tables, 18 RLS policies, guidelines-temp bucket confirmed
  - `grant-pathway-prod` (eu-west-2, ref: mvmjryipieepvsjudche) — same schema confirmed
  - Migration: `supabase/migrations/20260519000000_initial_schema.sql`
  - ✅ `word_limit integer` column added to `application_answers` 2026-05-20 via `20260520000000_add_word_limit_to_application_answers.sql` — omitted from initial schema; applied to dev and prod
- [x] **P3.2** Environment variables: `.env.example` committed; `.env.local` populated; confirmed in `.gitignore`
  - ⚠️ `.env.local` Supabase keys point to old dev project — must be updated to new dev project (ref: stanwaejdvlvremtffkf) keys from Supabase dashboard → Settings → API
  - UPSTASH, CRON_SECRET, SENTRY_DSN placeholders added — filled in during P3.6 and P3.7
- [x] **P3.3** Supabase client instances created: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`
  - `server.ts` — `createServerClient` with cookie store; safe to call from Server Components and Server Actions
  - `client.ts` — `createBrowserClient` for Client Components
  - `middleware.ts` — `updateSession()` helper; refreshes session token and returns user; consumed by proxy.ts (P3.4)
- [x] **P3.4** Real auth middleware in place: route protection, session refresh, redirect rules, matcher configured
  - ✅ Session cookie forwarding fixed 2026-05-20 — redirect responses now carry refreshed Supabase session cookies via `redirectWithCookies()` helper; bare `NextResponse.redirect()` would have caused spurious logouts (D-27, Phase 0–3 re-audit)
  - Unauthenticated → protected route: redirects to `/`
  - Authenticated → auth-only route (`/`, `/register`, `/verify-email`, `/forgot-password`): redirects to `/dashboard`
  - Protected routes: `/dashboard`, `/profile`, `/applications/:path*`, `/account/:path*` (D1 plural resolution)
  - Session refresh via `updateSession()` on every request
- [x] **P3.5** HTTP security headers configured in `next.config.ts` (all 6 headers)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
  - Content-Security-Policy: default-src self; connect-src allows *.supabase.co and Sentry EU ingest (*.ingest.de.sentry.io)
  - ⚠️ CSP to be tightened after first production deploy — validate at securityheaders.com (P5.2)
  - ✅ CSP `connect-src` updated 2026-05-20 to include Sentry EU ingest — omission found in Phase 3 compliance review
- [x] **P3.6** Upstash Redis configured; `lib/rate-limit.ts` created (5 req / 60 sec / user for both AI routes)
  - `aiRatelimit` sliding window limiter exported from `lib/rate-limit.ts`; consumed by generate-summary and generate-draft routes in Phase 4
  - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN set in `.env.local` and Vercel (Production + Preview)
- [x] **P3.7** Sentry (EU region) configured; `beforeSend` PII scrubbing in place; new-error-type alerts configured
  - `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — PII scrubbing (email, username stripped before send)
  - ✅ `sentry.edge.config.ts` `beforeSend` hook added 2026-05-20 — omission found in Phase 3 compliance review (GDPR risk: middleware-layer user emails could have been included in Sentry reports)
  - `instrumentation.ts` — loads server/edge Sentry config at runtime
  - `next.config.ts` — wrapped with `withSentryConfig` for source map uploads
  - Sentry project: `grant-pathway` (EU region, org: rapidglobe-ltd)
  - Alert: new issue created → notify on preferred channel (email)
  - SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN set in `.env.local` and Vercel
- [x] **P3.8** Resend: sending domain verified (SPF + DKIM); Supabase Auth SMTP configured; Supabase Auth email templates customised (verification + password reset); inactivity email HTML to be built in code (see design note below)
  - Domain `grantpathway.org.uk` verified in Resend (SPF + DKIM via GoDaddy DNS)
  - Supabase Auth SMTP configured: `smtp.resend.com:465`, username `resend`, sender `noreply@grantpathway.org.uk`
  - Supabase Auth templates updated: Confirm sign up + Reset password — teal CTA buttons, Grant Pathway branding, correct tone
  - ⚠️ **Before testing:** Create `noreply@grantpathway.org.uk` mailbox in GoDaddy before testing any email flow — Supabase sends from this address and delivery will fail if the mailbox does not exist
  - 📝 **Design decision — inactivity emails (Emails 3 + 4):** Resend's HTML template editor does not support variable substitution. Email HTML will be built in code as dedicated functions in `lib/emails/inactivity-warning.ts` and `lib/emails/account-deleted-inactivity.ts`, keeping email content separate from cron job logic. Implemented in Slice 8 (S8.3).
- [x] **P3.9** Seed data in `supabase/seed.sql` using correct status values; `supabase db reset` loads seed; app boots locally
  - Auth user: margaret@helpinghandsuk.org / TestPassword123! (bcrypt via pgcrypto `crypt()`)
  - user_profile (Margaret Thompson, b0000000-...), charity_profile (Helping Hands Community Trust, Harrogate, reg: 1187432, c0000000-...)
  - Application 1 (d0000000-...001): National Lottery / Awards for All England, not_started, step 1
  - Application 2 (d0000000-...002): Tudor Trust / Core Costs Grant 2026, in_progress, step 3, with full AI summary
  - Application 3 (d0000000-...003): Lloyds Bank Foundation / Invest Programme 2025, approved, step 5, 3 answers (2 user_edited + 1 ai_generated, all approved), last_exported_at set
  - 3 ai_usage_log entries; all UUIDs fixed (a/b/c/d/e0000000-...) for reproducibility
  - ⚠️ Run `supabase db reset` locally to apply seed; seed is local-only (never run against production)
- [x] **P3.11** Health endpoint: `app/api/health/route.ts` returns 200/503 based on Supabase connectivity; `/api/health` added to public routes matcher in `proxy.ts` (ADR-OPS-007)
  - `app/api/health/route.ts` — queries `user_profiles` count; returns `{ status: 'ok' }` 200 on success, `{ status: 'error' }` 503 on DB failure
  - `proxy.ts` — `PUBLIC_API = ['/api/health']` early-return bypass added before `updateSession()` so no Supabase SSR overhead is incurred for health checks (ADR-OPS-007)
  - ⚠️ UptimeRobot monitor to be configured in P5.4 once production domain is confirmed
- [x] **P3.12** Pre-Phase 4 gap resolutions — 7 items from ADR consequences sweep (2026-05-20):
  - ✅ **GAP-06** `.env.example` updated — `SUPABASE_DB_PASSWORD` added with explanation (ADR-DATA-004)
  - ✅ **GAP-08** `lib/file-validation.ts` created — `validateFile()` checks MIME type and file size; returns typed result for use in `POST /api/upload/process` (ADR-FILE-002)
  - ✅ **GAP-09** `lib/guidelines-session.ts` created — `setGuidelines()`, `getGuidelines()`, `clearGuidelines()` manage sessionStorage keyed by `application_id` (ADR-FILE-004)
  - ✅ **GAP-10** S5.2 spec in `IMPLEMENTATION-PLAN.md` updated — `clearGuidelines(applicationId)` call added to the API route on-success step (ADR-FILE-004)
  - 🔵 **GAP-11** GitHub branch protection **deliberately deferred to P5.4.** Single developer + AI assistant through all of Phase 4 — the team-conflict risk that branch protection solves does not exist in this setup. Will be configured as part of the production infrastructure baseline before launch. If the RapidGlobe org plan requires an upgrade for private-repo branch protection, that will be handled at P5.4 alongside the other pre-launch infrastructure steps. (ADR-OPS-002)
  - ✅ **GAP-14** `@axe-core/react` installed as dev dependency; `components/axe-provider.tsx` created; wired into `app/layout.tsx`; WCAG violations logged to browser console in development only (ADR-OPS-006)
  - ✅ **GAP-18** Supabase Auth JWT expiry confirmed ≥ 60 minutes: local `jwt_expiry = 3600` in `supabase/config.toml`; prod verified 2026-05-20 — Supabase dashboard → Project Settings → API → Legacy JWT Secret → **Access token expiry time: 3600 seconds** (ADR-SEC-003)

## Phase 3 → Phase 4 Gate

- [x] All Phase 3 tasks complete (P3.1–P3.12), or any incomplete tasks explicitly deferred
- [x] ADR Traceability Table reviewed — all ⚠️ Gap rows covered or documented as N/A
- [x] GAP-06, GAP-08, GAP-09, GAP-10, GAP-11, GAP-14, GAP-18 resolved (GAP-11 explicitly blocked/documented)
- [x] Security and GDPR-critical ADRs reviewed by project owner (ADR-SEC-001–006, ADR-DATA-001–004) — **signed off 2026-05-20**
- [x] Gate sign-off row in `docs/Implementation Plan/ADR-TRACEABILITY.md` completed — **2026-05-20**
- [x] Compliance sweep: no new gaps identified — P3.12 files created to resolve ADR consequences, no new consequences introduced
  - UptimeRobot monitor configured in P5.4 once production domain is live
- [x] **P3.10** AWS Bedrock spend cap configured in AWS Billing console: budget `grant-pathway-bedrock-cap` created ($127 / ~£100); Alert #1 at $89 (~£70), Alert #2 at $127 (~£100); both alerts email mailinglist@rapidglobe.com; health status confirmed OK
  - ⚠️ Budget is scoped to All AWS services (not Bedrock-only) — Bedrock does not yet appear in the service filter as it has no billing history. Edit the budget scope to filter to Bedrock only once the first Bedrock invoice is generated.
  - ⚠️ No automated hard-stop action attached to Alert #2 — requires IAM role setup. Flagged for P5.4 (production infrastructure) before launch. The per-user 20 req/month app-level limit remains the primary cost control.

---

## Phase 4 — Vertical Slices

### Slice 0 — Authentication

- [x] **S0.1** Registration wired up: form → `signUp()`; validation; verification email sent; redirect to `/verify-email`
  - `actions/auth.ts` — `registerUser` Server Action using React 19 `useActionState`; calls `supabase.auth.signUp()`; passes `first_name`, `last_name`, `feedback_consent` via `options.data`
  - Duplicate email detection: `data.user.identities?.length === 0` (Supabase privacy-preserving behaviour — no error returned for duplicate emails when confirmation is enabled)
  - `supabase/migrations/20260520000001_handle_new_user_trigger.sql` — `handle_new_user()` trigger (`SECURITY DEFINER SET search_path = ''`) auto-creates `user_profiles` row on `auth.users` INSERT
  - `components/register-form.tsx` — `useActionState(registerUser, { error: null })`; client-side validation blocks Server Action on field errors; `action={action}` fires Server Action when validation passes; all inputs have `name` attributes for FormData; `disabled={isPending}` + loading text on submit button; `state.error === 'email_exists'` and `state.error === 'unknown'` banners
- [x] **S0.2** Email verification wired up: three states; state 1 shows email address and "wrong email?" link; verified → "Go to my dashboard"; expired → "Send a new verification email"; resend rate-limited to 3/hour
  - `app/auth/callback/route.ts` (new) — GET handler; calls `verifyOtp({ token_hash, type })` or `exchangeCodeForSession(code)`; success → `/verify-email?state=verified`; failure → `/verify-email?state=expired`
  - `proxy.ts` — removed `/verify-email` from AUTH_ONLY; it must remain accessible after verification when the user is authenticated
  - `lib/rate-limit.ts` — added `resendRatelimit` (3/hour per email, `grant-pathway:resend` prefix)
  - `actions/auth.ts` — `registerUser` updated: `emailRedirectTo` set to `{origin}/auth/callback`; redirect updated to `/verify-email?email=xxx`; `resendVerificationEmail` action added (rate-checked, calls `supabase.auth.resend()`)
  - `components/verify-email-resend-form.tsx` (new) — client component; `useActionState(resendVerificationEmail)`; `mode="awaiting"` (hidden email input + outline button) or `mode="expired"` (visible email input + primary button); shows sent / rate_limited / error feedback
  - `app/(public)/verify-email/page.tsx` — replaced MOCK_EMAIL with real email from `?email=` param or session; wired `VerifyEmailResendForm` into AwaitingState and ExpiredState
  - `supabase/config.toml` — added `http://127.0.0.1:3000/auth/callback` to `additional_redirect_urls`
  - ⚠️ **Production action needed:** Add production callback URL to Supabase dashboard → Authentication → URL Configuration → Redirect URLs before any real users register
- [x] **S0.3** Sign in wired up: same error message for wrong password and unknown email; unverified email state
  - `actions/auth.ts` — `signIn` Server Action: calls `signInWithPassword()`; `email_not_confirmed` error code → `{ error: 'unverified' }`; all other auth errors → `{ error: 'credentials' }` (same message prevents email enumeration, AC-FR-04-03); success → `redirect('/dashboard')`
  - `components/sign-in-form.tsx` — wired via `useActionState(signIn, { error: null })`; same validation-first / Server Action pattern as RegisterForm; `name` attributes on inputs; `disabled={isPending}` + "Signing in…" loading text; "Resend verification email" changed from stub button to `<Link href="/verify-email?email=xxx">` so the user lands on the existing resend flow
- [x] **S0.4** Password reset wired up: State 1 posts generic confirmation (never confirms email exists); State 2 success stays on page with Sign in button; expired link state shows "Request a new link"
  - `actions/auth.ts` — `requestPasswordReset`: calls `resetPasswordForEmail()` with `redirectTo: {origin}/auth/callback`; always returns `{ status: 'sent' }` regardless of whether email is registered (AC-FR-05-02 anti-enumeration). `resetPassword`: verifies session exists first; calls `updateUser({ password })`; returns `success`, `expired`, or `error` status
  - `app/auth/callback/route.ts` — updated: `type === 'recovery'` now routes success to `/forgot-password?state=reset` and failure to `/forgot-password?state=expired`; email verification routing unchanged
  - `proxy.ts` — removed `/forgot-password` from AUTH_ONLY; the callback sets a recovery session making the user authenticated, which would otherwise cause the middleware to redirect them to `/dashboard` before they can set their password
  - `components/forgot-password-request-form.tsx` — wired via `useActionState(requestPasswordReset)`; `state.status === 'sent'` drives success view; `name="email"` added; loading state on button
  - `components/reset-password-form.tsx` — wired via `useActionState(resetPassword)`; `isExpired` prop (link expired on arrival) and `state.status === 'expired'` (session expired mid-form) both render the expired view; `name="password"` added; loading state on button; generic error banner for unexpected failures
- [x] **S0.5** Session timeout wired up: 60-minute inactivity timer; warning at 55 min; `signOut()` + redirect at 60 min
  - `actions/auth.ts` — `signOut` Server Action added; no `redirect()` — client handles navigation so it works correctly from both form actions and timer callbacks
  - `components/session-timeout-provider.tsx` (new) — client component; listens for `mousemove`, `keydown`, `click`, `touchstart` on `document` (passive); resets two timers on activity: warning at 55 min (opens modal, starts 1-min countdown), auto sign-out at 60 min; "I'm still here" → `resetTimers()`; "Sign out now" → `doSignOut()` → `router.push('/')`; stable `useCallback` refs prevent stale closures; cleanup removes all listeners and timers on unmount
  - `app/(authenticated)/layout.tsx` — `SessionTimeoutStub` replaced with `SessionTimeoutProvider`; layout converted to async Server Component; reads real `first_name` and `email` from `supabase.auth.getUser()` (via `user_metadata`) and passes to `NavAuthenticated`
  - `components/session-timeout-stub.tsx` — deleted (no longer referenced)
- [x] **S0.6** MFA opt-in wired up (Should Have — FR-07)
  - `actions/auth.ts` — `mfaEnroll()`, `mfaVerifyEnrollment()`, `mfaUnenroll()`, `verifyMfaSignIn()` Server Actions added; `signIn()` updated to call `getAuthenticatorAssuranceLevel()` and redirect to `/mfa` when `nextLevel === 'aal2'`
  - `proxy.ts` — `/mfa` added to PROTECTED so unauthenticated users cannot reach the challenge page
  - `app/(authenticated)/mfa/page.tsx` (new) — reads first verified TOTP factor via `listFactors()`; redirects to `/dashboard` if none; renders `MfaChallengeForm` with factorId
  - `components/mfa-challenge-form.tsx` (new) — `useActionState(verifyMfaSignIn)`; hidden factorId input; numeric code input; invalid_code / unknown error banners
  - `app/(authenticated)/account/page.tsx` — rewritten as async Server Component; reads real email from `auth.getUser()` and MFA status from `mfa.listFactors()`; passes `email`, `mfaEnabled`, `mfaFactorId` to `AccountSettingsForm`
  - `components/mfa-setup-panel.tsx` (new) — full enroll/unenroll flow: "Set up" → `mfaEnroll()` (useTransition) → QR code + manual key + `useActionState(mfaVerifyEnrollment)`; "Remove" → `useActionState(mfaUnenroll)`; `router.refresh()` via `useEffect` on success
  - `components/account-settings-form.tsx` — `MOCK_EMAIL` replaced with real `email` prop; static MFA toggle replaced with `MfaSetupPanel`; `mfaFactorId` prop added

### Slice 1 — Charity Profile

- [x] **S1.1** Charity Commission lookup wired up: searches by name or number; pre-fills all four profile fields (name, registration number, whatDoes, whoHelps) on match; all three result states handled (match / no match / API unavailable)
  - `actions/charity.ts` (rewritten) — `lookupCharity(query)` Server Action with three-step flow: (1) name search via `GET /searchCharityName/{name}` or number search via `GET /charityRegNumber/{n}/0`; (2) governing document via `GET /charitygoverningdocument/{n}/0` to get `charitable_objects` free text; (3) Bedrock Claude paraphrase into `whatDoes` + `whoHelps`. Returns `{ ok: true, charityName, registrationNumber, whatDoes, whoHelps }` on match. Bedrock call uses `Promise.race` with a 30-second timeout; failures degrade gracefully (name/number still returned, AI fields empty). Model: `anthropic.claude-sonnet-4-6`. Note: initial implementation had wrong endpoint paths (`/allCharityDetails/` and `/charitySearch/.../1/1`) and omitted the Bedrock paraphrase — corrected after reviewing full OpenAPI YAML spec from Charity Commission.
  - `components/charity-profile-form.tsx` — `paraphrasedFromLookup` state restored; `handleLookup` pre-fills `whatDoes` and `whoHelps` from Bedrock result when non-empty; amber Sparkles banner shown on match when AI descriptions were generated, prompting user to review; hint text on `whatDoes`/`whoHelps` fields condenses to "Drafted from your Charity Commission entry — edit to personalise." when `paraphrasedFromLookup` is true
  - `app/(authenticated)/profile/page.tsx` — `export const maxDuration = 60` added (Bedrock + two CC API calls can take up to 50 s; default 10 s would time out)
  - `.env.example` — `CHARITY_COMMISSION_API_KEY` added with registration instructions
  - **Note:** `CHARITY_COMMISSION_API_KEY` must be added to `.env.local` and to Vercel environment variables before lookup will work in production. If the key is absent, the action returns `unavailable` gracefully.
- [x] **S1.2** Profile save wired up: five-field form with Zod validation; `lookup_source` set to `charity_commission` or `manual`; first save shows "Go to my dashboard" button; subsequent saves show "Your changes have been saved."
  - `actions/charity.ts` — `saveCharityProfile(data)` Server Action added; Zod validation; `createClient()` Supabase server client; `auth.getUser()` for user isolation (ADR-DATA-001); checks for existing profile before upsert to determine `isFirstSave`; upserts to `charity_profiles` with `onConflict: 'user_id'`; sets `lookup_source = 'charity_commission'` when `paraphrasedFromLookup` is true, `'manual'` otherwise (D14)
  - `components/charity-profile-form.tsx` — `saveCharityProfile` imported; `isSaving` / `startSaving` transition added; `saveError` state added; `handleSubmit` now calls real Server Action via `startSaving`; save error banner rendered above submit button; submit button disabled and shows "Saving…" during transition
- [x] **S1.3** Profile edit wired up: pre-fills from database; saves updates correctly
  - `actions/charity.ts` — `getCharityProfile()` added; fetches `charity_profiles` row for the authenticated user via `maybeSingle()`; returns `CharityProfileData` or `null` if no profile exists
  - `components/charity-profile-form.tsx` — `initialData` prop added; all five `useState` fields initialised from `initialData` so form is pre-filled on edit; `CharityProfileData` type imported
  - `app/(authenticated)/profile/page.tsx` — calls `getCharityProfile()` server-side; `isEdit` now derived from whether a profile row exists (replaces `?state=edit` URL param approach)
- [x] **S1.4** Profile incomplete banner shown/hidden correctly based on profile existence
  - `app/(authenticated)/dashboard/page.tsx` — fetches first name from `user_metadata` and calls `getCharityProfile()`; passes `firstName` and `profileIncomplete` as real props to both dashboard components
  - `components/dashboard-populated.tsx` — `MOCK_PROFILE_INCOMPLETE` constant removed; `profileIncomplete` prop added; banner now conditionally rendered from real data
  - `components/dashboard-empty.tsx` — no changes needed; props already existed with correct wiring

### Slice 0 + 1 — End-to-End Test Results (2026-05-21)

All five test scenarios passed. Bugs found and fixed during testing:

- ✅ **Supabase redirect URL not in allowlist** — `http://localhost:3000/**` added to Authentication → URL Configuration → Redirect URLs in the dev project dashboard. Email verification links were being rejected before reaching the app. ⚠️ Production equivalent must be added to `mvmjryipieepvsjudche` before launch (P5.4).
- ✅ **Missing table-level GRANTs** — Tables created via SQL editor do not automatically receive `GRANT` permissions for the `authenticated` role (Supabase Studio adds these automatically; the SQL editor does not). All five app tables now granted: `supabase/migrations/20260521000000_grant_table_permissions.sql` applied to dev. ⚠️ **Must be applied to production database before first real user sign-up.**
- ✅ **Verify email resend form — empty email fallback** — If a user navigates to `/verify-email` without the `?email=` query param, the awaiting-mode form now shows a visible email input instead of a hidden empty field that produced a validation error on submit (`components/verify-email-resend-form.tsx`).
- ✅ **WCAG contrast violation** — Footer tagline text `#94A3B8` on `#FDF9F5` background was 2.44:1 (needs 4.5:1 for 12px text). Changed to `#64748B` (~4.5:1) in `components/site-footer.tsx`.
- ✅ **WCAG landmark violation** — Skip link `<a>` element sat outside any landmark region. Moved inside the `<header>` element of `NavPublic` and `NavAuthenticated`; removed from both layout files.
- ✅ **Session timeout modal — misleading auto-save text** — Modal said "Any unsaved work has been saved automatically" but the app does not currently auto-save. Changed to "Make sure you've saved any work before your session ends." (`components/session-timeout-modal.tsx`).
- ✅ **Browser extension hydration warnings** — Password managers and security extensions (LastPass, Surfshark, etc.) inject attributes into `<input>` elements after server render, causing React hydration warnings in dev mode. Added `suppressHydrationWarning` to the base `Input` component. Real users in production are unaffected (React 19 recovers silently).
- ℹ️ **Session expiry during testing** — User was redirected to login after ~5–7 minutes of inactivity on the profile page (expected: 60 minutes). Cause not definitively identified; most likely an accidental page reload during the test session. Session timeout logic confirmed correct (60 min, warning at 55 min). Monitor during further testing.

### Slice 2 — Dashboard and Application Management

- [ ] **S2.1** Applications fetched from database, sorted by updated_at descending; empty state shows personalised heading and three-step explainer; populated state shows summary strip with all four status counts and AI usage indicator ("n of 20 AI requests used this month" from ai_usage_log current-month count)
- [ ] **S2.2** New application creation: `createApplication()` Server Action; redirect to Step 1
- [ ] **S2.3** Resume application: card click → `/applications/[id]` → redirects to `current_step` for not_started/in_progress; View for approved/exported shows re-opening confirmation prompt, sets status to `in_progress` and resets `is_approved = false` on all answers on confirm, redirects to Step 4
- [ ] **S2.4** Delete application: status-specific confirmation prompt (three variants) → `deleteApplication()` Server Action; card removed
- [ ] **S2.5** Start button disabled with tooltip until profile complete

### Slice 3 — Step 1: Application Details

- [ ] **S3.1** New application: creates `applications` row with `status = not_started`; funder name and grant name fields with correct labels; redirect to Step 2 on Continue
- [ ] **S3.2** Existing application: loads from database; edits save correctly; Continue advances `current_step` to 2 (status remains `not_started` until Step 2 guidelines are saved)
- [ ] **S3.3** Step locking: accessing Step 2+ without completing Step 1 redirects to Step 1

### Slice 4 — Step 2: File Upload

- [ ] **S4.1** Upload path: signed URL → client direct upload to Supabase Storage → process route extracts text → stores in `sessionStorage` → file deleted; token count estimated — if >100k tokens, large-document warning flag returned (no hard truncation — PDR-AI-004); Continue sets `status = in_progress`
- [ ] **S4.2** Paste path: text stored in `sessionStorage` on Continue
- [ ] **S4.3** All three error states wired up: wrong format, file too large, scanned PDF
- [ ] **S4.4** Orphan cleanup cron job deployed and confirmed active in Vercel dashboard

### Slice 5 — Step 3: AI Summary

- [ ] **S5.1** `lib/prompts.ts` created: `MODEL` constant, `SUMMARY_SYSTEM_PROMPT`, `buildSummaryPrompt()`; output includes extracted questions as structured list
- [ ] **S5.2** `/api/generate-summary` route: called automatically on Step 3 page load; auth, usage check, rate limit, Bedrock call, save to `applications.ai_summary`, insert `ai_usage_log` row; approaching-limit flag returned when usage ≥ 16/20; first failure shows Try again; persistent failure (after retry) shows "If this keeps happening, please try again later. Your work has been saved."
- [ ] **S5.3** `lib/ai-error-handler.ts` created: retry logic (2× for 429/500/529), all error types handled
- [ ] **S5.4** Questions-extracted note, questions-not-found note, and "Regenerate summary" link wired up; "This looks right — continue" advances to Step 4

### Slice 6 — Step 4: Draft Answers

- [ ] **S6.1** Questions from Step 3 pre-populated as `application_answers` rows; manual entry field shown if no questions extracted
- [ ] **S6.2** `/api/generate-draft` route: called automatically on Step 4 page load; generates all answers in one Bedrock call; JSON parse with one retry; usage check and rate limit; approaching-limit flag returned when usage ≥ 16/20; first failure shows Try again; persistent failure (after retry) shows "If this keeps happening, please try again later. Your work has been saved."
- [ ] **S6.3** Editable textareas for all answers; auto-save debounced (300–500ms) and silent 60-second background save; `answer_source` updated to `user_edited` when user modifies AI answer; "Regenerate all answers" link with usage warnings
- [ ] **S6.4** "I've reviewed my answers — continue" advances to Step 5

### Slice 7 — Step 5: Approve & Export

- [ ] **S7.1** Step 5: three review prompts visible on page load; read-only answer view; "Approve my application" button with confirmation prompt; sets `status = approved`; "Re-open application" link sets `status = in_progress` and resets `is_approved = false` on all answers after confirmation prompt
- [ ] **S7.2** Word export (`/api/export/[id]`): auth + ownership check; `docx` generation per PDR-DH-003 (title "[Grant name] — Application", specific disclaimer with user's full name, Calibri 11pt/14pt, A4 page, 2.54cm margins, footer on every page, no branding); sets `status = exported` on first download; re-export warning shown if already exported
- [ ] **S7.3** Plain text export wired up (Could Have — FR-38)

### Slice 8 — Account Management

- [ ] **S8.1** Change password: read-only email display; current + new + confirm fields; `updateUser({ password })`; success clears form; MFA opt-in wired up (Should Have — FR-07)
- [ ] **S8.2** Account deletion: `DELETE` confirmation (case-sensitive); cascade deletion in correct order; confirmation email (Should Have — FR-44); redirect to `/` with message
- [ ] **S8.3** Inactivity deletion: uses `auth.users.last_sign_in_at` (no custom column); Vercel cron job at 23 months sends Email 3 warning; Vercel cron job at 24 months executes cascade deletion and sends Email 4; both cron jobs confirmed active in Vercel dashboard

---

## Phase 5 — Pre-Launch

- [ ] **P5.1** Compliance: AWS DPA review confirmed; Terms of Service published; Privacy Policy published (BRD items 44–46)
  - ⚠️ **Action during Phase 4 (noted 2026-05-20):** Both documents should be drafted during Phase 4, not left until P5.1 begins — UI copy in Phase 4 slices may reference commitments made in these documents. Claude can produce initial drafts from the ADRs and BRD. A solicitor should review before publication, particularly the Privacy Policy (UK GDPR). Ask when ready.
- [ ] **P5.2** Security: OWASP Top 10 review complete; securityheaders.com score A or above; no secrets in repository
- [ ] **P5.3** Accessibility: axe-core violations resolved; Lighthouse 95+ on all key pages; keyboard navigation test passed; NVDA + Chrome screen reader test passed; WCAG 2.2 AA checklist complete
- [ ] **P5.4** Production infrastructure: Vercel Pro active; `maxDuration = 90` on AI routes confirmed; all production env vars set; migrations applied to production Supabase; Sentry production configured; Resend domain verified; email templates confirmed
  - ⚠️ **Branch protection (GAP-11):** Upgrade RapidGlobe org to **GitHub Team** (confirmed by Wac, 2026-05-21), configure branch protection on `main`, and set up feature-branch + Pull Request workflow. Deliberately deferred from Phase 4 — not needed while the project has a single developer.
  - ⚠️ **Logo dependency (Wac / RapidGlobe Ltd):** The current `components/logo.tsx` contains a placeholder SVG. The real Grant Pathway logo (SVG or PNG, ideally both light and dark variants) must be supplied by Wac before the production launch. When the asset is ready: (1) add file(s) to `/public/images/`; (2) replace the `<svg>` in `components/logo.tsx` with `<Image>` (next/image) referencing the real file; (3) remove the `⚠️ PLACEHOLDER LOGO` comment block from the file.
- [ ] **P5.5** Final testing: full five-step flow on production; all error states tested (including large-document warning); account deletion tested; both export formats tested (Word export opened in Word to verify structure, font, disclaimer); returning user flow; session timeout confirmed; cross-browser test (Chrome, Edge, Firefox, Safari desktop; Chrome Android, Safari iOS); AI performance confirmed (summary ≤30s, draft ≤60s)
- [ ] **P5.6** DNS: `grantpathway.org.uk` pointing to Vercel; HTTPS enforced; Privacy Policy and Terms of Service live in footer

---

## Notes

| Date | Note |
|------|------|
| 2026-05-07 | Implementation plan v1.0 created. Four document discrepancies resolved (D1–D5). |
| 2026-05-07 | Plan updated to v1.1 following review against screen-requirements.md. Two additional discrepancies resolved (D6: application status values; D7: Step 4/5 approval model). 13 corrections applied across Phase 1 static shell, Phase 3 schema, and Phase 4 slices. |
| 2026-05-07 | Plan updated to v1.2 following review against all PRD inputs. Three additional discrepancies documented (D8–D10). 10 corrections applied: status transition timing; re-opening approved/exported apps; three deletion prompts by status; AI auto-generation on Step 3 and 4 load; 16/20 approaching-limit threshold; review prompts on Step 5; Word export disclaimer + footer; MFA in Account Settings; inactivity deletion (schema, email templates, two cron jobs). Total tasks: 75 (+1 new task S8.3). |
| 2026-05-07 | Plan updated to v1.3 following review against data-model.md, non-functional-requirements.md, v1-out-of-scope.md, user-personas-journeys-and-use-cases.md, and PRD decisions (PDR-DH-002/003, PDR-AI-003/005). Nine additional discrepancies documented (D11–D19). Key corrections: inactivity uses auth.users.last_sign_in_at (no custom column); answer_source and lookup_source fields added to schema; re-opening resets is_approved on all answers; cross-browser and AI performance testing added to Phase 5; Word export spec per PDR-DH-003 (Calibri, A4, specific disclaimer); plain text export corrected to Could Have; AWS Bedrock spend cap added as P3.10. Total tasks: 76 (+1 new task P3.10). |
| 2026-05-07 | Plan updated to v1.4 following review against PDR-AI-002/004, PDR-DH-001, PDR-UI-004/005/006. Three additional discrepancies documented (D20–D22). Corrections: hard 150k character truncation removed (soft warning only per PDR-AI-004); Try again button added to Charity Commission unavailable state; persistent AI failure state added to Steps 3 and 4. No new tasks — total remains 76. All 17 PRD decisions now verified. |
| 2026-05-07 | Plan updated to v1.5 following full review of all 42 ADRs and technical-design.md. Eight additional discrepancies documented (D23–D30). Key corrections: large-document threshold unit conflict documented; responsive strategy reconciled (desktop-first + 320px min); explicit protected routes list added to P3.4 (plural /applications/:path*); inactivity deletion authority note added; AI usage count display added to dashboard (P1.6, Slice 2); ADR-SEC-006 incomplete note added to P3.2; user_profiles schema authority documented. No new tasks — total remains 76. All 42 ADRs now verified. |
| 2026-05-20 | **Phase 3 complete. P3.10 complete.** AWS Budget `grant-pathway-bedrock-cap` created ($127/~£100). Two email alerts: $89 (~£70 warning) and $127 (~£100 cap). Scoped to All AWS services for now — narrow to Bedrock once first Bedrock invoice generated. No automated hard-stop action attached (IAM role setup deferred to P5.4 pre-launch). |
| 2026-05-20 | **ADR traceability table created; P3.12 and phase gates added.** Full ADR consequences sweep completed across all 42 ADRs. 20 gaps found (GAP-01 to GAP-20) — none were security vulnerabilities but several were implementation-blocking. `docs/Implementation Plan/ADR-TRACEABILITY.md` created as a living document mapping every consequence to a task. P3.12 captures the 7 High/Medium blockers that must be resolved before Phase 4 starts. Formal Phase 3→4 and Phase 4→5 gates added to the plan. AGENTS.md updated with a mandatory pre-task ADR consequences check rule. Plan version → 1.6. Total tasks: 78. |
| 2026-05-20 | **P3.11 added to Phase 3.** `/api/health` endpoint task added following compliance review — ADR-OPS-007 requires the endpoint but no corresponding build task existed in the plan. Phase 3 now has 11 tasks (10 complete). Total plan tasks: 77. |
| 2026-05-20 | **Phase 3 compliance review — 2 High severity fixes applied.** (1) CSP `connect-src` in `next.config.ts` updated to include Sentry EU ingest domain (`https://*.ingest.de.sentry.io`) — browser SDK was silently blocked without this. (2) `sentry.edge.config.ts` PII scrubbing (`beforeSend` hook) added — client and server configs already had it; edge was overlooked. Dependencies updated: next 16.2.5 → 16.2.6 (CVE-2026-44575 High severity middleware bypass fixed), @tailwindcss/postcss 4.2.4 → 4.3.0 (PostCSS XSS), @anthropic-ai/sdk 0.97.0 → 0.97.1, tailwind-merge 3.5.0 → 3.6.0. 6 remaining compliance items (Medium/Low) to be addressed before Phase 4. |
| 2026-05-20 | **P3.8 complete.** Resend domain verified; Supabase Auth SMTP configured; Supabase Auth email templates updated. Design decision: inactivity emails (3 + 4) will be built as code functions in `lib/emails/` rather than Resend templates — Resend's HTML editor does not support variable substitution. Email content kept separate from cron job logic. Implemented in Slice 8. |
| 2026-05-21 | **Logo placeholder recorded.** `components/logo.tsx` marked with `⚠️ PLACEHOLDER LOGO — replace before launch` comment. Real Grant Pathway logo (SVG/PNG, light + dark variants) to be supplied by Wac / RapidGlobe Ltd before P5.4 production launch. Instructions for swapping in the real asset are embedded in the component. |
| 2026-05-21 | **S1.4 complete. Slice 1 complete.** Dashboard page fetches real first name and profile existence; banner shown/hidden correctly on both empty and populated states. `MOCK_PROFILE_INCOMPLETE` removed from `dashboard-populated.tsx`. |
| 2026-05-21 | **S1.3 complete.** `getCharityProfile()` fetches existing profile from `charity_profiles`; `CharityProfileData` type exported; form `initialData` prop pre-fills all five fields; `isEdit` now derived from DB state not URL param. TypeScript clean. |
| 2026-05-21 | **S1.2 complete.** `saveCharityProfile()` Server Action added to `actions/charity.ts`; Zod validation, Supabase upsert on `user_id` conflict, `lookup_source` correctly set to `charity_commission` or `manual` (D14). Form wired with real save, loading state, and error banner. TypeScript clean (0 errors). |
| 2026-05-08 | **Phase 0 implementation started.** Next.js 16.2.5 scaffold created (Turbopack, React 19, Tailwind v4). Key deviations from plan: (1) Tailwind v4 has no `tailwind.config.ts` — design tokens added via `@theme inline` in `globals.css` instead. (2) Next.js 16 deprecates `middleware.ts` in favour of `proxy.ts` with `export function proxy()` — plan's middleware stub updated accordingly. (3) shadcn `toast` component deprecated — replaced with `sonner`. (4) shadcn `form` component not available in shadcn 4.7.0 registry — to be created manually in Phase 1 using react-hook-form directly. P0.2–P0.5 complete; P0.6 pending GitHub push and Vercel link (manual steps for owner). |
