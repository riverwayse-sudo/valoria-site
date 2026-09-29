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
    admin.from('valu_assessments').select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at,expires_at').eq('user_id',user.id).order('completed_at',{ascending:false}).limit(1).maybeSingle(),
    admin.from('opportunity_submissions').select('id,opportunity_id,status,created_at').eq('submitter_user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  ])

  const journey=journeyRes.data||null
  const profile=profileRes.data||null
  const capabilities=capsRes.data||[]
  const opportunity=opportunityRes.data||null

  let assessment=assessmentRes.data||null
  if(!assessment&&user.email){
    const {data:byEmail}=await admin.from('valu_assessments').select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at,expires_at,user_id').eq('email',user.email.toLowerCase()).order('completed_at',{ascending:false}).limit(1).maybeSingle()
    assessment=byEmail||null
  }

  const hasAssessment=!!(assessment?.completed_at||journey?.current_assessment_id||profile?.assessment_completed_at||profile?.valu_index!=null)
  const reportStatus=assessment?.report_status||(assessment?.ai_report?'READY':hasAssessment?'PENDING':'NOT_STARTED')
  const reportReady=['READY','EMAIL_PENDING','SENT'].includes(reportStatus)||!!assessment?.ai_report
  const reportDelivered=reportStatus==='SENT'||!!assessment?.report_email_sent_at

  const profileMissing=[]
  if(!profile?.display_name?.trim())profileMissing.push('Your name')
  if(!profile?.current_job_title?.trim()&&!profile?.headline?.trim())profileMissing.push('Your professional title')
  if(!profile?.bio?.trim())profileMissing.push('Your professional bio')
  if(!profile?.industry?.trim())profileMissing.push('Your industry')
  if(!profile?.username?.trim())profileMissing.push('Your username')
  if(!profile?.phone?.trim())profileMissing.push('Your phone number')
  if(!profile?.location?.trim())profileMissing.push('Your location')
  if(!Array.isArray(profile?.languages)||profile.languages.length===0)profileMissing.push('At least one language')
  if(!profile?.photo_url?.trim())profileMissing.push('Your profile photo')
  if(!profile?.cv_url?.trim())profileMissing.push('Your CV')

  // Profile is the professional identity layer. Capability is deliberately a
  // separate milestone so the user can build identity first and then activate
  // one or more pathways without creating a deadlock.
  const assessmentCurrent=!!assessment?.completed_at&&Number(assessment?.total_score||profile?.valu_index||0)>=35&&(!assessment?.expires_at||new Date(assessment.expires_at)>new Date())
  const profileReady=profile?.profile_complete===true&&profileMissing.length===0&&assessmentCurrent

  const activeCapability=capabilities.filter(c=>c.is_active)
  const eligibleCapabilities=activeCapability.filter(c=>c.eligible_for_listing||c.eligibility_status==='eligible'||c.eligibility_status==='listed')
  const listedCapabilities=activeCapability.filter(c=>c.eligible_for_listing&&(c.eligibility_status==='listed'||!!c.listed_at))
  const capabilityMissing=[...new Set(activeCapability.flatMap(c=>Array.isArray(c.missing_requirements)?c.missing_requirements:[]))]
  const capabilitySelected=activeCapability.length>0
  const eligibilityComplete=profileReady&&capabilitySelected&&eligibleCapabilities.length>0
  const listed=listedCapabilities.length>0&&eligibilityComplete

  // Opportunity access is a capability of an eligible/listed professional,
  // not something that becomes complete only after the first application.
  const opportunityAccess=listed
  const opportunityEngaged=!!opportunity

  let next='assess'
  if(!hasAssessment)next='assess'
  else if(!reportReady)next='report'
  else if(!profileReady)next='profile'
  else if(!capabilitySelected)next='capability'
  else if(!eligibilityComplete)next='eligibility'
  else if(!listed)next='listed'
  else next='opportunity'

  return NextResponse.json({authenticated:true,state:{
    connect:{complete:true},
    assessment:{complete:hasAssessment,current:assessmentCurrent,reportStatus,reportReady,reportDelivered,score:assessment?.total_score??profile?.valu_index??null,designation:assessment?.designation||profile?.designation||null},
    report:{complete:reportReady,delivered:reportDelivered,status:reportStatus},
    profile:{complete:profileReady,missing:profileMissing},
    capability:{complete:capabilitySelected,capabilities:activeCapability,eligible:eligibleCapabilities,missing:capabilityMissing},
    eligibility:{complete:eligibilityComplete,missing:[...new Set([...profileMissing,...capabilityMissing])],capabilities:eligibleCapabilities},
    marketplace:{complete:listed,capabilities:listedCapabilities},
    opportunity:{complete:opportunityAccess,access:opportunityAccess,engaged:opportunityEngaged,latest:opportunity},
    next,lifecycle:journey?.lifecycle_state||null
  }})
}
