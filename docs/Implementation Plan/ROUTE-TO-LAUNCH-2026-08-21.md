# Route to Launch — sequencing and plans

**Tier:** 1 — Always check after every task
**Volatility:** High until the Go-Live gate is signed, then archive
**Update when:** Any item below is completed, or its order changes

**Version:** 1.0
**Date:** 2026-08-21
**Status:** Draft for WJ's review. **One decision is needed — `P5.7`'s gate position — and it should not be taken yet. See §4.**

---

## 1. Where we actually are

**Everything that gates launch is done except three things.**

|                                                                            | Status                                               |
| -------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phases 0–4                                                                 | ✅ Complete                                          |
| Phase 5, `P5.PERF1` / `P5.0` / `P5.1` / `P5.2` / `P5.3` / `P5.3b` / `P5.4` | ✅ Complete                                          |
| **Phase 6 `P6.1`–`P6.5`** — the tasks that gate launch                     | ✅ **All complete** (2026-07-14)                     |
| `P6.7` — funder-by-funder extension                                        | Open-ended by design, does **not** block launch      |
| **`P5.5` items 1–3b** — final testing on production                        | ✅ **Complete 2026-08-21**                           |
| **`P5.5` item 4** — gaps-register audit                                    | 🔵 **Half done** — see §3                            |
| **`P5.7`** — OSCR and CCNI lookup                                          | ⚠️ **Not started, gate position undecided** — see §4 |
| **Phase 6 → Go-Live Gate** — sign-off                                      | ⏳ Not reached                                       |
| **`P5.6`** — DNS and go-live                                               | ⚠️ Blocked on the gate — see §5                      |

⚠️ **This is worth saying plainly: the item-graph rearchitecture that has gated launch since 5 July is finished.** What remains is one audit, one undecided feature, one signature, and a DNS change. **Nothing left is a large build** unless `P5.7` turns out to be one.

---

## 2. Recommended order of execution

| #     | Item                                                               | Who              | Effort                     | Why here                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------ | ---------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **`P5.6` DNS records** — the change only, not go-live              | WJ               | 5 min + 24–48h propagation | ⚠️ **Start this first regardless of everything else.** It is the only item with unavoidable _waiting_ time. Doing it now means it is verified and settled long before the gate, instead of adding two days to launch day. **It does not commit you to launching** — it simply makes the real address serve the real product. |
| **2** | **`P5.5` item 4** — the four remaining sub-checks                  | Me, no WJ needed | 1–2 hours                  | Blocks the gate. Three of today's errors came from trusting the register, so this is the half most likely to find something.                                                                                                                                                                                                 |
| **3** | **`P5.7` investigation only** — do the registers offer a live API? | Me               | Half a day                 | ⚠️ **Not the build. Just the answer.** The gate decision in §4 cannot be taken sensibly without it, and it is cheap.                                                                                                                                                                                                         |
| **4** | **`P5.7` gate decision**                                           | WJ               | 10 min                     | Once §3 is known, this becomes a real choice rather than a guess.                                                                                                                                                                                                                                                            |
| **5** | **`GAP-03`** — Sentry latency alert                                | WJ (dashboard)   | 20 min                     | Small, and it is the only monitoring gap left open on a route whose ceiling moved to 180s today.                                                                                                                                                                                                                             |
| **6** | **Dependabot PRs** — three open                                    | Me + WJ merge    | 30 min                     | ✅ **Now smoke-testable on a working preview for the first time** (`GAP-108`). Do dependency bumps _before_ launch, not after.                                                                                                                                                                                               |
| **7** | **Help centre publish** + the `/dashboard` mapping PR              | WJ then me       | 30 min                     | Content first, then the code mapping — a mapping to an unpublished page silently 404s.                                                                                                                                                                                                                                       |
| **8** | **Phase 6 → Go-Live Gate sign-off**                                | WJ               | —                          | Must be last. **Cannot be signed with any 📋 row unexplained.**                                                                                                                                                                                                                                                              |
| **9** | **`P5.6` go-live** — indexing, robots, tag `v1.0.0`                | WJ + me          | 1 hour                     | The rest of `P5.6` after the gate.                                                                                                                                                                                                                                                                                           |
| —     | `P5.5b` Admin dashboard, `P6.7`, `GAP-116`/`117`/`118`/`120`       | —                | —                          | Deliberately post-launch.                                                                                                                                                                                                                                                                                                    |

**The shape of that order:** the only long-lead item goes first, the only unknown gets investigated before it is decided, and the signature goes last.

---

## 3. `P5.5` item 4 — the gaps-register audit

**Full detail is in [`P5.5-GAPS-AUDIT-2026-08-21.md`](P5.5-GAPS-AUDIT-2026-08-21.md), Part Two.** Summary:

