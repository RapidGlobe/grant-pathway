# Grant Pathway v1 — Implementation Status

**Last updated:** 2026-05-18
**Plan version:** 1.5
**Overall status:** In progress
**Target launch:** 31 July 2026

Update this file as tasks are completed. Change `[ ]` to `[x]` for completed items and update the **Last updated** date above.

---

## Summary

| Phase | Tasks | Done | Status |
|-------|-------|------|--------|
| Phase 0 — Project Bootstrap | 6 | 6 | ✅ Complete |
| **Phase 1 — Static UI Shell** | **15** | **0** | **Not started** |
| &nbsp;&nbsp;P1.1 — Global components (navbars, footer, session timeout modal) | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.2 — Sign In / Landing page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.3 — Register page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.4 — Verify Email page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.5 — Forgot Password page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.6 — Dashboard (empty + populated states) | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.7 — Charity Profile page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.8 — Step 1: Application Details | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.9 — Step 2: Upload Guidelines | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.10 — Step 3: AI Summary | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.11 — Step 4: Draft Answers | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.12 — Step 5: Approve & Export | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.13 — Account Settings page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.14 — Account Deletion page | 1 | 0 | Not started |
| &nbsp;&nbsp;P1.15 — Reusable loading and error components | 1 | 0 | Not started |
| Phase 2 — Risk-First Spikes | 3 | 0 | Not started |
| Phase 3 — Infrastructure Setup | 10 | 0 | Not started |
| Phase 4 — Slice 0: Auth | 6 | 0 | Not started |
| Phase 4 — Slice 1: Charity Profile | 4 | 0 | Not started |
| Phase 4 — Slice 2: Dashboard & Application Management | 5 | 0 | Not started |
| Phase 4 — Slice 3: Step 1 Application Details | 3 | 0 | Not started |
| Phase 4 — Slice 4: Step 2 File Upload | 4 | 0 | Not started |
| Phase 4 — Slice 5: Step 3 AI Summary | 4 | 0 | Not started |
| Phase 4 — Slice 6: Step 4 Draft Answers | 4 | 0 | Not started |
| Phase 4 — Slice 7: Step 5 Approve & Export | 3 | 0 | Not started |
| Phase 4 — Slice 8: Account Management | 3 | 0 | Not started |
| Phase 5 — Pre-Launch | 6 | 0 | Not started |
| **Total** | **76** | **6** | |

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

- [ ] **P1.1** Global components built: unauthenticated nav bar, authenticated nav bar with account dropdown (shows first name or email), global footer, session timeout modal
- [ ] **P1.2** Sign In / Landing page (`/`): form fields, all three error states, no marketing content
- [ ] **P1.3** Register page (`/register`): all fields, terms and feedback checkboxes (links open in new tab), all inline validation error states
- [ ] **P1.4** Verify Email page (`/verify-email`): all three states (awaiting with email shown and "wrong email?" link / verified with "Go to my dashboard" button / expired with "Send a new verification email")
- [ ] **P1.5** Forgot Password (`/forgot-password`): State 1 with generic confirmation (does not confirm email exists); State 2 with "Save new password" button, stay-on-page success with Sign in button, and expired-link state
- [ ] **P1.6** Dashboard (`/dashboard`): empty state (heading "Welcome to Grant Pathway, [first name]", profile banner, three-step explainer, start button with disabled tooltip); populated state (summary strip, AI usage indicator "n of 20 AI requests used this month", application cards with funder name first, correct status pills and colours, Continue/View button distinction, three status-specific delete confirmation modals, re-opening confirmation prompt for approved/exported cards)
- [ ] **P1.7** Charity Profile (`/profile`): setup state (five fields per screen requirements — no registered address, no mission statement; "Save profile" button; success with "Go to my dashboard" button); edit state ("Your charity profile" heading, "Save changes" button); all three Charity Commission lookup states (match, no match, API unavailable — unavailable state includes Try again button + Enter manually fallback)
- [ ] **P1.8** Step 1 Application Details: step indicator, heading "Start a new application", correct field labels, Cancel link, Continue button
- [ ] **P1.9** Step 2 Upload Guidelines: heading "Add the funder's guidelines", upload area + paste textarea, large-document warning, all three file error states, Back + Continue
- [ ] **P1.10** Step 3 AI Summary: loading state (auto-triggers on page load); content state with heading "Your funder guidelines — summary", correct summary content, questions-extracted note, questions-not-found note, approaching-limit banner (at 16/20), "Regenerate summary" link, "This looks right — continue" button, API failure state (Try again), persistent failure state
- [ ] **P1.11** Step 4 Draft Answers: loading state (auto-triggers on page load); content state with all answers in editable textareas, "Regenerate all answers" link, approaching-limit banner (at 16/20), limit-reached state with disabled buttons, "I've reviewed my answers — continue" button, API failure state (Try again), persistent failure state
- [ ] **P1.12** Step 5 Approve & Export: heading "Review and approve your application", three review prompts above answers, read-only answer view, "Approve my application" button with confirmation prompt, export button enabled only after approval, re-export warning modal, "Re-open application" link with confirmation prompt, Back link
- [ ] **P1.13** Account Settings (`/account`): heading "Account settings", read-only email display, change-password form with "Update password" button, MFA opt-in section (Should Have — FR-07), delete account section with warning and link
- [ ] **P1.14** Account Deletion (`/account/delete`): warning, data-summary list, "Type DELETE to confirm" field (case-sensitive), "Permanently delete my account" button, Cancel button → `/account`
- [ ] **P1.15** Reusable loading and error components: page-level skeleton, inline AI error with Try again button, form error summary, 404 page

