-- Keep the public marketplace projection in sync with the source records that
-- determine listing visibility. The handler was repaired in 20261029010000,
-- but the repository did not contain durable trigger attachments for these
-- three source tables.
begin;

drop trigger if exists trg_refresh_marketplace_public_roster_profile
  on public.professional_profiles;
create trigger trg_refresh_marketplace_public_roster_profile
after insert or update or delete on public.professional_profiles
for each row
execute function public.refresh_marketplace_public_roster_trigger();

drop trigger if exists trg_refresh_marketplace_public_roster_capability
  on public.professional_capabilities;
create trigger trg_refresh_marketplace_public_roster_capability
after insert or update or delete on public.professional_capabilities
for each row
execute function public.refresh_marketplace_public_roster_trigger();

drop trigger if exists trg_refresh_marketplace_public_roster_listing_event
  on public.professional_listing_events;
create trigger trg_refresh_marketplace_public_roster_listing_event
after insert or update or delete on public.professional_listing_events
for each row
execute function public.refresh_marketplace_public_roster_trigger();

commit;
