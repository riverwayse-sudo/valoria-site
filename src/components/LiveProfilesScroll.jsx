import Link from 'next/link'

const TRACK_META = {
  candidate: { label: 'Talent', href: '/marketplace/talent' },
  speaker: { label: 'Speaker', href: '/marketplace/speakers' },
  facilitator: { label: 'Facilitator', href: '/marketplace/facilitators' },
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
  const discoverableCount = count ?? unique.length
  const trackCounts = unique.reduce((acc, profile) => {
    const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
    tracks.forEach(track => { const normalized = track === 'talent' ? 'candidate' : track; if (TRACK_META[normalized]) acc[normalized] = (acc[normalized] || 0) + 1 })
    return acc
  }, {})

  return (
    <section className="live-profiles" aria-labelledby="registry-title">
      <div className="live-profiles-shell">
        <div className="live-profiles-copy">
          <div className="live-profiles-kicker">THE VALORIA REGISTRY · LIVE</div>
          <h2 id="registry-title" className="live-profiles-title">See who is already <em>discoverable.</em></h2>
          <p className="live-profiles-subtitle">
            This is not a feature preview. These are professionals in the live Valoria marketplace — assessed, positioned and discoverable by capability.
          </p>
          <div className="live-profiles-proof" aria-label="Registry summary">
            <strong>{discoverableCount}</strong>
            <span>professionals currently discoverable</span>
          </div>
        </div>

        <div className="live-profiles-actions" aria-label="Marketplace actions">
          <Link href="/marketplace/talent" className="live-profile-action primary" data-marketplace-intent="talent">
            <span><small>HIRING / SOURCING</small>Find talent</span><b>→</b>
          </Link>
          <Link href="/marketplace/speakers" className="live-profile-action" data-marketplace-intent="speaker">
            <span><small>EVENTS / PROGRAMMES</small>Find a speaker</span><b>→</b>
          </Link>
          <Link href="/marketplace/facilitators" className="live-profile-action" data-marketplace-intent="facilitator">
            <span><small>WORKSHOPS / CHANGE</small>Find a facilitator</span><b>→</b>
          </Link>
        </div>
      </div>

      {unique.length > 0 ? (
        <>
          <div className="vi-scroll-mask">
            <div className="vi-scroll-track">
              {loop.map((profile, index) => {
                const tracks = Array.isArray(profile.active_tracks) ? profile.active_tracks : []
                const normalizedTracks = tracks.map(track => track === 'talent' ? 'candidate' : track)
                const primaryTrack = normalizedTracks.find(track => TRACK_META[track]) || 'candidate'
                const meta = TRACK_META[primaryTrack]
                const capabilityLabels = normalizedTracks.map(track => TRACK_META[track]?.label).filter(Boolean)
                return (
                  <Link
                    href={meta.href}
                    key={`${profile.id}-${index}`}
                    className="vi-scroll-card"
                    data-marketplace-intent={primaryTrack}
                    aria-label={`Discover more ${meta.label.toLowerCase()} professionals`}
                  >
                    <div className="vi-scroll-avatar" aria-hidden="true">
                      {profile.photo_url ? <img src={profile.photo_url} alt="" loading="lazy" /> : <span>{letters(profile.display_initials)}</span>}
                    </div>
                    <div className="vi-scroll-copy">
                      <div className="vi-scroll-topline"><span>{profile.atb_id || letters(profile.display_initials)}</span><i>LIVE</i></div>
                      <div className="vi-scroll-headline">{profile.headline || 'Valoria Professional'}</div>
                      <div className="vi-scroll-track-label">{capabilityLabels.length ? capabilityLabels.join(' · ') : 'Professional'}</div>
                    </div>
                    <div className="vi-scroll-score" aria-label={`VALU Index ${profile.valu_index ?? 'not available'}`}>
                      <span className="vi-scroll-score-label">VALU</span>
                      <strong>{profile.valu_index ?? '—'}</strong>
                      <span className="vi-scroll-score-max">/100</span>
                    </div>
                    <span className="vi-scroll-card-arrow" aria-hidden="true">↗</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="live-profiles-bottom">
            <div className="live-profiles-counts">
              {Object.entries(TRACK_META).map(([track, meta]) => (
                <span key={track}><b>{trackCounts[track] || 0}</b> {meta.label.toLowerCase()} profiles</span>
              ))}
            </div>
            <Link href="/marketplace" className="live-profiles-link" data-marketplace-intent="all">OPEN THE FULL REGISTRY <span>→</span></Link>
          </div>
        </>
      ) : (
        <div className="live-profiles-public-state"><span className="live-profiles-dot" />The public registry is being populated. Start with VALU to build a discoverable professional record.</div>
      )}

      <div className="live-profiles-professional-cta">
        <span className="live-profiles-professional-rule" />
        <div>
          <small>WANT TO BE DISCOVERED?</small>
          <strong>Build the professional record that makes your capability visible.</strong>
        </div>
        <Link href="/valu">START WITH VALU <span>→</span></Link>
      </div>

      <style>{`
        .live-profiles{padding:clamp(72px,8vw,108px) 0 0;border-top:1px solid rgba(201,168,76,.12);overflow:hidden;background:#11111f}
        .live-profiles-shell{max-width:1200px;margin:0 auto;padding:0 24px clamp(34px,4vw,50px);display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,520px);gap:clamp(36px,7vw,96px);align-items:end}
        .live-profiles-kicker{font-size:9px;font-weight:800;letter-spacing:.2em;color:rgba(201,168,76,.72);text-transform:uppercase;margin-bottom:14px}
        .live-profiles-title{font-family:var(--font);font-size:clamp(40px,5vw,64px);font-weight:300;color:#F7F4EE;line-height:1.02;margin:0;letter-spacing:-.035em}
        .live-profiles-title em{font-style:italic;color:#C9A84C;font-weight:350}
        .live-profiles-subtitle{font-size:clamp(16px,1.2vw,18px);line-height:1.7;color:rgba(247,244,238,.52);margin:18px 0 0;max-width:670px}
        .live-profiles-proof{display:flex;align-items:baseline;gap:10px;margin-top:24px}.live-profiles-proof strong{font:300 36px/1 var(--font);color:#C9A84C;letter-spacing:-.04em}.live-profiles-proof span{font-size:10px;font-weight:700;letter-spacing:.12em;color:rgba(247,244,238,.38);text-transform:uppercase}
        .live-profiles-actions{display:grid;gap:8px}
        .live-profile-action{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 18px;border:1px solid rgba(247,244,238,.1);background:rgba(247,244,238,.025);color:#F7F4EE;text-decoration:none;transition:transform .25s ease,border-color .25s ease,background .25s ease}
        .live-profile-action:hover,.live-profile-action:focus-visible{transform:translateX(4px);border-color:rgba(201,168,76,.42);background:rgba(201,168,76,.06);outline:none}
        .live-profile-action.primary{border-color:rgba(201,168,76,.34);background:rgba(201,168,76,.075)}
        .live-profile-action span{display:flex;flex-direction:column;gap:5px;font:500 15px/1.2 var(--font)}.live-profile-action small{font:800 8px/1 var(--font);letter-spacing:.18em;color:#C9A84C}.live-profile-action b{font:300 22px/1 var(--font);color:#C9A84C}
        .vi-scroll-mask{width:100%;overflow:hidden;padding:12px 0 26px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
        .vi-scroll-track{display:flex;gap:12px;width:max-content;animation:vi-scroll-x 42s linear infinite;will-change:transform}.vi-scroll-track:hover{animation-play-state:paused}
        .vi-scroll-card{display:grid;grid-template-columns:54px minmax(180px,1fr) 68px 26px;align-items:center;gap:13px;flex-shrink:0;width:min(410px,78vw);padding:13px 14px;background:#191929;border:1px solid rgba(247,244,238,.1);text-decoration:none;transition:border-color .2s ease,background .2s ease,transform .2s ease}
        .vi-scroll-card:hover{border-color:rgba(201,168,76,.46);background:#202037;transform:translateY(-3px)}
        .vi-scroll-avatar{width:54px;height:54px;border-radius:50%;flex-shrink:0;background:#C9A84C;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(247,244,238,.2)}
        .vi-scroll-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}.vi-scroll-avatar span{color:#1A1A2E;font-size:15px;font-weight:700}
        .vi-scroll-copy{min-width:0}.vi-scroll-topline{display:flex;align-items:center;gap:7px;margin-bottom:5px;font:800 9px/1 var(--font);letter-spacing:.06em;color:#F7F4EE}.vi-scroll-topline i{font:800 7px/1 var(--font);letter-spacing:.12em;color:#9ed0a8;border:1px solid rgba(158,208,168,.3);padding:3px 5px;font-style:normal}
        .vi-scroll-headline{font:500 13px/1.3 var(--font);color:rgba(247,244,238,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vi-scroll-track-label{font-size:8px;font-weight:800;letter-spacing:.08em;margin-top:5px;text-transform:uppercase;color:#C9A84C}
        .vi-scroll-score{text-align:right;line-height:1;border-left:1px solid rgba(201,168,76,.16);padding-left:11px}.vi-scroll-score-label{display:block;font-size:7px;font-weight:800;letter-spacing:.15em;color:rgba(247,244,238,.36);margin-bottom:4px}.vi-scroll-score strong{font:300 26px/1 var(--font);color:#C9A84C;letter-spacing:-.04em}.vi-scroll-score-max{font-size:7px;color:rgba(247,244,238,.3);margin-left:2px}
        .vi-scroll-card-arrow{font-size:18px;color:rgba(201,168,76,.7);text-align:center}
        .live-profiles-bottom{max-width:1200px;margin:0 auto;padding:0 24px 28px;display:flex;justify-content:space-between;align-items:center;gap:20px}
        .live-profiles-counts{display:flex;flex-wrap:wrap;gap:8px 18px}.live-profiles-counts span{font:800 8px/1.4 var(--font);letter-spacing:.1em;text-transform:uppercase;color:rgba(247,244,238,.34)}.live-profiles-counts b{color:#C9A84C;font-size:10px}
        .live-profiles-link{flex-shrink:0;color:#C9A84C;font:800 10px/1.4 var(--font);letter-spacing:.13em;text-decoration:none;border-bottom:1px solid rgba(201,168,76,.35);padding-bottom:5px}.live-profiles-link span{margin-left:5px}
        .live-profiles-public-state{max-width:1200px;margin:0 auto;padding:16px 24px 30px;color:rgba(247,244,238,.38);font-size:12px;line-height:1.6;display:flex;align-items:center;gap:8px}.live-profiles-dot{width:5px;height:5px;border-radius:50%;background:#C9A84C;flex-shrink:0}
        .live-profiles-professional-cta{max-width:1200px;margin:0 auto;padding:25px 24px 28px;border-top:1px solid rgba(201,168,76,.1);display:grid;grid-template-columns:1fr minmax(0,2fr) auto;align-items:center;gap:22px}
        .live-profiles-professional-rule{width:42px;height:1px;background:rgba(201,168,76,.5)}.live-profiles-professional-cta div{display:flex;flex-direction:column;gap:5px}.live-profiles-professional-cta small{font:800 8px/1 var(--font);letter-spacing:.18em;color:rgba(201,168,76,.62)}.live-profiles-professional-cta strong{font:400 14px/1.4 var(--font);color:rgba(247,244,238,.72)}.live-profiles-professional-cta a{font:800 9px/1 var(--font);letter-spacing:.14em;color:#C9A84C;text-decoration:none;white-space:nowrap}.live-profiles-professional-cta a span{margin-left:5px}
        to{transform:translateX(-50%)}}
        
        @media(max-width:900px){.live-profiles-shell{grid-template-columns:1fr;gap:30px}.live-profiles-actions{grid-template-columns:repeat(3,minmax(0,1fr))}.live-profile-action{min-height:90px;align-items:flex-start}.live-profiles-professional-cta{grid-template-columns:34px 1fr auto}}
        @media(max-width:640px){.live-profiles{padding-top:62px}.live-profiles-shell{padding-left:18px;padding-right:18px}.live-profiles-title{font-size:clamp(36px,11vw,48px)}.live-profiles-subtitle{font-size:16px}.live-profiles-proof{margin-top:20px}.live-profiles-actions{grid-template-columns:1fr}.live-profile-action{min-height:0}.vi-scroll-mask{padding-bottom:22px}.vi-scroll-card{grid-template-columns:48px minmax(150px,1fr) 60px 18px;width:calc(100vw - 38px);gap:10px;padding:11px}.vi-scroll-avatar{width:48px;height:48px}.vi-scroll-headline{font-size:12px}.vi-scroll-score strong{font-size:23px}.live-profiles-bottom{padding-left:18px;padding-right:18px;align-items:flex-start;flex-direction:column}.live-profiles-professional-cta{padding-left:18px;padding-right:18px;grid-template-columns:1fr;gap:12px}.live-profiles-professional-rule{display:none}}
      `}</style>
    <style>{`
        .live-profiles{padding:clamp(72px,8vw,108px) 0 0;border-top:1px solid rgba(201,168,76,.12);overflow:hidden;background:#11111f}
        .live-profiles-shell{max-width:1200px;margin:0 auto;padding:0 24px clamp(34px,4vw,50px);display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,520px);gap:clamp(36px,7vw,96px);align-items:end}
        .live-profiles-kicker{font-size:9px;font-weight:800;letter-spacing:.2em;color:rgba(201,168,76,.72);text-transform:uppercase;margin-bottom:14px}
        .live-profiles-title{font-family:var(--font);font-size:clamp(40px,5vw,64px);font-weight:300;color:#F7F4EE;line-height:1.02;margin:0;letter-spacing:-.035em}
        .live-profiles-title em{font-style:italic;color:#C9A84C;font-weight:350}
        .live-profiles-subtitle{font-size:clamp(16px,1.2vw,18px);line-height:1.7;color:rgba(247,244,238,.52);margin:18px 0 0;max-width:670px}
        .live-profiles-proof{display:flex;align-items:baseline;gap:10px;margin-top:24px}.live-profiles-proof strong{font:300 36px/1 var(--font);color:#C9A84C;letter-spacing:-.04em}.live-profiles-proof span{font-size:10px;font-weight:700;letter-spacing:.12em;color:rgba(247,244,238,.38);text-transform:uppercase}
        .live-profiles-actions{display:grid;gap:8px}
        .live-profile-action{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 18px;border:1px solid rgba(247,244,238,.1);background:rgba(247,244,238,.025);color:#F7F4EE;text-decoration:none;transition:transform .25s ease,border-color .25s ease,background .25s ease}
        .live-profile-action:hover,.live-profile-action:focus-visible{border-color:rgba(201,168,76,.42);background:rgba(201,168,76,.06);outline:none}
        .live-profile-action.primary{border-color:rgba(201,168,76,.34);background:rgba(201,168,76,.075)}
        .live-profile-action span{display:flex;flex-direction:column;gap:5px;font:500 15px/1.2 var(--font)}.live-profile-action small{font:800 8px/1 var(--font);letter-spacing:.18em;color:#C9A84C}.live-profile-action b{font:300 22px/1 var(--font);color:#C9A84C}
        .vi-scroll-mask{width:100%;overflow:hidden;padding:12px 0 26px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
        .vi-scroll-track{display:flex;gap:12px;width:max-content;}
        .vi-scroll-card{display:grid;grid-template-columns:54px minmax(180px,1fr) 68px 26px;align-items:center;gap:13px;flex-shrink:0;width:min(410px,78vw);padding:13px 14px;background:#191929;border:1px solid rgba(247,244,238,.1);text-decoration:none;transition:border-color .2s ease,background .2s ease,transform .2s ease}
        .vi-scroll-card:hover{border-color:rgba(201,168,76,.46);background:#202037;transform:translateY(-3px)}
        .vi-scroll-avatar{width:54px;height:54px;border-radius:50%;flex-shrink:0;background:#C9A84C;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(247,244,238,.2)}
        .vi-scroll-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}.vi-scroll-avatar span{color:#1A1A2E;font-size:15px;font-weight:700}
        .vi-scroll-copy{min-width:0}.vi-scroll-topline{display:flex;align-items:center;gap:7px;margin-bottom:5px;font:800 9px/1 var(--font);letter-spacing:.06em;color:#F7F4EE}.vi-scroll-topline i{font:800 7px/1 var(--font);letter-spacing:.12em;color:#9ed0a8;border:1px solid rgba(158,208,168,.3);padding:3px 5px;font-style:normal}
        .vi-scroll-headline{font:500 13px/1.3 var(--font);color:rgba(247,244,238,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vi-scroll-track-label{font-size:8px;font-weight:800;letter-spacing:.08em;margin-top:5px;text-transform:uppercase;color:#C9A84C}
        .vi-scroll-score{text-align:right;line-height:1;border-left:1px solid rgba(201,168,76,.16);padding-left:11px}.vi-scroll-score-label{display:block;font-size:7px;font-weight:800;letter-spacing:.15em;color:rgba(247,244,238,.36);margin-bottom:4px}.vi-scroll-score strong{font:300 26px/1 var(--font);color:#C9A84C;letter-spacing:-.04em}.vi-scroll-score-max{font-size:7px;color:rgba(247,244,238,.3);margin-left:2px}
        .vi-scroll-card-arrow{font-size:18px;color:rgba(201,168,76,.7);text-align:center}
        .live-profiles-bottom{max-width:1200px;margin:0 auto;padding:0 24px 28px;display:flex;justify-content:space-between;align-items:center;gap:20px}
        .live-profiles-counts{display:flex;flex-wrap:wrap;gap:8px 18px}.live-profiles-counts span{font:800 8px/1.4 var(--font);letter-spacing:.1em;text-transform:uppercase;color:rgba(247,244,238,.34)}.live-profiles-counts b{color:#C9A84C;font-size:10px}
        .live-profiles-link{flex-shrink:0;color:#C9A84C;font:800 10px/1.4 var(--font);letter-spacing:.13em;text-decoration:none;border-bottom:1px solid rgba(201,168,76,.35);padding-bottom:5px}.live-profiles-link span{margin-left:5px}
        .live-profiles-public-state{max-width:1200px;margin:0 auto;padding:16px 24px 30px;color:rgba(247,244,238,.38);font-size:12px;line-height:1.6;display:flex;align-items:center;gap:8px}.live-profiles-dot{width:5px;height:5px;border-radius:50%;background:#C9A84C;flex-shrink:0}
        .live-profiles-professional-cta{max-width:1200px;margin:0 auto;padding:25px 24px 28px;border-top:1px solid rgba(201,168,76,.1);display:grid;grid-template-columns:1fr minmax(0,2fr) auto;align-items:center;gap:22px}
        .live-profiles-professional-rule{width:42px;height:1px;background:rgba(201,168,76,.5)}.live-profiles-professional-cta div{display:flex;flex-direction:column;gap:5px}.live-profiles-professional-cta small{font:800 8px/1 var(--font);letter-spacing:.18em;color:rgba(201,168,76,.62)}.live-profiles-professional-cta strong{font:400 14px/1.4 var(--font);color:rgba(247,244,238,.72)}.live-profiles-professional-cta a{font:800 9px/1 var(--font);letter-spacing:.14em;color:#C9A84C;text-decoration:none;white-space:nowrap}.live-profiles-professional-cta a span{margin-left:5px}
        to{transform:translateX(-50%)}}
        .live-profile-action,.vi-scroll-card{transition:none}}
        @media(max-width:900px){.live-profiles-shell{grid-template-columns:1fr;gap:30px}.live-profiles-actions{grid-template-columns:repeat(3,minmax(0,1fr))}.live-profile-action{min-height:90px;align-items:flex-start}.live-profiles-professional-cta{grid-template-columns:34px 1fr auto}}
        @media(max-width:640px){.live-profiles{padding-top:62px}.live-profiles-shell{padding-left:18px;padding-right:18px}.live-profiles-title{font-size:clamp(36px,11vw,48px)}.live-profiles-subtitle{font-size:16px}.live-profiles-proof{margin-top:20px}.live-profiles-actions{grid-template-columns:1fr}.live-profile-action{min-height:0}.vi-scroll-mask{padding-bottom:22px}.vi-scroll-card{grid-template-columns:48px minmax(150px,1fr) 60px 18px;width:calc(100vw - 38px);gap:10px;padding:11px}.vi-scroll-avatar{width:48px;height:48px}.vi-scroll-headline{font-size:12px}.vi-scroll-score strong{font-size:23px}.live-profiles-bottom{padding-left:18px;padding-right:18px;align-items:flex-start;flex-direction:column}.live-profiles-professional-cta{padding-left:18px;padding-right:18px;grid-template-columns:1fr;gap:12px}.live-profiles-professional-rule{display:none}}
      
        .live-profile-action,.vi-scroll-card{transition:transform var(--motion-standard) var(--motion-ease),border-color var(--motion-standard) var(--motion-ease),background-color var(--motion-standard) var(--motion-ease)}
        @media (hover:hover) and (pointer:fine){
          .live-profile-action:hover,.live-profile-action:focus-visible{transform:translate3d(4px,0,0)}
          .vi-scroll-card:hover{transform:translate3d(0,-3px,0)}
          .vi-scroll-track:hover{animation-play-state:paused}
        }
        .vi-scroll-track{animation:vi-scroll-x var(--motion-registry-loop,42s) linear infinite;will-change:transform}
        @keyframes vi-scroll-x{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
        @media(prefers-reduced-motion:reduce){.vi-scroll-track{animation:none}.live-profile-action,.vi-scroll-card{transition:none}}
`}</style></section>
  )
}
