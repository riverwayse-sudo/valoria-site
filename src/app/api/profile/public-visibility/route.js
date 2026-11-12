import { createClient } from '@supabase/supabase-js'
import { PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION, PUBLIC_PROFILE_CONSENT_TEXT } from '@/lib/profile-consent-copy'

export const dynamic = 'force-dynamic'

const CONSENT_VERSION = PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION
const WITHDRAWAL_VERSION = 'public-profile-visibility-withdrawn-v1-2026-11-07'
const ACKNOWLEDGEMENT_TEXT = PUBLIC_PROFILE_CONSENT_TEXT
const WITHDRAWAL_TEXT = 'I withdraw my permission for Valoria Institute to display my professional profile in the public marketplace. I understand my profile may remain available to me and to authorised users according to the platform access rules.'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function getCaller(request, supabase) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return { error: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user?.id) return { error: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }

  const [{ data: account, error: accountError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('users').select('id,user_type').eq('id', data.user.id).maybeSingle(),
    supabase.from('professional_profiles').select('id,is_test,visibility,listing_status,eligible_for_listing').eq('id', data.user.id).maybeSingle(),
  ])

  if (accountError || profileError) return { error: Response.json({ error: 'Could not verify this professional account.' }, { status: 500 }) }
  if (account?.user_type !== 'professional' || !profile || profile.is_test) {
    return { error: Response.json({ error: 'Only genuine professional accounts can change public marketplace visibility.' }, { status: 403 }) }
  }

  return { userId: data.user.id, profile }
}

async function getLatestAcknowledgement(supabase, professionalId) {
  return supabase.from('professional_profile_acknowledgements')
    .select('id,acknowledgement_version,acknowledged_at,created_at')
    .eq('professional_id', professionalId)
    .eq('acknowledgement_type', 'profile_submission')
    .order('acknowledged_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export async function GET(request) {
  const supabase = getSupabase()
  if (!supabase) return Response.json({ error: 'Visibility service is not configured.' }, { status: 503 })

  const caller = await getCaller(request, supabase)
  if (caller.error) return caller.error

  const { data: acknowledgement, error } = await getLatestAcknowledgement(supabase, caller.userId)
  if (error) return Response.json({ error: 'Could not load visibility permission.' }, { status: 500 })

  const consented = acknowledgement?.acknowledgement_version === CONSENT_VERSION && caller.profile.visibility === 'public'
  return Response.json({
    consented,
    visibility: caller.profile.visibility || 'registered_only',
    listing_status: caller.profile.listing_status || 'unlisted',
    eligible_for_listing: caller.profile.eligible_for_listing === true,
  })
}

export async function POST(request) {
  const supabase = getSupabase()
  if (!supabase) return Response.json({ error: 'Visibility service is not configured.' }, { status: 503 })

  const caller = await getCaller(request, supabase)
  if (caller.error) return caller.error

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'A consent choice is required.' }, { status: 400 }) }
  if (typeof body?.consent !== 'boolean') return Response.json({ error: 'A consent choice is required.' }, { status: 400 })

  const { data: latest, error: acknowledgementError } = await getLatestAcknowledgement(supabase, caller.userId)
  if (acknowledgementError) return Response.json({ error: 'Could not verify the existing visibility permission.' }, { status: 500 })

  if (body.consent) {
    if (latest?.acknowledgement_version !== CONSENT_VERSION) {
      const { error: insertError } = await supabase.from('professional_profile_acknowledgements').insert({
        professional_id: caller.userId,
        acknowledgement_type: 'profile_submission',
        acknowledgement_version: CONSENT_VERSION,
        acknowledgement_text: ACKNOWLEDGEMENT_TEXT,
        acknowledged_at: new Date().toISOString(),
      })
      if (insertError) {
        console.error('Public visibility acknowledgement insert failed:', insertError)
        return Response.json({ error: 'Your permission could not be recorded. Please try again.' }, { status: 500 })
      }
    }

    const { error: updateError } = await supabase.from('professional_profiles')
      .update({ visibility: 'public', updated_at: new Date().toISOString() })
      .eq('id', caller.userId)
    if (updateError) return Response.json({ error: 'Your permission was recorded, but visibility could not be updated. Please contact Valoria support.' }, { status: 500 })
  } else {
    if (latest?.acknowledgement_version === CONSENT_VERSION) {
      const { error: insertError } = await supabase.from('professional_profile_acknowledgements').insert({
        professional_id: caller.userId,
        acknowledgement_type: 'profile_submission',
        acknowledgement_version: WITHDRAWAL_VERSION,
        acknowledgement_text: WITHDRAWAL_TEXT,
        source: 'profile_visibility_settings',
        acknowledged_at: new Date().toISOString(),
      })
      if (insertError) {
        console.error('Public visibility withdrawal insert failed:', insertError)
        return Response.json({ error: 'Your withdrawal could not be recorded. Please try again.' }, { status: 500 })
      }
    }

    const { error: updateError } = await supabase.from('professional_profiles')
      .update({ visibility: 'registered_only', updated_at: new Date().toISOString() })
      .eq('id', caller.userId)
    if (updateError) return Response.json({ error: 'Your profile visibility could not be updated. Please contact Valoria support.' }, { status: 500 })
  }

  const { data: updated } = await supabase.from('professional_profiles')
    .select('visibility,listing_status,eligible_for_listing')
    .eq('id', caller.userId)
    .maybeSingle()

  return Response.json({
    consented: body.consent,
    visibility: updated?.visibility || (body.consent ? 'public' : 'registered_only'),
    listing_status: updated?.listing_status || 'unlisted',
    eligible_for_listing: updated?.eligible_for_listing === true,
    message: body.consent
      ? 'Your public visibility preference has been saved. Public discovery remains subject to Valoria listing and eligibility checks.'
      : 'Your profile is now restricted to registered-only visibility.',
  })
}
