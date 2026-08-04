// src/app/api/cv-summary/route.js
//
// Turns an uploaded CV into the positive-framed summary shown on the
// public profile's About section (see buildAssessmentSummary in
// profile/[id]/page.jsx, which prefers cv_summary over the VALU Index
// summary when present). Upload + storage shipped 31 Jul; this is the
// generation step that was left pending an AI provider decision.
//
// Requires ANTHROPIC_API_KEY in this project's env vars (Vercel:
// valoria-site -> Settings -> Environment Variables). Fails gracefully
// (logs, returns an error response) if it's missing — the About section
// already falls back to bio/VALU summary, so a missing key here never
// breaks the profile page, it just means no CV summary yet.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

async function extractText(buffer, path) {
  const ext = path.split('.').pop().toLowerCase()
  if (ext === 'pdf') {
    const { default: pdfParse } = await import('pdf-parse')
    const result = await pdfParse(buffer)
    return result.text
  }
  if (ext === 'doc' || ext === 'docx') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  throw new Error(`Unsupported CV file type: .${ext}`)
}

async function summarizeWithClaude(cvText, displayName) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write a 3-4 sentence, first-person, positively-framed professional summary based on this CV, for a marketplace profile's "About" section. Focus on genuine strengths, track record, and what makes this person distinct — no fabrication, no filler, no third-person phrasing, no headers or markdown. Just the summary text.\n\nCV text:\n${cvText.slice(0, 12000)}`,
      }],
    }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Claude API error ${res.status}: ${errText.slice(0, 300)}`)
  }
  const data = await res.json()
  const textBlock = (data.content || []).find(b => b.type === 'text')
  if (!textBlock?.text) throw new Error('Claude API returned no text content')
  return textBlock.text.trim()
}

export async function POST(request) {
  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: 'CV summarization is not configured (missing ANTHROPIC_API_KEY).' }), {
      status: 501, headers: { 'Content-Type': 'application/json' },
    })
  }

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
    .select('cv_url, display_name')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError || !profile?.cv_url) {
    return new Response(JSON.stringify({ error: 'No CV on file for this profile.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { data: fileBlob, error: downloadError } = await supabase.storage.from('cvs').download(profile.cv_url)
    if (downloadError) throw downloadError
    const buffer = Buffer.from(await fileBlob.arrayBuffer())

    const cvText = await extractText(buffer, profile.cv_url)
    if (!cvText || cvText.trim().length < 40) {
      throw new Error('Could not extract readable text from this CV (scanned image PDFs aren\u2019t supported yet).')
    }

    const summary = await summarizeWithClaude(cvText, profile.display_name)

    const { error: updateError } = await supabase
      .from('professional_profiles')
      .update({ cv_summary: summary })
      .eq('id', user.id)
    if (updateError) throw updateError

    return new Response(JSON.stringify({ summary }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('CV summarization failed:', err)
    return new Response(JSON.stringify({ error: err.message || 'CV summarization failed.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
