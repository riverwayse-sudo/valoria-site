import { createClient } from '@supabase/supabase-js'

function db() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null
}
async function requireAdmin(request) {
  const supabase=db()
  if(!supabase) return {response:Response.json({error:'Service unavailable.'},{status:503})}
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\\s+/i,'')
  if(!token) return {response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data,error}=await supabase.auth.getUser(token)
  if(error||!data?.user?.id) return {response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data:admin}=await supabase.from('admin_users').select('id').eq('id',data.user.id).maybeSingle()
  if(!admin) return {response:Response.json({error:'Admin access required.'},{status:403})}
  return {supabase,user:data.user}
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const norm=v=>String(v||'').trim().toLowerCase().replace(/\\s+/g,' ')
const traceable=new Set(['stable_id','authenticated_account','verified_email','submission_log','release_log','admin_documentation'])
const discrepancyEvidence=new Set(['submission_log','release_log','admin_documentation'])

export async function POST(request) {
  const {supabase,user,response}=await requireAdmin(request)
  if(response) return response
  let body
  try { body=await request.json() } catch { return Response.json({error:'Invalid request body.'},{status:400}) }
  const assessmentId=String(body?.assessmentId||''), tasterId=String(body?.tasterId||'')
  if(!uuid.test(assessmentId)||!uuid.test(tasterId)) return Response.json({error:'Valid assessment and taster IDs are required.'},{status:400})
  const {data:review,error:reviewError}=await supabase.from('identity_reconciliation_reviews').select('id,decision,candidate_record_type,candidate_record_id,evidence_type,evidence_reference,notes,reviewed_at').eq('source_record_type','assessment').eq('source_record_id',assessmentId).order('reviewed_at',{ascending:false}).limit(1).maybeSingle()
  if(reviewError) return Response.json({error:'Could not verify review ledger.'},{status:500})
  if(!review||review.decision!=='verified_match'||review.candidate_record_type!=='taster'||review.candidate_record_id!==tasterId||!review.evidence_reference||!traceable.has(review.evidence_type)) return Response.json({error:'A latest verified-match review for this exact taster with traceable evidence is required.'},{status:409})
  const {data:a,error:ae}=await supabase.from('valu_assessments').select('id,user_id,taster_id,name,role,email,completed_at').eq('id',assessmentId).maybeSingle()
  if(ae) return Response.json({error:'Could not verify assessment.'},{status:500})
  if(!a||!a.completed_at) return Response.json({error:'Only completed assessments can be linked.'},{status:409})
  const {data:t,error:te}=await supabase.from('taster_sessions').select('id,user_id,name,role,completed_at').eq('id',tasterId).maybeSingle()
  if(te) return Response.json({error:'Could not verify snapshot.'},{status:500})
  if(!t||!t.completed_at||!t.user_id) return Response.json({error:'Snapshot must be completed and owned by an authenticated account.'},{status:409})
  if(!a.user_id||a.user_id!==t.user_id) return Response.json({error:'Assessment and snapshot must already belong to the same account; this operation never transfers ownership.'},{status:409})
  if(a.taster_id&&a.taster_id!==tasterId) return Response.json({error:'Assessment already references a different snapshot.'},{status:409})
  const {data:c,error:ce}=await supabase.from('taster_identity_candidates').select('candidate_name,candidate_role,candidate_email,linked_user_id').eq('taster_id',tasterId).maybeSingle()
  if(ce) return Response.json({error:'Could not verify contact evidence.'},{status:500})
  if(c?.linked_user_id&&c.linked_user_id!==t.user_id) return Response.json({error:'Contact evidence is linked to a different account.'},{status:409})
  const matches=norm(a.name)===norm(t.name)&&norm(a.role)===norm(t.role)&&(!c?.candidate_name||norm(c.candidate_name)===norm(a.name))&&(!c?.candidate_role||norm(c.candidate_role)===norm(a.role))&&(!c?.candidate_email||!a.email||String(c.candidate_email).trim().toLowerCase()===String(a.email).trim().toLowerCase())
  if(!matches&&!discrepancyEvidence.has(review.evidence_type)) return Response.json({error:'Identity fields conflict. Traceable submission/release logs or admin documentation must explicitly resolve the discrepancy.'},{status:409})
  if(a.taster_id!==tasterId) {
    const {data:updated,error:ue}=await supabase.from('valu_assessments').update({taster_id:tasterId}).eq('id',assessmentId).eq('user_id',t.user_id).is('taster_id',null).select('id,user_id,taster_id')
    if(ue) return Response.json({error:'Could not apply the reviewed link.'},{status:500})
    if(!updated?.some(row=>row.id===assessmentId&&row.user_id===t.user_id&&row.taster_id===tasterId)) return Response.json({error:'Record changed during reconciliation; reload and review again.'},{status:409})
  }
  const {data:confirmed,error:verifyError}=await supabase.from('valu_assessments').select('id,user_id,taster_id').eq('id',assessmentId).maybeSingle()
  if(verifyError||!confirmed||confirmed.user_id!==t.user_id||confirmed.taster_id!==tasterId) return Response.json({error:'Could not confirm the applied link.'},{status:502})
  const {error:auditError}=await supabase.from('platform_audit_events').insert({actor_user_id:user.id,subject_user_id:t.user_id,entity_type:'valu_assessment',entity_id:assessmentId,action:'admin_applied_verified_taster_link',before_state:{taster_id:a.taster_id,user_id:a.user_id},after_state:{taster_id:tasterId,user_id:t.user_id},reason:'Review '+review.id+'; '+review.evidence_type+': '+review.evidence_reference+'. '+String(review.notes||'').slice(0,1200)})
  if(auditError) return Response.json({ok:false,applied:true,error:'Link is verified but audit logging failed. Retry to complete the audit record.'},{status:502})
  const {error:journeyError}=await supabase.rpc('refresh_professional_journey',{p_user_id:t.user_id})
  if(journeyError) return Response.json({ok:false,applied:true,audited:true,error:'Link is applied and audited, but journey refresh failed. Retry to refresh journey state.'},{status:502})
  return Response.json({ok:true,applied:true,audited:true,assessmentId,tasterId})
}