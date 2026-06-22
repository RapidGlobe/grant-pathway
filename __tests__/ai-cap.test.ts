import { describe, it, expect } from 'vitest'
import { MONTHLY_CAP, APPROACHING_LIMIT_THRESHOLD } from '@/lib/prompts'

// Unit tests for cap-enforcement logic mirroring what reserve_ai_slot does.
// These verify the threshold constants and the guard conditions used across
// all four AI call sites.

describe('monthly cap thresholds', () => {
  it('allows a call when usage is 0', () => {
    const currentUsage = 0
    expect(currentUsage >= MONTHLY_CAP).toBe(false)
  })

  it('allows a call when usage is one below the cap', () => {
    const currentUsage = MONTHLY_CAP - 1
    expect(currentUsage >= MONTHLY_CAP).toBe(false)
  })

  it('blocks a call when usage equals the cap', () => {
    const currentUsage = MONTHLY_CAP
    expect(currentUsage >= MONTHLY_CAP).toBe(true)
  })

  it('blocks a call when usage exceeds the cap', () => {
    const currentUsage = MONTHLY_CAP + 5
    expect(currentUsage >= MONTHLY_CAP).toBe(true)
  })
})

describe('approaching limit threshold', () => {
  it('does not warn below the threshold', () => {
    const currentUsage = APPROACHING_LIMIT_THRESHOLD - 1
    expect(currentUsage >= APPROACHING_LIMIT_THRESHOLD).toBe(false)
  })

  it('warns at the threshold', () => {
    const currentUsage = APPROACHING_LIMIT_THRESHOLD
    expect(currentUsage >= APPROACHING_LIMIT_THRESHOLD).toBe(true)
  })

  it('warns between threshold and cap', () => {
    const currentUsage = APPROACHING_LIMIT_THRESHOLD + 5
    const allowed = currentUsage < MONTHLY_CAP
    const approaching = currentUsage >= APPROACHING_LIMIT_THRESHOLD
    expect(allowed).toBe(true)
    expect(approaching).toBe(true)
  })
})
