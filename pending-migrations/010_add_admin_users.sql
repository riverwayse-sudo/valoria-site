-- 010_add_admin_users.sql
--
-- Dedicated admin identity, replacing the client-side-only ADMIN_EMAILS
-- check. Per Femi's explicit request (11 Aug): /admin should have its own
-- login, its own signup (invite-only — see rationale below), and its own
-- table, not reuse the general buyer/professional auth system.
--
-- This ALSO closes a real, previously-flagged security gap: until now,
-- /admin had no server-side authorization at all — the ADMIN_EMAILS check
-- ran in the browser, after the page and its Supabase queries had already
-- loaded. middleware.js now checks this table server-side before an /admin
-- request is ever allowed through. See middleware.js and
-- /admin/login/page.jsx.
--
-- Run this whole file once in the Supabase SQL editor.

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  invited_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

-- No client ever queries this table directly — every check goes through
-- middleware.js or an API route using the service-role key, which bypasses
-- RLS by design. RLS here is deny-all as a second layer, not the only one.
alter table admin_users enable row level security;
-- (No policies created — default-deny. Service-role key bypasses RLS
-- entirely, which is what middleware.js and the admin API routes use.)

-- Seed the current admins so the table isn't empty the moment this runs —
-- otherwise nobody could log in until someone was invited, and there'd be
-- no existing admin left to send the invite. Matches src/lib/adminEmails.js
-- as it stood on 11 Aug 2026. This INSERT only succeeds for emails that
-- already have a real auth.users row (i.e. have signed up before) — if
-- someone on this list has never actually created an account, add them
-- manually once they have, or use /admin/signup after the first admin logs
-- in.
insert into admin_users (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
where email in (
  'admin@valoriainstitute.com',
  'info@valoriainstitute.com',
  'oluwafemi@valoriainstitute.com',
  'oluwafemi@riverwayse.com'
)
on conflict (id) do nothing;

-- After running this, check it worked:
--   select * from admin_users;
-- If it's empty, none of the emails above have signed up yet — sign up
-- normally at /signup with one of those emails first (or use Supabase's
-- own dashboard to create the auth user), then re-run the insert above for
-- that one email.
