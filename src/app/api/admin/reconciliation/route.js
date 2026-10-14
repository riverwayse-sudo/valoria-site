import { createClient } from '@supabase/supabase-js'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } }) : null
}
async function requireAdmin(request) {
  const supabase = db()
  if (!supabase) return { supabase:null, response:Response.json({error:'Service not configured.'},{status:503}) }
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')
  if(!token) return {supabase,response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data,error}=await supabase.auth.getUser(token)
  if(error||!data?.user?.id) return {supabase,response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data:admin}=await supabase.from('admin_users').select('id').eq('id',data.user.id).maybeSingle()
  if(!admin) return {supabase,response:Response.json({error:'Admin access required.'},{status:403})}
  return {supabase,user:data.user}
}
export async function GET(request){
  const {supabase,response}=await requireAdmin(request)
  if(response) return response
  const [journeyRes, assessmentRes, profileRes, capabilityRes, documentRes, rosterRes, tasterRes, identityLinkRes] = await Promise.all([
    supabase.from('professional_journey_directory').select('*').order('updated_at',{ascending:false}),
    supabase.from('valu_assessments').select('id,user_id,taster_id,email,name,role,total_score,completed_at,assessment_version,scoring_version').not('completed_at','is',null).order('completed_at',{ascending:false}),
    supabase.from('professional_profiles').select('id,display_name,headline,profile_complete,active_tracks,photo_url,current_job_title,updated_at'),
    supabase.from('professional_capabilities').select('professional_id,capability,is_active,eligibility_status,eligible_for_listing,missing_requirements'),
    supabase.from('professional_documents').select('professional_id,status,document_type,created_at'),
    supabase.from('marketplace_public_roster').select('professional_id,capabilities,track'),
    supabase.from('taster_sessions').select('id,user_id,name,role,experience,completed_at,created_at,linked_at').not('completed_at','is',null).order('completed_at',{ascending:false}),
    supabase.from('assessment_identity_links').select('assessment_id,user_id,link_method')
  ])
  if(journeyRes.error || tasterRes.error || identityLinkRes.error) {
    return Response.json({error:'The reconciliation report could not load all identity sources. No records were changed.'},{status:500})
  }
  const profiles=profileRes.data||[]
  const profileMap=new Map(profiles.map(p=>[p.id,p]))
  const documentMap=new Map()
  for(const d of (documentRes.data||[])){
    if(!documentMap.has(d.professional_id)) documentMap.set(d.professional_id,[])
    documentMap.get(d.professional_id).push(d)
  }
  const rosterMap=new Map((rosterRes.data||[]).map(r=>[r.professional_id,r]))
  const capMap=new Map()
  for(const c of (capabilityRes.data||[])){
    if(!c.is_active) continue
    if(!capMap.has(c.professional_id)) capMap.set(c.professional_id,[])
    capMap.get(c.professional_id).push(c)
  }
  const latestAssessment=new Map()
  for(const a of (assessmentRes.data||[])){
    const key=a.user_id || ('email:'+((a.email||'').toLowerCase()))
    if(!latestAssessment.has(key)) latestAssessment.set(key,a)
  }
  const rows=(journeyRes.data||[]).map(j=>{
    const p=profileMap.get(j.user_id)||{}
    const c=capMap.get(j.user_id)||[]
    const a=latestAssessment.get(j.user_id)||null
    return {...j,
      display_name:j.display_name||p.display_name||a?.name||'Unnamed professional',
      current_job_title:j.current_job_title||p.current_job_title||p.headline||a?.role||'—',
      profile_complete:p.profile_complete===true,
      active_tracks:p.active_tracks||[],
      assessment_id:a?.id||j.current_assessment_id||null,
      assessment_score:a?.total_score??null,
      assessment_completed_at:a?.completed_at||null,
      assessment_version:a?.assessment_version||null,
      capabilities:c,email:a?.email||null,
      evidence:(documentMap.get(j.user_id)||[]),
      public_roster:rosterMap.has(j.user_id),
      public_capabilities:rosterMap.get(j.user_id)?.capabilities||[],
      public_track:rosterMap.get(j.user_id)?.track||null
    }
  }).map(r=>{
    const reasons=[]
    if(!r.assessment_id) reasons.push('VALU not completed')
    if(!r.profile_complete) reasons.push('profile not complete')
    if(!r.capabilities.length) reasons.push('no active capability')
    const listed=r.capabilities.filter(c=>c.eligibility_status==='listed'&&c.eligible_for_listing)
    if(r.capabilities.length && !listed.length) reasons.push('no capability is eligible and listed')
    if(!r.public_roster && listed.length) reasons.push('listing projection mismatch')
    if(r.public_roster) reasons.push('included in public roster')
    return {...r, listing_capabilities:listed.map(c=>c.capability), marketplace_exclusion_reasons:reasons}
  })
  const counts=rows.reduce((acc,r)=>{acc[r.lifecycle_state]=(acc[r.lifecycle_state]||0)+1;return acc},{})
  counts.unique_public_professionals=new Set((rosterRes.data||[]).map(r=>r.professional_id)).size
  counts.public_talent=(rosterRes.data||[]).filter(r=>r.track==='candidate').length
  counts.public_speakers=(rosterRes.data||[]).filter(r=>r.track==='speaker').length
  counts.public_facilitators=(rosterRes.data||[]).filter(r=>r.track==='facilitator').length
  const completedAssessments=assessmentRes.data||[]
  const completedTasters=tasterRes.data||[]
  const identityLinks=identityLinkRes.data||[]
  const assessmentById=new Map(completedAssessments.map(a=>[a.id,a]))
  const normalise=(value)=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
  const missingTasterLinks=completedAssessments.filter(a=>!a.taster_id).map(a=>{
    const exactOwnerCandidates=a.user_id?completedTasters.filter(t=>
      t.user_id===a.user_id &&
      normalise(t.name)===normalise(a.name) &&
      normalise(t.role)===normalise(a.role)
    ):[]
    return {
      assessment_id:a.id,user_id:a.user_id,name:a.name,role:a.role,
      completed_at:a.completed_at,assessment_version:a.assessment_version,
      classification:exactOwnerCandidates.length===1?'exact_owner_identity_candidate':exactOwnerCandidates.length>1?'multiple_exact_owner_candidates':'no_stable_taster_match',
      candidate_taster_ids:exactOwnerCandidates.map(t=>t.id)
    }
  })
  const unlinkedCompletedTasters=completedTasters.filter(t=>!t.user_id).map(t=>({
    taster_id:t.id,name:t.name,role:t.role,experience:t.experience,completed_at:t.completed_at,created_at:t.created_at
  }))
  const identityLinkConflicts=identityLinks.filter(link=>{
    const assessment=assessmentById.get(link.assessment_id)
    return assessment && assessment.user_id && assessment.user_id!==link.user_id
  }).map(link=>({assessment_id:link.assessment_id,assessment_user_id:assessmentById.get(link.assessment_id)?.user_id,identity_link_user_id:link.user_id,link_method:link.link_method}))
  const orphanedAssessments=completedAssessments.filter(a=>!a.user_id)
  const {data:userList}=await supabase.auth.admin.listUsers({page:1,perPage:1000})
  const accounts=(userList?.users||[]).map(u=>({id:u.id,email:u.email||null,name:profileMap.get(u.id)?.display_name||u.user_metadata?.full_name||u.user_metadata?.name||null}))
  const reconciliations=orphanedAssessments.map(a=>{
    const target=normalise(a.name)
    const candidates=target?accounts.filter(x=>normalise(x.name)===target):[]
    const classification=candidates.length===1?'name_match_requires_review':candidates.length>1?'multiple_name_matches':'no_account_match'
    return {id:a.id,email:a.email,name:a.name,role:a.role,total_score:a.total_score,completed_at:a.completed_at,assessment_version:a.assessment_version,classification,candidates}
  })
  return Response.json({
    rows,
    counts,
    orphanedAssessments:reconciliations,
    identityReconciliation:{
      completedTasters:completedTasters.length,
      unlinkedCompletedTasters:unlinkedCompletedTasters.length,
      completedAssessments:completedAssessments.length,
      assessmentsMissingTasterId:missingTasterLinks.length,
      exactOwnerIdentityCandidates:missingTasterLinks.filter(x=>x.classification==='exact_owner_identity_candidate').length,
      identityLinkConflicts:identityLinkConflicts.length,
      assessmentsMissingTasterIdDetails:missingTasterLinks,
      unlinkedCompletedTasterDetails:unlinkedCompletedTasters,
      identityLinkConflictDetails:identityLinkConflicts
    }
  })
}
