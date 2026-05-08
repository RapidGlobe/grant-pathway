---
id: PDR-DH-001
category: Data & File Handling
status: Decided
---

# PDR-DH-001 — File Upload Limits and Formats

## Question
What is the maximum file size for uploaded funder guidelines, and which file formats will be accepted?

## Context
Funder guidelines are provided to users in a variety of formats — commonly PDF, Microsoft Word (.docx), and occasionally plain text. Users can currently paste text directly (UC-06) but also upload files. The file size limit affects both user experience (large files take longer to upload and process) and cost (larger files consume more API tokens). The supported formats affect how many users can benefit from file upload without needing to copy and paste. PDF and Word are the two most common formats in the charity sector. Each format requires different server-side parsing logic. The decision on formats and limits will appear directly in the PRD as a product constraint that users will encounter.

## Options
- **Option A — PDF only:** Accept PDF uploads only. Covers the majority of funder guidelines but excludes Word documents.
- **Option B — PDF and Word (.docx):** Accept the two most common formats in the UK charity sector. Plain text is already covered by the direct paste option (UC-06). Image-based (scanned) PDFs that cannot be parsed will receive a clear user message.
- **Option C — PDF, Word, and plain text (.txt):** Adds plain text upload on top of Option B. Marginal additional coverage given text pasting is already available.

## Decision
**Option B — PDF (.pdf) and Word (.docx) uploads accepted, 10MB maximum file size.**

### Accepted formats
| Format | Notes |
|--------|-------|
| PDF (.pdf) | Text-based PDFs only. Scanned/image-based PDFs cannot be parsed — user will see a plain-language message advising them to copy and paste the text instead |
| Word (.docx) | Standard Word documents. Legacy .doc format not supported |

### File size limit
**10MB maximum per upload.** This comfortably accommodates even very long guidelines documents (a 100-page PDF is typically 2–5MB).

### User messages
- Unsupported format: *"We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."*
- File too large: *"Your file is over 10MB. Please upload a smaller file or paste the text directly."*
- Scanned/image PDF (unparseable): *"We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead."*

### Technical flag
⚠️ **Vercel free tier request size limit:** Vercel's free (Hobby) plan limits API request body size to 4.5MB. A 10MB file size limit requires either (a) Vercel Pro plan, or (b) uploading files directly to Supabase Storage from the client, bypassing the Vercel API route size restriction. This must be resolved during technical design before the file upload feature is built.

## Rationale
PDF and Word cover the vast majority of funder guidelines published in the UK charity sector. Plain text upload adds negligible additional coverage given the paste option already exists. A 10MB limit is generous for the file types involved while preventing accidental large uploads. Image-based PDFs are a known limitation of text extraction without OCR — a clear user message ensures affected users are not silently blocked. The Vercel free tier size constraint is flagged for resolution at technical design stage.

## Date Decided
2026-04-16
