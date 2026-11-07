import { createClient } from '@supabase/supabase-js'
import { isSubmissionKey, normalizeOpportunityInput } from '@/lib/opportunityValidation'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
}

async function requireAdmin(request) {
  const supabase = db()
  if (!supabase) return { response: Response.json({ error: 'Service not configured.' }, { status: 503 }) }
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return { response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user?.id) return { response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', data.user.id).maybeSingle()
  if (!admin) return { response: Response.json({ error: 'Valoria administrator access required.' }, { status: 403 }) }
  return { supabase, user: data.user }
}

export async function POST(request) {
  const { supabase, user, response } = await requireAdmin(request)
  if (response) return response
  const body = await request.json().catch(() => null)
  if (!isSubmissionKey(body?.submission_key)) return Response.json({ error: 'Please refresh the form and try again.' }, { status: 400 })

  const normalized = normalizeOpportunityInput(body)
  if (normalized.error) return Response.json({ error: normalized.error }, { status: 400 })

  const { data, error } = await supabase.rpc('create_admin_opportunity', {
    p_submission_key: body.submission_key,
    p_admin_user_id: user.id,
    p_opportunity: normalized.opportunity,
    p_submission_payload: { ...body, created_by_valoria_admin: true, published_by: user.id }
  })
  if (error) {
    console.error('Administrator opportunity publishing failed:', error.message)
    if (error.code === '42501') return Response.json({ error: 'Valoria administrator access required.' }, { status: 403 })
    const status = error.code === '22023' ? 400 : 500
    return Response.json({ error: status === 400 ? error.message : 'The job could not be published. Please try again.' }, { status })
  }
  const result = Array.isArray(data) ? data[0] : data
  if (!result?.opportunity_id || !result?.slug) return Response.json({ error: 'The job publication could not be confirmed.' }, { status: 500 })
  return Response.json({ ok: true, id: result.opportunity_id, slug: result.slug, status: 'published', created: result.created }, { status: result.created ? 201 : 200 })
}
