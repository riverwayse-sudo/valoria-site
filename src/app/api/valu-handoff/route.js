import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createValuHandoffToken } from '@/lib/valu-handoff-token'

function norm(value) { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ') }

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server configuration is missing.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(request) {
  let admin
  try { admin = getAdmin() } catch { return NextResponse.json({ error:'Server misconfigured.' }, { status:503 }) }
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { data: userData, error:userError } = await admin.auth.getUser(token)
  if (userError || !userData?.user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const user = userData.user
  if (!user.email_confirmed_at) return NextResponse.json({ error:'Confirm your email before opening the full VALU assessment.' }, { status:403 })
  const handoffParams = new URL(request.url).searchParams
  const requestedTasterId = handoffParams.get('taster_id')?.trim()
  const resumeToken = handoffParams.get('resume')?.trim()
  let tasterQuery = admin.from('taster_sessions').select('id,name,role,experience,completed_at').eq('user_id', user.id).not('completed_at','is',null)
  if (requestedTasterId) tasterQuery = tasterQuery.eq('id', requestedTasterId)
  else tasterQuery = tasterQuery.order('completed_at',{ascending:false}).limit(1)
  const { data:taster, error:tasterError } = await tasterQuery.maybeSingle()
  if (tasterError) return NextResponse.json({ error:'Could not verify your completed VALU snapshot.' }, { status:502 })
  if (!taster) return NextResponse.json({ url:'https://valoriainstitute.com/valu/assessment/' })
  const { data:candidate, error:candidateError } = await admin.from('taster_identity_candidates')
    .select('candidate_email,candidate_role,linked_user_id').eq('taster_id', taster.id).maybeSingle()
  if (candidateError) return NextResponse.json({ error:'Could not verify snapshot identity evidence.' }, { status:502 })
  if (candidate?.linked_user_id && candidate.linked_user_id !== user.id) return NextResponse.json({ error:'This snapshot has conflicting account ownership evidence. Valoria support must review it.' }, { status:409 })
  if (candidate?.candidate_email && norm(candidate.candidate_email) !== norm(user.email)) return NextResponse.json({ error:'The saved snapshot email evidence does not match this account. Valoria support must review it.' }, { status:403 })
  if (candidate?.candidate_role && norm(candidate.candidate_role) !== norm(taster.role)) return NextResponse.json({ error:'The saved snapshot role conflicts with contact evidence. Valoria support must review it.' }, { status:403 })
  let handoffToken
  try { handoffToken = createValuHandoffToken(user.id, taster.id) } catch { return NextResponse.json({ error:'Secure VALU handoff is unavailable.' }, { status:503 }) }
  await admin.from('valoria_journey_events').insert({ user_id:user.id, event_key:'assessment_handoff', source:'taster_session', source_id:taster.id, metadata:{ destination:'valoriainstitute.com/valu/assessment', mode:'full', token_ttl_seconds:14400 } })
  const destination = new URL('https://valoriainstitute.com/valu/assessment/')
  const destinationParams = new URLSearchParams({ full:'1', taster_id:taster.id, name:taster.name||'', role:taster.role||'', experience:taster.experience||'' })
  if (resumeToken) destinationParams.set('resume', resumeToken)
  destination.search = destinationParams.toString()
  destination.hash = new URLSearchParams({ handoff_token:handoffToken }).toString()
  return NextResponse.json({ url:destination.toString() }, { headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'} })
}
