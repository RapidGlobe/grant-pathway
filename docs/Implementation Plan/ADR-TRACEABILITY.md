# Grant Pathway — ADR Consequences Traceability

**Purpose:** Maps every ADR consequence to a specific implementation task. A gap in this table means a consequence has no covering task — it will not be implemented unless a task is added. This is the single place to see whether the full spec is covered.

**How to use:**
- Before starting any phase, scan for ⚠️ Gap rows. Every gap must be resolved (task added or N/A justified) before phase work begins.
- When a new task is added to cover a gap, update the Task column and change status to ✅ or 🔵.
- When a task is completed, no change needed here — the task status lives in IMPLEMENTATION-STATUS.md.

**Last updated:** 2026-05-20  
**Audit basis:** Full sweep of all 42 ADRs completed 2026-05-20 (pre-Phase 4 gate)

## Status key

| Symbol | Meaning |
|--------|---------|
| ✅ | Covered — mapped to a specific named task |
| ⚠️ | Gap — no task covers this; must be resolved before phase begins |
| 🔵 | Deferred — correctly planned for a later phase |
| ➖ | N/A — documentation reference, self-referential, or superseded by a PDR decision |

---

## AI Integration

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-AI-001 | AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=eu-west-2`) configured in all environments | P3.2 | ✅ |
| ADR-AI-001 | `@anthropic-ai/bedrock-sdk` used for Bedrock calls (not `@anthropic-ai/sdk`) | P2.1 deviation note | ✅ |
| ADR-AI-001 | Bedrock model identifier format used correctly (`anthropic.claude-sonnet-4-6`) | S5.1 (`MODEL` constant) | ✅ |
| ADR-AI-001 | Bedrock/AWS outages show appropriate error messages | S5.3 (`lib/ai-error-handler.ts`) | ✅ |
| ADR-AI-002 | `MODEL` constant stored in `lib/prompts.ts` as single source of truth | S5.1 | ✅ |
| ADR-AI-002 | Updating `MODEL` constant updates both generation tasks simultaneously | S5.1 (both S5.2 + S6.2 import from `lib/prompts.ts`) | ✅ |
| ADR-AI-003 | All AI API routes import prompt text from `lib/prompts.ts` — no prompt text in route files | S5.1, S5.2, S6.2 | ✅ |
| ADR-AI-003 | `lib/prompts.ts` should be well-commented to document the intent of each prompt section | S5.1 | ⚠️ GAP-01 |
| ADR-AI-004 | Step 4 API route parses JSON response from Claude to populate `application_answers` rows | S6.2 | ✅ |
| ADR-AI-004 | JSON parsing errors handled gracefully (one retry) | S6.2 | ✅ |
| ADR-AI-004 | Prompt functions accept typed parameters and return fully constructed prompt strings | S5.1 | ✅ |
| ADR-AI-004 | Few-shot examples added if initial quality shows inconsistent outputs | Post-Phase 4 quality tuning | 🔵 |
| ADR-AI-005 | AI API routes call Bedrock without streaming (batch mode) | S5.2, S6.2 | ✅ |
| ADR-AI-005 | Client awaits API route response with `fetch` | S5.2, S6.2 | ✅ |
| ADR-AI-005 | Progress bar advances on a timer independently of API response | P1.10, P1.11 | ✅ |
| ADR-AI-005 | Bar holds at ~90% if API is slow; snaps to 100% immediately if API returns early | S5.2, S6.2 | ⚠️ GAP-02 |
| ADR-AI-006 | Vercel Pro plan activated before production deployment | P5.4 | 🔵 |
| ADR-AI-006 | Only AI generation routes have `export const maxDuration = 90` | S5.2, S6.2 | ✅ |
| ADR-AI-006 | Monitoring alert configured if AI routes approach 90-second timeout | — | ⚠️ GAP-03 |
| ADR-AI-007 | Text extraction checks length before passing to AI (>100k tokens → large-doc warning) | S4.1 | ✅ |
| ADD-AI-007 | Hard truncation at sentence boundary | Superseded by D20 / PDR-AI-004 (soft warning only; no truncation) | ➖ |
| ADR-AI-007 | Advisory message shown (not error) when document is long | S4.1 (large-document warning flag) | ✅ |
| ADR-AI-008 | Every AI API route checks `ai_usage_log` count before calling Bedrock | S5.2, S6.2 | ✅ |
| ADR-AI-008 | Every successful AI response inserts a row into `ai_usage_log` | S5.2, S6.2 | ✅ |
| ADR-AI-008 | Dashboard shows current month's usage ("n of 20 AI requests used this month") | S2.1 | ✅ |
| ADR-AI-008 | RLS on `ai_usage_log`: INSERT + SELECT own rows; UPDATE + DELETE denied | P3.1 | ✅ |
| ADR-AI-008 | AWS Bedrock monthly spend cap configured | P3.10 | ✅ |
| ADR-AI-009 | Shared error handling wrapper created for all AI API routes | S5.3 (`lib/ai-error-handler.ts`) | ✅ |
| ADR-AI-009 | Consistent HTTP status codes and JSON error response shape documented and used by all AI routes | S5.3 | ⚠️ GAP-04 |
| ADR-AI-009 | Sentry tracks frequency and types of AI API errors | P3.7, S5.2 | ✅ |

---

## Architecture

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-ARCH-001 | App Router directory structure used (`app/`) | P0.5 | ✅ |
| ADR-ARCH-001 | Affects middleware, data fetching, and layout nesting | P3.4 (middleware), ADR-ARCH-002 (rendering) | ✅ |
| ADR-ARCH-001 | Server Actions in `actions/`; AI routes as explicit API routes | ADR-ARCH-003 | ✅ |
| ADR-ARCH-002 | Supabase data fetched server-side using `lib/supabase/server.ts` | P3.3 | ✅ |
| ADR-ARCH-002 | Loading states handled via Next.js `loading.tsx` / skeleton components | P1.15 | ✅ |
| ADR-ARCH-002 | Consistent with session-refresh middleware pattern | P3.4 | ✅ |
| ADR-ARCH-003 | AI generation routes are explicit API Routes with `maxDuration = 90` | S5.2, S6.2 | ✅ |
| ADR-ARCH-003 | Form submissions use Server Actions | `actions/` directory; S1.2 onwards | ✅ |
| ADR-ARCH-003 | Zod used for input validation on all API Routes and Server Actions | P0.3 (install); S1.2 onwards | ✅ |
| ADR-ARCH-004 | Each step is a separate route: `/applications/[id]/step/[n]` | P0.5 | ✅ |
| ADR-ARCH-004 | `applications.current_step` drives resume-flow redirect | P3.1 (schema); S2.3, S3.2 | ✅ |
| ADR-ARCH-004 | Guidelines text passed in POST body to AI routes (not from database) | S5.2 | ✅ |
| ADR-ARCH-004 | Step 4 auto-save debounced 300–500ms after typing stops | S6.3 | ✅ |
| ADR-ARCH-005 | Desktop-first design; Tailwind responsive utilities used | Phase 1 implementation | ✅ |
| ADR-ARCH-005 | Banner or graceful degradation shown on viewports below 768px | — | ⚠️ GAP-05 |

---

## Data and Schema

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-DATA-001 | RLS policies defined for all five tables | P3.1 | ✅ |
| ADR-DATA-001 | `applications.current_step` drives resume-flow logic | S2.3, S3.1/S3.2 | ✅ |
| ADR-DATA-001 | `ai_usage_log.created_at` used for monthly usage count | S2.1, S5.2 | ✅ |
| ADR-DATA-001 | Funder guidelines text intentionally absent from data model (ADR-DATA-002, ADR-FILE-004) | ADR-FILE-004 `sessionStorage` pattern | ✅ |
| ADR-DATA-002 | Navigating away from Step 2 requires re-upload | S4.1/S4.2 | ✅ |
| ADR-DATA-002 | Guidelines text passed in POST body; must not exceed 4.5MB Vercel limit | S4.1 (direct-to-Supabase upload bypasses Vercel) | ✅ |
| ADR-DATA-002 | UI makes clear guidelines are not saved; prompts re-upload when user returns without a summary | S4.1 | ⚠️ GAP-19 |
| ADR-DATA-003 | Account deletion cascades through all tables in correct FK order | S8.2 | ✅ |
| ADR-DATA-003 | Account deletion requires `DELETE` typed confirmation | P1.14, S8.2 | ✅ |
| ADR-DATA-003 | Supabase Auth user deletion uses service role key | S8.2 (API route with service role client) | ✅ |
| ADR-DATA-003 | GDPR-compliant privacy policy documents retention period | P5.1 | 🔵 |
| ADR-DATA-004 | `supabase/` directory with migrations added to repository | P3.1 | ✅ |
| ADR-DATA-004 | All schema changes via migration files — direct dashboard edits prohibited | P3.1 (process enforced) | ✅ |
| ADR-DATA-004 | `supabase/migrations/` committed to Git | P3.1 | ✅ |
| ADR-DATA-004 | `SUPABASE_DB_PASSWORD` stored securely; documented for CLI operations (`supabase db push`) | P3.12 | ✅ GAP-06 resolved |

---

## Export

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-EXPORT-001 | Word document generation library (`docx`) installed | P2.3 (spike) | ✅ |
| ADR-EXPORT-001 | `.docx` file generated programmatically using `docx` library | S7.2 | ✅ |
| ADR-EXPORT-001 | Exported file streamed to client as download response | S7.2 | ✅ |
| ADR-EXPORT-001 | Export route reads from `application_answers` — does not call Bedrock | S7.2 | ✅ |
| ADR-EXPORT-002 | `GET /api/export/[applicationId]` route created | S7.2 | ✅ |
| ADR-EXPORT-002 | Correct `Content-Type` and `Content-Disposition` headers set | S7.2 | ✅ |
| ADR-EXPORT-002 | Unanswered questions (null `answer_text`) handled gracefully in export | S7.2 | ⚠️ GAP-07 |

---

## File Handling

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-FILE-001 | Private Supabase Storage bucket (`guidelines-temp`) configured | P3.1 | ✅ |
| ADR-FILE-001 | File deleted from Storage immediately after text extraction (`try/finally`) | S4.1 | ✅ |
| ADR-FILE-001 | Storage access restricted to service role only (no public URLs) | P3.1 (RLS + private bucket) | ✅ |
| ADR-FILE-001 | Client-side upload progress shown during direct-to-Storage upload | P1.9, S4.1 | ✅ |
| ADR-FILE-002 | Client-side validation checks MIME type and file size before upload | P1.9 | ✅ |
| ADR-FILE-002 | Server-side re-validation of MIME type and file size in process route | P3.12 / S4.1 | ✅ GAP-08 resolved — `lib/file-validation.ts` created |
| ADR-FILE-003 | `lib/extract-text.ts` utility created (PDF via `unpdf`; Word via `mammoth`) | S4.1 | ✅ |
| ADR-FILE-003 | Extraction errors handled gracefully with user-friendly messages | S4.3 | ✅ |
| ADR-FILE-003 | Extracted text length checked; advisory shown if >100k tokens | S4.1 | ✅ |
| ADR-FILE-004 | `lib/guidelines-session.ts` utility created with `setGuidelines()`, `getGuidelines()`, `clearGuidelines()` | P3.12 | ✅ GAP-09 resolved |
| ADR-FILE-004 | Step 2 component checks `sessionStorage` on mount to restore previously extracted text | S4.1, S4.2 | ✅ |
| ADR-FILE-004 | Step 3 completion clears `sessionStorage` entry via `clearGuidelines()` | S5.2 / S5.4 | ✅ GAP-10 resolved — S5.2 spec updated in IMPLEMENTATION-PLAN.md |

---

## Operations

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-OPS-001 | Vercel Pro subscription activated before production deployment | P5.4 | 🔵 |
| ADR-OPS-001 | AI route files include `export const maxDuration = 90` | S5.2, S6.2 | ✅ |
| ADR-OPS-002 | Branch protection rule configured on `main` in GitHub | — | 🔴 GAP-11 BLOCKED — requires GitHub Pro for private repo; see IMPLEMENTATION-STATUS.md |
| ADR-OPS-002 | Production deployments tagged in Git for rollback reference | — | ⚠️ GAP-12 |
| ADR-OPS-002 | Database migrations applied before or alongside code deployment | P5.4 (pre-launch checklist) | ✅ |
| ADR-OPS-003 | Resend account created; sending domain verified (SPF + DKIM) | P3.8 | ✅ |
| ADR-OPS-003 | Supabase Auth email templates customised (verification + password reset) | P3.8 | ✅ |
| ADR-OPS-003 | SMTP credentials stored in Supabase dashboard (not in `.env` files) | P3.8 | ✅ |
| ADR-OPS-004 | Cron job routes authenticate using `CRON_SECRET` header | S4.4, S8.3 | ✅ |
| ADR-OPS-004 | Cron endpoints excluded from user-facing rate limiting | S4.4 | ⚠️ GAP-13 |
| ADR-OPS-005 | `@sentry/nextjs` installed | P3.7 | ✅ |
| ADR-OPS-005 | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` created with `beforeSend` PII scrubbing | P3.7 | ✅ |
| ADR-OPS-005 | `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` configured in all environments | P3.7 | ✅ |
| ADR-OPS-005 | Sentry EU data region selected | P3.7 | ✅ |
| ADR-OPS-006 | `@axe-core/react` installed as dev dependency; conditionally initialised in development mode | P3.12 | ✅ GAP-14 resolved — `components/axe-provider.tsx` wired into `app/layout.tsx` |
| ADR-OPS-006 | Lighthouse CI configured to run on each deployment (accessibility score ≥ 95) | — | ⚠️ GAP-15 |
| ADR-OPS-006 | Accessibility testing is part of the definition of done for each UI feature | — | ⚠️ GAP-16 |
| ADR-OPS-006 | Accessibility violations treated as bugs; fixed before release | P5.3 | ✅ |
| ADR-OPS-007 | `app/api/health/route.ts` created | P3.11 | ✅ |
| ADR-OPS-007 | `/api/health` added to public routes matcher in `proxy.ts` | P3.11 | ✅ |
| ADR-OPS-007 | UptimeRobot account created and monitor configured | P5.4 | 🔵 |

