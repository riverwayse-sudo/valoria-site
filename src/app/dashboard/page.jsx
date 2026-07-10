'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DARK_MID = '#1A1A2E'
const DIM = 'rgba(247,244,238,.45)'
const FAINT = 'rgba(247,244,238,.2)'

const STATUS_COLORS = {
  pending:    { bg: 'rgba(186,117,23,.12)',  text: '#BA7517',  label: 'Pending' },
  reviewing:  { bg: 'rgba(55,138,221,.12)',  text: '#378ADD',  label: 'Under Review' },
  introduced: { bg: 'rgba(29,158,117,.12)',  text: '#1D9E75',  label: 'Introduced' },
  declined:   { bg: 'rgba(216,90,48,.12)',   text: '#D85A30',  label: 'Declined' },
  completed:  { bg: 'rgba(201,168,76,.12)',  text: GOLD,       label: 'Completed' },
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isSupply, setIsSupply] = useState(false)   // professional (candidate/speaker/facilitator) vs buyer (employer/organiser)
  const [enquiries, setEnquiries] = useState([])   // messages received (supply side)
  const [requests, setRequests] = useState([])      // messages sent (demand side)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      // Professionals (candidate/speaker/facilitator) live in professional_profiles,
      // set up via the /profile/setup wizard. Buyers (employer/organiser) live in
      // profiles, set up via /signup. Check professional_profiles first.
      const { data: proProfile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      let prof = proProfile
      let supply = !!proProfile

      if (!prof) {
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        prof = buyerProfile
        supply = false
      }

      setProfile(prof)
      setIsSupply(supply)

      if (supply) {
        // Messages/bookings this professional received
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_profile_id', user.id)
          .order('created_at', { ascending: false })
        setEnquiries(msgs || [])
      } else {
        // Messages/bookings this employer/organiser sent
        const { data: msgs } = await supabase
          .from('messages')
          .select('*, professional_profiles:recipient_profile_id(display_name, headline, photo_url, active_tracks)')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
        setRequests(msgs || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Raleway', color: GOLD, fontSize: '14px' }}>
      Loading your dashboard…
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Raleway', color: PARCHMENT, gap: '16px' }}>
      <p>No profile found yet.</p>
      <Link href="/profile/setup" style={styles.btnGold}>Complete Your Profile</Link>
    </div>
  )

  const isSpeaker = isSupply && (profile.active_tracks || []).includes('speaker')
  const isOrganiser = !isSupply && profile.user_type === 'organiser'
  const isVisible = isSupply && profile.listing_status === 'listed'

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif", color: PARCHMENT }}>

      {/* HEADER */}
      <header style={styles.header}>
        <Link href="/" style={{ lineHeight: 0 }}>
          <img src="/logo.png" alt="Valoria Institute" style={{ height: '44px', width: 'auto' }} />
        </Link>
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/marketplace" style={styles.navLink}>Marketplace</Link>
          {isSupply && <Link href="/profile/edit" style={styles.navLink}>Edit Profile</Link>}
          {isSupply && <Link href={`/profile/${user.id}`} target="_blank" style={styles.navLink}>View Public Profile</Link>}
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            style={styles.signOutBtn}>Sign Out</button>
        </nav>
      </header>

      <div style={styles.page}>

        {/* WELCOME STRIP */}
        <div style={styles.welcomeStrip}>
          <div>
            <div style={styles.eyebrow}><div style={styles.eyebrowLine} /><span style={styles.eyebrowText}>DASHBOARD</span></div>
            <h1 style={styles.welcomeTitle}>
              Welcome back{profile.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''}.
            </h1>
            <p style={{ fontSize: '13px', color: DIM, fontWeight: 300 }}>
              {isSupply
                ? `${isSpeaker ? 'Speaker' : 'Talent'} — ${isSpeaker ? 'ATB Spotlight' : 'ATB Connect'}`
                : `${isOrganiser ? 'Event Organiser' : 'Employer'} — ${isOrganiser ? 'ATB Spotlight' : 'ATB Connect'}`}
            </p>
          </div>
          {isSupply && (
            <div style={styles.visibilityCard}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.14em', color: 'rgba(201,168,76,.6)', marginBottom: '6px' }}>MARKETPLACE LISTING</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: isVisible ? '#1D9E75' : '#888',
                  flexShrink: 0
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: isVisible ? '#1D9E75' : 'rgba(247,244,238,.4)' }}>
                  {isVisible ? 'Listed — visible to buyers' : 'Not listed'}
                </span>
              </div>
              {!isVisible && (
                <Link href="/profile/edit" style={{ fontSize: '11px', color: GOLD, marginTop: '8px', display: 'block' }}>
                  Go to profile → enable listing
                </Link>
              )}
            </div>
          )}
        </div>

        {/* SUPPLY SIDE — talent/speaker */}
        {isSupply && (
          <>
            {/* PROFILE COMPLETENESS */}
            <ProfileCompleteness profile={profile} isSpeaker={isSpeaker} />

            {/* ENQUIRIES RECEIVED */}
            <section style={styles.section}>
              <div style={styles.sectionHead}>
                <h2 style={styles.sectionTitle}>Enquiries received</h2>
                <span style={styles.badge}>{enquiries.length}</span>
              </div>

              {enquiries.length === 0 ? (
                <EmptyState
                  icon="◈"
                  message={isVisible
                    ? "No enquiries yet — your profile is live and visible."
                    : "Enable your marketplace listing to start receiving enquiries."}
                  cta={!isVisible ? { label: 'Enable Listing', href: '/profile/edit' } : null}
                />
              ) : (
                <div style={styles.enquiryList}>
                  {enquiries.map(msg => (
                    <EnquiryCard key={msg.id} msg={msg} isSpeaker={isSpeaker} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* DEMAND SIDE — employer/organiser */}
        {!isSupply && (
          <>
            <div style={styles.quickActions}>
              <Link href="/marketplace" style={styles.actionCard}>
                <span style={styles.actionIcon}>{isOrganiser ? '◉' : '◈'}</span>
                <div>
                  <div style={styles.actionTitle}>{isOrganiser ? 'Find Speakers' : 'Search Talent'}</div>
                  <div style={styles.actionSub}>Browse the {isOrganiser ? 'ATB Spotlight' : 'ATB Connect'} marketplace</div>
                </div>
                <span style={{ color: GOLD, marginLeft: 'auto' }}>→</span>
              </Link>
            </div>

            <section style={styles.section}>
              <div style={styles.sectionHead}>
                <h2 style={styles.sectionTitle}>Your enquiries</h2>
                <span style={styles.badge}>{requests.length}</span>
              </div>

              {requests.length === 0 ? (
                <EmptyState
                  icon={isOrganiser ? '◉' : '◈'}
                  message={`You haven't sent any enquiries yet. Browse the marketplace to find ${isOrganiser ? 'speakers' : 'talent'}.`}
                  cta={{ label: isOrganiser ? 'Browse Speakers' : 'Search Talent', href: '/marketplace' }}
                />
              ) : (
                <div style={styles.enquiryList}>
                  {requests.map(msg => (
                    <SentRequestCard key={msg.id} msg={msg} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ProfileCompleteness({ profile, isSpeaker }) {
  const fields = isSpeaker
    ? ['display_name', 'headline', 'bio', 'photo_url', 'topics', 'tier', 'fee_range']
    : ['display_name', 'headline', 'bio', 'photo_url', 'skills', 'industry', 'availability']

  const filled = fields.filter(f => {
    const v = profile[f]
    if (Array.isArray(v)) return v.length > 0
    return !!v
  }).length

  const pct = Math.round((filled / fields.length) * 100)
  const isComplete = pct === 100

  return (
    <div style={styles.completenessCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: PARCHMENT }}>Profile completeness</span>
        <span style={{ fontSize: '20px', fontWeight: 700, color: isComplete ? '#1D9E75' : GOLD }}>{pct}%</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,.06)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: isComplete ? '#1D9E75' : GOLD, borderRadius: '2px', transition: 'width .4s' }} />
      </div>
      {!isComplete && (
        <Link href="/profile/edit" style={{ fontSize: '11px', color: GOLD, marginTop: '10px', display: 'block' }}>
          Complete your profile to improve visibility →
        </Link>
      )}
    </div>
  )
}

function EnquiryCard({ msg, isSpeaker }) {
  const date = new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const status = STATUS_COLORS[msg.status] || STATUS_COLORS.pending

  // Parse name/email from body (format: "From: Name (email)\nOrganisation: X\n...")
  const lines = (msg.body || '').split('\n')
  const fromLine = lines[0] || ''
  const orgLine = lines[1] || ''

  return (
    <div style={styles.enquiryCard}>
      <div style={styles.enquiryTop}>
        <div>
          <div style={styles.enquirySubject}>{msg.subject || (isSpeaker ? 'Booking enquiry' : 'Talent enquiry')}</div>
          <div style={styles.enquiryMeta}>{fromLine} · {orgLine}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ ...styles.statusPill, background: status.bg, color: status.text }}>{status.label}</span>
          <span style={{ fontSize: '11px', color: FAINT }}>{date}</span>
        </div>
      </div>
      {msg.body && (
        <p style={styles.enquiryBody}>
          {lines.slice(isSpeaker ? 3 : 2).join(' ').trim().slice(0, 180)}
          {msg.body.length > 180 ? '…' : ''}
        </p>
      )}
    </div>
  )
}

function SentRequestCard({ msg }) {
  const date = new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const status = STATUS_COLORS[msg.status] || STATUS_COLORS.pending
  const prof = msg.professional_profiles

  return (
    <div style={styles.enquiryCard}>
      <div style={styles.enquiryTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.miniAvatar}>
            {prof?.photo_url
              ? <img src={prof.photo_url} alt={prof.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ color: FAINT, fontSize: '14px' }}>◈</span>}
          </div>
          <div>
            <div style={styles.enquirySubject}>{prof?.display_name || 'Professional'}</div>
            <div style={styles.enquiryMeta}>{prof?.headline || ''}</div>
            <div style={{ fontSize: '11px', color: DIM, marginTop: '4px' }}>{msg.subject}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ ...styles.statusPill, background: status.bg, color: status.text }}>{status.label}</span>
          <span style={{ fontSize: '11px', color: FAINT }}>{date}</span>
        </div>
      </div>
      {prof && (
        <Link href={`/profile/${msg.recipient_profile_id}`} style={styles.viewProfileLink}>
          View profile →
        </Link>
      )}
    </div>
  )
}

function EmptyState({ icon, message, cta }) {
  return (
    <div style={styles.emptyState}>
      <div style={{ fontSize: '28px', color: GOLD, marginBottom: '10px' }}>{icon}</div>
      <p style={{ fontSize: '13px', color: DIM, marginBottom: cta ? '16px' : 0 }}>{message}</p>
      {cta && <Link href={cta.href} style={styles.btnGold}>{cta.label}</Link>}
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', background: MIDNIGHT, borderBottom: '1px solid rgba(201,168,76,.12)', position: 'sticky', top: 0, zIndex: 100 },
  navLink: { fontSize: '12px', color: DIM, textDecoration: 'none' },
  signOutBtn: { fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(201,168,76,.6)', background: 'transparent', border: '1px solid rgba(201,168,76,.2)', borderRadius: '999px', padding: '7px 16px', cursor: 'pointer', fontFamily: 'Raleway' },
  page: { maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  eyebrowLine: { width: '20px', height: '1px', background: 'rgba(201,168,76,.3)' },
  eyebrowText: { fontSize: '9px', fontWeight: 700, letterSpacing: '.18em', color: 'rgba(201,168,76,.6)' },
  welcomeStrip: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '24px', flexWrap: 'wrap' },
  welcomeTitle: { fontSize: 'clamp(24px,3vw,36px)', fontWeight: 200, letterSpacing: '-.02em', color: PARCHMENT, margin: 0 },
  visibilityCard: { background: 'rgba(26,26,46,.6)', border: '1px solid rgba(201,168,76,.12)', borderRadius: '10px', padding: '16px 20px', minWidth: '220px' },
  completenessCard: { background: 'rgba(26,26,46,.5)', border: '1px solid rgba(201,168,76,.1)', borderRadius: '10px', padding: '16px 20px', marginBottom: '32px' },
  section: { marginBottom: '40px' },
  sectionHead: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: PARCHMENT, margin: 0 },
  badge: { fontSize: '11px', fontWeight: 700, background: 'rgba(201,168,76,.12)', color: GOLD, borderRadius: '999px', padding: '3px 10px' },
  enquiryList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  enquiryCard: { background: 'rgba(26,26,46,.5)', border: '1px solid rgba(201,168,76,.1)', borderRadius: '10px', padding: '18px 20px' },
  enquiryTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' },
  enquirySubject: { fontSize: '14px', fontWeight: 600, color: PARCHMENT, marginBottom: '3px' },
  enquiryMeta: { fontSize: '12px', color: DIM, fontWeight: 300 },
  enquiryBody: { fontSize: '13px', color: DIM, fontWeight: 300, lineHeight: 1.6, margin: 0 },
  statusPill: { fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap' },
  miniAvatar: { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(201,168,76,.3)', background: MIDNIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  viewProfileLink: { fontSize: '11px', color: GOLD, textDecoration: 'none', marginTop: '8px', display: 'inline-block' },
  quickActions: { marginBottom: '32px' },
  actionCard: { display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(26,26,46,.5)', border: '1px solid rgba(201,168,76,.12)', borderRadius: '10px', padding: '18px 20px', textDecoration: 'none', color: PARCHMENT, transition: 'border-color .2s' },
  actionIcon: { fontSize: '22px', color: GOLD, flexShrink: 0 },
  actionTitle: { fontSize: '14px', fontWeight: 600, marginBottom: '2px' },
  actionSub: { fontSize: '12px', color: DIM, fontWeight: 300 },
  emptyState: { textAlign: 'center', padding: '48px 20px', background: 'rgba(26,26,46,.3)', border: '1px solid rgba(201,168,76,.06)', borderRadius: '10px' },
  btnGold: { display: 'inline-block', padding: '10px 24px', background: GOLD, color: MIDNIGHT, fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', borderRadius: '999px', textDecoration: 'none' },
}
