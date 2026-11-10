-- Restrict internal capability-management helpers to trusted execution contexts.
-- SECURITY DEFINER callers and trigger execution continue as their owning role.
-- The public roster projection implementation is intentionally not changed here.
begin;

revoke execute on function private.is_basic_public_profile_ready(uuid)
  from public, anon, authenticated;

revoke execute on function private.refresh_existing_professional_capability(uuid, text)
  from public, anon, authenticated;

revoke execute on function private.sync_capability_eligibility_from_document()
  from public, anon, authenticated;

commit;
