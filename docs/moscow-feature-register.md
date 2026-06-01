# MoSCoW Feature Register — Grant Pathway v1
**Version:** 1.4
**Last updated:** 2026-06-01

This document consolidates the MoSCoW priority for all 44 functional requirements in Grant Pathway v1. It is the single authoritative reference for feature scope and is used directly by the PRD.

Priorities are derived from the BRD (Section 9), PRD decision records, screen requirements, and email notifications specification. Where the screen requirements differ from the BRD, the screen requirements take precedence as the more recent and detailed specification — these divergences are noted.

---

## Summary

| Priority | Count | FRs |
|----------|-------|-----|
| Must Have | 41 | FR-01–06, FR-09–31, FR-32–37, FR-39–43, FR-45–46 |
| Should Have | 4 | FR-07, FR-08, FR-38, FR-44 |
| Could Have | 0 | — |
| Won't Have (v1) | 0 | All Won't Have items are recorded in `business/v1-out-of-scope.md` |

---

## 9.1 Authentication & Accounts

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-01 | Register with full name, email, and password | **Must Have** | |
| FR-02 | Validate email format; enforce 10-character minimum password | **Must Have** | |
| FR-03 | Send verification email; account inactive until link clicked | **Must Have** | |
| FR-04 | Allow registered users to sign in with email and password | **Must Have** | |
| FR-05 | Self-service password reset via email | **Must Have** | |
| FR-06 | Auto-logout after 60 minutes of inactivity | **Must Have** | |
| FR-07 | Optional MFA as opt-in feature; not mandatory | **Should Have** | Low friction for non-technical users is the priority; MFA may be made mandatory in a future phase |
| FR-08 | Feedback interview opt-in at registration; response recorded | **Should Have** | Omit if feedback interview programme is not ready at launch |

---

## 9.2 Charity Profile

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-09 | Prompt user to set up charity profile after account activation | **Must Have** | |
| FR-10 | Query Charity Commission API and pre-fill charity details | **Must Have** | England and Wales only in v1. OSCR (Scotland) and CCNI (Northern Ireland) lookup planned before general release (BD-02) |
| FR-11 | Manual entry fallback if API unavailable or charity not found | **Must Have** | Scottish and NI charities use manual entry in v1; full workflow available without restriction |
| FR-12 | Charity profile includes defined fields — thick profile (BD-02) | **Must Have** | Mark Two introduces a thick profile covering identity, address and contact, mission and work, financial fields (from latest signed accounts), and supporting document status flags. Full field set defined in `BRD plus decisions Mark Two` Section 4.2 and `data-model.md` |
| FR-13 | Allow users to update charity profile at any time | **Must Have** | |
| FR-14 | Charity profile used as input to all AI-generated content | **Must Have** | |

---

## 9.3 Application Management

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-15 | Create a new application with grant name and funder selected from approved directory | **Must Have** | **Revised 2026-06-01 (DR-FD-001).** Funder is selected from a searchable curated picker (seeded from `funders` DB table) rather than free-text entry. A "My funder isn't listed — request it" escape hatch is displayed below the picker. BRD also mentions optional application deadline; this field is not included in the screen requirements and is deferred. |
| FR-16 | Display all saved applications on the dashboard | **Must Have** | |
| FR-17 | Open and continue any saved application from the dashboard | **Must Have** | |
| FR-18 | Auto-save at regular intervals; manual save also available | **Must Have** | Auto-save: on Continue + every 60 seconds in background (silent) |
| FR-19 | Allow deletion of a saved application | **Must Have** | |
| FR-20 | Single account supports multiple saved applications | **Must Have** | |

---

