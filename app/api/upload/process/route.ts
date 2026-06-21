// POST /api/upload/process (S4.1, S4.3)
//
// Downloads the uploaded file from Supabase Storage, validates it server-side,
// extracts text, and returns the text with a large-document flag.
//
// The file is deleted from Storage BEFORE extraction — it is already in
// memory as a Buffer. This unconditional delete (ADR-FILE-001) means the
// file is never stranded even if extraction or the network call fails.
//
// applicationId is verified against the authenticated user before processing
// to prevent IDOR: an attacker cannot process files against another user's
// application even if they know the applicationId (BOLA fix, 2026-06-21).
//
// Request body: { path: string, applicationId: string }
//
// Success: { text: string, isLargeDocument: boolean }
// Error:   { error: 'scanned_pdf' | 'invalid_type' | 'too_large' | string }

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { validateFile } from '@/lib/file-validation'
import { detectMimeType, extractText } from '@/lib/extract-text'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify authenticated session
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request body
  let body: { path?: unknown; applicationId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { path, applicationId } = body
  if (typeof path !== 'string' || !path || typeof applicationId !== 'string' || !applicationId) {
    return NextResponse.json({ error: 'Missing or invalid path / applicationId.' }, { status: 400 })
  }

  // Verify the application belongs to the authenticated user (IDOR/BOLA guard)
  const { data: appRow, error: appOwnershipError } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appOwnershipError || !appRow) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Service role client — required for private bucket access
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Download the file from Storage
  const { data: blob, error: downloadError } = await service.storage
    .from('guidelines-temp')
    .download(path)

  // Unconditionally delete from Storage immediately after download.
  // File is now in memory; the Storage object is no longer needed.
  // Errors here are non-fatal — orphan cleanup cron handles stragglers (S4.4).
  service.storage
    .from('guidelines-temp')
    .remove([path])
    .catch((err) => console.error('[process] Failed to delete file from Storage:', err))

  if (downloadError || !blob) {
    console.error('[process] Failed to download file:', downloadError)
    return NextResponse.json(
      { error: 'Could not retrieve the uploaded file. Please try uploading again.' },
      { status: 500 },
    )
  }

  // Convert Blob to Buffer
  const buffer = Buffer.from(await blob.arrayBuffer())

  // Server-side validation via magic bytes (ADR-FILE-002, GAP-08)
  // Never trust the client-reported MIME type — detect from file content.
  const detectedMimeType = detectMimeType(buffer)
  const validation = validateFile(detectedMimeType, buffer.length)

  if (!validation.ok) {
    // Map internal reason to error key the client expects
    return NextResponse.json({ error: validation.reason }, { status: 422 })
  }

  // Extract text
  const result = await extractText(buffer, validation.mimeType)

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 })
  }

  return NextResponse.json({
    text: result.text,
    isLargeDocument: result.isLargeDocument,
  })
}
