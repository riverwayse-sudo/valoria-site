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
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR EMPLOYERS & ORGANIZATIONS</span></div>
            <h1 className="page-title">Find the right professional<br /><em>for the work ahead.</em></h1>
            <p className="page-sub">Valoria helps employers and organizations find experienced professionals whose skills and experience fit a role or project. We support hiring leaders and institutions considering consequential appointments. Where a professional chooses to share a VALU Index result, it provides optional context—not a hiring recommendation. It does not replace independent due diligence, credential checks, references or professional judgment. Only professionals with approved public profiles are available to explore.</p>
            <div className="page-hero-actions">
              <a href="/contact-us?topic=ATB%20Connect" className="btn-gold">DISCUSS YOUR TALENT NEEDS</a>
              <a href="/marketplace/talent" className="btn-outline">EXPLORE PROFESSIONALS</a>
            </div>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR INSTITUTIONAL AND TALENT DECISION-MAKERS</span></div>
              <h2 className="section-title">Consider more than<br /><em>the résumé.</em></h2>
              <p className="page-copy">ATB Connect helps employers and organizations explore professional experience, skills and suitability alongside the needs of a specific role.</p>
            </Reveal>
            <Reveal>
              <div className="facilitator-diff-list">
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">Capability context</div><p className="facilitator-diff-copy">Where a professional has chosen to share a VALU Index result, use it as additional context—not as a hiring decision or a substitute for due diligence.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">Relevant experience</div><p className="facilitator-diff-copy">Consider the sector, seniority and professional experience supplied in the public profile.</p></div></div>
                <div className="facilitator-diff"><div className="facilitator-dot" /><div><div className="facilitator-diff-title">A considered next step</div><p className="facilitator-diff-copy">Explore available professional profiles or speak with Valoria about your requirements.</p></div></div>
              </div>
            </Reveal>
          </div>
        </section>
        <section className="page-section alt">
          <Reveal>
            <h2 className="section-title">Make consequential appointments<br /><em>with better context.</em></h2>
            <p className="page-sub">Tell us about the role, the experience you need and the kind of support you are looking for. We will discuss suitable next steps based on the professionals currently available.</p>
            <div className="page-hero-actions"><a href="/contact-us?topic=ATB%20Connect" className="btn-gold">TALK TO VALORIA</a></div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
