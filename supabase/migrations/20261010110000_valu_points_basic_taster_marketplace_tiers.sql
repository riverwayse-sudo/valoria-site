-- VALU Index is expressed as points out of 100.
-- Basic = completed taster; Full = completed authoritative VALU assessment.
-- Basic is marketplace access, not a merit tier.

alter table public.marketplace_public_roster
  add column if not exists assessment_access text not null default 'full';

do $$ begin
  alter table public.marketplace_public_roster
    add constraint marketplace_public_roster_assessment_access_chk
    check (assessment_access in ('basic','full'));
exception when duplicate_object then null;
end $$;

create or replace function public.refresh_marketplace_public_roster(p_professional_id uuid)
returns void language plpgsql security definer set search_path=public as $function$
declare
  p record; caps text[]; is_revoked boolean:=false; assessment_ok boolean:=false; t record;
begin
  delete from public.marketplace_public_roster where professional_id=p_professional_id;

  select pp.*,u.user_type account_user_type into p
  from public.professional_profiles pp left join public.users u on u.id=pp.id
  where pp.id=p_professional_id;

  if p.id is null or coalesce(p.account_user_type,'professional') <> 'professional' then return; end if;

  select exists(
    select 1 from public.professional_listing_events e
    where e.professional_id=p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_professional_id)
  ) into is_revoked;
  if is_revoked then return; end if;

  assessment_ok:=private.valu_assessment_is_current(p_professional_id);

  if assessment_ok and p.visibility='public' and p.listing_status='listed' then
    caps:=array(
      select distinct case when lower(x)='candidate' then 'talent' else lower(x) end
      from unnest(coalesce(p.active_tracks,'{}'::text[])) x
      where lower(x) in ('talent','candidate','speaker','facilitator')
    );
    if cardinality(caps)=0 then caps:=array['talent']::text[]; end if;
    caps:=array(select x from unnest(caps) x order by case x when 'talent' then 1 when 'speaker' then 2 when 'facilitator' then 3 else 9 end);

    insert into public.marketplace_public_roster(
      professional_id,full_name,bio,location,languages,headline,current_job_title,
      capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,
      topics,programme_types,availability,valu_index,cluster_scores,designation,
      fee_range,salary_expectation,availability_status,projection_refreshed_at,assessment_access
    )
    values(
      p.id,p.display_name,p.bio,p.location,p.languages,p.headline,p.current_job_title,
      caps[1],
      case when 'talent'=any(caps) then 'candidate' when 'speaker'=any(caps) then 'speaker' when 'facilitator'=any(caps) then 'facilitator' end,
      caps,p.atb_id,p.display_initials,p.photo_url,p.industry,p.skills,p.topics,
      p.programme_types,p.availability,p.valu_index,p.cluster_scores,p.designation,
      p.fee_range,p.salary_expectation,p.availability_status,now(),'full'
    );
    return;
  end if;

  select * into t from public.taster_sessions
  where user_id=p_professional_id and completed_at is not null
  order by completed_at desc,created_at desc limit 1;

  if t.id is not null and p.listing_status='listed' and p.visibility in ('public','marketplace','registered_only') then
    insert into public.marketplace_public_roster(
      professional_id,full_name,bio,location,languages,headline,current_job_title,
      capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,
      topics,programme_types,availability,valu_index,cluster_scores,designation,
      fee_range,salary_expectation,availability_status,projection_refreshed_at,assessment_access
    )
    values(
      p.id,coalesce(nullif(trim(p.display_name),''),nullif(trim(t.name),'')),null,
      p.location,p.languages,coalesce(nullif(trim(p.headline),''),nullif(trim(t.role),'')),
      p.current_job_title,'talent','candidate',array['talent']::text[],p.atb_id,
      p.display_initials,p.photo_url,p.industry,p.skills,null,p.programme_types,p.availability,
      null,null,'BASIC',p.fee_range,p.salary_expectation,p.availability_status,now(),'basic'
    );
  end if;
end;
$function$;

create or replace function public.refresh_taster_marketplace_roster()
returns trigger language plpgsql security definer set search_path=public as $function$
begin
  perform public.refresh_marketplace_public_roster(coalesce(new.user_id,old.user_id));
  return new;
end;
$function$;

drop trigger if exists trg_refresh_basic_taster_marketplace on public.taster_sessions;
create trigger trg_refresh_basic_taster_marketplace
after insert or update of user_id,completed_at on public.taster_sessions
for each row execute function public.refresh_taster_marketplace_roster();

create or replace function public.link_taster_to_profile()
returns trigger language plpgsql security definer set search_path=public as $function$
declare p_id uuid;
begin
  if new.user_id is null then return new; end if;
  p_id:=new.user_id;

  insert into public.professional_profiles(
    id,display_name,headline,listing_status,profile_complete,visibility,
    active_tracks,eligible_for_listing,availability_status,created_at,updated_at
  )
  values(
    p_id,nullif(trim(new.name),''),nullif(trim(new.role),''),
    case when new.completed_at is not null then 'listed' else 'unlisted' end,
    false,
    case when new.completed_at is not null then 'public' else 'registered_only' end,
    array['candidate']::text[],false,'available',now(),now()
  )
  on conflict(id) do update set
    display_name=coalesce(public.professional_profiles.display_name,excluded.display_name),
    headline=coalesce(public.professional_profiles.headline,excluded.headline),
    listing_status=case
      when public.professional_profiles.listing_status in ('revoked','suspended') then public.professional_profiles.listing_status
      when new.completed_at is not null then 'listed'
      else public.professional_profiles.listing_status
    end,
    visibility=case
      when public.professional_profiles.visibility in ('public','marketplace') then public.professional_profiles.visibility
      when new.completed_at is not null then 'public'
      else public.professional_profiles.visibility
    end,
    updated_at=now();

  new.linked_at:=coalesce(new.linked_at,now());
  return new;
end;
$function$;

revoke all on function public.refresh_marketplace_public_roster(uuid) from public,anon,authenticated;
revoke all on function public.refresh_taster_marketplace_roster() from public,anon,authenticated;
revoke all on function public.link_taster_to_profile() from public,anon,authenticated;
