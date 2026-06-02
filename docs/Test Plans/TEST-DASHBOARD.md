# Grant Pathway — Test Dashboard

**Version:** 1.0
**Last updated:** 2026-06-02
**Status:** Live — updated after each test session

RAG key: 🟢 Complete — all tests passed · 🟡 In progress or partial — testing not yet complete · 🔴 Failed — one or more tests failed and unresolved

---

| Funder | Test Plan | Passed | Failed | RAG | Notes |
|--------|-----------|--------|--------|-----|-------|
| A B Charitable Trust | [AB-Charitable-Trust-test-plan.md](AB-Charitable-Trust-test-plan.md) | 10 | 0 | 🟢 | All 10 tests passed. Full end-to-end flow verified including eligibility mismatch detection, 15-word limit extraction, non-narrative filtering, AI assist, approval, and Word/text export. |
| Idlewild Trust | [Idlewildtrust-test-plan.md](Idlewildtrust-test-plan.md) | 6 | 0 | 🟡 | IT-01–IT-04, IT-08 passed. IT-05–IT-07 blocked (Harry's Rainbow ineligible for Arts programme — mismatch hard stop prevents Q&A testing). IT-09–IT-10 N/A. IT-11 deferred — escape hatch to be tested with a funder Harry's Rainbow genuinely qualifies for. FR-47 eligibility mismatch hard stop surfaced and implemented during this test session. |
| Clothworkers' Foundation | [Clothworkers-Foundation-test-plan.md](Clothworkers-Foundation-test-plan.md) | 10 | 0 | 🟢 | All 10 tests passed. D-CW-01 (AI assist over word limit) found and fixed during testing. Prompt fixes required for multi-form PDFs and conditional questions. Load time 40–47s exceeds NFR-01. GAP-28 Layer 2 (faith affiliation conditional question) remains open. |
| Henry Smith Foundation | [Henry-Smith-Holiday-Grants-test-plan.md](Henry-Smith-Holiday-Grants-test-plan.md) | — | — | 🟡 | Test plan created. Programme: Holiday Grants (trips for children 13 and under). Test charity: Harry's Rainbow (existing account). Key tests: AI policy banner, exact 300-word limits, conditional question filtering, IT-11 escape hatch (if mismatch). Proud Homes test deferred — see Henry-Smith-Proud-Homes-test-plan-DEFERRED.md. |
| Wolfson Foundation | — | — | — | 🟡 | No test plan created yet. |
| Lloyds Bank Foundation CI | — | — | — | 🟡 | No test plan created yet. |
| Foyle Foundation — Main Grants | — | — | — | 🟡 | No test plan created yet. |
| Walton Charity — Community Grants | — | — | — | 🟡 | No test plan created yet. |
| Nationwide Building Society — Community Grants | — | — | — | 🟡 | No test plan created yet. |
| Motability Foundation | — | — | — | 🟡 | No test plan created yet. |
| Garfield Weston Foundation | — | — | — | 🟡 | No test plan created yet. Narrative (free-form) funder — primary test for the free-form path. |
| City Bridge Foundation | — | — | — | 🟡 | No test plan created yet. Narrative (free-form) funder — secondary test for proposal-upload path. |

---

## Summary

| Status | Count |
|--------|-------|
| 🟢 Complete | 2 |
| 🟡 In progress / not started | 10 |
| 🔴 Failed | 0 |

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-06-02 | Rapidglobe Ltd | Initial dashboard — A B Charitable Trust complete (10/10), Idlewild Trust partial (6 passed, IT-11 deferred), all other funders not yet started |
| 1.1 | 2026-06-02 | Rapidglobe Ltd | Clothworkers' Foundation test plan added; guidelines PDF copied to Grant Org Guidelines folder |
| 1.2 | 2026-06-02 | Rapidglobe Ltd | Clothworkers' Foundation 10/10 complete — dashboard updated to 🟢 |
| 1.3 | 2026-06-02 | Rapidglobe Ltd | Henry Smith Foundation (Proud Homes) test plan added; three guidelines files copied to Grant Org Guidelines folder |
| 1.4 | 2026-06-02 | Rapidglobe Ltd | Henry Smith test plan replaced: Holiday Grants replaces Proud Homes as primary test (single-stage, simpler, better for conditional question testing, Harry's Rainbow reuse). Proud Homes test plan retained as DEFERRED. Holiday Grants files copied. |
