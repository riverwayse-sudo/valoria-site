import Link from 'next/link'

const GOLD = '#C9A84C'
const MID = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM = 'rgba(247,244,238,.45)'

const TRACK_META = {
  candidate: { label: 'ATB Connect' },
  speaker: { label: 'ATB Spotlight' },
  facilitator: { label: 'ATB Develop' },
}

function primaryTrack(tracks) {
  if (!Array.isArray(tracks) || tracks.length === 0) return null
  return ['candidate', 'speaker', 'facilitator'].find((track) => tracks.includes(track)) || tracks[0]
}

function letters(value) {
  return value ? value.replace(/\./g, '').toUpperCase() : 'V'
}

async function getHomepageProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Homepage profile data unavailable: Supabase environment variables are missing.')
    return { profiles: [], count: null }
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }

  try {
    const [profilesResponse, countResponse] = await Promise.all([
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_previews`, {
        method: 'POST',
        headers,
        body: '{}',
        next: { revalidate: 60 },
      }),
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_count`, {
        method: 'POST',
        headers,
        body: '{}',
        next: { revalidate: 60 },
      }),
    ])

    const profilesPayload = profilesResponse.ok ? await profilesResponse.json() : null
    const countPayload = countResponse.ok ? await countResponse.json() : null

    if (!profilesResponse.ok) console.error('Homepage profile preview fetch failed:', profilesResponse.status, profilesPayload)
    if (!countResponse.ok) console.error('Homepage professional count fetch failed:', countResponse.status, countPayload)

    return {
      profiles: Array.isArray(profilesPayload) ? profilesPayload : [],
      count: typeof countPayload === 'number' ? countPayload : null,
    }
  } catch (error) {
    console.error('Homepage profile data fetch failed:', error)
    return { profiles: [], count: null }
  }
}

