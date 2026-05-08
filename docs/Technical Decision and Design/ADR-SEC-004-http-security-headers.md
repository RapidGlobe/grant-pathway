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

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'` |

Headers are defined in the `headers()` async function in `next.config.js` and apply globally to all routes. After first production deployment, validate at securityheaders.com and tighten the CSP iteratively. If third-party scripts are added post-v1 (e.g., analytics), the `script-src` directive must be updated.

## Consequences

- Headers are defined in `next.config.js` under the `headers()` async function.
- CSP must be tested against all pages to ensure no resources are blocked.
- If nonce-based CSP is implemented, Next.js middleware must inject the nonce into each request.

## Source

BRD Section 9 (Data Privacy & Security).

## Date Decided

2026-04-21
