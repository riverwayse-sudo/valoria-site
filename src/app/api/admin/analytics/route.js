// src/app/api/admin/analytics/route.js
//
// Career-type and training-priority analytics for the admin Reports tab.
// Built server-side with the service role for two reasons:
//
// 1. valu_assessments has RLS enabled with zero SELECT policies — it's
//    correctly locked down (contains names, emails, raw answers), but
//    that also means the admin panel's existing client-side query against
//    it (for "Assessments completed" and the score-distribution chart)
//    has been silently returning nothing this whole time. Not a crash,
//    just quietly empty — same failure shape as the messages/enquiries
//    bug found earlier this session. This route fixes that by reading it
//    server-side instead, properly admin-gated.
// 2. Aggregation (career types, average cluster scores) belongs server-
//    side regardless — no reason to ship every raw row to the browser
//    just to count it there.
//
// "Real-time" here means the admin page polls this route periodically
// rather than a websocket subscription — valu_assessments' RLS lockout
// would block a client-side realtime channel the same way it blocks a
// direct query, and for aggregate stats a short poll interval is
// genuinely indistinguishable from live for a human looking at a
// dashboard, without the added complexity.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function topCounts(items, n = 10) {
  const counts = {}
  for (const raw of items) {
    const key = (raw || '').trim()
    if (!key) continue
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }))
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: callerData, error: callerErr } = await supabase.auth.getUser(token)
  if (callerErr || !callerData?.user?.id) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const { data: adminRow } = await supabase.from('admin_users').select('id').eq('id', callerData.user.id).maybeSingle()
  if (!adminRow) return Response.json({ error: 'Admin access required.' }, { status: 403 })

  // Exclude assessments belonging to profiles we've already moderated off
  // the site (e.g. test entries like the SoftPro Mixer one) — a
  // principled filter tied to real decisions already made, rather than
  // guessing at what's "junk" from free-text content.
  const { data: unlisted } = await supabase.from('professional_profiles').select('id').eq('listing_status', 'unlisted')
  const excludedIds = new Set((unlisted || []).map(p => p.id))

  const { data: assessments, error: assessmentsError } = await supabase
    .from('valu_assessments')
    .select('user_id, name, email, role, industry, designation, p_score, r_score, i_score, m_score, e_score, total_score, completed_at')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (assessmentsError) {
    console.error('Admin analytics: valu_assessments query failed:', assessmentsError)
    return Response.json({ error: 'Could not load assessment data.' }, { status: 500 })
  }

  const clean = (assessments || []).filter(a => !excludedIds.has(a.user_id))

  const careerTypes = topCounts(clean.map(a => a.role))
  const industries = topCounts(clean.map(a => a.industry))

  const clusters = ['p_score', 'r_score', 'i_score', 'm_score', 'e_score']
  const clusterLabels = { p_score: 'Presence', r_score: 'Relationships', i_score: 'Intelligence', m_score: 'Mastery', e_score: 'Enterprise' }
  const trainingPriorities = clusters
    .map(key => {
      const values = clean.map(a => a[key]).filter(v => v != null)
      const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : null
      return { cluster: key[0].toUpperCase(), label: clusterLabels[key], average: avg != null ? Math.round(avg * 10) / 10 : null, sampleSize: values.length }
    })
    .filter(c => c.average != null)
    .sort((a, b) => a.average - b.average)

  const SCORE_BUCKETS = [[0, 19], [20, 34], [35, 49], [50, 64], [65, 79], [80, 100]]
  const scoreDistribution = SCORE_BUCKETS.map(([lo, hi]) => ({
    label: `${lo}\u2013${hi}`,
    count: clean.filter(a => a.total_score != null && a.total_score >= lo && a.total_score <= hi).length,
    unlocksListing: lo >= 35,
  }))

  // Signed up and finished the assessment, but never completed their
  // profile — the exact population send-profile-reminder.js (valoria-
  // platform) nudges by email. Surfacing it here too so admin can see who
  // it is, not just trust the automated email fired. Excludes rows with no
  // user_id (assessment taken but no account created yet at all — that's
  // a different, earlier funnel stage, not "signed up but incomplete").
  const withAccounts = clean.filter(a => a.user_id)
  let incompleteProfiles = []
  if (withAccounts.length) {
    const { data: profiles } = await supabase
      .from('professional_profiles')
      .select('id, profile_complete')
      .in('id', withAccounts.map(a => a.user_id))
    const completeIds = new Set((profiles || []).filter(p => p.profile_complete).map(p => p.id))
    incompleteProfiles = withAccounts
      .filter(a => !completeIds.has(a.user_id))
      .map(a => ({ name: a.name, email: a.email, designation: a.designation, totalScore: a.total_score, completedAt: a.completed_at }))
  }

  return Response.json({
    totalAssessments: clean.length,
    careerTypes,
    industries,
    trainingPriorities,
    scoreDistribution,
    incompleteProfiles,
    incompleteProfilesCount: incompleteProfiles.length,
    generatedAt: new Date().toISOString(),
  })
}
