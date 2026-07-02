'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PRIME_CLUSTERS } from '@/lib/brand'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.45)'
const FAINT = 'rgba(247,244,238,.2)'

const TIER_MAP = {
  emerging:    { label: '✦ Emerging',     color: '#D4C9A8' },
  established: { label: '✦✦ Established', color: GOLD },
  elite:       { label: '✦✦✦ Elite',      color: '#FFE09A' },
}

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function ScoreBar({ label, score, color }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color }}>{label}</span>
        <span style={{ fontSize: '12px', color, fontWeight: 700 }}>{score ?? '—'}</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,.06)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${score ?? 0}%`, background: color, borderRadius: '2px', transition: 'width .5s ease' }} />
      </div>
    </div>
  )
}

export default function PublicProfilePage({ params }) {
  const { id } = params
  const [profile, setProfile] = useState(null)
  const [source, setSource] = useState(null) // 'profiles' | 'marketplace_profiles'
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // Try real user profiles first
      const { data: real } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (real) {
        setProfile(real)
        setSource('profiles')
        setLoading(false)
        return
      }

      // Fallback: check marketplace_profiles (dummy accounts)
      const { data: dummy } = await supabase
        .from('marketplace_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (dummy) {
        // Normalise dummy profile to the same shape as a real profile
        setProfile({
          id: dummy.id,
          display_name: dummy.full_name,
          headline: dummy.headline,
          location: dummy.location,
          industry: dummy.industry,
          bio: dummy.bio,
          photo_url: dummy.avatar_url,
          cover_url: null,
          skills: dummy.skills || [],
          topics: dummy.skills || [],
          linkedin_url: dummy.linkedin_url,
          website_url: dummy.portfolio_url,
          youtube_links: dummy.video_url ? [dummy.video_url] : [],
          fee_range: dummy.fee_range,
          availability: 'open',
          years_experience: dummy.years_experience,
          user_type: dummy.section,
          valu_score: null,
          valu_tier: null,
          cluster_scores: null,
          is_dummy: true,
        })
        setSource('marketplace_profiles')
        setLoading(false)
        return
      }

      setNotFound(true)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Raleway', color: GOLD, fontSize: '14px' }}>
        Loading profile…
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Raleway', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: PARCHMENT }}>
        <div style={{ fontSize: '36px', color: GOLD }}>◈</div>
        <h1 style={{ fontSize: '20px', fontWeight: 200 }}>Profile not found</h1>
        <Link href="/marketplace" style={{ fontSize: '13px', color: GOLD }}>← Back to marketplace</Link>
      </div>
    )
  }

  const p = profile
  const isSpeaker = p.user_type === 'speaker'
  const hasVALU = p.valu_score != null
  const tier = TIER_MAP[p.valu_tier] || null
  const videoLinks = (p.youtube_links || []).filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway','Helvetica Neue',Arial,sans-serif", color: PARCHMENT }}>

      {/* NAV */}
      <header style={S.header}>
        <Link href="/" style={{ lineHeight: 0 }}>
          <img src="/logo.png" alt="Valoria Institute" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/marketplace" style={S.navLink}>← Marketplace</Link>
          <Link href={`/marketplace?mode=${isSpeaker ? 'speaker' : 'talent'}`} style={S.navLink}>
            {isSpeaker ? 'More Speakers' : 'More Talent'}
          </Link>
        </nav>
      </header>

      {/* COVER */}
      <div style={{
        width: '100%', height: '220px',
        background: p.cover_url ? `url(${p.cover_url}) center/cover no-repeat` : `linear-gradient(135deg, #1A1A2E 0%, #0F0F1A 50%, rgba(201,168,76,.08) 100%)`,
        borderBottom: '1px solid rgba(201,168,76,.1)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,15,26,.9) 0%, transparent 60%)' }} />
      </div>

      {/* MAIN CONTENT */}
      <div style={S.container}>
        <div style={S.twoCol}>

          {/* LEFT SIDEBAR */}
          <aside style={S.sidebar}>

            {/* Avatar */}
            <div style={{ marginTop: '-64px', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
              <div style={S.avatarWrap}>
                {p.photo_url
                  ? <img src={p.photo_url} alt={p.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <span style={{ fontSize: '36px', color: GOLD }}>◈</span>}
              </div>
            </div>

            {/* Name + headline */}
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: PARCHMENT, lineHeight: 1.2, marginBottom: '6px' }}>
              {p.display_name || 'Valoria Professional'}
            </h1>
            {p.headline && (
              <div style={{ fontSize: '13px', color: GOLD, marginBottom: '8px', fontWeight: 500 }}>{p.headline}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
              {p.location && <span style={{ fontSize: '12px', color: DIM }}>📍 {p.location}</span>}
              {p.industry && <span style={{ fontSize: '12px', color: DIM }}>🏢 {p.industry}</span>}
              {p.years_experience && <span style={{ fontSize: '12px', color: DIM }}>⏱ {p.years_experience} years experience</span>}
            </div>

            {/* VALU Score */}
            {hasVALU ? (
              <div style={S.card}>
                <div style={S.cardLabel}>VALU INDEX</div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: GOLD, lineHeight: 1 }}>{p.valu_score}</div>
                <div style={{ fontSize: '10px', color: DIM, letterSpacing: '.1em', marginTop: '2px' }}>OUT OF 100</div>
                {tier && (
                  <div style={{ fontSize: '12px', fontWeight: 700, color: tier.color, marginTop: '8px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {tier.label}
                  </div>
                )}
                {p.assessment_completed_at && (
                  <div style={{ fontSize: '10px', color: FAINT, marginTop: '6px' }}>
                    Assessed {new Date(p.assessment_completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
                {p.cluster_scores && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={S.cardLabel}>PRIME BREAKDOWN</div>
                    {PRIME_CLUSTERS.map(c => (
                      <ScoreBar key={c.letter} label={c.name} score={p.cluster_scores[c.letter]} color={c.color} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={S.card}>
                <div style={S.cardLabel}>VALU INDEX</div>
                <p style={{ fontSize: '12px', color: DIM, lineHeight: 1.6, marginBottom: '12px' }}>
                  This professional has not yet completed their VALU Index assessment.
                </p>
                <a href="https://assessment.valoriainstitute.com/" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)', color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', borderRadius: '999px', textDecoration: 'none' }}>
                  ABOUT THE VALU INDEX
                </a>
              </div>
            )}

            {/* Availability */}
            {p.availability && Array.isArray(p.availability) && p.availability.length > 0 && (
              <div style={S.card}>
                <div style={S.cardLabel}>AVAILABILITY</div>
                {p.availability.map(a => (
                  <div key={a} style={{ fontSize: '12px', color: DIM, marginBottom: '4px' }}>● {a}</div>
                ))}
              </div>
            )}

            {/* Fee range (speakers) */}
            {isSpeaker && p.fee_range && (
              <div style={S.card}>
                <div style={S.cardLabel}>SPEAKING FEE</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: GOLD }}>{p.fee_range}</div>
              </div>
            )}

            {/* Links */}
            {(p.linkedin_url || p.website_url || p.twitter_url) && (
              <div style={S.card}>
                <div style={S.cardLabel}>LINKS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.linkedin_url && (
                    <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" style={S.linkBtn}>
                      <span>in</span> LinkedIn
                    </a>
                  )}
                  {p.website_url && (
                    <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={S.linkBtn}>
                      <span>↗</span> Website
                    </a>
                  )}
                  {p.twitter_url && (
                    <a href={p.twitter_url} target="_blank" rel="noopener noreferrer" style={S.linkBtn}>
                      <span>𝕏</span> Twitter / X
                    </a>
                  )}
                </div>
              </div>
            )}

          </aside>

          {/* RIGHT — main content */}
          <main style={{ minWidth: 0 }}>

            {/* Bio */}
            {p.bio && (
              <Section label="About">
                <p style={{ fontSize: '14px', color: DIM, lineHeight: 1.8, fontWeight: 300 }}>{p.bio}</p>
              </Section>
            )}

            {/* Skills */}
            {p.skills && p.skills.length > 0 && !isSpeaker && (
              <Section label="Core Skills">
                <div style={S.chipGrid}>
                  {p.skills.map(s => <Chip key={s}>{s}</Chip>)}
                </div>
              </Section>
            )}

            {/* Speaking topics */}
            {p.topics && p.topics.length > 0 && isSpeaker && (
              <Section label="Speaking Topics">
                <div style={S.chipGrid}>
                  {p.topics.map(t => <Chip key={t}>{t}</Chip>)}
                </div>
              </Section>
            )}

            {/* Modality */}
            {p.modality && p.modality.length > 0 && (
              <Section label="Work Modality">
                <div style={S.chipGrid}>
                  {p.modality.map(m => <Chip key={m}>{m}</Chip>)}
                </div>
              </Section>
            )}

            {/* Video reel(s) */}
            {videoLinks.length > 0 && (
              <Section label={isSpeaker ? 'Speaker Reel & Videos' : 'Videos'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {videoLinks.map((url, i) => {
                    const ytId = getYouTubeId(url)
                    if (ytId) {
                      return (
                        <div key={i} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={`Video ${i + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          />
                        </div>
                      )
                    }
                    return (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', padding: '12px 16px', border: '1px solid rgba(201,168,76,.2)', borderRadius: '8px', color: GOLD, fontSize: '13px', textDecoration: 'none' }}>
                        ▶ Watch video {i + 1} →
                      </a>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Contact CTA */}
            <div id="contact" style={{ ...S.card, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.18)', marginTop: '8px' }}>
              <div style={S.cardLabel}>GET IN TOUCH</div>
              <p style={{ fontSize: '13px', color: DIM, lineHeight: 1.7, marginBottom: '16px' }}>
                {isSpeaker
                  ? `Interested in booking ${p.display_name || 'this speaker'} for your event? Reach out via the Valoria Institute.`
                  : `Want to connect with ${p.display_name || 'this professional'}? Send an introduction through the Valoria Institute.`}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href={`mailto:info@valoriainstitute.com?subject=${encodeURIComponent(`Enquiry: ${p.display_name || 'Profile'} — Valoria Institute`)}`}
                  style={{ padding: '12px 24px', background: GOLD, color: '#0F0F1A', borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', textDecoration: 'none' }}>
                  {isSpeaker ? 'BOOK THIS SPEAKER' : 'SEND INTRODUCTION'}
                </a>
                <Link href={`/marketplace?mode=${isSpeaker ? 'speaker' : 'talent'}`}
                  style={{ padding: '12px 24px', border: '1px solid rgba(201,168,76,.25)', color: GOLD, borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', textDecoration: 'none' }}>
                  {isSpeaker ? 'MORE SPEAKERS' : 'MORE TALENT'}
                </Link>
              </div>
            </div>

            {/* Dummy badge — remove once real profiles exist */}
            {p.is_dummy && (
              <div style={{ marginTop: '24px', padding: '10px 14px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.1)', borderRadius: '6px', fontSize: '11px', color: 'rgba(201,168,76,.4)', textAlign: 'center' }}>
                Sample profile — real professionals launching soon.
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(201,168,76,.5)', marginBottom: '16px', textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  )
}

function Chip({ children }) {
  return (
    <span style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(201,168,76,.2)', color: DIM, fontSize: '12px', background: 'rgba(201,168,76,.04)' }}>
      {children}
    </span>
  )
}

const S = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: MIDNIGHT, borderBottom: '1px solid rgba(201,168,76,.12)', position: 'sticky', top: 0, zIndex: 100 },
  navLink: { fontSize: '12px', color: DIM, textDecoration: 'none' },
  container: { maxWidth: '1060px', margin: '0 auto', padding: '0 24px 80px' },
  twoCol: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', alignItems: 'start' },
  sidebar: { position: 'sticky', top: '80px' },
  avatarWrap: { width: '112px', height: '112px', borderRadius: '50%', border: `3px solid ${GOLD}`, background: MIDNIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  card: { background: 'rgba(26,26,46,.5)', border: '1px solid rgba(201,168,76,.1)', borderRadius: '10px', padding: '20px', marginBottom: '16px' },
  cardLabel: { fontSize: '9px', fontWeight: 700, letterSpacing: '.16em', color: 'rgba(201,168,76,.5)', marginBottom: '12px', textTransform: 'uppercase' },
  chipGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  linkBtn: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: DIM, textDecoration: 'none', padding: '8px 12px', border: '1px solid rgba(201,168,76,.12)', borderRadius: '6px' },
}
