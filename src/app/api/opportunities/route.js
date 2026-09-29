import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function db(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
}
function slugify(s){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)}
function clientKey(request,email){
  const forwarded=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown'
  const ip=forwarded.split(',')[0].trim()
  return createHash('sha256').update(`${ip}:${email.toLowerCase().trim()}`).digest('hex')
}
export async function GET(){
  const sb=db()
  const {data,error}=await sb.from('opportunities').select('id,slug,title,opportunity_type,summary,organisation_name,location,work_mode,employment_type,experience_level,industry,capabilities,skills,compensation,application_method,application_url,closing_at').eq('status','published').eq('access_level','public').or('closing_at.is.null,closing_at.gt.'+new Date().toISOString()).order('published_at',{ascending:false})
  if(error)return Response.json({error:error.message},{status:500})
  return Response.json({opportunities:data||[]})
}
export async function POST(request){
  const body=await request.json().catch(()=>null)
  if(body?.website)return Response.json({ok:true,status:'pending_review'})
  if(!body?.title||!body?.description||!body?.organisation_name||!body?.submitter_name||!body?.submitter_email)return Response.json({error:'Title, description, organisation, name and email are required.'},{status:400})
  const email=String(body.submitter_email).trim().toLowerCase()
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'Please provide a valid email address.'},{status:400})
  if(String(body.title).length>180||String(body.description).length>10000||String(body.organisation_name).length>180||String(body.submitter_name).length>140)return Response.json({error:'One or more fields exceed the allowed length.'},{status:400})
  const sb=db()
  const {data:allowed,error:rateError}=await sb.rpc('consume_opportunity_submission_rate_limit',{p_key_hash:clientKey(request,email),p_limit:5,p_window_seconds:3600})
  if(rateError)return Response.json({error:'Submission service is temporarily unavailable.'},{status:503})
  if(!allowed)return Response.json({error:'Too many submissions. Please try again later.'},{status:429})
  let slug=slugify(body.title)
  const {data:existing}=await sb.from('opportunities').select('id').eq('slug',slug).maybeSingle()
  if(existing)slug=slug+'-'+Date.now().toString().slice(-6)
  const {data:op,error:opError}=await sb.from('opportunities').insert({slug,title:body.title,opportunity_type:body.opportunity_type||'job',summary:body.summary||null,description:body.description,organisation_name:body.organisation_name,location:body.location||null,work_mode:body.work_mode||null,employment_type:body.employment_type||null,experience_level:body.experience_level||null,industry:body.industry||null,capabilities:body.capabilities||[],skills:body.skills||[],compensation:body.compensation||null,application_method:body.application_url?'external':'valoria',application_url:body.application_url||null,closing_at:body.closing_at||null,status:'pending_review',access_level:'public'}).select('id').single()
  if(opError)return Response.json({error:opError.message},{status:500})
  const {error:subError}=await sb.from('opportunity_submissions').insert({opportunity_id:op.id,submitter_name:body.submitter_name,submitter_email:email,organisation_name:body.organisation_name,payload:body,status:'pending_review'})
  if(subError){
    await sb.from('opportunities').delete().eq('id',op.id)
    return Response.json({error:subError.message},{status:500})
  }
  return Response.json({ok:true,id:op.id,status:'pending_review'})
}