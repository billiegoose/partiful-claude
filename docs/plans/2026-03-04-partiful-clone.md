# Partiful Clone Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Partiful-inspired event planning SPA with Supabase backend, real-time RSVPs, animated UI, and automated Playwright demo recordings.

**Architecture:** React + Vite SPA (no backend) talking directly to Supabase for auth, data (PostgREST), real-time subscriptions, and file storage. All permissions enforced via Postgres Row Level Security. GitHub Actions builds and deploys to GitHub Pages, and runs Playwright E2E tests that produce screenshot/recording artifacts for the README.

**Tech Stack:** React 18, Vite, TypeScript, React Router v6 (HashRouter), Tailwind CSS, shadcn/ui, Framer Motion, Supabase (Auth + Postgres + Realtime + Storage), Vitest, Playwright

---

## Milestone 1: Project Scaffold

### Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

**Step 1: Scaffold project**

```bash
npm create vite@latest . -- --template react-ts
npm install
```

Expected: project runs with `npm run dev`, shows Vite default page.

**Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors, `dist/` created.

**Step 3: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold vite react-ts project"
```

---

### Task 2: Install and configure Tailwind CSS

**Files:**
- Modify: `vite.config.ts`, `src/index.css`, `tailwind.config.ts`
- Create: `postcss.config.js`

**Step 1: Install**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 2: Configure `tailwind.config.ts`**

```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

**Step 3: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Verify**

Add `<div className="text-red-500">Tailwind works</div>` to `App.tsx`, run `npm run dev`, confirm red text.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add tailwind css"
```

---

### Task 3: Install shadcn/ui

**Files:**
- Create: `components.json`, `src/components/ui/` (auto-generated)
- Modify: `src/index.css`, `tsconfig.json`

**Step 1: Initialize shadcn**

```bash
npx shadcn@latest init
```

Choose: TypeScript, default style, neutral color, `src/components/ui`, CSS variables yes.

**Step 2: Add first components**

```bash
npx shadcn@latest add button input label card avatar badge textarea
```

**Step 3: Verify**

Import `Button` from `@/components/ui/button` in `App.tsx`, confirm it renders.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui with core components"
```

---

### Task 4: Install Framer Motion and React Router

**Files:**
- Modify: `src/main.tsx`, `src/App.tsx`

**Step 1: Install**

```bash
npm install framer-motion react-router-dom
```

**Step 2: Wrap app in HashRouter in `src/main.tsx`**

```tsx
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
```

**Step 3: Add placeholder routes in `src/App.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/e/:token" element={<div>Event</div>} />
      <Route path="/e/:token/edit" element={<div>Edit Event</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
    </Routes>
  )
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add react-router v6 with hash routing and framer-motion"
```

---

### Task 5: Install and configure Vitest

**Files:**
- Modify: `vite.config.ts`, `package.json`
- Create: `src/test/setup.ts`

**Step 1: Install**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: Add to `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

**Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

**Step 4: Add test script to `package.json`**

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

**Step 5: Write a smoke test to verify setup**

Create `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**Step 6: Run test**

```bash
npm run test:run
```

Expected: 1 test passes.

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add vitest with jsdom and testing-library"
```

---

## Milestone 2: Supabase Setup

### Task 6: Create Supabase project and install client

**Files:**
- Create: `.env.local`, `.env.example`, `src/supabase.ts`
- Modify: `.gitignore`

**Step 1: Create Supabase project**

Go to https://supabase.com, create a new project (free tier). Note the project URL and anon key from Settings → API.

**Step 2: Install Supabase client**

```bash
npm install @supabase/supabase-js
```

**Step 3: Create `.env.local`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Create `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 5: Add `.env.local` to `.gitignore`**

```
.env.local
```

**Step 6: Create `src/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './sdk/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**Step 7: Commit**

```bash
git add .env.example src/ .gitignore
git commit -m "feat: add supabase client"
```

---

### Task 7: Create database schema in Supabase

**Files:**
- Create: `supabase/migrations/0001_initial_schema.sql`

**Step 1: Install Supabase CLI**

```bash
npm install -D supabase
npx supabase login
npx supabase init
npx supabase link --project-ref your-project-ref
```

**Step 2: Create `supabase/migrations/0001_initial_schema.sql`**

```sql
-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text
);
alter table profiles enable row level security;
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Events
create table events (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  cover_image_url text,
  invite_link_token uuid default gen_random_uuid() unique not null,
  visibility text default 'invite_only' check (visibility in ('public', 'invite_only')),
  rsvp_button_style text default 'default' check (rsvp_button_style in ('default','emoji','spooky','flirty','formal','hype','icons')),
  theme text default 'default',
  background_color text,
  music_url text,
  is_plus_ones_allowed boolean default false,
  show_guest_list boolean default true,
  max_capacity integer,
  created_at timestamptz default now()
);
alter table events enable row level security;
create policy "events_read_public" on events for select using (
  visibility = 'public' or host_id = auth.uid()
);
create policy "events_read_by_token" on events for select using (
  invite_link_token = (current_setting('request.jwt.claims', true)::json->>'invite_token')::uuid
);
create policy "events_insert_authed" on events for insert with check (auth.uid() = host_id);
create policy "events_update_host" on events for update using (auth.uid() = host_id);
create policy "events_delete_host" on events for delete using (auth.uid() = host_id);

