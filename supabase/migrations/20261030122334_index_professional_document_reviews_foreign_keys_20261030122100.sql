-- Index both review-ledger foreign keys used for capability and reviewer lookups.
create index if not exists professional_document_reviews_capability_idx
  on public.professional_document_reviews (capability_id)
  where capability_id is not null;

create index if not exists professional_document_reviews_reviewed_by_idx
  on public.professional_document_reviews (reviewed_by);
