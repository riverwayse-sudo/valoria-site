'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GOLD = '#C9A84C'
const MIDNIGHT = '#1A1A2E'
const PARCHMENT = '#F7F4EE'
const DARK = '#0F0F1A'
const DARK_MID = '#1A1A2E'
const DIM = 'rgba(247,244,238,.45)'
const FAINT = 'rgba(247,244,238,.2)'

// A profile created within this window is treated as "first time on the dashboard."
// No schema change, no localStorage — just a recency check against created_at.
const FIRST_TIME_WINDOW_HOURS = 48

const STATUS_COLORS = {
  pending:    { bg: 'rgba(186,117,23,.12)',  text: '#BA7517',  label: 'Pending' },
  reviewing:  { bg: 'rgba(55,138,221,.12)',  text: '#378ADD',  label: 'Under Review' },
  introduced: { bg: 'rgba(29,158,117,.12)',  text: '#1D9E75',  label: 'Introduced' },
  declined:   { bg: 'rgba(216,90,48,.12)',   text: '#D85A30',  label: 'Declined' },
  completed:  { bg: 'rgba(201,168,76,.12)',  text: GOLD,       label: 'Completed' },
}

function completenessFields(isSpeaker) {
  return isSpeaker
    ? ['display_name', 'headline', 'bio', 'photo_url', 'topics', 'tier', 'fee_range']
    : ['display_name', 'headline', 'bio', 'photo_url', 'skills', 'industry', 'availability']
}
function computeCompleteness(profile, isSpeaker) {
  const fields = completenessFields(isSpeaker)
  const filled = fields.filter(f => {
    const v = profile[f]
    return Array.isArray(v) ? v.length > 0 : !!v
  }).length
  return Math.round((filled / fields.length) * 100)
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isSupply, setIsSupply] = useState(false)   // professional (candidate/speaker/facilitator) vs buyer (employer/organiser)
  const [enquiries, setEnquiries] = useState([])   // messages received (supply side)
  const [requests, setRequests] = useState([])      // messages sent (demand side)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

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

      // First-time welcome: gated purely on how recently this profile row was
      // created, no separate flag needed. A light sessionStorage check stops it
      // from replaying on every refresh within the same tab session — remove
      // the sessionStorage lines below if you'd rather it show every time the
      // window is open.
      if (prof?.created_at) {
        const hoursSinceCreated = (Date.now() - new Date(prof.created_at).getTime()) / 36e5
        const seenThisSession = typeof window !== 'undefined' && sessionStorage.getItem(`valoria_welcome_${user.id}`)
        if (hoursSinceCreated < FIRST_TIME_WINDOW_HOURS && !seenThisSession) {
          setShowWelcome(true)
        }
      }

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

  function dismissWelcome() {
    setShowWelcome(false)
    if (typeof window !== 'undefined' && user) {
      sessionStorage.setItem(`valoria_welcome_${user.id}`, '1')
    }
  }

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
  const firstName = profile.display_name ? profile.display_name.split(' ')[0] : (isSupply ? 'there' : 'there')
  const completenessPct = isSupply ? computeCompleteness(profile, isSpeaker) : null

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: "'Raleway', 'Helvetica Neue', Arial, sans-serif", color: PARCHMENT }}>

      {showWelcome && (
        <WelcomeModal
          firstName={firstName}
          isSupply={isSupply}
          isSpeaker={isSpeaker}
          isOrganiser={isOrganiser}
          pct={completenessPct}
          onClose={dismissWelcome}
        />
      )}

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

// ── Welcome modal ────────────────────────────────────────────────────────────
// Three beats, staged rather than dumped at once: achievement → belonging →
// opportunity. Auto-advances, but every control also works by hand so it
// never traps anyone or fights prefers-reduced-motion.