-- RSVPs
create table rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  status text not null check (status in ('yes', 'no', 'maybe')),
  headcount integer default 1,
  plus_ones integer default 0,
  note text,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);
alter table rsvps enable row level security;
create policy "rsvps_read_host_or_own" on rsvps for select using (
  auth.uid() = user_id or
  auth.uid() = (select host_id from events where id = event_id)
);
create policy "rsvps_insert_authed" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update_own" on rsvps for update using (auth.uid() = user_id);
create policy "rsvps_delete_own" on rsvps for delete using (auth.uid() = user_id);

-- Event posts (activity feed)
create table event_posts (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  author_id uuid references auth.users on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);
alter table event_posts enable row level security;
create policy "posts_read_guests" on event_posts for select using (
  exists (select 1 from rsvps where event_id = event_posts.event_id and user_id = auth.uid())
  or auth.uid() = (select host_id from events where id = event_posts.event_id)
);
create policy "posts_insert_guests" on event_posts for insert with check (
  exists (select 1 from rsvps where event_id = event_posts.event_id and user_id = auth.uid())
  or auth.uid() = (select host_id from events where id = event_posts.event_id)
);
create policy "posts_delete_host_or_own" on event_posts for delete using (
  auth.uid() = author_id or
  auth.uid() = (select host_id from events where id = event_posts.event_id)
);

-- Boops
create table boops (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  sender_id uuid references auth.users on delete cascade not null,
  recipient_id uuid references auth.users on delete cascade not null,
  emoji text not null,
  sent_at timestamptz default now()
);
alter table boops enable row level security;
create policy "boops_read_guests" on boops for select using (
  auth.uid() = sender_id or auth.uid() = recipient_id or
  auth.uid() = (select host_id from events where id = boops.event_id)
);
create policy "boops_insert_guests" on boops for insert with check (
  auth.uid() = sender_id and (
    exists (select 1 from rsvps where event_id = boops.event_id and user_id = auth.uid())
    or auth.uid() = (select host_id from events where id = boops.event_id)
  )
);

-- Enable realtime for live updates
alter publication supabase_realtime add table rsvps;
alter publication supabase_realtime add table event_posts;
alter publication supabase_realtime add table boops;
```

**Step 3: Apply migration**

```bash
npx supabase db push
```

Expected: migration applied successfully.

**Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema with RLS policies"
```

---

### Task 8: Generate TypeScript types from schema

**Files:**
- Create: `src/sdk/types.ts`

**Step 1: Generate types**

```bash
npx supabase gen types typescript --project-id your-project-ref > src/sdk/types.ts
```

**Step 2: Add convenience aliases to bottom of `src/sdk/types.ts`**

```ts
// Convenience type aliases
export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type Rsvp = Database['public']['Tables']['rsvps']['Row']
export type RsvpInsert = Database['public']['Tables']['rsvps']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type EventPost = Database['public']['Tables']['event_posts']['Row']
export type EventPostInsert = Database['public']['Tables']['event_posts']['Insert']
export type Boop = Database['public']['Tables']['boops']['Row']
export type BoopInsert = Database['public']['Tables']['boops']['Insert']
export type RsvpStatus = 'yes' | 'no' | 'maybe'
export type RsvpButtonStyle = 'default' | 'emoji' | 'spooky' | 'flirty' | 'formal' | 'hype' | 'icons'
```

**Step 3: Commit**

```bash
git add src/sdk/types.ts
git commit -m "feat: add generated supabase types with convenience aliases"
```

---

## Milestone 3: SDK Wrapper

### Task 9: RSVP button style mappings (TDD)

**Files:**
- Create: `src/lib/rsvpStyles.ts`
- Create: `src/lib/rsvpStyles.test.ts`

**Step 1: Write failing tests**

Create `src/lib/rsvpStyles.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getRsvpLabels } from './rsvpStyles'

describe('getRsvpLabels', () => {
  it('returns default labels', () => {
    const labels = getRsvpLabels('default')
    expect(labels).toEqual({ yes: 'Going', maybe: 'Maybe', no: "Can't Go" })
  })

  it('returns spooky labels', () => {
    const labels = getRsvpLabels('spooky')
    expect(labels.yes).toContain('👻')
    expect(labels.no).toContain('💀')
  })

  it('returns flirty labels', () => {
    const labels = getRsvpLabels('flirty')
    expect(labels.yes).toContain('😍')
  })

  it('returns hype labels', () => {
    expect(getRsvpLabels('hype').yes).toBe('HELL YEAH')
  })

  it('returns emoji labels', () => {
    expect(getRsvpLabels('emoji').yes).toBe('🎉')
  })

  it('returns formal labels', () => {
    expect(getRsvpLabels('formal').yes).toContain('pleasure')
  })

  it('falls back to default for unknown style', () => {
    // @ts-expect-error testing invalid input
    expect(getRsvpLabels('unknown')).toEqual(getRsvpLabels('default'))
  })
})
```

