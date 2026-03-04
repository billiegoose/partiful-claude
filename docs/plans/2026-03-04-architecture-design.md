# Partiful Clone — Architecture Design

_Collaboratively designed by the repo owner and Claude Code using the superpowers brainstorming skill._

## Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite SPA, TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Auth | Supabase Auth (magic link email) |
| Database | Supabase Postgres |
| API | Supabase PostgREST (auto-generated REST from schema) |
| Real-time | Supabase Realtime |
| File storage | Supabase Storage (event cover images) |
| Hosting | GitHub Pages (static SPA) |
| CI/CD | GitHub Actions (build + deploy + Playwright) |
| Testing | Vitest (unit) + Playwright (E2E + screenshots/recordings) |

All free tier. No custom backend.

## Architecture Overview

The browser talks directly to Supabase for everything. Vercel is not used — GitHub Actions builds the Vite SPA and deploys to GitHub Pages.

```
Browser (React + Vite SPA)
  ├── Supabase Auth        (login, session, JWT)
  ├── Supabase PostgREST   (CRUD via typed SDK wrapper)
  ├── Supabase Realtime    (live RSVP counts, activity feed, boops)
  └── Supabase Storage     (event cover images)

GitHub
  ├── source code (public repo)
  └── GitHub Actions → Vite build → GitHub Pages
                     → Playwright E2E → screenshots/recordings → README artifacts
```

Row Level Security (RLS) policies in Postgres enforce all permissions. No backend = no auth middleware.

React Router uses `HashRouter` for GitHub Pages compatibility (no server-side redirect support).

## Data Model

```sql
-- Managed by Supabase Auth
auth.users

-- Public profile info
profiles (
  id uuid references auth.users primary key,
  username text,
  avatar_url text
)

events (
  id uuid primary key,
  host_id uuid references auth.users,
  title text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  cover_image_url text,
  invite_link_token uuid unique,     -- used in shareable URL, not internal ID
  visibility text,                    -- 'public' | 'invite_only'
  rsvp_button_style text,            -- 'default' | 'emoji' | 'spooky' | 'flirty' | 'formal' | 'hype' | 'icons'
  theme text,                        -- 'default' | 'dark' | 'birthday' | 'halloween' | 'holiday' | ...
  background_color text,             -- hex
  music_url text,                    -- optional Spotify/Apple Music link
  is_plus_ones_allowed boolean,
  show_guest_list boolean,
  max_capacity integer
)

rsvps (
  id uuid primary key,
  event_id uuid references events,
  user_id uuid references auth.users,
  status text,                        -- 'yes' | 'no' | 'maybe'
  headcount integer default 1,
  plus_ones integer default 0,
  note text,                          -- optional message to host
  created_at timestamptz
)

event_posts (
  id uuid primary key,
  event_id uuid references events,
  author_id uuid references auth.users,
  body text,
  created_at timestamptz
)

boops (
  id uuid primary key,
  event_id uuid references events,
  sender_id uuid references auth.users,
  recipient_id uuid references auth.users,
  emoji text,
  sent_at timestamptz
)
```

### RSVP Button Style → Label Mapping

| Style | Yes | Maybe | No |
|---|---|---|---|
| default | Going | Maybe | Can't Go |
| emoji | 🎉 | 🤔 | 😢 |
| spooky | 👻 Dying to come | 🕯️ Maybe | 💀 Can't make it |
| flirty | 😍 Absolutely | 👀 Maybe | 💔 Can't make it |
| formal | Accepts with pleasure | Will try to attend | Regretfully declines |
| hype | HELL YEAH | Maybe | Nah |
| icons | ✓ Going | ~ Maybe | ✗ Can't Go |

### RLS Policies

| Table | Read | Insert | Update | Delete |
|---|---|---|---|---|
| events | public events: anyone; invite_only: token-holder | authed | host only | host only |
| rsvps | host + own row | authed | own row only | own row only |
| event_posts | event guests | event guests | — | host or own |
| profiles | anyone | on signup trigger | own row only | — |
| boops | event guests | event guests | — | — |

