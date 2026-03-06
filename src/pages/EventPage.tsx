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
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Loading...
    </div>
  )
  if (!event) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Event not found
    </div>
  )

  const handleRespond = (status: RsvpStatus) => {
    if (!user) { navigate('/login'); return }
    respond(status)
  }

  const isFull = event != null
    && event.max_capacity != null
    && yesCount >= event.max_capacity
    && rsvp?.status !== 'yes'

  const bgStyle = event.background_color
    ? { backgroundColor: event.background_color }
    : undefined

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white pb-24"
      style={bgStyle}
    >
      {event.cover_image_url && (
        <img
          src={event.cover_image_url}
          alt={event.title}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-6">
        <h1 className="text-3xl font-bold leading-tight">{event.title}</h1>

        <div className="text-zinc-400 space-y-1 text-sm">
          <p>{new Date(event.start_at).toLocaleString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
          })}</p>
          {event.location && <p>📍 {event.location}</p>}
          {event.music_url && (
            <a href={event.music_url} target="_blank" rel="noopener noreferrer"
              className="text-zinc-400 underline">🎵 Playlist</a>
          )}
        </div>

        {event.description && (
          <p className="text-zinc-200 leading-relaxed">{event.description}</p>
        )}

        {/* Live RSVP count */}
        <div className="flex gap-4 text-sm text-zinc-400">
          <motion.span
            key={yesCount}
            initial={{ scale: 1.3, color: '#ffffff' }}
            animate={{ scale: 1, color: '#a1a1aa' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {yesCount} going
          </motion.span>
          {maybeCount > 0 && <span>{maybeCount} maybe</span>}
          {event.max_capacity != null && yesCount < event.max_capacity && (
            <span>{event.max_capacity - yesCount} spots left</span>
          )}
          {event.max_capacity != null && yesCount >= event.max_capacity && (
            <span className="text-red-400">Full</span>
          )}
        </div>

        {event.show_guest_list && (
          <GuestList rsvps={rsvps} eventId={event.id} viewerUserId={user?.id} />
        )}

        <RsvpButtons
          style={(event.rsvp_button_style as RsvpButtonStyle) ?? 'default'}
          current={rsvp?.status as RsvpStatus ?? null}
          onRespond={handleRespond}
          isFull={isFull}
        />

        {user?.id === event.host_id && (
          <button
            onClick={() => navigate(`/e/${token}/edit`)}
            className="text-sm text-zinc-500 underline min-h-[44px] flex items-center"
          >
            Edit event
          </button>
        )}

        <ActivityFeed eventId={event.id} userId={user?.id} />
      </div>
    </motion.div>
  )
}
