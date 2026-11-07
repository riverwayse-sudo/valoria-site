import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'ATB Connect | Capability-Led Talent Discovery',
  description: 'Discover professionals through structured capability profiles, VALU points and relevant experience.',
  alternates: { canonical: 'https://valoriainstitute.com/atb-connect' },
}

export default function ATBConnectPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ATB CONNECT · FOR EMPLOYERS</span></div>
            <h1 className="page-title">Precision hiring.<br /><em>Not CV triage.</em></h1>
            <p className="page-sub">Explore professionals through structured profiles that bring capability, VALU points, sector and seniority into context. Make a more informed shortlist without relying on a CV alone.</p>
            <div className="page-hero-actions">
              <a href="/contact-us?topic=ATB%20Connect" className="btn-gold">REQUEST BUYER ACCESS</a>
              <a href="/marketplace/talent" className="btn-outline">EXPLORE TALENT</a>
            </div>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">A CLEARER VIEW OF CAPABILITY</span></div>
              <h2 className="section-title">Look beyond<br /><em>the CV.</em></h2>
              <p className="page-copy">ATB Connect is the employer pathway into the Valoria Marketplace. It is designed to make professional capability easier to explore alongside experience and role context.</p>
            </Reveal>
            <Reveal>
              <div className="facilitator-diff-list">
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">Capability context</div><p className="facilitator-diff-copy">Explore the professional's assessment-informed summary and VALU points where a completed assessment and public visibility permit.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">Relevant experience</div><p className="facilitator-diff-copy">Review sector, seniority and professional experience supplied in the profile.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">A considered next step</div><p className="facilitator-diff-copy">Request access or explore public talent profiles where relevant inventory is available.</p></div></div>
              </div>
            </Reveal>
          </div>
        </section>
        <section className="page-section alt cta-banner">
          <Reveal>
            <h2 className="section-title">Hire with<br /><em>more context.</em></h2>
            <p className="page-sub">Tell us about the roles, capability areas and experience your organisation needs. Buyer access and search support are discussed directly.</p>
            <div className="page-hero-actions eyebrow-center"><a href="/contact-us?topic=ATB%20Connect" className="btn-gold">REQUEST ACCESS</a></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
