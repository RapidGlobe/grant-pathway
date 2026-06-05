# Grant Pathway — Implementation Status

**Last updated:** 2026-04-26
**Status:** Not started
**Launch target:** 31 July 2026

---

## Overall Progress

| Milestone | Name                               | Status         | Started | Completed |
| --------- | ---------------------------------- | -------------- | ------- | --------- |
| M0        | Project Foundation                 | ⬜ Not started | —       | —         |
| M1        | Authentication & Registration      | ⬜ Not started | —       | —         |
| M2        | Charity Profile                    | ⬜ Not started | —       | —         |
| M3        | Dashboard & Application Management | ⬜ Not started | —       | —         |
| M4        | Step 1 — Application Details       | ⬜ Not started | —       | —         |
| M5        | Step 2 — Funder Guidelines         | ⬜ Not started | —       | —         |
| M6        | Step 3 — AI Summary                | ⬜ Not started | —       | —         |
| M7        | Step 4 — Draft Answers & Approval  | ⬜ Not started | —       | —         |
| M8        | Step 5 — Review & Export           | ⬜ Not started | —       | —         |
| M9        | Operational Layer                  | ⬜ Not started | —       | —         |
| M10       | Legal & Compliance                 | ⬜ Not started | —       | —         |
| M11       | Pre-Launch                         | ⬜ Not started | —       | —         |

**Status key:** ⬜ Not started · 🔵 In progress · ✅ Complete · 🔴 Blocked

---

## M0 — Project Foundation

**Done criteria:** `npm run dev` runs; `supabase start` is up; all 5 tables in Supabase Studio; middleware redirects work; `.env.local` not tracked by Git; RLS enabled on all tables.

| #     | Task                             | Status | Notes                                            |
| ----- | -------------------------------- | ------ | ------------------------------------------------ |
| M0-01 | Scaffold Next.js project         | ⬜     |                                                  |
| M0-02 | Install core dependencies        | ⬜     |                                                  |
| M0-03 | Initialise shadcn/ui             | ⬜     |                                                  |
| M0-04 | Add shadcn/ui components         | ⬜     |                                                  |
| M0-05 | Configure Tailwind design tokens | ⬜     |                                                  |
| M0-06 | Create directory structure       | ⬜     |                                                  |
| M0-07 | Define shared TypeScript types   | ⬜     | Lock `types/index.ts` before any other work      |
| M0-08 | Initialise local Supabase        | ⬜     | Requires Docker Desktop running                  |
| M0-09 | Write initial migration          | ⬜     | Includes all BRD gap fields — see plan Section 6 |
| M0-10 | Write seed data                  | ⬜     |                                                  |
| M0-11 | Set up Supabase clients          | ⬜     | server.ts, client.ts, middleware.ts              |
| M0-12 | Create auth middleware           | ⬜     |                                                  |
| M0-13 | Create route group layouts       | ⬜     |                                                  |
| M0-14 | Configure HTTP security headers  | ⬜     |                                                  |
| M0-15 | Create environment variables     | ⬜     |                                                  |
| M0-16 | Apply migrations and verify      | ⬜     |                                                  |
| M0-17 | Initial GitHub commit            | ⬜     |                                                  |

---

## M1 — Authentication & Registration

**Done criteria:** Register → verify email → sign in → reach dashboard → sign out all work; `feedback_consent` saved; unverified account blocked.

