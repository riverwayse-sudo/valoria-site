import { createClient } from '@supabase/supabase-js'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } }) : null
}

async function requireAdmin(request) {
  const supabase = db()
  if (!supabase) return { supabase:null, response:Response.json({error:'Service not configured.'},{status:503}) }
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'')
  if(!token) return {supabase,response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data,error}=await supabase.auth.getUser(token)
  if(error||!data?.user?.id) return {supabase,response:Response.json({error:'Not authenticated.'},{status:401})}
  const {data:admin}=await supabase.from('admin_users').select('id').eq('id',data.user.id).maybeSingle()
  if(!admin) return {supabase,response:Response.json({error:'Admin access required.'},{status:403})}
  return {supabase,user:data.user}
}

export async function POST(request) {
  const {supabase,response,user}=await requireAdmin(request)
  if(response) return response

  let body
  try { body=await request.json() } catch { return Response.json({error:'Invalid JSON.'},{status:400}) }

  const {
    professional_id,
    session_id,
    event_title,
    event_description,
    event_date,
    duration_minutes,
    attendance_reference,
    attendance_source='admin_verified',
    attended_at
  } = body || {}

  if(!professional_id || !session_id || !event_title || !event_date) {
    return Response.json({error:'professional_id, session_id, event_title and event_date are required.'},{status:400})
  }

  const {data:profile,error:profileError}=await supabase
    .from('professional_profiles')
    .select('id,display_name')
    .eq('id',professional_id)
    .maybeSingle()

  if(profileError) return Response.json({error:profileError.message},{status:500})
  if(!profile) return Response.json({error:'Professional profile not found.'},{status:404})

  const {data:event,error:eventError}=await supabase
    .from('professional_events')
    .upsert({
      session_id,
      title:event_title,
      description:event_description||null,
      event_date,
      duration_minutes:duration_minutes||null,
      status:'completed'
    },{onConflict:'session_id'})
    .select('id,session_id,title,event_date,issuer')
    .single()

  if(eventError) return Response.json({error:eventError.message},{status:500})

  const {data:attendance,error:attendanceError}=await supabase
    .from('professional_event_attendance')
    .upsert({
      event_id:event.id,
      professional_id,
      attendance_status:'present',
      attendance_source,
      attendance_reference:attendance_reference||null,
      attended_at:attended_at||event_date,
      marked_by:user.id,
      marked_at:new Date().toISOString()
    },{onConflict:'event_id,professional_id'})
    .select('id,event_id,professional_id,attendance_status')
    .single()

  if(attendanceError) return Response.json({error:attendanceError.message},{status:500})
  if(attendance.attendance_status!=='present') return Response.json({error:'Certificate requires present attendance.'},{status:409})

  const {data:existing}=await supabase
    .from('professional_certificates')
    .select('id,certificate_number,verification_token,issued_at')
    .eq('attendance_id',attendance.id)
    .maybeSingle()

  if(existing) return Response.json({attendance,certificate:existing,alreadyIssued:true})

  const year=new Date(event.event_date).getUTCFullYear()
  const suffix=crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase()
  const certificateNumber=`VAL-${year}-ATT-${suffix}`

  const {data:certificate,error:certificateError}=await supabase
    .from('professional_certificates')
    .insert({
      attendance_id:attendance.id,
      professional_id,
      certificate_number:certificateNumber,
      certificate_type:'attendance',
      title:'Certificate of Attendance',
      event_title:event.title,
      event_date:event.event_date,
      issuer:event.issuer
    })
    .select('id,certificate_number,verification_token,issued_at,event_title,event_date,issuer')
    .single()

  if(certificateError) return Response.json({error:certificateError.message},{status:500})

  await supabase.from('platform_audit_events').insert({
    actor_user_id:user.id,
    subject_user_id:professional_id,
    entity_type:'professional_certificate',
    entity_id:certificate.id,
    action:'issued',
    after_state:certificate,
    reason:'Verified event attendance'
  })

  return Response.json({
    attendance,
    certificate,
    profile:{id:profile.id,display_name:profile.display_name}
  },{status:201})
}