- ✅ **Done:** the sweep of all 123 rows, and all five decisions WJ needed to take.
- ✅ **Check 4 run and clean** — 116 gap ids, no duplicates.
- 🔵 **Check 3 part-run** — and it already found three: **`GAP-102`, `GAP-110` and `GAP-114` have no register row at all.** They exist only in history, so a register-based triage cannot see them.
- ⬜ **Check 2** — confirm every Task value still points at a task that exists and still describes the work.
- ⬜ **Check 1** — reconcile the ADR consequence tables against the register. ⚠️ The ADR-table half is the half `AGENTS.md` §2 sends every session to, so a stale entry there costs time on every future task.
- ⬜ **Sign-off** — add the Phase 6 → Go-Live row.

⚠️ **Why this half is not a formality.** Three separate errors on 2026-08-21 came from trusting a register row instead of reading the underlying artefact, and **none was caught by a check** — each surfaced only when someone went to act on it. Two would have done real damage: a duplicate amendment to a solicitor-reviewed legal document, and WJ sent to reconfigure production settings that were already correct.

**Effort: 1–2 hours, no WJ input needed** until the sign-off.

---

## 4. `P5.7` — OSCR and CCNI lookup

### The decision, and why it should wait

`BD-02`/`FP-07` record this as **"planned before general release"**, which reads as blocking launch. It is **not** in the Phase 6 → Go-Live Gate. `IMPLEMENTATION-PLAN.md` states the position bluntly: either it blocks `P5.6` and the gate must name it, or it is honestly reclassified as post-launch and `BD-02`/`FP-07` amended — and **"leaving it as an unblocking 'planned before general release' is the state that produced this gap in the first place."**

⚠️ **The recommendation is NOT to decide yet — and that is a substantive recommendation, not a deferral.** The plan itself says the API question _"is a real risk and must be settled before any build estimate."_ Deciding the gate position first means either committing to an unbounded launch delay, or writing off a considered commitment — both blind.

**Do the investigation first. It is half a day and it collapses the uncertainty.**

### What the investigation must establish

1. **Does OSCR offer a live query API**, or only a downloadable register file?
2. **Does CCNI offer a live query API**, or only bulk data?
3. **Is there a governing-document / charitable-objects endpoint for either?** `FR-10`'s second half — the AI paraphrase of charitable objects — depends on one today for England and Wales.

### The two outcomes, and what each costs

| Outcome                            | Design                                                                                                                                                                  | Estimated effort                        | Gate position                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------- |
| **Both offer live APIs**           | Route by registration number in `actions/charity.ts`, three providers behind one interface. Closely parallels what exists.                                              | **3–5 days** build and test             | Defensible to do **before** launch     |
| **One or both are bulk-data only** | A periodically-refreshed local lookup table — with its own currency, storage, refresh-scheduling and "how current is this?" user-facing decisions (compare `DR-GK-002`) | **2–4 weeks**, and it needs its own ADR | Clearly **post-launch**; amend `BD-02` |

⚠️ **The bulk-data outcome is not merely slower, it is a different product decision.** A lookup that is three months stale, presented as authoritative, is worse than honest manual entry — so it brings a currency-disclosure question that the live-API design does not have.

### What the build carries regardless of shape

These are in scope whichever route it takes, and they are easy to underestimate:

- **Registration-number routing.** OSCR is `SC` + six digits; CCNI is six digits; a NI charity may also hold an HMRC reference. **The number mostly identifies the register — but the ambiguous cases must be handled in the UI, not guessed silently.**
- **User-facing copy that is only correct today because the lookup is E&W-only** — the profile tooltip in `components/charity-profile-form.tsx` ("most UK charities are found automatically…", which a Scottish user will read as a promise), the external Business Overview, `docs/business-overview.md`, and the BRD §4.2.1.
- ⚠️ **The privacy policy.** A new register is a **new source of personal data**, and Section "Where we get your information from" names only the Charity Commission for England and Wales. **This must be amended before the feature ships, not after** — and it is the artefact that costs a fee to have reviewed (`AGENTS.md` §3 Step 2a).
- **Tests.** Nothing anywhere exercises a Scottish or NI number. New cases in `regression-test-plan.md` using **genuine numbers from the public registers** — an invented number tests the failure path, not the success path.
- **Documentation on completion:** `PRD` FR-10 and glossary, `acceptance-criteria.md` AC-FR-10, BRD §4.2.1, remove `FP-07` from `future-phases.md`, `ADR-TRACEABILITY.md`, `technology-stack.md` (new external dependency).

### Scale, for the decision

**~24,000 OSCR + ~7,000 CCNI against ~168,000 England and Wales — about 16% of UK charities**, and disproportionately the small community organisations this product exists for. Until it ships, **everything user-facing must keep saying England and Wales only** — which, as of overview v1.19 and BRD v0.54, it does.

---

