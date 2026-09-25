-- Restore public marketplace projection access.
-- The marketplace frontend uses the anon Supabase client. These views must
-- execute with the view owner's privileges so the public projection can be
-- read without exposing the underlying governance tables.
-- A later hardening migration changed these views to security_invoker=true,
-- which caused the public marketplace to return zero rows under anon/RLS.

alter view public.marketplace_professionals set (security_invoker = false);
alter view public.marketplace_professionals_general set (security_invoker = false);
alter view public.public_marketplace_professionals set (security_invoker = false);
alter view public.professional_profiles_public set (security_invoker = false);

grant select on public.marketplace_professionals to anon, authenticated;
grant select on public.marketplace_professionals_general to anon, authenticated;
grant select on public.public_marketplace_professionals to anon, authenticated;
grant select on public.professional_profiles_public to anon, authenticated;
