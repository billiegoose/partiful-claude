import { motion } from 'framer-motion'
import { getRsvpLabels } from '../lib/rsvpStyles'
import type { RsvpButtonStyle, RsvpStatus } from '../sdk/types'

interface Props {
  style: RsvpButtonStyle
  current: RsvpStatus | null
  onRespond: (status: RsvpStatus) => void
  isFull?: boolean
}

export function RsvpButtons({ style, current, onRespond, isFull }: Props) {
  const labels = getRsvpLabels(style)
  const disabledByFull = !!isFull && current !== 'yes'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Going — prominent gradient button */}
      <motion.button
        whileTap={disabledByFull ? undefined : { scale: 0.97 }}
        onClick={() => !disabledByFull && onRespond('yes')}
        disabled={disabledByFull}
        className={[disabledByFull ? '' : 'p-gradient-btn', current === 'yes' ? 'ring-2' : ''].join(' ').trim()}
        style={{
          width: '100%', padding: '16px',
          border: 'none', borderRadius: 16,
          fontFamily: "'Syne', sans-serif",
          fontSize: 17, fontWeight: 700, letterSpacing: '0.01em',
          cursor: disabledByFull ? 'not-allowed' : 'pointer',
          position: 'relative', overflow: 'hidden',
          color: '#fff',
          ...(current === 'yes' ? {
            background: 'linear-gradient(135deg, var(--p-accent) 0%, #ff6b35 50%, var(--p-accent2) 100%)',
            boxShadow: '0 4px 30px rgba(255,60,110,0.4)',
            outline: '2px solid white',
            outlineOffset: 2,
          } : disabledByFull ? {
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--p-muted)',
          } : {
            background: 'linear-gradient(135deg, var(--p-accent) 0%, #ff6b35 50%, var(--p-accent2) 100%)',
            boxShadow: '0 4px 30px rgba(255,60,110,0.4)',
          }),
        }}
      >
        {disabledByFull ? 'Full' : labels['yes']}
      </motion.button>

      {/* Maybe + No — small outlined pills in a row */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['maybe', 'no'] as RsvpStatus[]).map(status => (
          <motion.button
            key={status}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => onRespond(status)}
            style={{
              flex: 1, padding: '10px 16px',
              borderRadius: 100, fontSize: 14, fontWeight: 500,
              minHeight: 44, cursor: 'pointer',
              transition: 'background 0.15s',
              border: current === status
                ? '1px solid rgba(155,92,246,0.6)'
                : '1px solid var(--p-border)',
              background: current === status
                ? 'rgba(155,92,246,0.2)'
                : 'rgba(255,255,255,0.04)',
              color: current === status ? '#c4a8ff' : 'var(--p-muted)',
            }}
          >
            {labels[status]}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
