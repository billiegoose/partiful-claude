# Missing Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement guest list with boop button, cover image upload, max capacity enforcement, and profile page.

**Architecture:** All features are self-contained UI additions on top of the existing Supabase SDK + RLS setup. Guest list adds a profiles join to the rsvps query. Cover image and avatars use Supabase Storage (bucket `event-covers` and `avatars`). Max capacity derives from `yesCount` already in `useEvent`. Profile page reuses `getProfile`/`updateProfile` from `sdk/profiles.ts`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase JS SDK, Supabase Storage

---

## Supabase Storage setup (do this manually before starting)

In the Supabase dashboard (https://supabase.com/dashboard/project/lspwjortevrlkklnykgy/storage/buckets):
1. Create bucket `event-covers` — public
2. Create bucket `avatars` — public

Then run this SQL to set storage RLS policies:

```sql
-- event-covers: anyone can read, authenticated users can upload to their own folder
create policy "event_covers_read" on storage.objects for select using (bucket_id = 'event-covers');
create policy "event_covers_insert" on storage.objects for insert with check (
  bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "event_covers_update" on storage.objects for update using (
  bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]
);

-- avatars: anyone can read, authenticated users can upload to their own folder
create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_update" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Task 1: Guest list — profiles join in rsvps SDK

**Files:**
- Modify: `src/sdk/rsvps.ts`
- Modify: `src/hooks/useEvent.ts`
- Modify: `src/sdk/types.ts` (add `RsvpWithProfile` type at bottom)

**Step 1: Add `RsvpWithProfile` type to `src/sdk/types.ts`**

Append to the bottom of `src/sdk/types.ts` (after the existing convenience aliases):

```ts
export type RsvpWithProfile = Rsvp & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null
}
```

**Step 2: Add `listRsvpsWithProfiles` to `src/sdk/rsvps.ts`**

```ts
export async function listRsvpsWithProfiles(eventId: string): Promise<RsvpWithProfile[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, profiles(username, avatar_url)')
    .eq('event_id', eventId)
  if (error) return []
  return (data ?? []) as RsvpWithProfile[]
}
```

Also add `RsvpWithProfile` to the import in `rsvps.ts`:
```ts
import type { Rsvp, RsvpInsert, RsvpWithProfile } from './types'
```

**Step 3: Update `useEvent` to use the new function**

In `src/hooks/useEvent.ts`:
- Change `import { listRsvpsForEvent }` → `import { listRsvpsWithProfiles }`
- Change state type: `useState<RsvpWithProfile[]>([])`
- Change the load call: `listRsvpsWithProfiles(evt.id)` instead of `listRsvpsForEvent`
- Add import: `import type { Event, RsvpWithProfile } from '../sdk/types'`
- Update the return: expose `rsvps` typed as `RsvpWithProfile[]`

Full updated `useEvent.ts`:

```ts
import { useEffect, useState } from 'react'
import { getEvent } from '../sdk/events'
import { listRsvpsWithProfiles } from '../sdk/rsvps'
import { subscribeToRsvps } from '../sdk/realtime'
import type { Event, RsvpWithProfile } from '../sdk/types'

export function useEvent(token: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<RsvpWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const evt = await getEvent(token)
      if (cancelled) return
      setEvent(evt)
      if (evt) {
        const r = await listRsvpsWithProfiles(evt.id)
        if (!cancelled) setRsvps(r)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    if (!event) return
    const channel = subscribeToRsvps(
      event.id,
      (rsvp) => setRsvps(prev => {
        const without = prev.filter(r => r.id !== rsvp.id)
        return [...without, { ...rsvp, profiles: null }]
      }),
      (rsvp) => setRsvps(prev => prev.map(r => r.id === rsvp.id ? { ...rsvp, profiles: r.profiles } : r))
    )
    return () => { channel.unsubscribe() }
  }, [event?.id])

  const yesCount = rsvps.filter(r => r.status === 'yes').reduce((sum, r) => sum + (r.headcount ?? 1), 0)
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length

  return { event, rsvps, yesCount, maybeCount, loading }
}
```

**Step 4: Verify TypeScript compiles**

```bash
npm run build
```
Expected: no type errors.

**Step 5: Commit**

```bash
git add src/sdk/rsvps.ts src/sdk/types.ts src/hooks/useEvent.ts
git commit -m "feat: add profiles join to rsvps query for guest list"
```

---

## Task 2: GuestList component

**Files:**
- Create: `src/components/GuestList.tsx`
- Modify: `src/pages/EventPage.tsx`

**Step 1: Create `src/components/GuestList.tsx`**

```tsx
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
        )}
      </AnimatePresence>
    </div>
  )
}
```

Note: `useState` needs to be imported. Add `import { useState } from 'react'` at the top.

**Step 2: Wire GuestList into EventPage**

In `src/pages/EventPage.tsx`, add after the RSVP count block and before `<RsvpButtons>`:

```tsx
import { GuestList } from '../components/GuestList'
```

Then in the JSX, replace the existing RSVP count block with:

```tsx
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

