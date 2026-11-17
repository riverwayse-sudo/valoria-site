/**
 * Shared server-side administrator authorization.
 * Pass the request-scoped Supabase service client so auth and data access
 * use the same client instance.
 */
export async function authorizeAdmin(request, supabase) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return { user: null, response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    const user = authData?.user
    if (authError || !user?.id) {
      return { user: null, response: Response.json({ error: 'Not authenticated.' }, { status: 401 }) }
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (adminError) {
      return { user: null, response: Response.json({ error: 'Could not verify administrator access.' }, { status: 500 }) }
    }
    if (!admin) {
      return { user: null, response: Response.json({ error: 'Admin access required.' }, { status: 403 }) }
    }

    return { user, response: null }
  } catch (error) {
    console.error('Administrator authorization failed:', error)
    return { user: null, response: Response.json({ error: 'Could not verify administrator access.' }, { status: 500 }) }
  }
}
