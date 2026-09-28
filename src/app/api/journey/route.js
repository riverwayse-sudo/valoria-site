import { createClient } from '@supabase/supabase-js'
export async function GET(request){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key) return Response.json({error:'Service unavailable.'},{status:503})
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\\s+/i,'')
  if(!token) return Response.json({error:'Not authenticated.'},{status:401})
  const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:{user},error}=await sb.auth.getUser(token)
  if(error||!user) return Response.json({error:'Not authenticated.'},{status:401})
  const {data,error:refreshError}=await sb.rpc('refresh_professional_journey',{p_user_id:user.id})
  if(refreshError) return Response.json({error:refreshError.message},{status:500})
  const {data:assessment}=await sb.from('valu_assessments').select('id,total_score,p_score,r_score,i_score,m_score,e_score,completed_at,assessment_version,scoring_version,rubric_version,ai_report').eq('id',data.current_assessment_id).maybeSingle()
  return Response.json({journey:data,assessment})
}