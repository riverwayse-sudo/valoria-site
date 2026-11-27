// Server-side admin gate for enquiry status changes.
// Keeps privileged writes out of the browser because enquiries are intentionally
// not exposed through broad client-side RLS policies.
import { createClient } from '@supabase/supabase-js'
import adminAuth from '@/lib/server/admin-auth.cjs'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Supabase server configuration is missing.')
  return createClient(url, serviceRoleKey)
}

const ALLOWED_STATUSES = new Set(['pending', 'reviewing', 'introduced', 'declined', 'completed'])

export async function PATCH(request) {
  try {
    const supabase = getAdminClient()
    const authorization = await adminAuth.authorizeAdmin(request, supabase)
    if (authorization.response) return authorization.response

    const { enquiryId, status } = await request.json()
    if (!enquiryId) return Response.json({ error: 'enquiryId is required.' }, { status: 400 })
    if (!ALLOWED_STATUSES.has(status)) return Response.json({ error: 'Invalid enquiry status.' }, { status: 400 })

    const { data, error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', enquiryId)
      .select('id, status')
      .maybeSingle()

    if (error) {
      console.error('admin/enquiries/status:', error)
      return Response.json({ error: 'Could not update enquiry status.' }, { status: 500 })
    }
    if (!data) return Response.json({ error: 'Enquiry not found.' }, { status: 404 })

    return Response.json({ enquiry: data })
  } catch (err) {
    console.error('admin/enquiries/status error:', err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
