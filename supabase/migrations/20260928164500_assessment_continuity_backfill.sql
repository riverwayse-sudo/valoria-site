-- Phase 3 assessment continuity: historical identity links and owner/admin access.
insert into public.assessment_identity_links(assessment_id,user_id,link_method,linked_at,linked_by)
select v.id,v.user_id,'historical_backfill',coalesce(v.completed_at,v.created_at),v.user_id
from public.valu_assessments v
where v.user_id is not null
  and v.completed_at is not null
  and not exists (select 1 from public.assessment_identity_links l where l.assessment_id=v.id)
on conflict (assessment_id) do nothing;

alter table public.assessment_identity_links enable row level security;
revoke all on table public.assessment_identity_links from anon,authenticated;
grant select on table public.assessment_identity_links to authenticated;

drop policy if exists assessment_identity_owner_read on public.assessment_identity_links;
create policy assessment_identity_owner_read on public.assessment_identity_links
for select to authenticated
using (user_id=(select auth.uid()) or is_valoria_admin());

create index if not exists valu_assessments_user_completed_idx
on public.valu_assessments(user_id,completed_at desc)
where completed_at is not null;

create index if not exists valu_assessments_taster_idx
on public.valu_assessments(taster_id)
where taster_id is not null;
