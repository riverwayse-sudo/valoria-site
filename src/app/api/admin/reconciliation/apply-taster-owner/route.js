import { createClient } from '@supabase/supabase-js'

function db() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null
}
async function requireAdmin(request) {
  const supabase=db()
  if(!supabase) return {response:Response.json({error:'Service unavailable.'},{status:503})}
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')
  if(!token) return {response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data,error}=await supabase.auth.getUser(token)
  if(error||!data?.user?.id) return {response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data:admin}=await supabase.from('admin_users').select('id').eq('id',data.user.id).maybeSingle()
  if(!admin) return {response:Response.json({error:'Admin access required.'},{status:403})}
  return {supabase,user:data.user}
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ')
const email=v=>String(v||'').trim().toLowerCase()
const traceable=new Set(['stable_id','authenticated_account','verified_email','submission_log','release_log','admin_documentation'])
const discrepancyEvidence=new Set(['submission_log','release_log','admin_documentation'])

export async function POST(request) {
  const {supabase,user,response}=await requireAdmin(request)
  if(response) return response
  let body
  try { body=await request.json() } catch { return Response.json({error:'Invalid request body.'},{status:400}) }
  const tasterId=String(body?.tasterId||''), userId=String(body?.userId||'')
  if(!uuid.test(tasterId)||!uuid.test(userId)) return Response.json({error:'Valid snapshot and account IDs are required.'},{status:400})
  const {data:review,error:reviewError}=await supabase.from('identity_reconciliation_reviews').select('id,decision,candidate_record_type,candidate_record_id,evidence_type,evidence_reference,notes,reviewed_at').eq('source_record_type','taster').eq('source_record_id',tasterId).order('reviewed_at',{ascending:false}).limit(1).maybeSingle()
  if(reviewError) return Response.json({error:'Could not verify review ledger.'},{status:500})
  if(!review||review.decision!=='verified_match'||review.candidate_record_type!=='account'||review.candidate_record_id!==userId||!review.evidence_reference||!traceable.has(review.evidence_type)) return Response.json({error:'A latest verified-match review for this exact account with traceable evidence is required.'},{status:409})
  const {data:account,error:accountError}=await supabase.auth.admin.getUserById(userId)
  if(accountError||!account?.user) return Response.json({error:'Target account does not exist.'},{status:404})
  if(!account.user.email_confirmed_at) return Response.json({error:'Target account email must be confirmed before linking this snapshot.'},{status:409})
  const {data:taster,error:tasterError}=await supabase.from('taster_sessions').select('id,user_id,name,role,completed_at').eq('id',tasterId).maybeSingle()
  if(tasterError) return Response.json({error:'Could not verify snapshot.'},{status:500})
  if(!taster||!taster.completed_at) return Response.json({error:'Only completed snapshots can be reconciled.'},{status:409})
  if(taster.user_id&&taster.user_id!==userId) return Response.json({error:'Snapshot is already owned by another account.'},{status:409})
  const {data:candidate,error:candidateError}=await supabase.from('taster_identity_candidates').select('candidate_name,candidate_role,candidate_email,linked_user_id').eq('taster_id',tasterId).maybeSingle()
  if(candidateError) return Response.json({error:'Could not verify contact evidence.'},{status:500})
  if(candidate?.linked_user_id&&candidate.linked_user_id!==userId) return Response.json({error:'Contact evidence is linked to a different account.'},{status:409})
  const fieldsMatch=(!candidate?.candidate_name||norm(candidate.candidate_name)===norm(taster.name))&&(!candidate?.candidate_role||norm(candidate.candidate_role)===norm(taster.role))&&(!candidate?.candidate_email||email(candidate.candidate_email)===email(account.user.email))
  if(!fieldsMatch&&!discrepancyEvidence.has(review.evidence_type)) return Response.json({error:'Contact evidence conflicts. Traceable submission/release logs or admin documentation must explicitly resolve the discrepancy.'},{status:409})
  if(!taster.user_id) {
    const {data:updated,error:updateError}=await supabase.from('taster_sessions').update({user_id:userId}).eq('id',tasterId).is('user_id',null).select('id,user_id')
    if(updateError) return Response.json({error:'Snapshot ownership could not be updated.'},{status:500})
    if(!updated?.some(row=>row.id===tasterId&&row.user_id===userId)) return Response.json({error:'Snapshot changed during reconciliation; reload and review again.'},{status:409})
  }
  if(candidate) {
    const {data:projection,error:projectionError}=await supabase.from('taster_identity_candidates').update({identity_status:'account_linked',linked_user_id:userId,resolution_notes:'Applied after verified admin review '+review.id+' with traceable evidence '+review.evidence_type+': '+review.evidence_reference,last_reconciled_at:new Date().toISOString()}).eq('taster_id',tasterId).or('linked_user_id.is.null,linked_user_id.eq.'+userId).select('taster_id,linked_user_id').maybeSingle()
    if(projectionError) return Response.json({ok:false,applied:true,error:'Snapshot is linked, but identity evidence projection failed. Retry to complete the record.'},{status:502})
    if(!projection||projection.linked_user_id!==userId) return Response.json({ok:false,applied:true,error:'Snapshot is linked, but candidate ownership could not be confirmed. Keep the review open.'},{status:409})
  }
  const {data:priorAudit,error:priorAuditError}=await supabase.from('platform_audit_events').select('id').eq('entity_type','taster_session').eq('entity_id',tasterId).eq('action','admin_linked_taster_owner').ilike('reason','Review '+review.id+';%').limit(1).maybeSingle()
  if(priorAuditError) return Response.json({ok:false,applied:true,error:'Could not verify audit trail; retry after checking audit state.'},{status:502})
  if(!priorAudit) {
    const {error:auditError}=await supabase.from('platform_audit_events').insert({actor_user_id:user.id,subject_user_id:userId,entity_type:'taster_session',entity_id:tasterId,action:'admin_linked_taster_owner',before_state:{user_id:taster.user_id},after_state:{user_id:userId},reason:'Review '+review.id+'; '+review.evidence_type+': '+review.evidence_reference+'. '+String(review.notes||'').slice(0,1200)})
    if(auditError) return Response.json({ok:false,applied:true,error:'Snapshot is linked but audit logging failed. Retry to complete the audit record.'},{status:502})
  }
  const {data:confirmed,error:confirmError}=await supabase.from('taster_sessions').select('id,user_id,completed_at').eq('id',tasterId).maybeSingle()
  if(confirmError||!confirmed||confirmed.user_id!==userId||!confirmed.completed_at) return Response.json({ok:false,applied:true,error:'Could not confirm the snapshot ownership.'},{status:502})
  const {error:journeyError}=await supabase.rpc('refresh_professional_journey',{p_user_id:userId})
  if(journeyError) return Response.json({ok:false,applied:true,audited:true,error:'Snapshot is linked and audited, but journey refresh failed. Retry to refresh journey state.'},{status:502})
  return Response.json({ok:true,applied:true,audited:true,tasterId,userId})
}