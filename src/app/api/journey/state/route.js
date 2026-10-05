import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
const { deriveJourneyState } = require('@/lib/journey-state')

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request) {
  if (!SB_URL || !SB_ANON || !SERVICE) {
    return NextResponse.json({ error: 'Journey service is not configured.' }, { status: 503 })
  }

  const supabase = createServerClient(SB_URL, SB_ANON, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) return NextResponse.json({ error: 'Authentication could not be verified.' }, { status: 401 })
  if (!user) return NextResponse.json({ authenticated: false, state: null })

  const admin = createClient(SB_URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // The database state engine is the source of truth. It evaluates the
  // current journey before the UI derives presentation state from it.
  const { data: journey, error: journeyError } = await admin.rpc(
    'refresh_professional_journey',
    { p_user_id: user.id }
  )

  if (journeyError) {
    return NextResponse.json({
      authenticated: true,
      error: 'Journey state could not be refreshed.',
      detail: journeyError.message,
    }, { status: 502 })
  }

  const results = await Promise.all([
    admin.from('professional_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),
    admin.from('professional_capabilities')
      .select('id,capability,is_active,eligibility_status,eligible_for_listing,listed_at,missing_requirements')
      .eq('professional_id', user.id)
      .eq('is_active', true),
    admin.from('valu_assessments')
      .select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at,expires_at,user_id')
      .eq('id', journey.current_assessment_id)
      .maybeSingle(),
    admin.from('opportunity_submissions')
      .select('id,opportunity_id,status,created_at')
      .eq('submitter_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('professional_value_activation')
      .select('*')
      .eq('professional_id', user.id)
      .maybeSingle(),
    admin.from('professional_documents')
      .select('id,document_type,verification_status,verified_at')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const queryErrors = results.filter(r => r.error)
  if (queryErrors.length) {
    return NextResponse.json({
      authenticated: true,
      error: 'Journey state could not be read completely.',
      query_errors: queryErrors.map(r => r.error.message),
    }, { status: 502 })
  }

  const [profileRes, capsRes, assessmentRes, opportunityRes, activationRes, documentsRes] = results
  let assessment = assessmentRes.data || null

  // Preserve historical assessment continuity for accounts whose assessment
  // was linked by email before user_id was populated.
  if (!assessment && user.email) {
    const { data: byEmail, error } = await admin.from('valu_assessments')
      .select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at,expires_at,user_id')
      .eq('email', user.email.toLowerCase())
      .order('completed_at', { ascending: false, nullsLast: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({
        error: 'Historical assessment lookup failed.',
        detail: error.message,
      }, { status: 502 })
    }
    assessment = byEmail || null
  }

  const state = deriveJourneyState({
    journey,
    assessment,
    profile: profileRes.data || null,
    capabilities: capsRes.data || [],
    activation: activationRes.data || null,
    documents: documentsRes.data || [],
    opportunity: opportunityRes.data || null,
  })

  return NextResponse.json({
    authenticated: true,
    state: {
      connect: { complete: true },
      ...state,
    },
    tested_at: new Date().toISOString(),
  })
}
