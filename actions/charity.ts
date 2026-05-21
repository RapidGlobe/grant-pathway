'use server'

// Charity Server Actions (Slice 1)
// Charity Commission lookup and profile save are centralised here so
// components stay thin.

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Bedrock model identifier (ADR-AI-001) */
const MODEL = 'anthropic.claude-sonnet-4-6'

/** Charity Commission Register of Charities API base URL */
const BASE_URL = 'https://api.charitycommission.gov.uk/register/api'

/** Charity Commission API call timeout (10 s) */
const CC_TIMEOUT_MS = 10_000

/** Bedrock paraphrase timeout (30 s — well within the 60 s maxDuration on the profile route) */
const BEDROCK_TIMEOUT_MS = 30_000

// ---------------------------------------------------------------------------
// S1.2 — Save charity profile
// ---------------------------------------------------------------------------

const saveProfileSchema = z.object({
  charityName: z.string().min(1, 'Please enter your charity name'),
  registrationNumber: z.string().optional(),
  whatDoes: z.string().min(1, 'Please tell us what your charity does'),
  whoHelps: z.string().min(1, 'Please tell us who your charity helps'),
  whereWorks: z.string().min(1, 'Please tell us where your charity works'),
  /** True when Bedrock paraphrased the charitable objects on the most recent lookup */
  paraphrasedFromLookup: z.boolean(),
})

export type SaveProfileInput = z.infer<typeof saveProfileSchema>

export type SaveProfileResult =
  | { ok: true; isFirstSave: boolean }
  | { ok: false; error: string }

/**
 * Upserts the authenticated user's charity profile.
 *
 * - lookup_source is set to 'charity_commission' when the form was pre-filled
 *   via Bedrock paraphrase of the Charity Commission governing document (D14).
 * - lookup_source is set to 'manual' when the user entered all data themselves.
 * - INSERT on first save; UPDATE on subsequent saves (conflict on user_id).
 * - RLS on charity_profiles ensures users can only read/write their own row (ADR-DATA-001).
 */