---

## Security

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-SEC-001 | `proxy.ts` maintained with session refresh, route protection, redirect rules | P3.4 | ✅ |
| ADR-SEC-001 | Public routes explicitly excluded from middleware | P3.4 | ✅ |
| ADR-SEC-001 | Supabase `@supabase/ssr` client used in middleware | P3.3 | ✅ |
| ADR-SEC-001 | Session refresh on every request; redirect responses carry refreshed cookies | P3.4 (cookie fix applied 2026-05-20) | ✅ |
| ADR-SEC-002 | RLS policies defined for all five tables in migration | P3.1 | ✅ |
| ADR-SEC-002 | Cross-user access tested as part of development process | P5.2 | ⚠️ GAP-17 |
| ADR-SEC-002 | Service role key stored as server-only environment variable | P3.2 | ✅ |
| ADR-SEC-003 | Client-side inactivity timer implemented (60-minute timeout) | S0.5 | ✅ |
| ADR-SEC-003 | Timeout warning modal designed and implemented | P1.1, S0.5 | ✅ |
| ADR-SEC-003 | Auto-save completes before session timeout fires | S6.3, S0.5 | ✅ |
| ADR-SEC-003 | Supabase Auth JWT expiry confirmed ≥ 60 minutes | P3.12 | ✅ GAP-18 resolved — local: config.toml `jwt_expiry = 3600`; prod: verified 2026-05-20 at 3600s (Project Settings → API → Legacy JWT Secret) |
| ADR-SEC-004 | All 6 HTTP security headers configured in `next.config.ts` | P3.5 | ✅ |
| ADR-SEC-004 | CSP tested against all pages post-deployment | P5.2 | 🔵 |
| ADR-SEC-005 | `ai_usage_log` count checked in all AI API routes before Bedrock call | S5.2, S6.2 | ✅ |
| ADR-SEC-005 | `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` configured | P3.6 | ✅ |
| ADR-SEC-006 | Server-only variables accessed only in server-side code | P3.2 (convention enforced) | ✅ |
| ADR-SEC-006 | `.env.example` committed with all required variable names | P3.2 | ✅ |

