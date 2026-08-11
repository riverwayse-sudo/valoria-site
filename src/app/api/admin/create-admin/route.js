// src/app/api/admin/create-admin/route.js
//
// Deliberately NOT a public signup endpoint. An open "anyone can sign up as
// admin" form would be a serious vulnerability — Femi asked for admin to
// have "its own login page, signup and table," and the safe reading of
// that is invite-only: only an existing, authenticated admin can create
// another one. First admin(s) are seeded directly via SQL — see
// pending-migrations/010_add_admin_users.sql.
//
// Uses Supabase's own inviteUserByEmail, which sends a secure magic-link
// email the invitee uses to set their own password — this route never
// generates, sees, or transmits a password.

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
    if (!callerAdmin) return Response.json({ error: 'Only an existing admin can invite another admin.' }, { status: 403 })

    const { email, fullName } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || undefined },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://valoriainstitute.com'}/reset-password`,
    })
    if (inviteErr) {
      // Most likely cause: this email already has an auth.users account
      // (e.g. an existing buyer/professional). inviteUserByEmail can't
      // double as "promote an existing user" — handle that case below.
      const { data: existing } = await supabase.auth.admin.listUsers()
      const match = existing?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (match) {
        const { error: promoteErr } = await supabase.from('admin_users').insert({
          id: match.id, email: match.email, full_name: fullName || null, invited_by: callerAdmin.id,
        })
        if (promoteErr) return Response.json({ error: promoteErr.message }, { status: 500 })
        return Response.json({ promoted: true, note: 'This email already had an account — granted admin access directly rather than sending an invite.' })
      }
      return Response.json({ error: inviteErr.message }, { status: 500 })
    }

    const { error: insertErr } = await supabase.from('admin_users').insert({
      id: invited.user.id, email: invited.user.email, full_name: fullName || null, invited_by: callerAdmin.id,
    })
    if (insertErr) return Response.json({ error: insertErr.message }, { status: 500 })

    return Response.json({ invited: true })
  } catch (err) {
    console.error('admin/create-admin error:', err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
