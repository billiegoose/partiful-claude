# Missing Features Design

_Designed 2026-03-06_

## Features

### 1. Guest List
- Shown on EventPage below RSVP buttons, visible to all viewers
- Fetches profiles for all "yes" RSVPs via a join in `listRsvpsForEvent` (select `profiles(username, avatar_url)`)
- Horizontal scroll of avatar chips: circular avatar (initials fallback) + username label
- Hidden when `show_guest_list` is false or no yes RSVPs exist
- New `GuestList` component receives `rsvps` + profiles data

### 2. Cover Image Upload
- EventEditPage: replace bare `cover_image_url` text field with tap-to-upload zone
- Shows current image as preview, or a dashed placeholder with camera icon
- On tap: `<input type="file" accept="image/*">` (triggers camera roll on mobile)
- On save: upload to Supabase Storage bucket `event-covers` at `{userId}/{eventId || 'new-{uuid}'}.{ext}`
- Store returned public URL in `cover_image_url` on the event record
- EventPage already renders `cover_image_url` — no changes needed there

### 3. Boop Button (from Guest List)
- Each guest chip in the GuestList has a tap handler (only when viewer is logged in, not their own chip)
- Tapping shows an inline emoji picker: 🎉 👋 ❤️ 🔥 😂
- Selecting an emoji calls `sendBoop({ event_id, sender_id, recipient_id, emoji })`
- Picker dismisses after selection
- Receiving side (floating boop animation in ActivityFeed) already works

### 4. Max Capacity
- EventEditPage: optional numeric input "Max guests" (blank = unlimited)
- EventPage: if `max_capacity` is set:
  - Show "X spots left" or "Full" next to going count
  - "Going" button disabled + labeled "Full" when `yesCount >= max_capacity` and user hasn't RSVPd yes
- `useEvent` hook already computes `yesCount` — add `spotsLeft` derived value

### 5. Profile Page
- Route `/#/profile` — already in router, page stub needed
- Shows avatar (letter-avatar by default) + username
- Tap avatar to upload (same Supabase Storage pattern: `avatars/{userId}`)
- Username editable inline, save calls `updateProfile`
- Sign out button at bottom

## Implementation Order
1. Guest list + profiles join (no new files, enables boop)
2. Boop button (depends on guest list)
3. Max capacity (self-contained)
4. Cover image upload (Supabase Storage setup required)
5. Profile page (Supabase Storage reuse)
