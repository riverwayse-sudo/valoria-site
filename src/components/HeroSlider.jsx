import Link from 'next/link'

export default function HeroSlider() {
  return (
    <section className="hero hero-slider hero-institutional" id="hero" aria-labelledby="valoria-hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-slides">
        <div className="hero-slide is-active">
          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">VALORIA INSTITUTE · NIGERIA-ROOTED. AFRICA-FOCUSED.</span>
              </div>
              <h1 className="hero-title" id="valoria-hero-title">
                Capability deserves<br />
                <em>a clearer signal.</em>
              </h1>
              <p className="hero-sub hero-institutional-sub">
                Valoria brings together the PRIME framework, the VALU Index and capability-led professional profiles to help people understand and present their strengths—and help employers, event organisers and programme teams discover relevant expertise.
              </p>
              <div className="hero-actions">
                <Link href="/valu" className="btn-gold">
                  UNDERSTAND YOUR CAPABILITY <span aria-hidden="true">→</span>
                </Link>
                <Link href="/atb-connect" className="btn-outline">
                  FOR EMPLOYERS &amp; ORGANISERS <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="hero-institutional-note">For professionals, employers, event organisers, facilitators and institutions.</p>
            </div>

            <aside className="hero-institutional-panel" aria-label="Valoria's professional capability approach">
              <div className="hero-institutional-panel-head">
                <span>THE VALORIA APPROACH</span>
                <strong>WORTH. BUILT.</strong>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">01</span>
                <div>
                  <small>CAPABILITY FRAMEWORK</small>
                  <strong>PRIME</strong>
                  <p>A structured framework across five dimensions of professional capability.</p>
                </div>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">02</span>
                <div>
                  <small>ASSESSMENT &amp; INDEX</small>
                  <strong>VALU Index</strong>
                  <p>An assessment-led view of capability, expressed in points.</p>
                </div>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">03</span>
                <div>
                  <small>PROFESSIONAL PROFILES</small>
                  <strong>Capability-led records</strong>
                  <p>Profiles that bring assessment-informed strengths and experience into view.</p>
                </div>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">04</span>
                <div>
                  <small>OPPORTUNITY PATHWAYS</small>
                  <strong>Talent · Speakers · Facilitators</strong>
                  <p>Clear routes for buyers to explore expertise and make enquiries.</p>
                </div>
              </div>
              <div className="hero-institutional-panel-foot">
                <span>UNDERSTAND</span><i>→</i><span>DEVELOP</span><i>→</i><span>CONNECT</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
