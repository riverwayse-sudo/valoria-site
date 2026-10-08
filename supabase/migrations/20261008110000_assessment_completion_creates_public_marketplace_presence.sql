create or replace function public.sync_valu_assessment_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $function$
begin
  if new.user_id is null then return new; end if;
  if not exists(select 1 from public.users where id=new.user_id) then return new; end if;

  insert into public.professional_profiles(
    id,display_name,headline,listing_status,profile_complete,visibility,
    active_tracks,eligible_for_listing,availability_status,valu_index,cluster_scores,
    designation,assessment_completed_at,created_at,updated_at
  )
  values(
    new.user_id,
    nullif(trim(new.name),''),
    nullif(trim(new.role),''),
    case when coalesce(new.total_score,0) >= 35 then 'listed' else 'unlisted' end,
    false,
    case when coalesce(new.total_score,0) >= 35 then 'public' else 'registered_only' end,
    array['candidate']::text[],
    coalesce(new.total_score,0) >= 35,
    'available',
    new.total_score,
    new.cluster_scores,
    new.designation,
    new.completed_at,
    now(),
    now()
  )
  on conflict(id) do update set
    valu_index=excluded.valu_index,
    cluster_scores=excluded.cluster_scores,
    designation=excluded.designation,
    assessment_completed_at=excluded.assessment_completed_at,
    listing_status=case when coalesce(excluded.valu_index,0) >= 35 then 'listed' else public.professional_profiles.listing_status end,
    visibility=case when coalesce(excluded.valu_index,0) >= 35 then 'public' else public.professional_profiles.visibility end,
    eligible_for_listing=case when coalesce(excluded.valu_index,0) >= 35 then true else public.professional_profiles.eligible_for_listing end,
    display_name=coalesce(public.professional_profiles.display_name,excluded.display_name),
    headline=coalesce(public.professional_profiles.headline,excluded.headline),
    updated_at=now();

  return new;
end;
$function$;
