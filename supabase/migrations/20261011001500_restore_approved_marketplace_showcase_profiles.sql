-- Restore the five explicitly retained, assessment-qualified marketplace showcase profiles.
-- Keep them marked as test fixtures; approve public projection separately so ordinary
-- test accounts remain blocked from the public roster by default.

create table if not exists private.marketplace_showcase_approvals (
  professional_id uuid primary key references public.professional_profiles(id) on delete cascade,
  approval_reason text not null,
  approved_at timestamptz not null default now()
);

alter table private.marketplace_showcase_approvals enable row level security;
revoke all on table private.marketplace_showcase_approvals from public, anon, authenticated;

insert into private.marketplace_showcase_approvals (professional_id, approval_reason)
select p.id,
       'Approved showcase fixture: public listing retained by explicit marketplace requirement'
from public.professional_profiles p
where p.is_test is true
  and p.listing_status = 'listed'
  and p.eligible_for_listing is true
  and p.visibility = 'public'
  and exists (
    select 1
    from public.valu_assessments a
    where a.user_id = p.id
      and a.completed_at is not null
      and coalesce(a.total_score, 0) >= 35
      and (a.expires_at is null or a.expires_at > now())
  )
on conflict (professional_id) do update
set approval_reason = excluded.approval_reason,
    approved_at = now();

create or replace function private.prevent_test_profiles_from_public_roster()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.professional_profiles pp
    where pp.id = new.professional_id
      and pp.is_test is true
      and not exists (
        select 1
        from private.marketplace_showcase_approvals a
        where a.professional_id = new.professional_id
      )
  ) then
    return null;
  end if;

  return new;
end;
$function$;

-- Rebuild the public projection for approved showcase fixtures. The canonical
-- roster refresh still enforces current full-assessment validity and public listing state.
do $function$
declare
  p record;
begin
  for p in
    select a.professional_id
    from private.marketplace_showcase_approvals a
    join public.professional_profiles pp on pp.id = a.professional_id
    where pp.is_test is true
      and pp.listing_status = 'listed'
      and pp.eligible_for_listing is true
      and pp.visibility = 'public'
      and exists (
        select 1
        from public.valu_assessments v
        where v.user_id = pp.id
          and v.completed_at is not null
          and coalesce(v.total_score, 0) >= 35
          and (v.expires_at is null or v.expires_at > now())
      )
  loop
    perform public.refresh_marketplace_public_roster(p.professional_id);
  end loop;
end;
$function$;
