create table if not exists public.identity_reconciliation_reviews (
  id uuid primary key default gen_random_uuid(),
  source_record_type text not null check (source_record_type in ('assessment','taster','profile')),
  source_record_id uuid not null,
  candidate_record_type text check (candidate_record_type in ('assessment','taster','profile','account')),
  candidate_record_id uuid,
  decision text not null check (decision in ('verified_match','candidate_match','conflict','unmatched','resolved_no_link')),
  evidence_type text not null check (evidence_type in ('stable_id','authenticated_account','verified_email','submission_log','release_log','admin_documentation','manual_review','other')),
  evidence_reference text,
  notes text not null,
  reviewed_by uuid not null references auth.users(id),
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint identity_reconciliation_review_notes_nonempty check (length(trim(notes)) > 0),
  constraint identity_reconciliation_evidence_reference_length check (evidence_reference is null or length(evidence_reference) <= 500)
);
create index if not exists identity_reconciliation_reviews_source_idx
  on public.identity_reconciliation_reviews (source_record_type, source_record_id, reviewed_at desc);
create index if not exists identity_reconciliation_reviews_candidate_idx
  on public.identity_reconciliation_reviews (candidate_record_type, candidate_record_id, reviewed_at desc)
  where candidate_record_id is not null;
alter table public.identity_reconciliation_reviews enable row level security;
revoke all on public.identity_reconciliation_reviews from anon, authenticated;
grant all on public.identity_reconciliation_reviews to service_role;
comment on table public.identity_reconciliation_reviews is
  'Append-only admin audit trail for manual identity reconciliation decisions. Decisions do not themselves mutate identity ownership.';
