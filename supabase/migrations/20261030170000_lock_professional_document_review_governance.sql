-- Keep evidence submission participant-owned, but make review decisions
-- platform-owned. Prevent deletion or replacement of submitted evidence.
begin;

drop policy if exists professional_documents_admin_update on public.professional_documents;
create policy professional_documents_admin_update
  on public.professional_documents
  for update
  to authenticated
  using (is_valoria_admin())
  with check (is_valoria_admin());

drop policy if exists professional_documents_owner_delete on public.professional_documents;

drop policy if exists professional_documents_owner_insert on public.professional_documents;
create policy professional_documents_owner_insert
  on public.professional_documents
  for insert
  to authenticated
  with check (
    professional_id = (select auth.uid())
    and verification_status in ('unverified','pending')
    and verified_by is null
    and verified_at is null
    and (
      capability_id is null
      or exists (
        select 1
        from public.professional_capabilities pc
        where pc.id = capability_id
          and pc.professional_id = professional_documents.professional_id
          and pc.is_active = true
      )
    )
  );

-- Evidence uses unique object paths and upsert=false. UPDATE permission is
-- unnecessary and would permit replacing a previously submitted private file.
drop policy if exists "CV owner can update own objects" on storage.objects;

commit;
