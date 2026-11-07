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
                <span className="hero-eyebrow-text">AFRICA'S HUMAN CAPITAL INSTITUTION</span>
              </div>
              <h1 className="hero-title" id="valoria-hero-title">
                Talent is not the problem.<br />
                <em>Infrastructure is.</em>
              </h1>
              <p className="hero-sub hero-institutional-sub">
                Valoria builds the infrastructure through which African professional capability is understood, developed, surfaced and connected to opportunity. We bring a shared capability framework, an assessment-led index, structured development and a talent bureau into one institutional system.
              </p>
              <div className="hero-actions">
                <Link href="/contact-us" className="btn-gold">
                  DISCUSS AN INSTITUTIONAL PARTNERSHIP <span aria-hidden="true">→</span>
                </Link>
                <Link href="/marketplace" className="btn-outline">
                  EXPLORE THE AFRICAN TALENT BUREAU <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="hero-institutional-note">For employers, institutions, programme leaders and event organisers.</p>
            </div>

            <aside className="hero-institutional-panel" aria-label="Valoria Institute operating architecture">
              <div className="hero-institutional-panel-head">
                <span>THE VALORIA SYSTEM</span>
                <strong>WORTH. BUILT.</strong>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">01</span>
                <div>
                  <small>CAPABILITY FRAMEWORK</small>
                  <strong>PRIME</strong>
                  <p>A shared framework for five dimensions of professional capability.</p>
                </div>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">02</span>
                <div>
                  <small>ASSESSMENT &amp; INDEX</small>
                  <strong>VALU Index</strong>
                  <p>An assessment-led view of professional capability, expressed in points.</p>
                </div>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">03</span>
                <div>
                  <small>TALENT BUREAU</small>
                  <strong>African Talent Bureau</strong>
                  <p>Capability-led pathways to talent, speakers and facilitators.</p>
                </div>
              </div>
              <div className="hero-institutional-pillar">
                <span className="hero-institutional-index">04</span>
                <div>
                  <small>CAPABILITY DEVELOPMENT</small>
                  <strong>Valoria Develop</strong>
                  <p>Structured development for professionals and organisations.</p>
                </div>
              </div>
              <div className="hero-institutional-panel-foot">
                <span>ASSESS</span><i>→</i><span>DEVELOP</span><i>→</i><span>CONNECT</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
