import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { COLORS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'ATB Spotlight — Book Assessed Speakers',
  description: 'Discover and book speakers by expertise, tier designation, and VALU Index. The same faces don\'t have to be the only ones at every conference.',
}

const color = COLORS.gold

export default function SpotlightPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" style={{ color }}>02 &nbsp;&middot;&nbsp; FOR EVENT ORGANISERS</span></div>
            <h1 className="page-title">Find the speaker<br /><em>nobody else booked yet.</em></h1>
            <p className="page-sub">
              ATB Spotlight is the speaker modality of the Valoria marketplace. Search by expertise, sector, and VALU Index score to find voices beyond the usual conference circuit — every one of them independently assessed.
            </p>
            <div className="page-hero-actions">
              <a href="/marketplace?mode=speaker" className="btn-gold">FIND A SPEAKER</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">BEYOND THE USUAL CIRCUIT</span></div>
              <h2 className="section-title">Reputation got them<br />the stage. <em>Capability keeps them there.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Most speaker rosters are built on who organisers already know. Spotlight surfaces who can actually deliver — ranked by an assessed standard rather than name recognition alone, so your programme isn&apos;t the same five names every season.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Filter by expertise, sector, tier designation, and VALU Index score',
                  'Every speaker independently assessed across all five PRIME clusters',
                  'Built for organisers who want range, not the same recycled lineup',
                  'Reach out directly once a profile fits your programme',
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

        <section className="page-section alt cta-banner">
          <Reveal>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">FOR EVENT ORGANISERS</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Build a lineup<br /><em>worth attending for.</em></h2>
            <p className="page-sub">Browse the speaker roster free — no account required. Create an account when you&apos;re ready to send a booking enquiry.</p>
            <a href="/marketplace?mode=speaker" className="btn-gold">FIND A SPEAKER</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
