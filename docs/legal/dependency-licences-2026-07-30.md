# Dependency Licence Review — 2026-07-30

**Tier:** 3 — Stable (dated review artefact; superseded rather than edited)
**Volatility:** Low
**Update when:** Never — re-run the review as a new dated file when dependencies change materially, and link the new file from `GAP-20` / `ADR-STACK-005`

**Reviewer:** Rapidglobe Ltd
**Reviewed at:** `grant-pathway@0.2.0`, install tree resynced with `npm ci` immediately before the review
**Requirement:** `ADR-STACK-005` — "Dependency licences reviewed for proprietary product compatibility"
**Closes:** `GAP-20` (open and unactioned since 2026-05-20; raised again as finding **L8** of the 2026-07-29 Opus audit)

> **This is a technical licence review, not legal advice.** It records which licences are present, which impose conditions, and why each is or is not a problem for this product's delivery model. It is not a substitute for the independent legal review tracked separately in `P5.1`, which covers the Privacy Policy and Terms of Service. If anything in the "Assumptions this conclusion depends on" section stops being true, this review must be re-run.

---

## 1. Conclusion

**No licence in the dependency tree prevents Grant Pathway from being a closed-source, proprietary, hosted service.** Nothing needs to be removed or replaced before launch.

Three findings support that, in descending order of importance:

1. **All 25 direct production dependencies are permissive** — MIT, Apache-2.0, ISC or BSD-2-Clause. There is no copyleft and no source-available restriction among the packages this product directly chose to depend on.
2. **There is no AGPL, SSPL or BUSL package anywhere in the tree** — checked across all 889 installed packages. This is the finding that matters most for a hosted service, because AGPL-3.0 treats network use as distribution and would otherwise require offering source to every user. Its absence is what makes the conclusion straightforward rather than qualified.
3. **Every package under a licence with real conditions is either build-time tooling, dev-only, a dual licence where the permissive option is elected, or a separately-invoked native binary.** None of them is our source code, and none is linked into the application in a way that propagates obligations. Detail in §3.

Every installed package declares a licence. **There are no unlicensed or licence-unspecified packages** — often the hardest category to clear, and there is nothing to clear here.

---

## 2. Scope and method

Deliberately stated so this can be re-run identically and so the limits are visible.

|                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method**                   | Read the `license` field from the `package.json` of every installed package under `node_modules`, then traced each non-plain-permissive package back to its parent with `npm ls <pkg> --omit=dev` to establish whether it is reachable in production at all                                                                                                                                                                                                                                                                                                |
| **Install state**            | `npm ci` run first, so the tree matches `package-lock.json` exactly. This mattered: before it, ten packages were at versions that did not match `package.json` (a recurrence of the drift found as audit finding **M7**), so a review run beforehand would have described a tree that neither CI nor production uses                                                                                                                                                                                                                                       |
| **Coverage**                 | **889 unique packages** installed. 25 direct production dependencies, 17 direct dev dependencies, the remainder transitive                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **No new tooling installed** | Deliberate. Adding a licence-checker to `package.json` to audit `package.json` adds a dependency and a supply-chain surface to answer a question that the existing metadata already answers                                                                                                                                                                                                                                                                                                                                                                |
| **Not covered**              | (a) Licence _texts_ were not read in full — the review relies on the declared SPDX identifier, which is the industry norm but can be wrong or incomplete in a given package. (b) No check for a package whose declared licence differs from the licence in its own `LICENSE` file. (c) Not a patent or trademark review. (d) Not a review of the hosted **services** the product uses (AWS Bedrock, Supabase, Vercel, Sentry, Upstash, Resend) — those are governed by their own terms, tracked separately in `P5.1` and `docs/legal/AWS-DPA-reference.md` |

---

## 3. Licence distribution and the packages needing comment

### Distribution across all 889 installed packages

| Licence                                                                                                                    | Count  | Character                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| MIT                                                                                                                        | 802    | Permissive                                            |
| Apache-2.0                                                                                                                 | 150    | Permissive, with a patent grant                       |
| ISC                                                                                                                        | 37     | Permissive                                            |
| BSD-2-Clause                                                                                                               | 22     | Permissive                                            |
| BSD-3-Clause                                                                                                               | 10     | Permissive                                            |
| BlueOak-1.0.0                                                                                                              | 7      | Permissive                                            |
| 0BSD                                                                                                                       | 5      | Permissive, no attribution required                   |
| MPL-2.0                                                                                                                    | 5      | **Weak, file-level copyleft** — see below             |
| FSL-1.1-MIT                                                                                                                | 2      | **Source-available, not OSI open source** — see below |
| Apache-2.0 AND LGPL-3.0-or-later                                                                                           | 2      | **Weak copyleft** — see below                         |
| Others (Python-2.0, CC-BY-4.0, CC0-1.0, Unlicense, BSD, `(MIT OR GPL-3.0-or-later)`, `(MIT AND Zlib)`, `(MIT OR CC0-1.0)`) | 1 each | See below                                             |

(Counts exceed 889 slightly because a handful of scoped packages are counted under both their scoped and unscoped paths. The distribution is unaffected.)

### The four production-reachable packages that carry conditions

