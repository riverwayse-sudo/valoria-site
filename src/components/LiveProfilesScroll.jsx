'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const DARK = '#0F0F1A'
const MID  = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM  = 'rgba(247,244,238,.45)'

const TRACK_META = {
  candidate:  { label: 'ATB Connect',   color: '#378ADD' },
  speaker:    { label: 'ATB Spotlight', color: '#C9A84C' },
  facilitator:{ label: 'ATB Develop',   color: '#1D9E75' },
}

function primaryTrack(active_tracks) {
  if (!active_tracks || !active_tracks.length) return null
  for (const t of ['candidate', 'speaker', 'facilitator']) {
    if (active_tracks.includes(t)) return t
  }
  return active_tracks[0]
}

function getAvatarLetters(displayInitials) {
  if (!displayInitials) return '?'
  const letters = displayInitials.replace(/\./g, '')
  return letters ? letters.toUpperCase() : '?'
}

export default function LiveProfilesScroll() {
  const [profiles, setProfiles] = useState(null) // null = loading, [] = confirmed empty

  useEffect(() => {
    let cancelled = false
    supabase
      .from('professional_profiles')
      .select('id, atb_id, display_initials, headline, photo_url, active_tracks, valu_index')
      .eq('listing_status', 'listed')
      .neq('visibility', 'private')
      .order('valu_index', { ascending: false })
      .limit(24)
      .then(({ data, error }) => {
        if (error) console.error('LiveProfilesScroll fetch failed:', error)
        if (!cancelled) setProfiles(data || [])
      })
    return () => { cancelled = true }
  }, [])

  // No real listings yet — show nothing rather than padding with fake
  // people. That's the whole lesson from the marketplace sample-profile
  // trust issue: this strip only ever shows real, live professionals.
  if (!profiles || profiles.length === 0) return null

  // Duplicate the list once so the CSS animation can loop seamlessly.
  const loop = [...profiles, ...profiles]

  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid rgba(201,168,76,.1)', borderBottom: '1px solid rgba(201,168,76,.1)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 28px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.2em', color: 'rgba(201,168,76,.5)', textTransform: 'uppercase', marginBottom: '8px' }}>
          ALREADY ON THE PLATFORM
        </div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(20px,3vw,26px)', fontWeight: 200, color: PARCH, margin: 0 }}>
          {profiles.length} assessed professional{profiles.length === 1 ? '' : 's'}, live right now
        </h2>
      </div>

      <div className="vi-scroll-mask">
        <div className="vi-scroll-track">
          {loop.map((p, i) => {
            const track = TRACK_META[primaryTrack(p.active_tracks)] || TRACK_META.candidate
            const initials = p.display_initials || '—'
            return (
              <Link href={`/profile/${p.id}`} key={`${p.id}-${i}`} className="vi-scroll-card">
                <div className="vi-scroll-avatar">
                  {p.photo_url
                    ? <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <span style={{ color: MID, fontSize: '14px', fontWeight: 700 }}>{getAvatarLetters(p.display_initials)}</span>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: PARCH, whiteSpace: 'nowrap' }}>{p.atb_id || initials}</div>
                  <div style={{ fontSize: '11px', color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{p.headline || 'Valoria Professional'}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.06em', color: track.color, marginTop: '2px' }}>{track.label}</div>
                </div>
                {p.valu_index != null && (
                  <div style={{ fontSize: '11px', fontWeight: 700, color: GOLD, flexShrink: 0 }}>{p.valu_index}</div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        .vi-scroll-mask {
          width: 100%;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .vi-scroll-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: vi-scroll-x 40s linear infinite;
        }
        .vi-scroll-track:hover { animation-play-state: paused; }
        @keyframes vi-scroll-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .vi-scroll-card {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(247,244,238,.08);
          border-radius: 10px;
          padding: 10px 16px;
          text-decoration: none;
          min-width: 260px;
          transition: border-color .2s, background .2s;
        }
        .vi-scroll-card:hover {
          border-color: rgba(201,168,76,.35);
          background: rgba(255,255,255,.05);
        }
        .vi-scroll-avatar {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: ${GOLD};
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}
