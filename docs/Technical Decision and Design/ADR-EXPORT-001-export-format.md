---
id: ADR-EXPORT-001
category: Export
status: Decided
---

# ADR-EXPORT-001 — Export Format

## Context

Grant Pathway's final output is a document that the user submits to their funder. After completing Step 5 (Review & Export), users must be able to download their application in a format suitable for submission or further editing. The export format must be accessible to charity sector users who primarily work with Microsoft Word and similar tools.

## Options Considered

- **Option A — Microsoft Word (.docx) only:** Most widely used format in the charity sector. Editable after download. Compatible with all major word processors (Microsoft Word, LibreOffice, Google Docs).
- **Option B — PDF only:** Professional, non-editable. Suitable for direct submission but cannot be edited after export.
- **Option C — Word (.docx) and PDF:** Offers both formats. Most flexibility. Slightly more implementation work.
- **Option D — Plain text (.txt):** Simplest to generate. Loses all formatting. Not appropriate for a professional grant application document.
- **Option E — Google Docs export (via Google Drive API):** Directly saves to the user's Google Drive. Requires OAuth integration with Google. Over-complex for v1.

## Decision

**Microsoft Word (.docx) export as the primary export format. PDF is a secondary nice-to-have for v1.**

The exported Word document includes:
- Cover section: Funder name, fund name, charity name, application date
- One section per question with the question text as a heading and the draft answer as body text
- Word counts per answer where word limits were specified

## Rationale

- Word (.docx) is the standard editable format for grant applications in the UK charity sector. Users need to make final edits before submission.
- PDF export requires additional server-side rendering (headless browser or PDF library) that adds complexity. Word export via a library like `docx` (npm) is simpler.
- Product Decision PDR-EX-001 specifies Word export.

## Consequences

- A Word document generation library is required (ADR-EXPORT-002 determines where generation runs).
- The `docx` npm library (or similar) is used to generate the .docx file programmatically.
- The exported file is streamed to the client as a download response.
- The export route does not call the Anthropic API — it reads from the `application_answers` table.

## Source

Product Decision PDR-EX-001, FR-20 to FR-21.

## Date Decided

2026-04-17
