import { createClient } from '@supabase/supabase-js'
function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
async function requireAdmin(request){
 const supabase=db(); if(!supabase)return {response:Response.json({error:'Service not configured.'},{status:503})}
 const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')
 if(!token)return {response:Response.json({error:'Not authenticated.'},{status:401})}
 const {data,error}=await supabase.auth.getUser(token)
 if(error||!data?.user?.id)return {response:Response.json({error:'Not authenticated.'},{status:401})}
 const {data:admin}=await supabase.from('admin_users').select('id').eq('id',data.user.id).maybeSingle()
 if(!admin)return {response:Response.json({error:'Admin access required.'},{status:403})}
 return {supabase,user:data.user}
}
export async function GET(request){
 const {supabase,response}=await requireAdmin(request); if(response)return response
 const {data,error}=await supabase.from('opportunity_submissions').select('*').order('created_at',{ascending:false})
 if(error)return Response.json({error:error.message},{status:500})
 const ids=[...(data||[]).map(x=>x.opportunity_id).filter(Boolean)]
 let opportunities=[]
 if(ids.length){const r=await supabase.from('opportunities').select('*').in('id',ids); if(r.error)return Response.json({error:r.error.message},{status:500}); opportunities=r.data||[]}
 const map=new Map(opportunities.map(o=>[o.id,o]))
 return Response.json({submissions:(data||[]).map(s=>({...s,opportunity:map.get(s.opportunity_id)||null}))})
}
export async function PATCH(request){
 const {supabase,user,response}=await requireAdmin(request); if(response)return response
 let body; try{body=await request.json()}catch{return Response.json({error:'Invalid JSON.'},{status:400})}
 const {submissionId,status,adminNotes=''}=body||{}
 const allowed=['pending_review','approved','rejected','changes_requested']
 if(!submissionId||!allowed.includes(status))return Response.json({error:'Valid submissionId and status are required.'},{status:400})
 const {data:submission,error:se}=await supabase.from('opportunity_submissions').select('*').eq('id',submissionId).single()
 if(se||!submission)return Response.json({error:'Submission not found.'},{status:404})
 const now=new Date().toISOString()
 const {error:ue}=await supabase.from('opportunity_submissions').update({status,admin_notes:adminNotes,reviewed_by:user.id,reviewed_at:now}).eq('id',submissionId)
 if(ue)return Response.json({error:ue.message},{status:500})
 if(submission.opportunity_id){
   const opportunityStatus=status==='approved'?'published':status==='rejected'?'rejected':'pending_review'
   const patch={status:opportunityStatus,reviewed_by:user.id,reviewed_at:now,review_notes:adminNotes}
   if(opportunityStatus==='published')patch.published_at=now
   const {error:oe}=await supabase.from('opportunities').update(patch).eq('id',submission.opportunity_id)
   if(oe)return Response.json({error:oe.message},{status:500})
 }
 return Response.json({ok:true,status})
}
