import { createClient } from '@supabase/supabase-js'

// Use service role key so this works server-side without RLS issues
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { full_name, email, role } = body

    if (!full_name?.trim() || !email?.trim()) {
      return Response.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('waitlist')
      .insert([{
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        role: role?.trim() || null,
        type: 'standalone',
        source: 'waitlist_page',
      }])

    if (error) {
      // 23505 = unique_violation — already on list
      if (error.code === '23505') {
        return Response.json({ message: 'Already on the list.' }, { status: 200 })
      }
      console.error('Waitlist insert error:', error)
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    return Response.json({ message: 'Joined successfully.' }, { status: 200 })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return Response.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
