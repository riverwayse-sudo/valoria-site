begin;

-- Homepage registry rendering must use the same canonical public roster as /marketplace.
-- This prevents admins/private profiles from inflating the homepage count and keeps
-- the rendered cards and count on one source of truth.

create or replace function public.get_homepage_professional_count()
returns bigint
language sql
stable
set search_path = public
as $function$
  select count(distinct r.professional_id)::bigint
  from public.marketplace_public_roster r;
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
  order by r.valu_index desc nulls last, r.atb_id
  limit 24;
$function$;

commit;