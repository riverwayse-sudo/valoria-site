-- Valoria platform foundation: canonical lifecycle, assessment continuity, opportunities.
create table if not exists public.assessment_identity_links (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.valu_assessments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  link_method text not null default 'email_claim',
  linked_at timestamptz not null default now(),
  linked_by uuid references auth.users(id),
  unique (assessment_id),
  unique (user_id, assessment_id)
);

create table if not exists public.professional_journey (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lifecycle_state text not null default 'registered' check (lifecycle_state in ('registered','assessed','profile_started','profile_ready','capability_selected','evidence_submitted','eligibility_review','eligible','listed')),
  current_assessment_id uuid references public.valu_assessments(id),
  profile_ready boolean not null default false,
  capability_selected boolean not null default false,
  evidence_submitted boolean not null default false,
  eligibility_state text not null default 'not_started' check (eligibility_state in ('not_started','pending','eligible','ineligible','revoked')),
  marketplace_ready boolean not null default false,
  last_evaluated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professional_journey_state_idx on public.professional_journey(lifecycle_state);

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

  select * into p from public.professional_profiles where id = p_user_id;

  select count(*) into cap_count
  from public.professional_capabilities
  where professional_id = p_user_id and is_active = true;

  select count(*) into evidence_count
  from public.professional_documents
  where professional_id = p_user_id and verification_status in ('verified','pending');

  select count(*) into eligible_count
  from public.professional_capabilities
  where professional_id = p_user_id and is_active = true and eligible_for_listing = true;

  v_profile_ready := coalesce(p.profile_complete,false) or (p.id is not null and p.display_name is not null and p.current_job_title is not null);
  v_capability_selected := cap_count > 0;
  v_evidence_submitted := evidence_count > 0;
  v_marketplace_ready := eligible_count > 0;

  if v_marketplace_ready then
    v_state := 'listed';
    v_eligibility := 'eligible';
  elsif eligible_count = 0 and exists (
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

create or replace view public.professional_journey_directory as
select
  j.*,
  p.display_name,
  p.current_job_title,
  p.photo_url,
  p.valu_index,
  p.profile_complete
from public.professional_journey j
left join public.professional_profiles p on p.id=j.user_id;

create table if not exists public.employer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organisation_name text,
  contact_name text,
  website_url text,
  industry text,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  opportunity_type text not null default 'job' check (opportunity_type in ('job','contract','consulting','speaking','facilitation','coaching','project')),
  summary text,
  description text not null,
  organisation_name text not null,
  employer_id uuid references public.employer_profiles(id) on delete set null,
  location text,
  work_mode text check (work_mode is null or work_mode in ('onsite','hybrid','remote')),
  employment_type text,
  experience_level text,
  industry text,
  capabilities text[] not null default '{}',
  skills text[] not null default '{}',
  compensation text,
  application_method text not null default 'external' check (application_method in ('external','valoria')),
  application_url text,
  closing_at timestamptz,
  status text not null default 'draft' check (status in ('draft','pending_review','approved','published','closed','rejected')),
  access_level text not null default 'public' check (access_level in ('public','assessed','eligible','invited')),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_notes text,
  reviewed_at timestamptz,
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_public_idx on public.opportunities(status,closing_at);
create index if not exists opportunities_capabilities_idx on public.opportunities using gin(capabilities);

create table if not exists public.opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  submitter_user_id uuid references auth.users(id) on delete set null,
  submitter_name text not null,
  submitter_email text not null,
  organisation_name text,
  payload jsonb not null default '{}',
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected','changes_requested')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  professional_id uuid references public.professional_profiles(id) on delete set null,
  applicant_email text,
  cover_note text,
  cv_document_id uuid references public.professional_documents(id) on delete set null,
  status text not null default 'submitted' check (status in ('submitted','reviewing','shortlisted','introduced','interview','selected','declined','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(opportunity_id,professional_id)
);

create table if not exists public.platform_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  subject_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.assessment_identity_links enable row level security;
alter table public.professional_journey enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_submissions enable row level security;
alter table public.opportunity_applications enable row level security;
alter table public.platform_audit_events enable row level security;

drop policy if exists journey_owner_read on public.professional_journey;
create policy journey_owner_read on public.professional_journey for select using (auth.uid()=user_id or is_valoria_admin());

drop policy if exists employer_owner_all on public.employer_profiles;
create policy employer_owner_all on public.employer_profiles for all using (auth.uid()=id or is_valoria_admin()) with check (auth.uid()=id or is_valoria_admin());

drop policy if exists opportunities_public_read on public.opportunities;
create policy opportunities_public_read on public.opportunities for select using (
  (status='published' and (closing_at is null or closing_at > now()) and access_level='public')
  or created_by=auth.uid()
  or is_valoria_admin()
);

drop policy if exists opportunity_submission_insert on public.opportunity_submissions;
create policy opportunity_submission_insert on public.opportunity_submissions for insert with check (
  submitter_user_id is null or submitter_user_id=auth.uid()
);

drop policy if exists opportunity_submission_owner_read on public.opportunity_submissions;
create policy opportunity_submission_owner_read on public.opportunity_submissions for select using (
  submitter_user_id=auth.uid() or is_valoria_admin()
);

drop policy if exists opportunity_submission_admin_update on public.opportunity_submissions;
create policy opportunity_submission_admin_update on public.opportunity_submissions for update using (is_valoria_admin()) with check (is_valoria_admin());

drop policy if exists opportunity_application_owner on public.opportunity_applications;
create policy opportunity_application_owner on public.opportunity_applications for all using (professional_id=auth.uid() or is_valoria_admin()) with check (professional_id=auth.uid() or is_valoria_admin());

drop policy if exists audit_admin_read on public.platform_audit_events;
create policy audit_admin_read on public.platform_audit_events for select using (is_valoria_admin());

create or replace function public.set_opportunity_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;

drop trigger if exists opportunities_updated_at on public.opportunities;
create trigger opportunities_updated_at before update on public.opportunities for each row execute function public.set_opportunity_updated_at();

drop trigger if exists employer_profiles_updated_at on public.employer_profiles;
create trigger employer_profiles_updated_at before update on public.employer_profiles for each row execute function public.set_opportunity_updated_at();

drop trigger if exists opportunity_applications_updated_at on public.opportunity_applications;
create trigger opportunity_applications_updated_at before update on public.opportunity_applications for each row execute function public.set_opportunity_updated_at();

-- Backfill journey records without modifying historical assessment data.
insert into public.professional_journey(user_id)
select id from auth.users
where not exists (select 1 from public.professional_journey j where j.user_id=auth.users.id)
on conflict do nothing;

do $$
declare r record;
begin
  for r in select user_id from public.professional_journey loop
    perform public.refresh_professional_journey(r.user_id);
  end loop;
end $$;
