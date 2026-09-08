import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BREVO_KEY = process.env.BREVO_API_KEY

function dueForReminder(linkedAt, count, now = Date.now()) {
  const age = now - new Date(linkedAt).getTime()
  const days = age / 86400000
  if (count === 0) return days >= 1
  if (count === 1) return days >= 3
  if (count === 2) return days >= 7
  return days >= 14 + (count - 3) * 7
}

export async function GET(request) {
  const auth = request.headers.get('authorization') || ''
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!BREVO_KEY) return NextResponse.json({ ok: false, sent: 0, error: 'BREVO_API_KEY not configured.' }, { status: 501 })

  const { data: rows, error } = await admin
    .from('taster_sessions')
    .select('id,user_id,name,role,linked_at,reminder_count,last_reminder_at')
    .not('user_id', 'is', null)
    .not('linked_at', 'is', null)
    .order('linked_at', { ascending: true })
    .limit(200)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 502 })

  let sent = 0
  for (const row of rows || []) {
    const { data: profile } = await admin.from('professional_profiles').select('profile_complete,assessment_completed_at').eq('id', row.user_id).maybeSingle()
    if (!profile || profile.profile_complete || profile.assessment_completed_at) continue
    const count = Number(row.reminder_count || 0)
    if (!dueForReminder(row.linked_at, count)) continue

    const { data: userData } = await admin.auth.admin.getUserById(row.user_id)
    const email = userData?.user?.email
    if (!email) continue
    const firstName = String(row.name || 'there').trim().split(/\s+/)[0] || 'there'
    const assessmentUrl = `https://assessment.valoriainstitute.com/?full=1&taster_id=${encodeURIComponent(row.id)}&name=${encodeURIComponent(row.name || '')}&role=${encodeURIComponent(row.role || '')}&experience=${encodeURIComponent('')}`
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A1A2E;line-height:1.65"><p style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#C9A84C">VALORIA INSTITUTE</p><h2 style="font-weight:400">Your VALU journey is not finished.</h2><p>Hi ${firstName}, your 15-question snapshot gave you a directional read. Your Valoria profile is currently <strong>Basic · Incomplete</strong>.</p><p>Complete the full VALU assessment to establish your official score and unlock the completed professional profile.</p><a href="${assessmentUrl}" style="display:inline-block;padding:13px 22px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.08em">COMPLETE THE FULL ASSESSMENT →</a><p style="font-size:11px;color:#8A8578;margin-top:26px">You can complete your professional profile after the assessment.</p></div>`
    try {
      const send = await fetch('https://api.brevo.com/v3/smtp/email', { method:'POST', headers:{'api-key':BREVO_KEY,'Content-Type':'application/json'}, body:JSON.stringify({sender:{name:'Valoria Institute',email:'info@valoriainstitute.com'},to:[{email,name:row.name}],subject:'Complete your VALU Index',htmlContent:html,tags:['valu-reminder','assessment-completion']}) })
      if (!send.ok) continue
      await admin.from('taster_sessions').update({ reminder_count: count + 1, last_reminder_at: new Date().toISOString() }).eq('id', row.id)
      sent += 1
    } catch {}
  }

  return NextResponse.json({ ok: true, sent })
}
