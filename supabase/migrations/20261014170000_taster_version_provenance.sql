-- Stamp the taster engine version at submission time.
-- Historical rows stay explicitly unknown unless separate release evidence proves a version.
alter table public.taster_sessions
  add column if not exists taster_version text,
  add column if not exists taster_version_source text not null default 'legacy_unknown';

alter table public.taster_sessions
  drop constraint if exists taster_sessions_version_source_check;
alter table public.taster_sessions
  add constraint taster_sessions_version_source_check
  check (taster_version_source in ('server_stamped','legacy_unknown','admin_verified'));

update public.taster_sessions
set taster_version_source='legacy_unknown'
where taster_version_source is null;

create index if not exists taster_sessions_version_created_idx
  on public.taster_sessions (taster_version, created_at desc);
