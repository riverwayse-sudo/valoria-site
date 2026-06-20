import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { COLORS } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'ATB Connect — Search Assessed African Talent',
  description: 'Search pre-assessed candidates by VALU Index score, cluster strength, sector, and designation. Hire with intelligence, not with hope.',
}

const color = COLORS.blue

export default function AtbConnectPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text" style={{ color }}>01 &nbsp;&middot;&nbsp; FOR EMPLOYERS</span></div>
            <h1 className="page-title">Hire on evidence,<br /><em>not on instinct.</em></h1>
            <p className="page-sub">
              ATB Connect is the candidate modality of the Valoria marketplace. Every professional you search has already been through the VALU Index — so you&apos;re comparing assessed capability, not curated résumés.
            </p>
            <div className="page-hero-actions">
              <a href="/marketplace?mode=talent" className="btn-gold">SEARCH TALENT</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHY ASSESSED, NOT CURATED</span></div>
              <h2 className="section-title">The CV tells you<br />what someone <em>claims.</em></h2>
              <p style={{ color: 'var(--dim)', fontWeight: 300, lineHeight: 1.8, fontSize: '15px' }}>
                The VALU Index tells you what they can actually do across five capability clusters. Every profile on ATB Connect carries a live score, a tier designation, and a cluster breakdown — so shortlisting starts from evidence instead of a polished résumé.
              </p>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Filter by VALU Index score, cluster strength, sector, and tier designation',
                  'Every candidate independently assessed — no self-reported skill claims',
                  'Compare candidates on the same five-cluster standard, side by side',
                  'Reach out directly once a profile matches your role',
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
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">FOR EMPLOYERS</span><div className="eyebrow-line" /></div>
            <h2 className="section-title">Start searching<br /><em>assessed talent.</em></h2>
            <p className="page-sub">Browse the talent pool free — no account required. Create an account when you&apos;re ready to message a candidate directly.</p>
            <a href="/marketplace?mode=talent" className="btn-gold">SEARCH TALENT</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
