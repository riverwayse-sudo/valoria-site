import Link from 'next/link'

const GOLD = '#C9A84C'
const MID = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM = 'rgba(247,244,238,.45)'

const TRACK_META = {
  candidate: 'Talent',
  speaker: 'Speaker',
  facilitator: 'Facilitator',
}

function letters(value) {
  return value ? value.replace(/\./g, '').toUpperCase() : 'V'
}

async function getHomepageProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { profiles: [], count: null }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  try {
    const [profilesResponse, countResponse] = await Promise.all([
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_previews`, { method: 'POST', headers, body: '{}', cache: 'no-store' }),
      fetch(`${url}/rest/v1/rpc/get_homepage_professional_count`, { method: 'POST', headers, body: '{}', cache: 'no-store' }),
    ])
    const profilesPayload = profilesResponse.ok ? await profilesResponse.json() : []
    const countPayload = countResponse.ok ? await countResponse.json() : null
    return { profiles: Array.isArray(profilesPayload) ? profilesPayload : [], count: typeof countPayload === 'number' ? countPayload : null }
  } catch (error) {
    console.error('Homepage profile data fetch failed:', error)
    return { profiles: [], count: null }
  }
}

export default async function LiveProfilesScroll() {
  const { profiles, count } = await getHomepageProfiles()
  const unique = []
  const seen = new Set()

  for (const profile of profiles) {
    if (seen.has(profile.id)) continue
    seen.add(profile.id)
    unique.push(profile)
  }

  const loop = [...unique, ...unique]

  return (
    <section className="live-profiles" aria-label="Valoria professional marketplace">
      <div className="live-profiles-inner">
        <div>
          <div className="live-profiles-kicker">THE MARKETPLACE</div>
          <h2 className="live-profiles-title">Verified professionals, ready to be discovered.</h2>
          <p className="live-profiles-subtitle">
            One professional profile can carry multiple capabilities. Valoria keeps the identity unified while making the right capability discoverable in the right context.
          </p>
        </div>
        <Link href="/marketplace" className="live-profiles-link">EXPLORE MARKETPLACE →</Link>
      </div>

      {unique.length > 0 ? (
        <div className="vi-scroll-mask">
          <div className="vi-scroll-track">
            {loop.map((profile, index) => {
              const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
              const capabilityLabels = tracks.map((track) => TRACK_META[track]).filter(Boolean)
              return (
                <Link href={`/marketplace/${profile.id}`} key={`${profile.id}-${index}`} className="vi-scroll-card" aria-label={`View ${profile.atb_id || 'professional'} in the Valoria Marketplace`}>
                  <div className="vi-scroll-avatar" aria-hidden="true">
                    {profile.photo_url ? <img src={profile.photo_url} alt="" loading="lazy" /> : <span>{letters(profile.display_initials)}</span>}
                  </div>
                  <div className="vi-scroll-copy">
                    <div className="vi-scroll-id">{profile.atb_id || letters(profile.display_initials)}</div>
                    <div className="vi-scroll-headline">{profile.headline || 'Valoria Professional'}</div>
                    <div className="vi-scroll-track-label">{capabilityLabels.length ? capabilityLabels.join(' · ') : 'Professional'}</div>
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
        <div className="live-profiles-public-state"><span className="live-profiles-dot" />Professional profiles will appear here as soon as they are publicly listed.</div>
      )}

      <style>{`
        .live-profiles{padding:58px 0;border-top:1px solid rgba(201,168,76,.1);border-bottom:1px solid rgba(201,168,76,.1);overflow:hidden;background:rgba(255,255,255,.008)}
        .live-profiles-inner{max-width:1200px;margin:0 auto;padding:0 24px 28px;display:flex;justify-content:space-between;align-items:flex-end;gap:30px}
        .live-profiles-kicker{font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.62);text-transform:uppercase;margin-bottom:8px}
        .live-profiles-title{font-family:var(--font);font-size:clamp(28px,3.4vw,42px);font-weight:300;color:${PARCH};line-height:1.08;margin:0;letter-spacing:-.02em}
        .live-profiles-subtitle{font-size:14px;line-height:1.65;color:${DIM};margin:10px 0 0;max-width:720px}
        .live-profiles-link{flex-shrink:0;color:${GOLD};font-size:10px;font-weight:800;letter-spacing:.12em;text-decoration:none;border-bottom:1px solid rgba(201,168,76,.35);padding-bottom:5px}
        .vi-scroll-mask{width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
        .vi-scroll-track{display:flex;gap:14px;width:max-content;animation:vi-scroll-x 40s linear infinite;will-change:transform}
        .vi-scroll-track:hover{animation-play-state:paused}
        .vi-scroll-card{display:flex;align-items:center;gap:12px;flex-shrink:0;min-width:330px;padding:12px 14px;background:rgba(255,255,255,.035);border:1px solid rgba(247,244,238,.09);border-radius:8px;text-decoration:none;transition:border-color .2s,background .2s,transform .2s}
        .vi-scroll-card:hover{border-color:rgba(201,168,76,.38);background:rgba(255,255,255,.06);transform:translateY(-2px)}
        .vi-scroll-avatar{width:52px;height:52px;border-radius:50%;flex-shrink:0;background:${GOLD};display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid ${GOLD}}
        .vi-scroll-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}.vi-scroll-avatar span{color:${MID};font-size:15px;font-weight:700}
        .vi-scroll-copy{min-width:0;flex:1}.vi-scroll-id{font-size:11px;font-weight:700;letter-spacing:.04em;color:${PARCH};white-space:nowrap}.vi-scroll-headline{font-size:10px;color:${DIM};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px;margin-top:2px}.vi-scroll-track-label{font-size:8px;font-weight:700;letter-spacing:.06em;margin-top:3px;text-transform:uppercase;color:${GOLD}
        }.vi-scroll-score{min-width:58px;text-align:right;line-height:1;flex-shrink:0;border-left:1px solid rgba(201,168,76,.16);padding-left:12px}.vi-scroll-score-label{display:block;font-size:7px;font-weight:700;letter-spacing:.15em;color:rgba(247,244,238,.4);margin-bottom:3px}.vi-scroll-score strong{font-family:var(--font);font-size:27px;font-weight:300;color:${GOLD};letter-spacing:-.04em}.vi-scroll-score-max{font-size:8px;color:rgba(247,244,238,.35);margin-left:2px}
        .live-profiles-public-state{max-width:1200px;margin:0 auto;padding:16px 24px 0;color:rgba(247,244,238,.38);font-size:11px;line-height:1.6;display:flex;align-items:center;gap:8px}.live-profiles-dot{width:5px;height:5px;border-radius:50%;background:${GOLD};flex-shrink:0}
        @keyframes vi-scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(prefers-reduced-motion:reduce){.vi-scroll-track{animation:none}}@media(max-width:760px){.live-profiles-inner{align-items:flex-start;flex-direction:column}.vi-scroll-card{min-width:285px}}
      `}</style>
    </section>
  )
}
