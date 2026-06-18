import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'Become a Certified Facilitator',
  description: 'Get PRIME-certified and deliver development programmes through Valoria Develop.',
}

export default function DevelopPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR FACILITATORS &amp; TRAINERS</span></div>
            <h1 className="page-title">Get certified.<br /><em>Get commissioned.</em></h1>
            <p className="page-sub">
              Valoria Develop runs on PRIME-certified facilitators. Certification puts you in front of every training buyer searching Valoria Develop for programmes mapped to the framework.
            </p>
            <div className="page-hero-actions">
              <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">START CERTIFICATION</a>
              <a href="/prime" className="btn-outline">SEE THE PRIME FRAMEWORK</a>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">HOW CERTIFICATION WORKS</span></div>
              <h2 className="section-title">Three steps to<br /><em>delivering on PRIME.</em></h2>
            </Reveal>
            <Reveal>
              <ul className="checklist" role="list">
                {[
                  'Take the VALU Index to establish your own baseline across all five clusters',
                  'Complete facilitator certification on the cluster(s) you want to teach',
                  'Get listed on Valoria Develop, searchable by training buyers commissioning programmes',
                ].map((t, i) => (
                  <li key={i}>
                    <span className="dot"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Ready to teach<br /><em>the framework?</em></h2>
            <p className="page-sub">Certification starts with your own VALU Index assessment.</p>
            <a href="https://assessment.valoriainstitute.com/" className="btn-gold" target="_blank" rel="noopener noreferrer">START CERTIFICATION</a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