| #     | Task                               | Status | Notes                                                             |
| ----- | ---------------------------------- | ------ | ----------------------------------------------------------------- |
| M1-01 | Landing page                       | ⬜     |                                                                   |
| M1-02 | Register page                      | ⬜     | Min 10 char password (FR-02)                                      |
| M1-03 | Feedback consent prompt            | ⬜     | FR-08 — stored in `user_profiles.feedback_consent`                |
| M1-04 | Register Server Action             | ⬜     |                                                                   |
| M1-05 | Email verification                 | ⬜     | Inbucket locally; Resend in production (M11)                      |
| M1-06 | Sign-in page                       | ⬜     |                                                                   |
| M1-07 | Forgot password page               | ⬜     |                                                                   |
| M1-08 | Reset password page                | ⬜     |                                                                   |
| M1-09 | Navigation bar                     | ⬜     |                                                                   |
| M1-10 | Sign out                           | ⬜     |                                                                   |
| M1-11 | MFA opt-in                         | ⬜     | FR-07 — enable in Supabase Auth; opt-in toggle in M9 account page |
| M1-12 | Wire nav into authenticated layout | ⬜     |                                                                   |
| M1-13 | Password strength indicator        | ⬜     |                                                                   |

---

## M2 — Charity Profile

**Done criteria:** Charity Commission lookup pre-fills fields; manual entry fallback works; all FR-12 fields present; profile saves and reloads; completeness banner appears and disappears.

| #     | Task                                     | Status | Notes                                          |
| ----- | ---------------------------------------- | ------ | ---------------------------------------------- |
| M2-01 | Charity number lookup component          | ⬜     |                                                |
| M2-02 | Charity Commission API route             | ⬜     | Test graceful degradation with API unavailable |
| M2-03 | Charity profile page                     | ⬜     |                                                |
| M2-04 | Charity profile form                     | ⬜     | All FR-12 fields including gap fields          |
| M2-05 | Save profile Server Action               | ⬜     |                                                |
| M2-06 | Profile completeness banner              | ⬜     |                                                |
| M2-07 | Post-registration prompt                 | ⬜     |                                                |
| M2-08 | Profile accessible from account settings | ⬜     | FR-13                                          |

---

## M3 — Dashboard & Application Management

**Done criteria:** Dashboard shows applications for current user only; create, rename, delete all work; Continue goes to correct step; RLS verified cross-user.

| #     | Task                          | Status | Notes                                                                            |
| ----- | ----------------------------- | ------ | -------------------------------------------------------------------------------- |
| M3-01 | Dashboard page                | ⬜     |                                                                                  |
| M3-02 | Application card              | ⬜     |                                                                                  |
| M3-03 | Empty state                   | ⬜     |                                                                                  |
| M3-04 | Create application dialog     | ⬜     |                                                                                  |
| M3-05 | Application Server Actions    | ⬜     |                                                                                  |
| M3-06 | Delete confirmation           | ⬜     | FR-19                                                                            |
| M3-07 | Rename application            | ⬜     |                                                                                  |
| M3-08 | Application index redirect    | ⬜     | FR-17                                                                            |
| M3-09 | Step locking helper           | ⬜     | `lib/step-access.ts`                                                             |
| M3-10 | AI usage counter on dashboard | ⬜     | ADR-AI-008 — "X of 20 AI requests used this month" near "New Application" button |

---

## M4 — Step 1: Application Details

**Done criteria:** Step 1 renders pre-filled; save and continue advances to Step 2; step locking works; step progress indicator shows correctly.

| #     | Task                     | Status | Notes                        |
| ----- | ------------------------ | ------ | ---------------------------- |
| M4-01 | Step progress indicator  | ⬜     | Shared across all step pages |
| M4-02 | Step 1 page              | ⬜     |                              |
| M4-03 | Step 1 form              | ⬜     |                              |
| M4-04 | Save and advance         | ⬜     |                              |
| M4-05 | Step locking enforcement | ⬜     |                              |

---

## M5 — Step 2: Funder Guidelines

**Done criteria:** PDF upload extracts text; Word upload extracts text; scanned PDF shows error; unsupported format shows error; file deleted from Storage after processing; text paste works; sessionStorage populated.

