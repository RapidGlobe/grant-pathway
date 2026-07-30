---
id: ADR-FILE-003
category: File Handling
status: Decided
---

# ADR-FILE-003 — PDF Text Extraction

## Context

Grant Pathway must extract text from uploaded PDF files so the content can be passed to the Anthropic API for summarisation. The extraction must run server-side in a Node.js/Edge environment (Vercel serverless function). The extracted text replaces the raw PDF binary — only the text is sent to the AI API.

PDF text extraction quality varies between libraries depending on how the PDF was created. Most funder guidelines PDFs are text-based (exported from Word or InDesign), not scanned image PDFs.

## Options Considered

### Option A — `pdf-parse` (npm)

- **What it is:** Node.js library that extracts text from PDF buffers. No native dependencies.
- **Strengths:** Simple API. Pure JavaScript — no native binaries to compile. Works in serverless environments.
- **Weaknesses:** Older library. Some formatting loss (tables, columns). Does not handle scanned PDFs (no OCR). Known issues with some edge-case PDFs.

### Option B — `pdfjs-dist` (PDF.js — Mozilla)

- **What it is:** Mozilla's PDF rendering and parsing library. Can be run in Node.js to extract text from PDF pages.
- **Strengths:** Actively maintained by Mozilla. Used in Firefox PDF viewer. Handles more complex PDFs. Can extract page-by-page text with position data.
- **Weaknesses:** Larger bundle size. More complex API than `pdf-parse`. Designed primarily for rendering, not bulk text extraction.

### Option C — `unpdf` (newer unified PDF library)

- **What it is:** A newer Node.js library built on PDF.js's PDF reader component, designed specifically for text extraction in server-side/edge environments. Works in Node.js and Cloudflare Workers.
- **Strengths:** Lighter than full `pdfjs-dist`. Designed for server-side text extraction. Edge runtime compatible.
- **Weaknesses:** Newer library, smaller community. Less battle-tested than PDF.js.

### Option D — External PDF processing service (e.g., AWS Textract, Adobe PDF Services)

- **What it is:** Send the PDF to a cloud service for text extraction via API.
- **Strengths:** Best-in-class accuracy, including OCR for scanned PDFs.
- **Weaknesses:** Additional cost per extraction. Additional service dependency. Privacy concern — funder guidelines sent to a third-party service. Unnecessary for text-based PDFs.

### Option E — No PDF extraction; require text paste

- **What it is:** Remove PDF upload; users must paste text only.
- **Weaknesses:** Breaks FR-07. Worse UX.

## Decision

**Option C — `unpdf` for PDF extraction; `mammoth` for Word (.docx) extraction.**

Both libraries are wrapped in a single utility function `lib/extract-text.ts` that accepts a file buffer and MIME type and returns extracted plain text or a typed error.

**PDF extraction (`unpdf`):**

- Built on PDF.js's reader component — handles the same range of real-world PDFs as Mozilla's PDF viewer
- Designed specifically for server-side text extraction in Next.js/serverless environments
- Runs in the Node.js runtime of `/api/upload/process`

**Word extraction (`mammoth`):**

- Standard Node.js library for `.docx` to plain text conversion
- Strips formatting and returns clean plain text suitable for AI processing

**Scanned PDF handling:**
If extracted text is below 100 characters, the file is treated as a scanned (image-only) PDF. The user receives the message: _"This PDF appears to be a scanned document and can't be read automatically. Please paste the text instead."_ This is not treated as an error — it is a graceful fallback.

**Password-protected PDF handling:**
If extraction throws an authentication/encryption error, the user receives: _"This PDF is password protected. Please remove the password or paste the text instead."_

**Post-extraction:**
The 150,000-character truncation limit (ADR-AI-007) is applied to the extracted text before it is passed to the AI prompt. The file is deleted from Supabase Storage in the `finally` block (ADR-FILE-001) after extraction completes, regardless of outcome.

## Consequences

