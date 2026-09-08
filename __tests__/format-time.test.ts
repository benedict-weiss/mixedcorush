import { describe, expect, it } from 'vitest'

import {
  formatBlockDate,
  formatSlotDate,
  formatSlotDateTime,
  formatSlotTime,
  formatWallClockTime,
} from '@/lib/format-time'

describe('format-time', () => {
  it('renders timestamps in Eastern daylight time', () => {
    expect(formatSlotTime('2026-09-08T21:00:00+00:00')).toBe('05:00 PM')
    expect(formatSlotDate('2026-09-08T21:00:00+00:00')).toBe('Tue, Sep 8')
    expect(formatSlotDateTime('2026-09-08T21:00:00+00:00')).toBe('Sep 8, 05:00 PM')
  })

  it('renders timestamps in Eastern standard time', () => {
    expect(formatSlotTime('2026-01-08T21:00:00+00:00')).toBe('04:00 PM')
  })

  it('does not shift a timestamp across midnight Eastern', () => {
    // 00:30 UTC on Sep 9 is still the evening of Sep 8 in Eastern.
    expect(formatSlotDate('2026-09-09T00:30:00+00:00')).toBe('Tue, Sep 8')
  })

  it('renders date-only block dates on the stored calendar day', () => {
    expect(formatBlockDate('2026-09-08')).toBe('Tuesday, September 8')
  })

  it('renders wall-clock times verbatim', () => {
    expect(formatWallClockTime('09:00:00')).toBe('09:00 AM')
    expect(formatWallClockTime('19:30:00')).toBe('07:30 PM')
  })
})
