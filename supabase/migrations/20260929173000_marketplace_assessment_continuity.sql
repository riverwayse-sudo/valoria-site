-- VALU completion is the marketplace entry point.
-- General discovery is separate from capability-level governance.
-- Historical and new assessed professionals converge on the same roster.

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

  select pp.*, u.user_type as account_user_type
  into p
  from public.professional_profiles pp
  left join public.users u on u.id=pp.id
  where pp.id=p_professional_id;

  if p.id is null or coalesce(p.is_test,false) or coalesce(p.account_user_type,'professional') <> 'professional' then return; end if;

  assessment_ok := private.valu_assessment_is_current(p_professional_id);

  select exists(
    select 1 from public.professional_listing_events e
    where e.professional_id=p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_professional_id)
  ) into is_revoked;

  if assessment_ok and p.visibility='public' and p.listing_status='listed' and not is_revoked then
    caps := array(
      select distinct case when lower(x)='candidate' then 'talent' else lower(x) end
      from unnest(coalesce(p.active_tracks,'{}'::text[])) x
      where lower(x) in ('talent','candidate','speaker','facilitator')
    );

    if cardinality(caps)=0 then caps := array['talent']::text[]; end if;
    caps := array(
      select x from unnest(caps) x
      order by case x when 'talent' then 1 when 'speaker' then 2 when 'facilitator' then 3 else 9 end
    );

    insert into public.marketplace_public_roster(
      professional_id,full_name,bio,location,languages,headline,current_job_title,
      capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,
      topics,programme_types,availability,valu_index,cluster_scores,designation,
      fee_range,salary_expectation,availability_status,projection_refreshed_at
    )
    values(
      p.id,p.display_name,p.bio,p.location,p.languages,p.headline,p.current_job_title,
      caps[1],
      case when 'talent'=any(caps) then 'candidate' when 'speaker'=any(caps) then 'speaker' when 'facilitator'=any(caps) then 'facilitator' else null end,
      caps,
      p.atb_id,p.display_initials,p.photo_url,p.industry,p.skills,p.topics,
      p.programme_types,p.availability,p.valu_index,p.cluster_scores,p.designation,
      p.fee_range,p.salary_expectation,p.availability_status,now()
    );
  end if;
end;
$function$;

do $backfill$
declare r record;
begin
  for r in
    select distinct va.user_id
    from public.valu_assessments va
    join public.professional_profiles p on p.id=va.user_id
    left join public.users u on u.id=p.id
    where va.completed_at is not null and coalesce(u.user_type,'professional')='professional'
  loop
    perform private.sync_professional_listing_status(r.user_id);
    perform public.refresh_marketplace_public_roster(r.user_id);
  end loop;
end;
$backfill$;

delete from public.marketplace_public_roster r
using public.users u
where r.professional_id=u.id and u.user_type <> 'professional';
