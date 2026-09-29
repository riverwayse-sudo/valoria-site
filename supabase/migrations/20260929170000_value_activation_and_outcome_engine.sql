-- Valoria value activation, capability passport and outcome telemetry.
-- The service-role journey APIs own these records; professionals can read their
-- own activation/outcome history through explicit RLS policies.

create table if not exists public.professional_value_activation (
  professional_id uuid primary key references public.professional_profiles(id) on delete cascade,
  assessment_id uuid references public.valu_assessments(id) on delete set null,
  status text not null default 'ready' check (status in ('ready','activated','superseded')),
  priority_cluster text,
  strengths jsonb not null default '[]'::jsonb,
  development_priorities jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  value_unlocks jsonb not null default '[]'::jsonb,
  activated_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists professional_value_activation_status_idx
  on public.professional_value_activation(status);

create table if not exists public.professional_outcome_events (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  capability_id uuid references public.professional_capabilities(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  event_type text not null check (event_type in (
    'profile_view','enquiry','invite','application','shortlisted',
    'introduced','interview','selected','declined','engaged','completed'
  )),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists professional_outcome_events_professional_idx
  on public.professional_outcome_events(professional_id, occurred_at desc);

create index if not exists professional_outcome_events_opportunity_idx
  on public.professional_outcome_events(opportunity_id, occurred_at desc);

alter table public.professional_value_activation enable row level security;
alter table public.professional_outcome_events enable row level security;

drop policy if exists value_activation_owner_read on public.professional_value_activation;
create policy value_activation_owner_read
  on public.professional_value_activation
  for select to authenticated
  using ((select auth.uid()) = professional_id);

drop policy if exists outcome_events_owner_read on public.professional_outcome_events;
create policy outcome_events_owner_read
  on public.professional_outcome_events
  for select to authenticated
  using ((select auth.uid()) = professional_id);

comment on table public.professional_value_activation is
  'Canonical post-assessment value activation plan linking VALU insight to professional action.';
comment on table public.professional_outcome_events is
  'Outcome telemetry connecting listed capability to discovery, opportunity and engagement events.';
