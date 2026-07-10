---
id: ADR-DATA-002
category: Data
status: Decided
---

# ADR-DATA-002 — Data That Is Not Stored

## Context

Grant Pathway processes funder guidelines documents (PDF, Word, or pasted text) as part of Step 2. These guidelines may contain commercially sensitive information provided by the funder. The product must define a clear policy on whether this content is retained after processing, both for privacy reasons and to simplify the product's data obligations.

## Options Considered

- **Option A — Store guidelines in Supabase Storage permanently:** Allows users to re-use guidelines across multiple applications to the same funder. Increases storage requirements and data retention obligations.
- **Option B — Store guidelines temporarily (e.g., 24 hours), then delete:** Middle ground. More complex to implement (scheduled deletion job). Still incurs data retention obligations during the window.
- **Option C — Never store funder guidelines:** Guidelines are passed directly to the AI API in the same request. Only the AI-generated summary is stored. No guidelines data is retained after the AI call returns.

## Decision

**Option C — Funder guidelines are never stored in the database or in Supabase Storage.**

The funder guidelines text is extracted client-side (or server-side during the API call), passed as a parameter to the AI generation API route, and discarded after the AI response is returned. Only the AI-generated summary (`ai_summary` on the `applications` table) is persisted.

## Rationale

- Simplifies data retention obligations — funder guidelines are not personal data in most cases, but may be commercially sensitive to the funder.
- Reduces storage costs and complexity.
- The AI summary captures all content required for Step 4 draft generation, so retaining the raw guidelines provides no additional value.
- FR-22 explicitly states: "Funder guidelines are not stored in the database. They are used only for AI processing within the session."

## Consequences

- If the user navigates away after Step 2 and before Step 3 completes, they will need to re-upload or re-paste the guidelines.
- The guidelines text must be passed from the client to the API route in the POST body of the AI summary request. The POST body must not exceed Vercel's 4.5MB request limit — this is addressed by extracting text from the PDF/Word document before sending (text is much smaller than binary).
- The UI should make clear that guidelines are not saved, and prompt the user to re-upload if they return to Step 2 without a summary.

## Source

FR-22, PRD-Grant-Pathway-v1.md (Section 9.3 — Data Not Stored).

## Date Decided

2026-04-17
