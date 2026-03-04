import { describe, it, expect, vi } from 'vitest'

vi.mock('../supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../supabase'
import { upsertRsvp, listRsvpsForEvent, getMyRsvp } from './rsvps'

const mockRsvp = {
  id: 'r1', event_id: 'evt-1', user_id: 'u1',
  status: 'yes', headcount: 1, plus_ones: 0, note: null, created_at: '2026-01-01'
}

describe('upsertRsvp', () => {
  it('upserts and returns rsvp', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockRsvp, error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: () => ({ select: () => ({ single }) }) } as any)
    const result = await upsertRsvp({ event_id: 'evt-1', user_id: 'u1', status: 'yes' })
    expect(result.status).toBe('yes')
  })

  it('throws on error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'upsert failed' } })
    vi.mocked(supabase.from).mockReturnValue({ upsert: () => ({ select: () => ({ single }) }) } as any)
    await expect(upsertRsvp({ event_id: 'e1', user_id: 'u1', status: 'yes' })).rejects.toThrow('upsert failed')
  })
})

describe('listRsvpsForEvent', () => {
  it('returns rsvps for an event', async () => {
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => Promise.resolve({ data: [mockRsvp], error: null }) }) } as any)
    const result = await listRsvpsForEvent('evt-1')
    expect(result).toHaveLength(1)
  })

  it('returns empty array on error', async () => {
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'fail' } }) }) } as any)
    const result = await listRsvpsForEvent('bad-id')
    expect(result).toEqual([])
  })
})

describe('getMyRsvp', () => {
  it('returns null on error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => ({ eq: () => ({ single }) }) }) } as any)
    const result = await getMyRsvp('evt-1', 'u1')
    expect(result).toBeNull()
  })
})
