import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role configuration is missing.')
  return createClient(SB_URL, SERVICE)
}

export async function POST(request) {
  if (!SERVICE || !SB_URL || !SB_ANON) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  const authorization = request.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Sign in is required before linking your VALU assessment.' }, { status: 401 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const identityHash = String(body?.identity_hash || '').trim()
  if (!identityHash) {
    return NextResponse.json({ error: 'identity_hash is required.' }, { status: 400 })
  }

  const userClient = createClient(SB_URL, SB_ANON, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: authData, error: authError } = await userClient.auth.getUser()
  if (authError || !authData?.user) {
    return NextResponse.json({ error: 'Your session could not be verified.' }, { status: 401 })
  }

  const user = authData.user
  const userEmail = String(user.email || '').trim().toLowerCase()
  if (!userEmail) {
    return NextResponse.json({ error: 'Your account has no verified email address.' }, { status: 403 })
  }

  const { data: assessment, error: assessmentError } = await admin
    .from('valu_assessments')
    .select('id,user_id,email,completed_at')
    .eq('identity_hash', identityHash)
    .maybeSingle()

  if (assessmentError || !assessment) {
    return NextResponse.json({ error: 'VALU assessment not found.' }, { status: 404 })
  }

  if (!assessment.completed_at) {
    return NextResponse.json({ error: 'This VALU assessment is not complete yet.' }, { status: 409 })
  }

  if (assessment.user_id && assessment.user_id !== user.id) {
    return NextResponse.json({ error: 'This VALU assessment is already linked to another account.' }, { status: 409 })
  }

  if (String(assessment.email || '').trim().toLowerCase() !== userEmail) {
    return NextResponse.json({ error: 'The assessment email must match the signed-in account email.' }, { status: 403 })
  }

  if (!assessment.user_id) {
    const { error: linkError } = await admin
      .from('valu_assessments')
      .update({ user_id: user.id })
      .eq('id', assessment.id)
      .is('user_id', null)

    if (linkError) {
      return NextResponse.json({ error: 'Could not link the VALU assessment.' }, { status: 502 })
    }
  }

  return NextResponse.json({ ok: true, assessment_id: assessment.id, user_id: user.id })
}
