import { supabase } from '../supabase'
import type { Rsvp, EventPost, Boop } from './types'

export function subscribeToRsvps(
  eventId: string,
  onInsert: (rsvp: Rsvp) => void,
  onUpdate: (rsvp: Rsvp) => void
) {
  return supabase
    .channel(`rsvps:${eventId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'rsvps',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new as Rsvp))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rsvps',
      filter: `event_id=eq.${eventId}`,
    }, payload => onUpdate(payload.new as Rsvp))
    .subscribe()
}

export function subscribeToPosts(
  eventId: string,
  onInsert: (post: EventPost) => void
) {
  return supabase
    .channel(`posts:${eventId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'event_posts',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new as EventPost))
    .subscribe()
}

export function subscribeToBoops(
  eventId: string,
  onInsert: (boop: Boop) => void
) {
  return supabase
    .channel(`boops:${eventId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'boops',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new as Boop))
    .subscribe()
}
