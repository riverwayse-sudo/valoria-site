-- Public marketplace clients must not read the roster table directly.
-- This narrowly scoped SECURITY DEFINER RPC returns only fields intended for
-- public professional listings and profile pages. It deliberately omits bio,
-- compensation expectations, and all private contact or account data.

create or replace function public.get_marketplace_public_roster_v1(
  p_professional_id uuid default null,
  p_atb_id text default null
)
returns table (
  professional_id uuid,
  full_name text,
  location text,
  languages text[],
  headline text,
  current_job_title text,
  capability text,
  track text,
  capabilities text[],
  selected_capabilities text[],
  atb_id text,
  display_initials text,
  photo_url text,
  industry text,
  skills text[],
  topics text[],
  programme_types text[],
  availability text[],
  valu_index integer,
  cluster_scores jsonb,
  assessment_summary text,
  designation text,
  availability_status text,
  assessment_access text
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    r.professional_id,
    r.full_name,
    r.location,
    r.languages,
    r.headline,
    r.current_job_title,
    r.capability,
    r.track,
    r.capabilities,
    r.selected_capabilities,
    r.atb_id,
    r.display_initials,
    r.photo_url,
    r.industry,
    r.skills,
    r.topics,
    r.programme_types,
    r.availability,
    r.valu_index,
    r.cluster_scores,
    r.assessment_summary,
    r.designation,
    r.availability_status,
    r.assessment_access
  from public.marketplace_public_roster as r
  where (p_professional_id is null or r.professional_id = p_professional_id)
    and (p_atb_id is null or r.atb_id = p_atb_id)
    and not (p_professional_id is not null and p_atb_id is not null)
  order by r.valu_index desc nulls last, r.full_name asc;
$function$;

revoke all on function public.get_marketplace_public_roster_v1(uuid, text) from public;
grant execute on function public.get_marketplace_public_roster_v1(uuid, text) to anon, authenticated;
