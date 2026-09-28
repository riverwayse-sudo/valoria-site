-- Phase 1: canonical marketplace projection and lifecycle alignment
-- Public marketplace reads a dedicated, RLS-protected projection instead of a SECURITY DEFINER view.

drop view if exists public.marketplace_public_roster;

create table if not exists public.marketplace_public_roster (
  professional_id uuid primary key references public.professional_profiles(id) on delete cascade,
  full_name text,
  bio text,
  location text,
  languages text[],
  headline text,
  current_job_title text,
  capability text,
  track text,
  capabilities text[] not null default '{}',
  atb_id text,
  display_initials text,
  photo_url text,
  industry text,
  skills text[],
  topics text[],
  programme_types text[],
  availability text[],
  valu_index integer,
  cluster_scores jsonb,
  designation text,
  fee_range text,
  salary_expectation text,
  availability_status text,
  projection_refreshed_at timestamptz not null default now()
);

alter table public.marketplace_public_roster enable row level security;
revoke all on table public.marketplace_public_roster from anon, authenticated;
grant select on table public.marketplace_public_roster to anon, authenticated;

drop policy if exists marketplace_public_read on public.marketplace_public_roster;
create policy marketplace_public_read
on public.marketplace_public_roster
for select
to anon, authenticated
using (true);