function WelcomeModal({ firstName, isSupply, isSpeaker, isOrganiser, pct, onClose }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const beats = isSupply ? [
    {
      eyebrow: 'PROFILE LIVE',
      title: `You did it, ${firstName}.`,
      body: `${pct}% complete — your profile is officially part of the Valoria marketplace.`,
      icon: '✓',
    },
    {
      eyebrow: "YOU'RE IN GOOD COMPANY",
      title: 'Welcome to Valoria.',
      body: 'Every professional here is independently assessed. You\'re not just listed — you\'re verified.',
      icon: '◈',
    },
    {
      eyebrow: 'WHAT HAPPENS NEXT',
      title: 'Buyers are browsing right now.',
      body: 'Your next introduction could land today. We\'ll let you know the moment someone reaches out.',
      icon: '→',
    },
  ] : [
    {
      eyebrow: "YOU'RE IN",
      title: `Welcome, ${firstName}.`,
      body: 'Your account is set up and ready to go.',
      icon: '✓',
    },
    {
      eyebrow: 'WHAT YOU HAVE ACCESS TO',
      title: 'Welcome to Valoria.',
      body: `You now have access to Africa's independently verified ${isOrganiser ? 'speaker' : 'professional'} network.`,
      icon: '◈',
    },
    {
      eyebrow: 'READY WHEN YOU ARE',
      title: 'Find your first match.',
      body: `Search the marketplace and send your first enquiry — most ${isOrganiser ? 'speakers' : 'professionals'} respond within days.`,
      icon: '→',
    },
  ]

  const isLast = step === beats.length - 1
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // mount transition
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (isLast || reducedMotion) return
    timerRef.current = setTimeout(() => setStep(s => Math.min(s + 1, beats.length - 1)), 3800)
    return () => clearTimeout(timerRef.current)
  }, [step, isLast, reducedMotion])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 200)
  }
  function next() {
    clearTimeout(timerRef.current)
    if (isLast) handleClose()
    else setStep(s => s + 1)
  }

  const beat = beats[step]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Valoria"
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,15,26,.82)', backdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0, transition: 'opacity .25s ease',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '420px',
        background: `linear-gradient(160deg, ${MIDNIGHT} 0%, ${DARK} 100%)`,
        border: '1px solid rgba(201,168,76,.22)',
        borderRadius: '14px',
        padding: '40px 32px 32px',
        position: 'relative',
        boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(.98)',
        transition: 'transform .3s ease',
      }}>
        <button
          onClick={handleClose}
          aria-label="Skip"
          style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', color: 'rgba(247,244,238,.35)', fontSize: '11px', letterSpacing: '.08em', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          SKIP
        </button>

        <div key={step} style={{ animation: reducedMotion ? 'none' : 'vi-welcome-in .45s ease' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            border: `1px solid rgba(201,168,76,.35)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: GOLD, marginBottom: '22px',
            background: 'rgba(201,168,76,.06)',
          }}>
            {beat.icon}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.18em', color: 'rgba(201,168,76,.6)', marginBottom: '10px' }}>
            {beat.eyebrow}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 300, color: PARCHMENT, margin: '0 0 12px', lineHeight: 1.25 }}>
            {beat.title}
          </h2>
          <p style={{ fontSize: '14px', color: DIM, fontWeight: 300, lineHeight: 1.7, margin: 0 }}>
            {beat.body}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {beats.map((_, i) => (
              <div key={i} style={{
                width: i === step ? '18px' : '6px', height: '4px', borderRadius: '2px',
                background: i === step ? GOLD : 'rgba(201,168,76,.2)',
                transition: 'width .25s ease',
              }} />
            ))}
          </div>
          <button
            onClick={next}
            style={{
              padding: '11px 22px', background: isLast ? GOLD : 'transparent',
              color: isLast ? DARK : PARCHMENT,
              border: isLast ? 'none' : '1px solid rgba(201,168,76,.3)',
              borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '.1em',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isLast ? (isSupply ? 'EXPLORE YOUR DASHBOARD' : 'BROWSE THE MARKETPLACE') : 'CONTINUE'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes vi-welcome-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ProfileCompleteness({ profile, isSpeaker }) {
  const pct = computeCompleteness(profile, isSpeaker)
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
