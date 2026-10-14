-- Make the database itself preserve assessment ownership across the taster-to-account handoff.
-- This is additive and never overwrites an assessment already owned by an account.

create or replace function public.set_valu_assessments_user_id()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.user_id is null and new.taster_id is not null then
    select ts.user_id
      into new.user_id
    from public.taster_sessions ts
    where ts.id = new.taster_id
      and ts.user_id is not null
    limit 1;
  end if;

  if new.user_id is null then
    new.user_id := auth.uid();
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_set_valu_assessments_user_id on public.valu_assessments;
create trigger trg_set_valu_assessments_user_id
before insert or update of user_id, taster_id on public.valu_assessments
for each row execute function public.set_valu_assessments_user_id();

create or replace function public.sync_valu_assessments_from_taster_owner()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  -- Only propagate the first verified account claim. Never transfer rows that
  -- already have an owner, even if an administrative process changes a taster.
  if old.user_id is null and new.user_id is not null then
    update public.valu_assessments
      set user_id = new.user_id
    where taster_id = new.id
      and user_id is null;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_sync_valu_assessments_from_taster_owner on public.taster_sessions;
create trigger trg_sync_valu_assessments_from_taster_owner
after update of user_id on public.taster_sessions
for each row execute function public.sync_valu_assessments_from_taster_owner();

revoke all on function public.set_valu_assessments_user_id() from public, anon, authenticated;
revoke all on function public.sync_valu_assessments_from_taster_owner() from public, anon, authenticated;
