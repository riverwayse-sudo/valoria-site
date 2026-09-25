-- Canonical marketplace projection and legacy-view purge.
-- One professional identity can expose multiple capabilities. Public discovery
-- is driven only by active capability rows that the governance layer has marked
-- listed. Profile-level listing fields are not part of public discovery.

drop view if exists public.marketplace_professionals;
drop view if exists public.marketplace_professionals_general;
drop view if exists public.public_marketplace_professionals;
drop view if exists public.professional_profiles_public;

create or replace view public.marketplace_public_roster as
select
  p.id as professional_id,
  p.display_name as full_name,
  p.bio,
  p.location,
  p.languages,
  p.headline,
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
where not exists (
  select 1
  from public.professional_listing_events e
  where e.professional_id = p.id
    and e.event_type in ('ADMIN_REVOKED', 'ADMIN_SUSPENDED')
    and e.created_at = (
      select max(e2.created_at)
      from public.professional_listing_events e2
      where e2.professional_id = p.id
    )
);

alter view public.marketplace_public_roster set (security_invoker = false);
grant select on public.marketplace_public_roster to anon, authenticated;