**Step 2: Run to verify failure**

```bash
npm run test:run src/lib/rsvpStyles.test.ts
```

Expected: FAIL — `getRsvpLabels` not found.

**Step 3: Implement `src/lib/rsvpStyles.ts`**

```ts
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
  icons:   { yes: '✓ Going', maybe: '~ Maybe', no: '✗ Can\'t Go' },
}

export function getRsvpLabels(style: RsvpButtonStyle): RsvpLabels {
  return STYLES[style] ?? STYLES.default
}
```

**Step 4: Run tests to verify passing**

```bash
npm run test:run src/lib/rsvpStyles.test.ts
```

Expected: 7 tests pass.

**Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add rsvp button style label mappings with tests"
```

---

### Task 10: Events SDK (TDD)

**Files:**
- Create: `src/sdk/events.ts`
- Create: `src/sdk/events.test.ts`

**Step 1: Write failing tests using mocked Supabase client**

Create `src/sdk/events.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase module before importing sdk
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../supabase'
import { getEvent, listMyEvents, createEvent, deleteEvent } from './events'

const mockEvent = {
  id: 'evt-1',
  host_id: 'user-1',
  title: 'Test Party',
  start_at: '2026-06-01T18:00:00Z',
  invite_link_token: 'token-abc',
  visibility: 'invite_only',
  rsvp_button_style: 'default',
  created_at: '2026-01-01T00:00:00Z',
}

describe('getEvent', () => {
  it('fetches event by invite_link_token', async () => {
    const select = vi.fn().mockResolvedValue({ data: mockEvent, error: null })
    const eq = vi.fn().mockReturnValue({ single: select })
    const single = vi.fn().mockReturnValue({ data: mockEvent, error: null })
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => ({ single }) }) } as any)

    const result = await getEvent('token-abc')
    expect(result?.title).toBe('Test Party')
  })
})

describe('createEvent', () => {
  it('inserts and returns new event', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockEvent, error: null })
    vi.mocked(supabase.from).mockReturnValue({ insert: () => ({ select: () => ({ single }) }) } as any)

    const result = await createEvent({
      host_id: 'user-1',
      title: 'Test Party',
      start_at: '2026-06-01T18:00:00Z',
    })
    expect(result.title).toBe('Test Party')
  })
})
```

**Step 2: Run to verify failure**

```bash
npm run test:run src/sdk/events.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement `src/sdk/events.ts`**

```ts
import { supabase } from '../supabase'
import type { Event, EventInsert, EventUpdate } from './types'

export async function getEvent(inviteToken: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('invite_link_token', inviteToken)
    .single()
  if (error) return null
  return data
}

export async function listMyEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', userId)
    .order('start_at', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createEvent(event: EventInsert): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateEvent(id: string, update: EventUpdate): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

**Step 4: Run tests**

```bash
npm run test:run src/sdk/events.test.ts
```

Expected: all pass.

**Step 5: Commit**

```bash
git add src/sdk/events.ts src/sdk/events.test.ts
git commit -m "feat: add events sdk with tests"
```

---

### Task 11: RSVPs SDK (TDD)

**Files:**
- Create: `src/sdk/rsvps.ts`
- Create: `src/sdk/rsvps.test.ts`

**Step 1: Write failing tests**

Create `src/sdk/rsvps.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('../supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../supabase'
import { upsertRsvp, listRsvpsForEvent, getMyRsvp } from './rsvps'

const mockRsvp = { id: 'r1', event_id: 'evt-1', user_id: 'u1', status: 'yes', headcount: 1, plus_ones: 0, note: null, created_at: '2026-01-01' }

describe('upsertRsvp', () => {
  it('upserts and returns rsvp', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockRsvp, error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: () => ({ select: () => ({ single }) }) } as any)
    const result = await upsertRsvp({ event_id: 'evt-1', user_id: 'u1', status: 'yes' })
    expect(result.status).toBe('yes')
  })
})

describe('listRsvpsForEvent', () => {
  it('returns rsvps for an event', async () => {
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq: () => Promise.resolve({ data: [mockRsvp], error: null }) }) } as any)
    const result = await listRsvpsForEvent('evt-1')
    expect(result).toHaveLength(1)
  })
})
```

**Step 2: Run to verify failure**

```bash
npm run test:run src/sdk/rsvps.test.ts
```

**Step 3: Implement `src/sdk/rsvps.ts`**

```ts
import { supabase } from '../supabase'
import type { Rsvp, RsvpInsert } from './types'