<RsvpButtons ... />
```

Also update `useEvent` destructure to include `rsvps`:
```tsx
const { event, rsvps, yesCount, maybeCount, loading } = useEvent(token!)
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/GuestList.tsx src/pages/EventPage.tsx
git commit -m "feat: add guest list with boop button"
```

---

## Task 3: Max capacity

**Files:**
- Modify: `src/pages/EventEditPage.tsx`
- Modify: `src/pages/EventPage.tsx` (already partly done in Task 2 above)
- Modify: `src/components/RsvpButtons.tsx`

**Step 1: Add capacity input to EventEditPage**

In `src/pages/EventEditPage.tsx`, add after the plus-ones toggle and before the Save button:

```tsx
<div className="space-y-2">
  <Label className="text-zinc-300">Max guests (optional)</Label>
  <Input
    type="number"
    min={1}
    value={event.max_capacity ?? ''}
    onChange={e => set({ max_capacity: e.target.value ? Number(e.target.value) : null })}
    className="bg-zinc-900 border-zinc-700 text-white h-12"
    placeholder="Unlimited"
  />
</div>
```

Also add `max_capacity` to `handleSave` — include it in both the `createEvent` and `updateEvent` calls:
```ts
max_capacity: event.max_capacity ?? null,
```

**Step 2: Disable "Going" button when full**

In `src/pages/EventPage.tsx`, pass `isFull` to `RsvpButtons`:

```tsx
const isFull = event.max_capacity != null
  && yesCount >= event.max_capacity
  && rsvp?.status !== 'yes'

<RsvpButtons
  style={(event.rsvp_button_style as RsvpButtonStyle) ?? 'default'}
  current={rsvp?.status as RsvpStatus ?? null}
  onRespond={handleRespond}
  isFull={isFull}
/>
```

**Step 3: Update RsvpButtons to accept `isFull`**

In `src/components/RsvpButtons.tsx`, add `isFull?: boolean` to the Props interface, and disable + relabel the "yes" button when true:

```tsx
// In the "yes" button:
<motion.button
  ...
  disabled={isFull && current !== 'yes'}
  className={[
    ...existingClasses,
    isFull && current !== 'yes' ? 'opacity-50 cursor-not-allowed' : '',
  ].join(' ')}
>
  {isFull && current !== 'yes' ? 'Full' : labels.yes}
</motion.button>
```

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/pages/EventEditPage.tsx src/pages/EventPage.tsx src/components/RsvpButtons.tsx
git commit -m "feat: max capacity input and full-event enforcement"
```

---

## Task 4: Cover image upload

**Files:**
- Create: `src/lib/uploadImage.ts`
- Modify: `src/pages/EventEditPage.tsx`

**Prerequisite:** Supabase Storage buckets must be created (see setup section at top).

**Step 1: Create `src/lib/uploadImage.ts`**

```ts
import { supabase } from '../supabase'

export async function uploadEventCover(
  file: File,
  userId: string,
  eventId: string
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${eventId}.${ext}`
  const { error } = await supabase.storage
    .from('event-covers')
    .upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('event-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
```

**Step 2: Add cover image upload zone to EventEditPage**

At the top of the form (before the Title input), add:

```tsx
import { useRef } from 'react'
import { uploadEventCover } from '../lib/uploadImage'

// Inside the component:
const fileInputRef = useRef<HTMLInputElement>(null)
const [uploading, setUploading] = useState(false)

const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || !user) return
  setUploading(true)
  try {
    // Use event.id if editing, or a temp UUID if new
    const id = event.id ?? crypto.randomUUID()
    const url = await uploadEventCover(file, user.id, id)
    set({ cover_image_url: url })
  } catch (err) {
    alert('Upload failed. Please try again.')
  } finally {
    setUploading(false)
  }
}
```

And in the JSX, add before the title field:

```tsx
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
      <span className="text-zinc-500 text-sm">{uploading ? 'Uploading...' : '+ Add cover photo'}</span>
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
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/lib/uploadImage.ts src/pages/EventEditPage.tsx
git commit -m "feat: cover image upload via Supabase Storage"
```

---

## Task 5: Profile page

**Files:**
- Modify: `src/pages/ProfilePage.tsx` (currently a stub in App.tsx inline — extract to file)
- Modify: `src/App.tsx`

**Step 1: Create `src/pages/ProfilePage.tsx`**

```tsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getProfile, updateProfile } from '../sdk/profiles'
import { uploadAvatar } from '../lib/uploadImage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile } from '../sdk/types'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(p => {
      if (p) {
        setProfile(p)
        setUsername(p.username ?? '')
      }
    })
  }, [user?.id])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, { username })
      setProfile(updated)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const url = await uploadAvatar(file, user.id)
      const updated = await updateProfile(user.id, { avatar_url: url })
      setProfile(updated)
    } catch {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const letter = (username || user?.email || '?')[0].toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white pb-24"
    >
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center min-h-[44px]"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{letter}</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                ...
              </div>
            )}
          </button>
          <span className="text-zinc-500 text-sm">Tap to change photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label className="text-zinc-300">Username</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white h-12"
            placeholder="your name"
          />
        </div>

        <p className="text-zinc-500 text-sm">{user?.email}</p>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 text-base font-semibold"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>

        <button
          onClick={() => signOut()}
          className="w-full text-zinc-500 text-sm min-h-[44px]"
        >
          Sign out
        </button>
      </div>
    </motion.div>
  )
}
```

**Step 2: Wire ProfilePage into App.tsx**

In `src/App.tsx`:

```tsx
import { ProfilePage } from './pages/ProfilePage'

// Replace the inline stub:
<Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Run all unit tests**

```bash
npm run test:run
```

Expected: 22 tests pass.

**Step 5: Commit**

```bash
git add src/pages/ProfilePage.tsx src/App.tsx
git commit -m "feat: profile page with avatar upload and username editing"
```

---

## Final: push and verify CI

```bash
git push
```

Watch the GitHub Actions run at https://github.com/billiegoose/partiful-claude/actions — all steps (unit tests, build, E2E, screenshot commit, deploy) should go green.
