-- Keep test/fixture professional profiles out of the public marketplace projection.
-- Existing test accounts remain intact for internal QA; only their public roster
-- projection is suppressed. The guard also protects future refreshes and status changes.

create or replace function public.guard_marketplace_public_roster_test_profiles()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if exists (
    select 1
      from public.professional_profiles pp
     where pp.id = new.professional_id
       and pp.is_test is true
  ) then
    return null;
  end if;
  return new;
end;
$function$;

revoke all on function public.guard_marketplace_public_roster_test_profiles() from public, anon, authenticated;
grant execute on function public.guard_marketplace_public_roster_test_profiles() to service_role;

drop trigger if exists trg_guard_marketplace_public_roster_test_profiles
  on public.marketplace_public_roster;
create trigger trg_guard_marketplace_public_roster_test_profiles
before insert or update of professional_id on public.marketplace_public_roster
for each row
execute function public.guard_marketplace_public_roster_test_profiles();

drop trigger if exists trg_refresh_marketplace_roster_test_status
  on public.professional_profiles;
create trigger trg_refresh_marketplace_roster_test_status
after insert or update of is_test on public.professional_profiles
for each row
execute function public.refresh_marketplace_public_roster_trigger();

delete from public.marketplace_public_roster r
using public.professional_profiles pp
where pp.id = r.professional_id
  and pp.is_test is true;
