'use client'
import { BRAND } from '@/lib/brand'
import MarketplaceCTA from './MarketplaceCTA'

// Webinar slide (18 July launch event) and the in-hero waitlist form have
// been removed now that focus is back on the assessment as the primary CTA
// — the webinar is long over and the waitlist form's #waitlist anchor no
// longer exists on the page post-launch, so both had gone dead/stale.
// Single hero, assessment-first. If a second rotating slide is wanted again
// later, reintroduce it as its own explicit thing rather than reviving this.

export default function HeroSlider() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides">
        <div className="hero-slide is-active">
          <div className="container hero-inner">
            <div>
              <div className="hero-eyebrow au d1" aria-hidden="true">
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">THE AFRICAN PROFESSIONAL MARKETPLACE</span>
              </div>

              <h1 className="hero-title au d2">
                Valoria is where<br />African professionals<br /><em>rise.</em>
              </h1>

              <p className="hero-sub au d3">
                One marketplace. Three ways to engage Africa&apos;s best professionals. Search candidates, book speakers, commission facilitators — every profile underwritten by one independently assessed standard.
              </p>

              <div className="hero-actions au d4">
                <a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                  TAKE THE VALU INDEX — FREE
                </a>
                <MarketplaceCTA className="btn-outline">
                  EXPLORE THE MARKETPLACE
                </MarketplaceCTA>
              </div>

              <div className="hero-mobile-card au d5" aria-hidden="true">
                <div className="hmc-row">
                  <div className="hmc-score">84</div>
                  <div className="hmc-right">
                    <div className="hmc-desig">FORCE TO ALIGN WITH</div>
                    <div className="hmc-bars">
                      <div className="hmc-bar" style={{ background: '#1D9E75', width: '88%' }} />
                      <div className="hmc-bar" style={{ background: '#378ADD', width: '90%' }} />
                      <div className="hmc-bar" style={{ background: '#7F77DD', width: '82%' }} />
                      <div className="hmc-bar" style={{ background: '#BA7517', width: '80%' }} />
                      <div className="hmc-bar" style={{ background: '#D85A30', width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="valu-card au d4" aria-label="Sample VALU Index profile">
              <div className="vc-label">VALU INDEX &nbsp;&middot;&nbsp; ILLUSTRATIVE PROFILE</div>
              <div className="vc-score">
                <span className="vc-num">84</span>
                <span className="vc-denom">/ 100</span>
              </div>
              <div className="vc-desig">FORCE TO ALIGN WITH</div>
              <div className="vc-modalities">
                <span className="mod-pill" style={{ background: 'rgba(55,138,221,.12)', color: '#378ADD', border: '1px solid rgba(55,138,221,.25)' }}>CANDIDATE</span>
                <span className="mod-pill" style={{ background: 'rgba(201,168,76,.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.25)' }}>SPEAKER</span>
              </div>
              <div className="vc-bars">
                <div className="vb"><span className="vb-l">P</span><div className="vb-bg"><div className="vb-fill" style={{ width: '88%', background: '#1D9E75' }} /></div><span className="vb-s">88</span></div>
                <div className="vb"><span className="vb-l">R</span><div className="vb-bg"><div className="vb-fill" style={{ width: '90%', background: '#378ADD' }} /></div><span className="vb-s">90</span></div>
                <div className="vb"><span className="vb-l">I</span><div className="vb-bg"><div className="vb-fill" style={{ width: '82%', background: '#7F77DD' }} /></div><span className="vb-s">82</span></div>
                <div className="vb"><span className="vb-l">M</span><div className="vb-bg"><div className="vb-fill" style={{ width: '80%', background: '#BA7517' }} /></div><span className="vb-s">80</span></div>
                <div className="vb"><span className="vb-l">E</span><div className="vb-bg"><div className="vb-fill" style={{ width: '75%', background: '#D85A30' }} /></div><span className="vb-s">75</span></div>
              </div>
              <div className="vc-foot">illustrative profile — one identity, two active modalities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
