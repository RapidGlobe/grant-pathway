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
If extracted text is below 100 characters, the file is treated as a scanned (image-only) PDF. The user receives the message: *"This PDF appears to be a scanned document and can't be read automatically. Please paste the text instead."* This is not treated as an error — it is a graceful fallback.

**Password-protected PDF handling:**
If extraction throws an authentication/encryption error, the user receives: *"This PDF is password protected. Please remove the password or paste the text instead."*

**Post-extraction:**
The 150,000-character truncation limit (ADR-AI-007) is applied to the extracted text before it is passed to the AI prompt. The file is deleted from Supabase Storage in the `finally` block (ADR-FILE-001) after extraction completes, regardless of outcome.

## Consequences

- A PDF extraction utility function must be created (e.g., `lib/extract-pdf-text.ts`).
- A Word extraction utility function must be created (e.g., `lib/extract-docx-text.ts`) using `mammoth`.
- Both functions must handle extraction errors gracefully and return a user-friendly error if extraction fails.
- Extracted text should be truncated or summarised if it exceeds the Anthropic context window limit (ADR-AI-007).

## Source

ADR-FILE-001, ADR-FILE-002, FR-07, FR-08.

## Date Decided

2026-04-21