## 9.4 Funder Guideline Handling

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-21 | Input guidelines by paste or file upload (PDF or .docx) | **Must Have** | Max file size 10MB (PDR-DH-001). Note: Vercel free tier has a 4.5MB API route limit — technical flag raised; solution is Vercel Pro or client-side upload to Supabase Storage |
| FR-22 | Guidelines used for AI processing only; not permanently stored | **Must Have** | |
| FR-23 | Plain-language error for unsupported format; prompt to paste | **Must Have** | Three error states: wrong format, too large, scanned PDF |

---

## 9.5 AI Guideline Summarisation

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-24 | Generate plain-English summary of funder guidelines | **Must Have** | Summary covers: funder priorities, project types, eligible organisations, evidence expectations, plain-English explanation of each question |
| FR-25 | Summarisation uses both funder guidelines and charity profile | **Must Have** | |
| FR-26 | Visible progress indicator during AI processing | **Must Have** | Staged messages: *"Reading your funder guidelines…"* → *"Almost there…"* |
| FR-27 | Plain-language error and retry on API failure | **Must Have** | |

---

## 9.6 AI Draft Answer Generation

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-28 | Charity writes draft answers section by section; AI assists with structure and clarity on request only | **Must Have** | **Revised 2026-05-28.** Original requirement was "generate draft answers automatically". Replaced with charity-authored Q&A model: the charity writes all content; AI may improve structure/clarity of a written answer on request ("Help me improve this"). AI never generates answers from scratch. See STEP4-REDESIGN-PROPOSAL.md |
| FR-29 | Word limits and character limits auto-extracted from funder guidelines; displayed alongside each section/question | **Must Have** | **Revised 2026-05-28; extended 2026-05-29 (BD-05).** Both word limits and character limits are supported (`limit_type: words \| characters \| none`). The AI extracts the limit type and value for each question; the Step 4 counter displays "X / N words" or "X / N characters" as appropriate. |
| FR-30 | Per-section AI refine uses the charity's own answer text; may not add facts or change claims | **Must Have** | Replaces old "draft generation uses question + charity profile". AI only refines a written answer — it does not write from scratch |
| FR-31 | Budget sections/questions flagged in amber; AI assist disabled on budget sections | **Must Have** | **Revised 2026-05-28.** Original "flag draft exceeding word limit". Now: budget questions/sections are visually distinct; AI assist is disabled; user enters own figures |
| FR-45 | Question-level typing: each extracted question carries a `question_type` (BD-04) | **Must Have** | Types: `narrative \| data_entry \| financial \| dropdown \| date \| file_upload`. Narrative questions show a writing card. Data-entry and financial questions are pre-filled from the charity profile. Dropdown, date, and file_upload questions are displayed as read-only reminders only. Replaces funder-level type as the mechanism for question handling |
| FR-46 | Three-tier funder coverage model displayed to the user (BD-07) | **Must Have** | Tier 1 (Full — narrative questions, profile pre-fill), Tier 2 (Partial — narrative subset of a portal form), Tier 3 (Guidance — free-form narrative document). Coverage tier displayed on new application screen, Step 3 summary card, and export screen |

---

## 9.7 Mandatory Review & Approval

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-32 | Present three plain-language review prompts alongside each draft | **Must Have** | (1) Does this accurately describe your charity and project? (2) Are all figures, dates, and facts correct? (3) Does this answer the question that was asked? |
| FR-33 | Require explicit approval before content is saved; cannot be bypassed | **Must Have** | |
| FR-34 | User can edit draft text directly before approving | **Must Have** | |
| FR-35 | User can discard draft and regenerate or write their own answer | **Must Have** | |
| FR-36 | Approved content visually marked and saved to application record | **Must Have** | |

---

## 9.8 Export

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-37 | Export approved content as a Word (.docx) file | **Must Have** | Document structure defined in PDR-DH-003: title, funder, date, AI disclaimer, Q&A body, footer with version number |
| FR-38 | Export approved content as a plain text (.txt) file | **Should Have** | Not present in screen requirements for Step 5; deferred if time-constrained |
| FR-39 | Prevent export if no content has been approved | **Must Have** | |

---

