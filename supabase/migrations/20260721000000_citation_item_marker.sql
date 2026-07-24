-- ADR-DATA-007 2026-07-21 amendment: `[ITEM N]` fallback citation marker
-- ---------------------------------------------------------------------------
-- Some guidelines (confirmed on the Wolfson Foundation's Health & Disability
-- docx) have no PDF page structure AND no real Word heading styles — every
-- paragraph is a plain "Normal"-style paragraph, so lib/extract-text.ts's
-- tagSectionsFromHtml() produces zero [SECTION: ...] markers and, being a
-- docx not a PDF, zero [PAGE N] markers either. The whole document carries no
-- structural marker at all, so every citation the AI could offer is
-- correctly rejected (nothing to validate against) — guaranteed zero
-- citations for this class of document, not a validation bug.
--
-- Fix: a third citation source_type, 'item', anchoring to a per-paragraph/
-- per-line `[ITEM N]` marker inserted as a fallback only when a document has
-- no page or heading structure at all (see lib/extract-text.ts,
-- lib/preprocess-text.ts). This migration extends the guideline_reference
-- CHECK constraint (originally from 20260714000000_p6_2_application_item_graph.sql)
-- to allow that third shape, requiring item_number and forbidding both
-- page_number and heading_path — same discriminated-union guarantee as the
-- existing 'page'/'heading' branches.

alter table public.application_items
  drop constraint application_items_guideline_reference_shape;

alter table public.application_items
  add constraint application_items_guideline_reference_shape
    check (
      guideline_reference is null
      or (
        guideline_reference ? 'source_type'
        and guideline_reference ? 'quote'
        and (
          (guideline_reference ->> 'source_type' = 'page'
            and guideline_reference ? 'page_number'
            and not (guideline_reference ? 'heading_path')
            and not (guideline_reference ? 'item_number'))
          or
          (guideline_reference ->> 'source_type' = 'heading'
            and guideline_reference ? 'heading_path'
            and not (guideline_reference ? 'page_number')
            and not (guideline_reference ? 'item_number'))
          or
          (guideline_reference ->> 'source_type' = 'item'
            and guideline_reference ? 'item_number'
            and not (guideline_reference ? 'page_number')
            and not (guideline_reference ? 'heading_path'))
        )
      )
    );