---

## Tech Stack

| ADR | Consequence | Task | Status |
|-----|-------------|------|--------|
| ADR-STACK-001 | Next.js App Router conventions followed throughout | P0.2, P0.5 | ✅ |
| ADR-STACK-001 | TypeScript strict mode enabled | P0.2 (create-next-app default) | ✅ |
| ADR-STACK-002 | RLS policies written and tested for every table | P3.1 | ✅ |
| ADR-STACK-002 | Database migrations managed via `supabase/migrations/` | P3.1, ADR-DATA-004 | ✅ |
| ADR-STACK-002 | Supabase JS client used in both server and client contexts | P3.3 | ✅ |
| ADR-STACK-003 | Supabase Auth email templates configured for Grant Pathway branding | P3.8 | ✅ |
| ADR-STACK-003 | `@supabase/ssr` middleware handles session refresh | P3.3, P3.4 | ✅ |
| ADR-STACK-004 | Vercel Pro plan activated before launch | P5.4 | 🔵 |
| ADR-STACK-004 | File uploads bypass Vercel 4.5MB limit via direct Supabase Storage upload | S4.1 | ✅ |
| ADR-STACK-004 | AI routes set `export const maxDuration = 90` | S5.2, S6.2 | ✅ |
| ADR-STACK-004 | Environment variables managed in Vercel dashboard | P3.2 | ✅ |
| ADR-STACK-005 | Branch protection rules configured on `main` in GitHub | — | 🔴 GAP-11 BLOCKED — requires GitHub Pro for private repo |
| ADR-STACK-005 | `.gitignore` excludes `.env.local` and credential files | P3.2 | ✅ |
| ADR-STACK-005 | Dependency licences reviewed for proprietary product compatibility | P5.1 | ⚠️ GAP-20 |
| ADR-STACK-006 | All form inputs, modals, dropdowns use shadcn/ui + Radix primitives | P0.3, Phase 1 | ✅ |
| ADR-STACK-006 | Custom components maintain ARIA roles and keyboard event handling | P5.3 (validated) | ✅ |
| ADR-STACK-006 | Tailwind CSS design tokens defined | P0.4 | ✅ |
| ADR-STACK-006 | `cn()` utility (clsx + tailwind-merge) used for conditional class composition | P0.3 (shadcn init) | ✅ |

