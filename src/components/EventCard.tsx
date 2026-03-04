import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Event } from '../sdk/types'

export function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/e/${event.invite_link_token}`)}
      className="cursor-pointer rounded-2xl overflow-hidden bg-zinc-900 active:bg-zinc-800 transition-colors"
    >
      {event.cover_image_url && (
        <img src={event.cover_image_url} alt={event.title} className="w-full h-36 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-white">{event.title}</h3>
        <p className="text-sm text-zinc-400 mt-1">
          {new Date(event.start_at).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric'
          })}
        </p>
        {event.location && <p className="text-sm text-zinc-500 mt-0.5">{event.location}</p>}
      </div>
    </motion.div>
  )
}
