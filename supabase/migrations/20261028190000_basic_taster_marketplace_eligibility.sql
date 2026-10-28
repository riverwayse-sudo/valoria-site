-- Basic marketplace access begins when an authenticated professional completes the 15-question taster.
-- Full VALU completion remains the only source of a full VALU Index and merit tier.
-- Preserve admin suspension/revocation and exclude test profiles.

create or replace function private.sync_professional_listing_status(p_professional_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  p record;
  assessment_ok boolean := false;
  basic_taster_ok boolean := false;
  blocked boolean := false;
  next_status text;
begin
  select *
    into p
    from public.professional_profiles
   where id = p_professional_id
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'professional_id', p_professional_id);
  end if;

  assessment_ok := private.valu_assessment_is_current(p_professional_id);

  basic_taster_ok :=
    coalesce(p.is_test, false) = false
    and exists (
      select 1
        from public.taster_sessions t
       where t.user_id = p_professional_id
         and t.completed_at is not null
    );

  select exists (
    select 1
      from public.professional_listing_events e
     where e.professional_id = p_professional_id
       and e.event_type in ('ADMIN_REVOKED', 'ADMIN_SUSPENDED')
       and e.created_at = (
         select max(e2.created_at)
           from public.professional_listing_events e2
          where e2.professional_id = p_professional_id
       )
  )
  into blocked;

  if (assessment_ok or basic_taster_ok) and not blocked then
    next_status := 'listed';
  elsif p.listing_status = 'listed' then
    next_status := 'unlisted';
  else
    next_status := p.listing_status;
  end if;

  update public.professional_profiles
     set eligible_for_listing = (next_status = 'listed'),
         listing_status = next_status,
         visibility = case
           when next_status = 'listed' then 'public'
           when next_status = 'unlisted' and visibility = 'public' then 'registered_only'
           else visibility
         end,
         listed_at = case
           when next_status = 'listed' and listed_at is null then now()
           when next_status <> 'listed' then null
           else listed_at
         end,
         updated_at = now()
   where id = p_professional_id;

  return jsonb_build_object(
    'ok', true,
    'eligible_for_listing', (next_status = 'listed'),
    'listing_status', next_status,
    'full_assessment_complete', assessment_ok,
    'basic_taster_complete', basic_taster_ok,
    'blocked', blocked
  );
end;
$function$;

create or replace function public.refresh_taster_marketplace_roster()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  target_user_id uuid;
begin
  target_user_id := coalesce(new.user_id, old.user_id);

  if target_user_id is not null then
    -- Sync eligibility first so the roster projection sees the updated Basic/Full state.
    perform private.sync_professional_listing_status(target_user_id);
    perform public.refresh_marketplace_public_roster(target_user_id);
  end if;

  return new;
end;
$function$;
