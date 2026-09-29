-- VALU completion is the marketplace entry point.
-- Profile completeness and capability eligibility unlock deeper access; they do not
-- determine whether a completed-assessment professional appears in the marketplace.

create or replace function private.sync_professional_listing_status(p_professional_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  p record;
  assessment_ok boolean := false;
  blocked boolean := false;
  next_status text;
begin
  select * into p from public.professional_profiles where id=p_professional_id for update;
  if not found then
    return jsonb_build_object('ok',false,'professional_id',p_professional_id);
  end if;

  assessment_ok := private.valu_assessment_is_current(p_professional_id);

  select exists(
    select 1
    from public.professional_listing_events e
    where e.professional_id=p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at=(
        select max(e2.created_at)
        from public.professional_listing_events e2
        where e2.professional_id=p_professional_id
      )
  ) into blocked;

  if assessment_ok and not blocked then
    next_status := 'listed';
  elsif p.listing_status='listed' then
    next_status := 'unlisted';
  else
    next_status := p.listing_status;
  end if;

  update public.professional_profiles
  set eligible_for_listing=(next_status='listed'),
      listing_status=next_status,
      visibility=case
        when next_status='listed' then 'public'
        when next_status='unlisted' and visibility='public' then 'registered_only'
        else visibility
      end,
      listed_at=case
        when next_status='listed' and listed_at is null then now()
        when next_status<>'listed' then null
        else listed_at
      end,
      updated_at=now()
  where id=p_professional_id;

  return jsonb_build_object(
    'ok',true,
    'eligible_for_listing',(next_status='listed'),
    'listing_status',next_status,
    'full_assessment_complete',assessment_ok,
    'blocked',blocked
  );
end;
$function$;

create or replace function public.refresh_marketplace_public_roster(p_professional_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  p record;
  caps text[];
  is_revoked boolean := false;
  assessment_ok boolean := false;
begin
  delete from public.marketplace_public_roster where professional_id=p_professional_id;

  select * into p from public.professional_profiles where id=p_professional_id;
  if p.id is null or coalesce(p.is_test,false) then return; end if;

  assessment_ok := private.valu_assessment_is_current(p_professional_id);

  select array_agg(pc.capability order by case pc.capability
    when 'talent' then 1 when 'speaker' then 2 when 'facilitator' then 3 else 9 end)
  into caps
  from public.professional_capabilities pc
  where pc.professional_id=p_professional_id
    and pc.is_active=true
    and pc.eligibility_status='listed'
    and pc.eligible_for_listing=true;

  select exists(
    select 1 from public.professional_listing_events e
    where e.professional_id=p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_professional_id)
  ) into is_revoked;

  if assessment_ok and p.visibility='public' and p.listing_status='listed' and not is_revoked then
    insert into public.marketplace_public_roster(
      professional_id,full_name,bio,location,languages,headline,current_job_title,
      capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,
      topics,programme_types,availability,valu_index,cluster_scores,designation,
      fee_range,salary_expectation,availability_status,projection_refreshed_at
    )
    values(
      p.id,p.display_name,p.bio,p.location,p.languages,p.headline,p.current_job_title,
      caps[1],
      case
        when 'talent'=any(coalesce(caps,'{}'::text[])) then 'candidate'
        when 'speaker'=any(coalesce(caps,'{}'::text[])) then 'speaker'
        when 'facilitator'=any(coalesce(caps,'{}'::text[])) then 'facilitator'
        else null
      end,
      coalesce(caps,'{}'::text[]),
      p.atb_id,p.display_initials,p.photo_url,p.industry,p.skills,p.topics,
      p.programme_types,p.availability,p.valu_index,p.cluster_scores,p.designation,
      p.fee_range,p.salary_expectation,p.availability_status,now()
    );
  end if;
end;
$function$;

drop trigger if exists trg_valu_assessments_sync_listing on public.valu_assessments;
create trigger trg_valu_assessments_sync_listing
after insert or update of completed_at,total_score,expires_at,user_id
on public.valu_assessments
for each row
execute function public.refresh_marketplace_public_roster_trigger();

do $backfill$
declare r record;
begin
  for r in
    select distinct va.user_id
    from public.valu_assessments va
    join public.professional_profiles p on p.id=va.user_id
    where va.completed_at is not null
  loop
    perform private.sync_professional_listing_status(r.user_id);
    perform public.refresh_marketplace_public_roster(r.user_id);
  end loop;
end;
$backfill$;