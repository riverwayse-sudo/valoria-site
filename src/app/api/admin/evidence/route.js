import { createClient } from '@supabase/supabase-js'

function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})}

async function requireAdmin(request){
  const sb=db()
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')
  if(!token)return {sb,response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data}=await sb.auth.getUser(token)
  if(!data?.user?.id)return {sb,response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data:admin}=await sb.from('admin_users').select('id').eq('id',data.user.id).maybeSingle()
  if(!admin)return {sb,response:Response.json({error:'Admin access required.'},{status:403})}
  return {sb,user:data.user}
}

export async function GET(request){
  const {sb,response}=await requireAdmin(request)
  if(response)return response
  const {data,error}=await sb.from('professional_documents').select('id,professional_id,document_type,original_filename,mime_type,size_bytes,verification_status,verified_at,created_at,updated_at').order('created_at',{ascending:false})
  if(error)return Response.json({error:error.message},{status:500})
  const documents=await Promise.all((data||[]).map(async d=>{
    const {data:profile}=await sb.from('professional_profiles').select('display_name,headline,atb_id').eq('id',d.professional_id).maybeSingle()
    const {data:signed}=await sb.storage.from('cvs').createSignedUrl((await sb.from('professional_documents').select('storage_path').eq('id',d.id).single()).data?.storage_path,600)
    return {...d,profile,review_url:signed?.signedUrl||null}
  }))
  return Response.json({documents})
}

export async function PATCH(request){
  const {sb,user,response}=await requireAdmin(request)
  if(response)return response
  const body=await request.json().catch(()=>null)
  const id=body?.id,status=body?.status
  if(!id||!['pending','verified','rejected','unverified'].includes(status))return Response.json({error:'Valid document id and status are required.'},{status:400})
  const patch={verification_status:status,verified_at:status==='verified'?new Date().toISOString():null,verified_by:status==='verified'?user.id:null}
  const {data:doc,error}=await sb.from('professional_documents').update(patch).eq('id',id).select('id,professional_id,verification_status,verified_at,verified_by').single()
  if(error)return Response.json({error:error.message},{status:500})
  await sb.from('platform_audit_events').insert({actor_user_id:user.id,subject_user_id:doc.professional_id,entity_type:'professional_document',entity_id:doc.id,action:`document_${status}`,after_state:doc})
  return Response.json({ok:true,document:doc})
}
