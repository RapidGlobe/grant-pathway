// GET /api/cron/cleanup-guidelines (S4.4)
//
// Deletes orphaned files from the guidelines-temp Storage bucket.
// Files older than 1 hour should have been deleted by /api/upload/process;
// this cron job is a safety net for files that were not deleted (e.g. because
// the client never called the process route, or the server errored before
// reaching the delete step).
//
// Called by Vercel Cron every 30 minutes (vercel.json).
//
// Authentication: Authorization: Bearer [CRON_SECRET] header (ADR-OPS-004).
// This route MUST NOT import or call aiRatelimit / resendRatelimit —
// cron endpoints are explicitly excluded from user-facing rate limiting (GAP-13).
//
// This route is in PUBLIC_API in proxy.ts so no session handling overhead
// is incurred (same pattern as /api/health).

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/** Files older than this are considered orphans and eligible for deletion */
const ORPHAN_AGE_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  // Authenticate with CRON_SECRET (ADR-OPS-004)
  const authHeader = request.headers.get('Authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // List all files in the bucket root.
  // Files are stored as flat paths: `{userId}_{timestamp}` — no subfolders.
  const { data: files, error: listError } = await service.storage
    .from('guidelines-temp')
    .list('', { limit: 1000, offset: 0 })

  if (listError) {
    console.error('[cleanup-guidelines] Failed to list files:', listError)
    return NextResponse.json({ error: 'Failed to list files.' }, { status: 500 })
  }

  if (!files || files.length === 0) {
    return NextResponse.json({ deleted: 0 })
  }

  const cutoff = Date.now() - ORPHAN_AGE_MS
  const toDelete: string[] = []

  for (const file of files) {
    // Use updated_at if available, fall back to created_at
    const timestampStr = file.updated_at ?? file.created_at
    const fileTime = timestampStr ? new Date(timestampStr).getTime() : 0

    if (fileTime < cutoff) {
      toDelete.push(file.name)
    }
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0 })
  }

  const { error: deleteError } = await service.storage.from('guidelines-temp').remove(toDelete)

  if (deleteError) {
    console.error('[cleanup-guidelines] Failed to delete files:', deleteError)
    return NextResponse.json({ error: 'Failed to delete orphaned files.' }, { status: 500 })
  }

  console.log(`[cleanup-guidelines] Deleted ${toDelete.length} orphaned file(s)`)
  return NextResponse.json({ deleted: toDelete.length })
}
