-- STAGING ONLY: seed the two explicitly authorised initial Valoria administrators.
-- Run this in the STAGING Supabase SQL Editor after both people have created
-- and email-confirmed their own staging Auth accounts.
-- This never creates accounts, changes passwords, or grants access by name alone.
-- It grants admin access only to the exact two verified email addresses below.

begin;

insert into public.admin_users (id, email, full_name)
select
  u.id,
  lower(u.email),
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    case lower(u.email)
      when 'oluwafemi@valoriainstitute.com' then 'Oluwafemi Akintola'
      when 'samsongracetayo@gmail.com' then 'Temitayo Adetokunbo'
    end
  )
from auth.users u
where lower(u.email) in (
  'oluwafemi@valoriainstitute.com',
  'samsongracetayo@gmail.com'
)
  and u.email_confirmed_at is not null
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.admin_users.full_name, excluded.full_name);

-- Verify exactly which of the two expected accounts are now authorised.
select
  expected.email,
  expected.full_name,
  case when admins.id is not null then 'ADMIN READY' else 'WAITING FOR STAGING ACCOUNT' end as status
from (values
  ('oluwafemi@valoriainstitute.com', 'Oluwafemi Akintola'),
  ('samsongracetayo@gmail.com', 'Temitayo Adetokunbo')
) as expected(email, full_name)
left join auth.users u on lower(u.email) = expected.email
left join public.admin_users admins on admins.id = u.id
order by expected.email;

commit;
