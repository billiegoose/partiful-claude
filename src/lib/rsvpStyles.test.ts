import { describe, it, expect } from 'vitest'
import { getRsvpLabels } from './rsvpStyles'

describe('getRsvpLabels', () => {
  it('returns default labels', () => {
    const labels = getRsvpLabels('default')
    expect(labels).toEqual({ yes: 'Going', maybe: 'Maybe', no: "Can't Go" })
  })

  it('returns spooky labels', () => {
    const labels = getRsvpLabels('spooky')
    expect(labels.yes).toContain('👻')
    expect(labels.no).toContain('💀')
  })

  it('returns flirty labels', () => {
    const labels = getRsvpLabels('flirty')
    expect(labels.yes).toContain('😍')
  })

  it('returns hype labels', () => {
    expect(getRsvpLabels('hype').yes).toBe('HELL YEAH')
  })

  it('returns emoji labels', () => {
    expect(getRsvpLabels('emoji').yes).toBe('🎉')
  })

  it('returns formal labels', () => {
    expect(getRsvpLabels('formal').yes).toContain('pleasure')
  })

  it('falls back to default for unknown style', () => {
    // @ts-expect-error testing invalid input
    expect(getRsvpLabels('unknown')).toEqual(getRsvpLabels('default'))
  })
})
