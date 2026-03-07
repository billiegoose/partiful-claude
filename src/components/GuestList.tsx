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

function Avatar({ username, avatarUrl, size = 40 }: { username: string | null; avatarUrl: string | null; size?: number }) {
  const letter = (username ?? '?')[0].toUpperCase()
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username ?? 'Guest'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--p-card2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--p-text)', fontWeight: 600, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {letter}
    </div>
  )
}

export function GuestList({ rsvps, eventId, viewerUserId }: Props) {
  const goingRsvps = rsvps.filter(r => r.status === 'yes')
  const maybeRsvps = rsvps.filter(r => r.status === 'maybe')

  const handleBoop = async (recipientId: string, emoji: string) => {
    if (!viewerUserId) return
    try {
      await sendBoop({ event_id: eventId, sender_id: viewerUserId, recipient_id: recipientId, emoji })
    } catch {
      // silently ignore
    }
  }

  if (goingRsvps.length === 0 && maybeRsvps.length === 0) return null

  const allRsvps = [...goingRsvps, ...maybeRsvps]
  const STACK_MAX = 6

  return (
    <div style={{ marginBottom: 10 }}>
      <p className="font-syne" style={{
        fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 12,
      }}>
        Guest List
      </p>

      <div className="p-card" style={{ padding: 18 }}>
        {/* Overlapping avatar strip */}
        <div style={{ display: 'flex', marginBottom: 14 }}>
          <AnimatePresence initial={false}>
            {allRsvps.slice(0, STACK_MAX).map((r, i) => (
              <motion.div
                key={r.user_id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  marginRight: -10, zIndex: i,
                  border: '2.5px solid var(--p-bg)', borderRadius: '50%',
                }}
              >
                <Avatar
                  username={r.profiles?.username ?? null}
                  avatarUrl={r.profiles?.avatar_url ?? null}
                  size={40}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {allRsvps.length > STACK_MAX && (
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2.5px solid var(--p-bg)',
              background: 'rgba(155,92,246,0.3)',
              color: '#c4a8ff', fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              +{allRsvps.length - STACK_MAX}
            </div>
          )}
        </div>

        {/* Rows */}
        <AnimatePresence initial={false}>
          {allRsvps.map((rsvp, i) => {
            const username = rsvp.profiles?.username ?? 'Guest'
            const avatarUrl = rsvp.profiles?.avatar_url ?? null
            const displayName = username.includes('@') ? username.split('@')[0] : username
            const isViewer = rsvp.user_id === viewerUserId
            const canBoop = !!viewerUserId && !isViewer
            const isGoing = rsvp.status === 'yes'

            return (
              <motion.div
                key={rsvp.user_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < allRsvps.length - 1 ? '1px solid var(--p-border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {canBoop ? (
                    <BoopButton avatarUrl={avatarUrl} username={username} onBoop={e => handleBoop(rsvp.user_id, e)} />
                  ) : (
                    <Avatar username={username} avatarUrl={avatarUrl} size={34} />
                  )}
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {isViewer ? 'You' : displayName}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                  ...(isGoing ? {
                    background: 'rgba(52,211,153,0.15)', color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.25)',
                  } : {
                    background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                    border: '1px solid rgba(251,191,36,0.25)',
                  }),
                }}>
                  {isGoing ? 'Going' : 'Maybe'}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BoopButton({ avatarUrl, username, onBoop }: {
  avatarUrl: string | null; username: string; onBoop: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}
        aria-label={`Boop ${username}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Avatar username={username} avatarUrl={avatarUrl} size={34} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              style={{
                position: 'absolute', bottom: '100%', marginBottom: 8,
                left: '50%', transform: 'translateX(-50%)',
                background: 'var(--p-card2)', borderRadius: 16,
                padding: 8, display: 'flex', gap: 4, zIndex: 50,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid var(--p-border)',
              }}
            >
              {BOOP_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { onBoop(emoji); setOpen(false) }}
                  onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}
                  style={{
                    fontSize: 22, width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 12, border: 'none', background: 'none', cursor: 'pointer',
                  }}
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
