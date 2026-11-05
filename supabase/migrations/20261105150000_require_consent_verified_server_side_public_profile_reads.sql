-- Public profile data must be served through the consent-verifying server
-- projection. Direct Data API reads of the canonical profile table are owner-only.

drop policy if exists pp_public_read_listed on public.professional_profiles;

create policy pp_owner_admin_read
  on public.professional_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or is_valoria_admin()
  );

revoke select on table public.professional_profiles from anon, public;
grant select on table public.professional_profiles to authenticated;

-- The public roster is read by the site through a server-only service-role
-- client, which additionally verifies the current public-consent record.
-- Do not expose its cached projection directly through the Data API.
revoke select on table public.marketplace_public_roster from anon, authenticated, public;
grant select on table public.marketplace_public_roster to service_role;
