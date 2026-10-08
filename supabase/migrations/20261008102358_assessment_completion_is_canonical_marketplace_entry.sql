-- Canonical marketplace entry rule:
-- completion of the full VALU assessment creates public marketplace presence.
-- Profile completeness, avatar completion, and capability enrichment do not gate entry.

create or replace function public.enforce_assessment_marketplace_presence()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  v_professional_id uuid;
begin
  v_professional_id := coalesce(new.user_id, old.user_id);

  if v_professional_id is null then
    return coalesce(new, old);
  end if;

  if coalesce(new.completed_at, old.completed_at) is not null then
    perform private.sync_professional_listing_status(v_professional_id);
    perform public.refresh_marketplace_public_roster(v_professional_id);
  end if;

  return coalesce(new, old);
end;
$function$;

drop trigger if exists trg_zz_assessment_completion_marketplace_presence
on public.valu_assessments;

create trigger trg_zz_assessment_completion_marketplace_presence
after insert or update of completed_at, total_score, expires_at, user_id
on public.valu_assessments
for each row
execute function public.enforce_assessment_marketplace_presence();

create or replace function public.enforce_profile_marketplace_presence()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $function$
begin
  perform private.sync_professional_listing_status(new.id);
  perform public.refresh_marketplace_public_roster(new.id);
  return new;
end;
$function$;

drop trigger if exists trg_zz_profile_marketplace_presence
on public.professional_profiles;

create trigger trg_zz_profile_marketplace_presence
after insert
on public.professional_profiles
for each row
execute function public.enforce_profile_marketplace_presence();

-- Reconcile existing completed-assessment professionals with the canonical rule.
do $backfill$
declare
  r record;
begin
  for r in
    select distinct va.user_id
    from public.valu_assessments va
    join public.professional_profiles pp on pp.id = va.user_id
    where va.user_id is not null
      and va.completed_at is not null
  loop
    perform private.sync_professional_listing_status(r.user_id);
    perform public.refresh_marketplace_public_roster(r.user_id);
  end loop;
end;
$backfill$;