| #     | Task                       | Status | Notes                                           |
| ----- | -------------------------- | ------ | ----------------------------------------------- |
| M5-01 | Step 2 page                | ⬜     |                                                 |
| M5-02 | Guidelines input component | ⬜     |                                                 |
| M5-03 | File upload UI             | ⬜     | Client-side validation: PDF/docx only, max 10MB |
| M5-04 | Signed URL API route       | ⬜     |                                                 |
| M5-05 | Supabase Storage bucket    | ⬜     | `guidelines-temp` private bucket                |
| M5-06 | Direct upload to Storage   | ⬜     |                                                 |
| M5-07 | Process upload API route   | ⬜     | try/finally deletion — ADR-FILE-001             |
| M5-08 | Text extraction library    | ⬜     | `lib/extract-text.ts`                           |
| M5-09 | Guidelines session storage | ⬜     | `lib/guidelines-session.ts`                     |
| M5-10 | Text paste path            | ⬜     |                                                 |
| M5-11 | Storage cleanup cron       | ⬜     | Layer 2 protection; `vercel.json`               |
| M5-12 | Advance to Step 3          | ⬜     |                                                 |

---

## M6 — Step 3: AI Summary

**Done criteria:** Loading bar → AI summary displayed; pre-existing summary loads immediately; no guidelines shows redirect prompt; API error shows retry option; usage cap enforced at 20 requests.

| #     | Task                       | Status | Notes                                                       |
| ----- | -------------------------- | ------ | ----------------------------------------------------------- |
| M6-01 | AI prompts file            | ⬜     | `lib/prompts.ts` — all prompt text centralised (ADR-AI-003) |
| M6-02 | AI error handler           | ⬜     | `lib/ai-error-handler.ts` — retry logic                     |
| M6-03 | Upstash rate limiting      | ⬜     | `lib/rate-limit.ts`                                         |
| M6-04 | Usage pre-check            | ⬜     | `lib/usage-check.ts`                                        |
| M6-05 | Generate summary API route | ⬜     | `maxDuration = 90` required                                 |
| M6-06 | AI loading bar component   | ⬜     | `components/ai-loading-bar.tsx`                             |
| M6-07 | Step 3 page                | ⬜     |                                                             |
| M6-08 | Summary display            | ⬜     | Regenerate option                                           |

---

## M7 — Step 4: Draft Answers & Mandatory Approval

**Done criteria:** Draft answers generated; word limit inputs save before generation; excess word count flagged; three review prompts visible per answer; Approve sets `is_approved = true`; Discard and Regenerate works; auto-save fires and persists; refreshing shows saved answers without re-calling API.

| #     | Task                      | Status | Notes                                                     |
| ----- | ------------------------- | ------ | --------------------------------------------------------- |
| M7-01 | Draft prompt builder      | ⬜     | Add to `lib/prompts.ts`                                   |
| M7-02 | Generate draft API route  | ⬜     | `maxDuration = 90`; JSON parse retry (ADR-AI-009)         |
| M7-03 | Word limit input          | ⬜     | FR-29 — input per question before generation              |
| M7-04 | Word limit excess flag    | ⬜     | FR-31 — >10% over limit = prominent warning               |
| M7-05 | Step 4 page               | ⬜     |                                                           |
| M7-06 | Question and answer cards | ⬜     |                                                           |
| M7-07 | Mandatory review prompts  | ⬜     | FR-32 — three prompts, always visible, not collapsible    |
| M7-08 | Approve answer            | ⬜     | FR-33 — cannot be bypassed; visual approved state (FR-36) |
| M7-09 | Discard and regenerate    | ⬜     | FR-35                                                     |
| M7-10 | Write own answer          | ⬜     | FR-35 — blank textarea + review prompts still apply       |
| M7-11 | Auto-save answers         | ⬜     | FR-18 — **300–500ms debounce** (ADR-ARCH-004; NOT 1.5s)   |
| M7-12 | Step 4 AI loading state   | ⬜     | Reuse `ai-loading-bar.tsx`                                |

---

## M8 — Step 5: Review & Export

**Done criteria:** Read-only review displays correctly; Word download is a valid .docx; plain text download is valid .txt; export blocked when zero answers approved; application marked complete after first download.

