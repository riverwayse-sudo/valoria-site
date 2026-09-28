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
  const [journeyRes, assessmentRes, profileRes, capabilityRes] = await Promise.all([
    supabase.from('professional_journey_directory').select('*').order('updated_at',{ascending:false}),
    supabase.from('valu_assessments').select('id,user_id,email,name,role,total_score,completed_at,assessment_version,scoring_version').not('completed_at','is',null).order('completed_at',{ascending:false}),
    supabase.from('professional_profiles').select('id,display_name,headline,profile_complete,active_tracks,photo_url,current_job_title,updated_at'),
    supabase.from('professional_capabilities').select('professional_id,capability,is_active,eligibility_status,eligible_for_listing,missing_requirements'),
  ])
  if(journeyRes.error) return Response.json({error:journeyRes.error.message},{status:500})
  const profiles=profileRes.data||[]
  const profileMap=new Map(profiles.map(p=>[p.id,p]))
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
      capabilities:c,email:a?.email||null}
  })
  const counts=rows.reduce((acc,r)=>{acc[r.lifecycle_state]=(acc[r.lifecycle_state]||0)+1;return acc},{})
  const orphanedAssessments=(assessmentRes.data||[]).filter(a=>!a.user_id)
  const {data:userList}=await supabase.auth.admin.listUsers({page:1,perPage:1000})
  const accounts=(userList?.users||[]).map(u=>({id:u.id,email:u.email||null,name:profileMap.get(u.id)?.display_name||u.user_metadata?.full_name||u.user_metadata?.name||null}))
  const normalise=(value)=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
  const reconciliations=orphanedAssessments.map(a=>{
    const target=normalise(a.name)
    const candidates=target?accounts.filter(x=>normalise(x.name)===target):[]
    const classification=candidates.length===1?'name_match_requires_review':candidates.length>1?'multiple_name_matches':'no_account_match'
    return {id:a.id,email:a.email,name:a.name,role:a.role,total_score:a.total_score,completed_at:a.completed_at,assessment_version:a.assessment_version,classification,candidates}
  })
  return Response.json({rows,counts,orphanedAssessments:reconciliations})
}