export async function upsertRsvp(rsvp: RsvpInsert): Promise<Rsvp> {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert(rsvp, { onConflict: 'event_id,user_id' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function listRsvpsForEvent(eventId: string): Promise<Rsvp[]> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
  if (error) return []
  return data ?? []
}

export async function getMyRsvp(eventId: string, userId: string): Promise<Rsvp | null> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function deleteRsvp(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}
```

**Step 4: Run tests**

```bash
npm run test:run src/sdk/rsvps.test.ts
```

Expected: all pass.

**Step 5: Commit**

```bash
git add src/sdk/rsvps.ts src/sdk/rsvps.test.ts
git commit -m "feat: add rsvps sdk with tests"
```

---

### Task 12: Posts, Boops, Profiles SDK

**Files:**
- Create: `src/sdk/posts.ts`
- Create: `src/sdk/profiles.ts`
- Create: `src/sdk/boops.ts`

**Step 1: Create `src/sdk/posts.ts`**

```ts
import { supabase } from '../supabase'
import type { EventPost, EventPostInsert } from './types'

export async function listPosts(eventId: string): Promise<EventPost[]> {
  const { data, error } = await supabase
    .from('event_posts')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createPost(post: EventPostInsert): Promise<EventPost> {
  const { data, error } = await supabase
    .from('event_posts')
    .insert(post)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('event_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
```

**Step 2: Create `src/sdk/boops.ts`**

```ts
import { supabase } from '../supabase'
import type { Boop, BoopInsert } from './types'

export async function sendBoop(boop: BoopInsert): Promise<Boop> {
  const { data, error } = await supabase
    .from('boops')
    .insert(boop)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function listBoops(eventId: string): Promise<Boop[]> {
  const { data, error } = await supabase
    .from('boops')
    .select('*')
    .eq('event_id', eventId)
    .order('sent_at', { ascending: false })
  if (error) return []
  return data ?? []
}
```

**Step 3: Create `src/sdk/profiles.ts`**

```ts
import { supabase } from '../supabase'
import type { Profile } from './types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function updateProfile(userId: string, update: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
```

**Step 4: Commit**

```bash
git add src/sdk/posts.ts src/sdk/boops.ts src/sdk/profiles.ts
git commit -m "feat: add posts, boops, profiles sdk"
```

---

### Task 13: Realtime SDK

**Files:**
- Create: `src/sdk/realtime.ts`

**Step 1: Create `src/sdk/realtime.ts`**

```ts
import { supabase } from '../supabase'
import type { Rsvp, EventPost, Boop } from './types'

export function subscribeToRsvps(
  eventId: string,
  onInsert: (rsvp: Rsvp) => void,
  onUpdate: (rsvp: Rsvp) => void
) {
  return supabase
    .channel(`rsvps:${eventId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'rsvps',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new as Rsvp))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rsvps',
      filter: `event_id=eq.${eventId}`,
    }, payload => onUpdate(payload.new as Rsvp))
    .subscribe()
}

export function subscribeToPosts(
  eventId: string,
  onInsert: (post: EventPost) => void
) {
  return supabase
    .channel(`posts:${eventId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'event_posts',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new as EventPost))
    .subscribe()
}

export function subscribeToBoops(
  eventId: string,
  onInsert: (boop: Boop) => void
) {
  return supabase
    .channel(`boops:${eventId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'boops',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new as Boop))
    .subscribe()
}
```

**Step 2: Commit**

```bash
git add src/sdk/realtime.ts
git commit -m "feat: add realtime subscription helpers"
```

---

## Milestone 4: Auth

### Task 14: Auth hook and pages

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/pages/AuthPage.tsx`
- Create: `src/components/RequireAuth.tsx`

**Step 1: Create `src/hooks/useAuth.ts`**

```ts
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email: string) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })

  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signOut }
}
```

**Step 2: Create `src/components/RequireAuth.tsx`**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

**Step 3: Create `src/pages/AuthPage.tsx`**

```tsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export function AuthPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(email)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <h1 className="text-3xl font-bold text-white text-center">partiful</h1>
        {sent ? (
          <p className="text-center text-zinc-400">Check your email for a magic link ✨</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <Button type="submit" className="w-full">Send magic link</Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
```

**Step 4: Wire up routes in `src/App.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthPage } from './pages/AuthPage'
import { RequireAuth } from './components/RequireAuth'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<RequireAuth><div>Home</div></RequireAuth>} />
        <Route path="/e/:token" element={<div>Event</div>} />
        <Route path="/e/:token/edit" element={<RequireAuth><div>Edit Event</div></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><div>Profile</div></RequireAuth>} />
      </Routes>
    </AnimatePresence>
  )
}
```

**Step 5: Commit**

```bash
git add src/hooks/useAuth.ts src/components/RequireAuth.tsx src/pages/AuthPage.tsx src/App.tsx
git commit -m "feat: add magic link auth with useAuth hook and RequireAuth guard"
```

---

## Milestone 5: Core Pages

### Task 15: Event data hooks

**Files:**
- Create: `src/hooks/useEvent.ts`
- Create: `src/hooks/useRsvp.ts`

**Step 1: Create `src/hooks/useEvent.ts`**

```ts
import { useEffect, useState } from 'react'
import { getEvent } from '../sdk/events'
import { listRsvpsForEvent } from '../sdk/rsvps'
import { subscribeToRsvps } from '../sdk/realtime'
import type { Event, Rsvp } from '../sdk/types'

export function useEvent(token: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [evt, rsvpList] = await Promise.all([
        getEvent(token),
        // rsvps loaded after event id known
        Promise.resolve([] as Rsvp[]),
      ])
      if (cancelled) return
      setEvent(evt)
      if (evt) {
        const r = await listRsvpsForEvent(evt.id)
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
      (rsvp) => setRsvps(prev => [...prev.filter(r => r.id !== rsvp.id), rsvp]),
      (rsvp) => setRsvps(prev => prev.map(r => r.id === rsvp.id ? rsvp : r))
    )
    return () => { channel.unsubscribe() }
  }, [event?.id])

  const yesCount = rsvps.filter(r => r.status === 'yes').length
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length

  return { event, rsvps, yesCount, maybeCount, loading }
}
```

**Step 2: Create `src/hooks/useRsvp.ts`**

```ts
import { useEffect, useState } from 'react'
import { getMyRsvp, upsertRsvp } from '../sdk/rsvps'
import type { Rsvp, RsvpStatus } from '../sdk/types'

