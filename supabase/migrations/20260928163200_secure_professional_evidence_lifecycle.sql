-- Phase 1 evidence lifecycle: private professional documents are owner-managed
-- until governance verifies them.
alter table public.professional_documents enable row level security;
revoke all on table public.professional_documents from anon, authenticated;
grant select, insert, update, delete on table public.professional_documents to authenticated;

drop policy if exists professional_documents_owner_select on public.professional_documents;
create policy professional_documents_owner_select on public.professional_documents for select to authenticated
using (professional_id = (select auth.uid()) or is_valoria_admin());

drop policy if exists professional_documents_owner_insert on public.professional_documents;
create policy professional_documents_owner_insert on public.professional_documents for insert to authenticated
with check (professional_id = (select auth.uid()) and verification_status in ('unverified','pending') and verified_by is null and verified_at is null);

drop policy if exists professional_documents_owner_delete on public.professional_documents;
create policy professional_documents_owner_delete on public.professional_documents for delete to authenticated
using (professional_id = (select auth.uid()) or is_valoria_admin());

drop policy if exists professional_documents_admin_update on public.professional_documents;
create policy professional_documents_admin_update on public.professional_documents for update to authenticated
using (is_valoria_admin() or professional_id = (select auth.uid()))
with check (is_valoria_admin() or professional_id = (select auth.uid()));

create or replace function public.guard_professional_document_platform_fields()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role',true) <> 'service_role'
     and not public.is_valoria_admin()
     and (new.verification_status is distinct from old.verification_status
       or new.verified_at is distinct from old.verified_at
       or new.verified_by is distinct from old.verified_by)
  then raise exception 'document verification fields are controlled by Valoria governance'; end if;
  return new;
end;
$$;
revoke all on function public.guard_professional_document_platform_fields() from public, anon, authenticated;

drop trigger if exists trg_guard_professional_document_platform_fields on public.professional_documents;
create trigger trg_guard_professional_document_platform_fields before update on public.professional_documents
for each row execute function public.guard_professional_document_platform_fields();

create or replace function public.set_professional_document_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function public.set_professional_document_updated_at() from public, anon, authenticated;

drop trigger if exists professional_documents_updated_at on public.professional_documents;
create trigger professional_documents_updated_at before update on public.professional_documents
for each row execute function public.set_professional_document_updated_at();

create index if not exists professional_documents_review_idx on public.professional_documents(verification_status,created_at desc);
