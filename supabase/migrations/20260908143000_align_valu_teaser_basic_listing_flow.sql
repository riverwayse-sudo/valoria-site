-- VALU lifecycle: teaser users are listed immediately at Basic/Incomplete level.
-- The official VALU Index/full profile state still requires the full assessment.

begin;

create or replace function public.enforce_valu_profile_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.listing_status, 'pending') = 'pending' then
      new.listing_status := 'listed';
    end if;
    new.profile_complete := false;
  end if;

  if new.valu_index is null or new.assessment_completed_at is null then
    new.profile_complete := false;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_valu_profile_lifecycle on public.professional_profiles;
create trigger trg_enforce_valu_profile_lifecycle
before insert or update of profile_complete, valu_index, assessment_completed_at
on public.professional_profiles
for each row execute function public.enforce_valu_profile_lifecycle();

create or replace function private.assert_marketplace_listing_invariants(p_professional_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare p record;
begin
  select listing_status, eligible_for_listing, availability_status, visibility,
         valu_index, profile_complete
  into p
  from public.professional_profiles
  where id = p_professional_id;

  if not found then
    raise exception 'professional not found: %', p_professional_id;
  end if;

  if p.eligible_for_listing and coalesce(p.valu_index, 0) < 35 then
    raise exception 'eligibility invariant violated: score below 35';
  end if;

  -- Basic/Incomplete teaser listings are valid. A completed profile must
  -- satisfy the existing readiness/eligibility contract.
  if p.listing_status = 'listed'
     and p.profile_complete
     and not p.eligible_for_listing then
    raise exception 'listing invariant violated: completed listed profile is not eligible';
  end if;

  return;
end;
$$;

commit;