export function useRsvp(eventId: string, userId: string | undefined) {
  const [rsvp, setRsvp] = useState<Rsvp | null>(null)

  useEffect(() => {
    if (!userId) return
    getMyRsvp(eventId, userId).then(setRsvp)
  }, [eventId, userId])

  const respond = async (status: RsvpStatus) => {
    if (!userId) return
    const updated = await upsertRsvp({ event_id: eventId, user_id: userId, status })
    setRsvp(updated)
  }

  return { rsvp, respond }
}
```

**Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useEvent and useRsvp hooks with realtime"
```

---

### Task 16: RsvpButtons component (TDD)

**Files:**
- Create: `src/components/RsvpButtons.tsx`
- Create: `src/components/RsvpButtons.test.tsx`

**Step 1: Write failing tests**

Create `src/components/RsvpButtons.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RsvpButtons } from './RsvpButtons'

describe('RsvpButtons', () => {
  it('renders default labels', () => {
    render(<RsvpButtons style="default" current={null} onRespond={vi.fn()} />)
    expect(screen.getByText('Going')).toBeInTheDocument()
    expect(screen.getByText('Maybe')).toBeInTheDocument()
    expect(screen.getByText("Can't Go")).toBeInTheDocument()
  })

  it('renders spooky labels', () => {
    render(<RsvpButtons style="spooky" current={null} onRespond={vi.fn()} />)
    expect(screen.getByText(/Dying to come/)).toBeInTheDocument()
  })

  it('highlights current rsvp', () => {
    render(<RsvpButtons style="default" current="yes" onRespond={vi.fn()} />)
    const goingBtn = screen.getByText('Going').closest('button')
    expect(goingBtn).toHaveClass('ring-2')
  })

  it('calls onRespond with correct status', () => {
    const onRespond = vi.fn()
    render(<RsvpButtons style="default" current={null} onRespond={onRespond} />)
    fireEvent.click(screen.getByText('Going'))
    expect(onRespond).toHaveBeenCalledWith('yes')
  })
})
```

**Step 2: Run to verify failure**

```bash
npm run test:run src/components/RsvpButtons.test.tsx
```

**Step 3: Implement `src/components/RsvpButtons.tsx`**

```tsx
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
          className={`
            px-5 py-3 rounded-full text-sm font-semibold min-h-[44px]
            transition-colors
            ${current === status
              ? 'bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-black'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }
          `}
        >
          {labels[status]}
        </motion.button>
      ))}
    </div>
  )
}
```

**Step 4: Run tests**

```bash
npm run test:run src/components/RsvpButtons.test.tsx
```

Expected: 4 tests pass.

**Step 5: Commit**

```bash
git add src/components/RsvpButtons.tsx src/components/RsvpButtons.test.tsx
git commit -m "feat: add RsvpButtons component with animation and tests"
```

---

### Task 17: EventPage

**Files:**
- Create: `src/pages/EventPage.tsx`

**Step 1: Create `src/pages/EventPage.tsx`**

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEvent } from '../hooks/useEvent'
import { useAuth } from '../hooks/useAuth'
import { useRsvp } from '../hooks/useRsvp'
import { RsvpButtons } from '../components/RsvpButtons'
import type { RsvpButtonStyle } from '../sdk/types'