export default async function LiveProfilesScroll() {
  const { profiles, count } = await getHomepageProfiles()
  const loop = [...profiles, ...profiles]

  return (
    <section className="live-profiles" aria-label="Valoria professional capabilities">
      <div className="live-profiles-inner">
        <div>
          <div className="live-profiles-kicker">ALREADY ON THE PLATFORM</div>
          <h2 className="live-profiles-title">
            {count === null ? 'The Valoria professional community' : `${count.toLocaleString()} marketplace capabilities`}
          </h2>
          <p className="live-profiles-subtitle">
            One professional identity can appear across multiple capabilities — Talent, Speaking and Facilitation — with each capability represented independently in the marketplace.
          </p>
        </div>
      </div>

      {profiles.length > 0 ? (
        <div className="vi-scroll-mask">
          <div className="vi-scroll-track">
            {loop.map((profile, index) => {
              const track = profile.listing_track || primaryTrack(profile.active_tracks)
              const meta = TRACK_META[track] || TRACK_META.candidate
              const marketplaceHref = track && ['candidate', 'speaker', 'facilitator'].includes(track)
                ? `/marketplace?track=${track}`
                : '/marketplace'

              return (
                <Link href={marketplaceHref} key={`${profile.id}-${track}-${index}`} className="vi-scroll-card" aria-label={`View ${profile.atb_id || 'professional'} in the Valoria Marketplace`}>
                  <div className="vi-scroll-avatar" aria-hidden="true">
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt="" loading="lazy" />
                    ) : (
                      <span>{letters(profile.display_initials)}</span>
                    )}
                  </div>
                  <div className="vi-scroll-copy">
                    <div className="vi-scroll-id">{profile.atb_id || letters(profile.display_initials)}</div>
                    <div className="vi-scroll-headline">{profile.headline || 'Valoria Professional'}</div>
                    <div className="vi-scroll-track-label">{meta.label}</div>
                  </div>
                  <div className="vi-scroll-score" aria-label={`VALU Index ${profile.valu_index ?? 'not available'}`}>
                    <span className="vi-scroll-score-label">VALU</span>
                    <strong>{profile.valu_index ?? '—'}</strong>
                    <span className="vi-scroll-score-max">/100</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="live-profiles-public-state">
          <span className="live-profiles-dot" />
          Professional capabilities will appear here as soon as profile data is available.
        </div>
      )}

      <style>{`
        .live-profiles{padding:48px 0;border-top:1px solid rgba(201,168,76,.1);border-bottom:1px solid rgba(201,168,76,.1);overflow:hidden;background:rgba(255,255,255,.008)}
        .live-profiles-inner{max-width:1200px;margin:0 auto;padding:0 24px 26px}
        .live-profiles-kicker{font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.62);text-transform:uppercase;margin-bottom:8px}
        .live-profiles-title{font-family:var(--font);font-size:clamp(22px,3vw,30px);font-weight:200;color:${PARCH};line-height:1.15;margin:0}
        .live-profiles-subtitle{font-size:12px;line-height:1.6;color:${DIM};margin:8px 0 0;max-width:720px}
        .vi-scroll-mask{width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
        .vi-scroll-track{display:flex;gap:14px;width:max-content;animation:vi-scroll-x 40s linear infinite;will-change:transform}
        .vi-scroll-track:hover{animation-play-state:paused}
        .vi-scroll-card{display:flex;align-items:center;gap:12px;flex-shrink:0;min-width:310px;padding:12px 14px;background:rgba(255,255,255,.035);border:1px solid rgba(247,244,238,.09);border-radius:8px;text-decoration:none;transition:border-color .2s,background .2s,transform .2s}
        .vi-scroll-card:hover{border-color:rgba(201,168,76,.38);background:rgba(255,255,255,.06);transform:translateY(-2px)}
        .vi-scroll-avatar{width:52px;height:52px;border-radius:50%;flex-shrink:0;background:${GOLD};display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid ${GOLD};box-shadow:none}
        .vi-scroll-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
        .vi-scroll-avatar span{color:${MID};font-size:15px;font-weight:700}
        .vi-scroll-copy{min-width:0;flex:1}
        .vi-scroll-id{font-size:11px;font-weight:700;letter-spacing:.04em;color:${PARCH};white-space:nowrap}
        .vi-scroll-headline{font-size:10px;color:${DIM};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:175px;margin-top:2px}
        .vi-scroll-track-label{font-size:8px;font-weight:700;letter-spacing:.06em;margin-top:3px;text-transform:uppercase;color:${GOLD}}
        .vi-scroll-score{min-width:58px;text-align:right;line-height:1;flex-shrink:0;border-left:1px solid rgba(201,168,76,.16);padding-left:12px}
        .vi-scroll-score-label{display:block;font-size:7px;font-weight:700;letter-spacing:.15em;color:rgba(247,244,238,.4);margin-bottom:3px}
        .vi-scroll-score strong{font-family:var(--font);font-size:27px;font-weight:300;color:${GOLD};letter-spacing:-.04em}
        .vi-scroll-score-max{font-size:8px;color:rgba(247,244,238,.35);margin-left:2px}
        .live-profiles-public-state{max-width:1200px;margin:0 auto;padding:16px 24px 0;color:rgba(247,244,238,.38);font-size:11px;line-height:1.6;display:flex;align-items:center;gap:8px}
        .live-profiles-dot{width:5px;height:5px;border-radius:50%;background:${GOLD};flex-shrink:0}
        @keyframes vi-scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media (prefers-reduced-motion:reduce){.vi-scroll-track{animation:none}}
        @media (max-width:640px){.live-profiles{padding:36px 0}.live-profiles-inner{padding-bottom:20px}.vi-scroll-card{min-width:270px;padding:10px 12px}.vi-scroll-avatar{width:46px;height:46px}.vi-scroll-headline{max-width:135px}.vi-scroll-score strong{font-size:24px}}
      `}</style>
    </section>
  )
}