create or replace function public.refresh_marketplace_public_roster(p_professional_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
  caps text[];
  is_revoked boolean := false;
begin
  delete from public.marketplace_public_roster
  where professional_id = p_professional_id;

  select * into p
  from public.professional_profiles
  where id = p_professional_id;

  if p.id is null then
    return;
  end if;

  select array_agg(pc.capability order by
    case pc.capability
      when 'talent' then 1
      when 'speaker' then 2
      when 'facilitator' then 3
      else 9
    end
  )
  into caps
  from public.professional_capabilities pc
  where pc.professional_id = p_professional_id
    and pc.is_active = true
    and pc.eligibility_status = 'listed'
    and pc.eligible_for_listing = true;

  select exists (
    select 1
    from public.professional_listing_events e
    where e.professional_id = p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at = (
        select max(e2.created_at)
        from public.professional_listing_events e2
        where e2.professional_id = p_professional_id
      )
  ) into is_revoked;

  if coalesce(p.profile_complete,false)
     and p.visibility = 'public'
     and p.listing_status = 'listed'
     and cardinality(coalesce(caps,'{}'::text[])) > 0
     and not is_revoked
  then
    insert into public.marketplace_public_roster (
      professional_id,full_name,bio,location,languages,headline,current_job_title,
      capability,track,capabilities,atb_id,display_initials,photo_url,industry,
      skills,topics,programme_types,availability,valu_index,cluster_scores,
      designation,fee_range,salary_expectation,availability_status,projection_refreshed_at
    )
    values (
      p.id,p.display_name,p.bio,p.location,p.languages,p.headline,p.current_job_title,
      caps[1],
      case
        when 'talent' = any(caps) then 'candidate'
        when 'speaker' = any(caps) then 'speaker'
        when 'facilitator' = any(caps) then 'facilitator'
        else null
      end,
      caps,p.atb_id,p.display_initials,p.photo_url,p.industry,p.skills,p.topics,
      p.programme_types,p.availability,p.valu_index,p.cluster_scores,p.designation,
      p.fee_range,p.salary_expectation,p.availability_status,now()
    );
  end if;
end;
$$;

revoke all on function public.refresh_marketplace_public_roster(uuid) from public, anon, authenticated;

create or replace function public.refresh_marketplace_public_roster_trigger()
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

  perform public.refresh_marketplace_public_roster(v_professional_id);
  return coalesce(new, old);
end;
$$;

revoke all on function public.refresh_marketplace_public_roster_trigger() from public, anon, authenticated;

drop trigger if exists marketplace_roster_profile_sync on public.professional_profiles;
create trigger marketplace_roster_profile_sync
after insert or update or delete on public.professional_profiles
for each row execute function public.refresh_marketplace_public_roster_trigger();

drop trigger if exists marketplace_roster_capability_sync on public.professional_capabilities;
create trigger marketplace_roster_capability_sync
after insert or update or delete on public.professional_capabilities
for each row execute function public.refresh_marketplace_public_roster_trigger();

drop trigger if exists marketplace_roster_listing_event_sync on public.professional_listing_events;
create trigger marketplace_roster_listing_event_sync
after insert or update or delete on public.professional_listing_events
for each row execute function public.refresh_marketplace_public_roster_trigger();

truncate table public.marketplace_public_roster;
do $$
declare r record;
begin
  for r in select id from public.professional_profiles loop
    perform public.refresh_marketplace_public_roster(r.id);
  end loop;
end $$;

create or replace function public.refresh_professional_journey(p_user_id uuid)
returns public.professional_journey
language plpgsql
security definer
set search_path = public
as $$
declare
  a record;
  p record;
  cap_count integer := 0;
  evidence_count integer := 0;
  eligible_count integer := 0;
  v_state text := 'registered';
  v_eligibility text := 'not_started';
  v_profile_ready boolean := false;
  v_capability_selected boolean := false;
  v_evidence_submitted boolean := false;
  v_marketplace_ready boolean := false;
  result_row public.professional_journey;
begin
  select * into a
  from public.valu_assessments
  where user_id = p_user_id and completed_at is not null
  order by completed_at desc
  limit 1;

  select * into p
  from public.professional_profiles
  where id = p_user_id;

  select count(*) into cap_count
  from public.professional_capabilities
  where professional_id = p_user_id and is_active = true;

  select count(*) into evidence_count
  from public.professional_documents
  where professional_id = p_user_id and verification_status in ('verified','pending');

  select count(*) into eligible_count
  from public.professional_capabilities
  where professional_id = p_user_id
    and is_active = true
    and eligible_for_listing = true
    and eligibility_status = 'listed';

  v_profile_ready := coalesce(p.profile_complete,false)
    or (p.id is not null and p.display_name is not null and p.current_job_title is not null);
  v_capability_selected := cap_count > 0;
  v_evidence_submitted := evidence_count > 0;

  v_marketplace_ready := eligible_count > 0
    and coalesce(p.profile_complete,false)
    and p.visibility = 'public'
    and p.listing_status = 'listed'
    and not exists (
      select 1
      from public.professional_listing_events e
      where e.professional_id=p_user_id
        and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
        and e.created_at=(
          select max(e2.created_at)
          from public.professional_listing_events e2
          where e2.professional_id=p_user_id
        )
    );

  if v_marketplace_ready then
    v_state := 'listed';
    v_eligibility := 'eligible';
  elsif eligible_count > 0 then
    v_state := 'eligible';
    v_eligibility := 'eligible';
  elsif exists (
    select 1 from public.professional_capabilities
    where professional_id=p_user_id and is_active=true and eligibility_status='pending'
  ) then
    v_state := 'eligibility_review';
    v_eligibility := 'pending';
  elsif v_evidence_submitted then
    v_state := 'evidence_submitted';
    v_eligibility := 'pending';
  elsif v_capability_selected then
    v_state := 'capability_selected';
  elsif v_profile_ready then
    v_state := 'profile_ready';
  elsif a.id is not null then
    v_state := 'assessed';
  elsif p.id is not null then
    v_state := 'profile_started';
  end if;

  insert into public.professional_journey (
    user_id,lifecycle_state,current_assessment_id,profile_ready,capability_selected,
    evidence_submitted,eligibility_state,marketplace_ready,last_evaluated_at,updated_at
  ) values (
    p_user_id,v_state,a.id,v_profile_ready,v_capability_selected,
    v_evidence_submitted,v_eligibility,v_marketplace_ready,now(),now()
  )
  on conflict (user_id) do update set
    lifecycle_state=excluded.lifecycle_state,
    current_assessment_id=excluded.current_assessment_id,
    profile_ready=excluded.profile_ready,
    capability_selected=excluded.capability_selected,
    evidence_submitted=excluded.evidence_submitted,
    eligibility_state=excluded.eligibility_state,
    marketplace_ready=excluded.marketplace_ready,
    last_evaluated_at=now(),
    updated_at=now()
  returning * into result_row;

  return result_row;
end $$;

revoke all on function public.refresh_professional_journey(uuid) from public, anon, authenticated;
grant execute on function public.refresh_professional_journey(uuid) to service_role;

do $$
declare r record;
begin
  for r in select user_id from public.professional_journey loop
    perform public.refresh_professional_journey(r.user_id);
  end loop;
end $$;
