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

| Element            | Content                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document title** | [Grant name] — Application                                                                                                                                                  |
| **Funder**         | [Funder name]                                                                                                                                                               |
| **Exported**       | [Date exported, e.g. 16 April 2026]                                                                                                                                         |
| **Disclaimer**     | _"This draft was generated with AI assistance and reviewed by [user's full name]. Please review carefully before submitting to the funder."_                                |
| **Body**           | Each application question as a bold heading, followed by the approved answer in plain text beneath it                                                                       |
| **Footer**         | _"Prepared using Grant Pathway v[version number] — grantpathway.org.uk"_, plus a page number ("Page N of NN") on the Word export (added 2026-07-02 — see Revision History). |

### Formatting

- Font: Calibri 11pt body, Calibri 14pt bold for question headings
- No Grant Pathway logo, colours, or imagery in the document body
- Single-column layout, A4 page size
- Standard margins (2.54cm)
- The footer version number reflects the application version at time of export (e.g. _Grant Pathway v1.0_) — **confirmed intentional 2026-07-02, see Revision History**
- The Word export footer includes a page number ("Page N of NN"), added 2026-07-02. Not applicable to the plain-text export, which has no concept of pages.

### Plain text export (Could Have — FR-38)

If plain text export is implemented in a future phase, it will follow the same structural order (title, funder, date, disclaimer, Q&A pairs, attribution) with formatting reduced to plain line breaks and dashes.

## Rationale

The exported document is submitted by the user to a funder — it is the user's work, not a Grant Pathway marketing piece. Applying brand colours or a logo would be unprofessional and potentially confusing to funders. The disclaimer is essential to meet the liability position established in DR-LC-002 and to remind users of their responsibility to review before submitting. Including the funder name, grant name, and export date gives the document clear context that remains useful if opened weeks after creation. The version number in the footer provides traceability for support and issue reporting without intruding on the document's purpose.

## Date Decided

2026-04-16

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-02 | Footer version number briefly removed from both export formats, then **reinstated the same day** once Wac recalled it was included deliberately for support/audit traceability, not an oversight. Net change that stuck: a page number ("Page N of NN") added to the Word export footer, using `docx`'s `PageNumber.CURRENT`/`PageNumber.TOTAL_PAGES` fields — not applicable to the plain-text export, which has no concept of pages. The version number itself is unchanged from the original decision. |
| 2026-07-02 | Raised in passing: the footer's version string has always been a hardcoded literal (`"v1"`), not derived from `package.json` (currently `0.1.0`) or any other real source of truth — so it has never actually tracked anything. A proper versioning strategy for the service is still an open question; see `CHANGELOG.md` for a proposal.                                                                                                                                                                |