| Package                                     | Licence                              | Reached via                                      | Assessment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sentry/cli`, `@sentry/cli-win32-x64`      | **FSL-1.1-MIT**                      | `@sentry/nextjs` → `@sentry/bundler-plugin-core` | The Functional Source License is **not** OSI open source: it permits any use **except** building a product that competes with the licensor's commercial offering, and converts to MIT two years after each release. Grant Pathway is a grant-writing assistant for UK charities and competes with nothing Sentry sells, so the sole restriction does not bite. It is also a **build-time CLI binary** used to upload source maps — never bundled into the application and never distributed. **No issue. Re-examine only if Grant Pathway ever moves into error monitoring.** |
| `@img/sharp-win32-x64`, `@img/sharp-wasm32` | **Apache-2.0 AND LGPL-3.0-or-later** | `next` → `sharp`                                 | `sharp`'s native binaries, carrying LGPL because of their libvips lineage. LGPL is weak copyleft: obligations attach on **distribution**, and require that the LGPL component remain replaceable — not that the calling application be opened. These are separate native modules invoked at runtime, not statically linked into our code, and **we distribute nothing**. **No issue under the current delivery model.** This is the one item a solicitor would most want named, and it is the first thing to re-check if the delivery model ever changes.                     |
| `jszip`                                     | **`(MIT OR GPL-3.0-or-later)`**      | `docx`, `mammoth`                                | Dual-licensed, so the licensee elects. **Grant Pathway elects MIT.** This is the standard and intended route and requires no action beyond recording the election, which this line does. Note `jszip` genuinely is used in shipped server-side code — it underpins Word export and `.docx` extraction — so the election matters rather than being academic.                                                                                                                                                                                                                   |
| `caniuse-lite`                              | **CC-BY-4.0**                        | `next`, `shadcn`                                 | A browser-support **data set**, not code, under an attribution licence. Build-time only; nothing from it appears in the product. Ubiquitous across the JavaScript ecosystem. **No issue.**                                                                                                                                                                                                                                                                                                                                                                                    |

### Dev-only, therefore never shipped

Confirmed not reachable in the production tree (`npm ls <pkg> --omit=dev` returns empty for each):

| Package                                       | Licence | Note                                                                                                                                                     |
| --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `axe-core`, `@axe-core/react`                 | MPL-2.0 | Accessibility testing. Runs only when `NODE_ENV === 'development'` — the same fact that blocked HT-05's axe step against the deployed site on 2026-07-25 |
| `lightningcss`, `lightningcss-win32-x64-msvc` | MPL-2.0 | Tailwind 4's build-time CSS transform                                                                                                                    |
| `@vercel/og`                                  | MPL-2.0 | Not production-reachable                                                                                                                                 |

MPL-2.0 is file-level copyleft: the obligation is to publish modifications **to the MPL-licensed files themselves**. We modify none of them, and none of them ships. **No issue.**

### Remaining single-instance licences

`Python-2.0`, `Unlicense`, `CC0-1.0`, `(MIT OR CC0-1.0)`, `(MIT AND Zlib)`, `BSD` (unversioned), `BlueOak-1.0.0` — all permissive or public-domain-equivalent. `BSD` unversioned is imprecise rather than restrictive; every BSD variant is permissive. **No issue.**

---

## 4. Assumptions this conclusion depends on

The conclusion is sound **because Grant Pathway is a hosted service**. That single fact does most of the work, since GPL and LGPL obligations attach to distributing software, and no software is distributed to users — they use it over the network.

Re-run this review if any of the following changes:

- **The delivery model.** Shipping a desktop application, an on-premise deployment, a Docker image for third parties, or publishing any part of this codebase to npm would all constitute distribution. `sharp`'s LGPL binaries and `@sentry/cli`'s FSL terms both need re-examination in that case.
- **The product's market.** FSL-1.1-MIT's non-compete restriction is dormant only while Grant Pathway does not compete with Sentry.
- **A major dependency change.** Adding a package under AGPL-3.0 or SSPL would be the single change most likely to invalidate this conclusion. Worth treating an AGPL or SSPL dependency as requiring a deliberate decision rather than a routine install.
- **`jszip`'s licensing**, if a future version drops the MIT option.

## 5. Recommendation for keeping this current

`security-audit.yml` (weekly, added 2026-07-29) covers **vulnerabilities, not licences** — it does not and will not catch a licence change. Rather than automate this now, the proportionate control for a solo project is to re-run this review at the point a dependency is added deliberately, and to treat any AGPL/SSPL package as a decision rather than an install. Recorded here rather than built, so the gap is a known and accepted one rather than an invisible one.

---

## Document History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-30 | Initial review. Closes `GAP-20`, open and unactioned since 2026-05-20 and raised as finding **L8** of the 2026-07-29 Opus audit. Conclusion: no licence prevents a closed-source hosted service; all 25 direct production dependencies permissive; no AGPL/SSPL/BUSL anywhere in 889 packages; no unlicensed packages. Four production-reachable packages carry conditions (`@sentry/cli` FSL, `sharp` binaries LGPL, `jszip` dual-licensed with MIT elected, `caniuse-lite` CC-BY) and none is a problem under the current hosted delivery model. |
