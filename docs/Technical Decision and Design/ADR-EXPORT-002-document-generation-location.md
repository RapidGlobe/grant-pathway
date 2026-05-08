---
id: ADR-EXPORT-002
category: Export
status: Decided
---

# ADR-EXPORT-002 — Document Generation Location

## Context

Grant Pathway generates a Word (.docx) export of the completed application (ADR-EXPORT-001). The document must be generated from structured data (application details + answers from the database) and delivered to the user as a file download.

The generation can run either client-side (in the browser) or server-side (in a Next.js API route). The choice affects the library options and the security of the data access pattern.

## Options Considered

### Option A — Server-side generation (Next.js API route)
- **What it is:** An API route reads the application data from Supabase (using the service role key), generates the .docx file in memory using a Node.js library (e.g., `docx`, `officegen`), and streams it to the client as a download.
- **Strengths:** Keeps data access server-side. Can use any Node.js library. The API route can validate that the user owns the application before generating the export. Clean separation of concerns.
- **Weaknesses:** Adds an API route for export. File is generated on the server and transferred to the client.

### Option B — Client-side generation (browser)
- **What it is:** The client fetches application data from Supabase directly, then generates the .docx using a browser-compatible library (e.g., `docx`, which works in the browser via bundling).
- **Strengths:** No server round-trip for document generation. The `docx` library works in both Node.js and browser environments.
- **Weaknesses:** Application data must be loaded client-side before generation can begin. The `docx` library adds to the client bundle size. Supabase anon key is used for data access — RLS must be correctly configured (which it is per ADR-SEC-002).

### Option C — Supabase Edge Function for generation
- **What it is:** Document generation runs in a Supabase Edge Function triggered by the client.
- **Weaknesses:** Edge Function environment has Node.js compatibility limitations. Adds complexity. Not warranted for a straightforward document generation task.

## Decision

**Option A — Server-side generation via Next.js API route.**

```
GET /api/export/[applicationId]
```

The route verifies the user's session (middleware — ADR-SEC-001), confirms `applications.user_id = auth.uid()` for the given application ID, fetches all application details and `application_answers` rows, generates the `.docx` file in memory using the `docx` npm library, and streams it to the client as a file download.

**Response headers:**
- `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `Content-Disposition: attachment; filename="[funder-name-slugified]-application.docx"`

**Document structure:**
- Cover section: funder name, fund name, charity name, export date
- One section per question: question text as a heading, draft answer as body text, word count shown where a word limit was specified
- Unanswered questions included with a blank answer section

**Styling:** Inter font, teal headings for question titles, consistent with the design system (design-requirements.md).

Document generation takes milliseconds — no `maxDuration` extension needed. The Vercel default 10-second timeout is ample.

## Consequences

- An API route `GET /api/export/[applicationId]` (or similar) handles export requests.
- The route returns a response with `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document` and `Content-Disposition: attachment; filename="[funder-name]-application.docx"`.
- The export must include all answered questions and skip unanswered questions gracefully.

## Source

ADR-EXPORT-001, PDR-EX-001.

## Date Decided

2026-04-21
