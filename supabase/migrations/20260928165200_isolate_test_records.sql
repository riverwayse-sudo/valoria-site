alter table public.professional_profiles add column if not exists is_test boolean not null default false;
alter table public.opportunities add column if not exists is_test boolean not null default false;
create index if not exists professional_profiles_is_test_idx on public.professional_profiles(is_test);
create index if not exists opportunities_is_test_idx on public.opportunities(is_test);

create or replace function public.refresh_marketplace_public_roster(p_professional_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare p record; caps text[]; is_revoked boolean := false;
begin
  delete from public.marketplace_public_roster where professional_id=p_professional_id;
  select * into p from public.professional_profiles where id=p_professional_id;
  if p.id is null or coalesce(p.is_test,false) then return; end if;
  select array_agg(pc.capability order by case pc.capability when 'talent' then 1 when 'speaker' then 2 when 'facilitator' then 3 else 9 end) into caps
  from public.professional_capabilities pc
  where pc.professional_id=p_professional_id and pc.is_active=true and pc.eligibility_status='listed' and pc.eligible_for_listing=true;
  select exists(select 1 from public.professional_listing_events e where e.professional_id=p_professional_id and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED') and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_professional_id)) into is_revoked;
  if coalesce(p.profile_complete,false) and p.visibility='public' and p.listing_status='listed' and cardinality(coalesce(caps,'{}'::text[]))>0 and not is_revoked then
    insert into public.marketplace_public_roster(professional_id,full_name,bio,location,languages,headline,current_job_title,capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,valu_index,cluster_scores,designation,fee_range,salary_expectation,availability_status,projection_refreshed_at)
    values(p.id,p.display_name,p.bio,p.location,p.languages,p.headline,p.current_job_title,caps[1],
      case when 'talent'=any(caps) then 'candidate' when 'speaker'=any(caps) then 'speaker' when 'facilitator'=any(caps) then 'facilitator' else null end,
      caps,p.atb_id,p.display_initials,p.photo_url,p.industry,p.skills,p.topics,p.programme_types,p.availability,p.valu_index,p.cluster_scores,p.designation,p.fee_range,p.salary_expectation,p.availability_status,now());
  end if;
end $$;
revoke all on function public.refresh_marketplace_public_roster(uuid) from public,anon,authenticated;
do $$ declare r record; begin for r in select id from public.professional_profiles loop perform public.refresh_marketplace_public_roster(r.id); end loop; end $$;
