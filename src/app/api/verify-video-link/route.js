// src/app/api/verify-video-link/route.js
//
// Real verification that a submitted video link is an actual, playable
// video — not just a URL that matches a youtube.com/youtu.be pattern.
// The onboarding validator only ever checked format; someone could paste
// any youtube.com-shaped URL, including a dead, deleted, or private one,
// and it would pass.
//
// Uses YouTube's public oEmbed endpoint — no API key needed, no quota.
// It returns video metadata (title, thumbnail, author) for any real,
// public, embeddable video, and a 401/404 for anything else (deleted,
// private, region-locked, or made up).

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) {
    return Response.json({ valid: false, error: 'No URL provided.' }, { status: 400 })
  }

  const isYouTube = /(youtube\.com|youtu\.be)/i.test(url)
  if (!isYouTube) {
    // Not a YouTube link — profile submission today only collects YouTube
    // links (youtube_links), so anything else fails format validation
    // before it ever reaches here. Kept as a defined, honest response
    // rather than a silent pass, in case another platform is added later.
    return Response.json({ valid: false, error: 'Only YouTube links can be verified right now.' })
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) {
      return Response.json({
        valid: false,
        error: res.status === 401 || res.status === 404
          ? 'This video doesn\u2019t exist, is private, or has been removed.'
          : 'Couldn\u2019t verify this link right now.',
      })
    }
    const data = await res.json()
    return Response.json({
      valid: true,
      title: data.title || null,
      thumbnail: data.thumbnail_url || null,
      author: data.author_name || null,
    })
  } catch (err) {
    // Network hiccup / YouTube rate limit / timeout — don't punish the
    // person for our verification step failing. The caller treats this
    // as "couldn't confirm," not "definitely fake."
    console.error('Video link verification error:', err)
    return Response.json({ valid: false, error: 'Couldn\u2019t verify this link right now — you can still save it.' })
  }
}
