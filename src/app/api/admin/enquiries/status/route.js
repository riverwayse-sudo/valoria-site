// Server-side admin gate for enquiry status changes.
// Keeps privileged writes out of the browser because enquiries are intentionally
// not exposed through broad client-side RLS policies.
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ALLOWED_STATUSES = new Set(['pending', 'reviewing', 'introduced', 'declined', 'completed'])

export async function PATCH(request) {
  try {
    const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
    if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: caller, error: authError } = await supabase.auth.getUser(token)
    if (authError || !caller?.user?.id) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', caller.user.id)
      .maybeSingle()

    if (!admin) return Response.json({ error: 'Admin access required.' }, { status: 403 })

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
