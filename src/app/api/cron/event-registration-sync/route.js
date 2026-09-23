import { createClient } from '@supabase/supabase-js'
import { EVENT_SESSIONS, syncEventRegistrationToBrevo } from '@/lib/eventRegistrationBrevo'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role configuration is missing.')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const auth = request.headers.get('authorization') || ''
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rows, error } = await admin
    .from('professional_standard_event_registrations')
    .select('session_id,full_name,email,role,organisation,whatsapp,brevo_synced,brevo_attempt_count')
    .eq('brevo_synced', false)
    .lt('brevo_attempt_count', 10)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return Response.json({ ok: false, error: 'Registration sync queue unavailable.' }, { status: 502 })

  let attempted = 0
  let synced = 0
  for (const row of rows || []) {
    const session = EVENT_SESSIONS[row.session_id]
    if (!session) continue
    attempted += 1
    try {
      const result = await syncEventRegistrationToBrevo({
        email: row.email,
        fullName: row.full_name,
        role: row.role || '',
        organisation: row.organisation || '',
        whatsapp: row.whatsapp || '',
        session,
      })
      await getAdmin().from('professional_standard_event_registrations').update({
        brevo_synced: result.synced,
        confirmation_email_sent: result.emailSent,
        brevo_last_attempt_at: new Date().toISOString(),
        brevo_attempt_count: Number(row.brevo_attempt_count || 0) + 1,
        brevo_last_error: result.errorCode,
      }).eq('session_id', row.session_id).eq('email', row.email)
      if (result.synced) synced += 1
    } catch (error) {
      await getAdmin().from('professional_standard_event_registrations').update({
        brevo_last_attempt_at: new Date().toISOString(),
        brevo_attempt_count: Number(row.brevo_attempt_count || 0) + 1,
        brevo_last_error: String(error?.message || 'BREVO_SYNC_FAILED').slice(0, 160),
      }).eq('session_id', row.session_id).eq('email', row.email)
    }
  }

  return Response.json({ ok: true, attempted, synced })
}
