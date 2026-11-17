import { createClient } from '@supabase/supabase-js'
import { createEventCertificateToken, hashEventCertificateToken } from '@/lib/event-certificate-token'

export const dynamic = 'force-dynamic'

const EVENT_SLUG = 'influence-without-authority-2026-11-14'
const STORAGE_BUCKET = 'cvs'
const MAX_PDF_BYTES = 5 * 1024 * 1024

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
}

async function requireAdmin(request) {
  const supabase = db()
  if (!supabase) return { response: Response.json({ error: 'Service not configured.' }, { status: 503 }) }
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\\s+/i, '')
  if (!token) return { response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user?.id) return { response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()
  if (adminError || !admin) return { response: Response.json({ error: 'Admin access required.' }, { status: 403 }) }

  return { supabase }
}

export async function GET(request) {
  const { response } = await requireAdmin(request)
  if (response) return response
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request) {
  const { supabase, response } = await requireAdmin(request)
  if (response) return response

  let form
  try {
    form = await request.formData()
  } catch {
    return Response.json({ error: 'A multipart form upload is required.' }, { status: 400 })
  }

  const recipientName = String(form.get('recipient_name') || '').trim().slice(0, 120)
  const recipientEmail = String(form.get('recipient_email') || '').trim().toLowerCase().slice(0, 254)
  const file = form.get('file')

  if (!recipientName || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(recipientEmail)) {
    return Response.json({ error: 'A valid attendee name and email are required.' }, { status: 400 })
  }
  if (!file || typeof file.arrayBuffer !== 'function' || file.type !== 'application/pdf') {
    return Response.json({ error: 'Upload an individual PDF certificate.' }, { status: 400 })
  }
  if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
    return Response.json({ error: 'Each certificate must be between 1 byte and 5 MB.' }, { status: 413 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const signature = new TextDecoder().decode(bytes.slice(0, 5))
  if (signature !== '%PDF-') return Response.json({ error: 'The uploaded file is not a valid PDF.' }, { status: 400 })

  const token = createEventCertificateToken()
  const tokenHash = await hashEventCertificateToken(token)
  const storagePath = `event-certificates/${EVENT_SLUG}/${crypto.randomUUID()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, bytes, { contentType: 'application/pdf', upsert: false })
  if (uploadError) {
    console.error('Event certificate storage upload failed:', uploadError.message)
    return Response.json({ error: 'Certificate upload failed. Please retry.' }, { status: 502 })
  }

  const { data: record, error: insertError } = await supabase
    .from('event_certificate_deliveries')
    .insert({
      event_slug: EVENT_SLUG,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      storage_bucket: STORAGE_BUCKET,
      storage_path: storagePath,
      token_hash: tokenHash,
    })
    .select('id, recipient_name, recipient_email, created_at')
    .single()

  if (insertError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
    if (insertError.code === '23505') {
      return Response.json({ error: 'A certificate has already been issued for this attendee and event.' }, { status: 409 })
    }
    console.error('Event certificate record insert failed:', insertError.message)
    return Response.json({ error: 'Certificate record could not be saved.' }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  return Response.json({
    certificate: record,
    download_page: `${origin}/event-certificate/${token}`,
  }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
