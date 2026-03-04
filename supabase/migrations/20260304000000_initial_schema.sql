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
