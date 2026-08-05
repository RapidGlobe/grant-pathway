import { describe, it, expect, vi } from 'vitest'
import { deleteUserGuidelineFiles, isOwnedByUser } from '@/lib/storage-guidelines'

// Unit tests for lib/storage-guidelines.ts — the Storage half of account
// deletion (S8.2, S8.3), added 2026-08-05 to match PDR-DH-002.
//
// The behaviour most worth pinning down is that the helper targets the FLAT
// object layout the app actually writes (`{userId}_{timestamp}`) and not the
// `<user_id>/<filename>` folder layout that older documentation described. A
// regression to the folder assumption would not throw — it would quietly match
// nothing and report success, so these tests assert on what was removed rather
// than only on the absence of an error.

const USER_A = 'aaaaaaaa-0000-0000-0000-000000000001'
const USER_B = 'bbbbbbbb-0000-0000-0000-000000000002'

/** Builds a stub exposing just the storage surface the helper uses. */
function stubStorage(
  pages: { name: string }[][],
  options: { listError?: string; removeError?: string } = {},
) {
  const remove = vi.fn(async () => ({
    data: null,
    error: options.removeError ? { message: options.removeError } : null,
  }))

  const list = vi.fn(async (_path: string, { offset }: { limit: number; offset: number }) => {
    if (options.listError) return { data: null, error: { message: options.listError } }
    // offset is a multiple of the page size, so this maps 1:1 onto `pages`
    const index = offset === 0 ? 0 : Math.floor(offset / 1000)
    return { data: pages[index] ?? [], error: null }
  })

  return {
    client: { storage: { from: () => ({ list, remove }) } },
    list,
    remove,
  }
}

describe('isOwnedByUser', () => {
  it('matches an object written by that user', () => {
    expect(isOwnedByUser(USER_A, `${USER_A}_1754400000000`)).toBe(true)
  })

  it('does not match another user’s object', () => {
    expect(isOwnedByUser(USER_A, `${USER_B}_1754400000000`)).toBe(false)
  })

  it('requires the underscore, so one id cannot prefix another', () => {
    // Guards the case where one user id is a string prefix of another
    expect(isOwnedByUser('abc', 'abcdef_1754400000000')).toBe(false)
    expect(isOwnedByUser('abc', 'abc_1754400000000')).toBe(true)
  })

  it('does not match the bare id with no timestamp', () => {
    expect(isOwnedByUser(USER_A, USER_A)).toBe(false)
  })

  it('does not match an object that merely contains the id', () => {
    expect(isOwnedByUser(USER_A, `other_${USER_A}_1754400000000`)).toBe(false)
  })

  it('rejects the folder layout described in older docs', () => {
    // `guidelines-temp/<user_id>/<filename>` is not what the app writes
    expect(isOwnedByUser(USER_A, `${USER_A}/guidelines.pdf`)).toBe(false)
  })
})

describe('deleteUserGuidelineFiles', () => {
  it('removes only the target user’s objects', async () => {
    const { client, remove } = stubStorage([
      [
        { name: `${USER_A}_1754400000000` },
        { name: `${USER_B}_1754400000001` },
        { name: `${USER_A}_1754400000002` },
      ],
    ])

    const result = await deleteUserGuidelineFiles(client, USER_A)

    expect(result).toEqual({ deleted: 2, error: null })
    expect(remove).toHaveBeenCalledWith([`${USER_A}_1754400000000`, `${USER_A}_1754400000002`])
  })

  it('leaves another user’s objects alone when there is nothing to delete', async () => {
    const { client, remove } = stubStorage([[{ name: `${USER_B}_1754400000001` }]])

    const result = await deleteUserGuidelineFiles(client, USER_A)

    expect(result).toEqual({ deleted: 0, error: null })
    expect(remove).not.toHaveBeenCalled()
  })

  it('is a no-op on an empty bucket — the usual case at deletion time', async () => {
    const { client, remove } = stubStorage([[]])

    const result = await deleteUserGuidelineFiles(client, USER_A)

    expect(result).toEqual({ deleted: 0, error: null })
    expect(remove).not.toHaveBeenCalled()
  })

  it('pages past the 1000-entry list limit', async () => {
    const firstPage = Array.from({ length: 1000 }, (_, i) => ({ name: `${USER_B}_${i}` }))
    const secondPage = [{ name: `${USER_A}_late` }]
    const { client, list, remove } = stubStorage([firstPage, secondPage])

    const result = await deleteUserGuidelineFiles(client, USER_A)

    // A full first page must not be mistaken for the end of the listing
    expect(list).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ deleted: 1, error: null })
    expect(remove).toHaveBeenCalledWith([`${USER_A}_late`])
  })

  it('stops listing once a short page is returned', async () => {
    const { client, list } = stubStorage([[{ name: `${USER_A}_1754400000000` }]])

    await deleteUserGuidelineFiles(client, USER_A)

    expect(list).toHaveBeenCalledTimes(1)
  })

  it('reports a list failure without attempting a remove', async () => {
    const { client, remove } = stubStorage([[]], { listError: 'bucket unavailable' })

    const result = await deleteUserGuidelineFiles(client, USER_A)

    expect(result.deleted).toBe(0)
    expect(result.error).toContain('bucket unavailable')
    expect(remove).not.toHaveBeenCalled()
  })

  it('reports a remove failure', async () => {
    const { client } = stubStorage([[{ name: `${USER_A}_1754400000000` }]], {
      removeError: 'permission denied',
    })

    const result = await deleteUserGuidelineFiles(client, USER_A)

    expect(result.deleted).toBe(0)
    expect(result.error).toContain('permission denied')
  })

  it('returns rather than throws, so callers can continue deleting', async () => {
    // Both call sites treat Storage failure as non-fatal; a throw here would
    // abort an erasure request that the cleanup cron would have finished anyway
    const { client } = stubStorage([[]], { listError: 'boom' })

    await expect(deleteUserGuidelineFiles(client, USER_A)).resolves.toBeTruthy()
  })
})