export function EventPage() {
  const { token } = useParams<{ token: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { event, yesCount, maybeCount, loading } = useEvent(token!)
  const { rsvp, respond } = useRsvp(event?.id ?? '', user?.id)

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
  if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Event not found</div>

  const handleRespond = (status: 'yes' | 'no' | 'maybe') => {
    if (!user) { navigate('/login'); return }
    respond(status)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white pb-24"
      style={event.background_color ? { backgroundColor: event.background_color } : undefined}
    >
      {event.cover_image_url && (
        <img src={event.cover_image_url} alt={event.title} className="w-full h-64 object-cover" />
      )}
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <div className="text-zinc-400 space-y-1">
          <p>{new Date(event.start_at).toLocaleString()}</p>
          {event.location && <p>{event.location}</p>}
        </div>
        {event.description && <p className="text-zinc-200">{event.description}</p>}

        {/* Live RSVP count */}
        <div className="flex gap-4 text-sm text-zinc-400">
          <motion.span key={yesCount} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            {yesCount} going
          </motion.span>
          {maybeCount > 0 && <span>{maybeCount} maybe</span>}
        </div>

        <RsvpButtons
          style={(event.rsvp_button_style as RsvpButtonStyle) ?? 'default'}
          current={rsvp?.status ?? null}
          onRespond={handleRespond}
        />

        {user?.id === event.host_id && (
          <button
            onClick={() => navigate(`/e/${token}/edit`)}
            className="text-sm text-zinc-500 underline"
          >
            Edit event
          </button>
        )}
      </div>
    </motion.div>
  )
}
```

**Step 2: Wire into `App.tsx`**

Replace `<Route path="/e/:token" element={<div>Event</div>} />` with:

```tsx
import { EventPage } from './pages/EventPage'
// ...
<Route path="/e/:token" element={<EventPage />} />
```

**Step 3: Commit**

```bash
git add src/pages/EventPage.tsx src/App.tsx
git commit -m "feat: add event page with live rsvp count and rsvp buttons"
```

---

### Task 18: HomePage

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/components/EventCard.tsx`

**Step 1: Create `src/components/EventCard.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Event } from '../sdk/types'

export function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/e/${event.invite_link_token}`)}
      className="cursor-pointer rounded-2xl overflow-hidden bg-zinc-900 hover:bg-zinc-800 transition-colors"
    >
      {event.cover_image_url && (
        <img src={event.cover_image_url} alt={event.title} className="w-full h-36 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-white">{event.title}</h3>
        <p className="text-sm text-zinc-400 mt-1">{new Date(event.start_at).toLocaleDateString()}</p>
        {event.location && <p className="text-sm text-zinc-500">{event.location}</p>}
      </div>
    </motion.div>
  )
}
```

**Step 2: Create `src/pages/HomePage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { listMyEvents } from '../sdk/events'
import { EventCard } from '../components/EventCard'
import { Button } from '@/components/ui/button'
import type { Event } from '../sdk/types'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    if (user) listMyEvents(user.id).then(setEvents)
  }, [user?.id])

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">your events</h1>
          <Button onClick={() => navigate('/e/new/edit')} size="sm">+ create</Button>
        </div>
        <motion.div layout className="space-y-4">
          {events.length === 0 && (
            <p className="text-zinc-500 text-center py-12">No events yet. Create your first!</p>
          )}
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
```

**Step 3: Wire into `App.tsx`**

```tsx
import { HomePage } from './pages/HomePage'
// ...
<Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
```

**Step 4: Commit**

```bash
git add src/pages/HomePage.tsx src/components/EventCard.tsx src/App.tsx
git commit -m "feat: add home page with event list and event card"
```

---

### Task 19: EventEditPage (create + edit)

**Files:**
- Create: `src/pages/EventEditPage.tsx`

**Step 1: Create `src/pages/EventEditPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getEvent, createEvent, updateEvent } from '../sdk/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Event, RsvpButtonStyle } from '../sdk/types'

const RSVP_STYLES: RsvpButtonStyle[] = ['default', 'emoji', 'spooky', 'flirty', 'formal', 'hype', 'icons']

