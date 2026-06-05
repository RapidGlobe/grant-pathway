# Consolidated Target Funder List

**Version:** 1.1
**Date:** 2026-06-04
**Status:** Active — supersedes the 3-funder test fixture table in `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md`

This is the canonical reference list of grant-giving organisations used to design, test, and validate Grant Pathway's Step 4 (Q&A interview model) and Step 5 (assembly and export). All product and engineering decisions about funder types, application formats, and output behaviour should be grounded in this list.

---

## Funder table

| Funder                                         | Type           | Grant range                           | Why included                                                                                                         | Guidelines / Apply URL                               |
| ---------------------------------------------- | -------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Idlewild Trust                                 | Structured     | £10k–£30k                             | Publishes Word question set specifically for offline preparation — cleanest fit                                      | idlewildtrust.org.uk/apply-grant                     |
| A B Charitable Trust                           | Structured     | £10k–£40k/yr                          | Publishes full PDF question set before portal opens; single stage; broad causes                                      | abcharitabletrust.org.uk/apply                       |
| Clothworkers' Foundation                       | Structured     | Up to £15k+                           | Clear word limits; broad causes; widely used by smaller charities                                                    | clothworkersfoundation.org.uk/apply-for-a-grant      |
| Henry Smith Foundation                         | Structured     | £10k–£100k                            | Two-stage with explicit Stage 1 questions and word limits; large grants; broad remit                                 | henrysmith.foundation/grants                         |
| Wolfson Foundation                             | Structured     | £30k–£250k+                           | Stage 1 questions publicly listed with per-question word limits (50–600 words)                                       | wolfson.org.uk/funding/application-guidance          |
| Lloyds Bank Foundation                         | Structured     | £5k–£50k                              | Downloadable Word example application form; AI use permitted with conditions; England & Wales                        | lloydsbankfoundation.org.uk                          |
| ~~Foyle Foundation — Main Grants~~             | ~~Structured~~ | ~~£10k–£75k~~                         | ~~Removed 2026-06-04 — foundation permanently closed December 2025; no new applications accepted~~                   | ~~foylefoundation.org.uk~~                           |
| Walton Charity — Community Grants              | Structured     | Up to £10k (small); larger considered | Guidelines PDF + narrative request form; clear structure; tests smaller community grant tier                         | waltoncharity.org.uk/applying-for-a-grant            |
| Nationwide Building Society — Community Grants | Structured     | £10k–£50k                             | Third-party criteria PDFs available; housing/homelessness focus; ⚠️ between rounds as of June 2026                   | nationwidecommunitygrants.co.uk                      |
| Motability Foundation                          | Structured     | £50k–£1m                              | Detailed guidance PDFs with clear narrative sections; tests larger grant tier; ⚠️ programme currently closed         | motabilityfoundation.org.uk                          |
| Garfield Weston Foundation                     | Narrative      | Up to £100k                           | Rolling open; 10-page free-form proposal; primary test for free-form path — tested 2026-06-04 ✅                     | garfieldweston.org/for-grant-applicants/how-to-apply |
| City Bridge Foundation                         | Narrative      | £75k–£450k                            | Publishes Word sample form for offline drafting; secondary test for proposal-upload path; ⚠️ rounds currently closed | citybridgefoundation.org.uk/funding/how-to-apply     |

---

## Notes

- **Structured** funders publish discrete numbered questions with word limits. Grant Pathway extracts these via the Step 3 AI prompt and routes Step 4 to the Q&A card interface.
- **Narrative** funders require a free-form proposal to published headings or sections. Grant Pathway extracts named sections and routes Step 4 to the section-by-section interface.
- Multi-stage funders (Henry Smith, Wolfson) are handled as separate application records — one per stage. No special funder_type is needed.
- Funders with an explicit AI prohibition in their published guidelines are out of scope for Grant Pathway and are not listed here.

---

## Document history

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                             |
| ------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-05-29 | Rapidglobe Ltd | Initial document — consolidated from working session research; replaces 3-funder test fixture table                                                                                                                                                                                                |
| 1.1     | 2026-06-04 | Rapidglobe Ltd | Foyle Foundation removed (permanently closed December 2025). Lloyds Bank Foundation CI corrected to E&W. Status notes added for parked funders (Nationwide, Motability, City Bridge all currently offline). Garfield Weston noted as tested ✅. Grant range for Nationwide corrected to £10k–£50k. |
