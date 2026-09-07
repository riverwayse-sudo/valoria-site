'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MID = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM = 'rgba(247,244,238,.45)'

const TRACK_META = {
  candidate: { label: 'ATB Connect', color: '#378ADD' },
  speaker: { label: 'ATB Spotlight', color: '#C9A84C' },
  facilitator: { label: 'ATB Develop', color: '#1D9E75' },
}

function primaryTrack(tracks) {
  if (!Array.isArray(tracks) || tracks.length === 0) return null
  return ['candidate', 'speaker', 'facilitator'].find((track) => tracks.includes(track)) || tracks[0]
}

function letters(value) {
  return value ? value.replace(/\./g, '').toUpperCase() : 'V'
}

export default function LiveProfilesScroll() {
  const [profiles, setProfiles] = useState([])
  const [count, setCount] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadHomepageProfiles() {
      const [{ data: publicProfiles, error: profilesError }, { data: profileCount, error: countError }] = await Promise.all([
        supabase.rpc('get_homepage_professional_previews'),
        supabase.rpc('get_homepage_professional_count'),
      ])

      if (profilesError) console.error('Homepage profile preview fetch failed:', profilesError)
      if (countError) console.error('Homepage professional count fetch failed:', countError)

      if (!cancelled) {
        setProfiles(Array.isArray(publicProfiles) ? publicProfiles : [])
        setCount(typeof profileCount === 'number' ? profileCount : null)
        setLoaded(true)
      }
    }

    loadHomepageProfiles()
    return () => { cancelled = true }
  }, [])

  if (!loaded) {
    return (
      <section className="live-profiles live-profiles-loading" aria-label="Valoria professional community">
        <div className="live-profiles-inner">
          <div className="live-profiles-kicker">THE VALORIA COMMUNITY</div>
          <div className="live-profiles-loading-line" aria-hidden="true" />
        </div>
      </section>
    )
  }

  const loop = [...profiles, ...profiles]

  return (
    <section className="live-profiles" aria-label="Valoria professional community">
      <div className="live-profiles-inner">
        <div>
          <div className="live-profiles-kicker">ALREADY ON THE PLATFORM</div>
          <h2 className="live-profiles-title">
            {count === null ? 'The Valoria professional community' : `${count.toLocaleString()} assessed professional${count === 1 ? '' : 's'}`}
          </h2>
          <p className="live-profiles-subtitle">
            {profiles.length > 0
              ? 'Assessed professionals, moving from capability to opportunity.'
              : 'The professional directory is being prepared for public discovery.'}
          </p>
        </div>
      </div>

      {profiles.length > 0 ? (
        <div className="vi-scroll-mask">
          <div className="vi-scroll-track">
            {loop.map((profile, index) => {
              const track = TRACK_META[primaryTrack(profile.active_tracks)] || TRACK_META.candidate
              return (
                <Link href={`/profile/${profile.id}`} key={`${profile.id}-${index}`} className="vi-scroll-card">
                  <div className="vi-scroll-avatar">
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt="" loading="lazy" />
                    ) : (
                      <span>{letters(profile.display_initials)}</span>
                    )}
                  </div>
                  <div className="vi-scroll-copy">
                    <div className="vi-scroll-id">{profile.atb_id || letters(profile.display_initials)}</div>
                    <div className="vi-scroll-headline">{profile.headline || 'Valoria Professional'}</div>
                    <div className="vi-scroll-track-label" style={{ color: track.color }}>{track.label}</div>
                  </div>
                  {profile.valu_index != null && <div className="vi-scroll-score">{profile.valu_index}</div>}
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="live-profiles-public-state">
          <span className="live-profiles-dot" />
          Public profiles will appear here as professionals are approved for marketplace discovery.
        </div>
      )}

      <style>{`
        .live-profiles{padding:48px 0;border-top:1px solid rgba(201,168,76,.1);border-bottom:1px solid rgba(201,168,76,.1);overflow:hidden;background:rgba(255,255,255,.008)}
        .live-profiles-inner{max-width:1200px;margin:0 auto;padding:0 24px 26px}
        .live-profiles-kicker{font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(201,168,76,.62);text-transform:uppercase;margin-bottom:8px}
        .live-profiles-title{font-family:var(--font);font-size:clamp(22px,3vw,30px);font-weight:200;color:${PARCH};line-height:1.15;margin:0}
        .live-profiles-subtitle{font-size:12px;line-height:1.6;color:${DIM};margin:8px 0 0;max-width:620px}
        .live-profiles-loading-line{height:1px;width:min(360px,70vw);margin-top:18px;background:linear-gradient(90deg,rgba(201,168,76,.45),rgba(201,168,76,0));animation:vi-pulse 1.4s ease-in-out infinite}
        .vi-scroll-mask{width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
        .vi-scroll-track{display:flex;gap:14px;width:max-content;animation:vi-scroll-x 40s linear infinite;will-change:transform}
        .vi-scroll-track:hover{animation-play-state:paused}
        .vi-scroll-card{display:flex;align-items:center;gap:10px;flex-shrink:0;min-width:260px;padding:10px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(247,244,238,.08);border-radius:10px;text-decoration:none;transition:border-color .2s,background .2s,transform .2s}
        .vi-scroll-card:hover{border-color:rgba(201,168,76,.35);background:rgba(255,255,255,.05);transform:translateY(-2px)}
        .vi-scroll-avatar{width:38px;height:38px;border-radius:50%;flex-shrink:0;background:${GOLD};display:flex;align-items:center;justify-content:center;overflow:hidden}
        .vi-scroll-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
        .vi-scroll-avatar span{color:${MID};font-size:14px;font-weight:700}
        .vi-scroll-copy{min-width:0}
        .vi-scroll-id{font-size:12px;font-weight:700;color:${PARCH};white-space:nowrap}
        .vi-scroll-headline{font-size:11px;color:${DIM};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}
        .vi-scroll-track-label{font-size:9px;font-weight:700;letter-spacing:.06em;margin-top:2px}
        .vi-scroll-score{font-size:11px;font-weight:700;color:${GOLD};flex-shrink:0;margin-left:auto}
        .live-profiles-public-state{max-width:1200px;margin:0 auto;padding:16px 24px 0;color:rgba(247,244,238,.38);font-size:11px;line-height:1.6;display:flex;align-items:center;gap:8px}
        .live-profiles-dot{width:5px;height:5px;border-radius:50%;background:${GOLD};flex-shrink:0}
        @keyframes vi-scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes vi-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        @media (prefers-reduced-motion:reduce){.vi-scroll-track{animation:none}.live-profiles-loading-line{animation:none}}
        @media (max-width:640px){.live-profiles{padding:36px 0}.live-profiles-inner{padding-bottom:20px}.vi-scroll-card{min-width:230px;padding:9px 12px}.vi-scroll-headline{max-width:130px}}
      `}</style>
    </section>
  )
}
