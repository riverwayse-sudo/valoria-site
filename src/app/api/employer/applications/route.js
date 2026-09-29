import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
// Build-safe employer application route: all related records are resolved in separate queries.
const STATUSES = new Set(['submitted', 'reviewing', 'shortlisted', 'introduced', 'interview', 'selected', 'declined', 'withdrawn'])

async function context(request) {
  if (!URL || !ANON || !SERVICE) return { error: NextResponse.json({ error: 'Service unavailable.' }, { status: 503 }) }
  const auth = createServerClient(URL, ANON, { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } })
  const { data: { user }, error: authError } = await auth.auth.getUser()
  if (authError) return { error: NextResponse.json({ error: 'Authentication could not be verified.' }, { status: 401 }) }
  if (!user) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  return { user, admin: createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } }) }
}

async function managedOpportunities(admin, userId) {
  const { data, error } = await admin
    .from('opportunities')
    .select('id,slug,title,organisation_name,employer_id,created_by')
    .or(`employer_id.eq.${userId},created_by.eq.${userId}`)
  if (error) return { error }
  return { opportunities: data || [] }
}

export async function GET(request) {
  const { user, admin, error } = await context(request)
  if (error) return error

  const managed = await managedOpportunities(admin, user.id)
  if (managed.error) return NextResponse.json({ error: managed.error.message }, { status: 502 })
  const opportunities = managed.opportunities
  const ids = opportunities.map(o => o.id)
  if (!ids.length) return NextResponse.json({ applications: [] })

  const { data: applications, error: appError } = await admin
    .from('opportunity_applications')
    .select('id,opportunity_id,professional_id,applicant_email,cover_note,status,created_at,updated_at')
    .in('opportunity_id', ids)
    .order('created_at', { ascending: false })
  if (appError) return NextResponse.json({ error: appError.message }, { status: 502 })

  const professionalIds = [...new Set((applications || []).map(a => a.professional_id).filter(Boolean))]
  const { data: profiles, error: profileError } = professionalIds.length
    ? await admin.from('professional_profiles').select('id,display_name,headline,current_job_title,photo_url,valu_index,designation,active_tracks').in('id', professionalIds)
    : { data: [], error: null }
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 502 })

  const opportunityMap = new Map(opportunities.map(o => [o.id, o]))
  const profileMap = new Map((profiles || []).map(p => [p.id, p]))
  return NextResponse.json({
    applications: (applications || []).map(a => ({
      ...a,
      opportunities: opportunityMap.get(a.opportunity_id) || null,
      professional_profiles: profileMap.get(a.professional_id) || null,
    })),
  })
}

export async function PATCH(request) {
  const { user, admin, error } = await context(request)
  if (error) return error

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }
  if (!body?.id || !STATUSES.has(body.status)) return NextResponse.json({ error: 'Valid application id and status are required.' }, { status: 400 })

  const { data: app, error: readError } = await admin
    .from('opportunity_applications')
    .select('id,opportunity_id,professional_id,status')
    .eq('id', body.id)
    .maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 502 })
  if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 })

  const managed = await managedOpportunities(admin, user.id)
  if (managed.error) return NextResponse.json({ error: managed.error.message }, { status: 502 })
  if (!managed.opportunities.some(o => o.id === app.opportunity_id)) {
    return NextResponse.json({ error: 'You do not manage this opportunity.' }, { status: 403 })
  }

  const { data: updated, error: updateError } = await admin
    .from('opportunity_applications')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', app.id)
    .select('id,status,updated_at')
    .single()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 502 })

  const { error: auditError } = await admin.from('platform_audit_events').insert({
    actor_user_id: user.id,
    subject_user_id: app.professional_id,
    entity_type: 'opportunity_application',
    entity_id: app.id,
    action: 'application_status_changed',
    before_state: { status: app.status },
    after_state: { status: body.status },
  })
  if (auditError) return NextResponse.json({ ok: true, application: updated, audit_recorded: false, warning: 'Status changed but audit event could not be recorded.' }, { status: 202 })

  return NextResponse.json({ ok: true, application: updated, audit_recorded: true })
}
