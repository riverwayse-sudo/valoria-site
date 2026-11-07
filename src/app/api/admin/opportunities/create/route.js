import { createClient } from '@supabase/supabase-js'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
}

async function requireAdmin(request) {
  const supabase = db()
  if (!supabase) return { response: Response.json({ error: 'Service not configured.' }, { status: 503 }) }
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return { response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user?.id) return { response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  const { data: admin } = await supabase.from('admin_users').select('id,email,full_name').eq('id', data.user.id).maybeSingle()
  if (!admin) return { response: Response.json({ error: 'Valoria administrator access required.' }, { status: 403 }) }
  return { supabase, user: data.user, admin }
}

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90)
}

export async function POST(request) {
  const { supabase, user, admin, response } = await requireAdmin(request)
  if (response) return response
  const body = await request.json().catch(() => null)
  if (!body || !body.title || !body.description || !body.organisation_name) {
    return Response.json({ error: 'Job title, organisation and full description are required.' }, { status: 400 })
  }
  const title = String(body.title).trim()
  const organisation = String(body.organisation_name).trim()
  const description = String(body.description).trim()
  if (!title || !organisation || !description) return Response.json({ error: 'Job title, organisation and full description cannot be blank.' }, { status: 400 })
  if (title.length > 180 || organisation.length > 180 || description.length > 10000 || String(body.summary || '').length > 500) {
    return Response.json({ error: 'One or more fields exceed the allowed length.' }, { status: 400 })
  }
  const applicationUrl = String(body.application_url || '').trim()
  if (applicationUrl) {
    try {
      const parsedUrl = new URL(applicationUrl)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Unsupported protocol')
    } catch {
      return Response.json({ error: 'Enter a valid http or https application URL.' }, { status: 400 })
    }
  }
  const workMode = body.work_mode || null
  if (workMode && !['onsite', 'hybrid', 'remote'].includes(workMode)) return Response.json({ error: 'Choose a supported work mode.' }, { status: 400 })
  const employmentType = body.employment_type || null
  if (employmentType && !['full-time', 'part-time', 'contract', 'temporary', 'internship'].includes(employmentType)) return Response.json({ error: 'Choose a supported employment type.' }, { status: 400 })
  const closingAt = body.closing_at ? new Date(body.closing_at) : null
  if (closingAt && Number.isNaN(closingAt.getTime())) return Response.json({ error: 'Enter a valid application deadline.' }, { status: 400 })
  const email = admin.email || user.email || ''
  const name = admin.full_name || user.user_metadata?.full_name || email || 'Valoria Administrator'
  let slug = slugify(title) || 'job-' + Date.now().toString(36)
  const { data: existing } = await supabase.from('opportunities').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = slug + '-' + Date.now().toString().slice(-6)
  const now = new Date().toISOString()
  const opportunityPayload = {
    slug,
    title,
    opportunity_type: 'job',
    summary: String(body.summary || '').trim() || null,
    description,
    organisation_name: organisation,
    location: String(body.location || '').trim() || null,
    work_mode: workMode,
    employment_type: employmentType,
    experience_level: String(body.experience_level || '').trim() || null,
    industry: String(body.industry || '').trim() || null,
    capabilities: Array.isArray(body.capabilities) ? body.capabilities : [],
    skills: Array.isArray(body.skills) ? body.skills : [],
    compensation: String(body.compensation || '').trim() || null,
    application_method: body.application_url ? 'external' : 'valoria',
    application_url: applicationUrl || null,
    closing_at: closingAt ? closingAt.toISOString() : null,
    status: 'published',
    access_level: 'public',
    created_by: user.id,
    reviewed_by: user.id,
    reviewed_at: now,
    published_at: now,
  }
  const { data: opportunity, error: opportunityError } = await supabase.from('opportunities').insert(opportunityPayload).select('id,slug').single()
  if (opportunityError) return Response.json({ error: opportunityError.message }, { status: 500 })

  const { error: auditError } = await supabase.from('opportunity_submissions').insert({
    opportunity_id: opportunity.id,
    submitter_user_id: user.id,
    submitter_name: name,
    submitter_email: email,
    organisation_name: organisation,
    payload: { ...body, created_by_valoria_admin: true, published_by: user.id },
    status: 'approved',
    admin_notes: 'Created and published by an authenticated Valoria administrator.',
    reviewed_by: user.id,
    reviewed_at: now,
  })
  if (auditError) {
    await supabase.from('opportunities').delete().eq('id', opportunity.id)
    return Response.json({ error: 'The job was not published because its audit record could not be saved: ' + auditError.message }, { status: 500 })
  }
  return Response.json({ ok: true, id: opportunity.id, slug: opportunity.slug, status: 'published' }, { status: 201 })
}
