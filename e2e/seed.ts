import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/sdk/types'

// Uses service role key to bypass RLS — only used in test scripts, never in browser
const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function seedFakeRsvps(eventId: string, hostId: string) {
  const fakeRsvps = [
    { event_id: eventId, user_id: `00000000-0000-0000-0001-000000000001`, status: 'yes' as const },
    { event_id: eventId, user_id: `00000000-0000-0000-0001-000000000002`, status: 'yes' as const },
    { event_id: eventId, user_id: `00000000-0000-0000-0001-000000000003`, status: 'maybe' as const },
  ]
  await supabase.from('rsvps').upsert(fakeRsvps)
}

export async function seedFakeBoop(eventId: string, senderId: string, recipientId: string) {
  await supabase.from('boops').insert({
    event_id: eventId,
    sender_id: senderId,
    recipient_id: recipientId,
    emoji: '🎉',
  })
}

export async function cleanupEvent(eventId: string) {
  // Cascade delete handles rsvps, posts, boops
  await supabase.from('events').delete().eq('id', eventId)
}
