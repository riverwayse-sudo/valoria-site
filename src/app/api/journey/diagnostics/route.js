import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
const { deriveJourneyState } = require('@/lib/journey-state')

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request) {
  if (!URL || !ANON || !SERVICE) return NextResponse.json({ error: 'Journey service is not configured.' }, { status: 503 })
  const auth = createServerClient(URL, ANON, { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } })
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })
  const [profileRes, assessmentRes, capabilitiesRes, activationRes, documentsRes, opportunityRes] = await Promise.all([
    admin.from('professional_profiles').select('*').eq('id', user.id).maybeSingle(),
    admin.from('valu_assessments').select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at,expires_at').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('professional_capabilities').select('id,capability,is_active,eligibility_status,eligible_for_listing,listed_at,missing_requirements').eq('professional_id', user.id).eq('is_active', true),
    admin.from('professional_value_activation').select('*').eq('professional_id', user.id).maybeSingle(),
    admin.from('professional_documents').select('id,document_type,verification_status,verified_at').eq('professional_id', user.id).order('created_at', { ascending: false }),
    admin.from('opportunity_submissions').select('id,opportunity_id,status,created_at').eq('submitter_user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  const queryErrors = [profileRes, assessmentRes, capabilitiesRes, activationRes, documentsRes, opportunityRes].filter(r => r.error)
  if (queryErrors.length) {
    return NextResponse.json({
      ok: false,
      error: 'Journey diagnostics could not read all required state.',
      query_errors: queryErrors.map(r => r.error.message),
    }, { status: 502 })
  }

  let assessment = assessmentRes.data
  if (!assessment && user.email) {
    const { data, error } = await admin.from('valu_assessments')
      .select('id,completed_at,report_status,ai_report,report_email_sent_at,total_score,designation,created_at,expires_at')
      .eq('email', user.email.toLowerCase()).order('completed_at', { ascending: false }).limit(1).maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: 'Historical assessment lookup failed.' }, { status: 502 })
    assessment = data
  }

  const state = deriveJourneyState({
    assessment,
    profile: profileRes.data,
    capabilities: capabilitiesRes.data || [],
    activation: activationRes.data,
    documents: documentsRes.data || [],
    opportunity: opportunityRes.data,
  })

  const checks = [
    { key: 'assessment', pass: state.assessment.complete, status: state.assessment.complete ? 'pass' : 'pending', detail: state.assessment.complete ? 'Completed VALU is linked.' : 'No completed VALU is linked.' },
    { key: 'report', pass: state.report.ready, status: state.report.ready ? 'pass' : state.assessment.complete ? 'pending' : 'blocked', detail: state.report.ready ? 'Report is readable.' : state.assessment.complete ? 'Assessment is complete but report is not ready.' : 'Report cannot start before assessment.' },
    { key: 'activation', pass: state.report.valueActivationComplete, status: state.report.valueActivationComplete ? 'pass' : state.report.ready ? 'pending' : 'blocked', detail: state.report.valueActivationComplete ? 'Value activation is persisted.' : 'Value activation is not complete.' },
    { key: 'profile', pass: state.profile.complete, status: state.profile.complete ? 'pass' : state.report.valueActivationComplete ? 'pending' : 'blocked', detail: state.profile.complete ? 'Professional profile is complete.' : state.recoveryReason },
    { key: 'capability', pass: state.capability.complete, status: state.capability.complete ? 'pass' : state.profile.complete ? 'pending' : 'blocked', detail: state.capability.complete ? 'At least one active capability exists.' : 'No active capability is selected.' },
    { key: 'eligibility', pass: state.eligibility.complete, status: state.eligibility.complete ? 'pass' : state.capability.complete ? 'pending' : 'blocked', detail: state.eligibility.complete ? 'At least one capability is eligible.' : 'Eligibility is not complete.' },
    { key: 'listing', pass: state.marketplace.complete, status: state.marketplace.complete ? 'pass' : state.eligibility.complete ? 'pending' : 'blocked', detail: state.marketplace.complete ? 'At least one eligible capability is listed.' : 'No listed capability is active.' },
    { key: 'opportunity_access', pass: state.opportunity.access, status: state.opportunity.access ? 'pass' : state.marketplace.complete ? 'pending' : 'blocked', detail: state.opportunity.access ? 'Opportunity access is unlocked.' : 'Opportunity access is not unlocked.' },
  ]

  const laterWithoutEarlier = [
    ['report', state.report.ready, state.assessment.complete],
    ['activation', state.report.valueActivationComplete, state.report.ready],
    ['profile', state.profile.complete, state.report.valueActivationComplete],
    ['capability', state.capability.complete, state.profile.complete],
    ['eligibility', state.eligibility.complete, state.capability.complete],
    ['listing', state.marketplace.complete, state.eligibility.complete],
    ['opportunity_access', state.opportunity.access, state.marketplace.complete],
  ].filter(([, later, earlier]) => later && !earlier)

  if (laterWithoutEarlier.length) {
    return NextResponse.json({
      ok: false,
      error: 'Journey invariant violation.',
      checks,
      invariant_failures: laterWithoutEarlier.map(([name]) => name),
      state,
    }, { status: 409 })
  }

  return NextResponse.json({
    ok: true,
    checks,
    state,
    all_required_reads_verified: true,
    tested_at: new Date().toISOString(),
  })
}
