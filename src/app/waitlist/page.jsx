import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Founding Cohort Waitlist',
  description: 'Join the founding cohort of professionals, employers, and event organisers shaping the Valoria marketplace from day one.',
}

export default function WaitlistPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOUNDING COHORT</span></div>
            <h1 className="page-title">Get in before<br />the <em>marketplace fills up.</em></h1>
            <p className="page-sub">
              The founding cohort gets first access to the marketplace, priority placement once it opens to general search, and a direct line to shape how Valoria develops.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Early access ahead of general marketplace launch',
                  'Priority placement in search results once live',
                  'Direct input into how ATB Connect, Spotlight, and Develop evolve',
                  'First to know when new sectors and regions open',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="dot"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal>
              <div className="bridge-card" style={{ margin: 0, textAlign: 'left' }}>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">JOIN THE WAITLIST</span></div>
                <p style={{ color: 'var(--dim)', fontWeight: 300, fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                  Email us directly with &ldquo;Founding Cohort&rdquo; and your name, location, and which entry point you&apos;re interested in — candidate, speaker, facilitator, employer, or organiser.
                </p>
                <a href={`mailto:${BRAND.email}?subject=Founding%20Cohort%20Waitlist`} className="btn-gold" style={{ width: '100%', textAlign: 'center' }}>
                  JOIN THE WAITLIST
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
