# docs/overview/archive — superseded business overviews

**Tier:** 3 — Stable
**Volatility:** Low
**Update when:** A business overview version is superseded and moved in here

Superseded copies of the external Business Overview, kept for the audit trail. **Nothing in this folder is current. Do not send anything from here to a charity, a funder, or any other external audience.**

The current version is in `docs/overview/`:

| Live file                                    | What it is                                                         |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `Grant-Pathway-Business-Overview-v1_19.md`   | **Authoritative** source text for the external overview            |
| `Grant-Pathway-Business-Overview-v1_19.docx` | The distributable Word version, kept in step with the `.md` above  |
| `assets/`                                    | Images referenced by the overview (the high-level process diagram) |

**Neither v1.17 nor v1.18 is in this folder, deliberately.** Both existed for a few hours on 2026-07-31 and neither was sent to anyone, so each was superseded in place rather than archived — this folder is for versions that actually reached an external audience, and listing an undistributed one would imply somebody out there holds a copy. They remain in git history (`987c8fb` for v1.17, `d455186` for v1.18) if the wording is ever needed.

The internal, tier-governed equivalent is `docs/business-overview.md` — that is the one AGENTS.md's Tier 2 checklist refers to. It carries decision references and pointers the external copy deliberately leaves out. **Both must be updated together**; the 2026-07-31 review found the internal copy had drifted three versions behind on data residency alone.

## Contents

| File                                         | Superseded by | Why archived                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Grant-Pathway-Business-Overview-v1_16.docx` | **v1.17**     | 20 July 2026 text. Overclaimed data residency ("all data is stored in UK-based infrastructure"); listed grant discovery as a future Grant Pathway idea; omitted the Charity Commission lookup, the reuse-an-earlier-application path, and the eligibility hard stop; and repeated the review-and-approve paragraph twice. |
| `Grant-Pathway-Business-Overview-v1_16.md`   | **v1.17**     | Source text for the above.                                                                                                                                                                                                                                                                                                |
| `Grant-Pathway-Business-Overview-v1.4.docx`  | **v1.17**     | 2 July 2026 text. Predates the closed-source correction (`DR-BM-003` reversal) and everything above.                                                                                                                                                                                                                      |
| `business-overview.md`                       | **v1.17**     | A v1.1 (26 May 2026) duplicate of the internal `docs/business-overview.md`, archived 2026-07-20. Described the abandoned draft-generation model, in which the AI wrote first-pass answers.                                                                                                                                |

## Why these were kept rather than deleted

Each is the only surviving record of what was distributed at that version. If a charity or funder refers back to an overview they were sent, this is the evidence of what it said.

**Note on relative links.** Moving a document in here changes its depth and breaks every relative link inside it — the confirmed cause of audit finding `L9`. Re-base any links before moving a future version in.