| #     | Task                      | Status | Notes                                                                             |
| ----- | ------------------------- | ------ | --------------------------------------------------------------------------------- |
| M8-01 | Step 5 page               | ⬜     |                                                                                   |
| M8-02 | Review display            | ⬜     | Approval status visible per answer                                                |
| M8-03 | Export gate               | ⬜     | FR-39 — blocked if zero `is_approved = true`                                      |
| M8-04 | Word export               | ⬜     | FR-37                                                                             |
| M8-05 | Plain text export         | ⬜     | FR-38 — gap from technical design                                                 |
| M8-06 | Export API route          | ⬜     | Auth + ownership check; format query param                                        |
| M8-07 | Word document generation  | ⬜     | `docx` library; DXA units; teal headings                                          |
| M8-08 | Plain text generation     | ⬜     |                                                                                   |
| M8-09 | Mark as complete          | ⬜     |                                                                                   |
| M8-10 | Edit links                | ⬜     | Return to Step 4                                                                  |
| M8-11 | PDF export — post-v1 only | ⬜     | ADR-EXPORT-001: PDF is a nice-to-have deferred to post-v1; do NOT implement in v1 |

---

## M9 — Operational Layer

**Done criteria:** Session timeout fires at 60 min; deletion cascade confirmed; deletion email sent; axe-core reports no violations; keyboard navigation completes five-step flow; all pages render correctly at **1024px minimum viewport**; graceful degradation banner shows below 768px; Lighthouse CI passes in pipeline.

| #     | Task                                  | Status | Notes                                                                                                                                      |
| ----- | ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| M9-01 | Session timeout modal                 | ⬜     | FR-06 — 55-min warning, 60-min auto sign-out                                                                                               |
| M9-02 | Account page                          | ⬜     | MFA toggle; account deletion section                                                                                                       |
| M9-03 | Account deletion — confirmation       | ⬜     | FR-41, FR-42 — email re-entry required                                                                                                     |
| M9-04 | Account deletion — execution          | ⬜     | FR-43 — cascade delete order                                                                                                               |
| M9-05 | Account deletion — confirmation email | ⬜     | FR-44 — gap from technical design                                                                                                          |
| M9-06 | Storage cleanup cron                  | ⬜     | Confirm if not already done in M5                                                                                                          |
| M9-07 | Sentry integration                    | ⬜     | Use `npx @sentry/wizard@latest --saas` (ADR-OPS-005 — **NOT** `-i nextjs`); EU region; PII scrubbing; AI route tagging                     |
| M9-08 | Error boundaries                      | ⬜     | `app/error.tsx`, `app/not-found.tsx`                                                                                                       |
| M9-09 | Loading skeletons                     | ⬜     | `loading.tsx` per key page                                                                                                                 |
| M9-10 | Accessibility + Lighthouse CI         | ⬜     | Install `@axe-core/react` as **dev dependency**; keyboard; colour contrast; WCAG 2.2 AA; configure Lighthouse CI in pipeline (ADR-OPS-006) |
| M9-11 | Basic usage metrics                   | ⬜     | C20 — database counts only; no analytics platform                                                                                          |
| M9-12 | Responsive testing                    | ⬜     | **1024px minimum** (ADR-ARCH-005; NOT 320px); graceful degradation banner below 768px; mobile is post-v1                                   |

---

## M10 — Legal & Compliance

**Done criteria:** Anthropic DPA executed; Terms of Service published at `/terms`; Privacy Policy published at `/privacy`; both linked from footer; named successor documented.

| #      | Task                               | Status | Notes                                           |
| ------ | ---------------------------------- | ------ | ----------------------------------------------- |
| M10-01 | Anthropic DPA review and execution | ⬜     | Pre-launch blocker — start early                |
| M10-02 | Terms of Service                   | ⬜     | BRD 14.3 — three liability statements required  |
| M10-03 | Privacy Policy                     | ⬜     | BRD 14.4 — no-AI-training commitment prominent  |
| M10-04 | Footer links                       | ⬜     | Terms + Privacy on all pages                    |
| M10-05 | No-AI-training clause confirmed    | ⬜     | Reference Anthropic API Terms in Privacy Policy |
| M10-06 | Named successor identified         | ⬜     | Informal; documented privately                  |

