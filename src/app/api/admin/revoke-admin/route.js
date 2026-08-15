// src/app/api/admin/revoke-admin/route.js
//
// Companion to create-admin/route.js — same gating (caller must already be
// an admin, checked server-side against admin_users, not trusted from the
// client). Revoking only removes admin_users membership; it does NOT
// delete the person's underlying auth account, since they may still be a
// legitimate buyer/professional user of the platform in their own right.
//
// A caller can never revoke themselves — that's the one hard rule here,
// to prevent an admin accidentally locking themselves (and potentially
// everyone, if they're the only one left) out of /admin.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: callerData, error: callerErr } = await supabase.auth.getUser(token)
    if (callerErr || !callerData?.user) return Response.json({ error: 'Not authenticated.' }, { status: 401 })

    const { data: callerAdmin } = await supabase.from('admin_users').select('id').eq('id', callerData.user.id).maybeSingle()
    if (!callerAdmin) return Response.json({ error: 'Only an existing admin can revoke another admin.' }, { status: 403 })

    const { adminId } = await request.json()
    if (!adminId) return Response.json({ error: 'adminId is required.' }, { status: 400 })
    if (adminId === callerData.user.id) {
      return Response.json({ error: "You can't revoke your own admin access." }, { status: 400 })
    }

    const { error: deleteErr } = await supabase.from('admin_users').delete().eq('id', adminId)
    if (deleteErr) return Response.json({ error: deleteErr.message }, { status: 500 })

    return Response.json({ revoked: true })
  } catch (err) {
    console.error('admin/revoke-admin error:', err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
