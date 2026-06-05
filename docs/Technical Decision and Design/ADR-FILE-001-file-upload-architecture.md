---
id: ADR-FILE-001
category: File Handling
status: Decided
---

# ADR-FILE-001 — File Upload Architecture

## Context

⚠️ **BLOCKER** — This decision must be made before any file upload code is written.

Grant Pathway allows users to upload funder guidelines as PDF or Word documents (up to 10MB, per PDR-DH-001). The uploaded file is processed to extract text, which is then passed to the Anthropic API.

**The critical constraint:** Vercel serverless functions have a maximum request body size of **4.5MB**. A 10MB file uploaded to a Next.js API route will fail. This is a known platform limitation that cannot be worked around by configuration on the Vercel side.

Funder guidelines are not stored (ADR-DATA-002) — the file upload is a transient operation for text extraction only.

## Options Considered

### Option A — Direct client-to-Supabase Storage upload via signed URL (RECOMMENDED)

- **What it is:** The browser requests a signed upload URL from a lightweight Next.js API route. The file is uploaded directly from the browser to Supabase Storage, bypassing Vercel entirely. A second API call notifies the server that the upload is complete. The server retrieves the file from Supabase Storage, extracts the text, calls the AI API, then deletes the file from Storage.
- **Strengths:** Bypasses the Vercel 4.5MB limit entirely. Standard pattern for large file uploads in serverless environments. Upload speed is limited only by the user's connection to Supabase Storage (London region).
- **Weaknesses:** Two-step process (get signed URL → upload → notify server → extract). More complex client-side upload code. File temporarily exists in Supabase Storage (deleted immediately after text extraction — max a few seconds).
- **Implementation steps:**
  1. Client requests signed URL: `POST /api/upload/signed-url`
  2. Client uploads file directly to Supabase Storage using the signed URL
  3. Client notifies server: `POST /api/upload/process` with the Storage path
  4. Server downloads file from Storage, extracts text, calls AI API
  5. Server deletes file from Storage
  6. Server returns AI summary to client

### Option B — Vercel Pro with larger request limit

- **What it is:** Vercel Pro plan increases the function payload limit to some degree, but the 4.5MB body limit is a platform limit, not a plan-level setting. This option does not resolve the problem.
- **Strengths:** None beyond Pro plan benefits already needed (ADR-OPS-001).
- **Weaknesses:** Does not increase the body size limit. This option is not viable.

### Option C — Text-only path (no file upload, paste only)

- **What it is:** Remove PDF/Word upload entirely. Users must paste guidelines text manually.
- **Strengths:** Eliminates the upload architecture entirely. Zero file handling complexity.
- **Weaknesses:** Breaks FR-07 and FR-08 (PDF and Word upload requirements). Significantly worse UX — many guidelines are published as PDFs.

### Option D — Chunked upload to Next.js API route

- **What it is:** The client splits the file into chunks smaller than 4.5MB and uploads them sequentially to an API route. The server reassembles the chunks.
- **Strengths:** Keeps upload flow within Next.js.
- **Weaknesses:** Significantly more complex. No persistent filesystem on Vercel for chunk reassembly. Requires an intermediate store (e.g., KV or Redis) for chunks. Over-engineered compared to Option A.

## Decision

**Option A — Direct client-to-Supabase Storage upload via signed URL, with two-layer orphan file protection.**

**Upload flow:**

1. Client requests a signed upload URL: `POST /api/upload/signed-url` → server returns a short-lived (5 min) signed URL and the Storage object path
2. Client uploads the file **directly to Supabase Storage** (`guidelines-temp` private bucket) using the signed URL — Vercel never receives the file bytes
3. Client notifies the server: `POST /api/upload/process` with the Storage path
4. Server retrieves the file from Storage, extracts text, calls the AI API, saves the summary, then deletes the file from Storage
5. Server returns the AI summary to the client

**Orphaned file protection — two layers:**

**Layer 1 — `try/finally` in `/api/upload/process` (handles ~99% of failure cases):**
The entire process handler is wrapped in a `try/finally` block. The `finally` block unconditionally deletes the Storage object before the response returns — regardless of whether processing succeeded or threw an error.

**Layer 2 — Scheduled cleanup job (handles infrastructure failures):**
A scheduled job runs every 30–60 minutes and deletes any objects in the `guidelines-temp` bucket older than 1 hour. This covers cases where the Vercel function timed out or the server crashed before `finally` ran. Implementation is deferred to ADR-OPS-004 (Scheduled Job Mechanism).

**Storage configuration:**

- Bucket name: `guidelines-temp`
- Bucket access: private (no public URLs)
- Signed URL expiry: 5 minutes
- Service role used for file retrieval and deletion in the process route

## Consequences

- Supabase Storage must be configured with a private bucket for temporary guidelines uploads.
- Files must be deleted from Storage immediately after text extraction (within the same server request).
- A storage RLS policy or service-role-only access must prevent users from accessing other users' temporary uploads.
- Client-side upload progress can be shown during the direct-to-Storage upload (browser `fetch` progress event or `XMLHttpRequest`).
- PDF text extraction library must be selected (ADR-FILE-003).

## Source

PDR-DH-001, FR-07, FR-08, ADR-DATA-002.

## Date Decided

2026-04-21
