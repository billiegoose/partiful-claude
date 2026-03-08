import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete'
import { getEvent, createEvent, updateEvent } from '../sdk/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Event, RsvpButtonStyle } from '../sdk/types'
import { uploadEventCover } from '../lib/uploadImage'

const RSVP_STYLES: { value: RsvpButtonStyle; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'emoji', label: '🎉 Emoji' },
  { value: 'spooky', label: '👻 Spooky' },
  { value: 'flirty', label: '😍 Flirty' },
  { value: 'formal', label: '🎩 Formal' },
  { value: 'hype', label: '🔥 Hype' },
  { value: 'icons', label: '✓ Icons' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      style={{
        minHeight: 44, minWidth: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <span style={{
        width: 48, height: 24, borderRadius: 9999,
        background: checked ? '#8b5cf6' : '#3f3f46',
        position: 'relative', display: 'block',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute',
          top: 2, left: checked ? 26 : 2,
          width: 20, height: 20,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
        }} />
      </span>
    </button>
  )
}

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingEventIdRef = useRef<string>(crypto.randomUUID())
  const [locationQuery, setLocationQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { suggestions } = useLocationAutocomplete(locationQuery)
  const [uploading, setUploading] = useState(false)
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

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10 MB.')
      return
    }
    setUploading(true)
    try {
      // Use event.id if editing, or the stable pending UUID if new
      const id = event.id ?? pendingEventIdRef.current
      const url = await uploadEventCover(file, user.id, id)
      set({ cover_image_url: url })
    } catch {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

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
          cover_image_url: event.cover_image_url ?? null,
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
          cover_image_url: event.cover_image_url ?? null,
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

        {/* Cover image */}
        <div className="space-y-2">
          <Label className="text-zinc-300">Cover photo</Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-40 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 flex items-center justify-center min-h-[44px]"
          >
            {event.cover_image_url ? (
              <img src={event.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-500 text-sm">+ Add cover photo</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
                Uploading...
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
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

        <div className="space-y-2 relative">
          <Label className="text-zinc-300">Location</Label>
          <Input
            value={event.location ?? ''}
            onChange={e => {
              set({ location: e.target.value })
              setLocationQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
            placeholder="123 Party St"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-lg mt-1 overflow-hidden shadow-lg">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      set({ location: s })
                      setLocationQuery('')
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-700 min-h-[44px]"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
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
          <Toggle checked={!!event.is_plus_ones_allowed} onChange={v => set({ is_plus_ones_allowed: v })} />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-zinc-300 text-sm">Show guest list</span>
          <Toggle checked={!!event.show_guest_list} onChange={v => set({ show_guest_list: v })} />
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
