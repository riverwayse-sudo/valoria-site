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
                <span className="hero-eyebrow-text">AN INTERNATIONAL PROFESSIONAL CAPABILITY INSTITUTION</span>
              </div>
              <h1 className="hero-title" id="valoria-hero-title">
                Your professional worth<br />
                deserves to be <em>understood.</em>
              </h1>
              <p className="hero-sub">
                Valoria Institute helps people understand, develop and demonstrate their professional capabilities — connecting expertise with meaningful opportunities across industries and borders.
              </p>
              <div className="hero-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">
                  DISCOVER YOUR CAPABILITIES <span aria-hidden="true">→</span>
                </AssessmentStartLink>
                <MarketplaceCTA className="btn-outline">
                  EXPLORE THE TALENT MARKETPLACE <span aria-hidden="true">→</span>
                </MarketplaceCTA>
              </div>
            </div>

            <aside className="hero-stage" aria-label="Valoria's five PRIME capability dimensions">
              <div className="hero-stage-top"><span>THE PRIME FRAMEWORK</span><span>VALU INDEX</span></div>
              <div className="hero-stage-core">
                <div className="hero-stage-orbit hero-stage-orbit-one" />
                <div className="hero-stage-orbit hero-stage-orbit-two" />
                <div className="hero-stage-v" aria-hidden="true">V</div>
                <div className="hero-stage-node hero-stage-node-one">P</div>
                <div className="hero-stage-node hero-stage-node-two">R</div>
                <div className="hero-stage-node hero-stage-node-three">I</div>
                <div className="hero-stage-node hero-stage-node-four">M</div>
                <div className="hero-stage-node hero-stage-node-five">E</div>
                <div className="hero-stage-caption">WORTH.<br/><em>BUILT.</em></div>
              </div>
              <div className="hero-stage-clusters">
                <div><b>01</b><span>Presence</span></div>
                <div><b>02</b><span>Relationships</span></div>
                <div><b>03</b><span>Intelligence</span></div>
                <div><b>04</b><span>Mastery</span></div>
                <div><b>05</b><span>Enterprise</span></div>
              </div>
              <div className="hero-stage-foot"><span>CAPABILITY</span><i>→</i><span>EVIDENCE</span><i>→</i><span>OPPORTUNITY</span></div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
