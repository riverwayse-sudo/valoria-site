-- 013_harden_admin_authorization.sql
--
-- Applied to the connected Supabase production project on 2026-08-15.
-- Keep this migration in the repository so the security model remains
-- reproducible for future environments.

create index if not exists admin_users_invited_by_idx
  on public.admin_users (invited_by);

drop policy if exists "admin_users_own_select" on public.admin_users;
create policy "admin_users_own_select"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = id);

create or replace function public.is_valoria_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
  );
$$;

drop policy if exists "Users manage their own saved searches" on public.saved_searches;
create policy "Users manage their own saved searches"
on public.saved_searches
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
