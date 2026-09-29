-- Valoria event attendance and certificate layer.
-- Registration, attendance and certification are intentionally separate lifecycle states.

create table if not exists public.professional_events (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  title text not null,
  description text,
  event_date timestamptz not null,
  duration_minutes integer,
  event_type text not null default 'professional_standard',
  issuer text not null default 'Valoria Institute',
  status text not null default 'completed' check (status in ('scheduled','live','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professional_events_date_idx
  on public.professional_events(event_date desc);

create table if not exists public.professional_event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.professional_events(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  attendance_status text not null default 'present'
    check (attendance_status in ('present','absent','excused','pending')),
  attendance_source text not null default 'admin_verified',
  attendance_reference text,
  attended_at timestamptz,
  marked_by uuid references auth.users(id) on delete set null,
  marked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, professional_id)
);

create index if not exists professional_event_attendance_professional_idx
  on public.professional_event_attendance(professional_id, attendance_status);

create table if not exists public.professional_certificates (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null unique references public.professional_event_attendance(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  certificate_number text not null unique,
  certificate_type text not null default 'attendance',
  title text not null,
  event_title text not null,
  event_date timestamptz not null,
  issuer text not null default 'Valoria Institute',
  verification_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now()
);

create index if not exists professional_certificates_professional_idx
  on public.professional_certificates(professional_id, issued_at desc);

create index if not exists professional_certificates_verification_idx
  on public.professional_certificates(verification_token);

alter table public.professional_events enable row level security;
alter table public.professional_event_attendance enable row level security;
alter table public.professional_certificates enable row level security;

drop policy if exists professional_events_public_read on public.professional_events;
create policy professional_events_public_read
  on public.professional_events for select
  using (status = 'completed' or status = 'live' or is_valoria_admin());

drop policy if exists professional_events_admin_write on public.professional_events;
create policy professional_events_admin_write
  on public.professional_events for all
  using (is_valoria_admin())
  with check (is_valoria_admin());

drop policy if exists event_attendance_owner_read on public.professional_event_attendance;
create policy event_attendance_owner_read
  on public.professional_event_attendance for select
  using (professional_id = auth.uid() or is_valoria_admin());

drop policy if exists event_attendance_admin_write on public.professional_event_attendance;
create policy event_attendance_admin_write
  on public.professional_event_attendance for all
  using (is_valoria_admin())
  with check (is_valoria_admin());

drop policy if exists certificates_public_verified_read on public.professional_certificates;
create policy certificates_public_verified_read
  on public.professional_certificates for select
  using (
    revoked_at is null
    and exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_certificates.professional_id
        and p.profile_complete = true
        and p.visibility = 'public'
        and p.listing_status = 'listed'
    )
  );

drop policy if exists certificates_owner_read on public.professional_certificates;
create policy certificates_owner_read
  on public.professional_certificates for select
  using (professional_id = auth.uid() or is_valoria_admin());

drop policy if exists certificates_admin_write on public.professional_certificates;
create policy certificates_admin_write
  on public.professional_certificates for all
  using (is_valoria_admin())
  with check (is_valoria_admin());

create or replace function public.set_professional_event_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists professional_events_updated_at on public.professional_events;
create trigger professional_events_updated_at
before update on public.professional_events
for each row execute function public.set_professional_event_updated_at();

drop trigger if exists professional_event_attendance_updated_at on public.professional_event_attendance;
create trigger professional_event_attendance_updated_at
before update on public.professional_event_attendance
for each row execute function public.set_professional_event_updated_at();

comment on table public.professional_events is
  'Canonical Valoria events that can contribute verified participation history.';

comment on table public.professional_event_attendance is
  'Verified attendance records. Registration alone never creates attendance.';

comment on table public.professional_certificates is
  'Issued certificates linked one-to-one with verified attendance and surfaced on professional profiles.';
