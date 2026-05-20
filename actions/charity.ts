'use server'

// Charity Server Actions (Slice 1)
// Charity Commission lookup is centralised here so the component stays thin.

// ---------------------------------------------------------------------------
// S1.1 — Charity Commission lookup
// ---------------------------------------------------------------------------

export type CharityLookupResult =
  | { ok: true; charityName: string; registrationNumber: string }
  | { ok: false; reason: 'not_found' | 'unavailable' }

/**
 * Looks up a charity by name or registration number via the Charity Commission
 * for England and Wales public API (FR-10).
 *
 * - Registration number (6–8 digits): calls GET /allCharityDetails/{number}
 * - Name string: calls GET /charitySearch/{name}/1/1 (first result only)
 *
 * On match:   returns { ok: true, charityName, registrationNumber }
 * No match:   returns { ok: false, reason: 'not_found' }
 * API error / missing key: returns { ok: false, reason: 'unavailable' }
 *
 * Called from CharityProfileForm via useTransition (returns structured data,
 * not FormData, so useActionState is not appropriate here).
 */
export async function lookupCharity(query: string): Promise<CharityLookupResult> {
  const apiKey = process.env.CHARITY_COMMISSION_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'unavailable' }
  }

  const trimmed = query.trim()
  if (!trimmed) return { ok: false, reason: 'not_found' }

  const baseUrl = 'https://api.charitycommission.gov.uk/register/api'
  const headers = { 'Ocp-Apim-Subscription-Key': apiKey }

  // Abort after 10 seconds so a slow or unreachable API surface as 'unavailable'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const isNumber = /^\d{6,8}$/.test(trimmed)

    if (isNumber) {
      // ── Look up by registration number ───────────────────────────────────
      const res = await fetch(`${baseUrl}/allCharityDetails/${trimmed}`, {
        headers,
        signal: controller.signal,
        // Never serve stale charity data from the Next.js fetch cache
        cache: 'no-store',
      })

      clearTimeout(timeout)

      if (res.status === 404) return { ok: false, reason: 'not_found' }
      if (!res.ok) return { ok: false, reason: 'unavailable' }

      const data = (await res.json()) as Record<string, unknown>
      const name = (data.charity_name ?? data.charityName ?? '') as string
      if (!name) return { ok: false, reason: 'not_found' }

      return {
        ok: true,
        charityName: toTitleCase(name),
        registrationNumber: trimmed,
      }
    } else {
      // ── Search by name — take first result ───────────────────────────────
      const encoded = encodeURIComponent(trimmed)
      const res = await fetch(`${baseUrl}/charitySearch/${encoded}/1/1`, {
        headers,
        signal: controller.signal,
        cache: 'no-store',
      })

      clearTimeout(timeout)

      if (!res.ok) return { ok: false, reason: 'unavailable' }

      const data = (await res.json()) as unknown
      if (!Array.isArray(data) || data.length === 0) {
        return { ok: false, reason: 'not_found' }
      }

      const first = data[0] as Record<string, unknown>
      const name = (first.charity_name ?? first.charityName ?? '') as string
      const regNum = String(
        first.reg_charity_number ?? first.registeredCharityNumber ?? '',
      )

      if (!name) return { ok: false, reason: 'not_found' }

      return {
        ok: true,
        charityName: toTitleCase(name),
        registrationNumber: regNum,
      }
    }
  } catch {
    clearTimeout(timeout)
    // Network error, timeout, or JSON parse failure → treat as unavailable
    return { ok: false, reason: 'unavailable' }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an ALL-CAPS charity name (as returned by the Charity Commission API)
 * to Title Case for display in the form field.
 * e.g. "HELPING HANDS UK TRUST" → "Helping Hands Uk Trust"
 * The user can correct edge cases (e.g. "Uk" → "UK") before saving.
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
}
