import Link from 'next/link'
import { AssessmentStartLink } from '@/components/Nav'
import { BRAND } from '@/lib/brand'

export default function HeroSlider() {
  return (
    <section className="hero hero-slider hero-institutional" id="hero" aria-labelledby="valoria-hero-title">
      <div className="hero-bg" data-parallax-speed="0.12" aria-hidden="true" />
      <div className="hero-grid" data-parallax-speed="0.055" aria-hidden="true" />
      <div className="hero-slides">
        <div className="hero-slide is-active">
          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">AFRICA'S TALENT MARKETPLACE FOR PROFESSIONALS</span>
              </div>
              <h1 className="hero-title" id="valoria-hero-title">
                Capability should decide<br />
                <em>who gets seen.</em>
              </h1>
              <p className="hero-sub hero-institutional-sub">
                Valoria is the room where professionals can understand their capabilities, develop where needed and become visible to employers, event organisers and training buyers in the markets it serves.
              </p>
              <div className="hero-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">
                  START THE VALU TASTER <span aria-hidden="true">→</span>
                </AssessmentStartLink>
                <Link href="/valu" className="btn-outline">
                  SEE HOW IT WORKS <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="hero-institutional-note">For professionals, employers, event organisers and facilitators.</p>
            </div>

            <aside className="hero-institutional-panel" aria-label="Valoria professional marketplace architecture">
              <div className="hero-institutional-panel-head">
                <span>THE VALORIA MARKETPLACE</span>
                <strong>{BRAND.tagline.toUpperCase()}</strong>
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
                  <small>PROFESSIONAL DISCOVERY</small>
                  <strong>Valoria Marketplace</strong>
                  <p>Capability-led pathways to professionals, speakers and facilitators.</p>
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
