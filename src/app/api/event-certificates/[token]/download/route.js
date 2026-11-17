import { createClient } from '@supabase/supabase-js'
import { hashEventCertificateToken } from '@/lib/event-certificate-token'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
}

export async function GET(request, { params }) {
  const { token } = await params
  const tokenHash = await hashEventCertificateToken(token)
  if (!tokenHash) return new Response('Certificate not found.', { status: 404 })

  const supabase = db()
  if (!supabase) return new Response('Certificate service unavailable.', { status: 503 })

  const { data: certificate, error } = await supabase
    .from('event_certificate_deliveries')
    .select('id, recipient_name, storage_bucket, storage_path')
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .maybeSingle()

  if (error || !certificate) return new Response('Certificate not found.', { status: 404 })

  const filename = `Valoria-Certificate-${certificate.recipient_name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.pdf`
  const { data: signed, error: signedError } = await supabase.storage
    .from(certificate.storage_bucket)
    .createSignedUrl(certificate.storage_path, 60, { download: filename })

  if (signedError || !signed?.signedUrl) {
    console.error('Event certificate signed URL failed:', signedError?.message || 'No URL returned')
    return new Response('Certificate download is temporarily unavailable.', { status: 503 })
  }

  await supabase
    .from('event_certificate_deliveries')
    .update({ downloaded_at: new Date().toISOString() })
    .eq('id', certificate.id)

  return Response.redirect(signed.signedUrl, 302)
}
