# PDR-UI-009 — What we tell a user whose password was rejected for appearing in a data breach

**Tier:** 3
**Volatility:** Low
**Update when:** The wording is revised, or the breach check is turned off

**Status:** Decided
**Decided:** 17 August 2026 (WJ)
**Raised by:** `GAP-106`
**Related:** `GAP-104` (the setting that made this reachable), `FR-02`, `ADR-SEC-006`

---

## The question

Supabase rejects a password for **three** distinct reasons, and reports all three under one error code. `@supabase/auth-js` types them as `["length", "characters", "pwned"]`.

Until 16 August 2026 only two were reachable, because the leaked-password check was off in production. All three forms therefore rendered a single message:

> _"Your password must be at least 12 characters and include both letters and numbers."_

**That message was correct for the two causes that existed.** Turning the breach check on under `GAP-104` made the third reachable — and for that third cause the message is not merely unhelpful, it is **wrong**. A breached password has usually already satisfied both stated conditions: `Password123456` is 14 characters with letters and digits. The user is told to do what they have already done, with no route forward but guessing, on the registration page.

## Options considered

| Option                                                        | Outcome                                                                                                                                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — a distinct message for the breach cause** ✅ **CHOSEN** | The user learns the real reason and can act. Costs one new state through three actions and three forms                                                          |
| B — one vaguer message covering all three                     | **Rejected.** The reason a user cannot act today is that the message says nothing true about their password; a vaguer sentence keeps that property and hides it |
| C — accept it                                                 | **Rejected.** It is a hard stop on registration, and the likely response is abandonment                                                                         |
| D — turn the breach check off                                 | **Rejected.** Removes the symptom by removing a real security control                                                                                           |

## Decision

Where the rejection reason includes `pwned`, render:

> **"This password is known to have been exposed in a data breach somewhere on the internet. It may never have been yours — but it is no longer safe, so please pick a different one."**

The existing rule message stays, unchanged, for genuine length and character failures.

## Why this wording

Three deliberate choices, each rejecting a more obvious alternative:

1. **"It may never have been yours."** Without this, the natural reading is _"my account has been hacked"_, prompting a user to worry about their bank and email. In reality the password is usually just a common one that appeared in someone else's breach years ago. This clause is the most important part of the sentence and the reason this option was chosen over shorter drafts.
2. **No service is named.** Naming the breach-list provider invites the question _"why are you sending my password to them?"_ — the answer is that we do not, but a privacy policy is the place for that explanation, not an error message.
3. **"Exposed", not "hacked" or "compromised".** Both alternatives imply an attack on the user personally.

## Consequences

- Three actions in `actions/auth.ts` gain a `breached_password` state, read from the SDK's `reasons` array through a type guard rather than a cast.
- Three forms render it: `register-form.tsx`, `reset-password-form.tsx`, `account-settings-form.tsx`.
- Client-side validation is **unchanged** — it cannot know about breach lists, and still catches length and character failures before the request is made.
- `PRD-Grant-Pathway.md` §7 and `acceptance-criteria.md` record the new error state.
- ⚠️ **The behaviour is still unobserved.** It was predicted from the code and the `GAP-104` settings change. `P5.5` §3's registration with `Password123456` produces it as a by-product — the cheapest available confirmation. **Sequenced before the flagship runs**, since three test plans exercise registration and would otherwise record the old copy.
- ⚠️ **The generic risk this closes is broader than one message.** A single error code covering several causes will collapse into whichever message was written first. Worth remembering wherever a provider's error is mapped onto user-facing copy.
