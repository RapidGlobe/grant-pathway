import { describe, it, expect, afterEach } from 'vitest'
import { getAppVersion } from '@/lib/version'

describe('getAppVersion', () => {
  const originalValue = process.env.APP_VERSION

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.APP_VERSION
    } else {
      process.env.APP_VERSION = originalValue
    }
  })

  it('returns APP_VERSION when set', () => {
    process.env.APP_VERSION = '2026.07.02-a2ca520'
    expect(getAppVersion()).toBe('2026.07.02-a2ca520')
  })

  it('falls back to "dev" when APP_VERSION is not set', () => {
    delete process.env.APP_VERSION
    expect(getAppVersion()).toBe('dev')
  })
})
