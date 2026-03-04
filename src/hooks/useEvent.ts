import { useEffect, useState } from 'react'
import { getEvent } from '../sdk/events'
import { listRsvpsForEvent } from '../sdk/rsvps'
import { subscribeToRsvps } from '../sdk/realtime'
import type { Event, Rsvp } from '../sdk/types'

export function useEvent(token: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const evt = await getEvent(token)
      if (cancelled) return
      setEvent(evt)
      if (evt) {
        const r = await listRsvpsForEvent(evt.id)
        if (!cancelled) setRsvps(r)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    if (!event) return
    const channel = subscribeToRsvps(
      event.id,
      (rsvp) => setRsvps(prev => {
        const without = prev.filter(r => r.id !== rsvp.id)
        return [...without, rsvp]
      }),
      (rsvp) => setRsvps(prev => prev.map(r => r.id === rsvp.id ? rsvp : r))
    )
    return () => { channel.unsubscribe() }
  }, [event?.id])

  const yesCount = rsvps.filter(r => r.status === 'yes').reduce((sum, r) => sum + (r.headcount ?? 1), 0)
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length

  return { event, rsvps, yesCount, maybeCount, loading }
}
