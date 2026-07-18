import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { attended, overall_rating, most_valuable, improvements, would_recommend, name, email } = body

    if (!overall_rating) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 })
    }

    const { error } = await supabase.from('webinar_feedback').insert({
      attended: attended || null,
      overall_rating,
      most_valuable: most_valuable || null,
      improvements: improvements || null,
      would_recommend: would_recommend ?? null,
      name: name || null,
      email: email || null,
    })

    if (error) {
      console.error('webinar_feedback insert failed:', error)
      return NextResponse.json({ error: 'Could not save feedback' }, { status: 500 })
    }

    if (email && process.env.BREVO_API_KEY) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ attributes: { FEEDBACK_SUBMITTED: true } }),
        })
      } catch (e) {
        console.error('Brevo feedback tag failed (non-blocking):', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('feedback route error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
