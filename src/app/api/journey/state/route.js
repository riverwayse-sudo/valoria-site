import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request) {
  if (!SB_URL || !SB_ANON || !SERVICE) return NextResponse.json({ error: 'Journey service is not configured.' }, { status: 503 })
  const supabase = createServerClient(SB_URL, SB_ANON, { cookies:{ getAll:()=>request.cookies.getAll(), setAll:()=>{} } })
  const { data:{user} }=await supabase.auth.getUser()
  if (!user) return NextResponse.json({ authenticated:false, state:null })
  const admin=createClient(SB_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}})
  const [journeyRes,profileRes,capsRes,assessmentRes,opportunityRes]=await Promise.all([
    admin.from('professional_journey').select('*').eq('user_id',user.id).maybeSingle(),
    admin.from('professional_profiles').select('*').eq('id',user.id).maybeSingle(),
    admin.from('professional_capabilities').select('id,capability,is_active,eligibility_status,eligible_for_listing,listed_at,missing_requirements').eq('professional_id',user.id).eq('is_active',true),
    admin.from('valu_assessments').select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at').eq('user_id',user.id).order('completed_at',{ascending:false}).limit(1).maybeSingle(),
    admin.from('opportunity_submissions').select('id,opportunity_id,status,created_at').eq('submitter_user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  ])
  const journey=journeyRes.data||null, profile=profileRes.data||null, capabilities=capsRes.data||[], assessment=assessmentRes.data||null, opportunity=opportunityRes.data||null
  const hasAssessment=!!(assessment?.completed_at||journey?.current_assessment_id||profile?.assessment_completed_at||profile?.valu_index!=null)
  const reportStatus=assessment?.report_status||(assessment?.ai_report?'READY':hasAssessment?'PENDING':'NOT_STARTED')
  const reportReady=['READY','EMAIL_PENDING','SENT'].includes(reportStatus)||!!assessment?.ai_report
  const reportDelivered=reportStatus==='SENT'||!!assessment?.report_email_sent_at
  const profileMissing=[]
  if(!profile?.display_name?.trim())profileMissing.push('Your name')
  if(!profile?.current_job_title?.trim()&&!profile?.headline?.trim())profileMissing.push('Your professional title')
  if(!profile?.bio?.trim())profileMissing.push('Your professional bio')
  if(!profile?.industry?.trim())profileMissing.push('Your industry')
  if(!profile?.photo_url?.trim())profileMissing.push('Your profile photo')
  const profileReady=profile?.profile_complete===true&&profileMissing.length===0
  const activeCapability=capabilities.filter(c=>c.is_active)
  const eligibleCapabilities=activeCapability.filter(c=>c.eligible_for_listing||c.eligibility_status==='eligible'||c.eligibility_status==='listed')
  const listedCapabilities=activeCapability.filter(c=>c.eligible_for_listing&&(c.eligibility_status==='listed'||!!c.listed_at))
  const eligible=eligibleCapabilities.length>0||journey?.eligibility_state==='eligible'||journey?.eligibility_state==='listed'||journey?.marketplace_ready===true
  const listed=profile?.listing_status==='listed'||listedCapabilities.length>0||journey?.marketplace_ready===true
  const opportunityEngaged=!!opportunity
  let next='assess'
  if(!hasAssessment)next='assess'
  else if(!reportReady)next='report'
  else if(!profileReady)next='profile'
  else if(!activeCapability.length)next='capability'
  else if(!eligible)next='eligibility'
  else if(!listed)next='marketplace'
  else if(!opportunityEngaged)next='opportunity'
  else next='opportunity'
  return NextResponse.json({authenticated:true,state:{connect:{complete:true},assessment:{complete:hasAssessment,reportStatus,reportReady,reportDelivered,score:assessment?.total_score??profile?.valu_index??null,designation:assessment?.designation||profile?.designation||null},profile:{complete:profileReady,missing:profileMissing},capability:{complete:activeCapability.length>0,capabilities:activeCapability},eligibility:{complete:eligible,missing:activeCapability.filter(c=>!c.eligible_for_listing&&c.missing_requirements).flatMap(c=>Array.isArray(c.missing_requirements)?c.missing_requirements:[]),capabilities:eligibleCapabilities},marketplace:{complete:listed,capabilities:listedCapabilities},opportunity:{complete:opportunityEngaged,latest:opportunity},next,lifecycle:journey?.lifecycle_state||null}})
}
