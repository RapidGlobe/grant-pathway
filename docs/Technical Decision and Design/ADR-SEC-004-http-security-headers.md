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

## Consequences

- Headers are defined in `next.config.js` under the `headers()` async function.
- CSP must be tested against all pages to ensure no resources are blocked.
- If nonce-based CSP is implemented, Next.js middleware must inject the nonce into each request.
- **Added 2026-07-10:** the Phase 6 guideline source-reference feature (P6.4's "view original guidelines" viewer) requires jump-to-page _and_ highlight-on-click (decided when the feature was scoped) — this rules out a simple `<iframe>`/`<object>` PDF embed (no highlighting API) and implies canvas-based rendering instead (fetch the file as bytes, render pages to `<canvas>`, draw the highlight manually — the pattern used by libraries like pdf.js). Consequence: **`worker-src 'self' blob:` must be added to the CSP** to permit the rendering library's web worker (typically loaded from a `blob:` URL). No other directive changes are needed — `connect-src` already includes `https://*.supabase.co` for fetching the file, and no `frame-src`/`object-src` allowance is required since the PDF is never embedded via `<iframe>`/`<object>`.

## Revision History

| Date       | Change                                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Added `worker-src 'self' blob:` consequence for the P6.4 guideline viewer (canvas-based PDF rendering). No change to the CSP value in the Decision table above yet — that happens when P6.4 is implemented; this records the requirement in advance. |

## Source

NFR-04 (Security).

## Date Decided

2026-04-21
