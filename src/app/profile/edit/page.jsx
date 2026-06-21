'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DIM = 'rgba(247,244,238,.45)'
const FAINT = 'rgba(247,244,238,.2)'

const PRIME_CLUSTERS = [
  { id: 'P', name: 'Presence',      color: '#1D9E75' },
  { id: 'R', name: 'Relationships', color: '#378ADD' },
  { id: 'I', name: 'Intelligence',  color: '#7F77DD' },
  { id: 'M', name: 'Mastery',       color: '#BA7517' },
  { id: 'E', name: 'Enterprise',    color: '#D85A30' },
]

const INDUSTRIES = ['Finance','Technology','Healthcare','Energy','Media & Communications','Education','Legal','Consulting','NGO / Development','Government','Real Estate','Logistics','Other']
const SKILLS = ['Strategic Thinking','Executive Communication','Financial Analysis','Business Development','Team Leadership','Project Management','Data Analysis','Digital Marketing','Product Management','Risk Management','Stakeholder Management','Change Management','Public Speaking','Research & Insights','Operations']
const TOPIC_OPTIONS = ['Leadership','Strategy','Innovation','Diversity & Inclusion','Finance','Technology & AI','Communication','Entrepreneurship','Governance','People Development','Mental Health at Work','Global Affairs','Sustainability','Future of Work']
const AVAILABILITY = ['Open to full-time roles','Open to contract work','Open to advisory roles','Available for speaking','Available for facilitation','Not currently available']
const MODALITY = ['In-person','Virtual','Hybrid']

