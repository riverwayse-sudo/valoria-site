import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
const URL=process.env.NEXT_PUBLIC_SUPABASE_URL,ANON=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY
const STATUSES=new Set(['submitted','reviewing','shortlisted','introduced','interview','selected','declined','withdrawn'])
async function ctx(request){
 if(!URL||!ANON||!SERVICE)return {error:NextResponse.json({error:'Service unavailable.'},{status:503})}
 const sb=createServerClient(URL,ANON,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}})
 const {data:{user},error}=await sb.auth.getUser();if(error)return {error:NextResponse.json({error:'Authentication could not be verified.'},{status:401})};if(!user)return {error:NextResponse.json({error:'Authentication required.'},{status:401})}
 return {user,admin:createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})}
}
export async function GET(request){
 const {user,admin,error}=await ctx(request);if(error)return error
 const {data,error:dbError}=await admin.from('opportunity_applications').select('id,opportunity_id,professional_id,applicant_email,cover_note,status,created_at,updated_at,opportunities!inner(id,slug,title,organisation_name,employer_id,created_by),professional_profiles:professional_id(id,display_name,headline,current_job_title,photo_url,valu_index,designation,active_tracks)').or(`employer_id.eq.${user.id},created_by.eq.${user.id}`,{referencedTable:'opportunities'}).order('created_at',{ascending:false})
 if(dbError)return NextResponse.json({error:dbError.message},{status:502})
 return NextResponse.json({applications:data||[]})
}
export async function PATCH(request){
 const {user,admin,error}=await ctx(request);if(error)return error
 let body;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request body.'},{status:400})}
 if(!body?.id||!STATUSES.has(body.status))return NextResponse.json({error:'Valid application id and status are required.'},{status:400})
 const {data:app,error:readError}=await admin.from('opportunity_applications').select('id,opportunity_id,professional_id,status,opportunities!inner(employer_id,created_by)').eq('id',body.id).maybeSingle()
 if(readError)return NextResponse.json({error:readError.message},{status:502});if(!app)return NextResponse.json({error:'Application not found.'},{status:404})
 const employerId=app.opportunities?.employer_id||app.opportunities?.created_by
 if(employerId!==user.id)return NextResponse.json({error:'You do not manage this opportunity.'},{status:403})
 const {data:updated,error:updateError}=await admin.from('opportunity_applications').update({status:body.status,updated_at:new Date().toISOString()}).eq('id',app.id).select('id,status,updated_at').single()
 if(updateError)return NextResponse.json({error:updateError.message},{status:502})
 const {error:auditError}=await admin.from('platform_audit_events').insert({actor_user_id:user.id,subject_user_id:app.professional_id,entity_type:'opportunity_application',entity_id:app.id,action:'application_status_changed',before_state:{status:app.status},after_state:{status:body.status}})
 if(auditError)return NextResponse.json({ok:true,application:updated,audit_recorded:false,warning:'Status changed but audit event could not be recorded.'},{status:202})
 return NextResponse.json({ok:true,application:updated,audit_recorded:true})
}
