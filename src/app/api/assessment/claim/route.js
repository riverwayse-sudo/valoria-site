import {createClient} from '@supabase/supabase-js'
export async function POST(request){
 const body=await request.json().catch(()=>null)
 const token=(request.headers.get('authorization')||'').replace(/^Bearer\\s+/i,'')
 if(!token)return Response.json({error:'Not authenticated.'},{status:401})
 const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user},error:authError}=await sb.auth.getUser(token)
 if(authError||!user?.email)return Response.json({error:'Not authenticated.'},{status:401})
 const email=(body?.email||user.email).trim().toLowerCase()\n const tasterId=body?.taster_id||null
 if(email!==user.email.toLowerCase())return Response.json({error:'For security, use the email address on your Valoria account.'},{status:403})
 const {data:a,error}=await sb.from('valu_assessments').select('id,user_id,total_score,completed_at,assessment_version,scoring_version,rubric_version,taster_id').ilike('email',email).not('completed_at','is',null).order('completed_at',{ascending:false}).limit(20)
 if(error)return Response.json({error:error.message},{status:500})
 const candidate=(a||[]).find(x=>(tasterId ? x.taster_id===tasterId : true) && (!x.user_id||x.user_id===user.id))
 if(!candidate)return Response.json({error:'No unlinked completed VALU assessment was found for this account.'},{status:404})
 if(!candidate.user_id){
   const {error:uerr}=await sb.from('valu_assessments').update({user_id:user.id}).eq('id',candidate.id).is('user_id',null)
   if(uerr)return Response.json({error:uerr.message},{status:500})
 }
 await sb.from('assessment_identity_links').upsert({assessment_id:candidate.id,user_id:user.id,link_method:tasterId?'taster_claim':'email_claim',linked_by:user.id},{onConflict:'assessment_id'})\n if(candidate.taster_id){ await sb.from('taster_sessions').update({user_id:user.id,linked_at:new Date().toISOString()}).eq('id',candidate.taster_id).is('user_id',null) }
 const {data:journey}=await sb.rpc('refresh_professional_journey',{p_user_id:user.id})
 await sb.from('platform_audit_events').insert({actor_user_id:user.id,subject_user_id:user.id,entity_type:'assessment',entity_id:candidate.id,action:'claimed_existing_assessment',after_state:{score:candidate.total_score,completed_at:candidate.completed_at,assessment_version:candidate.assessment_version}})
 return Response.json({ok:true,assessment:candidate,journey})
}