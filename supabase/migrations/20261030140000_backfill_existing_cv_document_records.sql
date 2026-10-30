-- Backfill the canonical evidence ledger for CVs already stored in the
-- private bucket. Only exact profile.cv_url -> storage.objects matches are
-- registered; no identity or file metadata is inferred.
begin;

insert into public.professional_documents (
  professional_id,
  document_type,
  storage_bucket,
  storage_path,
  original_filename,
  mime_type,
  size_bytes,
  visibility
)
select
  p.id,
  'cv',
  'cvs',
  o.name,
  regexp_replace(o.name, '^.*/', ''),
  o.metadata->>'mimetype',
  case when nullif(o.metadata->>'size', '') ~ '^[0-9]+  'private'
from public.professional_profiles p
join storage.objects o
  on o.bucket_id = 'cvs'
 and o.name = p.cv_url
where nullif(trim(coalesce(p.cv_url, '')), '') is not null
  and nullif(o.metadata->>'mimetype', '') is not null
  and nullif(o.metadata->>'size', '') ~ '^[0-9]+$'
  and case when nullif(o.metadata->>'size', '') ~ '^[0-9]+  and not exists (
    select 1
    from public.professional_documents d
    where d.storage_bucket = 'cvs'
      and d.storage_path = o.name
  )
on conflict (storage_bucket, storage_path) do nothing;

commit;
 then (o.metadata->>'size')::bigint else null end,
  'private'
from public.professional_profiles p
join storage.objects o
  on o.bucket_id = 'cvs'
 and o.name = p.cv_url
where nullif(trim(coalesce(p.cv_url, '')), '') is not null
  and nullif(o.metadata->>'mimetype', '') is not null
  and nullif(o.metadata->>'size', '') ~ '^[0-9]+$'
  and (o.metadata->>'size')::bigint between 1 and 10485760
  and not exists (
    select 1
    from public.professional_documents d
    where d.storage_bucket = 'cvs'
      and d.storage_path = o.name
  )
on conflict (storage_bucket, storage_path) do nothing;

commit;
 then (o.metadata->>'size')::bigint else null end between 1 and 10485760
  and not exists (
    select 1
    from public.professional_documents d
    where d.storage_bucket = 'cvs'
      and d.storage_path = o.name
  )
on conflict (storage_bucket, storage_path) do nothing;

commit;
 then (o.metadata->>'size')::bigint else null end,
  'private'
from public.professional_profiles p
join storage.objects o
  on o.bucket_id = 'cvs'
 and o.name = p.cv_url
where nullif(trim(coalesce(p.cv_url, '')), '') is not null
  and nullif(o.metadata->>'mimetype', '') is not null
  and nullif(o.metadata->>'size', '') ~ '^[0-9]+$'
  and (o.metadata->>'size')::bigint between 1 and 10485760
  and not exists (
    select 1
    from public.professional_documents d
    where d.storage_bucket = 'cvs'
      and d.storage_path = o.name
  )
on conflict (storage_bucket, storage_path) do nothing;

commit;
