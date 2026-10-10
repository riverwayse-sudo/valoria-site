begin;

-- Public homepage quality standard: keep genuine participant records intact,
-- but do not promote incomplete or known placeholder profiles on the homepage.
-- The same predicate is used for the count and preview list so the number
-- shown always matches the quality-approved homepage roster.

create or replace function public.get_homepage_professional_count()
returns bigint
language sql
stable
set search_path = public
as $function$
  select count(distinct r.professional_id)::bigint
  from public.marketplace_public_roster r
  where r.headline is not null
    and length(btrim(r.headline)) >= 12
    and lower(btrim(r.headline)) not in (
      'model',
      'growth dev',
      'valoria professional',
      'help people find meaning in their life and career'
    )
    and r.atb_id not in (
      'ATB-C-SAA-00179',
      'ATB-C-OAA-00157',
      'ATB-C-TAA-00177',
      'ATB-68A5E7D8',
      'ATB-C-𝙾𝙴𝙾-00387'
    );
$function$;

create or replace function public.get_homepage_professional_previews()
returns table(
  id uuid,
  atb_id text,
  display_initials text,
  headline text,
  photo_url text,
  active_tracks text[],
  valu_index integer,
  listing_track text
)
language sql
stable
set search_path = public
as $function$
  select
    r.professional_id,
    r.atb_id,
    r.display_initials,
    r.headline,
    r.photo_url,
    r.capabilities as active_tracks,
    r.valu_index,
    r.track as listing_track
  from public.marketplace_public_roster r
  where r.headline is not null
    and length(btrim(r.headline)) >= 12
    and lower(btrim(r.headline)) not in (
      'model',
      'growth dev',
      'valoria professional',
      'help people find meaning in their life and career'
    )
    and r.atb_id not in (
      'ATB-C-SAA-00179',
      'ATB-C-OAA-00157',
      'ATB-C-TAA-00177',
      'ATB-68A5E7D8',
      'ATB-C-𝙾𝙴𝙾-00387'
    )
  order by r.valu_index desc nulls last, r.atb_id
  limit 24;
$function$;

commit;
