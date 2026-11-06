import MarketplaceCTA from './MarketplaceCTA'
import { AssessmentStartLink } from './Nav'
import { BRAND } from '@/lib/brand'

export default function HeroSlider() {
  return (
    <section className="hero hero-slider" id="hero" aria-labelledby="valoria-hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides">
        <div className="hero-slide is-active">
          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">AFRICA’S HUMAN CAPITAL INSTITUTION</span>
              </div>
              <h1 className="hero-title" id="valoria-hero-title">
                Talent is not the problem.<br />
                <em>Infrastructure is.</em>
              </h1>
              <p className="hero-sub">
                Valoria Institute is building the infrastructure through which African professional capability is assessed, developed, recognised and connected to opportunity.
              </p>
              <div className="hero-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">
                  DISCOVER YOUR VALU INDEX <span aria-hidden="true">→</span>
                </AssessmentStartLink>
                <MarketplaceCTA className="btn-outline">
                  EXPLORE THE AFRICAN TALENT BUREAU <span aria-hidden="true">→</span>
                </MarketplaceCTA>
              </div>
            </div>

            <aside className="hero-system-card" aria-label="How Valoria connects professional merit to opportunity">
              <div className="hero-system-kicker">THE VALORIA SYSTEM</div>
              <h2>Professional merit, made actionable.</h2>
              <ol className="hero-system-steps">
                <li>
                  <span>01</span>
                  <div><strong>Understand capability</strong><small>Gain a structured view through the VALU Index.</small></div>
                </li>
                <li>
                  <span>02</span>
                  <div><strong>Develop with intention</strong><small>Build capability through the PRIME framework.</small></div>
                </li>
                <li>
                  <span>03</span>
                  <div><strong>Make merit visible</strong><small>Present professional capability with context.</small></div>
                </li>
                <li>
                  <span>04</span>
                  <div><strong>Connect to opportunity</strong><small>Be discovered through the African Talent Bureau.</small></div>
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
