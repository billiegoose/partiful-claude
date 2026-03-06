import { motion } from 'framer-motion'
import { getRsvpLabels } from '../lib/rsvpStyles'
import type { RsvpButtonStyle, RsvpStatus } from '../sdk/types'

interface Props {
  style: RsvpButtonStyle
  current: RsvpStatus | null
  onRespond: (status: RsvpStatus) => void
  isFull?: boolean
}

const STATUS_ORDER: RsvpStatus[] = ['yes', 'maybe', 'no']

export function RsvpButtons({ style, current, onRespond, isFull }: Props) {
  const labels = getRsvpLabels(style)

  return (
    <div className="flex gap-3 flex-wrap">
      {STATUS_ORDER.map(status => {
        const isYes = status === 'yes'
        const disabledByFull = isYes && !!isFull && current !== 'yes'
        return (
          <motion.button
            key={status}
            whileTap={disabledByFull ? undefined : { scale: 0.92 }}
            whileHover={disabledByFull ? undefined : { scale: 1.04 }}
            onClick={() => !disabledByFull && onRespond(status)}
            disabled={disabledByFull}
            className={[
              'px-5 py-3 rounded-full text-sm font-semibold min-h-[44px]',
              'transition-colors',
              disabledByFull
                ? 'bg-zinc-800 text-white opacity-50 cursor-not-allowed'
                : 'cursor-pointer',
              !disabledByFull && current === status
                ? 'bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-black'
                : !disabledByFull
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                  : '',
            ].filter(Boolean).join(' ')}
          >
            {isYes && isFull && current !== 'yes' ? 'Full' : labels[status]}
          </motion.button>
        )
      })}
    </div>
  )
}
