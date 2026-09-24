-- Marketplace listing is governed by assessment + profile-level listing eligibility.
-- Profile completeness and avatar completion are follow-up requirements, not a reason
-- to hide an otherwise eligible assessed professional from the marketplace.
create or replace view public.marketplace_professionals as
select
  p.id as professional_id,
  p.display_name as full_name,
  p.bio,
  p.location,
  p.languages,
  p.headline,
  case when c.capability = 'talent' then 'candidate' else c.capability end as capability,
  case when c.capability = 'talent' then 'candidate' else c.capability end as track,
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
  p.listing_status,
  c.eligible_for_listing,
  c.listed_at
from public.professional_profiles p
join public.professional_capabilities c
  on c.professional_id = p.id
 and c.is_active = true
 and c.eligible_for_listing = true
 and c.eligibility_status = 'listed'
join lateral (
  select array_agg(
    case when c2.capability = 'talent' then 'candidate' else c2.capability end
    order by case c2.capability
      when 'talent' then 1
      when 'speaker' then 2
      when 'facilitator' then 3
      else 9
    end
  ) as capabilities
  from public.professional_capabilities c2
  where c2.professional_id = p.id
    and c2.is_active = true
    and c2.eligible_for_listing = true
    and c2.eligibility_status = 'listed'
) caps on true
where p.listing_status = 'listed'
  and p.eligible_for_listing = true
  and p.visibility = 'public'
  and p.assessment_completed_at is not null
  and cardinality(coalesce(caps.capabilities, '{}'::text[])) > 0
  and not private.is_professional_listing_blocked(p.id);

-- Reconcile existing assessed/listed talent capabilities with the authoritative
-- profile-level eligibility state so the marketplace cannot undercount them.
update public.professional_capabilities c
set eligible_for_listing = true,
    eligibility_status = 'listed',
    listed_at = coalesce(c.listed_at, now())
from public.professional_profiles p
where c.professional_id = p.id
  and c.is_active = true
  and c.capability = 'talent'
  and p.assessment_completed_at is not null
  and p.listing_status = 'listed'
  and p.eligible_for_listing = true
  and p.visibility = 'public'
  and not private.is_professional_listing_blocked(p.id);
