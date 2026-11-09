import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request) {
  if (!URL || !ANON || !SERVICE) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const sessionClient = createServerClient(URL, ANON, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return NextResponse.json({ authenticated: false, matches: [] }, { status: 401 })

  const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })
  const now = new Date().toISOString()
  const results = await Promise.all([
    admin.from('professional_profiles')
      .select('id,industry,preferred_industries,skills,listing_status,visibility,eligible_for_listing,profile_complete,is_test,revoked_at')
      .eq('id', user.id)
      .maybeSingle(),
    admin.from('professional_capabilities')
      .select('capability')
      .eq('professional_id', user.id)
      .eq('is_active', true)
      .eq('eligible_for_listing', true)
      .eq('eligibility_status', 'listed'),
    admin.from('opportunities')
      .select('id,slug,title,summary,description,organisation_name,location,work_mode,opportunity_type,industry,capabilities,skills,closing_at,status,access_level')
      .eq('status', 'published')
      .eq('access_level', 'public')
      .or('closing_at.is.null,closing_at.gt.' + now)
      .order('published_at', { ascending: false })
      .limit(50),
  ])

  const [profileResult, capabilitiesResult, opportunitiesResult] = results
  const queryErrors = results.filter(result => result.error)
  if (queryErrors.length) {
    return NextResponse.json({ error: 'Opportunity matching could not read all required data.' }, { status: 502 })
  }

  const profile = profileResult.data
  if (!profile || profile.is_test || profile.revoked_at || profile.visibility !== 'public'
    || profile.listing_status !== 'listed' || profile.eligible_for_listing !== true || profile.profile_complete !== true) {
    return NextResponse.json({ authenticated: true, matches: [] })
  }

  const capabilities = new Set((capabilitiesResult.data || []).map(item => String(item.capability).toLowerCase()))
  const skills = new Set((profile.skills || []).map(item => String(item).toLowerCase()))
  const industries = new Set([profile.industry, ...(profile.preferred_industries || [])]
    .filter(Boolean).map(item => String(item).toLowerCase()))

  const matches = (opportunitiesResult.data || [])
    .map(opportunity => {
      let rank = 0
      const reasons = []
      if ((opportunity.capabilities || []).some(item => capabilities.has(String(item).toLowerCase()))) {
        rank += 50
        reasons.push('Capability match')
      }
      if (opportunity.industry && industries.has(String(opportunity.industry).toLowerCase())) {
        rank += 25
        reasons.push('Industry match')
      }
      if ((opportunity.skills || []).some(item => skills.has(String(item).toLowerCase()))) {
        rank += 15
        reasons.push('Skill match')
      }
      return { ...opportunity, match_reasons: reasons, _rank: rank }
    })
    .filter(opportunity => opportunity._rank > 0)
    .sort((a, b) => b._rank - a._rank)
    .slice(0, 10)
    .map(({ _rank, ...opportunity }) => opportunity)

  return NextResponse.json({ authenticated: true, matches })
}