---

## M11 — Pre-Launch

**Done criteria:** All 17 tasks confirmed green; Lighthouse accessibility ≥ 95; security headers grade A+; full five-step flow completes on production; production Supabase has no test data.

| #      | Task                    | Status | Notes                                               |
| ------ | ----------------------- | ------ | --------------------------------------------------- |
| M11-01 | Vercel Pro activated    | ⬜     |                                                     |
| M11-02 | Production Supabase     | ⬜     | London eu-west-2; migrations applied                |
| M11-03 | Resend setup            | ⬜     | SPF + DKIM DNS records                              |
| M11-04 | Auth email templates    | ⬜     | Grant Pathway branding; warm tone; teal CTAs        |
| M11-05 | Upstash production      | ⬜     |                                                     |
| M11-06 | Anthropic spend limit   | ⬜     |                                                     |
| M11-07 | Sentry production       | ⬜     | EU region; SENTRY_DSN in Vercel                     |
| M11-08 | Production env vars     | ⬜     | All 8 variables in Vercel Production scope          |
| M11-09 | CRON_SECRET             | ⬜     | Confirm cron visible in Vercel dashboard            |
| M11-10 | Domain setup            | ⬜     | `grantpathway.org.uk` → Vercel; SSL                 |
| M11-11 | First production deploy | ⬜     |                                                     |
| M11-12 | Security headers check  | ⬜     | securityheaders.com                                 |
| M11-13 | Full manual test        | ⬜     | End-to-end five-step flow on production             |
| M11-14 | Lighthouse audit        | ⬜     | Target 95+ accessibility score                      |
| M11-15 | Screen reader test      | ⬜     | NVDA + Chrome                                       |
| M11-16 | Email flow test         | ⬜     | Verification, password reset, deletion confirmation |
| M11-17 | Charity Commission API  | ⬜     | Confirm accessible from Vercel production           |

---

## BRD Functional Requirement Coverage

All 44 BRD functional requirements accounted for. Use this to cross-check that no requirement has been dropped.

