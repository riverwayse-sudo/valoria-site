-- Ensure completed VALU assessments inherit ownership from the linked taster.
-- This closes the race where the assessment is submitted with user_id null
-- even though the taster has already been linked to an account.

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
