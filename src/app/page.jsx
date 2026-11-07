import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import HomepageEvents from '@/components/HomepageEvents'
import HomepageOpportunities from '@/components/HomepageOpportunities'
import { BRAND, PRIME_CLUSTERS } from '@/lib/brand'
import './home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth, Built.',
  description: 'Find professionals by capability. Valoria assesses professional capability through one standard, develops what matters and connects professionals to relevant opportunities. Built in Africa, designed for an international audience.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
}

const pathwayCards = [
  { label: 'FOR PROFESSIONALS', title: 'Understand your capability.', body: 'Start with the taster, complete the full VALU Index and build a professional profile that makes your experience easier to understand.', href: BRAND.assessmentUrl, cta: 'TAKE THE VALU TASTER' },
  { label: 'FOR EMPLOYERS', title: 'Find talent by capability.', body: 'Explore public professional profiles by declared role, sector, skill and VALU evidence. If a suitable talent profile is not currently listed, request an ATB Connect sourcing conversation.', href: '/marketplace/talent', cta: 'OPEN ATB CONNECT' },
  { label: 'FOR EVENT ORGANISERS & TRAINING BUYERS', title: 'Find the right people for the room.', body: 'Check public speaker and facilitator listings through ATB Spotlight. For team development, commission a PRIME-based programme through Valoria Develop.', href: '/marketplace/speakers', cta: 'EXPLORE ATB SPOTLIGHT' },
]

export default function HomePage() {
  return <>
    <Nav />
    <main id="main-content" className="home-redesign-root">
      <HeroSlider />
      <HomepageOpportunities />

      <section className="home-intro home-problem" aria-labelledby="home-problem-title">
        <div className="container home-intro-grid">
          <div>
            <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">THE PROBLEM</span></div>
            <h2 id="home-problem-title">Capability is often<br/><em>hard to see.</em></h2>
          </div>
          <div className="home-intro-copy">
            <p>Professional opportunities can flow through familiar networks, visible titles and polished CVs. Capable people are overlooked when the signal is unclear.</p>
            <p>Employers, event organisers and training buyers need a more consistent way to understand what a professional can do. Professionals need a fairer way to make that capability visible.</p>
          </div>
        </div>
      </section>

      <section className="home-intro home-standard" aria-labelledby="home-standard-title">
        <div className="container">
          <div className="home-intro-grid">
            <div>
              <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">THE VALORIA STANDARD</span></div>
              <h2 id="home-standard-title">One framework.<br/><em>Five clusters.</em></h2>
            </div>
            <div className="home-intro-copy">
              <p>PRIME describes professional capability across five clusters and seventeen skills. The VALU Index measures capability through a structured full assessment and reports results in points.</p>
              <p>Assessment, profile completeness, listing eligibility and public discoverability are separate steps. Visibility follows the applicable requirements; it is not automatic.</p>
            </div>
          </div>
          <div className="home-cluster-list" aria-label="PRIME clusters">
            {PRIME_CLUSTERS.map(cluster => <div className="home-cluster-card" key={cluster.letter}><span>{cluster.letter}</span><strong>{cluster.name}</strong><small>{cluster.description}</small></div>)}
          </div>
        </div>
      </section>

      <section className="valu-section valu-conversion" id="valu" aria-labelledby="home-valu-title">
        <div className="container valu-conversion-shell">
          <Reveal className="valu-conversion-intro">
            <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START WITH THE VALU JOURNEY</span></div>
            <h2 id="home-valu-title" className="valu-title">Before your next move, <em>know where you stand.</em></h2>
            <p className="valu-desc">Begin with the VALU taster. If you choose to continue, create your account and complete the VALU Index. Your official result is expressed in points across the five PRIME clusters.</p>
            <div className="valu-conversion-proof" aria-label="Assessment details">
              <span>VALU TASTER</span><i>·</i><span>FULL VALU INDEX</span><i>·</i><span>POINTS, NOT PERCENTAGES</span>
            </div>
            <div className="home-dual-actions">
              <a href={BRAND.assessmentUrl} className="btn-gold">TAKE THE VALU TASTER <span aria-hidden="true">→</span></a>
              <a href="/valu" className="text-link">SEE HOW THE VALU INDEX WORKS <span aria-hidden="true">→</span></a>
            </div>
            <p className="valu-conversion-note">The taster is a first step, not your official VALU Index. The full assessment establishes your points score and designation.</p>
          </Reveal>

          <Reveal className="valu-conversion-card">
            <div className="vcc-top"><span>THE FULL VALU INDEX</span><strong>POINTS-BASED PROFILE</strong></div>
            <div className="vcc-framework-list">
              <div><strong>PRIME</strong><span>Five capability dimensions</span></div>
              <div><strong>INSIGHT</strong><span>Capability and development guidance</span></div>
            </div>
            <div className="vcc-steps">
              <div className="vcc-step is-active"><span>01</span><div><b>Take the taster</b><small>No account needed to begin.</small></div></div>
              <div className="vcc-step"><span>02</span><div><b>Complete the full assessment</b><small>Create and confirm your account to continue.</small></div></div>
              <div className="vcc-step"><span>03</span><div><b>Build your professional profile</b><small>Complete your record and declare your capabilities.</small></div></div>
              <div className="vcc-step"><span>04</span><div><b>Become discoverable</b><small>When listing requirements and public visibility are in place.</small></div></div>
            </div>
            <a href={BRAND.assessmentUrl} className="vcc-bottom-cta">BEGIN THE VALU TASTER <span>→</span></a>
          </Reveal>
        </div>
      </section>

      <LiveProfilesScroll />

      <section className="home-pathways" aria-labelledby="pathways-title">
        <div className="container">
          <Reveal className="home-section-heading">
            <div>
              <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">WHO VALORIA SERVES</span></div>
              <h2 id="pathways-title">What brings you<br/><em>to Valoria?</em></h2>
            </div>
            <p>Choose the path that matches what you need today. One clear standard connects professional development, visibility and opportunity.</p>
          </Reveal>
          <Reveal className="home-pathway-grid" as="div">
            {pathwayCards.map((card, index) => (
              <a className={`home-pathway-card ${index === 0 ? 'is-primary' : ''}`} href={card.href} key={card.label}>
                <span className="home-pathway-number">0{index + 1}</span>
                <span className="home-pathway-label">{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <span className="home-pathway-cta">{card.cta} <span aria-hidden="true">→</span></span>
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      <HomepageEvents />

      <section className="home-close">
        <div className="container">
          <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">WORTH, BUILT.</span></div>
          <h2>Capability deserves<br/><em>to be seen.</em></h2>
          <p>Start with the taster. Build your professional profile. Become discoverable when your profile meets the listing standard.</p>
          <a href={BRAND.assessmentUrl} className="btn-gold">TAKE THE VALU TASTER <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
