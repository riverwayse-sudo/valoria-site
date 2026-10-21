-- Recruitment applications are private, service-role-only records.
-- CVs live in a private Storage bucket; no public or authenticated client policies are granted.
create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  role_slug text not null,
  role_title text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  linkedin_url text,
  relevant_experience text not null,
  partnership_achievement text not null,
  motivation text not null,
  cv_storage_path text not null,
  cv_original_name text not null,
  cv_content_type text not null check (cv_content_type in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  cv_size_bytes bigint not null check (cv_size_bytes > 0 and cv_size_bytes <= 4194304),
  privacy_consent boolean not null default false check (privacy_consent = true),
  status text not null default 'new' check (status in ('new','reviewing','shortlisted','interview','rejected','hired')),
  source text not null default 'website-careers',
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_applications_role_email_unique unique (role_slug, email)
);
create index if not exists career_applications_created_at_idx on public.career_applications (created_at desc);
create index if not exists career_applications_status_idx on public.career_applications (status, created_at desc);
alter table public.career_applications enable row level security;
revoke all on public.career_applications from anon, authenticated;
drop policy if exists career_applications_no_client_access on public.career_applications;
create policy career_applications_no_client_access on public.career_applications for all to anon, authenticated using (false) with check (false);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('career-applications','career-applications',false,4194304,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
-- Do not create client Storage policies. Upload and access use the server-only service role.
