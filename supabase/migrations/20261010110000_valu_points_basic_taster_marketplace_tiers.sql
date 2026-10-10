-- VALU points + Basic marketplace access
-- A completed taster may create a public Basic marketplace presence.
-- A completed full VALU assessment upgrades the same professional to the
-- authoritative points-based VALU Index and merit tier.
--
-- Basic is an access level, not a merit tier.

create or replace function public.refresh_marketplace_public_roster(p_professional_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  -- The public roster is a view; retained as a compatibility function for
  -- existing callers/triggers.
  return;
end;
$function$;

drop view if exists public.marketplace_public_roster;

create view public.marketplace_public_roster as
with full_listings as (
  select
    p.id as professional_id,
    p.display_name as full_name,
    p.bio,
    p.location,
    p.languages,
    p.headline,
    p.current_job_title,
    caps.capabilities[1] as capability,
    case
      when 'talent' = any(caps.capabilities) then 'candidate'
      when 'speaker' = any(caps.capabilities) then 'speaker'
      when 'facilitator' = any(caps.capabilities) then 'facilitator'
      else null
    end as track,
    caps.capabilities,
    p.atb_id,
    p.display_initials,
    p.photo_url,
    p.industry,
    p.skills,
    p.topics,
    p.programme_types,
    p.availability,
    p.valu_index,
    p.cluster_scores,
    p.designation,
    p.fee_range,
    p.salary_expectation,
    p.availability_status,
    now() as projection_refreshed_at
  from public.professional_profiles p
  join lateral (
    select array_agg(
      pc.capability
      order by case pc.capability
        when 'talent' then 1
        when 'speaker' then 2
        when 'facilitator' then 3
        else 9
      end
    ) as capabilities
    from public.professional_capabilities pc
    where pc.professional_id = p.id
      and pc.is_active = true
      and pc.eligibility_status = 'listed'
      and pc.eligible_for_listing = true
  ) caps on cardinality(coalesce(caps.capabilities, '{}'::text[])) > 0
  where p.profile_complete = true
    and p.visibility = 'public'
    and p.listing_status = 'listed'
    and exists (
      select 1
      from public.valu_assessments va
      where va.user_id = p.id
        and va.completed_at is not null
    )
    and not exists (
      select 1
      from public.professional_listing_events e
      where e.professional_id = p.id
        and e.event_type in ('ADMIN_REVOKED', 'ADMIN_SUSPENDED')
        and e.created_at = (
          select max(e2.created_at)
          from public.professional_listing_events e2
          where e2.professional_id = p.id
        )
    )
),
basic_taster_listings as (
  select
    p.id as professional_id,
    coalesce(nullif(trim(p.display_name),''), nullif(trim(t.name),'')) as full_name,
    null::text as bio,
    p.location,
    p.languages,
    coalesce(nullif(trim(p.headline),''), nullif(trim(t.role),'')) as headline,
    p.current_job_title,
    'talent'::text as capability,
    'candidate'::text as track,
    array['talent']::text[] as capabilities,
    p.atb_id,
    p.display_initials,
    p.photo_url,
    p.industry,
    p.skills,
    null::text[] as topics,
    p.programme_types,
    p.availability,
    null::numeric as valu_index,
    null::jsonb as cluster_scores,
    'BASIC'::text as designation,
    p.fee_range,
    p.salary_expectation,
    p.availability_status,
    now() as projection_refreshed_at
  from public.taster_sessions t
  join public.professional_profiles p on p.id = t.user_id
  where t.completed_at is not null
    and t.user_id is not null
    and not exists (
      select 1
      from public.valu_assessments va
      where va.user_id = t.user_id
        and va.completed_at is not null
    )
    and not exists (
      select 1
      from public.professional_listing_events e
      where e.professional_id = t.user_id
        and e.event_type in ('ADMIN_REVOKED', 'ADMIN_SUSPENDED')
        and e.created_at = (
          select max(e2.created_at)
          from public.professional_listing_events e2
          where e2.professional_id = t.user_id
        )
    )
    and t.id = (
      select t2.id
      from public.taster_sessions t2
      where t2.user_id = t.user_id
        and t2.completed_at is not null
      order by t2.completed_at desc, t2.created_at desc
      limit 1
    )
)
select * from full_listings
union all
select * from basic_taster_listings;

alter view public.marketplace_public_roster set (security_invoker = false);
grant select on public.marketplace_public_roster to anon, authenticated;

-- Ensure linked taster users are publicly discoverable at Basic level.
create or replace function public.link_taster_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  p_id uuid;
begin
  if new.user_id is null then return new; end if;
  p_id := new.user_id;

  insert into public.professional_profiles (
    id, display_name, headline, listing_status, profile_complete,
    visibility, active_tracks, eligible_for_listing,
    availability_status, created_at, updated_at
  )
  values (
    p_id,
    nullif(trim(new.name),''),
    nullif(trim(new.role),''),
    case when new.completed_at is not null then 'listed' else 'unlisted' end,
    false,
    case when new.completed_at is not null then 'public' else 'registered_only' end,
    array['candidate']::text[],
    false,
    'available',
    now(),
    now()
  )
  on conflict (id) do update set
    display_name = coalesce(public.professional_profiles.display_name, excluded.display_name),
    headline = coalesce(public.professional_profiles.headline, excluded.headline),
    listing_status = case
      when public.professional_profiles.listing_status in ('revoked','suspended')
        then public.professional_profiles.listing_status
      when new.completed_at is not null
        then 'listed'
      else public.professional_profiles.listing_status
    end,
    visibility = case
      when public.professional_profiles.visibility in ('public','marketplace')
        then public.professional_profiles.visibility
      when new.completed_at is not null
        then 'public'
      else public.professional_profiles.visibility
    end,
    updated_at = now();

  new.linked_at := coalesce(new.linked_at, now());
  return new;
end;
$function$;

revoke all on function public.link_taster_to_profile() from public, anon, authenticated;
