import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/sdk/types'

// Uses service role key to bypass RLS — only used in test scripts, never in browser
const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Pre-created fake guest accounts in Supabase auth (required for FK constraint on rsvps.user_id)
export const FAKE_GUEST_IDS = [
  '5b4c25d3-d105-47e8-add5-c49079bd37d9', // e2e-guest-1@partiful-claude.test
  'f842cfbd-588f-49e4-9fc0-610266bd7537', // e2e-guest-2@partiful-claude.test
  '2152217a-fdb6-426f-a6a5-40c4a79533b1', // e2e-guest-3@partiful-claude.test
]

export async function seedFakeRsvps(eventId: string) {
  const fakeRsvps = [
    { event_id: eventId, user_id: FAKE_GUEST_IDS[0], status: 'yes' as const },
    { event_id: eventId, user_id: FAKE_GUEST_IDS[1], status: 'yes' as const },
    { event_id: eventId, user_id: FAKE_GUEST_IDS[2], status: 'maybe' as const },
  ]
  const { error } = await supabase.from('rsvps').upsert(fakeRsvps)
  if (error) throw new Error(`seedFakeRsvps failed: ${error.message}`)
}

export async function seedFakeBoop(eventId: string, recipientId: string) {
  const { error } = await supabase.from('boops').insert({
    event_id: eventId,
    sender_id: FAKE_GUEST_IDS[0],
    recipient_id: recipientId,
    emoji: '🎉',
  })
  if (error) throw new Error(`seedFakeBoop failed: ${error.message}`)
}

export async function cleanupEvent(eventId: string) {
  // Cascade delete handles rsvps, posts, boops
  await supabase.from('events').delete().eq('id', eventId)
}
