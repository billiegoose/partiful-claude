import { supabase } from '../supabase'
import type { Rsvp, RsvpInsert } from './types'

export async function upsertRsvp(rsvp: RsvpInsert): Promise<Rsvp> {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert(rsvp, { onConflict: 'event_id,user_id' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function listRsvpsForEvent(eventId: string): Promise<Rsvp[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
  if (error) return []
  return data ?? []
}

export async function getMyRsvp(eventId: string, userId: string): Promise<Rsvp | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function deleteRsvp(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}
