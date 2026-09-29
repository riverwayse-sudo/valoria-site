-- Allow an employer account attached to an opportunity to review its applications.
drop policy if exists opportunity_application_employer_read on public.opportunity_applications;
create policy opportunity_application_employer_read
on public.opportunity_applications
for select
to authenticated
using (
  exists (
    select 1 from public.opportunities o
    where o.id = opportunity_applications.opportunity_id
      and (o.employer_id = (select auth.uid()) or o.created_by = (select auth.uid()))
  )
);

drop policy if exists opportunity_application_employer_update on public.opportunity_applications;
create policy opportunity_application_employer_update
on public.opportunity_applications
for update
to authenticated
using (
  exists (
    select 1 from public.opportunities o
    where o.id = opportunity_applications.opportunity_id
      and (o.employer_id = (select auth.uid()) or o.created_by = (select auth.uid()))
  )
)
with check (
  exists (
    select 1 from public.opportunities o
    where o.id = opportunity_applications.opportunity_id
      and (o.employer_id = (select auth.uid()) or o.created_by = (select auth.uid()))
  )
);
