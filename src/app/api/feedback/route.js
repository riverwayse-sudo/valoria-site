import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function optionalText(value, maxLength, field) {
  if (value == null || value === '') return null
  if (typeof value !== 'string') throw new Error(`${field} must be text.`)
  const normalized = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  if (normalized.length > maxLength) throw new Error(`${field} is too long.`)
  return normalized || null
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Feedback service is temporarily unavailable.' }, { status: 503 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid feedback response is required.' }, { status: 400 })
    }

    const { attended, overall_rating, most_valuable, improvements, would_recommend, name, email } = body
    if (!Number.isInteger(overall_rating) || overall_rating < 1 || overall_rating > 5) {
      return NextResponse.json({ error: 'Choose a rating from 1 to 5.' }, { status: 400 })
    }
    if (attended != null && !['live', 'replay', 'no'].includes(attended)) {
      return NextResponse.json({ error: 'Choose a valid attendance response.' }, { status: 400 })
    }
    if (would_recommend != null && typeof would_recommend !== 'boolean') {
      return NextResponse.json({ error: 'Choose a valid recommendation response.' }, { status: 400 })
    }

    let normalizedMostValuable, normalizedImprovements, normalizedName, normalizedEmail
    try {
      normalizedMostValuable = optionalText(most_valuable, 2000, 'Most valuable')
      normalizedImprovements = optionalText(improvements, 2000, 'Improvements')
      normalizedName = optionalText(name, 200, 'Name')
      normalizedEmail = optionalText(email, 320, 'Email')?.toLowerCase() || null
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    // Trust only headers supplied by the hosting edge. Do not use caller-
    // controlled X-Forwarded-For values as a rate-limit identity.
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown'
    const { data: allowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_key: `webinar_feedback:${ip}`,
      p_max_count: 3,
      p_window_seconds: 3600,
    })
    if (rateLimitError) {
      console.error('Feedback rate limit check failed:', rateLimitError)
      return NextResponse.json({ error: 'Feedback service is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    }
    if (!allowed) {
      return NextResponse.json({ error: 'Too many feedback submissions. Please try again later.' }, { status: 429 })
    }

    const { error } = await supabase.from('webinar_feedback').insert({
      attended: attended || null,
      overall_rating,
      most_valuable: normalizedMostValuable,
      improvements: normalizedImprovements,
      would_recommend: would_recommend ?? null,
      name: normalizedName,
      email: normalizedEmail,
    })

    if (error) {
      console.error('webinar_feedback insert failed:', error)
      return NextResponse.json({ error: 'Could not save feedback' }, { status: 500 })
    }

    if (normalizedEmail && process.env.BREVO_API_KEY) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(normalizedEmail)}`, {
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
