# Test Charity Profiles — Funder Eligibility Matching

**Tier:** 2 — Check if relevant
**Volatility:** Medium
**Update when:** A funder is added to or removed from `docs/Grant Org Guidelines/`, a test profile is created or changed, or a run hits an eligibility stop this table did not predict

**Version:** 1.0
**Date:** 2026-08-21

---

## Why this exists

**An eligibility hard stop destroys a test run.** `FR-47` / `DR-EL-001` give it no override: the application is set to `mismatch`, there is no path to Step 4, and the user must update their charity profile and **start a new application**. Roughly twenty minutes of setup is lost each time, and the Bedrock call is spent.

It has now happened four times in two days, every time on a profile that was never going to pass:

| Date       | Profile used                            | Funder                       | Why it stopped                                                      |
| ---------- | --------------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| 2026-08-19 | Harry's Rainbow (bereaved children, MK) | Walton Charity               | Walton funds Elmbridge only — geographic mismatch (`GAP-115`'s run) |
| 2026-08-20 | Helping Hands (isolated older adults)   | Henry Smith Holiday Grants   | Funds trips for disadvantaged children aged 13 and under            |
| 2026-08-21 | National Opera charity                  | Stony Stratford Town Council | Funds the parish of Stony Stratford, Fullers Slade and Galley Hill  |
| 2026-08-21 | (two further attempts, same session)    | —                            | Reported by WJ; profiles not recorded                               |

**Every one of those stops was correct behaviour.** The product was working; the run was set up wrong. This table exists so the profile is checked against the funder _before_ the twenty minutes is spent, not after.

⚠️ **Read the criteria, not the charity's name.** Harry's Rainbow is a children's charity and still failed Walton, because Walton's binding criterion is _where_ not _who_. Most stops in this project have been geographic.

---

## How to use this

1. Find the funder you are about to test in the table below.
2. Use the profile named in the **Profile** column. If it does not exist on the test account yet, build it from the **Profile must say** column.
3. If the funder is not in the table, read its guidelines before running — do not guess.

**Profiles are reusable across funders.** Six profiles cover every funder in active test plans; the table groups them deliberately so the test account does not need fifteen.

---

## The matrix

**Priority** — 🔴 used by an active test plan, so this profile is needed. ⚪ corpus-only, no current plan runs it.

| Funder / guideline set                             | Priority | Profile              | Profile must say                                                                                                                                                                                                                                                                               | Fails if                                                                                                                       |
| -------------------------------------------------- | -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Stony Stratford Town Council** (form + scheme)   | 🔴       | **P1 — Parish**      | Based in the parish of Stony Stratford (or Fullers Slade / Galley Hill), or delivering there. Beneficiaries described as **parish residents**, with a number. Activity matching §3: community events, youth activities, older people's or cultural provision, local environment                | Not parish-based **and** no stated benefit to parish residents                                                                 |
| **MK Community Foundation** — Oak / Seed / Sapling | 🔴       | **P1 — Parish**      | Constituted not-for-profit **supporting beneficiaries from Milton Keynes**. If income > £5,000, registered with the Charity Commission or equivalent                                                                                                                                           | Beneficiaries outside MK; unconstituted; not registered when income > £5,000                                                   |
| **Henry Smith Foundation** — Holiday Grants        | 🔴       | **P2 — Children**    | School, youth group or non-profit running **one-off trips for children aged 13 and under**, who experience inequity and/or are disabled. Deprived-area or disability focus is prioritised                                                                                                      | Adults; children over 13; ongoing service rather than a trip                                                                   |
| **Idlewild Trust** — Arts                          | 🔴       | **P4 — Arts**        | **Arts-sector UK Registered Charity** with a track record of excellence, offering **high-level training to early-career** performing/fine/applied-arts professionals **aged 18+** who have completed their highest available education                                                         | Under-18 participants; community arts without a professional-training purpose                                                  |
| **Idlewild Trust** — Conservation                  | 🔴       | **P4 — Arts**        | UK Registered Charity or exempt national museum, conserving historic or artistically important objects **in a museum, gallery or historic building**, publicly accessible                                                                                                                      | No collection; objects not publicly accessible                                                                                 |
| **A B Charitable Trust**                           | 🔴       | **P5 — Justice**     | Work in one of exactly four categories: **Access to Justice, Human Rights, Migrants and Refugees, or the Justice System and Penal Reform**. Marginalised-community focus                                                                                                                       | Anything outside those four categories                                                                                         |
| **Walton Charity** — Community Grants              | 🔴       | **P6 — Elmbridge**   | Local charity, school or social enterprise in **Elmbridge**, with **tackling poverty and inequality as its core mission**. Annual income **under £200K** for a small grant                                                                                                                     | Outside Elmbridge; poverty not core (general older-people, disability or hospice work is named as excluded); income over £200K |
| **The Radcliffe Trust** (application form)         | 🔴       | **any**              | ⚠️ **The form contains no eligibility criteria at all** — it is a blank six-table form. Nothing in the document can ground a mismatch                                                                                                                                                          | ⚠️ **Untested.** If a stop occurs here, the criteria came from outside the document — raise it                                 |
| **Clothworkers' Foundation**                       | ⚪       | **P2 — Children**    | UK registered charity or not-for-profit, **capital project**, majority of beneficiaries in a programme area (disabled children/young people, young people facing disadvantage)                                                                                                                 | Revenue-only project; general education, sport, wildlife or youth arts unless ≥50% in a programme area                         |
| **Garfield Weston Foundation**                     | ⚪       | **P1 or P2**         | UK registered charity or CIO in Arts, Community, Education, Environment, Faith, Health, Museums and Heritage, Welfare or Youth, with **at least one year of accounts**. No geographic restriction                                                                                              | Under a year of accounts; not a registered charity/CIO                                                                         |
| **Henry Smith Foundation** — Proud Homes           | ⚪       | **P3 — Housing**     | Generalist provider — housing advice team, hostel or supported accommodation — **already supporting young people facing or experiencing homelessness**                                                                                                                                         | No existing homelessness provision                                                                                             |
| **Nationwide Community Grants**                    | ⚪       | **P3 — Housing**     | Charity, co-operative or community benefit society targeting **housing need and/or homelessness**, with **≥3 unrelated trustees and 2 unrelated bank signatories**                                                                                                                             | No housing/homelessness link; fewer than three unrelated trustees                                                              |
| **Wolfson Foundation** — Health & Disability       | ⚪       | **P7 — Health**      | Health or disability organisation with a **capital project** at a stated location, land tenure or planning in place, **two years of signed audited accounts**                                                                                                                                  | ⚠️ The stage-1 document lists required fields, **not eligibility criteria** — a stop here needs checking                       |
| **EYP — Early Years Parenting Fund**               | ⚪       | **P8 — Early years** | Registered charity/CIO/asset-locked CIC working with **parents of children aged 0–5 from Black (Caribbean or African, Any Other Black), Pakistani, and Gypsy, Roma and Traveller communities**. Income **£100,000–£5 million**. A year of examined accounts. Published, disaggregable evidence | Wrong age range; no named-community focus; income outside the band; no published evidence                                      |
| **Lloyds Bank Foundation** — Specialist Funding    | ⚪       | **P9 — Specialist**  | **Specialist** charity whose main purpose and majority of work is one of eight programme themes. Adult-at-risk/safeguarding policy and public liability insurance required. Asylum/refugee applicants must be **OISC-regulated**                                                               | Generalist charity; family-focused work (explicitly not funded); missing policies                                              |
| **Heritage Fund**                                  | ⚪       | **P10 — Heritage**   | ⚠️ Criteria not extracted — the guidance's "Who can apply?" sections are navigation headings in the extracted text. **Read the PDF before running**                                                                                                                                            | Unknown — do not guess                                                                                                         |

