// Deletion of a user's in-flight guideline uploads from the `guidelines-temp`
// Storage bucket, for the two account-deletion paths (S8.2, S8.3).
//
// Added 2026-08-05. PDR-DH-002's "data deleted on inactivity closure" list has
// always named "uploaded funder guideline files (Supabase Storage)", but neither
// deletion path touched Storage. The files were left entirely to the
// cleanup-guidelines cron (S4.4), which removes anything older than an hour,
// every 30 minutes.
//
// Why close a window that sweep already covers: once the account is gone, no row
// remains that ties `{userId}_{timestamp}` to a person. The object name still
// embeds the user id, so it is still personal data — but there is no user left
// to ask about it and nothing to join it to. Every other way the cleanup job can
// fail is self-healing, because the owning account is still there to re-derive
// the link from. This is the single case where the fallback cannot recover, and
// it follows an explicit erasure request, so it is worth deleting up front
// rather than delegating.
//
// OBJECT NAMING — files are FLAT at the bucket root: `{userId}_{timestamp}`,
// with no folder segment. This is deliberate (app/api/upload/signed-url/route.ts
// notes it) so the cleanup cron's `list('')` needs no recursive traversal, and
// it is the same prefix rule that app/api/upload/process/route.ts uses as its
// IDOR guard. Code written against the `guidelines-temp/<user_id>/<filename>`
// layout described in some older documentation would match nothing and delete
// nothing, silently — the precise failure this helper exists to avoid.

/** Bucket holding transient guideline uploads (ADR-FILE-001). */
const BUCKET = 'guidelines-temp'

/** Supabase caps `list` at 1000 entries per call. */
const PAGE_SIZE = 1000

/**
 * Upper bound on pages walked, so a misbehaving API cannot spin this forever.
 * The bucket holds only files younger than an hour, so real depth is single
 * digits; 1000 pages is a backstop, not a working limit.
 */
const MAX_PAGES = 1000

/**
 * Just the slice of the Supabase client this module needs. Declared structurally
 * rather than importing `SupabaseClient` so the unit tests can pass a plain
 * object, and so the required capability is visible at a glance.
 */
type GuidelinesStorage = {
  storage: {
    from: (bucket: string) => {
      list: (
        path: string,
        options: { limit: number; offset: number },
      ) => Promise<{ data: { name: string }[] | null; error: { message: string } | null }>
      remove: (paths: string[]) => Promise<{ data: unknown; error: { message: string } | null }>
    }
  }
}

/**
 * True when a bucket object belongs to the given user.
 *
 * Deliberately identical to the ownership test in
 * app/api/upload/process/route.ts: the trailing underscore is required, so user
 * `abc` does not match an object belonging to `abcdef`. Both call sites must
 * agree on this rule — a looser test here would delete another user's file.
 */
export function isOwnedByUser(userId: string, objectName: string): boolean {
  return objectName.startsWith(`${userId}_`)
}

/**
 * Delete every `guidelines-temp` object belonging to `userId`.
 *
 * Returns a result rather than throwing, and callers treat failure as
 * non-fatal — see the call sites in app/api/account/delete/route.ts and
 * app/api/cron/inactivity-deletion/route.ts. The point of this helper is defence
 * in depth behind the cleanup cron; it must not become a new way for an erasure
 * request to fail. That mirrors the posture already taken in
 * app/api/upload/process/route.ts, where a failed Storage delete is logged and
 * left to the same cron.
 *
 * Normally a no-op: the bucket only ever holds files younger than an hour, so at
 * deletion time there is usually nothing to remove. It earns its place in the
 * narrow case where a user uploads and then deletes their account within the
 * hour.
 *
 * Filtering happens client-side on the listing rather than via `list`'s `search`
 * option, whose matching semantics are substring-based and have varied across
 * storage-js versions. An exact prefix rule that cannot drift is worth one pass
 * over a bucket that is nearly always close to empty.
 */
export async function deleteUserGuidelineFiles(
  client: GuidelinesStorage,
  userId: string,
): Promise<{ deleted: number; error: string | null }> {
  const bucket = client.storage.from(BUCKET)
  const owned: string[] = []

  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await bucket.list('', {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })

    if (error) {
      return { deleted: 0, error: `list failed: ${error.message}` }
    }

    if (!data || data.length === 0) break

    for (const object of data) {
      if (isOwnedByUser(userId, object.name)) owned.push(object.name)
    }

    if (data.length < PAGE_SIZE) break
  }

  if (owned.length === 0) return { deleted: 0, error: null }

  const { error: removeError } = await bucket.remove(owned)

  if (removeError) {
    return { deleted: 0, error: `remove failed: ${removeError.message}` }
  }

  return { deleted: owned.length, error: null }
}
