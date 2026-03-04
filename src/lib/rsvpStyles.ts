import type { RsvpButtonStyle } from '../sdk/types'

export interface RsvpLabels {
  yes: string
  maybe: string
  no: string
}

const STYLES: Record<RsvpButtonStyle, RsvpLabels> = {
  default: { yes: 'Going', maybe: 'Maybe', no: "Can't Go" },
  emoji:   { yes: '🎉', maybe: '🤔', no: '😢' },
  spooky:  { yes: '👻 Dying to come', maybe: '🕯️ Maybe', no: "💀 Can't make it" },
  flirty:  { yes: '😍 Absolutely', maybe: '👀 Maybe', no: "💔 Can't make it" },
  formal:  { yes: 'Accepts with pleasure', maybe: 'Will try to attend', no: 'Regretfully declines' },
  hype:    { yes: 'HELL YEAH', maybe: 'Maybe', no: 'Nah' },
  icons:   { yes: '✓ Going', maybe: '~ Maybe', no: "✗ Can't Go" },
}

export function getRsvpLabels(style: RsvpButtonStyle): RsvpLabels {
  return STYLES[style] ?? STYLES.default
}
