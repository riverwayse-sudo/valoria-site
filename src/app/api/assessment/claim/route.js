import {createClient} from '@supabase/supabase-js'
function norm(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}
export async function POST(request){
 const body=await request.json().catch(()=>null)
 const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')
 if(!token)return Response.json({error:'Not authenticated.'},{status:401})
 const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user},error:authError}=await sb.auth.getUser(token)
 if(authError||!user?.email)return Response.json({error:'Not authenticated.'},{status:401})
 const email=user.email.toLowerCase()
 const requestedTaster=String(body?.taster_id||'').trim()
 let candidate=null,linkMethod='email_claim',taster=null
 if(requestedTaster){
   const {data:t,error}=await sb.from('taster_sessions').select('id,name,role,experience,user_id').eq('id',requestedTaster).maybeSingle()
   if(error)return Response.json({error:error.message},{status:500})
   if(!t)return Response.json({error:'That previous Valoria snapshot could not be found.'},{status:404})
   if(t.user_id&&t.user_id!==user.id)return Response.json({error:'That Valoria snapshot is already connected to another account.'},{status:409})
   const metadataName=user.user_metadata?.display_name||user.user_metadata?.full_name||''
   if(metadataName&&t.name&&norm(metadataName)!==norm(t.name))return Response.json({error:'The account identity does not match the saved Valoria snapshot.'},{status:403})
   taster=t
   const {data:byTaster,error:assessmentError}=await sb.from('valu_assessments').select('id,user_id,name,role,total_score,completed_at,assessment_version,scoring_version,rubric_version,taster_id').eq('taster_id',requestedTaster).not('completed_at','is',null).order('completed_at',{ascending:false}).limit(1).maybeSingle()
   if(assessmentError)return Response.json({error:assessmentError.message},{status:500})
   candidate=byTaster

   // Legacy full assessments may already belong to this authenticated account
   // but predate persisted taster_id. Recover only through the immutable user_id,
   // never through name-only or date-only matching.
   if(!candidate){
     const {data:owned,error:ownedError}=await sb.from('valu_assessments')
       .select('id,user_id,name,role,total_score,completed_at,assessment_version,scoring_version,rubric_version,taster_id')
       .eq('user_id',user.id).is('taster_id',null).not('completed_at','is',null)
       .order('completed_at',{ascending:false}).limit(10)
     if(ownedError)return Response.json({error:ownedError.message},{status:500})
     candidate=(owned||[]).find(a=>norm(a.name)===norm(t.name)&&norm(a.role)===norm(t.role))||null
   }
   if(!candidate)return Response.json({error:'No completed assessment is securely connected to this snapshot. The records have been preserved for manual reconciliation.'},{status:404})
   if(norm(candidate.name)!==norm(t.name)||norm(candidate.role)!==norm(t.role))return Response.json({error:'The completed assessment does not match this snapshot identity. The records were left unchanged for manual reconciliation.'},{status:409})
   if(candidate.user_id&&candidate.user_id!==user.id)return Response.json({error:'This assessment is already connected to another account.'},{status:409})
   linkMethod='taster_handoff'
 } else {
   const {data:a,error}=await sb.from('valu_assessments').select('id,user_id,total_score,completed_at,assessment_version,scoring_version,rubric_version,taster_id').ilike('email',email).not('completed_at','is',null).order('completed_at',{ascending:false}).limit(10)
   if(error)return Response.json({error:error.message},{status:500})
   candidate=(a||[]).find(x=>!x.user_id||x.user_id===user.id)
 }
 if(!candidate)return Response.json({error:'No previous completed VALU assessment could be securely matched to this account.'},{status:404})
 if(candidate.user_id&&candidate.user_id!==user.id)return Response.json({error:'This assessment is already connected to another account.'},{status:409})
 if(!candidate.user_id || (requestedTaster && !candidate.taster_id)){
   const patch={user_id:user.id}
   if(requestedTaster && !candidate.taster_id)patch.taster_id=requestedTaster
   let update=sb.from('valu_assessments').update(patch).eq('id',candidate.id)
   if(!candidate.user_id)update=update.is('user_id',null)
   if(requestedTaster && !candidate.taster_id)update=update.is('taster_id',null)
   const {error:uerr}=await update
   if(uerr)return Response.json({error:uerr.message},{status:500})
   const {data:linked,error:verifyError}=await sb.from('valu_assessments').select('id,user_id,taster_id').eq('id',candidate.id).maybeSingle()
   if(verifyError||linked?.user_id!==user.id||(requestedTaster&&linked?.taster_id!==requestedTaster))return Response.json({error:'The assessment claim could not be verified. Please retry.'},{status:502})
   candidate={...candidate,user_id:linked.user_id,taster_id:linked.taster_id}
 }
 if(taster){
   const {error:terr}=await sb.from('taster_sessions').update({user_id:user.id,linked_at:new Date().toISOString()}).eq('id',taster.id).is('user_id',null)
   if(terr)return Response.json({error:terr.message},{status:500})
   const {data:linkedTaster,error:verifyTaster}=await sb.from('taster_sessions').select('id,user_id,linked_at').eq('id',taster.id).maybeSingle()
   if(verifyTaster||linkedTaster?.user_id!==user.id||!linkedTaster?.linked_at)return Response.json({error:'The previous snapshot claim could not be verified. Please retry.'},{status:502})
 }
 const {data:existingIdentity,error:identityLookupError}=await sb.from('assessment_identity_links').select('assessment_id,user_id').eq('assessment_id',candidate.id).maybeSingle()
 if(identityLookupError)return Response.json({error:'Assessment linked, but the identity record could not be checked.'},{status:502})
 if(existingIdentity&&existingIdentity.user_id!==user.id)return Response.json({error:'The assessment identity record belongs to another account. Valoria support must review it.'},{status:409})
 const {error:identityError}=await sb.from('assessment_identity_links').upsert({assessment_id:candidate.id,user_id:user.id,link_method:linkMethod,linked_by:user.id},{onConflict:'assessment_id'})
 if(identityError)return Response.json({error:'Assessment linked, but the identity record could not be persisted.'},{status:502})
 const {data:journey, error:journeyError}=await sb.rpc('refresh_professional_journey',{p_user_id:user.id})
 if(journeyError)return Response.json({error:'Assessment linked, but journey state could not be refreshed.',detail:journeyError.message},{status:502})
 const {error:auditError}=await sb.from('platform_audit_events').insert({actor_user_id:user.id,subject_user_id:user.id,entity_type:'assessment',entity_id:candidate.id,action:'claimed_existing_assessment',after_state:{score:candidate.total_score,completed_at:candidate.completed_at,assessment_version:candidate.assessment_version,link_method:linkMethod,taster_id:candidate.taster_id||taster?.id||null}})
 if(auditError)return Response.json({error:'Assessment linked, but the audit event could not be recorded.',detail:auditError.message},{status:502})
 return Response.json({ok:true,assessment:candidate,journey,continuity:{tasterLinked:!!taster,assessmentLinked:true,next:'/dashboard'}})
}