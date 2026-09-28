-- Fix the generic journey trigger: professional_profiles uses id, while
-- capability/document tables use professional_id.
create or replace function public.refresh_journey_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_professional_id uuid;
begin
  if tg_table_name = 'professional_profiles' then
    v_professional_id := coalesce(new.id, old.id);
  else
    v_professional_id := coalesce(new.professional_id, old.professional_id);
  end if;
  perform public.refresh_professional_journey(v_professional_id);
  return coalesce(new, old);
end;
$$;

revoke all on function public.refresh_journey_trigger() from public, anon, authenticated;
grant execute on function public.refresh_journey_trigger() to service_role;