---

## The six profiles worth building

Only the 🔴 rows are needed for the current plans. That is **six profiles**, not fifteen.

| Profile            | Shape                                                                                       | Covers                                                                          | Status                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **P1 — Parish**    | MK-based community group in the parish of Stony Stratford; beneficiaries = parish residents | Stony Stratford (both forms + scheme), MK Community Foundation, Garfield Weston | ✅ **Exists** — the Stony Stratford Community Larder shape, and the real fixture behind `GCM-06`                           |
| **P2 — Children**  | Children and young people facing disadvantage; trips/respite; children **13 and under**     | Henry Smith Holiday Grants, Clothworkers                                        | 🟡 **Partly** — Harry's Rainbow passed Stony Stratford on 2026-08-21, but its age range needs to reach ≤13 for Henry Smith |
| **P4 — Arts**      | Arts-sector UK registered charity; early-career professional training, 18+                  | Idlewild Arts **and** Idlewild Conservation (`GCM-01`'s fixture)                | ❌ **Needed** — `GCM-01` runs against Idlewild and has no matching profile on record                                       |
| **P5 — Justice**   | Access to justice / human rights / migrants and refugees / penal reform                     | A B Charitable Trust (flagship plan)                                            | ❌ **Needed**                                                                                                              |
| **P6 — Elmbridge** | Elmbridge-based, poverty and inequality as core mission, income under £200K                 | Walton Charity (eligibility plan)                                               | ❌ **Needed** — and the 2026-08-19 stop was this gap                                                                       |
| **any**            | Radcliffe's form carries no criteria, so any profile should reach Step 4                    | The Radcliffe Trust (`RT-04`)                                                   | ⚠️ **Untested claim** — see below                                                                                          |

⚠️ **P2 is the one to watch.** Harry's Rainbow supports bereaved children and young people, which reads as a match for Henry Smith Holiday Grants — but Henry Smith's binding limit is **age 13 and under** and **one-off trips**. A profile describing work with young people up to 18, or ongoing support rather than trips, can legitimately stop. State the age range and the trip format explicitly.

---

## The Radcliffe observation, still open

`docs/Grant Org Guidelines/Radcliffe Trust Application Form.docx` is a blank form with **no eligibility criteria in it at all**. A mismatch raised against that document would have nothing in the document to justify it — the criteria would have to have come from the model's pre-training knowledge of the funder rather than from the uploaded text.

**This has never been deliberately tested**, and it is a different question from every stop in the table above, all of which were grounded in the document. Worth a deliberate check: run Radcliffe against a profile that is obviously unrelated to music, arts or heritage and see whether it reaches Step 4.

**Do not confuse this with the Henry Smith or Stony Stratford stops, which were correct.** A previous session conflated the two and reported the wrong thing.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-08-21 | Rapidglobe Ltd | **Created at WJ's request, after eligibility hard stops destroyed four test runs in two days** — the last two in a single session. Criteria read from all 15 guideline sets in `docs/Grant Org Guidelines/` rather than from funder names or memory. **Six profiles cover every funder in an active test plan**, of which one exists, one is partly right and three are missing — including `P4 — Arts`, which `GCM-01` needs and has never had. **Two documents cannot ground a mismatch and are flagged rather than guessed:** the Radcliffe form carries no criteria at all, and Wolfson's stage-1 document lists required fields rather than eligibility rules. Heritage Fund's criteria could not be extracted from the PDF's navigation headings and is marked read-before-running. |
