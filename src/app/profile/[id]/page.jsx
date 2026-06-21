'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const LINEN = '#EDE8DC'

const TIER_BADGES = {
  emerging:    { label: '✦ Emerging',    bg: LINEN,    text: '#2E2E4A', border: '#D4C9A8' },
  established: { label: '✦✦ Established', bg: MIDNIGHT, text: GOLD,     border: 'none' },
  elite:       { label: '✦✦✦ Elite',      bg: GOLD,     text: MIDNIGHT,  border: 'none' },
}

function getYouTubeEmbed(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

export default function PublicProfilePage({ params }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', organisation: '', message: '', event_name: '', event_date: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', params.id).single(),
        supabase.auth.getUser(),
      ])
      setProfile(data)
      setCurrentUser(user)
      setLoading(false)
    }
    load()
  }, [params.id])

  async function sendMessage(e) {
    e.preventDefault()
    setSending(true)
    setFormError('')
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser?.id || null,
        recipient_profile_id: params.id,
        subject: profile?.user_type === 'speaker' ? `Booking enquiry: ${form.event_name}` : `Talent enquiry from ${form.organisation}`,
        body: `From: ${form.name} (${form.email})\nOrganisation: ${form.organisation}\n${profile?.user_type === 'speaker' ? `Event: ${form.event_name}\nDate: ${form.event_date}\n` : ''}\n${form.message}`,
      })
      if (error) throw error

      if (profile?.user_type === 'speaker' && form.event_name) {
        await supabase.from('bookings').insert({
          booker_id: currentUser?.id || null,
          profile_id: params.id,
          booker_type: 'organiser',
          message: form.message,
          event_name: form.event_name,
          event_date: form.event_date || null,
        })
      }
      setSent(true)
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Raleway', color: GOLD }}>Loading profile…</div>
  if (!profile) return <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Raleway', color: 'rgba(247,244,238,.4)' }}>Profile not found.</div>

  const isOwner = currentUser?.id === profile.id

  // Unlisted profiles are only viewable by their owner (previewing their own
  // listing). Everyone else gets a clean "not available" state rather than
  // the full profile — the visibility toggle on profile/edit only means
  // anything if this is actually enforced here, not just in the marketplace
  // search query.
  if (!profile.is_visible && !isOwner) {
    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Raleway', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', color: GOLD }}>◈</div>
        <div style={{ color: PARCHMENT, fontSize: '18px', fontWeight: 300 }}>This profile isn&apos;t currently listed.</div>
        <Link href="/marketplace" style={{ color: GOLD, fontSize: '13px', textDecoration: 'none' }}>← Back to the marketplace</Link>
      </div>
    )
  }

  const isSpeaker = profile.user_type === 'speaker'
  const tier = TIER_BADGES[profile.tier] || TIER_BADGES.emerging
  const videoEmbeds = (profile.youtube_links || []).filter(Boolean).map(getYouTubeEmbed).filter(Boolean)

  return (
    <div style={styles.page}>
      {!profile.is_visible && isOwner && (
        <div style={{ background: 'rgba(201,168,76,.12)', borderBottom: '1px solid rgba(201,168,76,.25)', padding: '10px 24px', textAlign: 'center', fontSize: '12px', color: GOLD, fontWeight: 600, letterSpacing: '.04em' }}>
          PREVIEW MODE — this profile is not listed and buyers can&apos;t see it. <Link href="/profile/edit" style={{ color: GOLD, textDecoration: 'underline' }}>Make it visible →</Link>
        </div>
      )}
      {/* HEADER */}
      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>
          <img src="/logo.png" alt="Valoria Institute" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/marketplace" style={styles.navLink}>← Marketplace</Link>
          {isOwner && <Link href="/profile/edit" style={styles.editBtn}>EDIT PROFILE</Link>}
        </div>
      </header>

      {/* COVER */}
      <div style={{ ...styles.cover, backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : undefined }}>
        <div style={styles.coverOverlay} />
      </div>

      <div style={styles.layout}>
        {/* LEFT COLUMN */}
        <aside style={styles.aside}>
          <div style={styles.avatarWrap}>
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontSize: '36px', color: 'rgba(247,244,238,.2)' }}>◈</span>}
          </div>

          <h1 style={styles.name}>{profile.display_name}</h1>
          <p style={styles.headline}>{profile.headline}</p>
          {profile.location && <p style={styles.location}>📍 {profile.location}</p>}

          {isSpeaker && (
            <div style={{ marginBottom: '20px' }}>
              <span style={{ ...styles.tierBadge, background: tier.bg, color: tier.text, border: tier.border !== 'none' ? `1px solid ${tier.border}` : 'none' }}>
                {tier.label}
              </span>
            </div>
          )}

          {isSpeaker && profile.speaking_credits > 0 && (
            <div style={styles.statRow}>
              <div style={styles.stat}><span style={styles.statNum}>{profile.speaking_credits}</span><span style={styles.statLabel}>Speaking Credits</span></div>
            </div>
          )}

          {!isSpeaker && profile.availability && (
            <div style={{ marginBottom: '16px', fontSize: '12px', fontWeight: 600, color: profile.availability === 'open' ? '#1D9E75' : profile.availability === 'contract_only' ? GOLD : '#888' }}>
              ● {profile.availability === 'open' ? 'Open to opportunities' : profile.availability === 'contract_only' ? 'Contract only' : 'Not available'}
            </div>
          )}

          {isSpeaker && profile.fee_range && (
            <div style={styles.feeBox}>
              <div style={styles.feeLabel}>SPEAKING FEE</div>
              <div style={styles.feeValue}>{profile.fee_range}</div>
            </div>
          )}

          {/* Social links */}
          <div style={styles.socials}>
            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>LinkedIn</a>}
            {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>Instagram</a>}
            {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>Facebook</a>}
            {profile.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>Twitter / X</a>}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.main}>

          {/* Bio */}
          {profile.bio && (
            <Section title="About">
              <p style={styles.bio}>{profile.bio}</p>
            </Section>
          )}

          {/* Topics / Skills */}
          {isSpeaker && (profile.topics || []).length > 0 && (
            <Section title="Speaking Topics">
              <div style={styles.tagGrid}>
                {profile.topics.map(t => <span key={t} style={styles.tag}>{t}</span>)}
              </div>
            </Section>
          )}

          {!isSpeaker && (profile.skills || []).length > 0 && (
            <Section title="Key Skills">
              <div style={styles.tagGrid}>
                {profile.skills.map(s => <span key={s} style={styles.tag}>{s}</span>)}
              </div>
            </Section>
          )}

          {/* Speaking experience */}
          {isSpeaker && profile.speaking_experience && (
            <Section title="Speaking Experience">
              <p style={styles.bio}>{profile.speaking_experience}</p>
            </Section>
          )}

          {isSpeaker && profile.past_events && (
            <Section title="Past Events">
              <p style={styles.bio}>{profile.past_events}</p>
            </Section>
          )}

          {/* Video embeds */}
          {videoEmbeds.length > 0 && (
            <Section title="Speaking Reels">
              <div style={styles.videoGrid}>
                {videoEmbeds.map((src, i) => (
                  <div key={i} style={styles.videoWrap}>
                    <iframe src={src} title={`Speaking video ${i + 1}`} frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen style={{ width: '100%', height: '100%', borderRadius: '6px' }} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Portfolio images */}
          {!isSpeaker && (profile.portfolio_images || []).filter(Boolean).length > 0 && (
            <Section title="Portfolio">
              <div style={styles.portfolioGrid}>
                {profile.portfolio_images.filter(Boolean).map((url, i) => (
                  <img key={i} src={url} alt={`Portfolio ${i + 1}`} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px' }} />
                ))}
              </div>
            </Section>
          )}

          {/* CONTACT / BOOKING FORM */}
          <section id="contact" style={styles.contactSection}>
            <div style={styles.eyebrow}><div style={styles.eyebrowLine} /><span style={styles.eyebrowText}>{isSpeaker ? 'BOOK THIS SPEAKER' : 'CONTACT THIS PROFESSIONAL'}</span></div>
            <h2 style={styles.sectionTitle}>{isSpeaker ? 'Make your booking enquiry.' : 'Start a conversation.'}</h2>

            {sent ? (
              <div style={styles.sentBox}>
                <div style={{ fontSize: '24px', color: GOLD, marginBottom: '8px' }}>✦</div>
                <p style={{ fontWeight: 600, color: PARCHMENT, marginBottom: '4px' }}>Enquiry sent.</p>
                <p style={{ fontSize: '13px', color: 'rgba(247,244,238,.5)' }}>Valoria Institute will facilitate the introduction.</p>
              </div>
            ) : (
              <form onSubmit={sendMessage} style={styles.form}>
                <div style={styles.formGrid}>
                  <FormField label="Your Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
                  <FormField label="Email Address" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" required />
                  <FormField label="Organisation" value={form.organisation} onChange={v => setForm({ ...form, organisation: v })} />
                  {isSpeaker && <>
                    <FormField label="Event Name" value={form.event_name} onChange={v => setForm({ ...form, event_name: v })} />
                    <FormField label="Event Date" value={form.event_date} onChange={v => setForm({ ...form, event_date: v })} type="date" />
                  </>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>{isSpeaker ? 'Tell us about the event and what you need' : 'Your message'}</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5}
                    placeholder={isSpeaker ? 'Event format, audience size, topic brief…' : 'What role are you looking to fill and why this professional caught your attention?'}
                    style={{ ...styles.input, resize: 'vertical' }} />
                </div>
                {formError && <div style={styles.errorBox}>{formError}</div>}
                <button type="submit" disabled={sending} style={styles.btnGold}>
                  {sending ? 'SENDING…' : isSpeaker ? 'SEND BOOKING ENQUIRY' : 'SEND MESSAGE'}
                </button>
                <p style={{ fontSize: '12px', color: 'rgba(247,244,238,.3)', marginTop: '12px' }}>
                  Valoria Institute facilitates all introductions. Your message is sent securely.
                </p>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function FormField({ label, value, onChange, type = 'text', required }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}{required && ' *'}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        style={styles.input} />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: DARK, fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif", color: PARCHMENT },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: MIDNIGHT, borderBottom: '1px solid rgba(201,168,76,.12)', position: 'sticky', top: 0, zIndex: 100 },
  backLink: { display: 'flex', alignItems: 'center' },
  navLink: { fontSize: '13px', color: 'rgba(247,244,238,.4)', textDecoration: 'none' },
  editBtn: { padding: '8px 20px', background: GOLD, color: MIDNIGHT, fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', borderRadius: '999px', textDecoration: 'none' },
  cover: { height: '220px', background: `linear-gradient(180deg, rgba(26,26,46,.4) 0%, ${DARK} 100%), ${MIDNIGHT}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  coverOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(15,15,26,.9) 100%)' },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0', maxWidth: '1100px', margin: '-80px auto 0', position: 'relative', zIndex: 2, padding: '0 24px 80px' },
  aside: { paddingRight: '32px', paddingTop: '16px' },
  avatarWrap: { width: '100px', height: '100px', borderRadius: '50%', border: `2px solid ${GOLD}`, background: MIDNIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '16px' },
  name: { fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: PARCHMENT, marginBottom: '6px', lineHeight: 1.2 },
  headline: { fontSize: '14px', color: GOLD, fontWeight: 500, marginBottom: '6px' },
  location: { fontSize: '12px', color: 'rgba(247,244,238,.4)', marginBottom: '16px' },
  tierBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 },
  statRow: { display: 'flex', gap: '20px', marginBottom: '16px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statNum: { fontSize: '22px', fontWeight: 700, color: GOLD },
  statLabel: { fontSize: '10px', color: 'rgba(247,244,238,.35)', letterSpacing: '.1em', textTransform: 'uppercase' },
  feeBox: { padding: '14px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.2)', borderRadius: '8px', marginBottom: '16px' },
  feeLabel: { fontSize: '9px', fontWeight: 700, letterSpacing: '.14em', color: 'rgba(201,168,76,.6)', marginBottom: '4px' },
  feeValue: { fontSize: '16px', fontWeight: 600, color: GOLD },
  socials: { display: 'flex', flexDirection: 'column', gap: '8px' },
  socialLink: { fontSize: '13px', color: 'rgba(247,244,238,.45)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' },
  main: { paddingTop: '32px', paddingLeft: '16px' },
  section: { marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(201,168,76,.08)' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: PARCHMENT, marginBottom: '16px', letterSpacing: '-.01em' },
  bio: { fontSize: '14px', fontWeight: 300, color: 'rgba(247,244,238,.7)', lineHeight: 1.7 },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { padding: '5px 14px', borderRadius: '999px', border: '1px solid rgba(201,168,76,.25)', fontSize: '12px', color: 'rgba(247,244,238,.6)', fontWeight: 500 },
  videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  videoWrap: { position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '6px', background: MIDNIGHT },
  portfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  contactSection: { background: 'rgba(26,26,46,.5)', border: '1px solid rgba(201,168,76,.12)', borderRadius: '12px', padding: '32px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  eyebrowLine: { width: '20px', height: '1px', background: 'rgba(201,168,76,.4)' },
  eyebrowText: { fontSize: '9px', fontWeight: 700, letterSpacing: '.16em', color: GOLD },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  field: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(247,244,238,.4)', textTransform: 'uppercase', marginBottom: '5px' },
  input: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: '6px', color: PARCHMENT, fontSize: '13px', fontFamily: "'Raleway', sans-serif", outline: 'none', boxSizing: 'border-box' },
  errorBox: { padding: '10px 12px', background: 'rgba(216,90,48,.1)', border: '1px solid rgba(216,90,48,.3)', borderRadius: '6px', fontSize: '13px', color: '#F09595', marginBottom: '12px' },
  btnGold: { padding: '14px 28px', background: GOLD, color: MIDNIGHT, fontSize: '11px', fontWeight: 700, letterSpacing: '.13em', borderRadius: '999px', border: 'none', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", width: '100%' },
  sentBox: { padding: '32px', textAlign: 'center', background: 'rgba(201,168,76,.04)', borderRadius: '8px', border: '1px solid rgba(201,168,76,.15)' },
}
