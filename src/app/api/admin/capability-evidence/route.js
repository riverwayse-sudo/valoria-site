import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
  return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null
}
async function requireAdmin(request){
  const db=adminClient()
  if(!db) return {response:NextResponse.json({error:'Review service is unavailable.'},{status:503})}
  const token=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if(!token) return {response:NextResponse.json({error:'Not authenticated.'},{status:401})}
  const {data:{user},error}=await db.auth.getUser(token)
  if(error||!user) return {response:NextResponse.json({error:'Not authenticated.'},{status:401})}
  const {data:admin}=await db.from('admin_users').select('id').eq('id',user.id).maybeSingle()
  if(!admin) return {response:NextResponse.json({error:'Admin access required.'},{status:403})}
  return {db,user}
}

export async function GET(request){
  const {db,response}=await requireAdmin(request)
  if(response) return response
  const url=new URL(request.url)
  let query=db.from('professional_documents').select('id,professional_id,capability_id,document_type,storage_bucket,storage_path,original_filename,mime_type,size_bytes,verification_status,created_at,professional_capabilities(capability)').order('created_at',{ascending:false}).limit(300)
  const status=url.searchParams.get('status')
  if(['pending','verified','rejected','unverified'].includes(status)) query=query.eq('verification_status',status)
  const {data:documents,error}=await query
  if(error) return NextResponse.json({error:'Could not load capability evidence.'},{status:500})
  const profileIds=[...new Set((documents||[]).map(d=>d.professional_id))]
  const {data:profiles,error:profileError}=profileIds.length
    ? await db.from('professional_profiles').select('id,display_name,atb_id').in('id',profileIds)
    : {data:[],error:null}
  if(profileError) return NextResponse.json({error:'Could not load professional evidence owners.'},{status:500})
  const profileById=Object.fromEntries((profiles||[]).map(profile=>[profile.id,profile]))
  const ids=(documents||[]).map(d=>d.id)
  const {data:reviews,error:reviewError}=ids.length?await db.from('professional_document_reviews').select('id,document_id,capability_id,decision,notes,reviewed_by,reviewed_at').in('document_id',ids).order('reviewed_at',{ascending:false}):{data:[],error:null}
  if(reviewError) return NextResponse.json({error:'Could not load evidence review history.'},{status:500})
  const latest={}
  for(const review of reviews||[]) if(!latest[review.document_id]) latest[review.document_id]=review
  const signedDocuments=await Promise.all((documents||[]).map(async document=>{
    const {data,error}=await db.storage.from(document.storage_bucket).createSignedUrl(document.storage_path,300)
    return {...document,professional_profiles:profileById[document.professional_id]||null,preview_url:error?null:data?.signedUrl||null}
  }))
  return NextResponse.json({documents:signedDocuments,reviews:reviews||[],latestByDocument:latest})
}

export async function POST(request){
  const {db,user,response}=await requireAdmin(request)
  if(response) return response
  let body
  try{body=await request.json()}catch{return NextResponse.json({error:'Invalid review request.'},{status:400})}
  const documentId=String(body?.document_id||'')
  const decision=String(body?.decision||'')
  const notes=String(body?.notes||'').trim()
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if(!uuid.test(documentId)||!['approved','changes_requested','rejected'].includes(decision)||!notes||notes.length>3000)
    return NextResponse.json({error:'A valid document, decision and review note (max 3,000 characters) are required.'},{status:400})
  const {data:result,error:reviewError}=await db.rpc('record_professional_document_review',{
    p_document_id:documentId,
    p_decision:decision,
    p_notes:notes,
    p_reviewed_by:user.id
  })
  if(reviewError) {
    const message=reviewError.message||''
    const status=message.includes('not found')?404:message.includes('authorised')?403:400
    return NextResponse.json({error:status===404?'Evidence record not found.':status===403?'Admin access required.':'The review could not be recorded. Please verify the decision and notes.'},{status})
  }
  return NextResponse.json({ok:true,...result},{status:201})
}
