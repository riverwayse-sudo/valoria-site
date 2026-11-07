import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { isSubmissionKey, normalizeOpportunityInput } from '@/lib/opportunityValidation'

const IS_PREVIEW = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.VALU_PREVIEW === '1' || process.env.VERCEL_ENV === 'preview' || process.env.CF_WORKERS_PREVIEW === '1'
const IS_READ_ONLY_PREVIEW = IS_PREVIEW && process.env.VALU_STAGING_API_ENABLED !== '1'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
}

function clientKey(request, email) {
  const forwarded = request.headers.get('cf-connecting-ip') || request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown'
  const ip = forwarded.split(',')[0].trim()
  return createHash('sha256').update(`${ip}:${email.toLowerCase().trim()}`).digest('hex')
}

export async function GET() {
  if (IS_READ_ONLY_PREVIEW) return Response.json({ opportunities: [], preview: true })
  const sb = db()
  if (!sb) return Response.json({ error: 'Opportunity service is not configured.' }, { status: 503 })
  const { data, error } = await sb.from('opportunities')
    .select('id,slug,title,opportunity_type,summary,organisation_name,location,work_mode,employment_type,experience_level,industry,capabilities,skills,compensation,application_method,application_url,closing_at')
    .eq('status', 'published')
    .eq('access_level', 'public')
    .or('closing_at.is.null,closing_at.gt.' + new Date().toISOString())
    .order('published_at', { ascending: false })
  if (error) return Response.json({ error: 'Published opportunities could not be loaded.' }, { status: 500 })
  return Response.json({ opportunities: data || [] })
}

export async function POST(request) {
  if (IS_READ_ONLY_PREVIEW) return Response.json({ error: 'Opportunity submissions are disabled in read-only staging preview. No data was written.' }, { status: 503 })
  const body = await request.json().catch(() => null)
  if (body?.website) return Response.json({ ok: true, status: 'pending_review' })
  if (!isSubmissionKey(body?.submission_key)) return Response.json({ error: 'Please refresh the form and try again.' }, { status: 400 })

  const normalized = normalizeOpportunityInput(body, { requireSubmitter: true })
  if (normalized.error) return Response.json({ error: normalized.error }, { status: 400 })

  const sb = db()
  if (!sb) return Response.json({ error: 'Opportunity submission is not configured.' }, { status: 503 })
  const { data: allowed, error: rateError } = await sb.rpc('consume_opportunity_submission_rate_limit', {
    p_key_hash: clientKey(request, normalized.submitter_email),
    p_limit: 5,
    p_window_seconds: 3600
  })
  if (rateError) return Response.json({ error: 'Submission service is temporarily unavailable.' }, { status: 503 })
  if (!allowed) return Response.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })

  const { data, error } = await sb.rpc('create_employer_opportunity_submission', {
    p_submission_key: body.submission_key,
    p_opportunity: normalized.opportunity,
    p_submitter_name: normalized.submitter_name,
    p_submitter_email: normalized.submitter_email,
    p_submission_payload: body
  })
  if (error) {
    console.error('Employer opportunity submission failed:', error.message)
    const status = error.code === '22023' ? 400 : 500
    return Response.json({ error: status === 400 ? error.message : 'Your opportunity could not be saved. Please try again.' }, { status })
  }
  const result = Array.isArray(data) ? data[0] : data
  if (!result?.opportunity_id) return Response.json({ error: 'Submission could not be confirmed. Please try again.' }, { status: 500 })
  return Response.json({ ok: true, id: result.opportunity_id, status: 'pending_review', created: result.created }, { status: result.created ? 201 : 200 })
}
