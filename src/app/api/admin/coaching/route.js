import { createClient } from '@supabase/supabase-js'
import { authorizeAdmin } from '@/lib/server/admin-auth'

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
    .from('coaching_requests')
    .select('*,professional:professional_id(display_name,headline,atb_id),coach:coach_professional_id(display_name,headline,atb_id)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ requests: data || [] })
}

export async function PATCH(request) {
  const supabase = db()
  const auth = await authorizeAdmin(request, supabase)
  if (auth.response) return auth.response

  const body = await request.json().catch(() => null) || {}
  const statuses = ['requested', 'matched', 'scheduled', 'active', 'completed', 'closed']
  if (!body.id || !statuses.includes(body.status)) {
    return Response.json({ error: 'Valid request id and status are required.' }, { status: 400 })
  }

  const patch = {
    status: body.status,
    coach_professional_id: body.coach_professional_id || null,
    admin_notes: body.admin_notes || null,
  }
  const { data, error } = await supabase
    .from('coaching_requests')
    .update(patch)
    .eq('id', body.id)
    .select('*')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await supabase.from('platform_audit_events').insert({
    actor_user_id: auth.user.id,
    subject_user_id: data.professional_id,
    entity_type: 'coaching_request',
    entity_id: data.id,
    action: 'coaching_' + body.status,
    after_state: data,
  })

  return Response.json({ ok: true, request: data })
}