Invite-only event access granted via RLS policy checking `invite_link_token` passed as a request parameter.

## SDK Wrapper

The app never imports from `@supabase/supabase-js` directly. All data access goes through `src/sdk/`.

```
src/
  supabase.ts          # single Supabase client instance
  sdk/
    types.ts           # re-exports generated Database types + convenience aliases
    events.ts          # getEvent, listEvents, createEvent, updateEvent, deleteEvent
    rsvps.ts           # getRsvp, upsertRsvp, listRsvpsForEvent
    profiles.ts        # getProfile, updateProfile
    boops.ts           # sendBoop, listBoops
    posts.ts           # listPosts, createPost, deletePost
    realtime.ts        # subscribeToRsvps, subscribeToPosts, subscribeToBoops
```

Types are derived from `supabase gen types typescript` output. Tests mock at the SDK boundary — no Supabase client needed in unit tests.

## Frontend Structure

```
src/
  components/
    ui/                # shadcn/ui primitives
    EventCard.tsx
    RsvpButtons.tsx    # renders correct labels/emojis per rsvp_button_style
    GuestList.tsx
    ActivityFeed.tsx
  pages/
    HomePage.tsx       # user's hosted + attending events
    EventPage.tsx      # public event view (the shareable invite)
    EventEditPage.tsx  # host create/edit
    ProfilePage.tsx
    AuthPage.tsx
  hooks/
    useEvent.ts        # data fetching + realtime subscription
    useRsvp.ts
    useAuth.ts         # wraps Supabase Auth session
  lib/
    rsvpStyles.ts      # maps rsvp_button_style enum → label/emoji sets
```

### Routes

```
/                      → HomePage (auth required)
/#/e/:inviteToken      → EventPage (public, shareable)
/#/e/:inviteToken/edit → EventEditPage (host only)
/#/profile             → ProfilePage
/#/login               → AuthPage
```

The `inviteToken` (not the UUID) is used in URLs — shareable without exposing internal IDs.

## Auth & UX

- Magic link email login — no passwords, clean UX
- Session stored in localStorage, auto-refreshed by Supabase client
- `<RequireAuth>` wrapper redirects unauthenticated users to `/login`
- Event page (`/e/:token`) is public — guests prompted to sign in only when RSVPing
- Mobile-first throughout: bottom navigation bar, 44px minimum touch targets, no hover-only interactions

## Animations (Framer Motion)

- Page transitions via `AnimatePresence`
- RSVP button tap — scale/bounce spring animation
- Activity feed — new posts/boops animate in, existing items shift with `layout` prop
- Event card — hover lift on homepage
- Live RSVP count — spring number tick when new RSVP arrives via Realtime

## Real-time

All subscriptions in `src/sdk/realtime.ts`, consumed via hooks, cleaned up on unmount:
- `rsvps` changes → live RSVP count on event page
- `event_posts` changes → new comments appear instantly
- `boops` changes → incoming boops animate onto screen

## Testing Strategy

### Unit tests (Vitest)
- `src/sdk/` functions
- `src/lib/rsvpStyles.ts` label mappings
- Pure utility logic

### E2E + Demo (Playwright against real Supabase test project)

CI flow:
1. Playwright logs in as host test account, creates a mock event
2. Background script (using SDK directly) injects RSVPs from fake guests + sends boops
3. Playwright captures the host's event page reacting live to incoming data
4. Screenshots + screen recording saved; recording converted to GIF for README
5. Playwright deletes the event (cascades to rsvps, posts, boops via FK)

Supabase test project credentials stored as GitHub Actions secrets.

## Post-MVP

- **Discover page** — browse public events; needs seed data to look good, punted to avoid empty-state demo problem. Can be populated with mock seed data when ready.
- **SSO** — Supabase Auth supports it; add when desired
