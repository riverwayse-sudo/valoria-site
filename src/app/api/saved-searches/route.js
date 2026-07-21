import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// POST  /api/saved-searches   → create a saved search
// GET   /api/saved-searches   → list the current user's saved searches
// DELETE /api/saved-searches?id=…  → delete by id (must own it)
export async function GET(req) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Get auth header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthenticated.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }
  const token = authHeader.slice(7)

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await supabase
    .from('saved_searches')
    .select('id, name, track, filters, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthenticated.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }
  const token = authHeader.slice(7)

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { name, track, filters } = body
  if (!name || !track || filters == null) {
    return new Response(JSON.stringify({ error: 'name, track, and filters are required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!['candidate', 'speaker', 'facilitator'].includes(track)) {
    return new Response(JSON.stringify({ error: 'Invalid track.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ user_id: user.id, name, track, filters })
    .select('id, name, track, filters, created_at')
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  })
}

export async function DELETE(req) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthenticated.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }
  const token = authHeader.slice(7)

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'id is required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // RLS will enforce ownership, but also explicitly check
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
