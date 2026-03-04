import { supabase } from '../supabase'
import type { Event, EventInsert, EventUpdate } from './types'

export async function getEvent(inviteToken: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('invite_link_token', inviteToken)
    .single()
  if (error) return null
  return data
}

export async function listMyEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', userId)
    .order('start_at', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createEvent(event: EventInsert): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateEvent(id: string, update: EventUpdate): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
