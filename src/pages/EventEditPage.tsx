import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getEvent, createEvent, updateEvent } from '../sdk/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Event, RsvpButtonStyle } from '../sdk/types'

const RSVP_STYLES: { value: RsvpButtonStyle; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'emoji', label: '🎉 Emoji' },
  { value: 'spooky', label: '👻 Spooky' },
  { value: 'flirty', label: '😍 Flirty' },
  { value: 'formal', label: '🎩 Formal' },
  { value: 'hype', label: '🔥 Hype' },
  { value: 'icons', label: '✓ Icons' },
]

function toLocalDatetimeValue(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventEditPage() {
  const { token } = useParams<{ token: string }>()
  const isNew = token === 'new'
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [authChecked, setAuthChecked] = useState(isNew) // new events skip the check
  const [event, setEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    location: '',
    start_at: '',
    rsvp_button_style: 'default',
    visibility: 'invite_only',
    show_guest_list: true,
    is_plus_ones_allowed: false,
  })

  useEffect(() => {
    if (!isNew && token) {
      getEvent(token).then(e => {
        if (!e) { navigate('/'); return }
        if (user && e.host_id !== user.id) { navigate(`/e/${token}`); return }
        setEvent(e)
        setAuthChecked(true)
      })
    }
  }, [token, isNew, user?.id])

  const set = (patch: Partial<Event>) => setEvent(prev => ({ ...prev, ...patch }))

  const handleSave = async () => {
    if (!user || !event.title || !event.start_at) return
    setSaving(true)
    try {
      if (isNew) {
        const created = await createEvent({
          host_id: user.id,
          title: event.title,
          description: event.description,
          location: event.location,
          start_at: event.start_at,
          rsvp_button_style: event.rsvp_button_style,
          visibility: event.visibility,
          show_guest_list: event.show_guest_list,
          is_plus_ones_allowed: event.is_plus_ones_allowed,
          max_capacity: event.max_capacity ?? null,
        })
        navigate(`/e/${created.invite_link_token}`)
      } else if (event.id) {
        await updateEvent(event.id, {
          title: event.title,
          description: event.description,
          location: event.location,
          start_at: event.start_at,
          rsvp_button_style: event.rsvp_button_style,
          show_guest_list: event.show_guest_list,
          is_plus_ones_allowed: event.is_plus_ones_allowed,
          max_capacity: event.max_capacity ?? null,
        })
        navigate(`/e/${token}`)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!authChecked) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
  )

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-zinc-400 min-h-[44px] flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">
            {isNew ? 'Create event' : 'Edit event'}
          </h1>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Title *</Label>
          <Input
            value={event.title ?? ''}
            onChange={e => set({ title: e.target.value })}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
            placeholder="My awesome party"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Date & time *</Label>
          <Input
            type="datetime-local"
            value={toLocalDatetimeValue(event.start_at)}
            onChange={e => set({ start_at: new Date(e.target.value).toISOString() })}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Location</Label>
          <Input
            value={event.location ?? ''}
            onChange={e => set({ location: e.target.value })}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
            placeholder="123 Party St"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Description</Label>
          <Textarea
            value={event.description ?? ''}
            onChange={e => set({ description: e.target.value })}
            className="bg-zinc-900 border-zinc-700 text-white resize-none"
            rows={4}
            placeholder="Tell your guests what to expect..."
          />
        </div>

        <div className="space-y-3">
          <Label className="text-zinc-300">RSVP button style</Label>
          <div className="flex flex-wrap gap-2">
            {RSVP_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => set({ rsvp_button_style: s.value })}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium min-h-[44px]',
                  'transition-colors',
                  event.rsvp_button_style === s.value
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-white',
                ].join(' ')}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-zinc-300 text-sm">Allow plus ones</span>
          <button
            onClick={() => set({ is_plus_ones_allowed: !event.is_plus_ones_allowed })}
            aria-checked={!!event.is_plus_ones_allowed}
            role="switch"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <span className={[
              'w-12 h-6 rounded-full transition-colors relative block',
              event.is_plus_ones_allowed ? 'bg-white' : 'bg-zinc-700',
            ].join(' ')}>
              <span className={[
                'absolute top-0.5 w-5 h-5 rounded-full bg-black transition-transform',
                event.is_plus_ones_allowed ? 'translate-x-6' : 'translate-x-0.5',
              ].join(' ')} />
            </span>
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Max guests (optional)</Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={event.max_capacity ?? ''}
            onChange={e => {
              const val = e.target.value ? Math.max(1, Math.floor(Number(e.target.value))) : null
              set({ max_capacity: val })
            }}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
            placeholder="Unlimited"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !event.title || !event.start_at}
          className="w-full h-12 text-base font-semibold"
        >
          {saving ? 'Saving...' : isNew ? 'Create event' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
