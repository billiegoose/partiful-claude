import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendBoop } from '../sdk/boops'
import type { RsvpWithProfile } from '../sdk/types'

const BOOP_EMOJIS = ['🎉', '👋', '❤️', '🔥', '😂']

interface Props {
  rsvps: RsvpWithProfile[]
  eventId: string
  viewerUserId: string | undefined
}

function Avatar({ username, avatarUrl }: { username: string | null; avatarUrl: string | null }) {
  const letter = (username ?? '?')[0].toUpperCase()
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username ?? 'Guest'}
        className="w-10 h-10 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-semibold text-sm">
      {letter}
    </div>
  )
}

export function GuestList({ rsvps, eventId, viewerUserId }: Props) {
  const goingRsvps = rsvps.filter(r => r.status === 'yes')
  if (goingRsvps.length === 0) return null

  const handleBoop = async (recipientId: string, emoji: string) => {
    if (!viewerUserId) return
    try {
      await sendBoop({ event_id: eventId, sender_id: viewerUserId, recipient_id: recipientId, emoji })
    } catch {
      // silently ignore — boop is fun, not critical
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Going</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        <AnimatePresence initial={false}>
          {goingRsvps.map(rsvp => (
            <GuestChip
              key={rsvp.user_id}
              rsvp={rsvp}
              isViewer={rsvp.user_id === viewerUserId}
              canBoop={!!viewerUserId && rsvp.user_id !== viewerUserId}
              onBoop={(emoji) => handleBoop(rsvp.user_id, emoji)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function GuestChip({
  rsvp,
  isViewer,
  canBoop,
  onBoop,
}: {
  rsvp: RsvpWithProfile
  isViewer: boolean
  canBoop: boolean
  onBoop: (emoji: string) => void
}) {
  const username = rsvp.profiles?.username ?? 'Guest'
  const avatarUrl = rsvp.profiles?.avatar_url ?? null
  const displayName = username.includes('@') ? username.split('@')[0] : username

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center gap-1 min-w-[56px]"
    >
      {canBoop ? (
        <BoopButton avatarUrl={avatarUrl} username={username} onBoop={onBoop} />
      ) : (
        <Avatar username={username} avatarUrl={avatarUrl} />
      )}
      <span className="text-zinc-400 text-xs text-center truncate w-14">
        {isViewer ? 'You' : displayName}
      </span>
    </motion.div>
  )
}

function BoopButton({
  avatarUrl,
  username,
  onBoop,
}: {
  avatarUrl: string | null
  username: string
  onBoop: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: string) => {
    onBoop(emoji)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="focus:outline-none">
        <Avatar username={username} avatarUrl={avatarUrl} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 rounded-2xl p-2 flex gap-1 z-50 shadow-xl"
            >
            {BOOP_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-700 active:scale-90 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
