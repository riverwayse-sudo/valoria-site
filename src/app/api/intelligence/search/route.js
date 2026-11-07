import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SOURCE = 'marketplace_public_roster'
const FIELDS = 'professional_id,full_name,location,languages,headline,current_job_title,capability,track,capabilities,atb_id,display_initials,photo_url,industry,skills,topics,programme_types,availability,assessment_summary,designation,availability_status'

function cleanText(value, max = 240) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

function searchable(row) {
  return [
    row.full_name, row.location, row.headline, row.current_job_title, row.industry,
    row.capability, row.track, ...(row.capabilities || []), ...(row.skills || []),
    ...(row.topics || []), ...(row.programme_types || []), row.assessment_summary,
  ].filter(Boolean).join(' ').toLowerCase()
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Capability search is not configured in this environment.' }, { status: 503 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Enter a role, topic or capability to search.' }, { status: 400 })
  }

  const query = cleanText(body?.query, 240)
  const capability = cleanText(body?.capability, 24).toLowerCase()
  const location = cleanText(body?.location, 80)
  if (query.length < 3) {
    return NextResponse.json({ error: 'Enter at least three characters describing the capability or requirement.' }, { status: 400 })
  }
  if (capability && !['talent', 'speaker', 'facilitator'].includes(capability)) {
    return NextResponse.json({ error: 'Select a supported capability.' }, { status: 400 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  let requestQuery = supabase.from(SOURCE).select(FIELDS).limit(100)
  if (capability) requestQuery = requestQuery.or(`capability.eq.${capability},track.eq.${capability},capabilities.cs.{${capability}}`)
  if (location) requestQuery = requestQuery.ilike('location', `%${location.replace(/[%_,]/g, ' ')}%`)
  const { data, error } = await requestQuery
  if (error) {
    console.error('Capability intelligence search failed:', error)
    return NextResponse.json({ error: 'The capability directory could not be searched. Please try again.' }, { status: 502 })
  }

  const tokens = [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 2))].slice(0, 8)
  const results = (data || []).map(row => {
    const corpus = searchable(row)
    const matched = tokens.filter(token => corpus.includes(token))
    const capabilityMatch = capability
      ? [row.capability, row.track, ...(row.capabilities || [])].some(value => String(value || '').toLowerCase() === capability)
      : false
    const score = matched.length + (capabilityMatch ? 2 : 0)
    return { row, matched, score }
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || String(a.row.full_name || '').localeCompare(String(b.row.full_name || '')))
    .slice(0, 12)
    .map(({ row, matched }) => ({
      id: row.professional_id,
      name: row.full_name,
      headline: row.headline,
      currentRole: row.current_job_title,
      location: row.location,
      industry: row.industry,
      capability: row.capability || row.track || (row.capabilities || [])[0] || null,
      capabilities: row.capabilities || [],
      skills: row.skills || [],
      topics: row.topics || [],
      languages: row.languages || [],
      programmeTypes: row.programme_types || [],
      assessmentSummary: row.assessment_summary || null,
      designation: row.designation || null,
      initials: row.display_initials || null,
      photoUrl: row.photo_url || null,
      atbId: row.atb_id || null,
      matchedTerms: matched,
    }))

  return NextResponse.json({
    ok: true,
    source: SOURCE,
    total: results.length,
    directoryCount: (data || []).length,
    results,
    status: results.length ? 'matches_found' : ((data || []).length ? 'no_match' : 'directory_empty'),
    note: (data || []).length
      ? 'Results are drawn only from Valoria’s approved public marketplace roster. Relevance is a transparent keyword signal, not an automated hiring decision.'
      : 'No approved public professional profiles are currently listed in this staging directory.',
  }, { headers: { 'Cache-Control': 'no-store' } })
}
