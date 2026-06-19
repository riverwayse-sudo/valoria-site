'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const SLATE = '#2E2E4A'

const TIER_BADGES = {
  emerging:    { label: '✦ Emerging',    bg: '#EDE8DC', text: '#2E2E4A', border: '#D4C9A8' },
  established: { label: '✦✦ Established', bg: MIDNIGHT,  text: GOLD,     border: 'none' },
  elite:       { label: '✦✦✦ Elite',      bg: GOLD,      text: MIDNIGHT,  border: 'none' },
}

const INDUSTRIES = ['Finance','Technology','Healthcare','Energy','Media','Education','Legal','Consulting','NGO/Development','Government','Other']
const EXPERIENCE_LEVELS = ['emerging','mid','senior','executive']
const TOPIC_OPTIONS = ['Leadership','Strategy','Innovation','DEI','Finance','Technology','Communication','Entrepreneurship','Governance','People Development','Mental Health','Global Affairs']

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
      setProfile(data || { id: user.id, user_type: 'talent', skills: [], topics: [], youtube_links: [], portfolio_images: [] })
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
    const links = [...(profile.youtube_links || ['', '', '', ''])]
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
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase.from('profiles').upsert({ ...profile, id: user.id })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ ...styles.page, justifyContent: 'center', alignItems: 'center' }}><div style={{ color: GOLD, fontFamily: 'Raleway', fontSize: '14px' }}>Loading profile…</div></div>

  const isSpeaker = profile.user_type === 'speaker'
  const isTalent = profile.user_type === 'talent'
  const tier = TIER_BADGES[profile.tier] || TIER_BADGES.emerging

  return (
    <div style={styles.page}>
      <div style={styles.layout}>

        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <Link href="/" style={styles.backLink}>← Back to site</Link>

          {/* Cover image */}
          <div style={{ position: 'relative', marginBottom: '0' }}>
            <div
              style={{ ...styles.coverImg, backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : undefined }}
              onClick={() => coverRef.current.click()}
            >
              {!profile.cover_url && <span style={{ color: 'rgba(247,244,238,.3)', fontSize: '12px' }}>+ Cover image</span>}
              {uploadingCover && <div style={styles.uploadOverlay}>Uploading…</div>}
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'cover', url => update('cover_url', url), setUploadingCover)} />
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-36px', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
            <div style={styles.avatarWrap} onClick={() => photoRef.current.click()}>
              {profile.photo_url
                ? <img src={profile.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={{ color: 'rgba(247,244,238,.4)', fontSize: '12px', textAlign: 'center' }}>+ Photo</span>}
              {uploadingPhoto && <div style={styles.uploadOverlay}>…</div>}
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'photo', url => update('photo_url', url), setUploadingPhoto)} />
          </div>

          {/* Tier badge (speaker only) */}
          {isSpeaker && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ ...styles.tierBadge, background: tier.bg, color: tier.text, border: tier.border !== 'none' ? `1px solid ${tier.border}` : 'none' }}>
                {tier.label}
              </span>
              <p style={{ fontSize: '11px', color: 'rgba(247,244,238,.3)', marginTop: '8px', lineHeight: 1.5 }}>
                Tier is merit-based and assigned by Valoria.
              </p>
            </div>
          )}

          <div style={styles.sideNav}>
            {['basic', 'professional', isSpeaker ? 'speaking' : 'portfolio', 'social'].map(s => (
              <a key={s} href={`#${s}`} style={styles.sideNavLink}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </a>
            ))}
          </div>

          <a href={`/profile/${user?.id}`} style={styles.btnOutline} target="_blank">VIEW PUBLIC PROFILE</a>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <div>
              <div style={styles.eyebrow}><div style={styles.eyebrowLine} /><span style={styles.eyebrowText}>EDIT PROFILE</span></div>
              <h1 style={styles.title}>Your profile.<br /><em style={{ color: GOLD }}>Built with intention.</em></h1>
            </div>
            <button onClick={save} disabled={saving} style={styles.btnGold}>
              {saving ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE PROFILE'}
            </button>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* BASIC */}
          <section id="basic" style={styles.section}>
            <h2 style={styles.sectionTitle}>Basic information</h2>
            <div style={styles.grid2}>
              <Field label="Full Name" value={profile.display_name || ''} onChange={v => update('display_name', v)} placeholder="Your full name" />
              <Field label="Location" value={profile.location || ''} onChange={v => update('location', v)} placeholder="City, Country" />
            </div>
            <Field label="Professional Headline" value={profile.headline || ''} onChange={v => update('headline', v)} placeholder={isSpeaker ? 'e.g. Leadership Strategist & Keynote Speaker' : 'e.g. Senior Finance Manager | FMCG Specialist'} />
            <div style={styles.field}>
              <label style={styles.label}>Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={e => update('bio', e.target.value)}
                placeholder="Write a concise professional bio. Speak in third person."
                rows={5}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>
          </section>

          {/* PROFESSIONAL (Talent) */}
          {isTalent && (
            <section id="professional" style={styles.section}>
              <h2 style={styles.sectionTitle}>Professional details</h2>
              <div style={styles.grid2}>
                <div style={styles.field}>
                  <label style={styles.label}>Industry / Sector</label>
                  <select value={profile.industry || ''} onChange={e => update('industry', e.target.value)} style={styles.input}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Experience Level</label>
                  <select value={profile.experience_level || ''} onChange={e => update('experience_level', e.target.value)} style={styles.input}>
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Availability</label>
                <div style={styles.radioGroup}>
                  {[['open','Open to opportunities'],['contract_only','Contract only'],['not_available','Not available']].map(([val, lbl]) => (
                    <label key={val} style={styles.radioLabel}>
                      <input type="radio" name="availability" value={val} checked={profile.availability === val} onChange={() => update('availability', val)} style={{ accentColor: GOLD }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Key Skills (select all that apply)</label>
                <div style={styles.tagGrid}>
                  {['Strategy','Finance','Operations','People Management','Technology','Analytics','Business Development','Legal','Marketing','Communications','Project Management','Risk Management'].map(skill => (
                    <button key={skill} type="button"
                      onClick={() => toggleArray('skills', skill)}
                      style={{ ...styles.tag, background: (profile.skills || []).includes(skill) ? 'rgba(201,168,76,.15)' : 'transparent', borderColor: (profile.skills || []).includes(skill) ? GOLD : 'rgba(201,168,76,.2)', color: (profile.skills || []).includes(skill) ? GOLD : 'rgba(247,244,238,.5)' }}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SPEAKING (Speaker) */}
          {isSpeaker && (
            <section id="speaking" style={styles.section}>
              <h2 style={styles.sectionTitle}>Speaking profile</h2>
              <div style={styles.field}>
                <label style={styles.label}>Speaking Topics (select all that apply)</label>
                <div style={styles.tagGrid}>
                  {TOPIC_OPTIONS.map(t => (
                    <button key={t} type="button"
                      onClick={() => toggleArray('topics', t)}
                      style={{ ...styles.tag, background: (profile.topics || []).includes(t) ? 'rgba(201,168,76,.15)' : 'transparent', borderColor: (profile.topics || []).includes(t) ? GOLD : 'rgba(201,168,76,.2)', color: (profile.topics || []).includes(t) ? GOLD : 'rgba(247,244,238,.5)' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.grid2}>
                <Field label="Fee Range" value={profile.fee_range || ''} onChange={v => update('fee_range', v)} placeholder="e.g. ₦500k – ₦1.5M" />
                <div style={styles.field}>
                  <label style={styles.label}>Speaking Credits (number of engagements)</label>
                  <input type="number" min={0} value={profile.speaking_credits || 0} onChange={e => update('speaking_credits', parseInt(e.target.value))} style={styles.input} />
                </div>
              </div>
              <Field label="Speaking Experience" value={profile.speaking_experience || ''} onChange={v => update('speaking_experience', v)} placeholder="Describe your speaking background and expertise…" multiline />
              <Field label="Past Events / Appearances" value={profile.past_events || ''} onChange={v => update('past_events', v)} placeholder="List notable events, conferences, or engagements…" multiline />

              <div style={styles.field}>
                <label style={styles.label}>Video Links (YouTube, Vimeo — up to 4)</label>
                <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.35)', marginBottom: '10px' }}>Paste your speaking video URLs. These display as preview cards on your profile.</p>
                {[0,1,2,3].map(i => (
                  <input key={i} type="url" value={(profile.youtube_links || [])[i] || ''} onChange={e => updateYoutube(i, e.target.value)}
                    placeholder={`Video link ${i + 1} — YouTube or Vimeo URL`}
                    style={{ ...styles.input, marginBottom: '8px' }} />
                ))}
              </div>
            </section>
          )}

          {/* PORTFOLIO (Talent) */}
          {isTalent && (
            <section id="portfolio" style={styles.section}>
              <h2 style={styles.sectionTitle}>Portfolio images</h2>
              <p style={{ fontSize: '13px', color: 'rgba(247,244,238,.4)', marginBottom: '16px' }}>Upload up to 6 portfolio or work images. These appear on your public profile.</p>
              <div style={styles.portfolioGrid}>
                {[0,1,2,3,4,5].map(i => {
                  const url = (profile.portfolio_images || [])[i]
                  return (
                    <label key={i} style={styles.portfolioSlot}>
                      {url
                        ? <img src={url} alt={`Portfolio ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                        : <span style={{ color: 'rgba(247,244,238,.25)', fontSize: '22px' }}>+</span>}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        if (!e.target.files[0]) return
                        uploadImage(e.target.files[0], `portfolio-${i}`, url => {
                          const imgs = [...(profile.portfolio_images || [])]
                          imgs[i] = url
                          update('portfolio_images', imgs)
                        }, setUploadingPhoto)
                      }} />
                    </label>
                  )
                })}
              </div>
            </section>
          )}

          {/* SOCIAL */}
          <section id="social" style={styles.section}>
            <h2 style={styles.sectionTitle}>Social & contact links</h2>
            <div style={styles.grid2}>
              <Field label="LinkedIn URL" value={profile.linkedin_url || ''} onChange={v => update('linkedin_url', v)} placeholder="https://linkedin.com/in/…" />
              <Field label="Instagram" value={profile.instagram_url || ''} onChange={v => update('instagram_url', v)} placeholder="https://instagram.com/…" />
              {isSpeaker && <>
                <Field label="Facebook" value={profile.facebook_url || ''} onChange={v => update('facebook_url', v)} placeholder="https://facebook.com/…" />
                <Field label="Twitter / X" value={profile.twitter_url || ''} onChange={v => update('twitter_url', v)} placeholder="https://x.com/…" />
              </>}
            </div>
          </section>

          {/* Visibility toggle */}
          <section style={{ ...styles.section, border: 'none' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!profile.is_visible} onChange={e => update('is_visible', e.target.checked)} style={{ accentColor: GOLD, width: '18px', height: '18px' }} />
              <span style={{ fontSize: '14px', color: PARCHMENT, fontWeight: 400 }}>
                Make my profile visible in the marketplace
              </span>
            </label>
            <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.35)', marginTop: '8px', marginLeft: '30px' }}>
              When visible, {isSpeaker ? 'event organisers' : 'employers'} can find and contact you.
            </p>
          </section>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={save} disabled={saving} style={{ ...styles.btnGold, flex: 1 }}>
              {saving ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE PROFILE'}
            </button>
            <a href={`/profile/${user?.id}`} target="_blank" style={{ ...styles.btnOutline, flex: 1, textAlign: 'center' }}>
              VIEW PUBLIC PROFILE
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} style={{ ...styles.input, resize: 'vertical' }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={styles.input} />}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: DARK, fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif", color: PARCHMENT },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' },
  sidebar: { background: 'rgba(26,26,46,.8)', borderRight: '1px solid rgba(201,168,76,.1)', padding: '0 0 40px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  backLink: { display: 'block', padding: '20px 24px', fontSize: '12px', color: 'rgba(247,244,238,.4)', textDecoration: 'none', letterSpacing: '.05em' },
  coverImg: { height: '120px', background: 'rgba(201,168,76,.06)', backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(201,168,76,.1)', position: 'relative' },
  uploadOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: GOLD },
  avatarWrap: { width: '80px', height: '80px', borderRadius: '50%', border: `2px solid ${GOLD}`, background: 'rgba(201,168,76,.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  tierBadge: { display: 'inline-block', padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 },
  sideNav: { padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' },
  sideNavLink: { padding: '8px 12px', fontSize: '13px', color: 'rgba(247,244,238,.5)', textDecoration: 'none', borderRadius: '6px', display: 'block' },
  btnOutline: { display: 'block', margin: '16px 24px 0', padding: '12px', border: `1px solid ${GOLD}`, borderRadius: '999px', color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', textAlign: 'center', textDecoration: 'none', background: 'transparent' },
  main: { padding: 'clamp(24px,4vw,56px)' },
  mainHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  eyebrowLine: { width: '24px', height: '1px', background: 'rgba(201,168,76,.4)' },
  eyebrowText: { fontSize: '10px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  title: { fontSize: 'clamp(24px,3vw,38px)', fontWeight: 200, lineHeight: 1.1, letterSpacing: '-.02em' },
  section: { marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid rgba(201,168,76,.08)' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: PARCHMENT, marginBottom: '24px', letterSpacing: '-.01em' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', color: 'rgba(247,244,238,.45)', textTransform: 'uppercase', marginBottom: '6px' },
  input: { width: '100%', padding: '11px 13px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,168,76,.18)', borderRadius: '6px', color: PARCHMENT, fontSize: '14px', fontFamily: "'Raleway', sans-serif", outline: 'none', boxSizing: 'border-box' },
  radioGroup: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(247,244,238,.6)', cursor: 'pointer' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { padding: '6px 14px', borderRadius: '999px', border: '1px solid', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Raleway', sans-serif", transition: 'all .15s' },
  portfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  portfolioSlot: { height: '120px', border: '1px dashed rgba(201,168,76,.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: 'rgba(255,255,255,.02)' },
  btnGold: { padding: '12px 28px', background: GOLD, color: MIDNIGHT, fontSize: '11px', fontWeight: 700, letterSpacing: '.13em', borderRadius: '999px', border: 'none', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' },
  errorBox: { padding: '12px 14px', background: 'rgba(216,90,48,.12)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595', marginBottom: '24px' },
}
