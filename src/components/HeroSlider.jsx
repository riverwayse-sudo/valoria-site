import Link from 'next/link'
import { AssessmentStartLink } from '@/components/Nav'
import { BRAND } from '@/lib/brand'

export default function HeroSlider() {
  return (
    <section className="hero hero-slider hero-institutional vi-editorial-hero" id="hero" aria-labelledby="valoria-hero-title">
      <div className="vi-hero-image" aria-hidden="true" />
      <div className="vi-hero-shade" aria-hidden="true" />
      <div className="vi-hero-grain" aria-hidden="true" />
      <div className="vi-hero-content">
        <div className="vi-hero-copy">
          <div className="vi-hero-kicker"><span /> AN INSTITUTION FOR PROFESSIONAL CAPABILITY</div>
          <h1 id="valoria-hero-title">Capability deserves <em>a higher standard.</em></h1>
          <p>For accomplished professionals and the organizations that rely on their judgment, Valoria brings structure to how capability is assessed, developed and discovered.</p>
          <div className="vi-hero-actions">
            <AssessmentStartLink href={BRAND.assessmentUrl} className="vi-hero-primary">Explore your capability <span>↗</span></AssessmentStartLink>
            <Link href="/prime" className="vi-hero-secondary">Explore the framework <span>→</span></Link>
          </div>
          <div className="vi-hero-footnote">WORTH. BUILT. — CAPABILITY, CONSIDERED WITH INTENT.</div>
        </div>
        <div className="vi-hero-art" role="group" aria-label="PRIME framework: Presence, Relationships, Intelligence, Mastery and Enterprise">
          <div className="vi-hero-art-photo" role="img" aria-label="Portrait of an African professional. Photograph by Taiye Salawu via Pexels" />
          <div className="vi-hero-art-index"><span>VALORIA INSTITUTE</span><span>01 / 05</span></div>
          <div className="vi-hero-art-content">
            <div className="vi-hero-art-top"><span>THE PRIME FRAMEWORK</span><span>CAPABILITY, CONSIDERED</span></div>
            <div className="vi-prime-word" aria-hidden="true">PRIME</div>
            <div className="vi-prime-labels">
              <span>Presence</span><span>Relationships</span><span>Intelligence</span><span>Mastery</span><span>Enterprise</span>
            </div>
            <div className="vi-hero-art-bottom">
              <div><span>VALU INDEX</span><strong>Capability, made legible.</strong></div>
              <Link href="/prime" aria-label="Explore the PRIME framework">Explore <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <div className="vi-hero-art-stamp" aria-hidden="true">WORTH.<br />BUILT.</div>
        </div>
      </div>
      <div className="vi-hero-index"><span>VALORIA INSTITUTE</span><span>GLOBAL OUTLOOK · CLEAR OPERATING BOUNDARIES</span></div>
    </section>
  )
}
