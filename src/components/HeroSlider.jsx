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
          <h1 id="valoria-hero-title">Make your<br /><em>capability</em> count.</h1>
          <p>Understand what you bring. Build what comes next. Be discovered for what you can do.</p>
          <div className="vi-hero-actions">
            <AssessmentStartLink href={BRAND.assessmentUrl} className="vi-hero-primary">Discover your capability <span aria-hidden="true">↗</span></AssessmentStartLink>
            <Link href="/marketplace" className="vi-hero-secondary">Explore the marketplace <span aria-hidden="true">→</span></Link>
          </div>
          <div className="vi-hero-footnote">ROOTED IN AFRICA. STARTING IN NIGERIA.</div>
        </div>
        <aside className="vi-hero-art" aria-label="The five PRIME dimensions: Presence, Relationships, Intelligence, Mastery and Enterprise">
          <div className="vi-hero-art-orbit" aria-hidden="true" />
          <div className="vi-hero-art-top"><span>THE PRIME FRAMEWORK</span><span>01 — 05</span></div>
          <div className="vi-prime-word" aria-hidden="true"><span>P</span><span>R</span><span>I</span><span>M</span><span>E</span></div>
          <div className="vi-prime-labels"><span>Presence</span><span>Relationships</span><span>Intelligence</span><span>Mastery</span><span>Enterprise</span></div>
          <div className="vi-hero-art-bottom"><span>VALU INDEX</span><strong>Capability, made legible.</strong><Link href="/prime">Explore the standard <span aria-hidden="true">↗</span></Link></div>
          <div className="vi-hero-art-index" aria-hidden="true">P / R / I / M / E</div>
        </aside>
      </div>
      <div className="vi-hero-index"><span>VALORIA INSTITUTE</span><span>LAGOS · AFRICA</span></div>
    </section>
  )
}