---

## Gaps register

All ⚠️ rows consolidated here for easy triage. Update this table as gaps are resolved.

| Gap | ADR | Description | Priority | Resolution task | Resolved |
|-----|-----|-------------|----------|-----------------|---------|
| GAP-01 | ADR-AI-003 | `lib/prompts.ts` inline comments required | Low | Add to S5.1 | |
| GAP-02 | ADR-AI-005 | Progress bar: hold at ~90% if API slow; snap to 100% on early response | Medium | Add to S5.2, S6.2 | |
| GAP-03 | ADR-AI-006 | Sentry alert when AI routes approach 90-second timeout | Low | Add to P3.7 or S5.3 | |
| GAP-04 | ADR-AI-009 | No documented error response contract (JSON shape + HTTP codes) for AI routes | Medium | Add to S5.3 | |
| GAP-05 | ADR-ARCH-005 | Below-768px degradation banner not tasked | Low | Add new task or sub-task to Phase 4 | |
| GAP-06 | ADR-DATA-004 | `SUPABASE_DB_PASSWORD` not in `.env.example` or P3.2 | Medium | Update `.env.example` + P3.2 | ✅ 2026-05-20 P3.12 — `.env.example` updated |
| GAP-07 | ADR-EXPORT-002 | Null/empty `answer_text` handling in Word export not spec'd | Medium | Add to S7.2 | |
| GAP-08 | ADR-FILE-002 | Server-side re-validation of MIME type + file size in process route | High | Add to S4.1 | ✅ 2026-05-20 P3.12 — `lib/file-validation.ts` created; wire into S4.1 |
| GAP-09 | ADR-FILE-004 | `lib/guidelines-session.ts` utility never explicitly tasked | High | Add to S4.1 | ✅ 2026-05-20 P3.12 — `lib/guidelines-session.ts` created |
| GAP-10 | ADR-FILE-004 | `clearGuidelines()` on Step 3 completion never tasked | High | Add to S5.2 / S5.4 | ✅ 2026-05-20 P3.12 — S5.2 spec in IMPLEMENTATION-PLAN.md updated |
| GAP-11 | ADR-OPS-002, ADR-STACK-005 | GitHub branch protection rules on `main` never configured | Medium | Add to P0.1 or new task | 🔴 BLOCKED — GitHub branch protection requires GitHub Pro for private repos. Upgrade account at github.com/settings/billing or the rule cannot be enforced. Workaround: team enforces PR review manually. |
| GAP-12 | ADR-OPS-002 | Git release tagging for rollback never tasked | Low | Add to P5.4 per-release checklist | |
| GAP-13 | ADR-OPS-004 | Cron routes not explicitly documented as excluded from rate limiter | Low | Add to S4.4 | |
| GAP-14 | ADR-OPS-006 | `@axe-core/react` not installed or wired up in development mode | High | Add as infrastructure task | ✅ 2026-05-20 P3.12 — installed; `components/axe-provider.tsx` added; wired into `app/layout.tsx` |
| GAP-15 | ADR-OPS-006 | Lighthouse CI automation on each deployment not configured | Medium | Add new task | |
| GAP-16 | ADR-OPS-006 | Accessibility not part of definition of done for Phase 4 slices | Medium | Add to Phase 4 introduction | |
| GAP-17 | ADR-SEC-002 | RLS cross-user access test never tasked | Medium | Add to P5.2 | |
| GAP-18 | ADR-SEC-003 | Supabase Auth JWT expiry never confirmed ≥ 60 minutes | High | Add to P3.4 or new pre-Phase 4 task | ✅ 2026-05-20 P3.12 — local: `jwt_expiry = 3600` in config.toml; prod: manually verified 3600s (Project Settings → API → Legacy JWT Secret → Access token expiry time) |
| GAP-19 | ADR-DATA-002 | No UI message when user returns to Step 2 without `sessionStorage` entry | Medium | Add to S4.1 | |
| GAP-20 | ADR-STACK-005 | Dependency licence review not tasked | Low | Add to P5.1 | |

---

## Phase gate sign-off

Before each phase begins, this section must be completed by reviewing the gaps register.

| Gate | Date | Gaps reviewed | Outstanding gaps | Signed off by |
|------|------|---------------|-----------------|---------------|
| Phase 0 → Phase 1 | — | Not reviewed (gate added retrospectively) | GAP-11, GAP-14 existed | — |
| Phase 1 → Phase 2 | — | Not reviewed (gate added retrospectively) | — | — |
| Phase 2 → Phase 3 | — | Not reviewed (gate added retrospectively) | — | — |
| Phase 3 → Phase 4 | 2026-05-20 | All 20 gaps reviewed. GAP-06/08/09/10/14/18 resolved. GAP-11 blocked (GitHub Pro required — documented). GAP-01–05/07/12/13/15–17/19/20 deferred to natural Phase 4 touch-points. ADR-SEC-001–006 and ADR-DATA-001–004 reviewed by project owner. | GAP-11 (GitHub Pro), GAP-17 (P5.2 test), GAP-20 (P5.1 licence review) | ✅ Signed off — WJ, 2026-05-20 |
| Phase 4 → Phase 5 | | | | |
