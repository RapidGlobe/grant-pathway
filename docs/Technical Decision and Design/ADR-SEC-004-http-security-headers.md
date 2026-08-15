---
id: ADR-SEC-004
category: Security
status: Decided
---

# ADR-SEC-004 — HTTP Security Headers

## Context

Grant Pathway is a web application that should follow security best practices for HTTP headers. Security headers protect against common web vulnerabilities including cross-site scripting (XSS), clickjacking, MIME-type sniffing, and unwanted information disclosure. Vercel provides some headers by default but the application must configure appropriate headers explicitly.

## Options Considered

### Option A — Full security header set via `next.config.js`

- **What it is:** Configure `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` in `next.config.js` headers configuration.
- **Strengths:** Comprehensive protection. Industry best practice. Headers scored well on securityheaders.com. CSP prevents XSS by restricting script sources.
- **Weaknesses:** CSP configuration requires care to avoid blocking legitimate resources (Supabase, Vercel, Anthropic). Must be tested to avoid breaking the application.

### Option B — Minimal headers only (`X-Frame-Options`, `X-Content-Type-Options`)

- **What it is:** Add only the most impactful and easy-to-configure headers.
- **Strengths:** Low risk of breaking the application. Quick to implement.
- **Weaknesses:** Leaves XSS protection to browser defaults. No CSP.

### Option C — Vercel defaults only (no explicit header configuration)

- **What it is:** Rely on Vercel's platform-level defaults.
- **Strengths:** Zero implementation effort.
- **Weaknesses:** Vercel defaults do not include CSP or full HSTS configuration. Not considered sufficient for a production application.

## Decision

**Option A — Full security header set configured in `next.config.js`.**

All major security headers are applied to every response. CSP uses `'unsafe-inline'` for scripts and styles as a pragmatic starting point compatible with Next.js hydration. Nonce-based CSP is a post-v1 hardening task.

**Header configuration:**

| Header                      | Value                                                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `X-Frame-Options`           | `DENY`                                                                                                                                                                            |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                                         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`                                                                                                                                        |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                                                                                                                                             |
| `Content-Security-Policy`   | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'` |

Headers are defined in the `headers()` async function in `next.config.js` and apply globally to all routes. After first production deployment, validate at securityheaders.com and tighten the CSP iteratively. If third-party scripts are added post-v1 (e.g., analytics), the `script-src` directive must be updated.

> **The CSP value in the table above is the value decided on 2026-05-14 and is no longer what is deployed.** It is left as written because it records the decision; the deployed policy is maintained in `technical-design.md`, which is the Tier 1 document and the one to trust. The tightening was authorised by this ADR's own instruction to "tighten the CSP iteratively" and by `P5.2`'s equivalent bullet, so no decision has been overridden. Divergences as at **2026-08-15**:
>
> - `script-src` is `'self' 'nonce-{per-request}'`, **not** `'unsafe-inline'` — the nonce-based CSP anticipated in consequence 3 below was implemented, which is a material strengthening.
> - `connect-src` gained `https://*.ingest.de.sentry.io`, without which the browser Sentry SDK's requests are silently blocked.
> - `base-uri 'self'`, `form-action 'self'` and `object-src 'none'` were added (`GAP-96`, `GAP-97`). **`base-uri` and `form-action` do not fall back to `default-src`** — the specification's fallback chain covers fetch directives only — so their absence meant no protection at all on either axis, not the inherited `'self'` a reader of this table would reasonably assume.
> - `Content-Security-Policy` is no longer set in `next.config.ts` at all; it is stamped per-request in `middleware.ts` so it can carry the nonce. **Consequence 1 below is stale for this one header** and correct for the other five.
> - `X-Powered-By` is now suppressed via `poweredByHeader: false` (`GAP-98`). It was never in this table because Next.js adds it automatically rather than it being configured.

## Consequences

- Headers are defined in `next.config.js` under the `headers()` async function.
- CSP must be tested against all pages to ensure no resources are blocked.
- If nonce-based CSP is implemented, Next.js middleware must inject the nonce into each request.
- **Added 2026-07-10, corrected 2026-07-14:** the Phase 6 guideline source-reference feature (P6.4's "view original guidelines" viewer) requires jump-to-page/section _and_ highlight-on-click. The 2026-07-10 note assumed this meant fetching the raw PDF file and rendering it to a `<canvas>` (pdf.js-style), requiring a `worker-src 'self' blob:` CSP addition for the rendering library's web worker. **That assumption no longer holds:** `ADR-DATA-002`'s retention decision, and the `application_guidelines` table that implements it (GAP-33 fix, 2026-07-14), only ever retain extracted, marker-tagged **text** — the raw file is deleted immediately after Step 2 extraction (`ADR-FILE-001`) and is never available to fetch bytes from at Step 4. **Corrected consequence:** the viewer renders the retained text in a plain scrollable panel, scrolling to and highlighting the cited `[PAGE N]`/`[SECTION: ...]` marker's text — no canvas rendering, no PDF-rendering library, and **no CSP change is needed at all**, since nothing loads a rendering web worker. No `frame-src`/`object-src` allowance is required either, matching the original note's conclusion (the PDF is never embedded), just for a different underlying reason.

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Added `worker-src 'self' blob:` consequence for the P6.4 guideline viewer (canvas-based PDF rendering). No change to the CSP value in the Decision table above yet — that happens when P6.4 is implemented; this records the requirement in advance.                                                                                                                                    |
| 2026-07-14 | **Consequence corrected, not just implemented:** the 2026-07-10 canvas-rendering assumption was wrong — only text is ever retained (`application_guidelines`, GAP-33 fix), never the raw file, so there is nothing to fetch bytes from or render to a canvas. The P6.4 viewer is a text panel; **no CSP change is needed**. The Decision table's CSP value above is unaffected by P6.4. |

## Source

NFR-04 (Security).

## Date Decided

2026-04-21