export default function ProfileEditPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const photoRef = useRef()
  const coverRef = useRef()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data || {
        id: user.id, user_type: 'talent',
        skills: [], topics: [], youtube_links: ['', '', '', ''],
        availability: [], modality: [], languages: [],
      })
      setLoading(false)
    }
    load()
  }, [])

  function update(key, val) { setProfile(p => ({ ...p, [key]: val })) }
  function toggleArray(key, val) {
    setProfile(p => {
      const arr = p[key] || []
      return { ...p, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }
  function updateYoutube(i, val) {
    const links = [...(profile.youtube_links || ['','','',''])]
    links[i] = val
    update('youtube_links', links)
  }

  async function uploadImage(file, bucket, onDone, setUploading) {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${bucket}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path)
      onDone(publicUrl)
    } catch (err) {
      setError('Image upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    if (isSupply && profile.is_visible && !hasVALU) {
      setError('You need a VALU Index score before your profile can be listed. Take the assessment, or turn off "Listed" for now.')
      return
    }
    setSaving(true); setError('')
    try {
      const { error } = await supabase.from('profiles').upsert({ ...profile, id: user.id })
      if (error) throw error
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:DARK, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Raleway', color:GOLD, fontSize:'14px' }}>
      Loading your profile…
    </div>
  )

  const isSupply = profile.user_type === 'talent' || profile.user_type === 'speaker'
  const isSpeaker = profile.user_type === 'speaker'
  const isEmployer = profile.user_type === 'employer'
  const hasVALU = profile.valu_score != null

  return (
    <div style={{ minHeight:'100vh', background:DARK, fontFamily:"'Raleway','Helvetica Neue',Arial,sans-serif", color:PARCHMENT }}>

      {/* HEADER */}
      <header style={S.header}>
        <Link href="/" style={{ lineHeight:0 }}><img src="/logo.png" alt="Valoria Institute" style={{ height:'44px', width:'auto' }} /></Link>
        <nav style={{ display:'flex', gap:'16px', alignItems:'center' }}>
          <Link href="/dashboard" style={S.navLink}>Dashboard</Link>
          <Link href={`/profile/${user?.id}`} target="_blank" style={S.navLink}>View Public Profile</Link>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/')} style={S.signOutBtn}>Sign Out</button>
        </nav>
      </header>

      <div style={S.page}>
        <div style={S.twoCol}>

          {/* LEFT — photo, VALU score, listing toggle */}
          <aside style={S.sidebar}>

            {/* Profile photo */}
            <div style={{ marginBottom:'24px' }}>
              <div style={S.sectionLabel}>Profile Photo</div>
              <div style={S.photoWrap} onClick={() => photoRef.current?.click()}>
                {profile.photo_url
                  ? <img src={profile.photo_url} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                  : <span style={{ fontSize:'28px', color:GOLD }}>◈</span>}
                <div style={S.photoOverlay}>{uploadingPhoto ? '…' : '+'}</div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'photo', url => update('photo_url', url), setUploadingPhoto)} />
              <p style={S.hint}>Square image, min 400×400px recommended.</p>
            </div>

            {/* Cover image */}
            <div style={{ marginBottom:'24px' }}>
              <div style={S.sectionLabel}>Cover Image</div>
              <div style={{ ...S.coverWrap, cursor:'pointer' }} onClick={() => coverRef.current?.click()}>
                {profile.cover_url
                  ? <img src={profile.cover_url} alt="Cover" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px' }} />
                  : <span style={{ fontSize:'13px', color:FAINT }}>Click to upload</span>}
              </div>
              <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'cover', url => update('cover_url', url), setUploadingCover)} />
            </div>

            {/* VALU Index score — read only, populated from assessment */}
            {hasVALU && (
              <div style={S.valuCard}>
                <div style={S.sectionLabel}>VALU Index</div>
                <div style={{ fontSize:'36px', fontWeight:700, color:GOLD, lineHeight:1 }}>{profile.valu_score}</div>
                <div style={{ fontSize:'10px', letterSpacing:'.12em', color:DIM, marginTop:'4px' }}>OUT OF 100</div>
                {profile.valu_tier && (
                  <div style={{ fontSize:'11px', fontWeight:700, color:GOLD, marginTop:'8px', letterSpacing:'.1em', textTransform:'uppercase' }}>{profile.valu_tier}</div>
                )}
                {profile.assessment_completed_at && (
                  <div style={{ fontSize:'10px', color:FAINT, marginTop:'6px' }}>
                    Assessed {new Date(profile.assessment_completed_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                )}
                {profile.cluster_scores && (
                  <div style={{ marginTop:'16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {PRIME_CLUSTERS.map(c => (
                      <div key={c.id}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                          <span style={{ fontSize:'11px', color:c.color }}>{c.name}</span>
                          <span style={{ fontSize:'11px', color:c.color, fontWeight:600 }}>{profile.cluster_scores[c.id] ?? '—'}</span>
                        </div>
                        <div style={{ height:'2px', background:'rgba(255,255,255,.06)', borderRadius:'1px' }}>
                          <div style={{ height:'100%', width:`${profile.cluster_scores[c.id] ?? 0}%`, background:c.color, borderRadius:'1px', transition:'width .4s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <a href="https://assessment.valoriainstitute.com/" target="_blank" rel="noopener noreferrer"
                  style={{ display:'block', marginTop:'16px', fontSize:'10px', color:DIM, textAlign:'center', textDecoration:'none' }}>
                  Reassess after 90 days →
                </a>
              </div>
            )}

            {!hasVALU && isSupply && (
              <div style={S.valuCard}>
                <div style={S.sectionLabel}>VALU Index</div>
                <p style={{ fontSize:'13px', color:DIM, lineHeight:1.6, marginBottom:'16px' }}>Take the VALU Index to get your score and unlock marketplace listing.</p>
                <a href="https://assessment.valoriainstitute.com/" target="_blank" rel="noopener noreferrer"
                  style={{ display:'block', textAlign:'center', padding:'10px', background:GOLD, color:'#0F0F1A', fontSize:'11px', fontWeight:700, letterSpacing:'.12em', borderRadius:'999px', textDecoration:'none' }}>
                  TAKE THE VALU INDEX — FREE
                </a>
              </div>
            )}

            {/* Listing visibility toggle — only supply side */}
            {isSupply && (
              <div style={S.valuCard}>
                <div style={S.sectionLabel}>Marketplace Listing</div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                  <div
                    onClick={() => update('is_visible', !profile.is_visible)}
                    style={{
                      width:'40px', height:'22px', borderRadius:'999px', cursor:'pointer',
                      background: profile.is_visible ? '#1D9E75' : 'rgba(255,255,255,.1)',
                      transition:'background .2s', position:'relative', flexShrink:0,
                    }}
                  >
                    <div style={{
                      position:'absolute', top:'3px',
                      left: profile.is_visible ? '21px' : '3px',
                      width:'16px', height:'16px', borderRadius:'50%',
                      background:'white', transition:'left .2s',
                    }} />
                  </div>
                  <span style={{ fontSize:'13px', color: profile.is_visible ? '#1D9E75' : FAINT, fontWeight:600 }}>
                    {profile.is_visible ? 'Listed — visible to buyers' : 'Not listed'}
                  </span>
                </div>
                {!hasVALU && profile.is_visible && (
                  <p style={{ fontSize:'11px', color:'#D85A30', lineHeight:1.5 }}>A VALU Index score is required to appear in search results.</p>
                )}
              </div>
            )}
          </aside>

          {/* RIGHT — main profile fields */}
          <main style={S.main}>

            {/* BASICS */}
            <Section label="Basic Information">
              <Field label="Display Name *">
                <input style={S.input} value={profile.display_name || ''} onChange={e => update('display_name', e.target.value)} placeholder="Your full name as it appears on your profile" />
              </Field>
              <Field label={isSpeaker ? 'Speaker Title / Role' : isEmployer ? 'Job Title' : 'Professional Title / Current Role'}>
                <input style={S.input} value={profile.headline || ''} onChange={e => update('headline', e.target.value)} placeholder={isSpeaker ? 'e.g. Leadership Speaker & Executive Coach' : 'e.g. Head of Finance, Zenith Bank'} />
              </Field>
              <Field label="Location">
                <input style={S.input} value={profile.location || ''} onChange={e => update('location', e.target.value)} placeholder="City, Country" />
              </Field>
              <Field label="Industry / Sector">
                <select style={S.input} value={profile.industry || ''} onChange={e => update('industry', e.target.value)}>
                  <option value="">Select sector…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Years of Professional Experience">
                <input style={S.input} type="number" min="0" max="50" value={profile.experience_years || ''} onChange={e => update('experience_years', parseInt(e.target.value) || null)} placeholder="e.g. 12" />
              </Field>
            </Section>

            {/* BIO */}
            <Section label="Professional Bio">
              <Field label="Bio" hint="Write in third person. This appears on your public profile. 80–200 words works best.">
                <textarea style={{ ...S.input, resize:'vertical', minHeight:'120px' }} value={profile.bio || ''} onChange={e => update('bio', e.target.value)}
                  placeholder="A senior finance professional with 12 years across Lagos and Nairobi…" />
              </Field>
              {isEmployer && (
                <Field label="Company / Organisation Name">
                  <input style={S.input} value={profile.company_name || ''} onChange={e => update('company_name', e.target.value)} placeholder="e.g. Zenith Capital Ltd" />
                </Field>
              )}
            </Section>

            {/* SUPPLY-SIDE — skills, topics, availability */}
            {isSupply && (
              <>
                <Section label="Core Skills">
                  <p style={S.hint}>Select up to 8 skills that best represent your professional capability.</p>
                  <div style={S.chipGrid}>
                    {SKILLS.map(s => (
                      <ChipBtn key={s} active={(profile.skills || []).includes(s)} onClick={() => toggleArray('skills', s)}>{s}</ChipBtn>
                    ))}
                  </div>
                </Section>

                {isSpeaker && (
                  <Section label="Speaking Topics">
                    <p style={S.hint}>Select the topics you speak on — these appear in Spotlight search filters.</p>
                    <div style={S.chipGrid}>
                      {TOPIC_OPTIONS.map(t => (
                        <ChipBtn key={t} active={(profile.topics || []).includes(t)} onClick={() => toggleArray('topics', t)}>{t}</ChipBtn>
                      ))}
                    </div>
                  </Section>
                )}

                <Section label="Availability">
                  <p style={S.hint}>What opportunities are you open to right now?</p>
                  <div style={S.chipGrid}>
                    {AVAILABILITY.map(a => (
                      <ChipBtn key={a} active={(profile.availability || []).includes(a)} onClick={() => toggleArray('availability', a)}>{a}</ChipBtn>
                    ))}
                  </div>
                </Section>

                <Section label="Preferred Work Modality">
                  <div style={S.chipGrid}>
                    {MODALITY.map(m => (
                      <ChipBtn key={m} active={(profile.modality || []).includes(m)} onClick={() => toggleArray('modality', m)}>{m}</ChipBtn>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* SPEAKER-SPECIFIC */}
            {isSpeaker && (
              <Section label="Speaker Details">
                <Field label="Fee Range (USD)">
                  <select style={S.input} value={profile.fee_range || ''} onChange={e => update('fee_range', e.target.value)}>
                    <option value="">Select range…</option>
                    {['Under $500','$500–$1,500','$1,500–$5,000','$5,000–$15,000','$15,000+','Negotiable','Pro bono available'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Speaker Reel / Intro Video (YouTube URL)">
                  <input style={S.input} type="url" value={(profile.youtube_links || [])[0] || ''} onChange={e => updateYoutube(0, e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </Field>
                <Field label="Additional Video Links (optional)">
                  {[1, 2, 3].map(i => (
                    <input key={i} style={{ ...S.input, marginTop:'8px' }} type="url" value={(profile.youtube_links || [])[i] || ''} onChange={e => updateYoutube(i, e.target.value)} placeholder={`https://youtube.com/watch?v=...`} />
                  ))}
                </Field>
              </Section>
            )}

            {/* LINKS */}
            <Section label="Links & Social">
              <Field label="LinkedIn Profile URL">
                <input style={S.input} type="url" value={profile.linkedin_url || ''} onChange={e => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </Field>
              <Field label="Personal Website / Portfolio">
                <input style={S.input} type="url" value={profile.website_url || ''} onChange={e => update('website_url', e.target.value)} placeholder="https://yourwebsite.com" />
              </Field>
              <Field label="Twitter / X">
                <input style={S.input} type="url" value={profile.twitter_url || ''} onChange={e => update('twitter_url', e.target.value)} placeholder="https://twitter.com/yourhandle" />
              </Field>
            </Section>

            {/* EMPLOYER-SPECIFIC */}
            {isEmployer && (
              <Section label="Hiring Details">
                <Field label="Typical roles you hire for">
                  <textarea style={{ ...S.input, resize:'vertical', minHeight:'80px' }} value={profile.hiring_focus || ''} onChange={e => update('hiring_focus', e.target.value)} placeholder="e.g. Senior Finance Managers, Strategy Leads, Operations Directors" />
                </Field>
                <Field label="Company size">
                  <select style={S.input} value={profile.company_size || ''} onChange={e => update('company_size', e.target.value)}>
                    <option value="">Select…</option>
                    {['1–10','11–50','51–200','201–500','500+'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </Section>
            )}

            {/* ERROR + SAVE */}
            {error && (
              <div style={{ padding:'12px 16px', background:'rgba(216,90,48,.1)', border:'1px solid rgba(216,90,48,.3)', borderRadius:'8px', fontSize:'13px', color:'#F09595', marginBottom:'16px' }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
              <button onClick={save} disabled={saving}
                style={{ padding:'14px 32px', background:GOLD, color:'#0F0F1A', border:'none', borderRadius:'999px', fontSize:'12px', fontWeight:700, letterSpacing:'.14em', cursor:saving ? 'default' : 'pointer', opacity:saving ? 0.7 : 1, fontFamily:'Raleway' }}>
                {saving ? 'SAVING…' : 'SAVE PROFILE'}
              </button>
              {saved && <span style={{ fontSize:'12px', color:'#1D9E75', fontWeight:600 }}>✓ Saved</span>}
            </div>

            <div style={{ display:'flex', gap:'16px', marginTop:'20px', flexWrap:'wrap' }}>
              <Link href="/dashboard" style={{ fontSize:'12px', color:DIM }}>← Back to dashboard</Link>
              <Link href={`/profile/${user?.id}`} target="_blank" style={{ fontSize:'12px', color:GOLD }}>View public profile →</Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom:'32px', paddingBottom:'32px', borderBottom:'1px solid rgba(201,168,76,.08)' }}>
      <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.16em', color:'rgba(201,168,76,.5)', marginBottom:'20px', textTransform:'uppercase' }}>{label}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:'11px', fontWeight:700, letterSpacing:'.08em', color:DIM, marginBottom:'6px', textTransform:'uppercase' }}>{label}</label>
      {hint && <p style={{ fontSize:'12px', color:FAINT, marginBottom:'8px', lineHeight:1.5 }}>{hint}</p>}
      {children}
    </div>
  )
}

function ChipBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} type="button"
      style={{ padding:'7px 14px', borderRadius:'999px', border:`1px solid ${active ? GOLD : 'rgba(201,168,76,.2)'}`, background:active ? 'rgba(201,168,76,.1)' : 'transparent', color:active ? GOLD : DIM, fontSize:'12px', cursor:'pointer', fontFamily:'Raleway', transition:'all .15s' }}>
      {children}
    </button>
  )
}

const S = {
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:'64px', background:MIDNIGHT, borderBottom:'1px solid rgba(201,168,76,.12)', position:'sticky', top:0, zIndex:100 },
  navLink: { fontSize:'12px', color:DIM, textDecoration:'none' },
  signOutBtn: { fontSize:'11px', fontWeight:700, letterSpacing:'.1em', color:'rgba(201,168,76,.6)', background:'transparent', border:'1px solid rgba(201,168,76,.2)', borderRadius:'999px', padding:'7px 16px', cursor:'pointer', fontFamily:'Raleway' },
  page: { maxWidth:'1100px', margin:'0 auto', padding:'48px 24px 80px' },
  twoCol: { display:'grid', gridTemplateColumns:'280px 1fr', gap:'48px', alignItems:'start' },
  sidebar: { position:'sticky', top:'88px', display:'flex', flexDirection:'column', gap:'0' },
  main: { minWidth:0 },
  sectionLabel: { fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:'rgba(201,168,76,.5)', marginBottom:'12px', textTransform:'uppercase' },
  photoWrap: { width:'100px', height:'100px', borderRadius:'50%', border:'2px solid rgba(201,168,76,.3)', background:MIDNIGHT, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer', position:'relative', marginBottom:'8px' },
  photoOverlay: { position:'absolute', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color:'white', opacity:0, transition:'opacity .2s', borderRadius:'50%' },
  coverWrap: { width:'100%', height:'80px', borderRadius:'8px', border:'1px dashed rgba(201,168,76,.2)', background:'rgba(255,255,255,.02)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', marginBottom:'8px' },
  valuCard: { background:'rgba(26,26,46,.5)', border:'1px solid rgba(201,168,76,.12)', borderRadius:'10px', padding:'20px', marginBottom:'16px' },
  input: { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(201,168,76,.18)', borderRadius:'6px', color:PARCHMENT, fontSize:'13px', fontFamily:"'Raleway',sans-serif", outline:'none', boxSizing:'border-box' },
  chipGrid: { display:'flex', flexWrap:'wrap', gap:'8px' },
  hint: { fontSize:'12px', color:FAINT, lineHeight:1.5, marginBottom:'4px' },
}
