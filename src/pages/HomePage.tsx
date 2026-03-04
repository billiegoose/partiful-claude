import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { listMyEvents } from '../sdk/events'
import { EventCard } from '../components/EventCard'
import { Button } from '@/components/ui/button'
import type { Event } from '../sdk/types'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      listMyEvents(user.id).then(e => {
        setEvents(e)
        setLoading(false)
      })
    }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">your events</h1>
          <Button
            onClick={() => navigate('/e/new/edit')}
            className="min-h-[44px]"
          >
            + create
          </Button>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-center py-12">Loading...</p>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <p className="text-4xl">🎉</p>
            <p className="text-zinc-400">No events yet.</p>
            <button
              onClick={() => navigate('/e/new/edit')}
              className="text-white underline min-h-[44px]"
            >
              Create your first event
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
