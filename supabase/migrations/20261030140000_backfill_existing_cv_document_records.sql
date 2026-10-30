-- Register existing CVs only when profile.cv_url exactly matches a private
-- object in the cvs bucket. No ownership or file metadata is inferred.
begin;

insert into public.professional_documents (
  professional_id,
  document_type,
  storage_bucket,
  storage_path,
  original_filename,
  mime_type,
  size_bytes,
  visibility,
  verification_status
)
select
  p.id,
  'cv',
  'cvs',
  o.name,
  regexp_replace(o.name, '^.*/', ''),
  o.metadata->>'mimetype',
  case
    when o.metadata->>'size' ~ '^[0-9]+$'
      then (o.metadata->>'size')::bigint
    else null
  end,
  'private',
  'pending'
from public.professional_profiles p
join storage.objects o
  on o.bucket_id = 'cvs'
 and o.name = p.cv_url
where nullif(trim(coalesce(p.cv_url, '')), '') is not null
  and o.metadata->>'mimetype' in (
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
  and o.metadata->>'size' ~ '^[0-9]+$'
  and case
    when o.metadata->>'size' ~ '^[0-9]+$'
      then (o.metadata->>'size')::bigint between 1 and 10485760
    else false
  end
  and not exists (
    select 1
    from public.professional_documents d
    where d.storage_bucket = 'cvs'
      and d.storage_path = o.name
  )
on conflict (storage_bucket, storage_path) do nothing;

commit;
