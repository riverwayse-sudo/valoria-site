import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import '../pages.css'

export const metadata = {
  title: 'ATB Connect | Executive and Specialist Talent Discovery',
  description: 'Explore accomplished professionals through structured capability profiles, relevant experience and assessment context.',
  alternates: { canonical: 'https://valoriainstitute.com/atb-connect' },
}

export default function ATBConnectPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="decision-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ATB CONNECT · FOR EMPLOYERS</span></div>
            <h1 className="page-title">A more considered view<br /><em>of professional capability.</em></h1>
            <p className="page-sub">For organizations making consequential appointments, ATB Connect brings structured capability profiles, relevant experience, sector and seniority into one considered view. VALU assessment context may inform discovery; it does not replace independent diligence, credential checks, references or professional judgment.</p>
            <div className="page-hero-actions">
              <a href="/contact-us?topic=ATB%20Connect" className="btn-gold">REQUEST BUYER ACCESS</a>
              <a href="/marketplace/talent" className="btn-outline">EXPLORE TALENT</a>
            </div>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR INSTITUTIONAL AND TALENT DECISION-MAKERS</span></div>
              <h2 className="section-title">Consider more than<br /><em>the résumé.</em></h2>
              <p className="page-copy">ATB Connect is the employer pathway into the Valoria Marketplace. It is designed for hiring leaders and institutions that need to consider capability alongside experience, context and the requirements of a specific role.</p>
            </Reveal>
            <Reveal>
              <div className="facilitator-diff-list">
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">Capability context</div><p className="facilitator-diff-copy">Review the professional's assessment-informed summary and VALU points where a completed assessment and public visibility permit. Treat these as structured context—not a hiring decision or a substitute for due diligence.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">Relevant experience</div><p className="facilitator-diff-copy">Consider the sector, seniority and professional experience supplied in the public profile.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">A considered next step</div><p className="facilitator-diff-copy">Request buyer access or explore public talent profiles where relevant profiles are available.</p></div></div>
              </div>
            </Reveal>
          </div>
        </section>
        <section className="page-section alt">
          <Reveal>
            <h2 className="section-title">Make consequential appointments<br /><em>with better context.</em></h2>
            <p className="page-sub">Share the mandate, level of responsibility, capability requirements and context for the appointment. Buyer access and search support are discussed directly; availability depends on the approved public roster.</p>
            <div className="page-hero-actions"><a href="/contact-us?topic=ATB%20Connect" className="btn-gold">REQUEST ACCESS</a></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
