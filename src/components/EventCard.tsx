import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Event } from '../sdk/types'
import { getGoogleMapsUrl } from '@/lib/maps'

export function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/e/${event.invite_link_token}`)}
      className="p-card p-card-hover"
      style={{ cursor: 'pointer', overflow: 'hidden' }}
    >
      {event.cover_image_url ? (
        <img src={event.cover_image_url} alt={event.title} style={{ width: '100%', height: 144, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: 144,
          background: `
            radial-gradient(ellipse 80% 80% at 30% 50%, rgba(255,60,110,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 70% 50%, rgba(155,92,246,0.3) 0%, transparent 60%),
            var(--p-card2)
          `,
        }} />
      )}
      <div style={{ padding: 16 }}>
        <h3 className="font-syne" style={{ fontWeight: 700, fontSize: 17, color: 'var(--p-text)', marginBottom: 4 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--p-muted)', marginBottom: 2 }}>
          {new Date(event.start_at).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric',
          })}
        </p>
        {event.location && (
          <a
            href={getGoogleMapsUrl(event.location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 13, color: 'var(--p-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: 44 }}
          >
            {event.location}
          </a>
        )}
      </div>
    </motion.div>
  )
}
