# docs/legal/archive — superseded legal documents

**Tier:** 3 — Stable
**Volatility:** Low
**Update when:** A legal document is superseded and moved in here — and update the version numbers in the Contents table, which drift silently otherwise (the privacy policy row read "now at v1.5" until 2026-08-18, three versions stale)

Superseded legal documents, kept for the audit trail. **Nothing in this folder is current. Do not send anything from here to a reviewer, a funder, or a user.**

The live documents are in `docs/legal/`:

| Live document                  | What it is                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `privacy-policy.md`            | **Authoritative** Privacy Policy — internal working copy, carries the full changelog   |
| `privacy-policy-external.md`   | Clean copy with the internal changelog stripped — **this is what `/privacy` renders**  |
| `terms-of-service.md`          | **Authoritative** Terms of Service — internal working copy, carries the full changelog |
| `terms-of-service-external.md` | Clean copy with the internal changelog stripped — **this is what `/terms` renders**    |

## Contents

| File                                                                     | Superseded by                                 | Why archived                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grant-pathway-privacy-policy-v1.0.docx`                                 | `privacy-policy.md`, now at **v1.8**          | A Word export of the 22 May 2026 v1.0 text. Five versions behind: it predates the Amazon Bedrock/EU-region correction, the ICO registration number, the `admin@` contact address, the corrected AI model description, and the 2026-07-30 disclosure additions (name, consent basis, Charity Commission source).                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `privacy-policy/Grant-Pathway-Privacy-Policy-v1_6-final.pdf` and `.docx` | `privacy-policy-external.md`, now at **v1.8** | The solicitor-reviewed v1.6 exports, generated 2026-08-07 for the `P5.1` review. **Two versions behind and they were still sitting in `docs/legal/pdf/` as the only PDF anyone would find** — the exact risk this archive was created to remove, recurring in the same folder for the same reason. They predate v1.7 (Upstash and Axiom added as processors, Vercel corrected to London, the technical-logs and IP-address disclosure, the cookie description corrected from one cookie to three) and v1.8. ⚠️ **No replacement PDF has been generated**, so there is currently no downloadable copy of the live policy — deliberate, since WJ intends to take the v1.8 wording to the solicitor once Resend's answer on data location arrives. |
| `grant-pathway-terms-of-service-v1.0.docx`                               | `terms-of-service.md`, now at **v1.4**        | A Word export of the 22 May 2026 v1.0 text. Four versions behind: it predates the Bedrock reference, the corrected AI model description, the closed-source intellectual-property correction, **and the fair-use limit correction from 20 to 50 requests per month.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Why these were archived rather than deleted

Both are the only surviving record of the wording that was published at v1.0. If a user or funder ever refers to terms they saw at that time, this is the evidence of what those terms actually said.

## Why the archive exists at all

Created 2026-07-30 while preparing PDFs of the current Privacy Policy and Terms of Service for external legal review. Leaving five-version-old Word exports sitting alongside the current documents in the same folder was a live risk of sending the wrong file to a solicitor — the folder gave no indication which was current.

**Note on relative links.** Moving a document into this folder changes its depth and therefore breaks every relative link inside it. That is the confirmed cause of audit finding **L9** (24 broken links across five archived documents). Neither file moved here contains links, being `.docx`, but **anything moved in here in future must have its relative links re-based** — see `project_implementation_plan_tidy` and `CHANGELOG.md` (2026-07-30).
