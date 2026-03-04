import { supabase } from '../supabase'
import type { EventPost, EventPostInsert } from './types'

export async function listPosts(eventId: string): Promise<EventPost[]> {
  const { data, error } = await supabase
    .from('event_posts')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createPost(post: EventPostInsert): Promise<EventPost> {
  const { data, error } = await supabase
    .from('event_posts')
    .insert(post)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('event_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
