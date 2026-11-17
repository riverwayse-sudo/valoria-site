import { createClient } from '@supabase/supabase-js'
import adminAuth from '@/lib/server/admin-auth.cjs'

const { authorizeAdmin } = adminAuth

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET(request) {
  const supabase = db()
  const auth = await authorizeAdmin(request, supabase)
  if (auth.response) return auth.response

  const { data, error } = await supabase
    .from('placement_cases')
    .select('*,opportunities:opportunity_id(title,organisation_name,slug)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ cases: data || [] })
}

export async function PATCH(request) {
  const supabase = db()
  const auth = await authorizeAdmin(request, supabase)
  if (auth.response) return auth.response

  const body = await request.json().catch(() => null) || {}
  const allowed = ['sourcing', 'introduced', 'interview', 'offer', 'placed', 'closed', 'declined']
  if (!body.id || !allowed.includes(body.status)) {
    return Response.json({ error: 'Valid case id and status are required.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('placement_cases')
    .update({ status: body.status, assigned_admin: auth.user.id, notes: body.notes || null })
    .eq('id', body.id)
    .select('*')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await supabase.from('platform_audit_events').insert({
    actor_user_id: auth.user.id,
    subject_user_id: data.professional_id,
    entity_type: 'placement_case',
    entity_id: data.id,
    action: 'placement_' + body.status,
    after_state: data,
  })

  return Response.json({ ok: true, case: data })
}
