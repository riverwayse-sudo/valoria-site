-- Security hardening for journey/re-entry tables and event timestamp function.

drop policy if exists valoria_journey_events_owner_read on public.valoria_journey_events;
create policy valoria_journey_events_owner_read
on public.valoria_journey_events for select to authenticated
using ((select auth.uid()) = user_id or public.is_valoria_admin());

drop policy if exists valoria_journey_events_owner_insert on public.valoria_journey_events;
create policy valoria_journey_events_owner_insert
on public.valoria_journey_events for insert to authenticated
with check ((select auth.uid()) = user_id or public.is_valoria_admin());

drop policy if exists valoria_reentry_links_admin_read on public.valoria_reentry_links;
create policy valoria_reentry_links_admin_read
on public.valoria_reentry_links for select to authenticated
using (public.is_valoria_admin());

create or replace function public.set_professional_event_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