export function EventEditPage() {
  const { token } = useParams<{ token: string }>()
  const isNew = token === 'new'
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    location: '',
    start_at: '',
    rsvp_button_style: 'default',
    visibility: 'invite_only',
  })

  useEffect(() => {
    if (!isNew && token) {
      getEvent(token).then(e => { if (e) setEvent(e) })
    }
  }, [token, isNew])

  const handleSave = async () => {
    if (!user) return
    if (isNew) {
      const created = await createEvent({
        ...event,
        host_id: user.id,
        title: event.title!,
        start_at: event.start_at!,
      })
      navigate(`/e/${created.invite_link_token}`)
    } else {
      await updateEvent(event.id!, event)
      navigate(`/e/${token}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">
        <h1 className="text-2xl font-bold">{isNew ? 'Create event' : 'Edit event'}</h1>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={event.title ?? ''} onChange={e => setEvent(p => ({ ...p, title: e.target.value }))}
            className="bg-zinc-900 border-zinc-700 text-white" placeholder="My awesome party" />
        </div>

        <div className="space-y-2">
          <Label>Date & time</Label>
          <Input type="datetime-local" value={event.start_at?.slice(0, 16) ?? ''}
            onChange={e => setEvent(p => ({ ...p, start_at: new Date(e.target.value).toISOString() }))}
            className="bg-zinc-900 border-zinc-700 text-white" />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={event.location ?? ''} onChange={e => setEvent(p => ({ ...p, location: e.target.value }))}
            className="bg-zinc-900 border-zinc-700 text-white" placeholder="123 Party St" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={event.description ?? ''} onChange={e => setEvent(p => ({ ...p, description: e.target.value }))}
            className="bg-zinc-900 border-zinc-700 text-white" rows={4} />
        </div>

        <div className="space-y-2">
          <Label>RSVP button style</Label>
          <div className="flex flex-wrap gap-2">
            {RSVP_STYLES.map(s => (
              <button key={s} onClick={() => setEvent(p => ({ ...p, rsvp_button_style: s }))}
                className={`px-3 py-1.5 rounded-full text-sm capitalize min-h-[44px]
                  ${event.rsvp_button_style === s ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          {isNew ? 'Create event' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
```

**Step 2: Wire into `App.tsx`**

```tsx
import { EventEditPage } from './pages/EventEditPage'
// ...
<Route path="/e/:token/edit" element={<RequireAuth><EventEditPage /></RequireAuth>} />
```

**Step 3: Commit**

```bash
git add src/pages/EventEditPage.tsx src/App.tsx
git commit -m "feat: add event create/edit page"
```

---

### Task 20: Activity feed and boops

**Files:**
- Create: `src/components/ActivityFeed.tsx`
- Modify: `src/pages/EventPage.tsx`

**Step 1: Create `src/components/ActivityFeed.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listPosts, createPost } from '../sdk/posts'
import { subscribeToPosts, subscribeToBoops } from '../sdk/realtime'
import type { EventPost, Boop } from '../sdk/types'

interface Props {
  eventId: string
  userId: string | undefined
}

const BOOP_EMOJIS = ['👋', '🎉', '💫', '🔥', '👀', '✨', '💃', '🕺']

export function ActivityFeed({ eventId, userId }: Props) {
  const [posts, setPosts] = useState<EventPost[]>([])
  const [boops, setBoops] = useState<Boop[]>([])
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    listPosts(eventId).then(setPosts)
    const postChannel = subscribeToPosts(eventId, p => setPosts(prev => [...prev, p]))
    const boopChannel = subscribeToBoops(eventId, b => {
      setBoops(prev => [...prev, b])
      setTimeout(() => setBoops(prev => prev.filter(x => x.id !== b.id)), 3000)
    })
    return () => { postChannel.unsubscribe(); boopChannel.unsubscribe() }
  }, [eventId])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newPost.trim()) return
    await createPost({ event_id: eventId, author_id: userId, body: newPost.trim() })
    setNewPost('')
  }

  return (
    <div className="space-y-4">
      {/* Floating boops */}
      <AnimatePresence>
        {boops.map(b => (
          <motion.div key={b.id}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.5 }}
            className="fixed bottom-32 right-6 text-4xl pointer-events-none"
          >
            {b.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Posts */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {posts.map(post => (
            <motion.div key={post.id} layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-xl p-4 text-white text-sm"
            >
              {post.body}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {userId && (
        <form onSubmit={handlePost} className="flex gap-2">
          <input value={newPost} onChange={e => setNewPost(e.target.value)}
            placeholder="Add to the feed..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-white text-sm min-h-[44px]" />
          <button type="submit" className="bg-white text-black rounded-full px-4 py-2 text-sm font-semibold min-h-[44px]">Post</button>
        </form>
      )}
    </div>
  )
}
```

**Step 2: Add ActivityFeed to EventPage**

In `src/pages/EventPage.tsx`, import and add after the RSVP buttons:

```tsx
import { ActivityFeed } from '../components/ActivityFeed'
// ...
<ActivityFeed eventId={event.id} userId={user?.id} />
```

**Step 3: Commit**

```bash
git add src/components/ActivityFeed.tsx src/pages/EventPage.tsx
git commit -m "feat: add activity feed with posts and boop animations"
```

---

### Task 21: Bottom navigation

**Files:**
- Create: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`

**Step 1: Create `src/components/BottomNav.tsx`**

```tsx
import { useNavigate, useLocation } from 'react-router-dom'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/e/new/edit', icon: '＋', label: 'Create' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex">
      {items.map(item => (
        <button key={item.path} onClick={() => navigate(item.path)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 min-h-[60px] text-xs
            ${location.pathname === item.path ? 'text-white' : 'text-zinc-500'}`}>
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
```

**Step 2: Add BottomNav to App.tsx (only when authed)**

```tsx
import { useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()
  const hideNav = location.pathname === '/login'

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>...</Routes>
      </AnimatePresence>
      {user && !hideNav && <BottomNav />}
    </>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/BottomNav.tsx src/App.tsx
git commit -m "feat: add mobile bottom navigation"
```

---

## Milestone 6: GitHub Actions CI/CD

### Task 22: GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts`

**Step 1: Set base path in `vite.config.ts`**

```ts
export default defineConfig({
  base: '/partiful-claude/', // replace with your repo name
  plugins: [react()],
  test: { ... }
})
```

**Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 3: Add GitHub secrets**

In your GitHub repo → Settings → Secrets → Actions, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Step 4: Enable GitHub Pages**

Repo Settings → Pages → Source: GitHub Actions.

**Step 5: Commit and push**

```bash
git add .github/ vite.config.ts
git commit -m "feat: add github actions deploy to github pages"
git push origin main
```

Expected: Actions tab shows successful deploy.

---

### Task 23: Playwright setup and E2E tests

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/event-flow.spec.ts`
- Create: `e2e/seed.ts`
- Modify: `.github/workflows/deploy.yml`

**Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    screenshot: 'on',
    video: 'on',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 3: Create `e2e/seed.ts` (SDK-direct data injector)**

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/sdk/types'

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for seed scripts
)

export async function seedFakeRsvps(eventId: string) {
  const fakeUsers = [
    { id: 'seed-user-1', status: 'yes' as const },
    { id: 'seed-user-2', status: 'yes' as const },
    { id: 'seed-user-3', status: 'maybe' as const },
  ]
  // Insert directly using service role (bypasses RLS)
  for (const u of fakeUsers) {
    await supabase.from('rsvps').upsert({
      event_id: eventId,
      user_id: u.id,
      status: u.status,
    })
  }
}

export async function seedFakeBoop(eventId: string, senderId: string, recipientId: string) {
  await supabase.from('boops').insert({
    event_id: eventId,
    sender_id: senderId,
    recipient_id: recipientId,
    emoji: '🎉',
  })
}

export async function cleanupEvent(eventId: string) {
  await supabase.from('events').delete().eq('id', eventId)
}
```

**Step 4: Create `e2e/event-flow.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import { seedFakeRsvps, seedFakeBoop, cleanupEvent } from './seed'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL!
let createdEventId: string

test.describe('Event happy path', () => {
  test.afterAll(async () => {
    if (createdEventId) await cleanupEvent(createdEventId)
  })

  test('host creates event and sees live RSVPs arrive', async ({ page }) => {
    // Login via magic link (use pre-existing test session)
    await page.goto('/')
    // (In CI, use a pre-seeded session cookie or Supabase service role to pre-authenticate)

    // Create event
    await page.goto('/#/e/new/edit')
    await page.fill('input[placeholder="My awesome party"]', 'E2E Test Party 🎉')
    await page.fill('input[type="datetime-local"]', '2026-12-31T20:00')
    await page.fill('input[placeholder="123 Party St"]', 'The Internet')
    await page.click('button:has-text("spooky")')
    await page.click('button:has-text("Create event")')

    // Wait for redirect to event page
    await page.waitForURL(/\/#\/e\//)
    const token = page.url().split('/e/')[1]

    // Get event ID for cleanup
    // (fetch from supabase using token)

    await page.screenshot({ path: 'e2e/screenshots/01-event-created.png', fullPage: true })

    // Inject fake RSVPs in background while watching event page
    await seedFakeRsvps('event-id-placeholder') // replace with actual ID

    // Wait for live count to update
    await expect(page.getByText(/going/)).toContainText('3')
    await page.screenshot({ path: 'e2e/screenshots/02-live-rsvps.png', fullPage: true })

    // Inject a boop
    await seedFakeBoop('event-id-placeholder', 'seed-user-1', 'seed-user-1')
    await page.screenshot({ path: 'e2e/screenshots/03-boop-animation.png', fullPage: true })
  })
})
```

**Step 5: Add Playwright job to `deploy.yml`**

```yaml
  playwright:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          E2E_TEST_EMAIL: ${{ secrets.E2E_TEST_EMAIL }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-artifacts
          path: |
            e2e/screenshots/
            playwright-report/
```

**Step 6: Add secrets**

Add to GitHub Actions secrets:
- `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Settings → API)
- `E2E_TEST_EMAIL` (a test email you control)

**Step 7: Commit**

```bash
git add playwright.config.ts e2e/ .github/
git commit -m "feat: add playwright e2e tests with screenshot artifacts"
```

---

### Task 24: README with embedded screenshots

**Files:**
- Create: `README.md`

**Step 1: Create `README.md`**

```markdown
# partiful-claude

A Partiful-inspired event planning app built as a portfolio piece. Collaboratively designed and implemented by [@your-username](https://github.com/your-username) and [Claude Code](https://claude.ai/code) using the [superpowers](https://github.com/...) skill system.

## Features

- Create and share events via invite link
- RSVP with customizable button styles (default, spooky 👻, flirty 😍, hype, formal, emoji)
- Live RSVP count updates via Supabase Realtime
- Activity feed with posts and boops
- Magic link auth (no passwords)
- Mobile-first design

## Demo

### Event Page
![Event created](e2e/screenshots/01-event-created.png)

### Live RSVPs arriving in real-time
![Live RSVPs](e2e/screenshots/02-live-rsvps.png)

### Boop animation
![Boop](e2e/screenshots/03-boop-animation.png)

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Backend | Supabase (Auth, Postgres, Realtime, Storage) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## Development

```bash
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

npm install
npm run dev        # start dev server
npm run test       # unit tests (vitest)
npx playwright test  # e2e tests
```

## Architecture

See [docs/plans/2026-03-04-architecture-design.md](docs/plans/2026-03-04-architecture-design.md) for full design decisions.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add readme with screenshot placeholders"
```

---

## Post-MVP: Discover Page

When ready to add the Discover page:
1. Add a seed script that creates mock public events with realistic data
2. Create `src/pages/DiscoverPage.tsx` with location filter
3. Add `/discover` route and bottom nav item
4. Update RLS to allow reading public events without auth

