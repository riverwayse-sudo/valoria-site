'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ─── brand ──────────────────────────────────────────────────────────────────
const GOLD  = '#C9A84C'
const DARK  = '#0F0F1A'
const MID   = '#1A1A2E'
const PARCH = '#F7F4EE'
const DIM   = 'rgba(247,244,238,.5)'
const GLINE = 'rgba(201,168,76,.14)'
const PRIME = [
  { letter:'P', color:'#1D9E75', label:'Presence' },
  { letter:'R', color:'#378ADD', label:'Resolve' },
  { letter:'I', color:'#7F77DD', label:'Initiative' },
  { letter:'M', color:'#BA7517', label:'Mastery' },
  { letter:'E', color:'#D85A30', label:'Expression' },
]
const INDUSTRIES = [
  'Agriculture & Agritech','Architecture & Design','Consulting & Strategy',
  'Education & EdTech','Energy & Sustainability','Entertainment & Media',
  'Fashion & Beauty','Fintech & Banking','Government & Public Policy',
  'Healthcare','Hospitality & Travel','Law','Logistics & Supply Chain',
  'Manufacturing','Marketing & Advertising','Nonprofit & Development',
  'Real Estate','Sports & Wellness','Technology & SaaS','Telecommunications',
]
const SKILLS_POOL = [
  'Strategy','Leadership','Public Speaking','Negotiation','Branding',
  'Operations','Data Analysis','Fundraising','Policy Design','Product Management',
  'Stakeholder Management','Storytelling','Market Research','Change Management',
  'Innovation','Project Management','Financial Modelling','People Management',
  'Business Development','Digital Marketing',
]
const TOPICS_POOL = [
  'Leadership & Management','Strategy & Innovation','Diversity & Inclusion',
  'Finance & Investment','Technology & AI','Entrepreneurship','Sustainability',
  'Future of Work','Communication','Governance','Mental Health at Work',
  'Global Affairs','People Development','Brand & Marketing','Education Reform',
]
const MODALITY = ['In-person','Virtual','Hybrid','Open to relocation']
const AVAILABILITY = [
  { value:'open',          label:'Open to opportunities' },
  { value:'contract_only', label:'Contract / project only' },
  { value:'not_available', label:'Not currently available' },
]
const STEPS = ['Track','Profile','Skills','Media','Compensation','Review']

// ─── helpers ────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?'
  const w = name.trim().split(/\s+/)
  if (w.length === 1) return w[0].slice(0,2).toUpperCase()
  return (w[0][0] + w[w.length-1][0]).toUpperCase()
}

