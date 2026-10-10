-- Separate marketplace presence/access from full capability eligibility.
-- Basic: taster-completed presence; no official VALU Index tier.
-- Full: completed current VALU assessment; official score and merit tier.
-- Capability eligibility remains a separate governance gate.

alter table public.professional_profiles
  add column if not exists marketplace_access_level text not null default 'basic'
    check (marketplace_access_level in ('basic','full')),
  add column if not exists valu_tier text;

create index if not exists professional_profiles_marketplace_access_idx
  on public.professional_profiles(marketplace_access_level);

create or replace function public.sync_valu_marketplace_semantics()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  v_full_completed boolean := false;
  v_score numeric;
begin
  if new.user_id is null then return new; end if;
  v_full_completed := new.completed_at is not null;
  v_score := new.total_score;

  update public.professional_profiles
  set marketplace_access_level = case when v_full_completed then 'full' else 'basic' end,
      valu_tier = case
        when not v_full_completed or v_score is null or v_score < 55 then null
        when v_score >= 90 then 'Elite'
        when v_score >= 75 then 'Distinguished'
        when v_score >= 55 then 'Proficient'
        else null
      end,
      updated_at = now()
  where id = new.user_id;

  return new;
end;
$function$;

drop trigger if exists trg_sync_valu_marketplace_semantics on public.valu_assessments;
create trigger trg_sync_valu_marketplace_semantics
after insert or update of completed_at,total_score,user_id
on public.valu_assessments
for each row execute function public.sync_valu_marketplace_semantics();

create or replace function public.link_taster_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_id uuid;
begin
  if new.user_id is null then return new; end if;
  p_id := new.user_id;

  insert into public.professional_profiles (
    id, display_name, headline, listing_status, profile_complete, visibility,
    active_tracks, eligible_for_listing, availability_status,
    marketplace_access_level, valu_tier, created_at, updated_at
  )
  values (
    p_id, nullif(trim(new.name),''), nullif(trim(new.role),''),
    'listed', false, 'public', array['candidate']::text[], false, 'available',
    'basic', null, now(), now()
  )
  on conflict (id) do update set
    display_name = coalesce(public.professional_profiles.display_name, excluded.display_name),
    headline = coalesce(public.professional_profiles.headline, excluded.headline),
    marketplace_access_level = case
      when public.professional_profiles.marketplace_access_level = 'full' then 'full'
      else 'basic'
    end,
    listing_status = case
      when public.professional_profiles.listing_status in ('revoked','suspended')
        then public.professional_profiles.listing_status
      else 'listed'
    end,
    visibility = case
      when public.professional_profiles.listing_status in ('revoked','suspended')
        then public.professional_profiles.visibility
      else 'public'
    end,
    profile_complete = false,
    updated_at = now();

  new.linked_at := coalesce(new.linked_at, now());
  return new;
end;
$$;

update public.professional_profiles p
set marketplace_access_level = case
      when exists (
        select 1 from public.valu_assessments v
        where v.user_id=p.id and v.completed_at is not null
      ) then 'full' else 'basic'
    end,
    valu_tier = (
      select case
        when v.total_score >= 90 then 'Elite'
        when v.total_score >= 75 then 'Distinguished'
        when v.total_score >= 55 then 'Proficient'
        else null
      end
      from public.valu_assessments v
      where v.user_id=p.id and v.completed_at is not null
      order by v.completed_at desc
      limit 1
    );
