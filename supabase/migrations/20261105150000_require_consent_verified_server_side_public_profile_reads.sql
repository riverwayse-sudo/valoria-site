-- Public profile access is consent-gated at both the application and Data API
-- layers. Public clients may read only the small, non-contact profile projection.
-- Full profile data is owner/admin-only; the site uses its server-only service
-- role helper to render consent-verified public profiles.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.has_public_profile_consent(p_professional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.professional_profile_acknowledgements acknowledgement
    where acknowledgement.professional_id = p_professional_id
      and acknowledgement.acknowledgement_type = 'profile_submission'
      and acknowledgement.acknowledgement_version = 'public-profile-visibility-v1-2026-11-05'
  );
$$;

revoke all on function private.has_public_profile_consent(uuid) from public;
grant execute on function private.has_public_profile_consent(uuid) to anon, authenticated;

drop policy if exists pp_public_read_listed on public.professional_profiles;
drop policy if exists pp_owner_admin_read on public.professional_profiles;
drop policy if exists pp_public_read_consent_verified on public.professional_profiles;

create policy pp_public_read_consent_verified
  on public.professional_profiles
  for select
  to anon
  using (
    profile_complete is true
    and is_test is false
    and visibility = 'public'
    and listing_status = 'listed'
    and revoked_at is null
    and private.has_public_profile_consent(id)
  );

create policy pp_owner_admin_read
  on public.professional_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or is_valoria_admin()
  );

-- Remove table-level and legacy column-level public reads before granting the
-- explicit public projection. This preserves the legacy platform showcase,
-- which selects only these seven fields from professional_profiles.
revoke select on table public.professional_profiles from anon, public;
do $$
declare
  columns_to_revoke text;
begin
  select string_agg(format('%I', column_name), ', ')
    into columns_to_revoke
  from information_schema.columns
  where table_schema = 'public' and table_name = 'professional_profiles';

  if columns_to_revoke is not null then
    execute format(
      'revoke select (%s) on table public.professional_profiles from anon, public',
      columns_to_revoke
    );
  end if;
end;
$$;

grant select (
  id,
  atb_id,
  display_initials,
  headline,
  photo_url,
  active_tracks,
  valu_index
) on public.professional_profiles to anon;

grant select on table public.professional_profiles to authenticated;

-- The roster cache remains server-only. Its RLS is enabled and it has no
-- public policies; revoke grants as defence in depth.
revoke select on table public.marketplace_public_roster from anon, authenticated, public;
do $$
declare
  columns_to_revoke text;
begin
  select string_agg(format('%I', column_name), ', ')
    into columns_to_revoke
  from information_schema.columns
  where table_schema = 'public' and table_name = 'marketplace_public_roster';

  if columns_to_revoke is not null then
    execute format(
      'revoke select (%s) on table public.marketplace_public_roster from anon, authenticated, public',
      columns_to_revoke
    );
  end if;
end;
$$;

grant select on table public.marketplace_public_roster to service_role;
