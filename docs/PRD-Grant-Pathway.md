# Product Requirements Document

# Grant Pathway

---

## Document Control

| Field              | Detail                                            |
| ------------------ | ------------------------------------------------- |
| **Document title** | Product Requirements Document -- Grant Pathway v1 |
| **Version**        | 0.30 Draft                                        |
| **Status**         | Draft                                             |
| **Author**         | Rapidglobe Ltd                                    |
| **Date created**   | 2026-04-16                                        |
| **Last updated**   | 2026-07-13                                        |
| **Review date**    | Prior to development start                        |

### Revision History

| Version | Date       | Author         | Summary of Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-04-16 | Rapidglobe Ltd | Initial draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 0.2     | 2026-05-07 | Rapidglobe Ltd | AI delivery mechanism changed from Anthropic direct API to Amazon Bedrock Claude Sonnet 4.6 (eu-west-2). Model updated from claude-sonnet-4 to claude-sonnet-4-6. Compliance section updated: Anthropic DPA replaced by AWS DPA review. Privacy Policy disclosure updated. Sections 9.3, 10.1, 10.5, 15, and Appendix A updated for consistency.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.3     | 2026-07-10 | Rapidglobe Ltd | Full correction pass against `moscow-feature-register.md` (v1.10), screen requirements, data model, and the live implementation, following two months of drift since 0.2. Key corrections: launch date de-committed to match Section 1 (OBJ-01, Section 15); FR-02/12.4 password policy corrected to the actual 12-character, letters-and-digits, leaked-password-check policy (a live front-end/back-end inconsistency was found during this check -- see report); FR-07 (MFA) corrected to Won't Have throughout (demoted 2026-06-12); monthly AI limit corrected 20 → 50 (80% threshold 16 → 40) throughout; Section 6.6 rewritten for the charity-authored Q&A model (FR-28-31), replacing the abandoned auto-generation model; FR-45, FR-46, and FR-47 added as new Functional Requirements subsections (previously entirely missing); Section 6.7 extended to cover the per-question Step 4 approval flow alongside the existing Step 5 flow; FR-15 and Screen 7 Step 1 updated for the funder picker (DR-FD-001); Screen 7 Step 4 rewritten for the preparation checklist and per-question Q&A interface; Screen 7 Step 5 updated for the three-checkbox approval gate; Section 9.1 Entities table updated to include `funders`; Section 9.3/6.4 (FR-22) updated to reflect ADR-DATA-002's 2026-07-10 reversal, with a forward note pending Phase 6; Section 15 updated for AWS DPA, Terms of Service, and Privacy Policy status; Section 16 no longer hardcodes an FR count; Document Control and Appendix B document paths corrected from a stale `business/...` prefix to the actual `docs/...` locations, including two relocations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 0.4     | 2026-07-10 | Rapidglobe Ltd | Closed out the discrepancies 0.3 flagged but did not fix: Section 6.1's password front-end/back-end inconsistency is resolved (register/reset/account-settings forms now enforce 12 characters + letters and digits, matching the server-side policy; `actions/auth.ts` surfaces a specific `weak_password` state) -- Section 12.4 and Section 6.1 both updated accordingly. Section 10.2's `ai_usage_log.request_type` discrepancy resolved (`docs/data-model.md` now lists all five enum values including `refine_answer`); `buildDraftPrompt` confirmed genuinely dead code (zero callers), flagged as a separate follow-up cleanup rather than fixed here. Section 16's note on `acceptance-criteria.md` updated -- FR-45/46/47, the FR-29 priority fix, and the FR-31A numbering flag are now all in place there. Section 6.11 (FR-46) verification note upgraded from "could not be confirmed, appears likely not built" to "confirmed not built," now that `moscow-feature-register.md` and BRD v0.6 independently agree.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.5     | 2026-07-10 | Rapidglobe Ltd | Closed out the `buildDraftPrompt` follow-up flagged in 0.4: the dead function and its unused `ApplicationQuestion` type were removed from `lib/prompts.ts` along with the dedicated tests in `__tests__/prompts.test.ts`; confirmed zero remaining references, `tsc --noEmit`/lint/vitest all clean. Section 10.2 updated to record the removal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.6     | 2026-07-10 | Rapidglobe Ltd | Section 3 review surfaced a real gap: the guideline source-reference/citation feature ("Option 2"), blended into Phase 6 on 2026-07-10, had no FR, PDR, or ADR of its own -- Section 3.1 had no scope-list entry for a capability that gates launch. Formalised with new `PDR-DH-004` (design decision) and `ADR-DATA-007` (architecture, consolidating forward-notes already scattered across `ADR-FILE-003`/`ADR-AI-007`/`ADR-SEC-004`/`ADR-OPS-006`); added FR-48 to `moscow-feature-register.md` and acceptance criteria to `acceptance-criteria.md` Section 9.11; added Section 6.13 and a new Section 3.1 row here; Section 3.3 MoSCoW counts updated (43 -> 44 Must Have, 47 -> 48 total). Also fixed in passing: Section 3.3's footnote about the register's summary table being stale no longer applied (already corrected in the register's own v1.11 pass) -- removed; `moscow-feature-register.md`'s own FR-22 row had never been updated for `ADR-DATA-002`'s reversal (fixed elsewhere in this PRD and in `acceptance-criteria.md`, but missed in the register itself) -- now corrected there too; Section 6.4's FR-22 status note still said "21-document corpus" -- corrected to 23 documents / 14 funders, matching `ADR-DATA-002`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 0.7     | 2026-07-10 | Rapidglobe Ltd | Section 5 review found it predated the 2026-06-09/2026-06-10 nav and legal-page changes and was never updated -- corrected against the live `components/nav-public.tsx`/`nav-authenticated.tsx` and `docs/information-architecture-and-navigation.md` v1.7. Fixes: `/terms` and `/privacy` were entirely missing from the route tables (5.2) despite being live pages -- added, plus an access-control row (5.3) and page-title rows (5.7); 5.1's auth-aware-routing principle didn't note the legal-page exception -- added; 5.4 described a "Sign in" nav link that was removed 2026-06-09, and an unconditional Register link that is actually hidden on `/register`, `/verify-email`, and the legal pages -- both corrected; 5.6's footer didn't note the legal links open in a new tab (added 2026-06-10) -- added. 5.5 (authenticated nav) checked out accurate against `nav-authenticated.tsx`, no change needed. Also fixed the trailing document-status line, still reading "Version 0.3 Draft" since that section was introduced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 0.8     | 2026-07-10 | Rapidglobe Ltd | Section 6.1 review found FR-08 (feedback opt-in) confirmed built end-to-end (schema since `20260519000000_initial_schema.sql`, `register-form.tsx` -> `actions/auth.ts` -> `user_profiles.feedback_consent`, verified in the P5.5 checklist) -- corrected the "omitted if not built" hedge here, in `moscow-feature-register.md` (both its 9.1 row and Should Have build-conditions table), and in `screen-requirements.md`, none of which had ever been updated once the feature actually shipped. Rest of 6.1 (password policy, verification/reset flows, sign-in/reset error messages, MFA removal) verified accurate against live code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 0.9     | 2026-07-10 | Rapidglobe Ltd | Section 6.2 review found the "Charity profile fields" table missing five fields live since P6.1 (2026-07-05, `ADR-DATA-006` R13, migration `20260705000000`): total annual expenditure, reserves, trustees related, bank signatory count, bank signatories related -- confirmed against `charity-profile-form.tsx` and `data-model.md`. Added a "Governance and reserves" fields table here, matching the same fix in `screen-requirements.md` Screen 6 (also missing, Tier 1). Noted the fields are dev-only pending prod re-sync at P5.4, per the accepted schema-drift decision. `moscow-feature-register.md`'s FR-12 entry checked -- defers to `data-model.md` for the field list, which is already current, no fix needed there.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 0.10    | 2026-07-10 | Rapidglobe Ltd | Section 6.3 review: two small wording corrections against live code. The "funder isn't listed" link's quoted text didn't match the live wording in `application-step1-form.tsx` ("Can't find your funder? Request it to be added", a `mailto:` link) -- corrected. The auto-save note only mentioned the 60-second background save; `actions/applications.ts` confirms Step 4 answers are also saved via a 400ms-debounced save on typing pause -- added as the primary mechanism, with the 60-second save as a safety net. Verified accurate: the dashboard's "four status counts" (mismatch is a fifth status with its own pill but isn't in the summary strip count) and the absence of a deadline field.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 0.11    | 2026-07-10 | Rapidglobe Ltd | Section 6.4 review found all three file-error messages stale against the live `components/application-step2-form.tsx` -- the previous quotes matched `lib/file-validation.ts`'s simpler messages, not the richer copy the user actually sees (which suggests checking the funder's website and pasting key sections). Corrected all three, added the previously-undocumented generic "server" processing error, and matched the same fix into `screen-requirements.md` and `acceptance-criteria.md` (AC-FR-23-01/02/03). Deeper finding: traced the 200-page-cap and 30-second extraction-timeout cases through `lib/extract-text.ts` and the client's error mapping -- both fall through to the generic processing-error message, not the page-count/timeout-specific messages `screen-requirements.md` and `acceptance-criteria.md` (AC-FR-23-04/05) previously claimed. Corrected both documents; no test plans referenced the stale strings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.12    | 2026-07-10 | Rapidglobe Ltd | Section 6.5 review found a third Step 3 progress message ("Identifying key information...") missing from the staged-message list (`components/application-step3-summary.tsx`'s `LOADING_MESSAGES` has three stages, this doc and `screen-requirements.md`/`acceptance-criteria.md` (AC-FR-26-01) only listed two) -- added to all three. Also corrected "each application question explained in plain English" -- verified against the live summary schema and rendering: questions/sections are shown verbatim as extracted (with word limit where stated), not with an added plain-English explanation per question; that bullet overstated what's built. Separately flagged (not a doc fix): the AI extracts a `supportingDocuments` field on every summary call that is never rendered anywhere -- spun off as a product decision (display it, or stop extracting it).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 0.13    | 2026-07-10 | Rapidglobe Ltd | Section 6.6 review found four fabricated/stale message quotes, matched against `components/application-step4-draft.tsx` and `lib/ai-error-handler.ts`: the 80%/100% monthly-limit banners were misquoted (truncated and inventing a specific reset date + "get in touch" prompt that don't exist); the kill-switch's "temporarily unavailable" message doesn't exist -- it reuses the generic `overloaded` message, indistinguishable from real AI overload; the "we found N questions" note still referenced "generate your draft answers," a holdover from the abandoned auto-draft model; and the assembly description still claimed free-form funders get "a flowing narrative" distinct from structured funders' "Q&A list" -- both produce the same format, differing only by a number prefix (already corrected elsewhere in `acceptance-criteria.md`'s FR-31A section, missed here). Same four issues found and fixed in `screen-requirements.md` and `acceptance-criteria.md` (AC-FR-24-03, AC-FR-27-03/04, AC-FR-28-04/05/06) -- the kill-switch and monthly-limit message errors appeared in four and two places respectively across the two documents. Verified accurate: the preparation checklist's exact quoted copy (heading, message, all four checklist items, warning note, button text) and the per-question "Before you approve, check:" panel.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 0.14    | 2026-07-10 | Rapidglobe Ltd | Section 6.7 review: the three Step 5 confirmation checkboxes and the download-approves-in-one-action logic verified accurate against `components/application-step5-approve.tsx`. Found the re-opening prompt can actually be triggered from two places with slightly different wording (dashboard card vs. a re-open action on the Step 5 page itself, which omits "this application") -- this doc previously described only one. Corrected to note both. Noticed in passing while checking the download logic: a `txt` download format exists in code alongside `docx` -- to investigate in Section 6.8, since FR-38 (plain text export) is currently listed as "Should Have -- build if time permits."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 0.15    | 2026-07-10 | Rapidglobe Ltd | Section 6.8 review confirmed FR-38 (plain text export) is fully built and live (`app/api/export/[applicationId]/route.ts`'s `?format=txt`, a "Download as plain text (.txt)" button in `application-step5-approve.tsx`) -- the same pattern as FR-08: correctly Should Have priority, but the "build if time permits" / "these criteria apply only if implemented" hedges were stale. Corrected here, in `moscow-feature-register.md` (both its FR-38 row and Should Have build-conditions table), and in `acceptance-criteria.md`'s FR-38 intro. Also found and fixed the re-export warning message, which was misquoted in this doc, `screen-requirements.md`, and `acceptance-criteria.md` (AC-FR-37-05) -- the real dialog is titled "Download again?", has a no-date fallback case, and reads "if you intend to submit a revised version" rather than the more presumptive "to let them know a revised version is being submitted."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 0.16    | 2026-07-10 | Rapidglobe Ltd | Section 6.9 review found FR-44 (deletion confirmation email) is also fully built and live -- third instance of the FR-08/FR-38 pattern (Should Have, correctly prioritised, but described as conditional when it isn't). `app/api/account/delete/route.ts` sends the confirmation email via `lib/emails/account-deleted-user.ts` on every deletion; corrected the "if FR-44 is implemented" hedge here, in `moscow-feature-register.md` (FR-44 row + build-conditions table), `acceptance-criteria.md`'s FR-44 intro (which already contradicted its own Status table listing this section "Complete"), and `screen-requirements.md`. Also corrected the post-deletion message, which omitted its second sentence ("We've sent you a confirmation email.") in this doc and `screen-requirements.md`, confirmed against `components/sign-in-form.tsx`. Flagged separately (code, not a doc fix): the email's own code comment mislabels it "Email 2" instead of "Email 5" per `email-notifications.md`'s canonical numbering.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 0.17    | 2026-07-10 | Rapidglobe Ltd | Section 7 review found it largely duplicates Section 6's now-fixed content, but the duplicates hadn't been fixed here -- corrected 7 recurrences of already-confirmed issues (FR-08 hedge, funder-request link wording, FR-46 "not confirmed" phrasing, missing Step 3 progress stage, "generate your draft answers" phrasing, kill-switch message, monthly-limit messages, post-deletion message). Two new findings specific to this section: (1) Screens 10 and 11 (Terms of Service, Privacy Policy) were entirely missing -- this section stopped at Screen 9, never updated when the legal pages shipped 2026-06-10; added, matching `screen-requirements.md`. (2) The dashboard status-pill list and Screen 6's charity-profile fields both had the same gaps already found and fixed elsewhere (missing `mismatch`/"Ineligible" pill per `dashboard-populated.tsx`'s `STATUS_CONFIG`, and the missing P6.1 governance/reserves fields) -- fixed here too. Noted Section 8's status tables have the same missing-`mismatch` gap, to fix when reviewing that section next.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 0.18    | 2026-07-10 | Rapidglobe Ltd | Screen 5 dashboard empty-state explainer's Step 3 label, "Generate your draft," was stale in `components/dashboard-empty.tsx` and six other documents -- a leftover from the auto-generation model abandoned in the 2026-05-28 Step 4 redesign documented in Section 6.6. Relabelled to "Write your answers" (with description "You write every answer -- AI can help if you ask" where a description accompanies the label) in the component, this doc (Section 5), `screen-requirements.md`, `IMPLEMENTATION-PLAN.md`, `PDR-UI-005-dashboard-design.md`, `DDR-CS-006-empty-state.md`, `design-requirements.md`, and `Business Design/mockup.html`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 0.19    | 2026-07-10 | Rapidglobe Ltd | Section 8 (Application Status Model) review found the `mismatch` status (FR-47, added 2026-06-02) missing from every table in this section -- Statuses (8.1), Transition Rules (8.2), Deletion Confirmation Prompts (8.3), and Dashboard Status Colours (8.4) -- confirmed against `dashboard-populated.tsx`'s `STATUS_CONFIG` and `deleteModalText()`. Added throughout. Also corrected 8.4's "Not started" colour, misquoted as #1E293B when the live value is #64748B. Same gaps found and fixed in the canonical `docs/PRD inputs/application-status-model.md` (which predated FR-47 entirely, last updated 2026-04-16) and `screen-requirements.md`'s dashboard card spec -- both also had the same stale re-export warning message already fixed elsewhere, and `application-status-model.md`'s re-opening prompt had the same two-wording-variants gap already found in Section 6.7.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 0.20    | 2026-07-10 | Rapidglobe Ltd | Section 9 review found the same stale "21-document corpus" figure (Section 9.3) already corrected elsewhere -- fixed to 23 documents / 14 funders. Clarified FR-44's "Should Have" label in 9.4's retention table with a "confirmed built" pointer, consistent with Section 6.9. Entities (9.1), Relationships (9.2), and the retention event table otherwise verified accurate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.21    | 2026-07-10 | Rapidglobe Ltd | Section 10 (AI Integration) review found the kill-switch message stale again (10.6) -- same already-confirmed fabricated "temporarily unavailable" text, corrected to match `lib/ai-error-handler.ts`'s real generic `overloaded` message. Also found 10.6 claimed a "Try again" option on Step 4 per-question AI errors -- the live action is "Dismiss" (`application-step4-draft.tsx`), corrected. Verified accurate: 10.1's model settings, 10.4's large-document warning message (exact match), and 10.5's cost-control figures.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 0.22    | 2026-07-10 | Rapidglobe Ltd | Section 11 (Email Notifications) review found the Email 3, 4, and 5 body text stale here and in the canonical `docs/PRD inputs/email-notifications.md` (the true source of the drift) -- corrected against `lib/emails/inactivity-warning.ts`, `lib/emails/account-deleted-inactivity.ts`, and `lib/emails/account-deleted-user.ts`: Email 3's body previously invented a "Log in to Grant Pathway" CTA and different framing text; Email 4's and Email 5's "Register a new account" link label corrected to "Create a new account"; Email 5's body previously included a "Thank you for using Grant Pathway" closing line that doesn't exist live. `email-notifications.md`'s own Summary table and "Last updated" footer, still dated 2026-04-16, were also stale -- updated. The same "Register a new account" quote was also found and fixed in `acceptance-criteria.md` (AC-FR-44-02); no stale Email 3/4 body quotes found in `screen-requirements.md` or `acceptance-criteria.md` (neither quotes the inactivity-email bodies directly). Emails 1 and 2 (Supabase Auth defaults) are not independently verifiable against this repo's code and are noted as such.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 0.23    | 2026-07-10 | Rapidglobe Ltd | Reviewed Sections 12-16 and both appendices. Section 12.1's summarisation-performance targets were briefly (incorrectly) reframed from the established page-based NFR-01 tiers to a token-based one -- reverted after cross-checking `ADR-AI-010`, which confirms the page-based tiering is a deliberate, empirically-calibrated metric distinct from the unrelated 100,000-token "large document" warning in Section 10.4; no net change to this section. Sections 13 and 15 verified accurate, no changes. Section 14's own `docs/PRD inputs/success-metrics.md` was found stale in two places, missed by prior passes: a "20-request" monthly-limit figure never updated for the 2026-06-17 cap increase to 50, and an "Anthropic API dashboard" reference stale since the 2026-05-07 Bedrock migration (inconsistent with the same document's own Operational-metrics row, which already said Bedrock/AWS console) -- both corrected, "Last updated" bumped. The same stale-terminology pattern was traced further: `ADR-SEC-005` had matching stale "20"-based figures in Context/Options Considered (missed when its Decision section was fixed 2026-06-17) and stale "Anthropic API" references, both corrected; `PDR-AI-005`'s Decision heading still said "Anthropic dashboard" while its own Backstop/Rationale sections already said Bedrock/AWS console, corrected for internal consistency. Section 16 and Appendix A verified accurate; Appendix B's 14 document paths all confirmed to exist. Found and fixed the trailing "Document status" line at the very foot of this document, which had drifted to "Version 0.17 Draft" against the current 0.22 header -- the same class of bug Section 5's 0.7 review fixed once before, recurred since.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.24    | 2026-07-11 | Rapidglobe Ltd | File renamed from `PRD-Grant-Pathway-v1.md` to `PRD-Grant-Pathway.md`, `git mv` used, history preserved. Every other document in `docs/` carries no version number in its filename (version lives only in the internal Document Control table, as here), and the old `-v1` suffix conflated the document's own revision (this table) with the product's "Version 1" scope name in the title above -- confusing, per WJ. Updated all 10 cross-references across the repo (`moscow-feature-register.md`, `acceptance-criteria.md`, `email-notifications.md`, `IMPLEMENTATION-STATUS.md`, `CHANGELOG.md`, `IMPLEMENTATION-PLAN.md`, `ADR-DATA-001/002/003`, `ui-inventory-and-data-contracts.md`) to the new filename; historical version-bump references inside those entries (e.g. "bumped to v0.18") were left as accurate historical record. Also fixed a stale `business/` path prefix on the PRD row in `IMPLEMENTATION-PLAN.md`'s document-location table, missed when the same class of fix was made elsewhere in 0.3. No content change to this document beyond this table and the trailing status line.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 0.25    | 2026-07-11 | Rapidglobe Ltd | WJ spotted that the 0.22 and 0.23 rows (and the 0.24 row just added above) each sat behind a blank line, which splits a Markdown table into separate fragments -- those three rows were rendering as detached one-row tables below the real Revision History table rather than as part of it. Removed the stray blank lines and normalised column padding to match the rest of the table; no content change to any row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 0.26    | 2026-07-11 | Rapidglobe Ltd | Section 5.2 checked for alignment with `technology-stack.md` (no direct conflict -- the two docs cover different domains, and the one shared point, dynamic route syntax, is consistent with the documented Next.js App Router framework choice). While checking, found the legal-routes row's quoted source paths were stale: said "statically rendered from `docs/terms-of-service.md`" and "`docs/privacy-policy.md`", but the live route handlers (`app/(public)/terms/page.tsx`, `app/(public)/privacy/page.tsx`) actually read from `docs/legal/terms-of-service.md` and `docs/legal/privacy-policy.md` -- corrected both.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.27    | 2026-07-13 | Rapidglobe Ltd | Started a full section-by-section review against live code (in progress). Section 1: "16 PRD decision records" corrected to 20 (`docs/PRD decisions/` has 20 `PDR-*.md` files; `PRD-DECISIONS-INDEX.md` already correctly said "20 of 20"). Section 3.3: MoSCoW table hadn't been updated for FR-46's 2026-07-11 withdrawal -- Must Have corrected 44 -> 43, Won't Have corrected 1 -> 2 (FR-07 and FR-46), matching `docs/moscow-feature-register.md`'s current summary table. Section 6.11: rewritten to reflect FR-46's withdrawal (previously said the underlying product decision "remains open" and cited the deleted BRD Section 3.3; corrected to Won't Have (v1) -- Withdrawn, with the real rationale -- coverage level is not a stable per-funder property -- and a BD-07/Section 10 citation in place of the dangling one). Also: top-level document title "Grant Pathway -- Version 1" shortened to "Grant Pathway" (WJ: the "Version 1" was misleading against the Document Control version field). Sections 4 and 5 reviewed: Section 4 (personas) confirmed accurate against `docs/user-personas-journeys-and-use-cases.md`. Section 5.7's `/applications/...` page-title row corrected -- previously claimed a dynamic "[Grant name] -- [Funder name] -- Grant Pathway" title; the real title is a static name per step (never the grant/funder name), same finding as `acceptance-criteria.md`'s AC-FR-15-04. Section 6.1: email verification link expiry corrected 24 hours -> 1 hour, matching `supabase/config.toml`'s `otp_expiry = 3600` and `acceptance-criteria.md`'s AC-FR-03-01. Section 6.3: dashboard summary strip note corrected "four" -> "five" status counts, matching this same week's `mismatch`-tally fix (`components/dashboard-populated.tsx`). Section 6.4: FR-22 status note's "23-document corpus (14 funders)" reference de-hardcoded to point at `docs/Grant Org Guidelines/` without a maintained count, per WJ's steer that these counts will drift every time a funder is added; same treatment applied to `acceptance-criteria.md`'s equivalent FR-22 note (which was separately found to cite a stale "21-document" figure). `ADR-DATA-002`'s own count (23/14, with funders named) was deliberately left as-is -- it's a point-in-time historical record of what justified the 2026-07-10 reversal, not an ongoing claim. Also, while reviewing `ADR-DATA-002`, clarified that its 2026-07-10 reversal adopts a new **Option D** (extracted text in Postgres, lifecycle-tied retention) that matched none of the original Options A/B/C -- the record previously left this new option unnamed. Section 6.5: added a note on the previously-undocumented second-consecutive-failure state (different message, no Try again button -- see `acceptance-criteria.md`'s AC-FR-27-05). Cross-checking this section against `acceptance-criteria.md` also surfaced a real error there: AC-FR-24-02 claimed extracted questions are "explained in plain English" -- verified against `components/application-step3-summary.tsx` that questions are shown verbatim (`q.text` + `q.wordLimit`) with no separate explanation field; also added the missing "Grant amount" item and corrected "Key evidence expectations" to "Key requirements" to match `summary.amount`/`summary.keyRequirements`. Both documents corrected to match. |
| 0.28    | 2026-07-13 | Rapidglobe Ltd | Continuing the section-by-section review started in 0.27 (in progress, Section 6.6 onward). Section 6.6: "Budget question treatment" label text corrected -- previously quoted "This section requires your actual financial data -- do not use AI-generated figures", which doesn't exist; the real label (`components/application-step4-draft.tsx`) has two variants by funder type ("Budget questions/sections must be completed using your own figures..."), same wrong text already found and fixed in `acceptance-criteria.md`'s AC-FR-31-02. Also clarified assembly is gated by the same generic all-questions-approved check as any other question, not a budget-specific one. Section 6.7 confirmed accurate on the per-question and Step 5 approval mechanics (already correctly describing the real three checkboxes, unlike the old `acceptance-criteria.md` FR-32). One fix: the "Re-opening prompt" paragraph documented the dashboard/Step 5 wording mismatch as a still-open discrepancy (dated 2026-07-10); updated to reflect both dialogs were reconciled to identical wording this same week.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 0.29    | 2026-07-13 | Rapidglobe Ltd | Started Section 7 (Screen Specifications) of the ongoing review. Screen 1 (Sign In): confirmed accurate against `components/sign-in-form.tsx` -- all elements, validation messages, and error states matched exactly. Added a missing element: the "account deleted" confirmation banner shown via `?deleted=true`, previously undocumented on this screen despite being a real, distinct UI element. Screen 2 (Register): confirmed accurate in full against `components/register-form.tsx` and `actions/auth.ts`. Screen 3 (Verify Email): State 2 ("Verified") corrected -- previously described an auto-signed-in flow landing on the dashboard; the real, deliberate behaviour (D-012 follow-on) signs the user out and routes to a clean sign-in page ("Sign in to get started" / "Sign in" -> `/`, not "Go to my dashboard" -> `/dashboard`). Screen 4 (Forgot Password): expired-link message corrected -- previously quoted "This reset link has expired. Please request a new one."; the real message (`components/reset-password-form.tsx`) is "Your reset link is no longer valid. Please request a new one." Same wrong quote found and fixed in `acceptance-criteria.md`'s AC-FR-05-06, missed during last week's review. Screen 5 (Dashboard): three findings, all tracing to this week's dashboard changes not being propagated here -- summary strip corrected "four" -> "five" status counts (omitted ineligible); the status-label row's own note ("not included in the... summary strip") was self-contradictory now that ineligible is counted; "View" button reference renamed to "Re-open". Also, while checking the "Last updated [DD Month YYYY]" format, found the dashboard and Step 5 (`components/dashboard-populated.tsx`, `components/application-step5-approve.tsx`) both used unpadded days (e.g. "3 July 2026") while the exported document (`app/api/export/[applicationId]/route.ts`) zero-pads (e.g. "03 July 2026") -- made all three consistent by zero-padding the two UI-side formatters to match the export route, per WJ's direction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 0.30    | 2026-07-13 | Rapidglobe Ltd | Screen 6 (Charity Profile) reviewed against `components/charity-profile-form.tsx`. Four findings, all fixed: (1) the Fields table's "Placeholder" column quoted text (e.g. "e.g. We support elderly people living alone...") that isn't actually a placeholder attribute in code -- the real UI shows hint text below each field, with different wording, and swaps to a shorter "Drafted from your Charity Commission entry -- edit to personalise" hint when the field was AI-paraphrased from a lookup match; column relabelled "Hint text shown below the field" and all three quotes corrected. (2) The "API unavailable" lookup message was abbreviated/wrong -- corrected to the real longer message which points back to the "Look up charity" button. (3) A second lookup-outcome banner (AI-paraphrase-succeeded) was entirely undocumented -- added as its own row. (4) The "Edit save" post-save behaviour was wrong -- previously claimed a "Your changes have been saved." message with the user staying on `/profile`; the real behaviour (`router.push('/dashboard')` on successful edit save) redirects straight to the dashboard with no confirmation message shown at all.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Related Documents

