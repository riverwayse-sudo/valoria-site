-- Phase 2: opportunity ecosystem — invitations, employer application access and lifecycle.
create table if not exists public.opportunity_invites (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'invited' check (status in ('invited','accepted','declined','expired')),
  note text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(opportunity_id,professional_id)
);
create index if not exists opportunity_invites_professional_idx on public.opportunity_invites(professional_id,status);
create index if not exists opportunity_invites_opportunity_idx on public.opportunity_invites(opportunity_id,status);
alter table public.opportunity_invites enable row level security;
revoke all on table public.opportunity_invites from anon,authenticated;
grant select,update on table public.opportunity_invites to authenticated;
drop policy if exists opportunity_invites_professional_read on public.opportunity_invites;
create policy opportunity_invites_professional_read on public.opportunity_invites for select to authenticated using (professional_id=(select auth.uid()) or is_valoria_admin());
drop policy if exists opportunity_invites_professional_update on public.opportunity_invites;
create policy opportunity_invites_professional_update on public.opportunity_invites for update to authenticated using (professional_id=(select auth.uid()) or is_valoria_admin()) with check (professional_id=(select auth.uid()) or is_valoria_admin());
drop policy if exists opportunity_invites_employer_read on public.opportunity_invites;
create policy opportunity_invites_employer_read on public.opportunity_invites for select to authenticated using (exists (select 1 from public.opportunities o where o.id=opportunity_invites.opportunity_id and (o.created_by=(select auth.uid()) or o.employer_id=(select auth.uid()))) or is_valoria_admin());
drop policy if exists opportunity_application_professional_insert on public.opportunity_applications;
create policy opportunity_application_professional_insert on public.opportunity_applications for insert to authenticated with check (professional_id=(select auth.uid()));
drop policy if exists opportunity_application_professional_read on public.opportunity_applications;
create policy opportunity_application_professional_read on public.opportunity_applications for select to authenticated using (professional_id=(select auth.uid()) or is_valoria_admin());
drop policy if exists opportunity_application_employer_read on public.opportunity_applications;
create policy opportunity_application_employer_read on public.opportunity_applications for select to authenticated using (exists (select 1 from public.opportunities o where o.id=opportunity_applications.opportunity_id and (o.employer_id=(select auth.uid()) or o.created_by=(select auth.uid()))) or is_valoria_admin());
drop policy if exists opportunity_application_employer_update on public.opportunity_applications;
create policy opportunity_application_employer_update on public.opportunity_applications for update to authenticated using (exists (select 1 from public.opportunities o where o.id=opportunity_applications.opportunity_id and (o.employer_id=(select auth.uid()) or o.created_by=(select auth.uid()))) or is_valoria_admin()) with check (exists (select 1 from public.opportunities o where o.id=opportunity_applications.opportunity_id and (o.employer_id=(select auth.uid()) or o.created_by=(select auth.uid()))) or is_valoria_admin());
drop policy if exists employer_opportunity_owner on public.opportunities;
create policy employer_opportunity_owner on public.opportunities for all to authenticated using (employer_id=(select auth.uid()) or created_by=(select auth.uid()) or is_valoria_admin()) with check (employer_id=(select auth.uid()) or created_by=(select auth.uid()) or is_valoria_admin());
create or replace function public.set_opportunity_invite_response_timestamp() returns trigger language plpgsql set search_path=public as $$ begin if new.status in ('accepted','declined') and old.status is distinct from new.status then new.responded_at=now(); end if; return new; end $$;
revoke all on function public.set_opportunity_invite_response_timestamp() from public,anon,authenticated;
drop trigger if exists opportunity_invite_response_timestamp on public.opportunity_invites;
create trigger opportunity_invite_response_timestamp before update on public.opportunity_invites for each row execute function public.set_opportunity_invite_response_timestamp();
