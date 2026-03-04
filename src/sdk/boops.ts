import { supabase } from '../supabase'
import type { Boop, BoopInsert } from './types'

export async function sendBoop(boop: BoopInsert): Promise<Boop> {
  const { data, error } = await supabase
    .from('boops')
    .insert(boop)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function listBoops(eventId: string): Promise<Boop[]> {
  const { data, error } = await supabase
    .from('boops')
    .select('*')
    .eq('event_id', eventId)
    .order('sent_at', { ascending: false })
  if (error) return []
  return data ?? []
}
