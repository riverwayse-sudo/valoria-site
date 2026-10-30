-- Re-evaluate only the existing capability row when evidence changes.
-- This deliberately never creates/reactivates a capability a participant deselected.
create or replace function private.refresh_existing_professional_capability(
  p_professional_id uuid,
  p_capability text
)
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $function$
declare
  capability_row public.professional_capabilities;
  result jsonb;
  eligible boolean;
begin
  select * into capability_row
  from public.professional_capabilities
  where professional_id=p_professional_id
    and capability=case when lower(trim(p_capability))='candidate' then 'talent' else lower(trim(p_capability)) end
  limit 1;

  if not found then return; end if;

  result:=private.evaluate_professional_capability(p_professional_id,capability_row.capability);
  eligible:=coalesce((result->>'eligible')::boolean,false);

  update public.professional_capabilities
  set eligible_for_listing=eligible,
      eligibility_status=case when eligible then 'listed' else 'unlisted' end,
      missing_requirements=coalesce(result->'missing','[]'::jsonb),
      listed_at=case
        when eligible and listed_at is null then now()
        when not eligible then null
        else listed_at
      end,
      updated_at=now()
  where id=capability_row.id;
end;
$function$;

create or replace function private.sync_capability_eligibility_from_document()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'private'
as $function$
declare
  new_capability text;
  old_capability text;
begin
  if tg_op='DELETE' then
    if old.document_type='cv' then
      perform private.refresh_existing_professional_capability(old.professional_id,'talent');
    end if;
    if old.capability_id is not null then
      select capability into old_capability
      from public.professional_capabilities
      where id=old.capability_id;
      if old_capability is not null then
        perform private.refresh_existing_professional_capability(old.professional_id,old_capability);
      end if;
    end if;
    return old;
  end if;

  if new.document_type='cv' then
    perform private.refresh_existing_professional_capability(new.professional_id,'talent');
  end if;

  if new.capability_id is not null then
    select capability into new_capability
    from public.professional_capabilities
    where id=new.capability_id;
    if new_capability is not null then
      perform private.refresh_existing_professional_capability(new.professional_id,new_capability);
    end if;
  end if;

  if tg_op='UPDATE' then
    if old.document_type='cv' and (
      new.document_type is distinct from old.document_type
      or new.storage_path is distinct from old.storage_path
      or new.verification_status is distinct from old.verification_status
    ) then
      perform private.refresh_existing_professional_capability(old.professional_id,'talent');
    end if;

    if old.capability_id is not null and (
      new.capability_id is distinct from old.capability_id
      or new.verification_status is distinct from old.verification_status
      or new.document_type is distinct from old.document_type
    ) then
      select capability into old_capability
      from public.professional_capabilities
      where id=old.capability_id;
      if old_capability is not null then
        perform private.refresh_existing_professional_capability(old.professional_id,old_capability);
      end if;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_sync_capability_eligibility_from_document on public.professional_documents;
create trigger trg_sync_capability_eligibility_from_document
after insert or update or delete on public.professional_documents
for each row execute function private.sync_capability_eligibility_from_document();
