import { describe, it, expect, vi } from 'vitest'

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../supabase'
import { getEvent, createEvent } from './events'

const mockEvent = {
  id: 'evt-1',
  host_id: 'user-1',
  title: 'Test Party',
  start_at: '2026-06-01T18:00:00Z',
  invite_link_token: 'token-abc',
  visibility: 'invite_only',
  rsvp_button_style: 'default',
  created_at: '2026-01-01T00:00:00Z',
  description: null,
  end_at: null,
  location: null,
  cover_image_url: null,
  theme: 'default',
  background_color: null,
  music_url: null,
  is_plus_ones_allowed: false,
  show_guest_list: true,
  max_capacity: null,
}

describe('getEvent', () => {
  it('fetches event by invite_link_token', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockEvent, error: null })
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => ({ single }) }) } as any)
    const result = await getEvent('token-abc')
    expect(result?.title).toBe('Test Party')
  })

  it('returns null on error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => ({ single }) }) } as any)
    const result = await getEvent('bad-token')
    expect(result).toBeNull()
  })
})

describe('createEvent', () => {
  it('inserts and returns new event', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockEvent, error: null })
    vi.mocked(supabase.from).mockReturnValue({ insert: () => ({ select: () => ({ single }) }) } as any)
    const result = await createEvent({ host_id: 'user-1', title: 'Test Party', start_at: '2026-06-01T18:00:00Z' })
    expect(result.title).toBe('Test Party')
  })

  it('throws on error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } })
    vi.mocked(supabase.from).mockReturnValue({ insert: () => ({ select: () => ({ single }) }) } as any)
    await expect(createEvent({ host_id: 'u1', title: 'x', start_at: '2026-01-01' })).rejects.toThrow('insert failed')
  })
})
