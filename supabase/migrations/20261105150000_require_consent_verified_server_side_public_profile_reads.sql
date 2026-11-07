-- Public profile access is consent-gated at both the application and Data API
-- layers. Full listings require a completed VALU profile. Basic listings are
-- available to authenticated taster participants after account linking, a
-- minimal professional identity, and explicit public-profile consent.
-- Basic listings do not expose VALU points, designation, or assessment summary.

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
      and acknowledgement.acknowledgement_version = 'public-profile-visibility-v2-2026-11-06'
  );
$$;

revoke all on function private.has_public_profile_consent(uuid) from public;
grant execute on function private.has_public_profile_consent(uuid) to anon, authenticated;

create or replace function private.is_public_profile_eligible(p_professional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.marketplace_public_roster roster
    join public.professional_profiles profile
      on profile.id = roster.professional_id
    where roster.professional_id = p_professional_id
      and (
        (
          roster.assessment_access = 'full'
          and cardinality(coalesce(roster.capabilities, '{}'::text[])) > 0
          and roster.assessment_summary is not null
          and length(btrim(roster.assessment_summary)) >= 12
          and profile.profile_complete is true
        )
        or
        (
          roster.assessment_access = 'basic'
          and exists (
            select 1
            from public.taster_sessions taster
            where taster.user_id = profile.id
              and taster.completed_at is not null
          )
          and coalesce(nullif(btrim(profile.display_name), ''), nullif(btrim(roster.full_name), '')) is not null
          and coalesce(
            nullif(btrim(profile.headline), ''),
            nullif(btrim(profile.current_job_title), ''),
            nullif(btrim(roster.headline), ''),
            nullif(btrim(roster.current_job_title), '')
          ) is not null
        )
      )
      and profile.is_test is false
      and profile.visibility = 'public'
      and profile.listing_status = 'listed'
      and profile.revoked_at is null
  );
$$;

revoke all on function private.is_public_profile_eligible(uuid) from public;
grant execute on function private.is_public_profile_eligible(uuid) to anon, authenticated;

drop policy if exists pp_public_read_listed on public.professional_profiles;
drop policy if exists pp_owner_admin_read on public.professional_profiles;
drop policy if exists pp_public_read_consent_verified on public.professional_profiles;

create policy pp_public_read_consent_verified
  on public.professional_profiles
  for select
  to anon, authenticated
  using (
    is_test is false
    and visibility = 'public'
    and listing_status = 'listed'
    and revoked_at is null
    and private.has_public_profile_consent(id)
    and private.is_public_profile_eligible(id)
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
revoke insert, update, delete on table public.professional_profiles from anon, public;
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
  active_tracks
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

-- Certificate visibility must use the same consent gate without requiring
-- anonymous clients to SELECT private visibility/governance columns.
create or replace function private.can_read_public_professional_certificate(p_professional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    private.has_public_profile_consent(p_professional_id)
    and private.is_public_profile_eligible(p_professional_id);
$$;

revoke all on function private.can_read_public_professional_certificate(uuid) from public;
grant execute on function private.can_read_public_professional_certificate(uuid) to anon, authenticated;

revoke insert, update, delete on table public.professional_certificates from anon, public;

drop policy if exists certificates_public_verified_read on public.professional_certificates;
create policy certificates_public_verified_read
  on public.professional_certificates
  for select
  to anon, authenticated
  using (
    revoked_at is null
    and private.can_read_public_professional_certificate(professional_id)
  );


-- The old public homepage RPCs are invoker functions over the roster table.
-- The site now builds its homepage directory through the consent-verified
-- server-side projection above. Disable the legacy anonymous RPC surface so
-- callers cannot bypass the consent gate or rely on the revoked table grant.
revoke execute on function public.get_homepage_professional_previews() from public, anon, authenticated;
revoke execute on function public.get_homepage_professional_previews_v2() from public, anon, authenticated;
revoke execute on function public.get_homepage_professional_count() from public, anon, authenticated;
grant execute on function public.get_homepage_professional_previews() to service_role;
grant execute on function public.get_homepage_professional_previews_v2() to service_role;
grant execute on function public.get_homepage_professional_count() to service_role;
