import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEvent } from '../hooks/useEvent'
import { useAuth } from '../hooks/useAuth'
import { useRsvp } from '../hooks/useRsvp'
import { RsvpButtons } from '../components/RsvpButtons'
import { ActivityFeed } from '../components/ActivityFeed'
import { GuestList } from '../components/GuestList'
import type { RsvpButtonStyle, RsvpStatus } from '../sdk/types'

export function EventPage() {
  const { token } = useParams<{ token: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { event, rsvps, yesCount, maybeCount, loading } = useEvent(token!)
  const { rsvp, respond } = useRsvp(event?.id ?? '', user?.id)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--p-bg)', color: 'var(--p-text)' }}>
      Loading...
    </div>
  )
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--p-bg)', color: 'var(--p-text)' }}>
      Event not found
    </div>
  )

  const handleRespond = (status: RsvpStatus) => {
    if (!user) { navigate('/login'); return }
    respond(status)
  }

  const isFull = event.max_capacity != null
    && yesCount >= event.max_capacity
    && rsvp?.status !== 'yes'

  const dateStr = new Date(event.start_at).toLocaleString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
  const dateShort = new Date(event.start_at).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  })
  const timeStr = new Date(event.start_at).toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: 'var(--p-bg)', color: 'var(--p-text)', minHeight: '100vh', paddingBottom: '80px', overflowX: 'hidden' }}
    >
      {/* Floating FABs */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, display: 'flex', gap: 8 }}>
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href) }}
          aria-label="Copy link"
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--p-text)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ↑
        </button>
        {user?.id === event.host_id && (
          <button
            onClick={() => navigate(`/e/${token}/edit`)}
            aria-label="Edit event"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--p-text)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✏️
          </button>
        )}
      </div>

      {/* Hero */}
      {event.cover_image_url ? (
        <div style={{ width: '100%', aspectRatio: '4/3', maxHeight: 420, overflow: 'hidden' }}>
          <img
            src={event.cover_image_url}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          position: 'relative', width: '100%', height: 320, overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 30% 40%, rgba(255,60,110,0.45) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 70% 60%, rgba(155,92,246,0.45) 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 55% 20%, rgba(255,140,66,0.3) 0%, transparent 55%),
              #0a0a0f
            `,
            animation: 'p-bgPulse 8s ease-in-out infinite alternate',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, var(--p-bg) 30%, transparent)',
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        {/* Event header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: event.cover_image_url ? 24 : -60, position: 'relative', zIndex: 2 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(155,92,246,0.2)',
            border: '1px solid rgba(155,92,246,0.4)',
            borderRadius: 100, padding: '4px 12px',
            fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase' as const, color: '#c4a8ff', marginBottom: 12,
          }}>
            <span style={{ fontSize: 8, color: 'var(--p-purple)' }}>●</span>
            Event
          </div>

          <h1 className="font-syne p-gradient-text" style={{
            fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            {event.title}
          </h1>

          <p style={{ color: 'var(--p-muted)', fontSize: 14 }}>
            {dateStr}
          </p>
        </motion.div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--p-border)', margin: '20px 0' }} />

        {/* Info grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}
        >
          <div className="p-card p-card-hover" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 20, marginBottom: 4 }}>📅</span>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>When</span>
            <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{dateShort}</span>
            <span style={{ fontSize: 12, color: 'var(--p-muted)' }}>{timeStr}</span>
          </div>

          {event.location ? (
            <div className="p-card p-card-hover" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20, marginBottom: 4 }}>📍</span>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>Where</span>
              <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{event.location}</span>
            </div>
          ) : (
            <div className="p-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, opacity: 0.4 }}>
              <span style={{ fontSize: 20, marginBottom: 4 }}>📍</span>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--p-muted)' }}>Where</span>
              <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>TBD</span>
            </div>
          )}
        </motion.div>

        {/* Inline extras */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {event.music_url && (
            <a href={event.music_url} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--p-muted)', fontSize: 13, textDecoration: 'underline' }}>
              🎵 Playlist
            </a>
          )}
          {event.max_capacity != null && (
            <span style={{ color: yesCount >= event.max_capacity ? '#f87171' : 'var(--p-muted)', fontSize: 13 }}>
              {yesCount >= event.max_capacity
                ? 'Full'
                : `${event.max_capacity - yesCount} spots left`}
            </span>
          )}
        </div>

        {/* RSVP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 10 }}
        >
          <RsvpButtons
            style={(event.rsvp_button_style as RsvpButtonStyle) ?? 'default'}
            current={rsvp?.status as RsvpStatus ?? null}
            onRespond={handleRespond}
            isFull={isFull}
          />
          <p style={{ fontSize: 12, color: 'var(--p-muted)', textAlign: 'center', padding: '10px 0 2px' }}>
            <motion.span
              key={yesCount}
              initial={{ scale: 1.3, color: '#ffffff' }}
              animate={{ scale: 1, color: 'var(--p-muted)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {yesCount} going
            </motion.span>
            {maybeCount > 0 && <> · {maybeCount} maybe</>}
          </p>
        </motion.div>

        {/* Description */}
        {event.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="font-syne" style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 12,
            }}>
              About
            </p>
            <div className="p-card" style={{
              padding: 18, fontSize: 14.5, lineHeight: 1.7, color: '#ccc8e8', marginBottom: 10,
            }}>
              {event.description}
            </div>
          </motion.div>
        )}

        {/* Guest list */}
        {event.show_guest_list && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GuestList rsvps={rsvps} eventId={event.id} viewerUserId={user?.id} />
          </motion.div>
        )}

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ActivityFeed eventId={event.id} userId={user?.id} />
        </motion.div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 24, color: 'var(--p-muted)', fontSize: 12 }}>
          Made with <span style={{ color: 'var(--p-purple)' }}>Partiful</span>
        </div>
      </div>
    </motion.div>
  )
}