export async function saveCharityProfile(
  data: SaveProfileInput,
): Promise<SaveProfileResult> {
  const parsed = saveProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { ok: false, error: 'Invalid profile data. Please check the form.' }
  }

  const {
    charityName,
    registrationNumber,
    whatDoes,
    whoHelps,
    whereWorks,
    paraphrasedFromLookup,
  } = parsed.data

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: 'You must be signed in to save your profile.' }
  }

  // Detect first save before the upsert so we can return the correct flag
  const { data: existing } = await supabase
    .from('charity_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const isFirstSave = !existing

  const { error: saveError } = await supabase.from('charity_profiles').upsert(
    {
      user_id: user.id,
      charity_name: charityName,
      registration_number: registrationNumber || null,
      what_charity_does: whatDoes,
      who_charity_helps: whoHelps,
      where_charity_works: whereWorks,
      lookup_source: paraphrasedFromLookup ? 'charity_commission' : 'manual',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (saveError) {
    return { ok: false, error: 'Could not save your profile. Please try again.' }
  }

  return { ok: true, isFirstSave }
}

// ---------------------------------------------------------------------------
// S1.1 — Charity Commission lookup
// ---------------------------------------------------------------------------

export type CharityLookupResult =
  | {
      ok: true
      charityName: string
      registrationNumber: string
      /**
       * Plain-English description of what the charity does, paraphrased by AI
       * from the charity's charitable objects text. Empty string if the
       * governing document call or Bedrock paraphrase fails.
       */
      whatDoes: string
      /**
       * Plain-English description of who the charity helps, paraphrased by AI.
       * Empty string if the governing document call or Bedrock paraphrase fails.
       */
      whoHelps: string
    }
  | { ok: false; reason: 'not_found' | 'unavailable' }

/**
 * Looks up a charity by name or registration number via the Charity Commission
 * for England and Wales public API (FR-10), then paraphrases the charitable
 * objects using Amazon Bedrock to generate plain-English descriptions (S1.1).
 *
 * Flow:
 *   1. Name or number → GET /searchCharityName/{name}
 *                     or GET /charityRegNumber/{number}/0
 *      → resolves charity_name + reg_charity_number
 *   2. GET /charitygoverningdocument/{number}/0
 *      → resolves charitable_objects (free-text legal description)
 *   3. Bedrock Claude call → paraphrase into whatDoes + whoHelps
 *
 * Failure modes:
 *   - Missing API key         → { ok: false, reason: 'unavailable' }
 *   - Charity not found       → { ok: false, reason: 'not_found' }
 *   - CC API unreachable      → { ok: false, reason: 'unavailable' }
 *   - Governing doc fails     → ok: true, whatDoes/whoHelps = '' (degrade)
 *   - Bedrock fails/times out → ok: true, whatDoes/whoHelps = '' (degrade)
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

  const headers = { 'Ocp-Apim-Subscription-Key': apiKey }

  // ── Step 1: resolve charity_name and reg_charity_number ─────────────────

  let charityName: string
  let regNumber: string

  try {
    const isNumber = /^\d{6,8}$/.test(trimmed)

    if (isNumber) {
      // GET /charityRegNumber/{RegisteredNumber}/{suffix}
      // suffix=0 for the main registered charity (not a subsidiary)
      const res = await fetchWithTimeout(
        `${BASE_URL}/charityRegNumber/${trimmed}/0`,
        { headers, cache: 'no-store' },
        CC_TIMEOUT_MS,
      )

      if (res.status === 404) return { ok: false, reason: 'not_found' }
      if (!res.ok) return { ok: false, reason: 'unavailable' }

      const data = (await res.json()) as Record<string, unknown>
      const name = (data.charity_name ?? '') as string
      if (!name) return { ok: false, reason: 'not_found' }

      charityName = toTitleCase(name)
      regNumber = trimmed
    } else {
      // GET /searchCharityName/{charityname}
      // Returns an array; take the first result only
      const encoded = encodeURIComponent(trimmed)
      const res = await fetchWithTimeout(
        `${BASE_URL}/searchCharityName/${encoded}`,
        { headers, cache: 'no-store' },
        CC_TIMEOUT_MS,
      )

      if (!res.ok) return { ok: false, reason: 'unavailable' }

      const data = (await res.json()) as unknown
      if (!Array.isArray(data) || data.length === 0) {
        return { ok: false, reason: 'not_found' }
      }

      const first = data[0] as Record<string, unknown>
      const name = (first.charity_name ?? '') as string
      const num = String(first.reg_charity_number ?? '')

      if (!name) return { ok: false, reason: 'not_found' }

      charityName = toTitleCase(name)
      regNumber = num
    }
  } catch {
    // Network error, timeout, or JSON parse failure
    return { ok: false, reason: 'unavailable' }
  }

  // ── Step 2: fetch charitable objects from governing document ─────────────
  // GET /charitygoverningdocument/{RegisteredNumber}/{suffix}
  // Returns { governing_document_description, charitable_objects, area_of_benefit }
  // charitable_objects is the free-text legal description — perfect for AI paraphrase.

  let charitableObjects = ''

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/charitygoverningdocument/${regNumber}/0`,
      { headers, cache: 'no-store' },
      CC_TIMEOUT_MS,
    )
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>
      charitableObjects = ((data.charitable_objects ?? '') as string).trim()
    }
    // A non-2xx status here is not fatal — we continue without charitable objects
  } catch {
    // Timeout or network error for governing document — continue without it
  }

  // ── Step 3: Bedrock paraphrase ───────────────────────────────────────────
  // Only attempted when we have charitable objects to paraphrase.
  // Failures here degrade gracefully — the form hint text guides the user
  // to fill in whatDoes and whoHelps manually.

  let whatDoes = ''
  let whoHelps = ''

  // Guard: only call Bedrock when we have content to paraphrase AND AWS credentials.
  // Narrowing awsAccessKey/awsSecretKey to string satisfies AnthropicBedrock's type.
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY

  if (charitableObjects && awsAccessKey && awsSecretKey) {
    try {
      const bedrock = new AnthropicBedrock({
        awsAccessKey,
        awsSecretKey,
        awsRegion: process.env.AWS_REGION ?? 'eu-west-2',
      })

      const messagePromise = bedrock.messages.create({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: buildParaphrasePrompt(charitableObjects) }],
      })

      // Promise.race gives us a hard timeout without relying on SDK signal support
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('bedrock timeout')), BEDROCK_TIMEOUT_MS),
      )

      const message = await Promise.race([messagePromise, timeoutPromise])

      const raw =
        message.content[0]?.type === 'text' ? message.content[0].text.trim() : ''

      if (raw) {
        // Strip any markdown code fences the model may have added
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
        const parsed = JSON.parse(cleaned) as { whatDoes?: unknown; whoHelps?: unknown }
        whatDoes = typeof parsed.whatDoes === 'string' ? parsed.whatDoes : ''
        whoHelps = typeof parsed.whoHelps === 'string' ? parsed.whoHelps : ''
      }
    } catch {
      // Bedrock unavailable, timeout, or JSON parse error.
      // The name + registration number are still returned successfully.
    }
  }

  return { ok: true, charityName, registrationNumber: regNumber, whatDoes, whoHelps }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps fetch() with an AbortController-based timeout.
 * The caller is responsible for handling thrown errors.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Converts an ALL-CAPS charity name (as returned by the Charity Commission API)
 * to Title Case for display in the form field.
 * e.g. "HELPING HANDS UK TRUST" → "Helping Hands Uk Trust"
 * The user can correct edge cases (e.g. "Uk" → "UK") before saving.
 */
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

/**
 * Builds the Bedrock prompt for paraphrasing a charity's charitable objects
 * into plain-English whatDoes and whoHelps descriptions.
 *
 * The input is truncated to 2,000 characters to stay well within Bedrock's
 * context window and keep costs predictable.
 */
function buildParaphrasePrompt(charitableObjects: string): string {
  const truncated = charitableObjects.slice(0, 2000)
  return `You are a helpful assistant for UK charities. You will receive the charitable objects text from a charity's governing document, as registered with the Charity Commission for England and Wales.

Your task is to extract two short, plain-English summaries:
1. "whatDoes": 1-2 sentences describing what the charity does (its activities and purposes). Avoid legal jargon.
2. "whoHelps": 1-2 sentences describing who the charity helps (its beneficiaries). Avoid legal jargon.

Write these as friendly, accessible descriptions suitable for a grant application.

Return ONLY a JSON object in this exact format, with no other text before or after:
{"whatDoes": "...", "whoHelps": "..."}

Charitable objects:
${truncated}`
}
