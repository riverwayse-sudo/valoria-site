-- Phase 5 expansion: coaching, placement cases and opportunity communication.
create table if not exists public.coaching_requests (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  focus text not null,
  goals text,
  preferred_mode text check (preferred_mode in ('remote','onsite','hybrid')),
  status text not null default 'requested' check (status in ('requested','matched','scheduled','active','completed','closed')),
  coach_professional_id uuid references public.professional_profiles(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists coaching_requests_professional_idx on public.coaching_requests(professional_id,status);
create index if not exists coaching_requests_status_idx on public.coaching_requests(status,created_at desc);
create table if not exists public.placement_cases (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  application_id uuid not null unique references public.opportunity_applications(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  employer_id uuid references auth.users(id) on delete set null,
  status text not null default 'sourcing' check (status in ('sourcing','introduced','interview','offer','placed','closed','declined')),
  assigned_admin uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists placement_cases_status_idx on public.placement_cases(status,created_at desc);
create index if not exists placement_cases_professional_idx on public.placement_cases(professional_id,status);
create table if not exists public.opportunity_messages (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  application_id uuid not null references public.opportunity_applications(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists opportunity_messages_application_idx on public.opportunity_messages(application_id,created_at);
create index if not exists opportunity_messages_recipient_idx on public.opportunity_messages(recipient_user_id,read_at);
create table if not exists public.professional_match_preferences (
  professional_id uuid primary key references public.professional_profiles(id) on delete cascade,
  preferred_work_modes text[] not null default '{}',
  preferred_locations text[] not null default '{}',
  preferred_opportunity_types text[] not null default '{}',
  preferred_industries text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.coaching_requests enable row level security;
revoke all on table public.coaching_requests from anon,authenticated;
grant select,insert,update on table public.coaching_requests to authenticated;
create policy coaching_owner_read on public.coaching_requests for select to authenticated using (professional_id=(select auth.uid()) or is_valoria_admin());
create policy coaching_owner_insert on public.coaching_requests for insert to authenticated with check (professional_id=(select auth.uid()));
create policy coaching_owner_update on public.coaching_requests for update to authenticated using (professional_id=(select auth.uid()) or is_valoria_admin()) with check (professional_id=(select auth.uid()) or is_valoria_admin());
alter table public.placement_cases enable row level security;
revoke all on table public.placement_cases from anon,authenticated;
grant select,update on table public.placement_cases to authenticated;
create policy placement_participant_read on public.placement_cases for select to authenticated using (professional_id=(select auth.uid()) or employer_id=(select auth.uid()) or is_valoria_admin());
create policy placement_admin_update on public.placement_cases for update to authenticated using (is_valoria_admin()) with check (is_valoria_admin());
alter table public.opportunity_messages enable row level security;
revoke all on table public.opportunity_messages from anon,authenticated;
grant select,insert,update on table public.opportunity_messages to authenticated;
create policy opportunity_messages_participant_read on public.opportunity_messages for select to authenticated using (sender_user_id=(select auth.uid()) or recipient_user_id=(select auth.uid()) or is_valoria_admin());
create policy opportunity_messages_participant_insert on public.opportunity_messages for insert to authenticated with check (sender_user_id=(select auth.uid()));
create policy opportunity_messages_recipient_update on public.opportunity_messages for update to authenticated using (recipient_user_id=(select auth.uid()) or is_valoria_admin()) with check (recipient_user_id=(select auth.uid()) or is_valoria_admin());
alter table public.professional_match_preferences enable row level security;
revoke all on table public.professional_match_preferences from anon,authenticated;
grant select,insert,update on table public.professional_match_preferences to authenticated;
create policy match_preferences_owner on public.professional_match_preferences for all to authenticated using (professional_id=(select auth.uid()) or is_valoria_admin()) with check (professional_id=(select auth.uid()) or is_valoria_admin());
create or replace function public.set_coaching_request_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function public.set_coaching_request_updated_at() from public,anon,authenticated;
drop trigger if exists coaching_request_updated_at on public.coaching_requests;
create trigger coaching_request_updated_at before update on public.coaching_requests for each row execute function public.set_coaching_request_updated_at();
create or replace function public.set_placement_case_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function public.set_placement_case_updated_at() from public,anon,authenticated;
drop trigger if exists placement_case_updated_at on public.placement_cases;
create trigger placement_case_updated_at before update on public.placement_cases for each row execute function public.set_placement_case_updated_at();
create or replace function public.create_placement_case_on_selection() returns trigger language plpgsql security definer set search_path=public
as $$ declare v_employer uuid; begin if new.status='selected' and old.status is distinct from new.status then select employer_id into v_employer from public.opportunities where id=new.opportunity_id; insert into public.placement_cases(opportunity_id,application_id,professional_id,employer_id,status) values(new.opportunity_id,new.id,new.professional_id,v_employer,'sourcing') on conflict(application_id) do nothing; perform public.create_platform_notification(new.professional_id,'placement_case','Valoria placement','Your application has moved into Valoria placement handling.','/dashboard'); if v_employer is not null then perform public.create_platform_notification(v_employer,'placement_case','Candidate selected','A candidate has been selected for your opportunity.','/employer/dashboard'); end if; end if; return new; end $$;
revoke all on function public.create_placement_case_on_selection() from public,anon,authenticated;
drop trigger if exists placement_case_on_selection on public.opportunity_applications;
create trigger placement_case_on_selection after update on public.opportunity_applications for each row execute function public.create_placement_case_on_selection();