// ─── component ──────────────────────────────────────────────────────────────
export default function ProfileSetupPage() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [step, setStep]       = useState(0)
  const [saving, setSaving]   = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    // Step 0 — Track
    active_tracks: [],
    // Step 1 — Profile
    display_name: '',
    headline: '',
    location: '',
    industry: '',
    years_experience: '',
    bio: '',
    // Step 2 — Skills/Topics
    skills: [],
    topics: [],
    // Step 3 — Media
    photo_url: '',
    youtube_links: [''],
    linkedin_url: '',
    website_url: '',
    // Step 4 — Compensation
    availability: 'open',
    modality: [],
    salary_expectation: '',
    fee_range: '',
    // Review
    consent: false,
  })

  const isSpeaker     = form.active_tracks.includes('speaker')
  const isCandidate   = form.active_tracks.includes('candidate')
  const isFacilitator = form.active_tracks.includes('facilitator')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      // Pre-fill name from auth metadata
      if (user.user_metadata?.full_name) {
        setForm(f => ({ ...f, display_name: user.user_metadata.full_name }))
      }
    })
  }, [])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function toggleArray(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  async function uploadPhoto(file) {
    if (!file || !user) return
    setPhotoUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `profiles/${user.id}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      set('photo_url', data.publicUrl)
    }
    setPhotoUploading(false)
  }

  async function saveProgress() {
    if (!user) return
    const payload = {
      id:                 user.id,
      display_name:       form.display_name || null,
      headline:           form.headline || null,
      location:           form.location || null,
      industry:           form.industry || null,
      years_experience:   form.years_experience ? parseInt(form.years_experience) : null,
      bio:                form.bio || null,
      active_tracks:      form.active_tracks,
      skills:             form.skills,
      topics:             form.topics,
      photo_url:          form.photo_url || null,
      youtube_links:      form.youtube_links.filter(Boolean),
      linkedin_url:       form.linkedin_url || null,
      website_url:        form.website_url || null,
      availability:       form.availability || null,
      modality:           form.modality,
      salary_expectation: form.salary_expectation || null,
      fee_range:          form.fee_range || null,
      listing_status:     'pending',
      updated_at:         new Date().toISOString(),
    }
    await supabase
      .from('professional_profiles')
      .upsert(payload, { onConflict: 'id' })
  }

  async function handleNext() {
    setSaving(true)
    await saveProgress()
    setSaving(false)
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  async function handleFinish() {
    setSaving(true)
    await saveProgress()
    setSaving(false)
    router.push('/dashboard')
  }

  if (!user) return (
    <div style={{ minHeight:'100vh', background:DARK, display:'flex', alignItems:'center', justifyContent:'center', color:DIM, fontFamily:'var(--font,Raleway,sans-serif)', fontSize:'13px' }}>
      Loading…
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:DARK, color:PARCH, fontFamily:'var(--font,Raleway,sans-serif)' }}>

      {/* PRIME stripe */}
      <div style={{ height:'3px', display:'flex', position:'sticky', top:0, zIndex:200 }}>
        {PRIME.map((c,i) => <div key={i} style={{ flex:1, background:c.color, opacity:.85 }} />)}
      </div>

      {/* NAV */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 clamp(20px,4vw,40px)', height:'60px', background:MID, borderBottom:`1px solid ${GLINE}` }}>
        <Link href="/" style={{ lineHeight:0 }}>
          <img src="/logo.png" alt="Valoria" style={{ height:'36px', width:'auto' }} />
        </Link>
        <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.14em', color:'rgba(201,168,76,.5)' }}>
          PROFILE SETUP
        </div>
        <button onClick={() => router.push('/dashboard')}
          style={{ fontSize:'11px', color:DIM, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', letterSpacing:'.06em' }}>
          SAVE & EXIT
        </button>
      </header>

      {/* PROGRESS BAR */}
      <div style={{ background:MID, borderBottom:`1px solid ${GLINE}`, padding:'0 clamp(20px,4vw,40px)' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', alignItems:'center', gap:0, padding:'16px 0' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                <div style={{
                  width:'28px', height:'28px', borderRadius:'50%',
                  background: i < step ? GOLD : i === step ? 'transparent' : 'transparent',
                  border: i < step ? 'none' : i === step ? `2px solid ${GOLD}` : '1px solid rgba(247,244,238,.15)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'10px', fontWeight:700,
                  color: i < step ? DARK : i === step ? GOLD : 'rgba(247,244,238,.3)',
                  flexShrink:0,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.1em', color: i <= step ? GOLD : 'rgba(247,244,238,.25)', whiteSpace:'nowrap' }}>
                  {label.toUpperCase()}
                </span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ flex:1, height:'1px', background: i < step ? GOLD : GLINE, margin:'0 4px', marginBottom:'14px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'clamp(32px,5vw,56px) clamp(20px,4vw,40px) 80px' }}>

        {/* ── STEP 0: TRACK ── */}
        {step === 0 && (
          <div>
            <Eyebrow>STEP 1 OF 6</Eyebrow>
            <h1 style={S.title}>How are you joining<br/><em style={{ fontStyle:'italic', color:GOLD }}>Valoria?</em></h1>
            <p style={S.sub}>Select all that apply. You can hold multiple tracks simultaneously.</p>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'32px' }}>
              {[
                { id:'candidate',   label:'Candidate / Talent',   desc:'I want to be discovered by employers and recruiters through ATB Connect.', color:'#378ADD' },
                { id:'speaker',     label:'Speaker',              desc:'I want to be booked for events and conferences through ATB Spotlight.',     color:GOLD },
                { id:'facilitator', label:'Facilitator',          desc:'I want to be commissioned for training and L&D programmes via ATB Develop.', color:'#1D9E75' },
              ].map(t => {
                const active = form.active_tracks.includes(t.id)
                return (
                  <div key={t.id} onClick={() => toggleArray('active_tracks', t.id)}
                    style={{ padding:'20px', border:`1.5px solid ${active ? t.color : GLINE}`, cursor:'pointer', background: active ? `rgba(${t.color === GOLD ? '201,168,76' : t.color === '#378ADD' ? '55,138,221' : '29,158,117'},.06)` : 'rgba(26,26,46,.4)', transition:'border-color .15s, background .15s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'6px' }}>
                      <div style={{ width:'18px', height:'18px', border:`2px solid ${active ? t.color : 'rgba(247,244,238,.25)'}`, borderRadius:'4px', background: active ? t.color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {active && <span style={{ color: t.id === 'speaker' ? DARK : '#fff', fontSize:'11px', fontWeight:700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:'15px', fontWeight:600, color: active ? t.color : PARCH }}>{t.label}</span>
                    </div>
                    <p style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.65, margin:0, paddingLeft:'30px' }}>{t.desc}</p>
                  </div>
                )
              })}
            </div>

            <NavButtons
              onNext={handleNext}
              nextDisabled={form.active_tracks.length === 0}
              saving={saving}
              showBack={false}
            />
          </div>
        )}

        {/* ── STEP 1: PROFILE ── */}
        {step === 1 && (
          <div>
            <Eyebrow>STEP 2 OF 6</Eyebrow>
            <h1 style={S.title}>Your professional<br/><em style={{ fontStyle:'italic', color:GOLD }}>identity.</em></h1>
            <p style={S.sub}>This appears on your public profile. Keep your name as your professional name — it will be hidden from buyers until Valoria facilitates an introduction.</p>

            <div style={S.fieldStack}>
              <Field label="Full Name *">
                <input style={S.input} value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Your full professional name" />
              </Field>
              <Field label="Professional Headline *">
                <input style={S.input} value={form.headline} onChange={e => set('headline', e.target.value)} placeholder={isSpeaker ? 'e.g. Executive Coach & Leadership Speaker' : 'e.g. Head of Strategy — FMCG & Retail'} maxLength={100} />
                <CharCount val={form.headline} max={100} />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <Field label="Location">
                  <input style={S.input} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Lagos, Nigeria" />
                </Field>
                <Field label="Years of Experience">
                  <input style={S.input} type="number" min="0" max="50" value={form.years_experience} onChange={e => set('years_experience', e.target.value)} placeholder="e.g. 10" />
                </Field>
              </div>
              <Field label="Industry">
                <select style={S.input} value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select your primary industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Professional Bio *">
                <textarea style={{ ...S.input, minHeight:'120px', resize:'vertical', lineHeight:'1.7' }}
                  value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="Write in third person. What you do, who you serve, what makes you distinct. 2–4 sentences works best."
                  maxLength={600} />
                <CharCount val={form.bio} max={600} />
              </Field>
            </div>

            <NavButtons
              onBack={() => setStep(s => s-1)}
              onNext={handleNext}
              nextDisabled={!form.display_name.trim() || !form.headline.trim() || !form.bio.trim()}
              saving={saving}
            />
          </div>
        )}

        {/* ── STEP 2: SKILLS / TOPICS ── */}
        {step === 2 && (
          <div>
            <Eyebrow>STEP 3 OF 6</Eyebrow>
            <h1 style={S.title}>What you<br/><em style={{ fontStyle:'italic', color:GOLD }}>bring.</em></h1>
            <p style={S.sub}>Select the tags that best represent your strengths. These appear on your profile card and are used for marketplace search filtering.</p>

            {(isCandidate || isFacilitator) && (
              <div style={{ marginBottom:'32px' }}>
                <div style={S.tagLabel}>CORE SKILLS <span style={{ color:'rgba(201,168,76,.4)', fontWeight:400 }}>— select up to 8</span></div>
                <div style={S.tagGrid}>
                  {SKILLS_POOL.map(s => {
                    const on = form.skills.includes(s)
                    return (
                      <div key={s} onClick={() => { if (!on && form.skills.length >= 8) return; toggleArray('skills', s) }}
                        style={{ ...S.tag, borderColor: on ? GOLD : GLINE, color: on ? GOLD : DIM, background: on ? 'rgba(201,168,76,.08)' : 'transparent', cursor: !on && form.skills.length >= 8 ? 'not-allowed' : 'pointer', opacity: !on && form.skills.length >= 8 ? 0.4 : 1 }}>
                        {s}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {(isSpeaker || isFacilitator) && (
              <div>
                <div style={S.tagLabel}>SPEAKING TOPICS <span style={{ color:'rgba(201,168,76,.4)', fontWeight:400 }}>— select up to 6</span></div>
                <div style={S.tagGrid}>
                  {TOPICS_POOL.map(t => {
                    const on = form.topics.includes(t)
                    return (
                      <div key={t} onClick={() => { if (!on && form.topics.length >= 6) return; toggleArray('topics', t) }}
                        style={{ ...S.tag, borderColor: on ? GOLD : GLINE, color: on ? GOLD : DIM, background: on ? 'rgba(201,168,76,.08)' : 'transparent', cursor: !on && form.topics.length >= 6 ? 'not-allowed' : 'pointer', opacity: !on && form.topics.length >= 6 ? 0.4 : 1 }}>
                        {t}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <NavButtons
              onBack={() => setStep(s => s-1)}
              onNext={handleNext}
              saving={saving}
            />
          </div>
        )}

        {/* ── STEP 3: MEDIA ── */}
        {step === 3 && (
          <div>
            <Eyebrow>STEP 4 OF 6</Eyebrow>
            <h1 style={S.title}>Your presence<br/><em style={{ fontStyle:'italic', color:GOLD }}>on record.</em></h1>
            <p style={S.sub}>A professional photo and at least one video link increases your introduction requests significantly.</p>

            {/* Photo upload */}
            <div style={{ marginBottom:'32px' }}>
              <div style={S.tagLabel}>PROFILE PHOTO</div>
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <div style={{ width:'80px', height:'80px', borderRadius:'50%', border:`2px solid ${GOLD}`, background:MID, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'22px', fontWeight:700, color:GOLD }}>
                  {form.photo_url
                    ? <img src={form.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : getInitials(form.display_name)}
                </div>
                <div>
                  <button onClick={() => fileRef.current?.click()}
                    disabled={photoUploading}
                    style={{ ...S.btnGhost, marginBottom:'6px' }}>
                    {photoUploading ? 'Uploading…' : form.photo_url ? 'Change photo' : 'Upload photo'}
                  </button>
                  <p style={{ fontSize:'11px', color:DIM, margin:0, lineHeight:1.6 }}>JPG or PNG. Square crop recommended. At least 400×400px.</p>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                    style={{ display:'none' }}
                    onChange={e => e.target.files[0] && uploadPhoto(e.target.files[0])} />
                </div>
              </div>
            </div>

            {/* Video links */}
            <div style={{ marginBottom:'32px' }}>
              <div style={S.tagLabel}>{isSpeaker ? 'SPEAKER REEL & VIDEO LINKS' : 'VIDEO LINKS'} <span style={{ color:'rgba(201,168,76,.4)', fontWeight:400 }}>— YouTube URLs</span></div>
              {form.youtube_links.map((url, i) => (
                <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
                  <input style={{ ...S.input, flex:1 }} value={url}
                    placeholder={i === 0 ? (isSpeaker ? 'https://youtube.com/watch?v=... (intro reel)' : 'https://youtube.com/watch?v=...') : 'Additional video URL'}
                    onChange={e => {
                      const links = [...form.youtube_links]
                      links[i] = e.target.value
                      set('youtube_links', links)
                    }} />
                  {form.youtube_links.length > 1 && (
                    <button onClick={() => set('youtube_links', form.youtube_links.filter((_,j) => j !== i))}
                      style={{ ...S.btnGhost, padding:'0 12px', color:'#D85A30', borderColor:'rgba(216,90,48,.3)' }}>✕</button>
                  )}
                </div>
              ))}
              {form.youtube_links.length < 4 && (
                <button onClick={() => set('youtube_links', [...form.youtube_links, ''])}
                  style={S.btnGhost}>+ Add another video</button>
              )}
            </div>

            {/* Links */}
            <div style={S.fieldStack}>
              <Field label="LinkedIn URL">
                <input style={S.input} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </Field>
              <Field label="Website / Portfolio URL">
                <input style={S.input} value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://yourwebsite.com" />
              </Field>
            </div>

            <NavButtons
              onBack={() => setStep(s => s-1)}
              onNext={handleNext}
              saving={saving}
            />
          </div>
        )}

        {/* ── STEP 4: COMPENSATION ── */}
        {step === 4 && (
          <div>
            <Eyebrow>STEP 5 OF 6</Eyebrow>
            <h1 style={S.title}>Your terms<br/><em style={{ fontStyle:'italic', color:GOLD }}>& availability.</em></h1>
            <p style={S.sub}>This information is shown to buyers on your profile. It helps filter enquiries to only those who are a genuine fit.</p>

            <div style={S.fieldStack}>
              <Field label="Current Availability">
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {AVAILABILITY.map(a => (
                    <label key={a.value} style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px', color: form.availability === a.value ? PARCH : DIM }}>
                      <input type="radio" name="avail" value={a.value} checked={form.availability === a.value}
                        onChange={() => set('availability', a.value)}
                        style={{ accentColor: GOLD, width:'16px', height:'16px' }} />
                      {a.label}
                    </label>
                  ))}
                </div>
              </Field>

              {(isCandidate || isFacilitator) && (
                <Field label="Salary Expectation" hint="Visible on your profile — helps match you with relevant opportunities">
                  <input style={S.input} value={form.salary_expectation}
                    onChange={e => set('salary_expectation', e.target.value)}
                    placeholder="e.g. ₦6M – ₦10M / year" />
                </Field>
              )}

              {(isSpeaker || isFacilitator) && (
                <Field label="Speaking / Facilitation Fee" hint="Shown on your profile to event organisers and training buyers">
                  <input style={S.input} value={form.fee_range}
                    onChange={e => set('fee_range', e.target.value)}
                    placeholder="e.g. $1,500 – $3,000 per engagement" />
                </Field>
              )}

              <Field label="Work Modality">
                <div style={S.tagGrid}>
                  {MODALITY.map(m => {
                    const on = form.modality.includes(m)
                    return (
                      <div key={m} onClick={() => toggleArray('modality', m)}
                        style={{ ...S.tag, borderColor: on ? GOLD : GLINE, color: on ? GOLD : DIM, background: on ? 'rgba(201,168,76,.08)' : 'transparent', cursor:'pointer' }}>
                        {m}
                      </div>
                    )
                  })}
                </div>
              </Field>
            </div>

            <NavButtons
              onBack={() => setStep(s => s-1)}
              onNext={handleNext}
              saving={saving}
            />
          </div>
        )}

        {/* ── STEP 5: REVIEW ── */}
        {step === 5 && (
          <div>
            <Eyebrow>STEP 6 OF 6</Eyebrow>
            <h1 style={S.title}>Review your<br/><em style={{ fontStyle:'italic', color:GOLD }}>profile.</em></h1>
            <p style={S.sub}>This is how your profile card will appear in the marketplace. Your name is hidden from buyers until Valoria facilitates an introduction.</p>

            {/* Preview card */}
            <div style={{ background:'#F7F4EE', border:'0.5px solid #D4C9A8', padding:'20px', marginBottom:'32px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'50%', border:`2px solid ${GOLD}`, background:MID, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', fontSize:'16px', fontWeight:700, color:GOLD, flexShrink:0 }}>
                  {form.photo_url
                    ? <img src={form.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : getInitials(form.display_name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'15px', fontWeight:700, color:'#0F0F1A', marginBottom:'2px' }}>
                    {form.display_name || 'Your Name'}
                  </div>
                  <div style={{ fontSize:'12px', color:GOLD, fontWeight:500, marginBottom:'2px' }}>
                    {form.headline || 'Your headline'}
                  </div>
                  {form.location && <div style={{ fontSize:'11px', color:'#5F5E5A' }}>📍 {form.location}</div>}
                </div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#1D9E75' }}>● Open</div>
              </div>
              {(form.skills.length > 0 || form.topics.length > 0) && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
                  {[...form.skills, ...form.topics].slice(0,4).map(t => (
                    <span key={t} style={{ padding:'4px 10px', border:'1px solid #D4C9A8', fontSize:'11px', color:'#2E2E4A', background:'#EDE8DC' }}>{t}</span>
                  ))}
                </div>
              )}
              {form.bio && <p style={{ fontSize:'12px', color:'#444441', lineHeight:1.6, margin:'0 0 12px' }}>{form.bio.slice(0,120)}{form.bio.length > 120 ? '…' : ''}</p>}
              <div style={{ display:'flex', gap:'8px' }}>
                <div style={{ flex:1, padding:'8px', border:'1px solid #0F0F1A', fontSize:'10px', fontWeight:700, letterSpacing:'.1em', textAlign:'center', color:'#0F0F1A' }}>VIEW PROFILE</div>
                <div style={{ flex:1, padding:'8px', background:'#378ADD', fontSize:'10px', fontWeight:700, letterSpacing:'.1em', textAlign:'center', color:'#fff' }}>REQUEST INTRO</div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background:MID, border:`1px solid ${GLINE}`, padding:'20px', marginBottom:'24px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.45)', marginBottom:'16px' }}>PROFILE SUMMARY</div>
              {[
                { label:'Tracks',       value: form.active_tracks.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') || '—' },
                { label:'Industry',     value: form.industry || '—' },
                { label:'Experience',   value: form.years_experience ? `${form.years_experience} years` : '—' },
                { label:'Skills',       value: form.skills.length > 0 ? `${form.skills.length} selected` : '—' },
                { label:'Topics',       value: form.topics.length > 0 ? `${form.topics.length} selected` : '—' },
                { label:'Photo',        value: form.photo_url ? 'Uploaded ✓' : 'Not uploaded' },
                { label:'Videos',       value: form.youtube_links.filter(Boolean).length > 0 ? `${form.youtube_links.filter(Boolean).length} link(s)` : 'None' },
                { label:'Availability', value: AVAILABILITY.find(a => a.value === form.availability)?.label || '—' },
                ...(isCandidate ? [{ label:'Salary Range', value: form.salary_expectation || '—' }] : []),
                ...(isSpeaker   ? [{ label:'Speaking Fee',  value: form.fee_range || '—' }] : []),
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${GLINE}` }}>
                  <span style={{ fontSize:'12px', color:DIM }}>{row.label}</span>
                  <span style={{ fontSize:'12px', fontWeight:500, color:PARCH }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* VALU Index nudge */}
            <div style={{ background:'rgba(201,168,76,.05)', border:`1px solid ${GLINE}`, padding:'20px', marginBottom:'24px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.18em', color:'rgba(201,168,76,.45)', marginBottom:'10px' }}>NEXT STEP: VALU INDEX</div>
              <p style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.7, margin:'0 0 14px' }}>
                Your profile is set to <strong style={{ color:PARCH }}>Pending</strong> until you complete the VALU Index assessment. Profiles that score 35 or above become eligible for full marketplace listing.
              </p>
              <a href="https://assessment.valoriainstitute.com/" target="_blank" rel="noopener noreferrer"
                style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.12em', color:GOLD, textDecoration:'none' }}>
                TAKE THE VALU INDEX →
              </a>
            </div>

            {/* Consent */}
            <label style={{ display:'flex', alignItems:'flex-start', gap:'12px', cursor:'pointer', marginBottom:'32px' }}>
              <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)}
                style={{ width:'16px', height:'16px', accentColor:GOLD, marginTop:'2px', flexShrink:0 }} />
              <span style={{ fontSize:'13px', fontWeight:300, color:DIM, lineHeight:1.7 }}>
                I confirm that the information I have provided is accurate. I understand that my profile will be reviewed by Valoria Institute before being listed in the marketplace, and that my full name will only be shared with buyers after a formal introduction is facilitated by Valoria.
              </span>
            </label>

            <button onClick={handleFinish}
              disabled={!form.consent || saving}
              style={{ display:'block', width:'100%', padding:'16px', background: form.consent && !saving ? GOLD : 'rgba(201,168,76,.25)', color: form.consent && !saving ? DARK : 'rgba(201,168,76,.4)', fontSize:'12px', fontWeight:700, letterSpacing:'.14em', border:'none', cursor: form.consent && !saving ? 'pointer' : 'not-allowed', fontFamily:'inherit', marginBottom:'16px' }}>
              {saving ? 'SAVING…' : 'SUBMIT PROFILE FOR REVIEW'}
            </button>

            <button onClick={() => setStep(s => s-1)}
              style={{ display:'block', width:'100%', padding:'12px', background:'transparent', border:`1px solid ${GLINE}`, color:DIM, fontSize:'11px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'.08em' }}>
              ← BACK
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── sub-components ─────────────────────────────────────────────────────────
function Eyebrow({ children }) {
  return (
    <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.2em', color:'rgba(201,168,76,.45)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'10px' }}>
      <div style={{ height:'1px', width:'24px', background:'rgba(201,168,76,.3)' }} />
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:'rgba(201,168,76,.5)', marginBottom:'8px', textTransform:'uppercase' }}>{label}</div>
      {hint && <div style={{ fontSize:'11px', color:'rgba(247,244,238,.35)', marginBottom:'8px', fontStyle:'italic' }}>{hint}</div>}
      {children}
    </div>
  )
}

