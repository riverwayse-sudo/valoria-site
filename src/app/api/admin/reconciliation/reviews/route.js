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
const SOURCE_TYPES=new Set(['assessment','taster','profile'])
const CANDIDATE_TYPES=new Set(['assessment','taster','profile','account'])
const DECISIONS=new Set(['verified_match','candidate_match','conflict','unmatched','resolved_no_link'])
const EVIDENCE_TYPES=new Set(['stable_id','authenticated_account','verified_email','submission_log','release_log','admin_documentation','manual_review','other'])
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const norm=value=>String(value||'').trim().toLowerCase().replace(/\s+/g,' ')

export async function GET(request) {
  const {supabase,response}=await requireAdmin(request)
  if(response) return response
  const url=new URL(request.url)
  const sourceRecordType=url.searchParams.get('sourceRecordType')
  const sourceRecordId=url.searchParams.get('sourceRecordId')
  let query=supabase.from('identity_reconciliation_reviews').select('id,source_record_type,source_record_id,candidate_record_type,candidate_record_id,decision,evidence_type,evidence_reference,notes,reviewed_by,reviewed_at,created_at').order('reviewed_at',{ascending:false}).limit(500)
  if(sourceRecordType && SOURCE_TYPES.has(sourceRecordType)) query=query.eq('source_record_type',sourceRecordType)
  if(sourceRecordId && UUID.test(sourceRecordId)) query=query.eq('source_record_id',sourceRecordId)
  const {data,error}=await query
  if(error) return Response.json({error:'Could not load the reconciliation review ledger.'},{status:500})
  const reviews=data||[]
  const latestBySource={}
  for(const review of reviews){
    const key=review.source_record_type+':'+review.source_record_id
    if(!latestBySource[key]) latestBySource[key]=review
  }
  const latest=Object.values(latestBySource)
  const linkReviews=latest.filter(review=>review.source_record_type==='assessment'&&review.decision==='verified_match'&&review.candidate_record_type==='taster'&&review.candidate_record_id)
  const ownerReviews=latest.filter(review=>review.source_record_type==='taster'&&review.decision==='verified_match'&&review.candidate_record_type==='account'&&review.candidate_record_id)
  const assessmentIds=[...new Set(linkReviews.map(review=>review.source_record_id))]
  const tasterIds=[...new Set([...linkReviews.map(review=>review.candidate_record_id),...ownerReviews.map(review=>review.source_record_id)])]
  const assessmentsById={},tastersById={},candidateByTasterId={}
  if(assessmentIds.length||tasterIds.length){
    const [assessmentRows,tasterRows,candidateRows]=await Promise.all([
      assessmentIds.length ? supabase.from('valu_assessments').select('id,user_id,taster_id,name,role').in('id',assessmentIds) : Promise.resolve({data:[],error:null}),
      tasterIds.length ? supabase.from('taster_sessions').select('id,user_id,name,role,completed_at').in('id',tasterIds) : Promise.resolve({data:[],error:null}),
      tasterIds.length ? supabase.from('taster_identity_candidates').select('taster_id,linked_user_id').in('taster_id',tasterIds) : Promise.resolve({data:[],error:null}),
    ])
    if(assessmentRows.error||tasterRows.error||candidateRows.error) return Response.json({error:'Could not confirm whether reviewed identity corrections have been applied.'},{status:500})
    for(const row of assessmentRows.data||[]) assessmentsById[row.id]=row
    for(const row of tasterRows.data||[]) tastersById[row.id]=row
    for(const row of candidateRows.data||[]) candidateByTasterId[row.taster_id]=row
  }
  for(const review of linkReviews){
    const assessment=assessmentsById[review.source_record_id]
    const taster=tastersById[review.candidate_record_id]
    const applied=Boolean(assessment&&taster&&assessment.taster_id===taster.id&&assessment.user_id&&assessment.user_id===taster.user_id&&norm(assessment.name)===norm(taster.name)&&norm(assessment.role)===norm(taster.role))
    review.application_state=applied?'applied':'awaiting_link'
  }
  for(const review of ownerReviews){
    const taster=tastersById[review.source_record_id]
    const candidate=candidateByTasterId[review.source_record_id]
    const applied=Boolean(taster&&taster.completed_at&&taster.user_id===review.candidate_record_id&&(!candidate||candidate.linked_user_id===review.candidate_record_id))
    review.application_state=applied?'owner_applied':'awaiting_owner_link'
  }
  const summary={reviewed_sources:latest.length,verified_match:0,candidate_match:0,conflict:0,unmatched:0,resolved_no_link:0,applied:0,open:0,closed:0}
  for(const review of latest){
    summary[review.decision]=(summary[review.decision]||0)+1
    if(review.application_state==='applied'||review.application_state==='owner_applied') summary.applied++
    if(review.decision==='resolved_no_link'||review.application_state==='applied'||review.application_state==='owner_applied') summary.closed++
    else summary.open++
  }
  return Response.json({reviews,latestBySource,summary})
}

