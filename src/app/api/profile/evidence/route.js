import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

async function authUser(request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const sb = db()
  const { data } = await sb.auth.getUser(token)
  return data?.user || null
}

function safeName(name) {
  return String(name || 'document')
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'document'
}

export async function GET(request) {
  const user = await authUser(request)
  if (!user) return Response.json({ error: 'Not authenticated.' }, { status: 401 })
  const sb = db()
  const { data, error } = await sb
    .from('professional_documents')
    .select('id,document_type,original_filename,mime_type,size_bytes,visibility,verification_status,verified_at,created_at,updated_at')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ documents: data || [] })
}

export async function POST(request) {
  const user = await authUser(request)
  if (!user) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  const documentType = String(form.get('document_type') || 'other').trim().toLowerCase()

  if (!file || typeof file.arrayBuffer !== 'function') {
    return Response.json({ error: 'A document file is required.' }, { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: 'Only PDF, DOC or DOCX documents are accepted.' }, { status: 400 })
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return Response.json({ error: 'Documents must be between 1 byte and 10 MB.' }, { status: 400 })
  }

  const sb = db()
  const path = `profiles/${user.id}/evidence/${crypto.randomUUID()}-${safeName(file.name)}`
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await sb.storage.from('cvs').upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await sb
    .from('professional_documents')
    .insert({
      professional_id: user.id,
      document_type: documentType,
      storage_bucket: 'cvs',
      storage_path: path,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      visibility: 'private',
      verification_status: 'pending',
    })
    .select('id,document_type,original_filename,size_bytes,verification_status,created_at')
    .single()

  if (error) {
    await sb.storage.from('cvs').remove([path])
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, document: data })
}

export async function DELETE(request) {
  const user = await authUser(request)
  if (!user) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const id = body?.id
  if (!id) return Response.json({ error: 'Document id is required.' }, { status: 400 })

  const sb = db()
  const { data: doc, error: findError } = await sb
    .from('professional_documents')
    .select('id,storage_bucket,storage_path,verification_status')
    .eq('id', id)
    .eq('professional_id', user.id)
    .maybeSingle()

  if (findError) return Response.json({ error: findError.message }, { status: 500 })
  if (!doc) return Response.json({ error: 'Document not found.' }, { status: 404 })
  if (doc.verification_status === 'verified') {
    return Response.json({ error: 'Verified evidence cannot be deleted from the profile. Contact Valoria administration.' }, { status: 409 })
  }

  await sb.storage.from(doc.storage_bucket || 'cvs').remove([doc.storage_path])
  const { error } = await sb.from('professional_documents').delete().eq('id', id).eq('professional_id', user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
