-- 012_add_profile_views.sql
--
-- "Who viewed your profile" — flagged across multiple reviews as the
-- single highest-leverage retention fix: professionals currently have zero
-- signal that anyone is looking at them, which reads as "nothing is
-- happening" in a marketplace that's still thin on real activity. The
-- NotificationBell component already has a profile_view icon wired up and
-- ready — nothing has ever generated that event until now.
--
-- Run this once in the Supabase SQL editor.

create table if not exists profile_views (
  id bigint generated always as identity primary key,
  professional_profile_id uuid not null references professional_profiles(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  viewed_at timestamptz not null default now()
);

create index if not exists profile_views_profile_idx on profile_views (professional_profile_id, viewed_at desc);

alter table profile_views enable row level security;

-- Anyone can log a view, including a signed-out visitor — viewer_id is
-- nullable for exactly that case. The client only ever sends
-- professional_profile_id and (when signed in) viewer_id — never anything
-- else — so an open insert policy here doesn't expose anything.
create policy "anyone can log a profile view" on profile_views
  for insert
  with check (true);

-- Only the profile owner can read their own view history/count. Admin
-- reads (if ever needed) go through the service-role key like every other
-- admin route in this app, bypassing RLS — no separate admin policy
-- needed here.
create policy "owner can read their own profile views" on profile_views
  for select
  using (auth.uid() = professional_profile_id);
