import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { listMyEvents } from '../sdk/events'
import { EventCard } from '../components/EventCard'
import type { Event } from '../sdk/types'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    listMyEvents(user.id).then(e => {
      if (!cancelled) { setEvents(e); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [user?.id])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--p-bg)', color: 'var(--p-text)', paddingBottom: 96 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 className="font-syne p-gradient-text" style={{ fontSize: '2rem', fontWeight: 800 }}>
            your events
          </h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/e/new/edit')}
            className="p-gradient-btn"
            style={{
              border: 'none', borderRadius: 100,
              padding: '10px 20px', fontWeight: 600, fontSize: 15,
              color: '#fff', cursor: 'pointer', minHeight: 44,
            }}
          >
            + create
          </motion.button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--p-muted)', textAlign: 'center', padding: '48px 0' }}>Loading...</p>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
            <motion.p
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
              style={{ fontSize: '3rem' }}
            >
              🎉
            </motion.p>
            <p style={{ color: 'var(--p-muted)' }}>No events yet.</p>
            <button
              onClick={() => navigate('/e/new/edit')}
              style={{
                color: 'var(--p-text)', textDecoration: 'underline',
                background: 'none', border: 'none', cursor: 'pointer',
                minHeight: 44, fontSize: 15,
              }}
            >
              Create your first event
            </button>
          </motion.div>
        ) : (
          <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
