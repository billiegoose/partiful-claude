import { useEffect, useState } from 'react'
import { getMyRsvp, upsertRsvp } from '../sdk/rsvps'
import type { Rsvp, RsvpStatus } from '../sdk/types'

export function useRsvp(eventId: string, userId: string | undefined) {
  const [rsvp, setRsvp] = useState<Rsvp | null>(null)

  useEffect(() => {
    if (!userId || !eventId) return
    getMyRsvp(eventId, userId).then(setRsvp)
  }, [eventId, userId])

  const respond = async (status: RsvpStatus) => {
    if (!userId) return
    const updated = await upsertRsvp({ event_id: eventId, user_id: userId, status })
    setRsvp(updated)
  }

  return { rsvp, respond }
}