| FR    | Requirement Summary                                              | Milestone | Status |
| ----- | ---------------------------------------------------------------- | --------- | ------ |
| FR-01 | Register with full name, email, password                         | M1        | ⬜     |
| FR-02 | Validate email format; min 10 char password                      | M1        | ⬜     |
| FR-03 | Verification email; account inactive until confirmed             | M1        | ⬜     |
| FR-04 | Login with email and password                                    | M1        | ⬜     |
| FR-05 | Self-service password reset                                      | M1        | ⬜     |
| FR-06 | Auto logout after 60 min inactivity                              | M9        | ⬜     |
| FR-07 | Optional MFA (opt-in, not mandatory)                             | M1/M9     | ⬜     |
| FR-08 | Feedback interview consent at registration                       | M1        | ⬜     |
| FR-09 | Prompt for charity registration number after activation          | M2        | ⬜     |
| FR-10 | Charity Commission API pre-fill                                  | M2        | ⬜     |
| FR-11 | Manual entry fallback when API unavailable or not found          | M2        | ⬜     |
| FR-12 | Full charity profile fields (9 fields)                           | M2        | ⬜     |
| FR-13 | Update charity profile at any time                               | M2/M9     | ⬜     |
| FR-14 | Charity profile used as AI input                                 | M6/M7     | ⬜     |
| FR-15 | Create application with grant name, funder name, deadline        | M3/M4     | ⬜     |
| FR-16 | Dashboard shows all saved applications                           | M3        | ⬜     |
| FR-17 | Open and continue any saved application                          | M3        | ⬜     |
| FR-18 | Auto-save at regular intervals; manual save available            | M3/M7     | ⬜     |
| FR-19 | Delete a saved application                                       | M3        | ⬜     |
| FR-20 | Multiple saved applications per account                          | M3        | ⬜     |
| FR-21 | Input guidelines by paste or file upload (PDF/Word)              | M5        | ⬜     |
| FR-22 | Guidelines not permanently stored                                | M5        | ⬜     |
| FR-23 | Plain-language error for unsupported file format                 | M5        | ⬜     |
| FR-24 | AI summary covering 7 specified areas                            | M6        | ⬜     |
| FR-25 | Summary uses guidelines AND charity profile as inputs            | M6        | ⬜     |
| FR-26 | Visible progress indicator during AI processing                  | M6/M7     | ⬜     |
| FR-27 | Plain-language error on API failure; retry option                | M6        | ⬜     |
| FR-28 | AI generates draft answer for each question                      | M7        | ⬜     |
| FR-29 | User specifies word limit before generation                      | M7        | ⬜     |
| FR-30 | Draft uses question, word limit, funder summary, charity profile | M7        | ⬜     |
| FR-31 | Flag prominently if draft significantly exceeds word limit       | M7        | ⬜     |
| FR-32 | Three specific review prompts alongside each draft               | M7        | ⬜     |
| FR-33 | Explicit approval required; cannot be bypassed                   | M7        | ⬜     |
| FR-34 | User can edit draft text before approving                        | M7        | ⬜     |
| FR-35 | User can discard draft; regenerate or write own answer           | M7        | ⬜     |
| FR-36 | Approved content visually marked and saved                       | M7        | ⬜     |
| FR-37 | Export approved content as Word (.docx)                          | M8        | ⬜     |
| FR-38 | Export approved content as plain text (.txt)                     | M8        | ⬜     |
| FR-39 | Prevent export if no content approved                            | M8        | ⬜     |
| FR-40 | Account deletion from Account Settings                           | M9        | ⬜     |
| FR-41 | Warning before deletion explaining permanent loss                | M9        | ⬜     |
| FR-42 | Re-enter email address to confirm deletion                       | M9        | ⬜     |
| FR-43 | Permanently delete account, profile, applications, all content   | M9        | ⬜     |
| FR-44 | Confirmation email sent after deletion completes                 | M9        | ⬜     |

---

## Open Items & Blockers

| #     | Item                                      | Type           | Priority                  | Notes                                                                                                                                                                                                  |
| ----- | ----------------------------------------- | -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OI-01 | Anthropic DPA review and execution        | Legal          | High — pre-launch blocker | Start immediately; do not defer to launch week                                                                                                                                                         |
| OI-02 | Charity Commission API access             | Technical      | Medium                    | Verify endpoint is publicly accessible and stable (Assumption A1)                                                                                                                                      |
| OI-03 | Domain `grantpathway.org.uk` registration | Infrastructure | High                      | Required for Resend domain verification and production deployment                                                                                                                                      |
| OI-04 | Named successor organisation              | Governance     | Low                       | Required before launch (C18, DR-BM-002); informal only                                                                                                                                                 |
| OI-05 | Grant knowledge base decisions            | Strategy       | Deferred                  | DR-GK-001, DR-GK-002, DR-GK-003 deferred to post-launch                                                                                                                                                |
| OI-06 | **UNRESOLVED: Licence conflict**          | Decision       | High — pre-launch blocker | ADR-STACK-005 (proprietary/private) conflicts with DR-BM-003 (MIT/public). Owner must decide and update both documents. Repo treated as private until resolved. See plan Section 6 ADR Conflict Notes. |
| OI-07 | Viewport conflict — resolved by ADR       | Decision       | Resolved                  | BRD Section 10.5 (320px) overridden by ADR-ARCH-005 (1024px desktop-first). ADR takes precedence. Mobile is post-v1. No action required.                                                               |

---

## Notes

_Space for build session notes, decisions made during development, and any scope changes._

---

_Implementation Status — Grant Pathway v1.0_
_Last updated: 2026-04-26_
