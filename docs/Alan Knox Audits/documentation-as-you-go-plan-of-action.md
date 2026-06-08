# Plan of Action — Documentation As You Go

**Source article:** [Documentation As You Go: Engineering for Vibe Coders — Alan Knox](https://alanknox.com/documentation-as-you-go-engineering-for-vibe-coders/)
**Reviewed:** 8 June 2026
**Completed:** 8 June 2026
**Related documents:** `README.md`, `AGENTS.md`, `docs/Implementation Plan/CHANGELOG.md`

---

## Why this mattered for Grant Pathway

Knox's argument is that AI-assisted development creates a specific vulnerability: context gets lost as teams move quickly, and AI sessions fill the gaps with guesses when documentation is absent. Grant Pathway is built almost entirely with AI assistance across multiple sessions, each starting without memory of prior work. The documentation set exists precisely to solve this problem — every session reads the current state of the project from files, not from memory.

The review found Grant Pathway's documentation practices to be genuinely strong. One gap was identified: the repository had no entry-point document for new sessions, contributors, or team members. The generic `create-next-app` placeholder README left anyone arriving at the repository cold with no orientation into the project. That gap is closed by the new README.

---

## Assessment against Knox's recommendations

### "Capture decision reasoning early — document the why"

**Status: Exemplary — no action required**

Every significant decision in Grant Pathway has a decision record:

- 45 Architectural Decision Records (ADRs) in `docs/Technical Decision and Design/` — each records the decision, rationale, alternatives considered, and consequences
- 29 business/product decision records (DRs) in `docs/decisions/`
- The CHANGELOG records not just _what_ changed but _why_ — including root causes for defect fixes and the reasoning behind product pivots (e.g. the Step 4 redesign from auto-generation to Q&A model, 2026-05-28)

The 2026-05-29 incident (consolidated funder list researched and used as the basis for a major product decision but never written down) was the catalyst for strengthening the AGENTS.md documentation rule. It is now explicitly documented as the reason the rule exists — exactly Knox's "if you have to stop and figure something out twice, document it" principle applied retrospectively.

### "Keep docs near the code"

**Status: Well covered — no action required**

- `AGENTS.md` and `CLAUDE.md` live in the repository root alongside the source code
- ADRs, DRs, and the implementation plan live in `docs/` within the same repository
- Decision records reference the specific files and line numbers they affect
- The CHANGELOG cross-references commits by hash

### "Update continuously — small updates, not big rewrites"

**Status: Structurally enforced — no action required**

AGENTS.md contains a mandatory documentation table that maps every type of change to the document(s) that must be updated. This is not advisory — it is enforced as a pre-task and post-task check. The table covers 15 documents across the implementation plan and product documentation set. The phase gate rule requires an ADR consequences sweep before every phase begins.

### "Support AI understanding — documentation prevents guesses"

**Status: Primary design intent — no action required**

AGENTS.md is structured specifically for AI session onboarding. Every session reads it as part of `CLAUDE.md` (`@AGENTS.md`). The four rule blocks (Next.js conventions, ADR consequences, documentation requirements, GitHub commit protocol) exist because omissions in prior sessions were traced back to the AI not having this context. The documentation set is the single source of truth for what the product is, what is built, and what is outstanding.

### "Avoid unnecessary detail — keep documentation useful"

**Status: One gap identified and resolved**

This is Knox's most nuanced recommendation and the one area where Grant Pathway had a genuine gap. The documentation set is comprehensive — the CHANGELOG alone exceeds 1,500 lines and will continue to grow — but there was no lightweight entry-point document. Anyone arriving at the repository cold (a new team member, a future successor organisation, or an AI session without prior context) faced a large documentation set with no map.

The generic `create-next-app` README provided no orientation whatsoever. It did not name the product, describe what it does, explain the tech stack, or point to any of the documentation.

**Action taken:** `README.md` replaced (8 June 2026). The new README covers:

- What Grant Pathway is and who it is for (2 sentences)
- Tech stack summary table
- Local development setup and available scripts
- Documentation map — a table pointing to the 12 most important documents with a one-line description of each
- Deployment summary with a pointer to the deployment checklist
- Licence

The README is deliberately concise — it is a navigation layer, not a documentation layer. Everything it references already exists in full in `docs/`. It does not duplicate any content.

---

## Limits acknowledged

Knox warns against documentation becoming so large it is hard to maintain. Grant Pathway's documentation set is already large. The right response is not to reduce it — the CHANGELOG and ADR series are the project's audit trail and must be complete — but to ensure the entry points remain lightweight and navigable. The README and IMPLEMENTATION-STATUS.md serve this role. Both should be kept concise as the project grows.

---

## Outstanding actions

None. The one gap identified (missing README) has been resolved. No further documentation work is required as a direct result of this audit.
