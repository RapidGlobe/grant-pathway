---
id: PDR-DH-003
category: Data & File Handling
status: Decided
---

# PDR-DH-003 — Export Format and Structure

## Question

What exactly does the exported document contain, how is it structured, and does it include any Grant Pathway branding or guidance notes?

## Context

The BRD specifies that users can export approved application content as a Word (.docx) or plain text (.txt) file (FR-37, FR-38). However, the exact structure and content of the export has not been defined. Key questions include: does the export include the funder name and grant name as a header? Are question prompts included alongside answers? Is there a disclaimer reminding the user to review before submitting? Does the Word export include any Grant Pathway branding (logo, colours)? Does the plain text version follow the same structure? Getting this right matters because the exported document is the final product the user takes away — it is what they copy into a funder's portal. It must be clean, clear, and immediately usable.

## Options

- **Option A — Clean content only:** Questions and answers only. No header, disclaimer, or branding. Minimal but provides no context and increases liability risk.
- **Option B — Structured with disclaimer, no branding:** Funder name, grant name, date, AI disclaimer, questions and answers, and a discreet plain-text footer attribution including the Grant Pathway version number. The document is the user's work — no logo or brand colours in the body.
- **Option C — Structured with full Grant Pathway branding:** As Option B but with teal/amber colour scheme and logo. Inappropriate for a document being submitted to a funder as the user's own work.

## Decision

**Option B — Structured document with disclaimer and discreet footer, no body branding.**

### Export document structure

| Element            | Content                                                                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document title** | [Grant name] — Application                                                                                                                                                                                                                                  |
| **Funder**         | [Funder name]                                                                                                                                                                                                                                               |
| **Exported**       | [Date exported, e.g. 16 April 2026]                                                                                                                                                                                                                         |
| **Disclaimer**     | _"Disclaimer: This application was prepared with AI assistance and reviewed by [user's full name]. Please review carefully before submitting to the funder."_ (first sentence reworded 2026-07-30 to match the built implementation — see Revision History) |
| **Body**           | Each application question as a bold heading, followed by the approved answer in plain text beneath it                                                                                                                                                       |
| **Footer**         | _"Prepared using Grant Pathway v[version number] — grantpathway.org.uk"_, plus a page number ("Page N of NN") on the Word export (added 2026-07-02 — see Revision History).                                                                                 |

### Formatting

- Font: Calibri 11pt body, Calibri 14pt bold for question headings
- No Grant Pathway logo, colours, or imagery in the document body
- Single-column layout, A4 page size
- Standard margins (2.54cm)
- The footer version number reflects the application version at time of export (e.g. _Grant Pathway v2026.07.02-a2ca520_ — format changed 2026-07-02, see Revision History) — **confirmed intentional, kept in the footer for support/audit traceability**
- The Word export footer includes a page number ("Page N of NN"), added 2026-07-02. Not applicable to the plain-text export, which has no concept of pages.

### Plain text export (Could Have — FR-38)

If plain text export is implemented in a future phase, it will follow the same structural order (title, funder, date, disclaimer, Q&A pairs, attribution) with formatting reduced to plain line breaks and dashes.

## Rationale

The exported document is submitted by the user to a funder — it is the user's work, not a Grant Pathway marketing piece. Applying brand colours or a logo would be unprofessional and potentially confusing to funders. The disclaimer is essential to meet the liability position established in DR-LC-002 and to remind users of their responsibility to review before submitting. Including the funder name, grant name, and export date gives the document clear context that remains useful if opened weeks after creation. The version number in the footer provides traceability for support and issue reporting without intruding on the document's purpose.

## Date Decided

2026-04-16

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-30 | **Disclaimer wording reconciled — `GAP-24` closed (built, not merely tasked).** The export route's second sentence read _"All content has been checked for accuracy before submission."_ That is a claim the service makes in the user's name, on a document that goes to a funder, and it cannot be true — nothing in the product checks accuracy. Replaced with this decision's specified _"Please review carefully before submitting to the funder."_, which states the user's responsibility instead of asserting a completed check. The **first** sentence moved the other way: the spec said _"This draft was generated with AI assistance"_, but the implementation's _"This application was prepared with AI assistance"_ was a deliberate 2026-06-01 change made to match the Step 5 confirmation checkbox the user actually ticks (`CHANGELOG.md`), so the spec has been amended to the built wording rather than the code reverted. One `disclaimer` constant feeds both the .docx and .txt exports, so both formats change together. Found by the 2026-07-29 Opus audit via the Phase 5 restructure review, which identified `GAP-24` as the cheapest and most consequential of six unbuilt spec deviations filed under `P5.3`. |
| 2026-07-17 | **"Exported" date fixed to one timestamp per application, not one per request.** WJ spotted a 2-minute gap between the "Date:" shown in a .txt export and a .docx export of the same application — `app/api/export/[applicationId]/route.ts` computed `exportDate` as `new Date()` live on every request, so exporting each format separately (or re-downloading either weeks later) showed a different date each time. New `applications.first_exported_at` column (migration `20260717000000`) is set once, on the application's very first export in either format, and never overwritten again; the route now reads this column for the displayed date instead. `applications.last_exported_at` (intentionally refreshed on every export, drives the separate re-export warning) is unaffected. See `docs/data-model.md` v1.14 and `docs/Technical Decision and Design/technical-design.md` v1.19.                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-02 | Footer version number briefly removed from both export formats, then **reinstated the same day** once Wac recalled it was included deliberately for support/audit traceability, not an oversight. Net change that stuck: a page number ("Page N of NN") added to the Word export footer, using `docx`'s `PageNumber.CURRENT`/`PageNumber.TOTAL_PAGES` fields — not applicable to the plain-text export, which has no concept of pages. The version number itself is unchanged from the original decision.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-02 | Raised in passing: the footer's version string had always been a hardcoded literal (`"v1"`), not derived from `package.json` (`0.1.0`) or any other real source of truth — it had never actually tracked anything. Wac approved a proposal (`CHANGELOG.md`) to auto-derive it instead from Vercel's build-time Git commit metadata. **Implemented same day:** format is now `YYYY.MM.DD-<short git SHA>` (e.g. `2026.07.02-a2ca520`), computed once at build time in `next.config.ts` and exposed via `lib/version.ts`'s `getAppVersion()`. Falls back to `"dev"` outside Vercel. No manual bump ever required again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
