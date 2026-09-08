create or replace function public.link_taster_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_id uuid;
begin
  if new.user_id is null then return new; end if;
  p_id := new.user_id;
  insert into public.professional_profiles (id, display_name, headline, listing_status, profile_complete, visibility, active_tracks, eligible_for_listing, availability_status, created_at, updated_at)
  values (p_id, nullif(trim(new.name),''), nullif(trim(new.role),''), 'listed', false, 'registered_only', array['candidate']::text[], false, 'available', now(), now())
  on conflict (id) do update set
    display_name = coalesce(public.professional_profiles.display_name, excluded.display_name),
    headline = coalesce(public.professional_profiles.headline, excluded.headline),
    listing_status = case when public.professional_profiles.listing_status in ('revoked','suspended') then public.professional_profiles.listing_status else 'listed' end,
    profile_complete = false,
    updated_at = now();
  new.linked_at := coalesce(new.linked_at, now());
  return new;
end;
$$;