## 5. `P5.6` — DNS and Go-Live

**Split it in two.** The DNS half has waiting time and no launch commitment; the go-live half is a decision. **Doing them together is what would put a 48-hour propagation wait on launch day.**

### 5a. DNS records — do this now

⚠️ **Records, NOT nameservers.** `IMPLEMENTATION-PLAN.md` says _"point DNS to Vercel"_ and Vercel offers both routes. **Nameserver delegation would break email.** The domain carries, at the registrar: **MX** to `secureserver.net`, an **SPF** record including `amazonses.com` (which is how Resend sends as the domain), **DKIM** at `resend._domainkey` and `send`, and a **DMARC** record. Delegating to Vercel's nameservers abandons all of it — the mailbox stops and `FR-44`'s verification emails fail authentication.

At 123 Reg, change exactly two records and touch nothing else:

| Record          | From                                        | To                         |
| --------------- | ------------------------------------------- | -------------------------- |
| `A` (apex, `@`) | `76.223.67.189` + `13.248.213.45` (parking) | **`76.76.21.21`**          |
| `CNAME` (`www`) | `grantpathway.org.uk`                       | **`cname.vercel-dns.com`** |

**Then verify — and a `200` is not verification.** The plan already records this failure mode: before cutover the apex returned **HTTP 200 from a registrar parking page.** Check for the application, not for a response.

- Apex and `www` both serve Grant Pathway, not the 123 Reg page
- The parking cookies are gone — `traffic_target`, `lander_type`, `_tccl_visitor`, `pvisitor`, and **`caf_ipaddr`, which holds the visitor's IP**
- **Email still works** — send yourself one, and confirm MX/SPF/DKIM/DMARC are unchanged
- A verification email's link resolves to the real site (`FR-44`)

✅ **Doing this early commits you to nothing.** It makes the advertised address serve the product instead of an ad page — which is an improvement whether you launch next week or next month.

### 5b. Go-live — after the gate

- Set `NEXT_PUBLIC_ALLOW_INDEXING=true` in Vercel Production and **remove `NEXT_PUBLIC_SITE_URL`**. Indexing is opt-in: `robots.ts` disallows everything unless the flag is exactly `'true'`.
- **Then verify `robots.txt` actually flipped** — one `curl`. It is the difference between launching visibly and launching invisibly, and it costs seconds.
- Confirm HTTPS enforced and `Strict-Transport-Security` present.
- Confirm `/privacy` and `/terms` render, are linked in the footer, and show the correct effective date.
- ⚠️ **Add a test that names the public URL.** `RT-00` step 1 says "the test URL" without pinning it, and **that omission is why a parked domain survived 50 days** — every production test ran against the `*.vercel.app` address instead.
- Announce via CVS newsletters and sector networks.
- **Tag `v1.0.0` as the final step** (`GAP-12`) — after the cutover and after the gate, never before.

---

## 6. What is deliberately not in the route

| Item                                                | Why                                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| `P5.5b` Admin dashboard                             | Operator-only statistics; excluded from the gate by decision               |
| `P6.7` Funder-by-funder extension                   | Open-ended by design                                                       |
| `GAP-116` budget arithmetic                         | Post-launch, WJ 2026-08-21                                                 |
| `GAP-117` placeholder hint, `GAP-118` approve block | Next code iteration                                                        |
| `GAP-120` iOS export                                | Code fix deferred; **its help-centre half is pre-launch**                  |
| `GAP-115` (c)                                       | Deferred — the second Bedrock call was observed catching a false rejection |

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-08-21 | Rapidglobe Ltd | Created at WJ's request to settle the order of execution and plan the three remaining items. **The headline finding is that Phase 6's launch-gating tasks `P6.1`–`P6.5` have been complete since 2026-07-14**, so nothing left before launch is a large build unless `P5.7` becomes one. **Recommended order puts the DNS records first** — the only item with unavoidable waiting time, and doing it early removes a 24–48 hour propagation wait from launch day while committing to nothing. ⚠️ **`P5.6` is split into 5a (records, do now) and 5b (go-live, after the gate)**, and the plan's "point DNS to Vercel" is narrowed to **records, not nameservers**, because the domain carries MX, SPF-with-`amazonses.com`, DKIM and DMARC at the registrar and delegation would break both the mailbox and `FR-44`'s email authentication. ⚠️ **`P5.7`'s gate position is deliberately NOT recommended either way** — the plan itself says the API question must be settled before any build estimate, and the two outcomes differ by an order of magnitude (3–5 days for live APIs against 2–4 weeks for a bulk-data lookup table, which is a different product decision carrying a currency-disclosure problem). **Recommendation is to spend half a day on the investigation first**, then decide. Also records that a test naming the public URL must be added at go-live, since `RT-00` step 1's unpinned "test URL" is why a parked domain survived 50 days. |
