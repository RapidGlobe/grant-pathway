// POST /api/upload/signed-url (S4.1)
//
// Creates a signed upload URL for the guidelines-temp Supabase Storage bucket.
// The client uploads directly to Supabase Storage using this URL (XHR PUT),
// bypassing Vercel's 4.5MB body limit (ADR-STACK-004, ADR-DATA-002).
//
// Auth required. The storage path is namespaced by user ID so orphan cleanup
// (S4.4) can identify and remove stale files.
//
// Returns: { signedUrl: string, path: string }

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  // Verify authenticated session
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Service role client — required for signed URL creation on private bucket
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Flat path at root: `{userId}_{timestamp}` — no slash, so cleanup list() works
  // without recursive folder traversal (S4.4)
  const path = `${user.id}_${Date.now()}`

  const { data, error } = await service.storage.from('guidelines-temp').createSignedUploadUrl(path)

  if (error || !data) {
    console.error('[signed-url] Failed to create signed URL:', error)
    return NextResponse.json(
      { error: 'Could not create upload URL. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path })
}
