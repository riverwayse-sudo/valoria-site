// src/app/api/admin/analytics/route.js
// Career-type and training-priority analytics for the admin Reports tab.

import { createClient } from '@supabase/supabase-js'
import adminAuth from '@/lib/server/admin-auth.cjs'

const { authorizeAdmin } = adminAuth

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function topCounts(items, n = 10) {
  const counts = {}
  for (const raw of items) {
    const key = (raw || '').trim()
    if (!key) continue
    counts[key] = (counts[key] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }))
}

export async function GET(request) {
  const supabase = getSupabase()
  if (!supabase) return Response.json({ error: 'Analytics service is not configured.' }, { status: 503 })

  const auth = await authorizeAdmin(request, supabase)
  if (auth.response) return auth.response

  const { data: profileMetrics, error: profileMetricsError } = await supabase
    .from('professional_profiles')
    .select('id,is_test,profile_complete,listing_status')
  if (profileMetricsError) {
    console.error('Admin analytics: professional_profiles query failed:', profileMetricsError)
    return Response.json({ error: 'Could not load registered profile data.' }, { status: 500 })
  }
  const profileRows = profileMetrics || []
  const excludedIds = new Set(profileRows.filter(p => p.listing_status === 'unlisted').map(p => p.id))
  // Registration is independent of profile completion, consent, and public listing.
  const registeredProfiles = profileRows.filter(p => p.is_test !== true).length
  const completeProfiles = profileRows.filter(p => p.is_test !== true && p.profile_complete === true).length
  const listedProfiles = profileRows.filter(p => p.is_test !== true && p.listing_status === 'listed').length

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
  const trainingPriorities = clusters.map(key => {
    const values = clean.map(a => a[key]).filter(v => v != null)
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : null
    return { cluster: key[0].toUpperCase(), label: clusterLabels[key], average: avg != null ? Math.round(avg * 10) / 10 : null, sampleSize: values.length }
  }).filter(c => c.average != null).sort((a, b) => a.average - b.average)

  const SCORE_BUCKETS = [[0, 19], [20, 34], [35, 49], [50, 64], [65, 79], [80, 100]]
  const scoreDistribution = SCORE_BUCKETS.map(([lo, hi]) => ({
    label: `${lo}–${hi}`,
    count: clean.filter(a => a.total_score != null && a.total_score >= lo && a.total_score <= hi).length,
    unlocksListing: lo >= 35,
  }))

  const withAccounts = clean.filter(a => a.user_id)
  let incompleteProfiles = []
  if (withAccounts.length) {
    const { data: profiles } = await supabase.from('professional_profiles').select('id, profile_complete').in('id', withAccounts.map(a => a.user_id))
    const completeIds = new Set((profiles || []).filter(p => p.profile_complete).map(p => p.id))
    incompleteProfiles = withAccounts.filter(a => !completeIds.has(a.user_id)).map(a => ({ name: a.name, email: a.email, designation: a.designation, totalScore: a.total_score, completedAt: a.completed_at }))
  }

  const { count: waitlistSignups } = await supabase.from('waitlist').select('id', { count: 'exact', head: true })
  return Response.json({ totalAssessments: clean.length, waitlistSignups: waitlistSignups ?? 0, registeredProfiles, completeProfiles, listedProfiles, careerTypes, industries, trainingPriorities, scoreDistribution, incompleteProfiles })
}