function CharCount({ val, max }) {
  const len = (val || '').length
  return (
    <div style={{ fontSize:'10px', color: len > max * 0.9 ? GOLD : 'rgba(247,244,238,.25)', textAlign:'right', marginTop:'4px' }}>
      {len} / {max}
    </div>
  )
}

function NavButtons({ onBack, onNext, onFinish, nextDisabled, saving, showBack=true }) {
  return (
    <div style={{ display:'flex', gap:'12px', marginTop:'40px' }}>
      {showBack && (
        <button onClick={onBack}
          style={{ padding:'14px 24px', background:'transparent', border:`1px solid rgba(201,168,76,.2)`, color:'rgba(247,244,238,.5)', fontSize:'11px', fontWeight:700, letterSpacing:'.12em', cursor:'pointer', fontFamily:'inherit' }}>
          ← BACK
        </button>
      )}
      {onNext && (
        <button onClick={onNext}
          disabled={nextDisabled || saving}
          style={{ flex:1, padding:'14px', background: !nextDisabled && !saving ? GOLD : 'rgba(201,168,76,.2)', color: !nextDisabled && !saving ? '#0F0F1A' : 'rgba(201,168,76,.4)', fontSize:'12px', fontWeight:700, letterSpacing:'.14em', border:'none', cursor: !nextDisabled && !saving ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
          {saving ? 'SAVING…' : 'CONTINUE →'}
        </button>
      )}
    </div>
  )
}

// ─── styles ─────────────────────────────────────────────────────────────────
const S = {
  title:     { fontSize:'clamp(28px,4vw,44px)', fontWeight:200, color:PARCH, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:'12px' },
  sub:       { fontSize:'14px', fontWeight:300, color:DIM, lineHeight:1.75, marginBottom:'32px' },
  fieldStack:{ display:'flex', flexDirection:'column', gap:'20px', marginBottom:'8px' },
  input:     { width:'100%', padding:'12px 14px', background:'rgba(255,255,255,.04)', border:`1px solid rgba(201,168,76,.2)`, color:PARCH, fontSize:'14px', fontFamily:'var(--font,Raleway,sans-serif)', outline:'none', boxSizing:'border-box' },
  tagLabel:  { fontSize:'10px', fontWeight:700, letterSpacing:'.14em', color:'rgba(201,168,76,.5)', marginBottom:'12px', textTransform:'uppercase' },
  tagGrid:   { display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'8px' },
  tag:       { padding:'8px 14px', border:'1px solid', fontSize:'12px', fontWeight:400, letterSpacing:'.04em', userSelect:'none', transition:'border-color .12s, color .12s, background .12s' },
  btnGhost:  { padding:'10px 20px', background:'transparent', border:`1px solid rgba(201,168,76,.2)`, color:DIM, fontSize:'11px', fontWeight:700, letterSpacing:'.1em', cursor:'pointer', fontFamily:'var(--font,Raleway,sans-serif)' },
}
