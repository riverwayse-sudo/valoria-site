// src/app/api/admin/create-admin/route.js
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role configuration is missing.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function requireAdmin(request, supabase) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return { error: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { error: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  const { data: admin, error: adminError } = await supabase.from('admin_users').select('id').eq('id', user.id).maybeSingle()
  if (adminError) return { error: Response.json({ error: 'Could not verify administrator access.' }, { status: 500 }) }
  if (!admin) return { error: Response.json({ error: 'Admin access required.' }, { status: 403 }) }
  return { user }
}

async function findAuthUserByEmail(supabase, email) {
  const perPage = 1000
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users || []
    const match = users.find(user => user.email?.toLowerCase() === email)
    if (match) return match
    if (users.length < perPage) return null
  }
  throw new Error('Could not safely resolve the existing account. Please contact the platform operator.')
}

export async function GET(request) {
  try {
    const supabase = getSupabase()
    const auth = await requireAdmin(request, supabase)
    if (auth.error) return auth.error
    const { data: admins, error } = await supabase.from('admin_users').select('id, email, full_name, created_at').order('created_at', { ascending: true })
    if (error) return Response.json({ error: 'Could not load administrators.' }, { status: 500 })
    return Response.json({ admins: admins || [], selfId: auth.user.id })
  } catch (error) {
    console.error('admin/create-admin GET error:', error)
    return Response.json({ error: 'Administrator service is unavailable.' }, { status: 503 })
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase()
    const auth = await requireAdmin(request, supabase)
    if (auth.error) return auth.error
    let body
    try { body = await request.json() } catch {
      return Response.json({ error: 'A valid JSON request is required.' }, { status: 400 })
    }

    const email = String(body?.email || '').trim().toLowerCase()
    const fullName = String(body?.fullName || '').trim().slice(0, 120)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const { data: existingAdmin, error: existingAdminError } = await supabase.from('admin_users').select('id').eq('email', email).maybeSingle()
    if (existingAdminError) return Response.json({ error: 'Could not verify current administrator access.' }, { status: 500 })
    if (existingAdmin) return Response.json({ error: 'This email is already an administrator.' }, { status: 409 })

    const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: fullName ? { full_name: fullName } : {},
      redirectTo: \`\${process.env.NEXT_PUBLIC_SITE_URL || 'https://valoriainstitute.com'}/reset-password\`,
    })

    let targetUser = invited?.user || null
    let promoted = false
    if (inviteError) {
      targetUser = await findAuthUserByEmail(supabase, email)
      if (!targetUser) {
        console.error('admin invite error:', inviteError)
        return Response.json({ error: 'Supabase could not send the invitation. Check Auth email delivery and redirect configuration.' }, { status: 502 })
      }
      promoted = true
    }

    if (!targetUser?.id || !targetUser.email) return Response.json({ error: 'Supabase did not return a valid invited account.' }, { status: 502 })

    const { error: insertError } = await supabase.from('admin_users').insert({
      id: targetUser.id,
      email: targetUser.email.toLowerCase(),
      full_name: fullName || targetUser.user_metadata?.full_name || null,
      invited_by: auth.user.id,
    })
    if (insertError) {
      console.error('admin membership insert error:', insertError)
      return Response.json({ error: 'The Auth account was created, but administrator membership was not saved. Retry the invitation or contact the platform operator.' }, { status: 500 })
    }

    return Response.json({
      invited: !promoted,
      promoted,
      email: targetUser.email,
      message: promoted ? 'Existing Valoria account granted administrator access.' : 'Invitation email sent. The recipient must complete the secure email flow before signing in.',
    }, { status: 201 })
  } catch (error) {
    console.error('admin/create-admin POST error:', error)
    return Response.json({ error: 'Administrator invitation service is unavailable.' }, { status: 503 })
  }
}