| Document                              | Location                                                |
| ------------------------------------- | ------------------------------------------------------- |
| Business Requirements Document        | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md` |
| MoSCoW Feature Register               | `docs/moscow-feature-register.md`                       |
| Screen Requirements                   | `docs/PRD inputs/screen-requirements.md`                |
| Acceptance Criteria                   | `docs/PRD inputs/acceptance-criteria.md`                |
| Application Status Model              | `docs/PRD inputs/application-status-model.md`           |
| Email Notifications                   | `docs/PRD inputs/email-notifications.md`                |
| Success Metrics                       | `docs/PRD inputs/success-metrics.md`                    |
| Information Architecture & Navigation | `docs/information-architecture-and-navigation.md`       |
| Data Model                            | `docs/data-model.md`                                    |
| Non-Functional Requirements           | `docs/non-functional-requirements.md`                   |
| PRD Decisions Index                   | `docs/PRD decisions/PRD-DECISIONS-INDEX.md`             |
| User Personas, Journeys & Use Cases   | `docs/user-personas-journeys-and-use-cases.md`          |

**Note:** The Business Requirements Document was previously filed as `BRD-Grant-Pathway-v0.5.md`, then renamed to `BRD-Grant-Pathway-v0.6.md` on 2026-07-10 to match its then-current internal Version header -- which promptly drifted again as the document kept being revised (it reached Version 0.48 within a month). Renamed a second time, 2026-07-12, to drop the version number from the filename entirely (`BRD-Grant-Pathway.md`), since the doc's own internal Version field is the single source of truth and a filename tied to a point-in-time version number will always eventually mismatch it.

---

## 1. Executive Summary

Grant Pathway is a free, AI-assisted grant writing tool for UK charities. It reduces the time, effort, and expertise required to write a strong grant application -- enabling volunteers and non-specialist staff to produce clearer, more consistent applications without professional fundraising support.

This Product Requirements Document defines exactly what must be built for the v1 release: what the product does, how each screen behaves, what data is stored, how the AI integration works, and the standards the product must meet. It is the primary reference for development.

The document synthesises requirements from the Business Requirements Document, 20 PRD decision records, and 5 PRD input documents. Where this document and any source document differ, this PRD takes precedence. Known divergences from the BRD are documented in the MoSCoW Feature Register.

**Target launch date: not committed (revised 2026-07-05; was 31 July 2026).** Launch now requires Phase 6 (`ADR-DATA-006`, the application item-graph rearchitecture) to complete — see the Phase 6 → Go-Live Gate in `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`. Working estimate: August–September 2026.

---

## 2. Product Vision & Objectives

### 2.1 Vision Statement

> To be the trusted, free preparation tool for UK charities -- helping non-specialists produce stronger, more consistent grant applications through AI-assisted writing, plain-English guideline summarisation, and mandatory human review.
>
> _Corrected 2026-07-10: this PRD's own quote had drifted from the canonical `docs/vision-statement.md` -- an earlier pass here paraphrased it as "writing companion... charity-authored writing with on-request AI assistance" instead of quoting the source verbatim. `docs/vision-statement.md` (Tier 3) already carries the correct, current wording (revised 2026-05-29, replacing "AI-powered drafting" with "AI-assisted writing" for the same reason -- AI generating content was abandoned). Restored to an exact quote of the canonical text; no change made to `docs/vision-statement.md` itself._

### 2.2 Objectives for v1

| Ref    | Objective                                                                                                                               | Measure                                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| OBJ-01 | Launch a stable, accessible web application (target launch date not committed; working estimate August-September 2026 -- see Section 1) | Live deployment once Phase 6 (`ADR-DATA-006`) completes and the Go-Live Gate is passed |
| OBJ-02 | Enable any UK charity to register and complete an application within a single session                                                   | Confirmed through user testing                                                         |
| OBJ-03 | Reduce the time a non-specialist spends writing a grant application                                                                     | Evidenced through user feedback interviews                                             |
| OBJ-04 | Achieve WCAG 2.2 Level AA accessibility from day one                                                                                    | Internal testing and checklist review pre-launch                                       |
| OBJ-05 | Operate within a monthly running cost of £100                                                                                           | Monthly cost monitoring                                                                |
| OBJ-06 | Gather sufficient early user feedback to inform v2 planning                                                                             | Feedback interviews with opted-in users post-launch                                    |

---

## 3. Scope & Feature Priorities

### 3.1 In Scope for v1

| #   | Capability                                                                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | User registration, email verification, login, and account management                                                                                                                                                                                           |
| 2   | Charity profile creation with Charity Commission API lookup                                                                                                                                                                                                    |
| 3   | Grant application creation, editing, saving, deletion, and export                                                                                                                                                                                              |
| 4   | Funder guideline input by paste or file upload                                                                                                                                                                                                                 |
| 5   | AI-powered plain-English summarisation of funder guidelines                                                                                                                                                                                                    |
| 6   | Charity-authored Q&A writing interface, with on-request AI assist to improve structure and clarity (revised 2026-05-28 -- see Section 6.6)                                                                                                                     |
| 7   | Mandatory human review and approval before any content can be exported, at both per-question (Step 4) and application level (Step 5)                                                                                                                           |
| 8   | Export of approved content to Word (.docx)                                                                                                                                                                                                                     |
| 9   | Full account and data deletion by the user                                                                                                                                                                                                                     |
| 10  | WCAG 2.2 Level AA accessibility                                                                                                                                                                                                                                |
| 11  | UK-region data hosting                                                                                                                                                                                                                                         |
| 12  | Basic passive usage metrics via database records                                                                                                                                                                                                               |
| 13  | Guideline source-reference: citations from AI summary bullets/questions to the specific guideline page/section, with a "view original guidelines" panel (FR-48, added 2026-07-10 -- see `PDR-DH-004`, `ADR-DATA-007`; gates launch via Phase 6, not yet built) |

### 3.2 Out of Scope for v1

Grant discovery, eligibility matching, grant tracking, post-grant reporting, EU/international grants, live grant databases, CRM integrations, open-ended AI chat, native mobile application, multi-region hosting, and formal survey infrastructure are all explicitly out of scope. Full detail in `docs/v1-out-of-scope.md`.

### 3.3 MoSCoW Feature Priorities

| Priority        | Count | Functional requirements                                                                                    |
| --------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| Must Have       | 43    | FR-01 to FR-06, FR-09 to FR-31, FR-32 to FR-37, FR-39 to FR-43, FR-45, FR-47 to FR-48                      |
| Should Have     | 3     | FR-08, FR-38, FR-44                                                                                        |
| Could Have      | 0     | --                                                                                                         |
| Won't Have (v1) | 2     | FR-07 -- demoted from Should Have 2026-06-12; FR-46 -- withdrawn 2026-07-11. See `docs/v1-out-of-scope.md` |

_48 functional requirements are defined in total (FR-01 to FR-48; no gaps in the numbering). Counts corrected against `docs/moscow-feature-register.md`'s current summary table (Must Have 43, Won't Have 2), which records FR-46's 2026-07-11 withdrawal -- see Section 9.6/FR-46 for the withdrawal rationale (coverage level is not a stable per-funder property). This table previously still counted FR-46 as Must Have and listed only FR-07 under Won't Have, corrected 2026-07-13. FR-48 (guideline source-reference/citations, "Option 2") added 2026-07-10 -- see `PDR-DH-004` and `ADR-DATA-007`; blended into Phase 6, not yet built._

FR-29 (word/character limits displayed per question) and FR-31 (budget-question flagging) were both promoted from Should Have to Must Have on 2026-05-28, once the charity-authored Q&A model made them integral to Step 4 rather than optional extras -- see Section 6.6. FR-45 and FR-47 were added later (2026-05-29 and 2026-06-02) and remain Must Have from introduction; FR-46 was added at the same time but was withdrawn 2026-07-11 (see the table above and Section 6.11). FR-48 was added later still (2026-07-10) and is Must Have from introduction. The three remaining Should Have requirements and their build conditions:

| Ref   | Requirement                     | Build condition                                                            |
| ----- | ------------------------------- | -------------------------------------------------------------------------- |
| FR-08 | Feedback opt-in at registration | Build if feedback interview programme confirmed at launch                  |
| FR-38 | Plain text (.txt) export        | **Confirmed built** (2026-07-10) -- no longer conditional, see Section 6.8 |
| FR-44 | Deletion confirmation email     | Build if transactional email confirmed in scope                            |

**FR-07 (optional MFA) -- Won't Have, demoted 2026-06-12.** Originally Should Have. A risk analysis found the worst-case impact of a password compromise is limited to viewing draft applications and charity profile data (all publicly registered information) -- there is no payment data and no submission capability -- so the mandatory friction MFA would add for non-technical volunteer users was judged to outweigh the marginal security benefit. See `docs/moscow-feature-register.md` Section 9.1 for the full reasoning.

---

## 4. User Personas

Two primary personas are defined for v1. Both are volunteers or non-specialist staff at small or mid-size UK charities with no dedicated fundraising resource.

### 4.1 Margaret -- Volunteer Grant Writer

| Field                 | Detail                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Role                  | Volunteer, 1-2 days per week                                                                                   |
| Charity               | Small community wellbeing charity, under £100k income                                                          |
| Location              | Market town, North of England                                                                                  |
| Technical environment | Personal Windows laptop, Google Chrome, no prior AI experience                                                 |
| Pain points           | Starts from scratch every time; confused by funder jargon; each application takes 2-3 days                     |
| Goals                 | Submit more applications in less time; build reusable content; feel confident the output is funder-appropriate |

### 4.2 David -- Overloaded Charity Manager

| Field                 | Detail                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Role                  | Charity Manager / Operations Manager                                                                                |
| Charity               | Youth services charity, £250k-£600k income                                                                          |
| Location              | Urban, Midlands                                                                                                     |
| Technical environment | Work Windows laptop, Chrome and Edge, has used ChatGPT                                                              |
| Pain points           | Adapts same content repeatedly for different funders; inconsistency across applications; no time to improve quality |
| Goals                 | Reduce time per application; achieve consistent language; submit stronger applications                              |

The product is designed for Margaret and David. A third persona (Priya -- a less experienced part-time administrator) should not be excluded but is not the primary design target for v1.

---

## 5. Information Architecture & Navigation

### 5.1 Design Principles

| Principle                | Application                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal navigation       | Three primary nav items plus an account dropdown. Non-technical users should never feel lost                                                         |
| Auth-aware routing       | Every route is either public-only or authenticated-only, with one exception: the legal pages (`/terms`, `/privacy`) are accessible in any auth state |
| Focused application flow | The five-step journey lives within a single route. Steps are not separate nav pages                                                                  |
| Predictable redirects    | Authenticated users on public pages redirect to `/dashboard`. Unauthenticated users on protected pages redirect to `/`                               |
| No dead ends             | Every error state and confirmation page provides a clear next action                                                                                 |

### 5.2 Route Structure

**Public routes (unauthenticated only)**

| URL                | Page              | Purpose                                                 |
| ------------------ | ----------------- | ------------------------------------------------------- |
| `/`                | Sign In / Landing | Sign-in form; entry point for returning users           |
| `/register`        | Register          | New account creation                                    |
| `/verify-email`    | Verify Email      | Post-registration email confirmation (3 states)         |
| `/forgot-password` | Forgot Password   | Password reset request and new password form (2 states) |

**Authenticated routes (logged-in users only)**

| URL                  | Page             | Purpose                                              |
| -------------------- | ---------------- | ---------------------------------------------------- |
| `/dashboard`         | My Applications  | View all saved applications; start new application   |
| `/applications/new`  | New Application  | Step 1 of application flow (new application)         |
| `/applications/[id]` | Application      | Steps 1-5 of application flow (existing application) |
| `/profile`           | Charity Profile  | View, create, and edit charity profile               |
| `/account`           | Account Settings | Change password; access account deletion             |
| `/account/delete`    | Delete Account   | Deletion confirmation screen                         |

**Legal routes (accessible in any auth state) -- added 2026-06-10**

| URL        | Page             | Purpose                                                                          |
| ---------- | ---------------- | -------------------------------------------------------------------------------- |
| `/terms`   | Terms of Service | Full Terms of Service, statically rendered from `docs/legal/terms-of-service.md` |
| `/privacy` | Privacy Policy   | Full Privacy Policy, statically rendered from `docs/legal/privacy-policy.md`     |

### 5.3 Access Control & Redirects

| Scenario                                                        | Behaviour                                         |
| --------------------------------------------------------------- | ------------------------------------------------- |
| Authenticated user visits a public route                        | Redirected to `/dashboard`                        |
| Unauthenticated user visits an authenticated route              | Redirected to `/`                                 |
| User visits `/applications/[id]` for another user's application | Redirected to `/dashboard`                        |
| Session expires while on a protected page                       | Redirected to `/` on next interaction             |
| Any user (signed in or not) visits `/terms` or `/privacy`       | Page is shown -- legal pages are never redirected |

### 5.4 Navigation Bar -- Unauthenticated

**Corrected 2026-07-10 -- this section was stale, describing the nav bar as it existed before the 2026-06-09/2026-06-10 changes; corrected to match the live `components/nav-public.tsx` and `docs/information-architecture-and-navigation.md` v1.7.**

Displayed on all public routes (`/`, `/register`, `/verify-email`, `/forgot-password`) and on the legal pages (`/terms`, `/privacy`).

| Element                   | Behaviour                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Grant Pathway logo (left) | Links to `/` -- gives pages reached directly (e.g. `/terms` from a search result) a route back; signed-in users redirected to `/dashboard` |
| Register -- it's free     | Links to `/register`; hidden on `/register` (circular), `/verify-email` (user has just registered), and the legal pages (out of context)   |

**No standalone "Sign in" nav link exists** -- it was removed 2026-06-09; every public-facing form already carries a contextual sign-in link.

### 5.5 Navigation Bar -- Authenticated

Displayed on all authenticated routes.

| Element                                  | Behaviour                                          |
| ---------------------------------------- | -------------------------------------------------- |
| Grant Pathway logo (left)                | Links to `/dashboard`                              |
| My Applications                          | Links to `/dashboard`                              |
| Charity Profile                          | Links to `/profile`                                |
| Account (right, shows user's first name) | Dropdown: Account Settings (`/account`) / Sign Out |

### 5.6 Global Footer

Displayed on all routes.

| Element          | Detail                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Tagline          | "Your free grant writing companion for UK charities"                                                                   |
| Privacy Policy   | Links to `/privacy` -- opens in a new tab so the user never loses a form or in-progress application (added 2026-06-10) |
| Terms of Service | Links to `/terms` -- opens in a new tab, same reason (added 2026-06-10)                                                |
| Copyright        | (c) RapidGlobe Ltd [current year]                                                                                      |

### 5.7 Page Titles

**Corrected 2026-07-13** -- the `/applications/...` row previously claimed a dynamic title built from the grant and funder name. Verified against each step page's `metadata.title` (`app/(authenticated)/applications/[id]/step/*/page.tsx`) and `app/layout.tsx`'s title template (`'%s — Grant Pathway'`): the title is a static name per step, never the grant or funder name. Same finding as `acceptance-criteria.md`'s AC-FR-15-04.

| Page                                        | Browser tab title                                                                                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                         | Sign in -- Grant Pathway                                                                                                                                                                                   |
| `/register`                                 | Register -- Grant Pathway                                                                                                                                                                                  |
| `/verify-email`                             | Verify your email -- Grant Pathway                                                                                                                                                                         |
| `/forgot-password`                          | Reset your password -- Grant Pathway                                                                                                                                                                       |
| `/dashboard`                                | My Applications -- Grant Pathway                                                                                                                                                                           |
| `/applications/new` or `/applications/[id]` | Static per step (never the grant/funder name): "Application Details" (Step 1), "Upload Guidelines" (Step 2), "AI Summary" (Step 3), "Draft Answers" (Step 4), "Approve & Export" (Step 5) -- Grant Pathway |
| `/profile`                                  | Charity Profile -- Grant Pathway                                                                                                                                                                           |
| `/account`                                  | Account Settings -- Grant Pathway                                                                                                                                                                          |
| `/account/delete`                           | Delete Account -- Grant Pathway                                                                                                                                                                            |
| `/terms`                                    | Terms of Service -- Grant Pathway                                                                                                                                                                          |
| `/privacy`                                  | Privacy Policy -- Grant Pathway                                                                                                                                                                            |

---

## 6. Functional Requirements

Requirements are grouped by the nine functional areas defined in the BRD. Each requirement states its MoSCoW priority. Should Have requirements are only built if their stated build condition is met.

Full testable acceptance criteria for all requirements are in `docs/PRD inputs/acceptance-criteria.md`.

---

### 6.1 Authentication & Accounts

| Ref   | Requirement                                                                                                                                                                                          | Priority                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR-01 | The system shall allow new users to register with their full name, email address, and a password                                                                                                     | Must Have                                           |
| FR-02 | The system shall validate email format and enforce a minimum password length of 12 characters, containing both letters and digits, at registration                                                   | Must Have                                           |
| FR-03 | The system shall send a verification email upon registration; accounts shall not be activated until the email link is clicked                                                                        | Must Have                                           |
| FR-04 | The system shall allow registered users to log in with their email address and password                                                                                                              | Must Have                                           |
| FR-05 | The system shall provide a self-service password reset flow triggered by email                                                                                                                       | Must Have                                           |
| FR-06 | The system shall automatically log out users after 60 minutes of inactivity                                                                                                                          | Must Have                                           |
| FR-07 | ~~The system shall provide optional MFA as an opt-in feature; MFA shall not be mandatory in v1~~ -- **Won't Have.** Demoted 2026-06-12; see implementation note below                                | Won't Have                                          |
| FR-08 | During registration, the system shall present a plain-language prompt asking the user if they are willing to participate in a feedback interview; the response shall be recorded against the account | Should Have -- **confirmed built** (see note below) |

**Implementation notes:**

- **Password policy (updated 2026-06-29, VQ-009):** minimum 12 characters, must contain both letters and digits; leaked-password check enabled (checked against the HaveIBeenPwned database); secure password change enabled; current password required to change password. This replaces the original 10-character-minimum, no-complexity policy, which followed pure NCSC minimalism -- see Appendix A for the updated NCSC glossary note. This is configured at the Supabase Auth project level and applies uniformly to registration, password reset, and password change.
  - **Discrepancy resolved 2026-07-10:** the client-side validation and hint text in `components/register-form.tsx`, `components/reset-password-form.tsx`, and `components/account-settings-form.tsx` previously still enforced and displayed a 10-character minimum, uniformly across all three forms. This has been corrected in code — all three forms now validate 12 characters plus letters and digits client-side, matching Supabase Auth's server-side policy, and `actions/auth.ts` now surfaces a specific `weak_password` state (rather than a generic error) if the server-side check ever rejects a password the client-side check let through.
- **FR-07 (MFA) -- Won't Have, demoted 2026-06-12.** MFA was fully removed from the codebase (`/mfa` route, enrolment/verification actions, and the Account Settings MFA section all deleted). See Section 3.3 for the reasoning.
- Email verification link expires after 1 hour (corrected 2026-07-13 -- previously said 24 hours; `supabase/config.toml`'s `otp_expiry = 3600` is explicitly commented "defaults to 1 hour", matching `acceptance-criteria.md`'s AC-FR-03-01). Resend is rate-limited to 3 per hour
- Password reset link expires after 1 hour
- Sign-in errors must never confirm whether an email address is registered (same message for wrong password and unknown email)
- Password reset requests must never confirm whether an email address is registered (same message regardless)
- **FR-08 status corrected 2026-07-10:** this bullet previously read "FR-08 opt-in checkbox is omitted entirely from the registration screen if FR-08 is not built" -- FR-08 is not hypothetical. It has been built since the initial schema (`supabase/migrations/20260519000000_initial_schema.sql`) and is wired end-to-end: the checkbox is live in `components/register-form.tsx`, `actions/auth.ts`'s `registerUser()` reads it and writes `feedback_consent` to `user_profiles`, and verifying it (checked and unchecked) is an explicit item in the P5.5 pre-launch checklist. `docs/moscow-feature-register.md` and `docs/PRD inputs/screen-requirements.md` both carried the same stale "omit if not built" hedge -- corrected there too.

---

### 6.2 Charity Profile

| Ref   | Requirement                                                                                                                                               | Priority  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-09 | Following account activation, the system shall prompt the user to set up their charity profile                                                            | Must Have |
| FR-10 | The system shall query the Charity Commission for England and Wales public API and pre-fill charity details on a successful match                         | Must Have |
| FR-11 | Where the Charity Commission API is unavailable or the charity is not found, the system shall allow manual entry and display a plain-language explanation | Must Have |
| FR-12 | The charity profile shall include the defined set of fields                                                                                               | Must Have |
| FR-13 | The system shall allow users to update their charity profile at any time                                                                                  | Must Have |
| FR-14 | The charity profile shall be used as an input to all AI-generated content                                                                                 | Must Have |

**Charity profile fields:**

| Field                   | Label shown to user           | Required | Notes                                           |
| ----------------------- | ----------------------------- | -------- | ----------------------------------------------- |
| Charity name            | "Charity name"                | Yes      | Pre-populated on Charity Commission match       |
| Registration number     | "Charity registration number" | No       | Optional; may be blank for exempt charities     |
| What the charity does   | "What does your charity do?"  | Yes      | Combines charitable objects and main activities |
| Who the charity helps   | "Who does your charity help?" | Yes      | Beneficiary description                         |
| Where the charity works | "Where do you work?"          | Yes      | Geographic area of operation                    |

**Governance and reserves fields (added 2026-07-10 -- this table was missing five fields live since P6.1, `ADR-DATA-006` R13, migration `20260705000000`):**

| Field                    | Label shown to user                                                                  | Required | Notes                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| Total annual expenditure | "Total annual expenditure (£)"                                                       | No       | From latest signed accounts                                                                                         |
| Reserves                 | "Reserves (£)"                                                                       | No       | Unrestricted/free reserves; combined with expenditure to show "approximately N months of reserves" live in the form |
| Trustees related         | "Are any of your trustees related to each other by family or business relationship?" | No       | Dropdown: Not sure yet / No / Yes                                                                                   |
| Bank signatory count     | "How many people are authorised as bank signatories?"                                | No       | Number input                                                                                                        |
| Bank signatories related | "Are any bank signatories related to each other or to a trustee?"                    | No       | Dropdown: Not sure yet / No / Yes                                                                                   |

All five fields are optional and grouped under a "Governance and reserves" section, added to support eligibility checks found in funder guidance (Walton Charity, MK Community Foundation) that depend on governance facts the original field set didn't capture. **Note:** per the schema-drift decision, this migration is applied to `grant-pathway-dev` but not yet to `grant-pathway-prod` -- accepted, not a defect (production re-sync scheduled for P5.4).

**Implementation notes:**

- The dashboard shows a profile incomplete banner whenever the profile has not been fully saved. The banner is shown whether the profile has never been started or has been partially completed
- The "Start your first application" button on the dashboard is disabled until the charity profile is fully saved
- On first save, a success message is shown on the profile page. The user is not automatically redirected
- Annual income band was considered and removed from the field set
- Charitable objects and main activities have been merged into the single "What does your charity do?" field

---

### 6.3 Application Management

| Ref   | Requirement                                                                                                                                                                                    | Priority  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-15 | The system shall allow a user to create a new grant application by selecting a funder from a searchable, curated picker (seeded from the `funders` database table) and entering the grant name | Must Have |
| FR-16 | The system shall display all saved applications on the user dashboard with grant name, funder name, status, and date last updated                                                              | Must Have |
| FR-17 | The system shall allow a user to open and continue any saved application from their dashboard                                                                                                  | Must Have |
| FR-18 | The system shall auto-save application progress; save also occurs on every Continue action                                                                                                     | Must Have |
| FR-19 | The system shall allow a user to delete a saved application                                                                                                                                    | Must Have |
| FR-20 | A single user account shall support multiple saved applications simultaneously                                                                                                                 | Must Have |

**Implementation notes:**

- Auto-save runs silently every 60 seconds in the background with no visible indicator
- **Corrected 2026-07-10:** Step 4 answer text is also saved via a 400ms-debounced auto-save as the user pauses typing (`actions/applications.ts`'s `saveAnswer()`, called by both the debounce and the 60-second background save) -- the 60-second save is a safety net, not the only save trigger, as the line above implies on its own
- Save also occurs on every Continue action (step advance)
- A returning user is taken directly to the step they last reached, not to Step 1
- Dashboard application cards are sorted by most recently updated, descending
- **Corrected 2026-07-13:** the summary strip on the dashboard always shows all **five** status counts (not started, in progress, approved, exported, and ineligible/`mismatch`), even when some are zero. Previously said "four" -- the `mismatch` status (set by FR-47's eligibility hard stop) was added as a fifth counted bucket this same week so the numbers tally against the total shown; see `components/dashboard-populated.tsx` and `acceptance-criteria.md`'s AC-FR-16-03
- The application deadline field mentioned in the BRD is not included in v1
- **Revised 2026-06-01 (DR-FD-001):** the funder is selected from a searchable, curated picker seeded from the `funders` database table, not entered as free text. A "Can't find your funder? Request it to be added" link is displayed below the picker for funders not yet in the directory (corrected 2026-07-10 to match the live wording in `components/application-step1-form.tsx` -- a `mailto:` link, not an in-app form). See Screen 7 Step 1 (Section 7) for the full UI specification.

---

### 6.4 Funder Guideline Handling

| Ref   | Requirement                                                                                                                                                                                    | Priority  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-21 | The system shall allow users to input funder guidelines by pasting text or uploading a PDF or .docx file                                                                                       | Must Have |
| FR-22 | Funder guidelines shall be used for AI processing only and shall not be permanently stored. **True of the product as it exists in production today; changing under Phase 6 -- see note below** | Must Have |
| FR-23 | The system shall display a plain-language error if an unsupported file format is uploaded and prompt the user to paste the text instead                                                        | Must Have |

**File upload rules:**

| Rule                   | Detail                                     |
| ---------------------- | ------------------------------------------ |
| Accepted formats       | PDF (.pdf) and Microsoft Word (.docx) only |
| Maximum file size      | 10 MB                                      |
| Large document warning | Shown when document exceeds 100,000 tokens |

**File error messages (corrected 2026-07-10 -- all three below were stale; the live UI in `components/application-step2-form.tsx` uses richer copy than quoted here previously, which matched `lib/file-validation.ts`'s messages instead of what the user actually sees):**

| Scenario                                            | Message                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wrong format                                        | "We can only accept PDF or Word (.docx) files. Check the funder's website for a version in one of these formats. If not, you can paste the key sections -- such as eligibility criteria and application questions -- into the text box below."                                                                           |
| File too large                                      | "Your file is over 10MB. Some funders publish a shorter summary version of their guidelines -- check their website first. If not, you can paste the key sections -- such as eligibility criteria and application questions -- into the text box below."                                                                  |
| Scanned / image PDF                                 | "We couldn't read the text in your PDF -- it looks like a scanned document rather than a digital one. Some funders also publish a Word version of their guidelines -- check their website. If not, you can paste the key sections -- such as eligibility criteria and application questions -- into the text box below." |
| Server/processing error (not previously documented) | "Something went wrong while processing your document. Please try again, or paste the guidelines text directly."                                                                                                                                                                                                          |

**Implementation note:** Vercel free tier has a 4.5 MB API route limit. A 10 MB file upload requires either Vercel Pro or a client-side upload direct to Supabase Storage, bypassing the API route entirely. This is a pre-development technical decision.

**FR-22 status note (added 2026-07-10):** `ADR-DATA-002` originally decided funder guidelines would never be stored, on the basis that they "may contain commercially sensitive information provided by the funder." On 2026-07-10 that ADR was formally revised: checked against the real corpus of funder documents Grant Pathway processes (`docs/Grant Org Guidelines/`), the commercial-sensitivity premise did not hold -- these are funders' own publicly published application guidance. The revised decision is that guideline text **will** be retained (extracted, page/section-tagged text in Postgres, cascade-deleting with its owning application; retained indefinitely where it backs an approved playbook), once Phase 6 (P6.2a onward) ships. **As of this pass, that retention mechanism has not been built.** FR-22 as stated above, and the "not permanently stored" behaviour described throughout this PRD, remain true of the live production product today. Treat this FR the same way `ADR-DATA-001` treats the superseded `application_answers` model: an accurate description of what exists now, not a permanent design commitment. See Section 9.3 and `ADR-DATA-002`'s 2026-07-10 revision for full detail.

---

### 6.5 AI Guideline Summarisation

| Ref   | Requirement                                                                                                                  | Priority  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-24 | On advancing to Step 3, the system shall generate a plain-English summary of the funder's guidelines                         | Must Have |
| FR-25 | AI summarisation shall use both the funder guidelines and the charity profile as inputs                                      | Must Have |
| FR-26 | The system shall display a visible staged progress indicator while AI processing is underway                                 | Must Have |
| FR-27 | In the event of an API error or timeout, the system shall display a plain-language error message and allow the user to retry | Must Have |

**Summary content areas (corrected 2026-07-10 against the live `summary_json` schema and `components/application-step3-summary.tsx`):**

- What the grant is for
- Grant amount (if stated)
- Who can apply (eligible organisations)
- What the funder is looking for (priorities and project types)
- Key requirements/restrictions
- Each application question or section, shown verbatim as extracted (word limit shown alongside where stated) -- **not** a separate plain-English explanation per question; this bullet previously overstated what's built

**Progress indicator messages (Step 3) -- corrected 2026-07-10, a third stage was missing:**

1. "Reading your funder guidelines..."
2. "Identifying key information..."
3. "Almost there..."

**API error message (Step 3):** "We couldn't generate your summary right now. This is usually temporary -- please try again." with a Try again button.

**Second consecutive failure (added 2026-07-13 -- previously undocumented):** if the user clicks Try again and the retry also fails, the message changes to "If this keeps happening, please try again later. Your work has been saved." and no Try again button is shown -- only a link back to Step 2. The application remains at `in_progress` status with no data lost. See `acceptance-criteria.md`'s AC-FR-27-05.

---

### 6.6 Q&A Interview and Application Assembly

**Revised 2026-05-28.** The originally specified model -- AI auto-generates a draft answer for each question on arrival at Step 4 -- was abandoned. Funder AI-guidance research (Henry Smith, National Lottery Community Fund) found that AI-generated answers disadvantage charities in practice. The replacement model, in production today: **the charity writes every answer**; AI assists only on request, improving structure and clarity of what the charity has already written. AI never generates application content from scratch. The old `/api/generate-draft` route and the "Regenerate all answers" action no longer exist -- both were removed 2026-07-01 after being confirmed to have zero callers. Full design rationale: `docs/Implementation Plan/archive/STEP4-REDESIGN-PROPOSAL.md`.

| Ref   | Requirement                                                                                                                                                                                                                                                       | Priority  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-28 | The charity shall write each application answer from scratch, section by section; on arriving at Step 4 for the first time, the user shall see a preparation checklist before beginning the Q&A interview                                                         | Must Have |
| FR-29 | Word limits and character limits shall be auto-extracted from the funder guidelines and displayed alongside each question; each answer shall show a live word/character counter as the user types                                                                 | Must Have |
| FR-30 | A per-question "Help me improve this" AI assist action shall be available on request, using the charity's own written answer as its only input; it shall correct spelling and grammar and improve structure and clarity, and shall not add facts or change claims | Must Have |
| FR-31 | Budget questions and sections shall be visually flagged (amber) and the AI assist action shall be disabled on them; the user must enter their own figures                                                                                                         | Must Have |

**The preparation checklist (shown once, on first arrival at Step 4):**

Heading: _"Before you begin writing."_ Message: _"The financial sections of this application cannot be completed by AI. Before you start, gather:"_ followed by a checklist:

1. Most recent annual accounts or financial statements
2. Projected budget for the grant period (income and planned expenditure)
3. Details of other funding secured or applied for
4. Input from your treasurer, finance lead, or a trustee who understands the budget

A warning note follows: _"It is worth involving a senior colleague -- such as your CEO, treasurer, or a trustee -- before reaching the financial questions."_ Button: _"I have what I need -- start writing."_ The checklist is shown only once per application; returning users go directly to the Q&A interface. See Screen 7 Step 4 (Section 7) for the full Q&A interface specification.

**Word and character limits (FR-29):** limits are extracted automatically from the funder guidelines during Step 3 -- the user never enters a limit manually. Both word limits and character limits are supported (`limit_type: words | characters | none`); the counter on each question displays "X / N words" or "X / N characters" as appropriate, or a plain word count with no limit shown where the funder sets none.

**Over-limit hard stop (FR-29, updated 2026-06-04, D-LBF-02):** when an answer exceeds its word or character limit, the "Approve this answer" panel and button are hidden, and a red message is shown: _"Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving."_ The approve panel reappears automatically once the answer is brought back within the limit. This replaced an earlier "warn but allow" behaviour (removed 2026-06-04) -- grant portals uniformly reject over-limit submissions, so allowing approval of an over-limit answer would give false confidence.

**AI assist limitation (PDR-AI-006, found live during Clothworkers testing, 2026-07-04):** LLMs cannot reliably hit an exact word or character count when compressing an over-limit answer -- a 200-word answer against a 50-word limit was refined to 60 words by the AI assist, still over limit. When the AI's suggestion remains over limit after refining, a conditional inline message naming the shortfall and prompting further trimming is planned but **not yet implemented** as of this pass. Do not describe this as guaranteed to bring an answer within limit in any user-facing copy or test plan.

**Budget question treatment (FR-31):** budget questions/sections are shown with an amber border and a "Budget" badge; the "Help me improve this" button is absent. **Corrected 2026-07-13 -- the label text below was wrong, and there are two variants depending on funder type** (verified against `components/application-step4-draft.tsx`): for structured funders, the label reads _"Budget questions must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding."_; for free-form funders, the same text with "Budget sections" in place of "Budget questions". Budget questions require a user-entered answer before the application can be assembled, via the same generic all-questions-approved gate as any other question -- not a budget-specific check or message.

**AI assist mechanics (FR-30):** "Help me improve this" is available on non-budget questions once the user has written something. On success, a "SUGGESTED IMPROVEMENT" card shows the refined text alongside the original, with two actions: **"Use this improved version"** (replaces the answer) and **"Keep my original"** (discards the suggestion). The refine prompt always corrects spelling and grammar, even for very short answers, and is instructed never to add facts, statistics, or claims not present in the charity's own text.

**Assembly:** once all mandatory questions are approved (optional questions -- those containing "(optional)" or beginning "This question is optional" -- do not block the gate), a senior-review prompt asks the user to confirm a senior colleague has reviewed the budget answers (see `acceptance-criteria.md`'s FR-31A section for the exact built screen -- corrected 2026-07-10 from an earlier, inaccurate three-checkbox description). Assembly then formats each answered question as its question (or section) text followed by the charity's own answer text (or AI-refined words where the charity chose to use them), entries separated by a divider, with no AI involvement in this step. **Corrected 2026-07-10:** structured and free-form funders produce the _same_ format -- the only difference is that structured entries are additionally prefixed with their question number. This is not "a Q&A list vs. a flowing narrative" as previously described here; that distinction does not exist in the live `assembleAndAdvance()` logic (`actions/applications.ts`).

**Progress/status indicators (Step 4):** each question card shows green (complete), amber (partial), or grey (not started) depending on answer state, rather than a single generation progress bar -- there is no AI generation step to wait for on arrival at Step 4.

**Monthly AI request limit (PDR-AI-005, raised 20 → 50, aligned across every AI route by 2026-06-17):** `generate-summary` and `refine-answer` were raised to 50 on 2026-05-28 as part of the Step 4 redesign; the then-separate `generate-draft` route was missed in that change and stayed at 20 until corrected on 2026-06-17. `generate-draft` was itself deleted entirely on 2026-07-01 (zero callers, superseded by `refine-answer`) -- `generate-summary` and `refine-answer` are the two AI routes live today, both enforcing 50.

**Corrected 2026-07-10 -- both messages below were misquoted; verified against the live banners in `components/application-step4-draft.tsx`:**

| Threshold                     | Action                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 40 of 50 requests used (80%)  | Soft warning banner: "You've used most of your monthly AI allowance. 'Help me improve this' may not be available for all questions/sections."                                                                                                                                                            |
| 50 of 50 requests used (100%) | AI assist blocked. Message: "You've reached your monthly AI limit. You can still write and edit your answers -- AI writing assistance is unavailable until next month." No specific reset date is shown, and there is no "get in touch" prompt. Writing and saving your own answers is never restricted. |

Each guideline summarisation (including regeneration) and each "Help me improve this" AI assist request counts as one AI request against the monthly allowance. Writing or auto-saving an answer does not consume a request. Monthly limit resets on the first day of the calendar month.

**AI service unavailable (kill switch, added 2026-06-29):** when the `AI_ENABLED` flag is set to `false`, both `generate-summary` and `refine-answer` return HTTP 503 immediately and no quota is consumed. **Corrected 2026-07-10:** there is no dedicated "temporarily unavailable" message -- the kill-switch reuses the same `overloaded` error message as a genuinely busy AI service: _"The AI service is busy right now. Please try again in a moment."_ (`lib/ai-error-handler.ts`). The user cannot distinguish a deliberate kill-switch from real overload.

**API error message:** **Corrected 2026-07-10** -- this previously claimed a single message referencing "your draft," a holdover from the abandoned auto-draft model; no such message exists in the live code. Step 4 errors are shown inline per question (`refineState.message` in `components/application-step4-draft.tsx`), sourced from the shared error mapping in `lib/ai-error-handler.ts` -- see `ADR-AI-009`'s message table for the full set (rate limit, server error, parse failure, etc.), each with a per-question "Dismiss" action rather than a single page-level Try again button.

---

### 6.7 Mandatory Review & Approval

Review and approval happens at **two levels**: a per-question approval on each Step 4 question card, and a final application-level approval gate on Step 5. Both are mandatory; neither can be bypassed.

| Ref   | Requirement                                                                                                                                                                               | Priority  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-32 | Every answer shall be presented alongside plain-language review prompts, both per-question on Step 4 and application-wide on Step 5, before it can be approved                            | Must Have |
| FR-33 | The system shall require explicit user approval, at both the per-question level (Step 4) and the application level (Step 5), before content can be exported; neither step can be bypassed | Must Have |
| FR-34 | The user shall be able to edit their answer text directly within the Step 4 interface at any time before assembly                                                                         | Must Have |
| FR-35 | The user shall be able to clear and rewrite any answer at any time before assembly; there is no "regenerate" action, since content is user-written, not AI-generated                      | Must Have |
| FR-36 | Approved content shall be visually marked as approved and saved to the application record, at both the per-question and application level                                                 | Must Have |

**Level 1 -- per-question approval (Step 4, implemented 2026-06-01):** each question card carries its own "Before you approve, check:" review prompts and its own "Approve this answer" button. The approval panel is shown once the answer is non-empty (or, for a question marked optional, even when empty), and is hidden while the answer is over its word/character limit (Section 6.6). Editing an approved answer clears its approval -- the question must be re-approved. The "Ready to assemble" button on Step 4 is gated on the approved count (all mandatory questions approved), not merely the answered count.

**Level 2 -- application-level approval (Step 5):** the assembled draft is shown read-only, alongside **three mandatory confirmation checkboxes** that must all be ticked before the approval/export action activates (see FR-32/33's implementation detail and Screen 7 Step 5 in Section 7):

1. "I have reviewed all responses in full and am satisfied with their content."
2. "The information provided is accurate and complete to the best of my knowledge."
3. "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."

**Revised 2026-06-12:** the separate "Approve my application" button and confirmation modal were removed to reduce friction. Ticking all three checkboxes and clicking a download button now approves the application (sets status to `approved`) and begins the download in a single action -- there is no intermediate confirmation modal.

**Re-opening prompt:** can be triggered from two places -- the dashboard card (`components/dashboard-populated.tsx`) or a re-open action on the Step 5 page itself (`components/application-step5-approve.tsx`). **Corrected 2026-07-13:** both now show identical wording: "Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export." (The two dialogs previously had slightly different wording -- the Step 5 dialog omitted "this application" -- flagged here 2026-07-10 and reconciled in code the same week.) Confirming either reverts the application to `in_progress`, clears the assembled draft, and resets every question's per-question approval, requiring both levels of approval to be completed again.

---

### 6.8 Export

| Ref   | Requirement                                                                                  | Priority                                            |
| ----- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR-37 | The system shall allow users to export all approved content as a Microsoft Word (.docx) file | Must Have                                           |
| FR-38 | The system shall allow users to export all approved content as a plain text (.txt) file      | Should Have -- **confirmed built** (see note below) |
| FR-39 | The system shall prevent export where no content has been approved                           | Must Have                                           |

**FR-38 status corrected 2026-07-10:** confirmed built and live -- `app/api/export/[applicationId]/route.ts` supports `?format=txt`, and Step 5 (`components/application-step5-approve.tsx`) shows a "Download as plain text (.txt)" button alongside the Word download, gated on the same three checkboxes. This doc, `moscow-feature-register.md` (both its FR-38 row and Should Have build-conditions table), and `acceptance-criteria.md`'s FR-38 intro all previously described it as conditional/not-yet-decided ("build if time permits" / "these criteria apply only if implemented") -- corrected in all three. The .txt structure matches `PDR-DH-003`: title, funder, date, disclaimer, Q&A pairs (or the assembled draft) separated by a rule, footer attribution -- same content as the Word export, reduced to plain text.

**Exported Word document structure (PDR-DH-003):**

| Element        | Detail                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| Document title | Grant name                                                                                   |
| Funder         | Funder name                                                                                  |
| Date exported  | Date of export, formatted DD Month YYYY                                                      |
| AI disclaimer  | Plain-language statement that content was AI-assisted and has been reviewed by the applicant |
| Q&A body       | Each question as a heading, followed by its approved answer                                  |
| Footer         | "Prepared using Grant Pathway v[version number] -- grantpathway.org.uk"                      |

**Re-export warning (shown when downloading an already-exported application) -- corrected 2026-07-10, verified against `components/application-step5-approve.tsx`:**

Dialog title: "Download again?" Body: "You last exported this application on [date]." (or "You have already exported this application." if no export date is recorded) followed by "If you have already submitted that version to the funder, please contact them if you intend to submit a revised version -- funders may treat multiple submissions as separate applications." This previously misquoted the wording (e.g. "please contact them to let them know a revised version is being submitted" instead of the actual, more conditional "if you intend to submit a revised version") and omitted the no-date fallback case.

Actions: Download anyway / Cancel

---

### 6.9 Account Deletion

| Ref   | Requirement                                                                                                        | Priority                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| FR-40 | The system shall allow users to permanently delete their account from Account Settings                             | Must Have                                           |
| FR-41 | Before deletion, the system shall display a plain-language warning explaining all data will be permanently deleted | Must Have                                           |
| FR-42 | The user shall be required to type DELETE (uppercase, case-sensitive) to confirm deletion                          | Must Have                                           |
| FR-43 | On confirmation, the system shall permanently delete all data associated with the account                          | Must Have                                           |
| FR-44 | The system shall send a confirmation email to the user once deletion is complete                                   | Should Have -- **confirmed built** (see note below) |

**Data deleted on confirmation:**

- User account and login credentials
- Charity profile
- All saved applications and their content (draft and approved answers)
- AI usage records

**Post-deletion behaviour:**

1. All data permanently deleted
2. User session ended immediately
3. User redirected to `/` with message: "Your account has been deleted. We've sent you a confirmation email." (corrected 2026-07-10 -- previously omitted the second sentence, confirmed against `components/sign-in-form.tsx`)
4. Confirmation email sent (Email 5, subject "Your Grant Pathway account has been deleted")

**FR-44 status corrected 2026-07-10:** confirmed built and live -- `app/api/account/delete/route.ts` sends the confirmation email via `lib/emails/account-deleted-user.ts` on every deletion, not conditionally. This doc, `moscow-feature-register.md` (both its FR-44 row and Should Have build-conditions table), and `acceptance-criteria.md`'s FR-44 intro all previously described it as conditional ("if FR-44 is implemented" / "only implemented if... in v1 build scope") -- corrected in all three, consistent with how `acceptance-criteria.md`'s own Status table already listed this section "✅ Complete." Separately noted: the email's own code comment calls it "Email 2," not "Email 5" as `email-notifications.md`'s canonical numbering has it -- a stale code comment, not a doc error, flagged for a follow-up fix.

**Implementation note:** The BRD specified re-entering the email address as the confirmation mechanism. The screen requirements supersede this -- the implemented confirmation is typing the word DELETE (uppercase, exact match, case-sensitive).

---

### 6.10 Question-Level Typing (FR-45)

**Added 2026-05-29 (BD-04); status corrected 2026-07-10.**

| Ref   | Requirement                                                                                                                                                                                                                                                                                                                                                              | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-45 | Each extracted application question shall carry a `question_type` of `narrative`, `data_entry`, `financial`, `dropdown`, `date`, or `file_upload`, driving different handling per type (narrative questions get a writing card; data-entry and financial are pre-filled from the charity profile; dropdown, date, and file_upload are shown as read-only reminders only) | Must Have |

**Not built as described.** In practice, only `narrative` is ever extracted -- the AI extraction prompt in `lib/prompts.ts` discards every other question type entirely rather than classifying it. A nine-funder review (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found this typing mechanism too narrow in twenty distinct ways. `ADR-DATA-006` (2026-07-05) supersedes FR-45's mechanism with a typed item-graph model (`docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md`) -- not yet built; see that ADR's linked build plan. FR-45 is retained here as the current formal requirement and should be revised or retired once the item-graph work lands, not before. Do not present question-level typing as working in any user-facing material or test plan on the strength of this FR.

---

### 6.11 Three-Tier Funder Coverage Model (FR-46) -- Withdrawn 2026-07-11

**Added 2026-05-29 (BD-07). Withdrawn 2026-07-11 -- see below.**

| Ref   | Requirement                                                                                                                                                                                                                                                                                                                                                                         | Priority                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR-46 | The system shall display a three-tier funder coverage model to the user: **Tier 1 (Full)** -- narrative questions with profile pre-fill; **Tier 2 (Partial)** -- a narrative subset of a portal form; **Tier 3 (Guidance)** -- a free-form narrative document. The coverage tier shall be shown on the new-application screen, on the Step 3 summary card, and on the export screen | Won't Have (v1) -- Withdrawn |

**Withdrawn -- not a build gap, a retired requirement.** Per `docs/moscow-feature-register.md` FR-46 (Won't Have (v1), withdrawn 2026-07-11) and BD-07 (`docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md` Section 10): the three-tier model assumed coverage level is a stable property of a funder, and that premise was disproven -- the same funder can be fully or partially supported depending on which specific guidelines document is uploaded for a given application (see BD-04/BD-08), not the funder's identity. A static per-funder tier badge would have repeated the exact mistake the retired "Structured/Narrative" badge made (`DR-FD-001` v1.0 -> v1.2). Never built since being added 2026-05-29 -- confirmed by code search (no "Tier 1/2/3" or coverage-tier field anywhere in `components/`, `app/`, or `lib/database.types.ts`; the `funders` table, Section 9.1, has no coverage-tier column). Charities are no worse off -- no such display has ever existed. This is no longer an open product question; see Section 3.3 for the updated MoSCoW count.

---

### 6.12 Eligibility Mismatch Detection (FR-47)

**Added 2026-06-02 (DR-EL-001).**

| Ref   | Requirement                                                                                                                                                                                                  | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-47 | On Step 3, if the AI detects a clear mismatch between the charity's profile and the funder's eligibility criteria, the system shall display a hard stop: a red warning card, with the Continue button hidden | Must Have |

Confirmed built and matching the register description: acknowledging the warning sets the application status to `mismatch` (a terminal state -- no transition to Step 4 or 5 is permitted) and returns the user to the dashboard. There is no override path. The only route forward is for the user to correct their charity profile and start a new application. Default message if no specific reason is available: _"Your charity's focus does not appear to meet this funder's eligibility criteria."_

---

### 6.13 Guideline Source-Reference / Citations (FR-48)

**Added 2026-07-10 (`PDR-DH-004`, "Option 2"; architecture in `ADR-DATA-007`).**

| Ref   | Requirement                                                                                                                                                                                                                                                  | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-48 | Each AI summary bullet, eligibility criterion, and extracted question shall carry a citation to a specific page (PDF) or heading/section (docx, pasted text) of the funder's guidelines, with a "view original guidelines" panel to jump to and highlight it | Must Have |

**Not built as of 2026-07-10.** Depends on two other decisions: `ADR-DATA-002`'s guideline-retention reversal (a citation needs retained text to point at) and `ADR-DATA-006`'s item-graph model (the citation is a field on each item, not on the flat `application_answers` structure). Blended into Phase 6 rather than run as a separate track, since it touches the same data model, extraction prompt, and Step 4 rendering Phase 6 was already rewriting -- see `ADR-DATA-007`'s Decision for the five-part build sequence (`P6.2a` groundwork through `P6.5` curation). Part of the Phase 6 → Go-Live Gate; none of the underlying build tasks have started. See `docs/PRD inputs/acceptance-criteria.md` Section 9.11 for full acceptance criteria.

---

## 7. Screen Specifications

This section defines the content, fields, validation rules, error states, and post-submission behaviour for each screen. Full detail is also held in `docs/PRD inputs/screen-requirements.md`.

---

### Screen 1 -- Sign In / Landing

**URL:** `/` | **Auth:** Unauthenticated only

| Element                                                                                          | Detail                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tagline                                                                                          | "Your free grant writing companion for UK charities" -- displayed prominently below logo                                                                                                                                 |
| Email address                                                                                    | Text input, required                                                                                                                                                                                                     |
| Password                                                                                         | Password input, required, show/hide toggle                                                                                                                                                                               |
| Forgot password                                                                                  | Link below password field, right-aligned -- links to `/forgot-password`                                                                                                                                                  |
| Sign in button                                                                                   | Primary action, teal, full width                                                                                                                                                                                         |
| Register prompt                                                                                  | "New to Grant Pathway? Register for free" -- links to `/register`                                                                                                                                                        |
| Account deleted confirmation banner (added 2026-07-13 -- previously undocumented on this screen) | Shown when arriving via `?deleted=true` (redirect after account deletion, FR-43/Section 6.9): green banner reading "Your account has been deleted. We've sent you a confirmation email." (`components/sign-in-form.tsx`) |

**Validation and error states:**

| Scenario              | Message                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Empty email           | "Please enter a valid email address"                                                      |
| Empty password        | "Please enter your password"                                                              |
| Incorrect credentials | "Your email address or password is incorrect. Please try again."                          |
| Email not verified    | "Please verify your email address before signing in." with Resend verification email link |
| Email not registered  | Same as incorrect credentials (do not reveal whether email is registered)                 |

---

### Screen 2 -- Register

**URL:** `/register` | **Auth:** Unauthenticated only

| Element               | Detail                                                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page heading          | "Create your free account"                                                                                                                                           |
| First name            | Text input, required                                                                                                                                                 |
| Last name             | Text input, required                                                                                                                                                 |
| Email address         | Text input, required                                                                                                                                                 |
| Password              | Password input, required, show/hide toggle                                                                                                                           |
| Password confirmation | Password input, required, show/hide toggle                                                                                                                           |
| Terms checkbox        | "I have read and agree to the [Terms of Service] and [Privacy Policy]" -- both links open in new tab -- required                                                     |
| Feedback opt-in       | "I'm happy to be contacted occasionally to share feedback about Grant Pathway" -- optional, unchecked by default (FR-08, Should Have -- confirmed built, 2026-07-10) |
| Create account button | Primary action, teal, full width                                                                                                                                     |
| Sign in prompt        | "Already have an account? Sign in" -- links to `/`                                                                                                                   |

**Validation:**

| Field                 | Rule                                                             | Error message                                                                       |
| --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| First name            | Required                                                         | "Please enter your first name"                                                      |
| Last name             | Required                                                         | "Please enter your last name"                                                       |
| Email                 | Required, valid format                                           | "Please enter a valid email address"                                                |
| Email                 | Not already registered                                           | "An account with this email address already exists"                                 |
| Password              | Required, minimum 12 characters, must contain letters and digits | "Your password must be at least 12 characters and include both letters and numbers" |
| Password confirmation | Must match password                                              | "Your passwords do not match"                                                       |
| Terms checkbox        | Must be checked                                                  | "Please accept the Terms of Service and Privacy Policy to continue"                 |

**On success:** Account created, Email 1 sent, user redirected to `/verify-email`.

---

### Screen 3 -- Verify Email

**URL:** `/verify-email` | **Auth:** Unauthenticated only

**State 1 -- Awaiting verification:**

| Element            | Detail                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Heading            | "Check your email"                                                                                         |
| Message            | "We've sent a verification link to [email address]. Click the link in the email to activate your account." |
| Resend button      | "Resend verification email" -- rate-limited to 3 per hour                                                  |
| Wrong email prompt | "Wrong email address? [Sign in with a different account]" -- links to `/`                                  |

**State 2 -- Verified (link clicked, valid):**

**Corrected 2026-07-13** -- previously described the wrong post-verification flow (auto-signed-in, straight to dashboard). Verification deliberately signs the user out (D-012 follow-on -- see `actions/auth.ts`'s `confirmEmail()`), so the success screen routes to a clean sign-in page, not the dashboard.

| Element | Detail                                                |
| ------- | ----------------------------------------------------- |
| Heading | "Email verified"                                      |
| Message | "Your account is now active. Sign in to get started." |
| Button  | "Sign in" -- links to `/`                             |

**State 3 -- Link expired or invalid:**

| Element | Detail                                                                |
| ------- | --------------------------------------------------------------------- |
| Heading | "This link has expired"                                               |
| Message | "Your verification link is no longer valid. Request a new one below." |
| Button  | "Send a new verification email" -- primary action                     |

---

### Screen 4 -- Forgot Password

**URL:** `/forgot-password` | **Auth:** Unauthenticated only

**State 1 -- Reset request form:**

| Element       | Detail                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| Heading       | "Reset your password"                                                       |
| Instruction   | "Enter the email address for your account and we'll send you a reset link." |
| Email address | Text input, required                                                        |
| Send button   | "Send reset link" -- primary action, teal, full width                       |

On submission (regardless of whether email is registered): "If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."

**State 2 -- New password form (valid reset link):**

| Element              | Detail                                                  |
| -------------------- | ------------------------------------------------------- |
| Heading              | "Choose a new password"                                 |
| New password         | Password input, required, show/hide toggle              |
| Confirm new password | Password input, required, show/hide toggle              |
| Save button          | "Save new password" -- primary action, teal, full width |

**Validation (State 2):**

| Field                | Rule                                                             | Error message                                                                       |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| New password         | Required, minimum 12 characters, must contain letters and digits | "Your password must be at least 12 characters and include both letters and numbers" |
| Confirm new password | Must match                                                       | "Your passwords do not match"                                                       |

On success: "Your password has been updated." with Sign in button. On expired link: heading "This link has expired", message "Your reset link is no longer valid. Please request a new one." (corrected 2026-07-13 -- previously misquoted as "This reset link has expired. Please request a new one."; verified against `components/reset-password-form.tsx`), with a "Request a new link" button back to State 1.

---

### Screen 5 -- Dashboard

**URL:** `/dashboard` | **Auth:** Authenticated only

**Profile incomplete banner** (shown whenever charity profile not fully saved, in both states):

> "Before you start, add your charity details -- we'll use these to personalise your applications."
> [Set up charity profile] button -- links to `/profile`

**State 1 -- Empty (no applications):**

| Element              | Detail                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Heading              | "Welcome to Grant Pathway, [first name]"                                                                               |
| Empty state message  | "You don't have any applications yet."                                                                                 |
| Start button         | "Start your first application" -- disabled if profile incomplete (tooltip: "Please set up your charity profile first") |
| Three-step explainer | "1. Add funder guidelines" / "2. Get an AI summary" / "3. Write your answers"                                          |

**State 2 -- Populated (one or more applications):**

| Element                | Detail                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                | "My Applications"                                                                                                                                                                                                                                 |
| Summary strip          | "[n] applications -- [n] not started · [n] in progress · [n] approved · [n] exported · [n] ineligible" -- all five always shown (corrected 2026-07-13 -- previously said "four" and omitted ineligible; see `components/dashboard-populated.tsx`) |
| New application button | "+ New Application" -- primary, teal, top right                                                                                                                                                                                                   |

**Application card contents:**

| Element                   | Detail                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Funder name               | Bold, prominent                                                                                                                                                                                                                                                                                                                                                                 |
| Grant name                | Below funder name                                                                                                                                                                                                                                                                                                                                                               |
| Status label              | Colour-coded pill: Not started (slate) / In progress (amber) / Approved (green) / Exported (teal) / Ineligible (red, for `mismatch` status -- see Section 6.12) -- fifth status added 2026-07-10; **now included** in the five-status summary strip above (corrected 2026-07-13, was previously excluded -- see Section 6.3)                                                    |
| Last updated              | "Last updated [DD Month YYYY]" (zero-padded day, e.g. "03 July 2026" -- made consistent 2026-07-13 across the dashboard, Step 5, and the exported document, all of which previously varied)                                                                                                                                                                                     |
| Continue / Re-open button | "Continue" for Not started and In progress; "Re-open" for Approved and Exported (renamed from "View" 2026-07-13 -- the action is not read-only, it reverts approval and the assembled draft); no button at all for Ineligible (`mismatch`) -- only the delete option remains, matching FR-47's no-override-path design (confirmed against `components/dashboard-populated.tsx`) |
| Delete button             | Red text link -- triggers confirmation prompt per application status model                                                                                                                                                                                                                                                                                                      |

---

### Screen 6 -- Charity Profile

**URL:** `/profile` | **Auth:** Authenticated only

| State            | Heading                       | Save button    |
| ---------------- | ----------------------------- | -------------- |
| First-time setup | "Set up your charity profile" | "Save profile" |
| Editing existing | "Your charity profile"        | "Save changes" |

**Fields:**

| Field                     | Label                         | Type          | Required | Hint text shown below the field                                                                                                                                                                                                                                                                             |
| ------------------------- | ----------------------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Charity name              | "Charity name"                | Text          | Yes      | -- (pre-populated on lookup match)                                                                                                                                                                                                                                                                          |
| Registration number       | "Charity registration number" | Text          | No       | -- (pre-populated on lookup match)                                                                                                                                                                                                                                                                          |
| Charity Commission lookup | --                            | Search button | --       | Searches by name or number                                                                                                                                                                                                                                                                                  |
| What the charity does     | "What does your charity do?"  | Textarea      | Yes      | "Your Charity Commission entry (see the lookup above) lists your charitable objects -- this is a good starting point. Your website's 'About us' page is another useful source." Replaced with "Drafted from your Charity Commission entry -- edit to personalise." when AI-paraphrased from a lookup match. |
| Who the charity helps     | "Who does your charity help?" | Textarea      | Yes      | "Think about the people your charity serves -- their age, background, or circumstances. Your Charity Commission entry may also describe your beneficiaries." Same AI-paraphrased swap as above.                                                                                                             |
| Where the charity works   | "Where do you work?"          | Text          | Yes      | "Enter a town, county, or region -- for example, 'Leeds' or 'South Yorkshire'. If you work across the whole country, enter 'National'. If you're not sure, use the town or city where your charity is based."                                                                                               |

**Governance and reserves fields (added 2026-07-10 -- missing from this section since P6.1 shipped 2026-07-05, see Section 6.2):** an optional group below the fields above -- total annual expenditure (£), reserves (£, shows a live "approximately N months of reserves" once both figures are entered), whether any trustees are related to each other, number of authorised bank signatories, and whether any bank signatories are related to each other or a trustee. All five optional.

**Charity Commission lookup outcomes:**

| Scenario                             | Message                                                                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Match found                          | Fields pre-populated. "Details retrieved from the Charity Commission register. You can edit these fields before saving."                                              |
| Match found, AI paraphrase succeeded | Additional banner: "The descriptions below were drafted by AI from your Charity Commission entry. Please review and personalise them before saving."                  |
| No match                             | "We couldn't find that charity. Please enter your details manually."                                                                                                  |
| API unavailable                      | "We couldn't reach the Charity Commission right now. You can try again using the Look up charity button above, or fill in your details manually in the fields below." |

**Post-save behaviour:**

| Scenario           | Behaviour                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First-time save    | Success message on profile page: "Your charity profile has been saved. You're ready to start your first application." with Go to my dashboard button. User stays on `/profile` |
| Edit save          | No confirmation message shown -- user is redirected straight to `/dashboard`                                                                                                   |
| Validation failure | Inline errors shown; form data preserved                                                                                                                                       |

---

### Screen 7 -- Application Flow

**URLs:** `/applications/new` (new) and `/applications/[id]` (existing) | **Auth:** Authenticated only

A five-step flow with a step indicator at the top showing all five steps at all times. Current step is highlighted. Indicator is read-only.

**Auto-save:** On every Continue action and silently every 60 seconds in the background.

---

**Step 1 -- Application Details**

**Revised 2026-06-01 (DR-FD-001):** the funder name field was replaced with a searchable picker over the approved `funders` directory (FR-15, FR-46).

| Element                       | Detail                                                                                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                       | "Start a new application" (new application); "Continue your application" (returning to an existing application)                                                                                                       |
| Funder picker                 | Searchable dropdown/combobox populated from the active `funders` table, required. Label: "Who is offering this grant?" Placeholder: "Search for a funder..."                                                          |
| "My funder isn't listed" link | Below the picker: "Can't find your funder? Request it to be added -- we'll review and add it as soon as possible." -- a `mailto:` link (corrected 2026-07-10 to match `application-step1-form.tsx`; not a Tally form) |
| Coverage tier (FR-46)         | The funder's coverage tier (Tier 1 Full / Tier 2 Partial / Tier 3 Guidance) is shown alongside the selected funder. **Confirmed not built -- see Section 6.11.**                                                      |
| Grant name                    | Text, required. Label: "What is the grant called?" Placeholder: "e.g. Awards for All England"                                                                                                                         |
| Continue                      | Creates application record (`not_started`), advances to Step 2                                                                                                                                                        |
| Cancel                        | Returns to `/dashboard` -- no record created                                                                                                                                                                          |

**Validation:** Funder: "Please select a funder from the list" (must be selected from the directory, free text is no longer accepted) / Grant name: "Please enter the grant name"

---

**Step 2 -- Funder Guidelines**

| Element                | Detail                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| Heading                | "Add the funder's guidelines"                                      |
| File upload            | PDF and .docx only, max 10 MB, drag-and-drop or click to browse    |
| Paste textarea         | Label: "Or paste the guidelines text here"                         |
| Large document warning | Shown if guidelines exceed 100,000 tokens                          |
| Continue               | Saves guidelines, sets status to `in_progress`, advances to Step 3 |
| Back                   | Returns to Step 1                                                  |

---

**Step 3 -- AI Summary**

| Element                                        | Detail                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                                        | "Your funder guidelines -- summary"                                                                                                                                                                                                                                                                                                                                              |
| Progress                                       | "Reading your funder guidelines..." then "Identifying key information..." then "Almost there..." (corrected 2026-07-10 -- middle stage previously missing)                                                                                                                                                                                                                       |
| Summary content                                | AI-generated plain-English digest: what the grant is for, who can apply, funder priorities, key requirements, and extracted questions/sections shown verbatim as extracted (corrected 2026-07-10 -- previously implied a plain-English "explanation" per question, which does not exist; see Section 6.5)                                                                        |
| Questions found                                | "We found [n] application questions in these guidelines. You'll answer each one in the next step." (corrected 2026-07-10)                                                                                                                                                                                                                                                        |
| Questions not found                            | "We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."                                                                                                                                                                                                                                       |
| Coverage tier (FR-46)                          | Summary card shows the funder's coverage tier (Tier 1 Full / Tier 2 Partial / Tier 3 Guidance). **Confirmed not built -- see Section 6.11.**                                                                                                                                                                                                                                     |
| Eligibility mismatch (FR-47, added 2026-06-02) | If the AI detects a clear mismatch between the charity profile and the funder's eligibility criteria, Continue is hidden and a red warning card is shown instead: "Eligibility mismatch -- this application cannot proceed" with a specific or default reason. Acknowledging sets status to `mismatch` (terminal -- no override) and returns to the dashboard. See Section 6.12. |
| Regenerate                                     | "Regenerate summary" -- secondary action, counts as one AI request                                                                                                                                                                                                                                                                                                               |
| Continue                                       | "This looks right -- continue" -- advances to Step 4                                                                                                                                                                                                                                                                                                                             |
| Back                                           | Returns to Step 2                                                                                                                                                                                                                                                                                                                                                                |
| API failure                                    | "We couldn't generate your summary right now. This is usually temporary -- please try again." with Try again button                                                                                                                                                                                                                                                              |

---

**Step 4 -- Draft Answers (rewritten 2026-05-28 for the Q&A model; updated 2026-06-04)**

The auto-generation model originally specified here (AI writes a draft for every question on arrival) was abandoned -- see Section 6.6. Step 4 is now a charity-authored Q&A interview, preceded by a one-time preparation checklist.

**Preparation checklist (shown once, on first arrival at Step 4 only):**

| Element         | Detail                                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading         | "Before you begin writing"                                                                                                                                                                                                                                              |
| Message         | "The financial sections of this application cannot be completed by AI. Before you start, gather:"                                                                                                                                                                       |
| Checklist       | 1. Most recent annual accounts or financial statements 2. Projected budget for the grant period (income and planned expenditure) 3. Details of other funding secured or applied for 4. Input from your treasurer, finance lead, or a trustee who understands the budget |
| Warning note    | "It is worth involving a senior colleague -- such as your CEO, treasurer, or a trustee -- before reaching the financial questions."                                                                                                                                     |
| Continue button | "I have what I need -- start writing" -- advances to the Q&A interface; not shown again on return visits                                                                                                                                                                |
| Back            | Returns to Step 3                                                                                                                                                                                                                                                       |

**Q&A interface (shown on every visit after the checklist is passed once):**

| Element                 | Detail                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                 | "Your draft answers"                                                                                                                                                                                                                                                                                                                   |
| Sub-heading             | "Answer each question below. Your work is saved automatically as you type." (structured funder) or the free-form equivalent                                                                                                                                                                                                            |
| Progress indicator      | Sticky bar at top: "X of N questions approved"                                                                                                                                                                                                                                                                                         |
| Question/section cards  | One card per extracted question (or narrative section for free-form funders); textarea starts **empty** -- there is no AI-generated text to edit                                                                                                                                                                                       |
| Word/character counter  | Below each textarea: "X / N words" or "X / N characters" where the funder sets a limit (FR-29); a plain word count where it does not                                                                                                                                                                                                   |
| Over-limit hard stop    | When the answer exceeds its limit, the approve panel is hidden and a red message shown: "Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving."                                                                                                                         |
| "Help me improve this"  | Shown on non-budget questions once the answer is non-empty. Returns a "SUGGESTED IMPROVEMENT" card with **"Use this improved version"** and **"Keep my original"** actions. Counts as one AI request                                                                                                                                   |
| Budget question styling | Amber border, "Budget" badge, no AI assist button. Label: "This section requires your actual financial data -- do not use AI-generated figures." Must be filled in before assembly                                                                                                                                                     |
| Per-question approval   | "Before you approve, check:" prompts plus an "Approve this answer" button on each card (Section 6.7). Editing an approved answer clears its approval                                                                                                                                                                                   |
| Optional questions      | Questions containing "(optional)" show the approve panel even when empty, letting the user explicitly skip them; excluded from the assembly gate                                                                                                                                                                                       |
| Manual entry            | If no questions/sections were extracted in Step 3, the user sees a manual entry field to add a question and write their own answer                                                                                                                                                                                                     |
| Ready to assemble       | Active once every mandatory question is approved (greyed out otherwise); leads to the senior-review prompt, then assembly, then Step 5                                                                                                                                                                                                 |
| AI service unavailable  | When the AI kill switch is active: "The AI service is busy right now. Please try again in a moment." -- the same generic message as real overload, not a dedicated one (corrected 2026-07-10) -- shown inline on the card; no quota consumed                                                                                           |
| Back                    | Returns to Step 3                                                                                                                                                                                                                                                                                                                      |
| API failure             | Inline per-question error sourced from the shared error mapping (`lib/ai-error-handler.ts`) -- see `ADR-AI-009`'s message table; each with its own "Dismiss" action, not a single page-level message (corrected 2026-07-10 -- previously claimed one message referencing "your draft," a holdover from the abandoned auto-draft model) |
| Usage warning           | "You've used most of your monthly AI allowance. 'Help me improve this' may not be available for all questions/sections." (at 40 of 50 requests, 80% of limit; corrected 2026-07-10 -- second sentence previously omitted)                                                                                                              |
| Limit reached           | "You've reached your monthly AI limit. You can still write and edit your answers -- AI writing assistance is unavailable until next month." (corrected 2026-07-10 -- no specific reset date or "get in touch" prompt exists) "Help me improve this" buttons disabled; writing and saving answers is never restricted                   |

---

**Step 5 -- Approve & Export (checkboxes added 2026-06-01; approve+download collapsed into one action 2026-06-12)**

| Element                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                 | "Review and approve your application"                                                                                                                                                                                                                                                                                                                                                                                        |
| Content                 | Read-only view of the assembled draft -- all questions and approved answers                                                                                                                                                                                                                                                                                                                                                  |
| Confirmation checkboxes | **Three mandatory checkboxes, all of which must be ticked** before the download buttons activate (Section 6.7): (1) "I have reviewed all responses in full and am satisfied with their content." (2) "The information provided is accurate and complete to the best of my knowledge." (3) "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted." |
| Export buttons          | "Download as Word document (.docx)" and "Download as plain text (.txt)" -- both disabled until all three checkboxes are ticked. On first click: the application is approved (status → `approved`) and the download begins immediately in the same action -- there is no separate "Approve my application" button or intermediate confirmation modal                                                                          |
| Re-export warning       | Shown if previously exported (see Section 6.8 for wording)                                                                                                                                                                                                                                                                                                                                                                   |
| Re-open link            | "Re-open application to make changes" -- always shown; opens a confirmation modal; on confirm, resets status to `in_progress`, clears the assembled draft and all per-question approvals, and redirects to Step 4. This is the only route back to Step 4 from Step 5 -- there is no plain Back link                                                                                                                          |

---

### Screen 8 -- Account Settings

**URL:** `/account` | **Auth:** Authenticated only

| Element                 | Detail                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading                 | "Account settings"                                                                                                                           |
| Email                   | Read-only display: "Your email address: [email]" -- no change facility in v1                                                                 |
| Change password heading | "Change your password"                                                                                                                       |
| Current password        | Password input, required, show/hide toggle                                                                                                   |
| New password            | Password input, required, show/hide toggle                                                                                                   |
| Confirm new password    | Password input, required, show/hide toggle                                                                                                   |
| Update password button  | "Update password" -- primary, teal                                                                                                           |
| Delete account heading  | "Delete your account"                                                                                                                        |
| Delete warning          | "Deleting your account will permanently remove all your data, including your charity profile and saved applications. This cannot be undone." |
| Delete button           | "Delete my account" -- destructive, red -- links to `/account/delete`                                                                        |

**Password change validation:**

| Field                | Rule                                                             | Error                                                                               |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Current password     | Required, must match stored password                             | "Your current password is incorrect"                                                |
| New password         | Required, minimum 12 characters, must contain letters and digits | "Your password must be at least 12 characters and include both letters and numbers" |
| Confirm new password | Must match new password                                          | "Your passwords do not match"                                                       |

On success: "Your password has been updated." Form fields cleared.

---

### Screen 9 -- Account Deletion Confirmation

**URL:** `/account/delete` | **Auth:** Authenticated only (accessible via `/account` only)

| Element            | Detail                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading            | "Delete your account"                                                                                                                                           |
| Warning            | "This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone."          |
| Data summary       | List of what will be deleted: Your account and login details / Your charity profile / All saved applications and draft answers / Any uploaded funder guidelines |
| Confirmation input | Text input -- user must type DELETE. Label: "Type DELETE to confirm"                                                                                            |
| Delete button      | "Permanently delete my account" -- destructive, red -- disabled until DELETE typed exactly (case-sensitive)                                                     |
| Cancel             | "Cancel" -- returns to `/account` with no changes                                                                                                               |

**Post-deletion:** All data deleted, session ended, redirected to `/` with "Your account has been deleted. We've sent you a confirmation email." (corrected 2026-07-10 -- second sentence previously omitted, see Section 6.9)

---

### Screen 10 -- Terms of Service (added 2026-07-10 -- missing from this section since the legal pages shipped 2026-06-10)

**URL:** `/terms` | **Auth:** Any auth state -- no authentication required, authenticated users are not redirected away

Full Terms of Service, statically rendered at build time from `docs/terms-of-service.md` (the single source a solicitor reviews) -- no fields, validation, or error states. Standard public navigation bar and global footer. Linked from the global footer and the Register screen's consent checkbox, both opening in a new tab. Page title: "Terms of Service -- Grant Pathway." The effective date in the source document is `[TO BE CONFIRMED]` and must be set before go-live (P5.1).

---

### Screen 11 -- Privacy Policy (added 2026-07-10 -- missing from this section since the legal pages shipped 2026-06-10)

**URL:** `/privacy` | **Auth:** Any auth state -- no authentication required, authenticated users are not redirected away

Full Privacy Policy, statically rendered at build time from `docs/privacy-policy.md`, including accessible HTML tables for company details, legal bases, data processors, and retention periods. Standard public navigation bar and global footer. Linked from the global footer and the Register screen's consent checkbox, both opening in a new tab. Page title: "Privacy Policy -- Grant Pathway." The effective date in the source document is `[TO BE CONFIRMED]` and must be set before go-live (P5.1).

---

## 8. Application Status Model

### 8.1 Statuses

| Status        | Display label | Meaning                                                                                                                                                           |
| ------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started` | Not started   | Application record created; no guidelines added yet                                                                                                               |
| `in_progress` | In progress   | Guidelines added; user is working through the flow                                                                                                                |
| `approved`    | Approved      | User has reviewed and formally approved all content                                                                                                               |
| `exported`    | Exported      | Approved content has been downloaded at least once                                                                                                                |
| `mismatch`    | Ineligible    | AI detected a clear eligibility mismatch on Step 3 (FR-47); terminal -- no override path (added 2026-07-10, previously missing from this table; see Section 6.12) |

### 8.2 Transition Rules

| From          | To            | Trigger                                                                                                                                              |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started` | `in_progress` | User saves funder guidelines on Step 2                                                                                                               |
| `in_progress` | `approved`    | User approves application on Step 5                                                                                                                  |
| `in_progress` | `mismatch`    | AI detects an eligibility mismatch on Step 3 and user acknowledges the warning (added 2026-07-10, previously missing) -- terminal, no transition out |
| `approved`    | `exported`    | User downloads Word document for the first time                                                                                                      |
| `approved`    | `in_progress` | User re-opens approved application for editing                                                                                                       |
| `exported`    | `in_progress` | User re-opens exported application for editing                                                                                                       |

### 8.3 Deletion Confirmation Prompts

| Status        | Confirmation prompt                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not_started` | "Are you sure you want to delete this application? This cannot be undone."                                                                                                                                                      |
| `in_progress` | "Are you sure you want to delete this application? This cannot be undone."                                                                                                                                                      |
| `approved`    | "Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."                                                                                                  |
| `exported`    | "Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."                                                                         |
| `mismatch`    | Same generic prompt as `not_started`/`in_progress` -- "Are you sure you want to delete this application? This cannot be undone." (`deleteModalText()` has no special case for `mismatch`; added 2026-07-10, previously missing) |

### 8.4 Dashboard Status Colours

**Corrected 2026-07-10 -- verified against `dashboard-populated.tsx`'s `STATUS_CONFIG`; "Not started" was misquoted and `mismatch` was missing entirely.**

| Status      | Colour          |
| ----------- | --------------- |
| Not started | Slate (#64748B) |
| In progress | Amber (#D97706) |
| Approved    | Green (#16A34A) |
| Exported    | Teal (#0D6E6E)  |
| Ineligible  | Red (#DC2626)   |

---

## 9. Data Requirements

All data is stored in PostgreSQL via Supabase (London region). Authentication is managed by Supabase Auth. No persistent data is held at the application layer. Full field-level detail is in `docs/data-model.md`.

### 9.1 Entities

**Updated 2026-07-10** to add the `funders` table (added 2026-06-01, DR-FD-001, missing from this table since) and to reflect the current field picture per `docs/data-model.md` v1.4.

| Entity                | Type              | Purpose                                                                                                                                                                                                                                                                       |
| --------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.users`          | Supabase Auth     | Authentication credentials and email verification                                                                                                                                                                                                                             |
| `user_profiles`       | Application table | First name, last name, feedback consent                                                                                                                                                                                                                                       |
| `funders`             | Application table | The approved funder directory used to populate the Step 1 picker (FR-15). Global reference table, not user-scoped -- users can read active funders but not write to it. **Added 2026-06-01 (DR-FD-001)**                                                                      |
| `charity_profiles`    | Application table | Charity organisational information used as AI context. Extended 2026-05-29 into a "thick profile" (identity, mission/work, financial fields, governance facts) -- see `docs/data-model.md` Section 2 for exactly which of these fields are built versus still documented-only |
| `applications`        | Application table | Application records with status (including the `mismatch` terminal status, FR-47) and step tracking; `funder_id` links to `funders`                                                                                                                                           |
| `application_answers` | Application table | Question and answer pairs per application, including `question_type`, `word_limit`/`char_limit`/`limit_type`, `is_budget_question`, and `is_approved` fields added for the Q&A model (Section 6.6, 6.7)                                                                       |
| `ai_usage_log`        | Application table | Per-user AI request tracking for monthly limit enforcement (50/month -- Section 10.5)                                                                                                                                                                                         |

### 9.2 Relationships

| Relationship                       | Cardinality |
| ---------------------------------- | ----------- |
| User to user_profile               | One-to-one  |
| User to charity_profile            | One-to-one  |
| User to applications               | One-to-many |
| Funder to applications             | One-to-many |
| Application to application_answers | One-to-many |
| User to ai_usage_log               | One-to-many |
| Application to ai_usage_log        | One-to-many |

### 9.3 Data Not Stored

**True today; changing under Phase 6 -- see note below the table.**

| Item                                       | Reason                                                 |
| ------------------------------------------ | ------------------------------------------------------ |
| Funder guidelines (file or text)           | Used for AI processing within the session only (FR-22) |
| Raw AI prompts                             | Held in `lib/prompts.ts` in the codebase               |
| Raw API responses beyond extracted outputs | Only processed outputs are stored                      |
| Beneficiary personal data                  | Out of scope                                           |

**Forward note (added 2026-07-10):** `ADR-DATA-002` originally justified never storing funder guidelines on the grounds that they "may contain commercially sensitive information." That premise was checked on 2026-07-10 against the real 23-document corpus (14 funders) Grant Pathway processes and found unsupported -- these are funders' own publicly published guidance. The ADR was formally revised the same day: guideline text **will** be retained (extracted, page/section-tagged text in Postgres, cascade-deleting with the owning application; retained indefinitely where it backs an approved playbook) once Phase 6 (P6.2a onward) ships. As of this pass, that retention mechanism **has not been built** -- the table above remains an accurate description of the product as it exists in production today. This mirrors how `ADR-DATA-001` treats the item-graph model superseding `application_answers`: a documented future direction, not yet a change to what is live. Track this via `ADR-DATA-002`'s 2026-07-10 revision and the Phase 6 build plan.

### 9.4 Data Retention

| Event                | Action                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| User account active  | All data retained                                                                                                                 |
| 23 months no login   | Inactivity warning email sent (Email 3)                                                                                           |
| 24 months no login   | All user data permanently deleted; confirmation email sent (Email 4)                                                              |
| User deletes account | All user data permanently deleted immediately; confirmation email sent (Email 5, Should Have -- confirmed built, see Section 6.9) |

---

## 10. AI Integration

### 10.1 Model

| Setting       | Value                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Provider      | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2, In-Region)                                                       |
| Model         | claude-sonnet-4-6 (Bedrock model ID: `anthropic.claude-sonnet-4-6`)                                                         |
| Configuration | Referenced via a named config constant in `lib/prompts.ts` -- not hardcoded -- to allow easy swapping without a code search |

### 10.2 Prompt Strategy

All AI prompts are centralised in a single file: `lib/prompts.ts`. Prompts are version-controlled alongside the codebase. Changes to prompts are deployed via standard Vercel deployment (under 2 minutes). No database storage of prompts is required.

**Updated 2026-07-10** to reflect the Q&A model (Section 6.6) and the actual `request_type` values used in the live `generate-summary` and `refine-answer` routes:

| Type                 | Used at       | Inputs                                                                                                                                                                                                                                 |
| -------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `guideline_summary`  | Step 3        | Funder guidelines text + charity profile                                                                                                                                                                                               |
| `refine_answer`      | Step 4        | The charity's own written answer text + the question + its word/character limit (if any) -- **not** funder summary or charity profile; the assist may only restructure/clarify what the charity already wrote, not draw on new context |
| `charity_paraphrase` | Profile setup | Charity Commission lookup result text, paraphrased for the profile fields (authenticated and metered since 2026-06-22)                                                                                                                 |

**Discrepancy resolved 2026-07-10:** `docs/data-model.md`'s documented `ai_usage_log.request_type` enum previously omitted `refine_answer` (the value the live `refine-answer` route actually writes, confirmed in `app/api/refine-answer/route.ts`) — corrected there to list all five DB enum values, with a note on which are live vs. dead.

**Dead code removed 2026-07-10:** the follow-up flagged in 0.4 is now closed. `lib/prompts.ts` no longer exports `buildDraftPrompt` (or the `ApplicationQuestion` type used only by it) — removed along with its dedicated tests in `__tests__/prompts.test.ts`; confirmed zero remaining references, `tsc --noEmit`/lint/test suite all clean. `lib/prompts.ts` now exports exactly the two prompt builders actually used by live routes: `buildSummaryPrompt` and `buildRefinePrompt`.

### 10.3 Processing Mode

AI requests are batch (not streaming). Staged progress indicator messages are shown to the user while the request is in flight. The Continue button is unavailable until processing is complete.

### 10.4 Context Window Management

If the funder guidelines document exceeds 100,000 tokens, a soft warning is displayed to the user before proceeding:

> "Your guidelines document is quite long. For the best results, we recommend uploading only the core sections -- such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."

The user may proceed with the full document. The warning is informational only.

### 10.5 Cost Controls

| Control                | Detail                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Per-user monthly limit | 50 AI requests per user per calendar month (raised from 20 on 2026-06-17, across all three AI routes) |
| Warning threshold      | Soft warning shown at 40 requests (80%)                                                               |
| Hard limit             | AI assist blocked at 50 requests; writing and saving answers is never restricted                      |
| Monitoring             | Usage tracked in `ai_usage_log` table; Amazon Bedrock / AWS console spend cap set as backstop         |
| Monthly target         | Under £100/month total API spend (C1)                                                                 |

### 10.6 Error Handling

| Scenario                             | User-facing behaviour                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API error or timeout (Step 3)        | Progress indicator replaced with error message and Try again button                                                                                                                                                                                                                                                                           |
| API error or timeout (Step 4)        | Inline error shown on the affected question card ("Help me improve this" call failed) with a **Dismiss** action (corrected 2026-07-10 -- not "Try again"; the user retries by clicking "Help me improve this" again, confirmed against `application-step4-draft.tsx`) -- there is no page-load AI call to fail in the Q&A model (Section 6.6) |
| Monthly limit reached                | "Help me improve this" buttons disabled across Step 4; limit message shown. Writing and saving your own answers is never restricted                                                                                                                                                                                                           |
| No manual fallback for AI failure    | Users cannot manually trigger alternative AI processing -- retry is the only option; writing an answer manually is always available regardless of AI status                                                                                                                                                                                   |
| AI service unavailable (kill switch) | When `AI_ENABLED=false`, AI routes return HTTP 503 immediately; message: "The AI service is busy right now. Please try again in a moment." -- the same generic `overloaded` message as real overload, not a dedicated one (corrected 2026-07-10, matched `lib/ai-error-handler.ts`). No quota consumed. Added 2026-06-29                      |

---

## 11. Email Notifications

All emails are sent from `noreply@grantpathway.org.uk` with display name "Grant Pathway". Emails 1 and 2 are handled by Supabase Auth. Emails 3, 4, and 5 are handled by the application's transactional email service.

| #   | Email                            | Trigger                           | Handled by                | Expiry   |
| --- | -------------------------------- | --------------------------------- | ------------------------- | -------- |
| 1   | Email Verification               | User submits registration form    | Supabase Auth             | 24 hours |
| 2   | Password Reset                   | User submits Forgot Password form | Supabase Auth             | 1 hour   |
| 3   | Inactivity Warning               | 23 consecutive months no login    | Application scheduled job | --       |
| 4   | Account Deleted (inactivity)     | 24 months no login                | Application scheduled job | --       |
| 5   | Account Deleted (user initiated) | User completes deletion flow      | Application               | --       |

### Email 1 -- Email Verification

**Subject:** Verify your Grant Pathway email address

Body: Hi [First name], Thanks for signing up to Grant Pathway. Please verify your email address to activate your account. [Verify my email address] button. Link expires in 24 hours. If you did not create a Grant Pathway account, you can ignore this email.

### Email 2 -- Password Reset

**Subject:** Reset your Grant Pathway password

Body: Hi [First name], We received a request to reset your password. Click the link below to choose a new one. [Reset my password] button. Link expires in 1 hour. If you did not request a password reset, please ignore this email -- your account is safe.

### Email 3 -- Inactivity Warning

**Subject:** Your Grant Pathway account will be deleted in 30 days

**Corrected 2026-07-10 -- body previously described different wording; verified against `lib/emails/inactivity-warning.ts`.** Body: Hi [First name], We haven't seen you on Grant Pathway for nearly two years. To protect your privacy, we automatically delete inactive accounts after 24 months. Your account will be permanently deleted on [deletion date]. If you'd like to keep it, simply sign in before that date. [Sign in to keep my account] button. If you no longer need your account, you don't need to do anything -- it will be deleted automatically on [deletion date].

Deletion date shown as DD Month YYYY. Only one inactivity warning is sent per inactivity cycle. Sent at 23 months of inactivity (30 days before the 24-month deletion).

### Email 4 -- Account Deleted (Inactivity)

**Subject:** Your Grant Pathway account has been deleted

**Corrected 2026-07-10** -- verified against `lib/emails/account-deleted-inactivity.ts`. Body: Hi [First name], As we notified you previously, your Grant Pathway account has now been permanently deleted due to 24 months of inactivity. All your data, including your charity profile and saved applications, has been removed. If you'd like to use Grant Pathway again, you're welcome to create a new free account. [Create a new account] button (corrected from "Register a new account").

### Email 5 -- Account Deleted (User Initiated) -- Should Have

**Subject:** Your Grant Pathway account has been deleted

**Corrected 2026-07-10** -- verified against `lib/emails/account-deleted-user.ts`. Body: Hi [First name], Your Grant Pathway account has been permanently deleted. All your data, including your charity profile and saved applications, has been removed. If you change your mind, you can create a new account at any time -- it's free. [Create a new account] button (corrected from "Register a new account"; the previous "Thank you for using Grant Pathway. We hope it was useful" closing sentence does not exist in the live email).

Note: The subject line is identical to Email 4. A user will only ever receive one or the other, never both.

**Not independently verified (Emails 1 and 2):** these are handled by Supabase Auth's own email templates, not custom code in this repository -- `supabase/config.toml` has no custom template configured for either (both commented out), so any customisation exists only in the production Supabase dashboard, which is outside what this review could check.

---

## 12. Non-Functional Requirements

### 12.1 Performance

**Updated to reflect the Q&A model (Section 6.6) -- there is no longer a single "AI draft answer generation" step to time; the equivalent live metric is the per-question "Help me improve this" refine action.**

| Metric                                                            | Target           |
| ----------------------------------------------------------------- | ---------------- |
| Page loads and navigation                                         | Under 3 seconds  |
| AI guideline summarisation -- standard documents (up to ~8 pages) | Under 30 seconds |
| AI guideline summarisation -- large documents (over 8 pages)      | Under 45 seconds |
| AI answer refine ("Help me improve this", per question)           | Under 15 seconds |

### 12.2 Availability

| Metric                  | Target    |
| ----------------------- | --------- |
| Uptime                  | 99.5%     |
| Maximum annual downtime | ~44 hours |

### 12.3 Scalability

| Phase                               | Expected concurrent users |
| ----------------------------------- | ------------------------- |
| At launch                           | ~10                       |
| At scale (12-18 months post-launch) | ~100                      |

Architecture should scale from launch to 12-18 month target without a major rebuild. Managed cloud services are preferred.

### 12.4 Security

| Control               | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encryption in transit | TLS 1.2 or higher; HTTPS enforced across all pages and API calls                                                                                                                                                                                                                                                                                                                                                                 |
| Encryption at rest    | Database-level encryption enabled on all data stores                                                                                                                                                                                                                                                                                                                                                                             |
| Passwords             | Minimum 12 characters, must contain both letters and digits; leaked-password check enabled (HaveIBeenPwned); secure password change enabled; current password required to change password. Hardened 2026-06-29 (VQ-009), up from a 6-character minimum with no complexity rules. Client-side forms (register, reset, account settings) enforce the same 12-character/letters-and-digits rule as of 2026-07-10 -- see Section 6.1 |
| MFA                   | ~~Available as opt-in (FR-07, Should Have); not mandatory~~ -- **Not offered.** FR-07 demoted to Won't Have 2026-06-12; fully removed from the codebase. See Section 3.3 for the risk analysis                                                                                                                                                                                                                                   |
| Session timeout       | Automatic logout after 60 minutes of inactivity                                                                                                                                                                                                                                                                                                                                                                                  |
| Security baseline     | OWASP Top 10                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Secrets management    | No credentials or API keys committed to the repository (private, proprietary licence)                                                                                                                                                                                                                                                                                                                                            |

### 12.5 Browser & Device Support

| Category             | Supported                                              |
| -------------------- | ------------------------------------------------------ |
| Desktop browsers     | Chrome, Edge, Firefox, Safari (latest 2 versions each) |
| Mobile browsers      | Chrome on Android; Safari on iOS                       |
| Minimum screen width | 320px                                                  |
| Internet Explorer    | Not supported                                          |

The application is designed desktop-primary (PDR-UI-003). It must remain usable on mobile browsers as a byproduct of responsive layout. Full mobile optimisation is deferred to a future phase.

### 12.6 Accessibility

- WCAG 2.2 Level AA from day one -- a design-in requirement, not a retrofit
- Testing: automated scanning (axe DevTools / Lighthouse), keyboard-only navigation testing, screen reader testing (NVDA + Chrome), manual WCAG 2.2 AA checklist pre-launch, colour contrast verification
- Independent third-party audit deferred to a pre-scaling milestone

---

## 13. Branding & Design

### 13.1 Technology

| Concern              | Choice                                                               |
| -------------------- | -------------------------------------------------------------------- |
| UI component library | shadcn/ui (built on Radix UI primitives + Tailwind CSS)              |
| Design approach      | Lightweight design-first for 6 key screens before build (PDR-UI-002) |

The 6 screens requiring lightweight design before build: dashboard, charity profile, guideline input, AI output review, export, account settings.

### 13.2 Colour Palette

| Role          | Colour      | Hex     |
| ------------- | ----------- | ------- |
| Primary       | Deep teal   | #0D6E6E |
| Primary light | Soft teal   | #E6F4F4 |
| Accent        | Warm amber  | #D97706 |
| Success       | Muted green | #16A34A |
| Neutral dark  | Slate       | #1E293B |
| Neutral light | Off-white   | #F8FAFC |
| White         | White       | #FFFFFF |

### 13.3 Typography

| Role              | Font  | Weight          | Minimum size |
| ----------------- | ----- | --------------- | ------------ |
| Headings          | Inter | Bold (700)      | 20px         |
| Sub-headings      | Inter | Semi-bold (600) | 16px         |
| Body text         | Inter | Regular (400)   | 16px         |
| Labels & captions | Inter | Medium (500)    | 14px         |

### 13.4 Tone of Voice

| Principle     | In practice                                          |
| ------------- | ---------------------------------------------------- |
| Plain English | "Here's a draft answer" not "AI-generated output"    |
| Encouraging   | Acknowledge the user is doing something valuable     |
| Honest        | Clear that this is a starting point requiring review |
| Respectful    | Non-patronising; charities know their work           |
| Concise       | Short sentences; active voice; no padding            |

---

## 14. Success Metrics

Full detail in `docs/PRD inputs/success-metrics.md`. All metrics are derived from Supabase data records. No third-party analytics platform is included in v1.

### 14.1 Acquisition

| Metric                             | Target |
| ---------------------------------- | ------ |
| Registered users -- end of month 1 | 10     |
| Registered users -- end of month 2 | 40     |
| Registered users -- end of month 3 | 90     |

### 14.2 Activation

| Metric                                                 | Target |
| ------------------------------------------------------ | ------ |
| % registered users who complete charity profile        | 70%    |
| % registered users who create at least one application | 50%    |

### 14.3 Completion

| Metric                                            | Target |
| ------------------------------------------------- | ------ |
| % created applications that reach Exported status | 55%    |
| Total Word documents exported by end of month 6   | 100    |

The export completion rate is the single most important product metric.

### 14.4 Retention

| Metric                                       | Target |
| -------------------------------------------- | ------ |
| % users who log in more than once            | 50%    |
| % users who create more than one application | 30%    |

### 14.5 Operational

| Metric                                        | Target            |
| --------------------------------------------- | ----------------- |
| Monthly AI API spend                          | Within £100/month |
| Average AI requests per active user per month | Fewer than 10     |

### 14.6 User Feedback

| Metric                                                   | Target |
| -------------------------------------------------------- | ------ |
| % of interviewed users who would recommend Grant Pathway | 80%    |

Applies to users who opt in to feedback interviews (FR-08, Should Have). Deferred if FR-08 is not in v1 build.

---

## 15. Compliance & Pre-Launch Requirements

**Updated 2026-07-10 -- status corrected against `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` (P5.1).** All three items have progressed substantially since this section was last written; none is now fully closed, but none is "to be confirmed" or "to be drafted" from a standing start either.

| Item                         | Requirement                                                                                                                                                                                                                                                                            | Status                                                                                                                                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS Data Processing Addendum | Confirm that the AWS Data Processing Addendum covers Amazon Bedrock usage and satisfies UK GDPR obligations before launch. AI processing occurs within UK/EEA via Bedrock eu-west-2 (In-Region primary, EU Geo fallback) -- no international transfer or SCCs are required (DR-DP-002) | **Confirmed (2026-06-22).** Model invocation logging confirmed disabled in the Bedrock eu-west-2 console; the AWS DPA is automatically in force via AWS Service Terms, no separate acceptance required. See `docs/legal/AWS-DPA-reference.md` and the DR-DP-003 review note. |
| Terms of Service             | Publish Terms of Service before launch. Must state: Grant Pathway does not guarantee funding outcomes; does not submit applications on behalf of charities; makes no representations to funders                                                                                        | **Live (built 2026-06-10).** `/terms` renders `docs/legal/terms-of-service.md` (v1.2). **Outstanding before P5.1 can close:** the effective date is still `[TO BE CONFIRMED]` in the source document, and solicitor review has not yet taken place.                          |
| Privacy Policy               | Publish Privacy Policy before launch. Must cover: data collected, Supabase London hosting, Vercel global edge, AI processing via Amazon Bedrock eu-west-2 (UK/EEA -- data does not leave UK/EEA), no-AI-training commitment, user rights, retention periods                            | **Live (built 2026-06-10).** `/privacy` renders `docs/legal/privacy-policy.md` (v1.4). Same two items outstanding: effective date `[TO BE CONFIRMED]`, solicitor review pending.                                                                                             |

A compliance review window remains reserved in the project timeline ahead of launch; the launch date itself is not committed (see Section 1) and is no longer tied to a fixed calendar date.

---

## 16. Acceptance Criteria

Testable Given/When/Then acceptance criteria for all functional requirements are defined in:

`docs/PRD inputs/acceptance-criteria.md`

Criteria are organised by the same functional sections used in this document. Should Have requirements include criteria that apply only if the requirement is built. **Updated 2026-07-10:** that document now includes a full FR-45/46/47 section (Section 9.10) and a FR-48 section (Section 9.11), FR-29 is corrected to Must Have, and the FR-31A numbering gap against the canonical FR-01 to FR-48 list is explicitly flagged there (not silently resolved, since it is real, built, and already load-bearing in code comments -- see that document's FR-31A note).

---

## Appendix A -- Glossary

| Term                   | Definition                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS DPA                | AWS Data Processing Addendum -- governs how Amazon Web Services (including Bedrock) processes customer data, satisfying UK GDPR obligations                                                                                                                                                                                                 |
| Charity Commission API | The public API provided by the Charity Commission for England and Wales, used to look up registered charity details                                                                                                                                                                                                                         |
| CIC                    | Community Interest Company -- the intended long-term legal structure for owning and operating Grant Pathway                                                                                                                                                                                                                                 |
| CVS                    | Council for Voluntary Service -- local infrastructure bodies that support charities and voluntary organisations                                                                                                                                                                                                                             |
| HaveIBeenPwned         | A public database of passwords known to have been exposed in prior data breaches -- Supabase Auth checks new passwords against it as a leaked-password check (enabled 2026-06-29, VQ-009)                                                                                                                                                   |
| NCSC                   | National Cyber Security Centre -- source of the original UK password guidance referenced in NFR-04 (10-character minimum, no complexity rules). The live policy has since been hardened beyond pure NCSC minimalism to a 12-character minimum with mandatory letters and digits, plus the HaveIBeenPwned leaked-password check (2026-06-29) |
| OWASP Top 10           | Open Worldwide Application Security Project's list of the ten most critical web application security risks                                                                                                                                                                                                                                  |
| SCCs                   | Standard Contractual Clauses -- contractual mechanisms used to legitimise international data transfers under UK GDPR                                                                                                                                                                                                                        |
| WCAG 2.2 AA            | Web Content Accessibility Guidelines version 2.2, Level AA -- the accessibility standard the application must meet                                                                                                                                                                                                                          |
| shadcn/ui              | UI component library built on Radix UI primitives and Tailwind CSS -- the chosen component library for v1                                                                                                                                                                                                                                   |
| Supabase               | Managed PostgreSQL database and authentication service used for all data storage (London region)                                                                                                                                                                                                                                            |

---

## Appendix B -- Related Documents

**Paths corrected 2026-07-10.** All entries below used a stale `business/...` prefix; the live repository holds these under `docs/...`. Two entries have also moved to a different subfolder, not just a prefix swap: the Business Requirements Document and the Technology Stack document (see notes below the table).

| Document                            | Location                                                 | Purpose                                                  |
| ----------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| Business Requirements Document      | `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md`  | Business context, constraints, risks, and stakeholders   |
| Non-Functional Requirements         | `docs/non-functional-requirements.md`                    | Full NFR detail                                          |
| Data Model                          | `docs/data-model.md`                                     | Entity definitions, field-level detail, relationships    |
| MoSCoW Feature Register             | `docs/moscow-feature-register.md`                        | Consolidated feature priorities and BRD divergences      |
| IA & Navigation                     | `docs/information-architecture-and-navigation.md`        | Route structure, nav components, user flows              |
| Screen Requirements                 | `docs/PRD inputs/screen-requirements.md`                 | Full screen-level field and validation detail            |
| Acceptance Criteria                 | `docs/PRD inputs/acceptance-criteria.md`                 | Given/When/Then criteria for all functional requirements |
| Application Status Model            | `docs/PRD inputs/application-status-model.md`            | Status definitions, transitions, deletion prompts        |
| Email Notifications                 | `docs/PRD inputs/email-notifications.md`                 | Full email body content and trigger rules                |
| Success Metrics                     | `docs/PRD inputs/success-metrics.md`                     | Full metrics detail with measurement approach            |
| PRD Decisions Index                 | `docs/PRD decisions/PRD-DECISIONS-INDEX.md`              | PRD decision records                                     |
| User Personas, Journeys & Use Cases | `docs/user-personas-journeys-and-use-cases.md`           | Full persona and journey detail                          |
| Technology Stack                    | `docs/Technical Decision and Design/technology-stack.md` | Full technology stack detail                             |
| Future Phases                       | `docs/future-phases.md`                                  | Post-v1 roadmap items                                    |

**Notes on relocations:** the Business Requirements Document is not at a top-level `docs/BRD-Grant-Pathway-v1.md` path -- the current, authoritative BRD lives in the `docs/BRD plus decisions Mark Two/` subfolder as `BRD-Grant-Pathway.md` (see the filename/version mismatch correction note under Document Control). The Technology Stack document is not at a top-level `docs/technology-stack.md` path -- it lives in `docs/Technical Decision and Design/technology-stack.md`.

---

_Document status: Version 0.30 Draft_
_Compliance section (Section 15) -- AWS DPA confirmed 2026-06-22; Terms of Service and Privacy Policy are live, with effective dates and solicitor review still outstanding before P5.1 can close. See Section 15 for full detail._
_Last updated: 2026-07-11_
