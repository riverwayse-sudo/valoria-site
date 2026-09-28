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

export async function POST(request) {
  const {supabase,response,user}=await requireAdmin(request)
  if(response) return response

  let body
  try { body=await request.json() } catch { return Response.json({error:'Invalid request body.'},{status:400}) }
  const assessmentId=String(body?.assessmentId||'').trim()
  const targetUserId=String(body?.targetUserId||'').trim()
  const reason=String(body?.reason||'').trim()

  if(!assessmentId||!targetUserId) return Response.json({error:'Assessment ID and target account ID are required.'},{status:400})
  if(!reason) return Response.json({error:'A reconciliation reason is required.'},{status:400})

  const {data:assessment,error:assessmentError}=await supabase
    .from('valu_assessments')
    .select('id,user_id,email,name,role,total_score,completed_at,assessment_version,scoring_version')
    .eq('id',assessmentId).maybeSingle()
  if(assessmentError) return Response.json({error:assessmentError.message},{status:500})
  if(!assessment) return Response.json({error:'Assessment not found.'},{status:404})
  if(assessment.user_id && assessment.user_id!==targetUserId) return Response.json({error:'Assessment is already owned by another account.'},{status:409})

  const {data:target,error:targetError}=await supabase.auth.admin.getUserById(targetUserId)
  if(targetError||!target?.user) return Response.json({error:'Target account not found.'},{status:404})

  const {data:existing,error:existingError}=await supabase
    .from('valu_assessments')
    .select('id,total_score,completed_at')
    .eq('user_id',targetUserId)
    .not('completed_at','is',null)
    .neq('id',assessmentId)
    .order('completed_at',{ascending:false})
    .limit(1)
    .maybeSingle()
  if(existingError) return Response.json({error:existingError.message},{status:500})
  if(existing) return Response.json({
    error:'Target account already has a completed VALU assessment. Review the assessment history before linking this historical record.',
    existingAssessment:existing
  },{status:409})

  const before={user_id:assessment.user_id}
  const {error:linkError}=await supabase
    .from('valu_assessments')
    .update({user_id:targetUserId})
    .eq('id',assessmentId)
    .is('user_id',null)
  if(linkError) return Response.json({error:linkError.message},{status:500})

  const {error:identityError}=await supabase.from('assessment_identity_links').upsert({
    assessment_id:assessmentId,
    user_id:targetUserId,
    link_method:'admin_reconciliation',
    linked_by:user.id,
  },{onConflict:'assessment_id'})
  if(identityError) return Response.json({error:identityError.message},{status:500})

  const {error:journeyError}=await supabase.rpc('refresh_professional_journey',{p_user_id:targetUserId})
  if(journeyError) return Response.json({error:journeyError.message},{status:500})

  await supabase.from('platform_audit_events').insert({
    actor_user_id:user.id,
    subject_user_id:targetUserId,
    entity_type:'valu_assessment',
    entity_id:assessmentId,
    action:'admin_reconciled_assessment',
    before_state:before,
    after_state:{user_id:targetUserId,assessment_id:assessmentId},
    reason,
  })

  return Response.json({ok:true,assessmentId,targetUserId})
}
