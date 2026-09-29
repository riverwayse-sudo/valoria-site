-- Backfill the value activation layer for existing professionals who already
-- have a completed full VALU assessment. Existing activated plans are preserved.
with latest as (
  select distinct on (user_id)
    user_id,id,total_score,p_score,r_score,i_score,m_score,e_score,completed_at
  from public.valu_assessments
  where user_id is not null and completed_at is not null
  order by user_id, completed_at desc
),
plans as (
  select l.*,
    case least(l.p_score,l.r_score,l.i_score,l.m_score,l.e_score)
      when l.p_score then 'Presence'
      when l.r_score then 'Relationships'
      when l.i_score then 'Intelligence'
      when l.m_score then 'Mastery'
      else 'Enterprise'
    end as priority_cluster
  from latest l
  join public.professional_profiles p on p.id=l.user_id
)
insert into public.professional_value_activation
(professional_id,assessment_id,status,priority_cluster,strengths,development_priorities,next_actions,value_unlocks,updated_at)
select user_id,id,'ready',priority_cluster,
  jsonb_build_array(
    jsonb_build_object('cluster','Presence','score',p_score),
    jsonb_build_object('cluster','Relationships','score',r_score),
    jsonb_build_object('cluster','Intelligence','score',i_score),
    jsonb_build_object('cluster','Mastery','score',m_score),
    jsonb_build_object('cluster','Enterprise','score',e_score)
  ),
  jsonb_build_array(jsonb_build_object('cluster',priority_cluster,'message','Turn this signal into a concrete development objective.')),
  jsonb_build_array(
    jsonb_build_object('title','Complete your professional identity','href','/profile/setup'),
    jsonb_build_object('title','Activate a capability','href','/profile/setup'),
    jsonb_build_object('title','Reach eligibility and become discoverable','href','/journey')
  ),
  jsonb_build_array('A structured professional identity','A capability-specific professional passport','Eligibility and verification signals','Discoverability and opportunity access'),
  now()
from plans
on conflict (professional_id) do update set
 assessment_id=excluded.assessment_id,
 status=case when public.professional_value_activation.status='activated' then 'activated' else 'ready' end,
 priority_cluster=excluded.priority_cluster,
 strengths=excluded.strengths,
 development_priorities=excluded.development_priorities,
 next_actions=excluded.next_actions,
 value_unlocks=excluded.value_unlocks,
 updated_at=now();
