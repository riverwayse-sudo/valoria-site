import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

async function getUser(request) {
  if (!URL || !ANON || !SERVICE) return { error: NextResponse.json({ error: 'Service unavailable.' }, { status: 503 }) }
  const sb = createServerClient(URL, ANON, { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } })
  const { data: { user }, error } = await sb.auth.getUser()
  if (error) return { error: NextResponse.json({ error: 'Authentication could not be verified.' }, { status: 401 }) }
  if (!user) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  return { user, admin: createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } }) }
}

export async function GET(request) {
  const { user, admin, error } = await getUser(request)
  if (error) return error
  const { data, error: dbError } = await admin
    .from('opportunity_applications')
    .select('id,opportunity_id,professional_id,cover_note,status,created_at,updated_at,opportunities(id,slug,title,organisation_name,location,work_mode)')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false })
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 502 })
  return NextResponse.json({ applications: data || [] })
}

export async function POST(request) {
  const { user, admin, error } = await getUser(request)
  if (error) return error

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }
  const opportunityId = String(body?.opportunity_id || '').trim()
  const coverNote = String(body?.cover_note || '').trim()
  if (!opportunityId) return NextResponse.json({ error: 'opportunity_id is required.' }, { status: 400 })
  if (coverNote.length > 5000) return NextResponse.json({ error: 'Cover note is too long.' }, { status: 400 })

  const [{ data: opportunity, error: opportunityError }, { data: profile, error: profileError }] = await Promise.all([
    admin.from('opportunities').select('id,slug,title,status,access_level,closing_at,application_method').eq('id', opportunityId).maybeSingle(),
    admin.from('professional_profiles').select('id,listing_status,eligible_for_listing,profile_complete').eq('id', user.id).maybeSingle(),
  ])
  if (opportunityError || profileError) return NextResponse.json({ error: 'Application prerequisites could not be verified.' }, { status: 502 })
  if (!opportunity) return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 })
  if (opportunity.status !== 'published' || (opportunity.closing_at && new Date(opportunity.closing_at) <= new Date())) {
    return NextResponse.json({ error: 'This opportunity is no longer accepting applications.' }, { status: 409 })
  }
  if (!profile?.id || !(profile.listing_status === 'listed' || profile.eligible_for_listing === true)) {
    return NextResponse.json({ error: 'Complete the Valoria professional journey and become listed before applying.' }, { status: 403 })
  }

  const { data: application, error: insertError } = await admin
    .from('opportunity_applications')
    .insert({
      opportunity_id: opportunityId,
      professional_id: user.id,
      applicant_email: user.email || null,
      cover_note: coverNote || null,
      status: 'submitted',
    })
    .select('id,opportunity_id,professional_id,cover_note,status,created_at,updated_at')
    .single()

  if (insertError) {
    if (insertError.code === '23505') return NextResponse.json({ error: 'You have already applied to this opportunity.' }, { status: 409 })
    return NextResponse.json({ error: insertError.message }, { status: 502 })
  }

  const { error: outcomeError } = await admin.from('professional_outcome_events').insert({
    professional_id: user.id,
    opportunity_id: opportunityId,
    event_type: 'application',
    metadata: { application_id: application.id },
  })
  if (outcomeError) {
    return NextResponse.json({
      ok: true,
      application,
      telemetry_recorded: false,
      warning: 'Application was saved, but the opportunity outcome event could not be recorded.',
    }, { status: 202 })
  }

  return NextResponse.json({ ok: true, application, telemetry_recorded: true })
}
