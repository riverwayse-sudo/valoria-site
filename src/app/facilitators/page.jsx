import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { COLORS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Commission Facilitators — Valoria Develop',
  description: 'Commission PRIME-certified facilitators to run development programmes for your teams. PRIME is the capability architecture — Valoria-certified facilitators are its delivery engine.',
}

const color = COLORS.teal

export default function FacilitatorsPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" style={{ color }}>03 &nbsp;&middot;&nbsp; FOR TRAINING BUYERS</span></div>
            <h1 className="page-title">Don&apos;t train on theory.<br /><em>Train on the framework.</em></h1>
            <p className="page-sub">
              Valoria Develop is the facilitator modality of the marketplace. Commission PRIME-certified facilitators to run development programmes for your teams, built directly on the same five-cluster standard the VALU Index measures against.
            </p>
            <div className="page-hero-actions">
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">COMMISSION FACILITATORS</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ASSESSMENT TO DEVELOPMENT</span></div>
              <h2 className="section-title">PRIME is the architecture.<br /><em>Facilitators are the delivery.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                Most corporate training runs on generic content, disconnected from how anyone is actually measured afterward. Valoria-certified facilitators teach to the same five PRIME clusters your team&apos;s VALU Index scores them on — so development closes the exact gaps the assessment surfaced.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Facilitators certified directly against the PRIME framework',
                  'Programmes mapped to the same five clusters as the VALU Index',
                  'Commission for a single team or a full cohort',
                  'Track movement on the same standard before and after the programme',
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
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">FOR TRAINING BUYERS</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Develop your team<br /><em>against the standard.</em></h2>
            <p className="page-sub">Valoria Develop is live on the assessment platform. Create an account to start browsing certified facilitators.</p>
            <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">COMMISSION FACILITATORS</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
