-- Event participation certificates are distinct from professional certification
-- records. Keep attendee details and download tokens out of public profile data.
create table if not exists public.event_certificate_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  recipient_name text not null,
  recipient_email text not null,
  storage_bucket text not null default 'cvs',
  storage_path text not null unique,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  downloaded_at timestamptz,
  revoked_at timestamptz,
  constraint event_certificate_deliveries_event_slug_check
    check (event_slug = 'influence-without-authority-2026-11-14'),
  constraint event_certificate_deliveries_email_check
    check (recipient_email = lower(trim(recipient_email))),
  constraint event_certificate_deliveries_pdf_path_check
    check (storage_path like 'event-certificates/influence-without-authority-2026-11-14/%.pdf')
);

create index if not exists event_certificate_deliveries_event_email_idx
  on public.event_certificate_deliveries(event_slug, recipient_email);

alter table public.event_certificate_deliveries enable row level security;

-- No browser role receives access. Server routes use the service role after
-- validating admin identity (upload) or an unguessable token (attendee access).
revoke all on public.event_certificate_deliveries from anon, authenticated;
grant all on public.event_certificate_deliveries to service_role;

comment on table public.event_certificate_deliveries is
  'Private attendee certificate delivery records; separate from professional certification and public profile records.';