## 9.9 Account Deletion

| Ref | Requirement (summary) | Priority | Notes |
|-----|----------------------|----------|-------|
| FR-40 | Allow users to permanently delete their account from account settings | **Must Have** | |
| FR-41 | Display plain-language warning before deletion | **Must Have** | |
| FR-42 | Require explicit confirmation before deletion | **Must Have** | BRD specifies re-entering email address. Screen requirements specify typing the word `DELETE` (uppercase, case-sensitive). Screen requirements take precedence |
| FR-43 | Permanently delete all user data on confirmation | **Must Have** | Deletes: user account, charity profile, all applications and answers, AI usage records |
| FR-44 | Send confirmation email after deletion | **Should Have** | Email 5 in email notifications spec. Only implemented if FR-44 is in v1 build scope |

---

## Should Have — Build Conditions

The three remaining Should Have requirements and their build conditions are summarised below.

| Ref | Requirement | Build condition |
|-----|-------------|----------------|
| FR-07 | Optional MFA | Build if authentication roadmap supports it; does not affect core user journey |
| FR-08 | Feedback opt-in at registration | Build if the feedback interview programme is confirmed as active at launch |
| FR-38 | Plain text (.txt) export | Build if time permits; low complexity addition to Step 5 export options |
| FR-44 | Deletion confirmation email | Build if transactional email service is confirmed as in scope; depends on FR-40–43 being complete |

---

## Divergences from BRD

The following requirements have implementation details that differ from the BRD. The screen requirements take precedence in all cases.

| Ref | BRD specification | Implemented as | Source |
|-----|------------------|----------------|--------|
| FR-12 | Profile fields include annual income band, separate charitable objects and main activities fields | Annual income band removed; charitable objects and main activities merged into a single *"What does your charity do?"* field | Screen requirements, Screen 6 |
| FR-15 | New application includes optional application deadline field | Deadline field not included in v1 | Screen requirements, Screen 7 Step 1 |
| FR-42 | Confirm deletion by re-entering email address | Confirm deletion by typing the word DELETE (uppercase, case-sensitive) | Screen requirements, Screen 9 |

---

---

## Revisions since initial publication

| Ref | Original requirement | Revised to | Date | Reason |
|-----|---------------------|------------|------|--------|
| FR-28 | Generate draft answers automatically using AI | Charity writes answers; AI assists on request | 2026-05-28 | Funder AI guidance research (Henry Smith, NLCF) showed AI-generated answers disadvantage charities; charity-authored model produces better applications |
| FR-29 | User specifies word limit before generation (Should Have) | Word limits auto-extracted from guidelines (Must Have) | 2026-05-28 | AI already extracts questions with word limits in Step 3; no user input required |
| FR-31 | Flag draft exceeding word limit (Should Have) | Budget sections flagged; AI assist disabled on budget (Must Have) | 2026-05-28 | The real risk is inaccurate financial figures, not over-length narrative |

*Status: Current — reflects 2026-05-29 implementation*

---

## Document History

| Version | Date | Author | Summary of changes |
|---------|------|--------|--------------------|
| 1.0 | 2026-04-16 | Rapidglobe Ltd | Initial version |
| 1.1 | 2026-05-28 | Rapidglobe Ltd | FR-28, FR-29, FR-31 revised to reflect Q&A model; FR-29 and FR-31 promoted to Must Have; revisions table added |
| 1.2 | 2026-05-29 | Rapidglobe Ltd | Document history table added to support multi-contributor development |
| 1.3 | 2026-05-29 | Rapidglobe Ltd | FR-10/11 updated: OSCR/CCNI planned before general release (BD-02). FR-12 updated: thick profile description (BD-02). FR-29 extended: character limits supported alongside word limits (`limit_type`, BD-05). FR-45 added: question-level typing (BD-04). FR-46 added: three-tier funder coverage model (BD-07). Summary table updated (39 → 41 Must Have). |
