'use client'

import { AssessmentStartLink } from '@/components/Nav'

export default function HeroSlider() {
  return (
    <section className="hero hero-slider" id="hero" aria-label="Valoria Institute introduction">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides">
        <div className="hero-slide is-active">
          <div className="container hero-inner">
            <div>
              <div className="hero-eyebrow au d1"><div className="hero-eyebrow-line" /><span className="hero-eyebrow-text">THE INSTITUTIONAL STANDARD FOR PROFESSIONAL CAPABILITY</span></div>
              <h1 className="hero-title au d2">Capability should decide<br />who gets seen.<br /><em>Valoria sets the standard.</em></h1>
              <p className="hero-sub au d3">Valoria Institute establishes a structured standard for understanding professional capability. Through assessment, PRIME-based development and connected pathways to professional visibility and opportunity, it helps individuals and organisations make capability clearer and more actionable.</p>
              <div className="hero-actions au d4"><AssessmentStartLink href="/valu/register/?journey=valu_taster" className="btn-gold">CREATE ACCOUNT TO BEGIN</AssessmentStartLink><a href="/valu#how-it-works" className="btn-outline">SEE HOW IT WORKS</a></div>
              <div className="hero-mobile-card au d5" aria-hidden="true"><div className="hmc-row"><div className="hmc-score">VALU <small style={{fontSize:10,letterSpacing:'.08em'}}>INDEX</small></div><div className="hmc-right"><div className="hmc-desig">POINTS-BASED CAPABILITY PROFILE</div><div className="hmc-bars"><span>PRIME</span><span>VALU</span></div></div></div></div>
            </div>
            <div className="valu-card au d4" aria-label="The VALU Index structure">
              <div className="vc-label">THE VALU INDEX</div>
              <div className="vc-score"><span className="vc-num">VALU</span><span className="vc-denom">INDEX</span></div>
              <div className="vc-desig">POINTS-BASED CAPABILITY PROFILE</div>
              <div className="vc-cluster-list"><span>Presence</span><span>Relationships</span><span>Intelligence</span><span>Mastery</span><span>Enterprise</span></div>
              <div className="vc-foot">PRIME framework · results expressed in points</div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>Scroll</span><svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
    </section>
  )
}
