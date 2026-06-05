---
id: ADR-FILE-002
category: File Handling
status: Decided
---

# ADR-FILE-002 — Accepted File Formats and Size Limits

## Context

Grant Pathway allows users to provide funder guidelines either by uploading a document or pasting text directly. The accepted file formats and size limits must be defined to set user expectations, guide validation logic, and inform the choice of text extraction library (ADR-FILE-003).

## Options Considered

- **Option A — PDF only:** Simplest extraction. Most funder guidelines are published as PDFs.
- **Option B — PDF and Word (.docx):** Covers both major document formats used by UK grant-making bodies.
- **Option C — PDF, Word, and plain text (.txt):** Adds text file support. Low marginal value — users can paste plain text.
- **Option D — Any file type with conversion:** Accept any format (PowerPoint, HTML, etc.) and convert. Too complex for v1.

## Decision

**PDF (.pdf) and Word (.docx) file uploads are accepted, plus direct text paste. Maximum file size is 10MB.**

| Input method | Accepted formats | Max size              |
| ------------ | ---------------- | --------------------- |
| File upload  | `.pdf`, `.docx`  | 10MB                  |
| Direct paste | Plain text       | No limit (reasonable) |

Files above 10MB are rejected client-side before upload with the message: "This file is too large. Please upload a file under 10MB, or paste the text instead."

Unsupported file formats are rejected with the message: "Please upload a PDF or Word document."

## Rationale

- PDF and .docx cover the vast majority of funder guidelines documents issued by UK grant-making bodies.
- 10MB is well above the typical size of a guidelines PDF (most are 1–5MB). This covers edge cases with image-heavy PDFs.
- PDR-DH-001 specifies: "Accept PDF and Word documents up to 10MB."
- Client-side validation (MIME type + file size check before upload) provides immediate feedback without server round-trips.

## Consequences

- Client-side validation must check MIME type (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`) and file size before initiating the upload.
- Server-side validation must also check the file before processing (never trust client-side validation alone).
- A PDF text extraction library is required (ADR-FILE-003).
- A .docx text extraction library is required — likely `mammoth` (Node.js library for .docx to text/HTML conversion).

## Source

PDR-DH-001, FR-07, FR-08.

## Date Decided

2026-04-17
