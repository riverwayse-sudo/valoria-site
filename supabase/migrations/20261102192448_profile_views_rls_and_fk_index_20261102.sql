-- Keep profile-view RLS expressions index-friendly and cover the viewer FK.
create index if not exists profile_views_viewer_id_idx
  on public.profile_views (viewer_id);

drop policy if exists "anyone can log a profile view" on public.profile_views;
create policy "anyone can log a profile view"
  on public.profile_views
  for insert
  to anon, authenticated
  with check (
    viewer_id is null
    or viewer_id = (select auth.uid())
  );

drop policy if exists "owner can read their own profile views" on public.profile_views;
create policy "owner can read their own profile views"
  on public.profile_views
  for select
  to authenticated
  using (
    (select auth.uid()) = professional_profile_id
  );
