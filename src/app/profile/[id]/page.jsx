'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ─── helpers ─────────────────────────────────────────────────────────────────
function getAvatarLetters(displayInitials) {
  if (!displayInitials) return '?'
  const letters = displayInitials.replace(/\./g, '')
  return letters ? letters.toUpperCase() : '?'
}

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

// ─── component ───────────────────────────────────────────────────────────────
export default function ProfilePage({ params }) {
  const { id } = params
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    async function load() {
      // Try real professional_profiles first
      const { data: real } = await supabase
        .from('professional_profiles')
        .select('id, display_initials, headline, location, industry, years_experience, bio, skills, topics, active_tracks, listing_status, valu_index, cluster_scores, designation, assessment_completed_at, linkedin_url, website_url, youtube_links, fee_range, salary_expectation, atb_id, availability')
        .eq('id', id)
        .single()

      if (real) {
        setProfile({ ...real, _source: 'real', valu_score: real.valu_index, user_type: (real.active_tracks||[])[0] || 'candidate' })
        setLoading(false)
        return
      }

      // Fallback: dummy marketplace_profiles
      const { data: dummy } = await supabase
        .from('marketplace_profiles')
        .select('id, atb_id, display_initials, headline, location, industry, years_experience, bio, skills, section, linkedin_url, portfolio_url, video_url, fee_range, salary_expectation')
        .eq('id', id)
        .single()

      if (dummy) {
        setProfile({
          id: dummy.id,
          display_initials: dummy.display_initials,
          headline: dummy.headline,
          location: dummy.location,
          industry: dummy.industry,
          years_experience: dummy.years_experience,
          bio: dummy.bio,
          skills: dummy.skills || [],
          topics: dummy.skills || [],
          user_type: dummy.section,
          valu_score: null,
          cluster_scores: null,
          linkedin_url: dummy.linkedin_url,
          website_url: dummy.portfolio_url,
          youtube_links: dummy.video_url ? [dummy.video_url] : [],
          fee_range: dummy.fee_range,
          salary_expectation: dummy.salary_expectation,
          atb_id: dummy.atb_id,
          availability: 'open',
          is_dummy: true,
          _source: 'dummy',
        })
        setLoading(false)
        return
      }

      setNotFound(true)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#05060B', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', color:'rgba(243,239,230,.4)', fontSize:'14px', letterSpacing:'.06em' }}>
      Loading profile…
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:'#05060B', fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', color:'#F3EFE6' }}>
      <div style={{ fontSize:'40px', color:'#D4A24C' }}>◈</div>
      <h1 style={{ fontSize:'20px', fontWeight:300 }}>Profile not found</h1>
      <Link href="/atb-connect" style={{ fontSize:'13px', color:'#D4A24C', textDecoration:'none' }}>← Back to marketplace</Link>
    </div>
  )

  const p = profile
  const isSpeaker = p.user_type === 'speaker'
  const initials = p.display_initials || '—'
  const avatarLetters = getAvatarLetters(p.display_initials)
  const atbId = p.atb_id || '—'
  const videos = (p.youtube_links || []).filter(Boolean)
  const compensation = isSpeaker
    ? (p.fee_range || null)
    : (p.salary_expectation || p.fee_range || null)
  const compensationLabel = isSpeaker ? 'Speaking Fee' : 'Salary Range'

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root {
          --ink:#05060B; --panel:#10131F; --panel-raised:#161A2A;
          --gold:#D4A24C; --gold-bright:#F0C878;
          --ivory:#F3EFE6; --slate:#8791A6; --slate-dim:#5C6478;
          --line:rgba(212,162,76,0.16); --line-bright:rgba(212,162,76,0.32);
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--ink); }
        @keyframes pulse-dot {
          0%{box-shadow:0 0 0 0 rgba(111,227,160,.55);}
          70%{box-shadow:0 0 0 7px rgba(111,227,160,0);}
          100%{box-shadow:0 0 0 0 rgba(111,227,160,0);}
        }
        @keyframes rotate-ring { to { transform:rotate(360deg); } }
        .vi-avatar-ring { animation: rotate-ring 8s linear infinite; }
        .vi-status-dot { animation: pulse-dot 2s infinite; }
        .vi-btn { transition: transform .15s ease, box-shadow .15s ease; }
        .vi-btn:hover { transform: translateY(-1px); }
        .vi-btn-primary:hover { box-shadow: 0 6px 24px rgba(212,162,76,.4); }
        .vi-btn-ghost:hover { border-color: var(--gold-bright) !important; color: var(--gold-bright) !important; }
        .vi-nav-link:hover { color: var(--gold-bright); }
        .vi-story:hover .vi-story-thumb { opacity:.8; }
        @media (max-width:760px) {
          .vi-nav-links { display:none !important; }
          .vi-header-block { flex-direction:column !important; align-items:flex-start !important; margin-top:-70px !important; }
          .vi-cta-row { margin-left:0 !important; }
          .vi-avatar-ring { width:120px !important; height:120px !important; }
          .vi-name-id { font-size:22px !important; }
          .vi-intro-card { flex-direction:column !important; align-items:flex-start !important; }
          .vi-stat-strip { flex-wrap:wrap !important; }
          .vi-stat { flex: 1 1 50% !important; border-bottom:1px solid var(--line) !important; }
          .vi-main-grid { grid-template-columns:1fr !important; }
          .vi-video-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--ink)', color:'var(--ivory)', fontFamily:"'Inter',sans-serif", WebkitFontSmoothing:'antialiased' }}>

        {/* NAV */}
        <nav style={{ position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 40px', background:'rgba(5,6,11,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--line)' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'var(--ivory)' }}>
            <div style={{ width:'26px', height:'26px', background:'linear-gradient(135deg,#F0C878,#D4A24C 60%,#8a6420)', clipPath:'polygon(50% 0%,100% 100%,50% 78%,0% 100%)' }} />
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:'17px', letterSpacing:'.02em', fontWeight:600 }}>VALORIA</span>
          </Link>
          <div className="vi-nav-links" style={{ display:'flex', gap:'28px', fontSize:'13px', color:'var(--slate)', letterSpacing:'.04em', textTransform:'uppercase' }}>
            <Link href={isSpeaker ? '/spotlight' : '/atb-connect'} className="vi-nav-link" style={{ color:'var(--slate)', textDecoration:'none', transition:'color .15s' }}>← {isSpeaker ? 'Speakers' : 'Talent'}</Link>
            <Link href={isSpeaker ? '/atb-connect' : '/spotlight'} className="vi-nav-link" style={{ color:'var(--slate)', textDecoration:'none', transition:'color .15s' }}>{isSpeaker ? 'ATB Connect' : 'ATB Spotlight'}</Link>
          </div>
        </nav>

        {/* COVER */}
        <div style={{ position:'relative', height:'300px', overflow:'hidden', background:'radial-gradient(ellipse 700px 400px at 15% 20%,rgba(212,162,76,.35),transparent 60%),radial-gradient(ellipse 600px 500px at 85% 80%,rgba(212,162,76,.18),transparent 55%),linear-gradient(160deg,#0c0f1a 0%,#05060B 70%)' }}>
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.5 }}>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4A24C" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#D4A24C" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <g stroke="#D4A24C" strokeOpacity="0.18" strokeWidth="1">
              <path d="M0,260 C300,180 500,300 800,200 S1100,260 1200,180"/>
              <path d="M0,200 C300,120 500,240 800,140 S1100,200 1200,120"/>
              <path d="M0,140 C300,60 500,180 800,80 S1100,140 1200,60"/>
            </g>
            <polygon points="1080,60 1130,150 1080,120 1030,150" fill="url(#lg)"/>
          </svg>
          {/* Availability status */}
          <div style={{ position:'absolute', top:'20px', right:'28px', display:'flex', alignItems:'center', gap:'7px', background:'rgba(16,19,31,.7)', border:'1px solid var(--line-bright)', padding:'7px 14px 7px 10px', borderRadius:'999px', fontSize:'11.5px', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--gold-bright)', backdropFilter:'blur(8px)' }}>
            <div className="vi-status-dot" style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#6FE3A0' }} />
            {p.availability === 'open' ? 'Open to Introductions' : p.availability === 'contract_only' ? 'Contract Only' : 'Not Available'}
          </div>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 40%,#05060B 100%)' }} />
        </div>

        {/* HEADER BLOCK */}
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 40px' }}>
          <div className="vi-header-block" style={{ display:'flex', alignItems:'flex-end', gap:'26px', marginTop:'-86px', position:'relative', zIndex:5 }}>
            {/* Avatar with rotating ring */}
            <div className="vi-avatar-ring" style={{ width:'156px', height:'156px', borderRadius:'50%', padding:'4px', background:'conic-gradient(from 180deg,#F0C878,#D4A24C,#8a6420,#D4A24C,#F0C878)', flexShrink:0 }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'#05060B', padding:'4px' }}>
                <div style={{ width:'100%', height:'100%', borderRadius:'50%', background: p.photo_url ? undefined : 'linear-gradient(145deg,#2a2f42,#171a26)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontSize:'44px', fontWeight:500, color:'var(--gold-bright)' }}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : avatarLetters}
                </div>
              </div>
            </div>
            {/* ID block — ATB ID is the hero, initials are the identifier */}
            <div style={{ paddingBottom:'14px' }}>
              <div className="vi-name-id" style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600, fontSize:'30px', letterSpacing:'.01em', lineHeight:1.1, marginBottom:'10px', background:'linear-gradient(90deg,#F3EFE6,#F0C878)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>
                {atbId}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <span style={{ color:'var(--gold-bright)', fontSize:'15px', fontWeight:500 }}>{p.headline || (isSpeaker ? 'Valoria Speaker' : 'Valoria Professional')}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', letterSpacing:'.03em', background:'var(--panel-raised)', border:'1px solid var(--line-bright)', padding:'4px 10px', borderRadius:'5px', color:'var(--slate)' }}>
                  {initials} · Verified {isSpeaker ? 'Speaker' : 'Professional'}
                </span>
              </div>
            </div>
            {/* CTAs */}
            <div className="vi-cta-row" style={{ marginLeft:'auto', display:'flex', gap:'10px', paddingBottom:'14px' }}>
              <Link href={isSpeaker ? '/spotlight' : '/atb-connect'} className="vi-btn vi-btn-ghost" style={{ padding:'12px 22px', borderRadius:'8px', fontSize:'13.5px', fontWeight:600, cursor:'pointer', background:'transparent', border:'1px solid var(--line-bright)', color:'var(--ivory)', textDecoration:'none', transition:'border-color .15s,color .15s' }}>
                More {isSpeaker ? 'Speakers' : 'Talent'}
              </Link>
              <a href={`mailto:info@valoriainstitute.com?subject=Introduction Request — ${atbId}`} className="vi-btn vi-btn-primary" style={{ padding:'12px 22px', borderRadius:'8px', fontSize:'13.5px', fontWeight:600, cursor:'pointer', background:'linear-gradient(135deg,#F0C878,#D4A24C)', color:'#1a1204', boxShadow:'0 4px 20px rgba(212,162,76,.25)', textDecoration:'none' }}>
                {isSpeaker ? 'Book Speaker' : 'Request Introduction'}
              </a>
            </div>
          </div>
        </div>

        {/* STAT STRIP */}
        <div className="vi-stat-strip" style={{ maxWidth:'1100px', margin:'34px auto 0', padding:'0 40px', display:'flex', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
          {[
            { label:'Location', value: p.location || '—' },
            { label:'Industry', value: p.industry || '—' },
            { label:'Experience', value: p.years_experience ? `${p.years_experience} yrs` : '—' },
            { label: compensationLabel, value: compensation || '—' },
            { label:'VALU Index', value: p.valu_score != null ? `${p.valu_score} / 100` : 'Not yet assessed' },
          ].map((s, i, arr) => (
            <div key={s.label} className="vi-stat" style={{ flex:1, padding:'16px 12px', borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ fontSize:'10.5px', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--slate-dim)', marginBottom:'6px' }}>{s.label}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'14px', color:'var(--ivory)', fontWeight:500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* STORIES / VIDEO HIGHLIGHTS */}
        {videos.length > 0 && (
          <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'26px 40px 6px' }}>
            <div style={{ fontSize:'11px', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--slate-dim)', marginBottom:'14px' }}>Highlights</div>
            <div style={{ display:'flex', gap:'18px', overflowX:'auto', paddingBottom:'6px' }}>
              {videos.map((url, i) => {
                const ytId = getYouTubeId(url)
                const labels = ['Intro reel', 'Case study', 'Keynote clip', 'Panel talk']
                const isActive = activeVideo === i
                return (
                  <div key={i} className="vi-story" style={{ flexShrink:0, width:'88px', textAlign:'center', cursor:'pointer' }} onClick={() => setActiveVideo(isActive ? null : i)}>
                    <div style={{ width:'76px', height:'76px', borderRadius:'50%', margin:'0 auto 8px', padding:'2.5px', background: isActive ? 'conic-gradient(#F0C878,#D4A24C 40%,#4a3a14 41%,#4a3a14)' : 'var(--slate-dim)' }}>
                      <div className="vi-story-thumb" style={{ width:'100%', height:'100%', borderRadius:'50%', background:'var(--panel-raised)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold-bright)', fontSize:'20px', border:'2px solid #05060B' }}>
                        {ytId
                          ? <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                          : '▶'}
                      </div>
                    </div>
                    <div style={{ fontSize:'11px', color:'var(--slate)' }}>{labels[i] || `Video ${i+1}`}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="vi-main-grid" style={{ maxWidth:'1100px', margin:'30px auto 100px', padding:'0 40px', display:'grid', gridTemplateColumns:'290px 1fr', gap:'28px' }}>

          {/* SIDEBAR */}
          <div>
            {/* VALU Index card */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:'14px', padding:'22px', marginBottom:'20px' }}>
              <div style={{ fontSize:'10.5px', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--gold-bright)', marginBottom:'12px', fontWeight:600 }}>VALU Index</div>
              {p.valu_score != null ? (
                <>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'48px', fontWeight:600, color:'var(--gold-bright)', lineHeight:1, marginBottom:'4px' }}>{p.valu_score}</div>
                  <div style={{ fontSize:'10px', color:'var(--slate-dim)', letterSpacing:'.1em', marginBottom:'16px' }}>OUT OF 100</div>
                  {p.designation && <div style={{ fontSize:'12px', fontWeight:600, color:'var(--gold)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'.08em' }}>{p.designation.replace(/_/g, ' ')}</div>}
                  {p.cluster_scores && (
                    <div style={{ marginTop:'16px' }}>
                      {['P','R','I','M','E'].map(letter => {
                        const score = p.cluster_scores[letter]
                        if (score == null) return null
                        const colors = { P:'#6BA3D6', R:'#E07B54', I:'#6DBF8E', M:'#C4A24C', E:'#A67CC5' }
                        return (
                          <div key={letter} style={{ marginBottom:'8px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                              <span style={{ fontSize:'11px', color: colors[letter] }}>{letter}</span>
                              <span style={{ fontSize:'11px', color: colors[letter], fontWeight:700, fontFamily:'JetBrains Mono' }}>{score}</span>
                            </div>
                            <div style={{ height:'3px', background:'rgba(255,255,255,.06)', borderRadius:'2px' }}>
                              <div style={{ height:'100%', width:`${score}%`, background: colors[letter], borderRadius:'2px' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize:'13.5px', color:'var(--slate)', lineHeight:1.55, marginBottom:'16px' }}>
                    This professional has not yet completed their VALU Index assessment.
                  </div>
                  <a href="https://assessment.valoriainstitute.com/" target="_blank" rel="noopener noreferrer"
                    style={{ display:'block', width:'100%', padding:'12px', background:'transparent', border:'1px solid var(--line-bright)', borderRadius:'8px', color:'var(--ivory)', fontSize:'13px', fontWeight:600, textAlign:'center', textDecoration:'none' }}>
                    About the VALU Index
                  </a>
                </>
              )}
            </div>

            {/* Links card — gated until introduction */}
            {(p.linkedin_url || p.website_url) && (
              <div style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:'14px', padding:'22px', marginBottom:'20px' }}>
                <div style={{ fontSize:'10.5px', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--gold-bright)', marginBottom:'12px', fontWeight:600 }}>Links</div>
                {p.linkedin_url && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 0', fontSize:'13.5px', color:'var(--slate)', borderTop:'1px solid var(--line)' }}>
                    in&nbsp;&nbsp;LinkedIn — available after introduction
                  </div>
                )}
                {p.website_url && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 0', fontSize:'13.5px', color:'var(--slate)', borderTop:'1px solid var(--line)' }}>
                    ↗&nbsp;&nbsp;Website — available after introduction
                  </div>
                )}
              </div>
            )}

            {/* ATB ID verification card */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--line)', borderRadius:'14px', padding:'22px' }}>
              <div style={{ fontSize:'10.5px', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--gold-bright)', marginBottom:'12px', fontWeight:600 }}>Profile ID</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'14px', color:'var(--ivory)', fontWeight:600, letterSpacing:'.04em', marginBottom:'8px' }}>{atbId}</div>
              <div style={{ fontSize:'11.5px', color:'var(--slate-dim)', lineHeight:1.5 }}>This ID verifies that this professional is registered with African Talent Bureau Ltd.</div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div>
            {/* About */}
            {p.bio && (
              <div style={{ marginBottom:'32px' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'22px', fontWeight:600, marginBottom:'14px' }}>About</div>
                <p style={{ fontSize:'15px', lineHeight:1.7, color:'#D9D4C8' }}>{p.bio}</p>
              </div>
            )}

            {/* Skills / Topics */}
            {((isSpeaker ? p.topics : p.skills) || []).length > 0 && (
              <div style={{ marginBottom:'34px' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'22px', fontWeight:600, marginBottom:'14px' }}>
                  {isSpeaker ? 'Speaking Topics' : 'Core Skills'}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                  {(isSpeaker ? p.topics : p.skills).map(s => (
                    <div key={s} style={{ padding:'9px 16px', borderRadius:'999px', fontSize:'13px', fontWeight:500, border:'1px solid var(--line-bright)', color:'var(--ivory)', background:'var(--panel-raised)' }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos — active one expands */}
            {videos.length > 0 && (
              <div style={{ marginBottom:'34px' }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'22px', fontWeight:600, marginBottom:'14px' }}>
                  {isSpeaker ? 'Speaker Reel & Videos' : 'Videos'}
                </div>
                {activeVideo !== null && videos[activeVideo] && (() => {
                  const ytId = getYouTubeId(videos[activeVideo])
                  return ytId ? (
                    <div style={{ position:'relative', paddingBottom:'56.25%', height:0, borderRadius:'10px', overflow:'hidden', background:'#000', marginBottom:'14px' }}>
                      <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} />
                    </div>
                  ) : null
                })()}
                {activeVideo === null && (
                  <div className="vi-video-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                    {videos.slice(0,4).map((url, i) => {
                      const ytId = getYouTubeId(url)
                      return (
                        <div key={i} onClick={() => setActiveVideo(i)}
                          style={{ borderRadius:'10px', overflow:'hidden', border:'1px solid var(--line)', aspectRatio:'16/10', position:'relative', background:'linear-gradient(145deg,#1a1e2e,#0d0f18)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          {ytId && <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.6 }} />}
                          <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'rgba(212,162,76,.9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#1a1204', fontSize:'16px', position:'relative', zIndex:1 }}>▶</div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {activeVideo !== null && (
                  <button onClick={() => setActiveVideo(null)} style={{ fontSize:'12px', color:'var(--slate)', background:'none', border:'none', cursor:'pointer', padding:'8px 0', fontFamily:'Inter,sans-serif' }}>
                    ← Back to highlights
                  </button>
                )}
              </div>
            )}

            {/* Introduction CTA */}
            <div className="vi-intro-card" style={{ background:'linear-gradient(135deg,rgba(212,162,76,.09),rgba(16,19,31,.4))', border:'1px solid var(--line-bright)', borderRadius:'14px', padding:'26px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'20px' }}>
              <div>
                <div style={{ fontSize:'10.5px', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--gold-bright)', marginBottom:'6px', fontWeight:600 }}>
                  {isSpeaker ? 'Book This Speaker' : 'Get in Touch'}
                </div>
                <p style={{ fontSize:'13.5px', color:'var(--slate)', maxWidth:'380px', lineHeight:1.6 }}>
                  {isSpeaker
                    ? `Interested in booking ${initials} for your event? Valoria Institute will facilitate the introduction directly.`
                    : `Want to connect with ${initials}? Send an introduction through Valoria Institute and we'll facilitate the connection.`}
                </p>
              </div>
              <a href={`mailto:info@valoriainstitute.com?subject=${encodeURIComponent((isSpeaker ? 'Speaker Booking' : 'Introduction Request') + ' — ' + atbId)}`}
                className="vi-btn vi-btn-primary"
                style={{ padding:'14px 26px', borderRadius:'8px', fontSize:'13.5px', fontWeight:600, background:'linear-gradient(135deg,#F0C878,#D4A24C)', color:'#1a1204', boxShadow:'0 4px 20px rgba(212,162,76,.25)', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
                {isSpeaker ? 'Book Speaker' : 'Send Introduction'}
              </a>
            </div>

            {p.is_dummy && (
              <div style={{ textAlign:'center', fontSize:'11.5px', color:'var(--slate-dim)', marginTop:'26px', letterSpacing:'.02em' }}>
                Sample profile — real professionals launching soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
