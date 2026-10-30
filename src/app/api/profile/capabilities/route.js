import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdmin() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const TRACK_TO_CAPABILITY = {
  candidate: 'talent',
  talent: 'talent',
  speaker: 'speaker',
  facilitator: 'facilitator',
}

export async function POST(request) {
  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Capability service is temporarily unavailable.' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization') || ''
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return NextResponse.json({ error: 'Sign in before saving your capabilities.' }, { status: 401 })
  }

  const { data: authData, error: authError } = await admin.auth.getUser(token)
  const user = authData?.user
  if (authError || !user) {
    return NextResponse.json({ error: 'Your session could not be verified. Please sign in again.' }, { status: 401 })
  }
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: 'Confirm your email before saving your professional capabilities.' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid capability selection.' }, { status: 400 })
  }

  if (!Array.isArray(body?.active_tracks) || body.active_tracks.length < 1 || body.active_tracks.length > 3) {
    return NextResponse.json({ error: 'Choose between one and three professional capabilities.' }, { status: 400 })
  }

  const normalizedTracks = body.active_tracks.map(track => String(track || '').trim().toLowerCase())
  if (normalizedTracks.some(track => !Object.hasOwn(TRACK_TO_CAPABILITY, track))) {
    return NextResponse.json({ error: 'One or more selected capabilities are not supported.' }, { status: 400 })
  }
  const selected = [...new Set(normalizedTracks.map(track => TRACK_TO_CAPABILITY[track]))]
  if (!selected.length || selected.length > 3) {
    return NextResponse.json({ error: 'Choose between one and three distinct capabilities.' }, { status: 400 })
  }

  const { error: upsertError } = await admin
    .from('professional_capabilities')
    .upsert(selected.map(capability => ({
      professional_id: user.id,
      capability,
      is_active: true,
      updated_at: new Date().toISOString(),
    })), { onConflict: 'professional_id,capability' })

  if (upsertError) {
    console.error('Professional capability activation failed:', upsertError)
    return NextResponse.json({ error: 'Your selected capabilities could not be saved. Please try again.' }, { status: 502 })
  }

  // Retain deselected capability rows and their governance history. Mark them
  // inactive so they no longer appear in eligibility or marketplace results.
  const { data: existing, error: lookupError } = await admin
    .from('professional_capabilities')
    .select('id,capability,is_active')
    .eq('professional_id', user.id)

  if (lookupError) {
    console.error('Professional capability reconciliation lookup failed:', lookupError)
    return NextResponse.json({ error: 'Capabilities were saved, but their current state could not be verified. Please retry.' }, { status: 502 })
  }

  const deselected = (existing || []).filter(row => row.is_active && !selected.includes(row.capability))
  for (const row of deselected) {
    const { error } = await admin
      .from('professional_capabilities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('professional_id', user.id)
    if (error) {
      console.error('Professional capability deactivation failed:', error)
      return NextResponse.json({ error: 'Some previous capability paths could not be updated. Please retry; your existing records have been retained.' }, { status: 502 })
    }
  }

  const { data: capabilities, error: verifyError } = await admin
    .from('professional_capabilities')
    .select('id,capability,is_active,eligibility_status,eligible_for_listing,missing_requirements')
    .eq('professional_id', user.id)
    .eq('is_active', true)

  if (verifyError) {
    return NextResponse.json({ error: 'Capabilities were saved, but Valoria could not verify the final selection.' }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    capabilities: capabilities || [],
    inactive_count: deselected.length,
  })
}
