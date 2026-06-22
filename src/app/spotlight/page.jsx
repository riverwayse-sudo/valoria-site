import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { COLORS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'ATB Spotlight — Book Verified African Speakers',
  description: 'ATB Spotlight connects event organisers with PRIME-assessed African speakers. Filter by expertise, tier, and VALU Index score. Find speakers beyond the usual conference circuit.',
  keywords: ['African speakers', 'book speaker Nigeria', 'keynote speakers Africa', 'speaker marketplace', 'ATB Spotlight', 'VALU Index speakers'],
  openGraph: {
    title: 'ATB Spotlight — Book Verified African Speakers | Valoria Institute',
    description: 'Find speakers assessed across five PRIME clusters. Spotlight surfaces who can deliver — not just who organisers already know.',
    url: 'https://valoriainstitute.com/spotlight',
  },
  alternates: { canonical: 'https://valoriainstitute.com/spotlight' },
}

const color = COLORS.gold

const SPEAKER_TIERS = [
  { tier: 'Tier I — Elite', desc: 'Distinguished VALU Index score with verified keynote experience. International-stage ready.', color: '#C9A84C' },
  { tier: 'Tier II — Established', desc: 'Strong PRIME profile with a track record of conference and corporate speaking engagements.', color: '#7F77DD' },
  { tier: 'Tier III — Emerging', desc: 'High VALU Index score with developing speaking history. Rising voices with assessed credibility behind them.', color: '#378ADD' },
]

const WHAT_ORGANISERS_SEE = [
  { label: 'VALU Index score', desc: 'The same five-cluster score every professional earns through the independent assessment.' },
  { label: 'Speaker tier', desc: 'Elite, Established, or Emerging — assigned through panel review, not self-declaration.' },
  { label: 'Topics and expertise areas', desc: 'What they actually speak on, mapped to the PRIME clusters their score is strongest in.' },
  { label: 'Availability and fee range', desc: 'Whether they\'re open to bookings and what the commercial conversation starts from.' },
  { label: 'Speaker reel', desc: 'Video links so you can hear them speak before you reach out, not after three email rounds.' },
]

export default function SpotlightPage() {
  return (
    <>
      <Nav />
      <main id="main-content">

        {/* HERO */}
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" style={{ color }}>02 &nbsp;&middot;&nbsp; FOR EVENT ORGANISERS</span></div>
            <h1 className="page-title">Find the speaker<br /><em>nobody else booked yet.</em></h1>
            <p className="page-sub">
              ATB Spotlight is the speaker modality of the Valoria marketplace. Search by expertise, sector, and VALU Index score to find voices beyond the usual conference circuit — every one of them independently assessed, tier-designated by panel review.
            </p>
            <div className="page-hero-actions">
              <a href="/marketplace?mode=speaker" className="btn-gold">BROWSE THE SPEAKER ROSTER</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        {/* THE PROBLEM WITH SPEAKER ROSTERS */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM WITH SPEAKER ROSTERS</span></div>
              <h2 className="section-title">Reputation got them<br />the stage. <em>Capability keeps them there.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Most speaker rosters are built on who organisers already know, or who agencies already represent. Which means the same twelve names headline every major African conference, while hundreds of capable voices with higher assessed scores never get a stage. ATB Spotlight surfaces who can actually deliver — ranked by an independently assessed standard, not by name recognition or agency relationships.
              </p>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px', marginTop: '16px' }}>
                Every speaker on the Spotlight roster has been assessed through the VALU Index and tier-designated through a panel review process. You know what you&apos;re booking before you send the first email.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Filter by expertise, sector, tier designation, and VALU Index score',
                  'Every speaker assessed across all five PRIME clusters — not self-declared',
                  'Three speaker tiers: Elite, Established, Emerging — assigned by panel, not by the speaker',
                  'Watch speaker reels before reaching out, not after committing to a call',
                  'Request a booking through the platform — Valoria facilitates the introduction',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="dot"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* WHAT YOU SEE */}
        <section className="page-section alt">
          <div className="page-section-inner">
            <Reveal>
              <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">WHAT EVERY PROFILE SHOWS</span><div className="eyebrow-line" /></div>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Enough information<br /><em>to book with confidence.</em></h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {WHAT_ORGANISERS_SEE.map((w, i) => (
                <Reveal key={i}>
                  <div className="card-gold">
                    <div className="cluster-name" style={{ marginBottom: '10px', fontSize: '14px' }}>{w.label}</div>
                    <p className="cluster-desc">{w.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TIER SYSTEM */}
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">SPEAKER TIERS EXPLAINED</span></div>
              <h2 className="section-title">Three tiers.<br /><em>All independently assessed.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Spotlight tiers are not self-declared. They&apos;re assigned through a panel review process combining VALU Index score with verified speaking track record. A Tier I speaker has earned that designation — it wasn&apos;t unlocked by paying a subscription or filling in a profile.
              </p>
            </Reveal>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {SPEAKER_TIERS.map((t, i) => (
                  <div key={i} className="card-gold" style={{ "--card-color": t.color }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: t.color, marginBottom: '8px' }}>{t.tier}</div>
                    <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">FOR EVENT ORGANISERS</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Build a lineup<br /><em>worth attending for.</em></h2>
            <p className="page-sub">Browse the speaker roster free — no account required. Create an account when you&apos;re ready to send a booking enquiry.</p>
            <div className="page-hero-actions" style={{ justifyContent: 'center' }}>
              <a href="/marketplace?mode=speaker" className="btn-gold">BROWSE THE SPEAKER ROSTER</a>
              <a href="/signup" className="btn-outline">CREATE ORGANISER ACCOUNT</a>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
