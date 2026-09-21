import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'info@valoriainstitute.com'
const FROM_NAME = process.env.BREVO_FROM_NAME || 'Valoria Institute'

function dueForReminder(linkedAt, count, now = Date.now()) {
  const age = now - new Date(linkedAt).getTime()
  const days = age / 86400000
  if (count === 0) return days >= 1
  if (count === 1) return days >= 3
  if (count === 2) return days >= 7
  return days >= 14 + (count - 3) * 7
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
}

async function sendProfileReminder({ email, name, missing }) {
  if (!BREVO_KEY) return false
  const firstName = String(name || 'there').trim().split(/\s+/)[0] || 'there'
  const missingCopy = missing.length ? missing.join(', ') : 'the remaining profile details'
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: String(name || firstName) }],
      replyTo: { email: FROM_EMAIL, name: FROM_NAME },
      subject: 'Complete your Valoria professional profile',
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A1A2E;line-height:1.65"><p style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#C9A84C">VALORIA INSTITUTE</p><h2 style="font-weight:400">Your professional profile needs one more pass.</h2><p>Hi ${escapeHtml(firstName)}, your VALU result is recorded, but your professional profile is not yet complete.</p><p>Still missing: <strong>${escapeHtml(missingCopy)}</strong>.</p><a href="https://valoriainstitute.com/profile/setup" style="display:inline-block;padding:13px 22px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.08em">COMPLETE MY PROFILE →</a><p style="font-size:11px;color:#8A8578;margin-top:26px">Your profile must be complete before Valoria can make the relevant marketplace capability discoverable.</p></div>`,
      tags: ['profile-reminder', 'marketplace-completion'],
    }),
  })
  return response.ok
}

export async function GET(request) {
  const auth = request.headers.get('authorization') || ''
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!BREVO_KEY) return NextResponse.json({ ok: false, sent: 0, error: 'BREVO_API_KEY not configured.' }, { status: 501 })

  const { data: rows, error } = await admin
    .from('taster_sessions')
    .select('id,user_id,name,role,experience,linked_at,reminder_count,last_reminder_at')
    .not('user_id', 'is', null)
    .not('linked_at', 'is', null)
    .order('linked_at', { ascending: true })
    .limit(200)
  if (error) return NextResponse.json({ ok: false, error: 'Reminder queue unavailable.' }, { status: 502 })

  let sent = 0
  for (const row of rows || []) {
    const { data: profile } = await admin.from('professional_profiles').select('profile_complete,assessment_completed_at').eq('id', row.user_id).maybeSingle()
    if (!profile || profile.profile_complete) continue

    // A linked professional can be in one of two incomplete states:
    // 1) no authoritative full assessment yet -> assessment reminder
    // 2) full assessment complete but profile incomplete -> profile reminder (handled below)
    if (profile.assessment_completed_at) continue
    const count = Number(row.reminder_count || 0)
    if (!dueForReminder(row.linked_at, count)) continue

    const { data: userData } = await admin.auth.admin.getUserById(row.user_id)
    const email = userData?.user?.email
    if (!email) continue
    const firstName = String(row.name || 'there').trim().split(/\s+/)[0] || 'there'
    const assessmentUrl = `https://assessment.valoriainstitute.com/?full=1&taster_id=${encodeURIComponent(row.id)}&name=${encodeURIComponent(row.name || '')}&role=${encodeURIComponent(row.role || '')}&experience=${encodeURIComponent(row.experience || '')}`
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1A1A2E;line-height:1.65"><p style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#C9A84C">VALORIA INSTITUTE</p><h2 style="font-weight:400">Your VALU journey is not finished.</h2><p>Hi ${escapeHtml(firstName)}, your 15-question snapshot gave you a directional read. Your Valoria profile is currently <strong>Basic · Incomplete</strong>.</p><p>Complete the full VALU assessment to establish your official score and unlock the completed professional profile.</p><a href="${assessmentUrl}" style="display:inline-block;padding:13px 22px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.08em">COMPLETE THE FULL ASSESSMENT →</a><p style="font-size:11px;color:#8A8578;margin-top:26px">You can complete your professional profile after the assessment.</p></div>`
    try {
      const send = await fetch('https://api.brevo.com/v3/smtp/email', { method:'POST', headers:{'api-key':BREVO_KEY,'Content-Type':'application/json'}, body:JSON.stringify({sender:{name:FROM_NAME,email:FROM_EMAIL},to:[{email,name:row.name}],subject:'Complete your VALU Index',htmlContent:html,tags:['valu-reminder','assessment-completion']}) })
      if (!send.ok) continue
      await admin.from('taster_sessions').update({ reminder_count: count + 1, last_reminder_at: new Date().toISOString() }).eq('id', row.id)
      sent += 1
    } catch {}
  }

  const { data: assessedProfiles } = await admin
    .from('professional_profiles')
    .select('id,display_name,profile_complete,photo_url,created_at,assessment_completed_at,active_tracks,industry,username,phone,current_job_title')
    .eq('profile_complete', false)
    .not('assessment_completed_at', 'is', null)
    .order('created_at', { ascending: true })
    .limit(200)

  let profileReminders = 0
  for (const profile of assessedProfiles || []) {
    const completedAt = profile.assessment_completed_at || profile.created_at
    const ageDays = (Date.now() - new Date(completedAt).getTime()) / 86400000
    if (ageDays < 1) continue

    const { data: assessment } = await admin
      .from('valu_assessments')
      .select('id,profile_reminder_sent_at')
      .eq('user_id', profile.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!assessment || assessment.profile_reminder_sent_at) continue

    const missing = []
    if (!profile.display_name) missing.push('your name')
    if (!profile.headline) missing.push('your headline')
    if (!profile.bio) missing.push('your bio')
    if (!profile.photo_url) missing.push('your profile photo')
    if (!profile.active_tracks?.length) missing.push('your path')
    if (!profile.industry) missing.push('your industry')
    if (!profile.username) missing.push('your username')
    if (!profile.phone) missing.push('your phone number')
    if (!profile.current_job_title) missing.push('your current job title')
    if (!profile.location) missing.push('your location')
    if (!profile.languages?.length) missing.push('your languages')
    if (!profile.assessment_completed_at) missing.push('your full VALU assessment')

    const { data: userData } = await admin.auth.admin.getUserById(profile.id)
    const email = userData?.user?.email
    if (!email) continue

    try {
      const ok = await sendProfileReminder({ email, name: profile.display_name || userData.user.user_metadata?.display_name, missing })
      if (!ok) continue
      await admin.from('valu_assessments').update({ profile_reminder_sent_at: new Date().toISOString() }).eq('id', assessment.id)
      profileReminders += 1
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, profile_reminders: profileReminders })
}
