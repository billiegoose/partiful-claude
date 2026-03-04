import { motion } from 'framer-motion'
import { getRsvpLabels } from '../lib/rsvpStyles'
import type { RsvpButtonStyle, RsvpStatus } from '../sdk/types'

interface Props {
  style: RsvpButtonStyle
  current: RsvpStatus | null
  onRespond: (status: RsvpStatus) => void
}

const STATUS_ORDER: RsvpStatus[] = ['yes', 'maybe', 'no']

export function RsvpButtons({ style, current, onRespond }: Props) {
  const labels = getRsvpLabels(style)

  return (
    <div className="flex gap-3 flex-wrap">
      {STATUS_ORDER.map(status => (
        <motion.button
          key={status}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => onRespond(status)}
          className={[
            'px-5 py-3 rounded-full text-sm font-semibold min-h-[44px]',
            'transition-colors cursor-pointer',
            current === status
              ? 'bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-black'
              : 'bg-zinc-800 text-white hover:bg-zinc-700',
          ].join(' ')}
        >
          {labels[status]}
        </motion.button>
      ))}
    </div>
  )
}
