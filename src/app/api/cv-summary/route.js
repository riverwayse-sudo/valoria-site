// src/app/api/cv-summary/route.js
//
// Generates the positive-framed summary shown on the public profile's
// About section (see buildAssessmentSummary in profile/[id]/page.jsx,
// which prefers cv_summary over the VALU Index summary when present).
//
// Originally built (31 Jul-1 Aug 2026) to extract text from the uploaded
// CV file and send it to Claude for summarization. Temitayo flagged the
// per-request AI cost as something to avoid, even though the real number
// was small (~$0.01-0.015/CV) — reasonable ask, and it turns out there's
// a genuinely better option, not just a cheaper one: onboarding already
// collects current_job_title, industry, experience_years, skills,
// work_history, topics, and programme_types directly as structured data.
// Composing the summary from those fields is free (no external API call
// at all), faster, and more reliable than parsing arbitrary CV text with
// pdf-parse/mammoth ever was — resume layouts vary too much for that kind
// of extraction to be trustworthy. The uploaded CV file itself is kept
// (still useful for Valoria's own reference), just no longer read here.
//
// Kept the same route path and trigger points (fires on CV upload, in
// both onboarding and /profile/edit) to avoid touching the calling code
// — this endpoint's contract (POST with a bearer token, writes
// cv_summary) is unchanged, only what happens inside it.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function pickThree(arr) {
  return (arr || []).filter(Boolean).slice(0, 3)
}

function composeSummary(p) {
  const sentences = []

  // Opening: role + industry + experience
  let opener = ''
  if (p.current_job_title) opener += `I'm ${/^[aeiou]/i.test(p.current_job_title) ? 'an' : 'a'} ${p.current_job_title}`
  else if (p.headline) opener += `I'm ${/^[aeiou]/i.test(p.headline) ? 'an' : 'a'} ${p.headline}`
  else opener += "I'm a professional"
  if (p.industry) opener += ` in ${p.industry}`
  if (p.experience_years) opener += `, with ${p.experience_years}+ year${p.experience_years === 1 ? '' : 's'} of experience`
  sentences.push(opener + '.')

  // Strengths from skills (candidates) or topics (speakers)
  const strengths = pickThree(p.skills?.length ? p.skills : p.topics)
  if (strengths.length) {
    const list = strengths.length === 1 ? strengths[0]
      : strengths.length === 2 ? `${strengths[0]} and ${strengths[1]}`
      : `${strengths.slice(0, -1).join(', ')}, and ${strengths[strengths.length - 1]}`
    sentences.push(`My core strengths include ${list}.`)
  }

  // Track record from work history — most recent role, if given
  const roles = (p.work_history || []).filter(r => r?.org)
  if (roles.length) {
    const r = roles[0]
    sentences.push(`I've built my track record${r.title ? ` as ${r.title}` : ''} at ${r.org}${roles.length > 1 ? ` and ${roles.length - 1} other organisation${roles.length > 2 ? 's' : ''}` : ''}.`)
  }

  // Facilitator programme focus
  if ((p.programme_types || []).length && !p.skills?.length) {
    sentences.push(`I focus on ${pickThree(p.programme_types).join(', ')}.`)
  }

  return sentences.join(' ')
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Not authenticated.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('professional_profiles')
    .select('current_job_title, headline, industry, experience_years, skills, topics, programme_types, work_history')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError || !profile) {
    return new Response(JSON.stringify({ error: 'No profile found.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const summary = composeSummary(profile)
    const { error: updateError } = await supabase
      .from('professional_profiles')
      .update({ cv_summary: summary })
      .eq('id', user.id)
    if (updateError) throw updateError

    return new Response(JSON.stringify({ summary }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Summary generation failed:', err)
    return new Response(JSON.stringify({ error: err.message || 'Summary generation failed.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