---

## Phase 2 — Risk-First Spikes

- [ ] **P2.1** Spike 1 complete: Bedrock Claude Sonnet 4.6 call works from Next.js API route using `anthropic.claude-sonnet-4-6` in eu-west-2; auth errors and throttling observed; spike route deleted
- [ ] **P2.2** Spike 2 complete: 10MB file uploads directly to Supabase `guidelines-temp` bucket via signed URL (bypassing Vercel); server retrieves and deletes file; `try/finally` deletes file on error; spike routes deleted
- [ ] **P2.3** Spike 3 complete: PDF extraction (unpdf) works on real PDF; scanned-PDF detection works; mammoth extracts clean text from real .docx; Bedrock call with large text stays within timeout; generated .docx opens cleanly in Word; spike script deleted

---

## Phase 3 — Infrastructure Setup

- [ ] **P3.1** Supabase: dev + prod projects created (London region); initial migration written with full schema (5 tables); `user_profiles` has no `last_login_at` (uses `auth.users.last_sign_in_at`); `charity_profiles` includes `lookup_source`; `application_answers` includes `answer_source` enum and `is_approved`; `applications.status` uses values `not_started, in_progress, approved, exported`; RLS policies in place; UPDATE/DELETE denied on `ai_usage_log`; `guidelines-temp` private bucket created; `supabase db reset` runs clean
- [ ] **P3.2** Environment variables: `.env.example` committed; `.env.local` populated; confirmed in `.gitignore`
- [ ] **P3.3** Supabase client instances created: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`
- [ ] **P3.4** Real auth middleware in place: route protection, session refresh, redirect rules, matcher configured
- [ ] **P3.5** HTTP security headers configured in `next.config.js` (all 6 headers)
- [ ] **P3.6** Upstash Redis configured; `lib/rate-limit.ts` created (5 req / 60 sec / user for both AI routes)
- [ ] **P3.7** Sentry (EU region) configured; `beforeSend` PII scrubbing in place; AI route tagging in place; new-error-type email alerts configured
- [ ] **P3.8** Resend: sending domain verified (SPF + DKIM); Supabase Auth SMTP configured; email templates customised (verification, password reset, inactivity warning — Email 3, inactivity deletion — Email 4)
- [ ] **P3.9** Seed data in `supabase/seed.sql` using correct status values; `supabase db reset` loads seed; app boots locally
- [ ] **P3.10** AWS Bedrock spend cap configured in AWS Billing/Bedrock console: £70 alert threshold and £100 hard cap; confirmed active before production traffic

---

## Phase 4 — Vertical Slices

### Slice 0 — Authentication

- [ ] **S0.1** Registration wired up: form → `signUp()`; validation; verification email sent; redirect to `/verify-email`
- [ ] **S0.2** Email verification wired up: three states; state 1 shows email address and "wrong email?" link; verified → "Go to my dashboard"; expired → "Send a new verification email"; resend rate-limited to 3/hour
- [ ] **S0.3** Sign in wired up: same error message for wrong password and unknown email; unverified email state
- [ ] **S0.4** Password reset wired up: State 1 posts generic confirmation (never confirms email exists); State 2 success stays on page with Sign in button; expired link state shows "Request a new link"
- [ ] **S0.5** Session timeout wired up: 60-minute inactivity timer; warning at 55 min; `signOut()` + redirect at 60 min
- [ ] **S0.6** MFA opt-in wired up (Should Have — FR-07)

### Slice 1 — Charity Profile

- [ ] **S1.1** Charity Commission lookup wired up: searches by name or number; pre-fills charity name and registration number; all three result states handled (match / no match / API unavailable)
- [ ] **S1.2** Profile save wired up: five-field form with Zod validation; `lookup_source` set to `charity_commission` or `manual`; first save shows "Go to my dashboard" button; subsequent saves show "Your changes have been saved."
- [ ] **S1.3** Profile edit wired up: pre-fills from database; saves updates correctly
- [ ] **S1.4** Profile incomplete banner shown/hidden correctly based on profile existence

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
- [ ] **P5.2** Security: OWASP Top 10 review complete; securityheaders.com score A or above; no secrets in repository
- [ ] **P5.3** Accessibility: axe-core violations resolved; Lighthouse 95+ on all key pages; keyboard navigation test passed; NVDA + Chrome screen reader test passed; WCAG 2.2 AA checklist complete
- [ ] **P5.4** Production infrastructure: Vercel Pro active; `maxDuration = 90` on AI routes confirmed; all production env vars set; migrations applied to production Supabase; Sentry production configured; Resend domain verified; email templates confirmed
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
| 2026-05-08 | **Phase 0 implementation started.** Next.js 16.2.5 scaffold created (Turbopack, React 19, Tailwind v4). Key deviations from plan: (1) Tailwind v4 has no `tailwind.config.ts` — design tokens added via `@theme inline` in `globals.css` instead. (2) Next.js 16 deprecates `middleware.ts` in favour of `proxy.ts` with `export function proxy()` — plan's middleware stub updated accordingly. (3) shadcn `toast` component deprecated — replaced with `sonner`. (4) shadcn `form` component not available in shadcn 4.7.0 registry — to be created manually in Phase 1 using react-hook-form directly. P0.2–P0.5 complete; P0.6 pending GitHub push and Vercel link (manual steps for owner). |