export async function POST(request) {
  const {supabase,response,user}=await requireAdmin(request)
  if(response) return response
  let body
  try { body=await request.json() } catch { return Response.json({error:'Invalid request body.'},{status:400}) }
  const sourceRecordType=String(body?.sourceRecordType||'')
  const sourceRecordId=String(body?.sourceRecordId||'')
  const candidateRecordType=body?.candidateRecordType ? String(body.candidateRecordType) : null
  const candidateRecordId=body?.candidateRecordId ? String(body.candidateRecordId) : null
  const decision=String(body?.decision||'')
  const evidenceType=String(body?.evidenceType||'')
  const evidenceReference=body?.evidenceReference ? String(body.evidenceReference).trim() : null
  const notes=String(body?.notes||'').trim()
  if(!SOURCE_TYPES.has(sourceRecordType)||!UUID.test(sourceRecordId)) return Response.json({error:'A valid source record type and ID are required.'},{status:400})
  if(!DECISIONS.has(decision)||!EVIDENCE_TYPES.has(evidenceType)) return Response.json({error:'Choose a valid decision and evidence type.'},{status:400})
  if(!notes||notes.length>3000) return Response.json({error:'Review notes are required and must be 3,000 characters or fewer.'},{status:400})
  if((candidateRecordType&&!CANDIDATE_TYPES.has(candidateRecordType))||(candidateRecordId&&!UUID.test(candidateRecordId))||Boolean(candidateRecordType)!==Boolean(candidateRecordId)) return Response.json({error:'Candidate type and UUID must be supplied together.'},{status:400})
  if(evidenceReference&&evidenceReference.length>500) return Response.json({error:'Evidence reference must be 500 characters or fewer.'},{status:400})
  if(decision==='verified_match'&&(!candidateRecordId||!evidenceReference||!['stable_id','authenticated_account','verified_email','submission_log','release_log','admin_documentation'].includes(evidenceType))) return Response.json({error:'A verified match requires a candidate and traceable evidence.'},{status:400})
  if(decision==='resolved_no_link'&&candidateRecordId) return Response.json({error:'A no-link resolution cannot name a candidate.'},{status:400})

  const sourceTable={assessment:'valu_assessments',taster:'taster_sessions',profile:'professional_profiles'}[sourceRecordType]
  const {data:source,error:sourceError}=await supabase.from(sourceTable).select('id').eq('id',sourceRecordId).maybeSingle()
  if(sourceError) return Response.json({error:'Could not verify the source record.'},{status:500})
  if(!source) return Response.json({error:'Source record does not exist.'},{status:404})
  if(candidateRecordId) {
    if(candidateRecordType==='account') {
      const {data:account,error}=await supabase.auth.admin.getUserById(candidateRecordId)
      if(error||!account?.user) return Response.json({error:'Candidate account does not exist.'},{status:404})
    } else {
      const table={assessment:'valu_assessments',taster:'taster_sessions',profile:'professional_profiles'}[candidateRecordType]
      const {data:candidate,error}=await supabase.from(table).select('id').eq('id',candidateRecordId).maybeSingle()
      if(error) return Response.json({error:'Could not verify the candidate record.'},{status:500})
      if(!candidate) return Response.json({error:'Candidate record does not exist.'},{status:404})
    }
  }
  const {data,error}=await supabase.from('identity_reconciliation_reviews').insert({
    source_record_type:sourceRecordType,source_record_id:sourceRecordId,
    candidate_record_type:candidateRecordType,candidate_record_id:candidateRecordId,
    decision,evidence_type:evidenceType,evidence_reference:evidenceReference,
    notes,reviewed_by:user.id
  }).select('id,source_record_type,source_record_id,candidate_record_type,candidate_record_id,decision,evidence_type,evidence_reference,notes,reviewed_by,reviewed_at').single()
  if(error) return Response.json({error:'Review could not be saved to the audit ledger.'},{status:500})
  return Response.json({ok:true,review:data},{status:201})
}
