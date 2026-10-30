-- Capability-scoped evidence and append-only administrative review history.
-- Existing CV documents remain unscoped (capability_id IS NULL) and untouched.
begin;

alter table public.professional_documents
  add column if not exists capability_id uuid
    references public.professional_capabilities(id) on delete restrict;

create index if not exists professional_documents_capability_idx
  on public.professional_documents (capability_id, created_at desc)
  where capability_id is not null;

create table if not exists public.professional_document_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.professional_documents(id) on delete restrict,
  capability_id uuid references public.professional_capabilities(id) on delete restrict,
  decision text not null check (decision in ('approved','changes_requested','rejected')),
  notes text not null check (length(trim(notes)) between 1 and 3000),
  reviewed_by uuid not null references auth.users(id),
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists professional_document_reviews_document_idx
  on public.professional_document_reviews (document_id, reviewed_at desc);

alter table public.professional_document_reviews enable row level security;
revoke all on public.professional_document_reviews from anon, authenticated;
grant all on public.professional_document_reviews to service_role;

comment on column public.professional_documents.capability_id is
  'Null for profile-wide evidence such as CV; populated for evidence submitted against one professional capability.';
comment on table public.professional_document_reviews is
  'Append-only administrative decisions for capability evidence. The latest decision controls the document verification status; prior decisions remain auditable.';

commit;
