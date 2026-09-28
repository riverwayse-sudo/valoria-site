-- Phase 1 data invariant: an incomplete professional profile cannot remain
-- publicly listed. The founder profile is also kept out of marketplace discovery.
update public.professional_profiles
set listing_status='unlisted',
    eligible_for_listing=false,
    listed_at=null,
    visibility=case when visibility='public' then 'registered_only' else visibility end,
    updated_at=now()
where profile_complete=false
  and listing_status='listed';

update public.professional_profiles
set listing_status='unlisted',
    eligible_for_listing=false,
    listed_at=null,
    visibility=case when visibility='public' then 'registered_only' else visibility end,
    updated_at=now()
where atb_id='ATB-C-OAA-00157';

do $$
declare r record;
begin
  for r in select id from public.professional_profiles loop
    perform private.sync_professional_listing_status(r.id);
  end loop;
end $$;