- **A single extraction utility must be created: `lib/extract-text.ts`**, accepting a file buffer and MIME type and returning extracted plain text or a typed error. It wraps `unpdf` for PDF and `mammoth` for Word (.docx). ✅ Built — this is the live implementation.
  - _Corrected 2026-07-30 (audit finding **L7**). These two bullets previously read: "A PDF extraction utility function must be created (e.g., `lib/extract-pdf-text.ts`)" and "A Word extraction utility function must be created (e.g., `lib/extract-docx-text.ts`) using `mammoth`" — **two** utilities, contradicting this ADR's own Decision section above, which has always specified a single wrapper, and contradicting the code, which has only ever had `lib/extract-text.ts`. The Decision and the implementation agreed; only this list was wrong. It matters more than an ordinary inconsistency because `AGENTS.md` §2 makes the Consequences section mandatory reading before any task in this area and states plainly that "these are binding requirements, not suggestions" — so a future session doing extraction work would have been instructed to create two files that should not exist, and would have read the correct single-utility implementation as an unfinished gap. Same failure mode as `GAP-21` directing work at a route deleted a month earlier._
- The utility must handle extraction errors gracefully and return a user-friendly error if extraction fails.
- Extracted text should be truncated or summarised if it exceeds the Anthropic context window limit (ADR-AI-007).
- **Added 2026-07-10:** P6.2a (guideline source-reference feature, driven by `ADR-DATA-002`'s reversal) will change the `unpdf` call from `mergePages: true` (all pages merged into one string) to per-page extraction, with a page marker (e.g. `[PAGE 3]`) inserted into the text between pages — this is what lets the AI cite which page a summary bullet or question came from. Consequence: the noise-stripping step in `lib/preprocess-text.ts` that currently removes anything resembling a page-number line must be updated so it does not strip the newly-inserted `[PAGE N]` markers before the AI ever sees them. **Corrected 2026-07-10:** this bullet previously referenced "the 150,000-character truncation limit (`ADR-AI-007`)" as the relevant post-marker budget constraint — that figure does not match live code (see `ADR-AI-007`'s own 2026-07-10 correction). The mechanism that actually matters here is `lib/preprocess-text.ts`'s `PREPROCESS_CHAR_CEILING` safety-net truncation (20,000 characters by default, 50,000 in production), which is what would need to become page-marker-aware once P6.2a lands.

## Source

ADR-FILE-001, ADR-FILE-002, FR-07, FR-08.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-30 | **Consequences corrected — this ADR contradicted itself, and in the section that is binding (audit finding L7).** The Consequences list required **two** extraction utilities, `lib/extract-pdf-text.ts` and `lib/extract-docx-text.ts`, while the Decision section above has always specified a **single** wrapper and the codebase has only ever contained `lib/extract-text.ts`. The Decision and the implementation were right; the Consequences list was wrong from the start. Consequential rather than cosmetic because `AGENTS.md` §2 makes this section mandatory pre-task reading and calls it binding — a session doing extraction work would have been told to create two files that should not exist and to treat the correct implementation as an unfinished gap. Now a single bullet naming `lib/extract-text.ts`, marked built. Swept for the two-utility claim elsewhere: it appeared nowhere else in the repository. |
| 2026-07-10 | Added Consequences note: P6.2a will switch `unpdf` from `mergePages: true` to per-page extraction with `[PAGE N]` markers inserted, so citations (`ADR-DATA-002`'s reversal) can reference a page. `lib/preprocess-text.ts`'s page-number noise-stripping step will need updating so it doesn't strip these markers. Corrected same day: the bullet's reference to "the `ADR-AI-007` 150,000-character truncation limit" replaced with the mechanism that actually applies live -- `lib/preprocess-text.ts`'s `PREPROCESS_CHAR_CEILING` (20,000 default / 50,000 production) -- since the 150,000-character figure does not match code (see `ADR-AI-007`'s own correction).                                                                                                                                                                                                                                                            |
