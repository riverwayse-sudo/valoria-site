import Nav, { AssessmentStartLink } from '@/components/Nav'
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
  title: 'Valoria Institute — Worth. Built.',
  description: 'Understand your professional capability, build a credible profile and discover opportunities. Valoria connects professionals, employers, event organisers and development buyers through the PRIME framework and VALU Index.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
}

const pathwayCards = [
  {
    label: 'FOR PROFESSIONALS',
    title: 'Understand your capability.',
    body: 'Register your details, complete the VALU taster, then continue to the separate Full assessment and build your professional profile.',
    href: BRAND.assessmentUrl,
    cta: 'REGISTER & TAKE THE TASTER',
  },
  {
    label: 'FOR EMPLOYERS',
    title: 'Find talent by capability.',
    body: 'Explore public professional profiles by declared capability, sector and experience. VALU points and designations appear where a current Full assessment is available.',
    href: '/marketplace/talent',
    cta: 'OPEN ATB CONNECT',
  },
  {
    label: 'FOR EVENT ORGANISERS & TRAINING BUYERS',
    title: 'Find the right people for the room.',
    body: 'Explore public speaker and facilitator profiles where listings are available. For team development, enquire about PRIME-mapped programmes with facilitator suitability confirmed for each engagement.',
    href: '/marketplace/speakers',
    cta: 'EXPLORE ATB SPOTLIGHT',
  },
]

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="home-redesign-root">
        <HeroSlider />
        <HomepageOpportunities />

        <section className="home-intro home-problem" aria-labelledby="home-problem-title">
          <div className="container home-intro-grid">
            <div>
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE PROBLEM</span></div>
              <h2 id="home-problem-title">Capability is often<br /><em>hard to see.</em></h2>
            </div>
            <div className="home-intro-copy">
              <p>Professional opportunities can flow through familiar networks, visible titles and polished CVs. Capable people are overlooked when the signal is unclear.</p>
              <p>Employers, event organisers and training buyers need a more consistent way to understand what a professional can contribute. Professionals need a clearer way to make that capability visible.</p>
            </div>
          </div>
        </section>

        <section className="home-intro home-standard" aria-labelledby="home-standard-title">
          <div className="container">
            <div className="home-intro-grid">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE VALORIA STANDARD</span></div>
                <h2 id="home-standard-title">One framework.<br /><em>Five clusters.</em></h2>
              </div>
              <div className="home-intro-copy">
                <p>PRIME describes professional capability across five clusters and seventeen skills. The VALU Index measures capability through a structured Full assessment and reports results in points.</p>
                <p>Your assessment helps shape your professional profile. Public visibility depends on the information you provide and the requirements of the professional role you want to present.</p>
              </div>
            </div>
            <div className="home-cluster-list" aria-label="PRIME clusters">
              {PRIME_CLUSTERS.map(cluster => (
                <div className="home-cluster-card" key={cluster.letter}>
                  <span>{cluster.letter}</span>
                  <strong>{cluster.name}</strong>
                  <small>{cluster.subtitle}.</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="valu-section valu-conversion" id="valu" aria-labelledby="home-valu-title">
          <div className="container valu-conversion-shell">
            <Reveal className="valu-conversion-intro">
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">START WITH THE VALU JOURNEY</span></div>
              <h2 id="home-valu-title" className="valu-title">Before your next move, <em>know where you stand.</em></h2>
              <p className="valu-desc">Register your details, complete the VALU taster, then decide whether to continue to the separate Full assessment. Your official VALU Index result is expressed in points across the five PRIME clusters.</p>
              <div className="valu-conversion-proof" aria-label="Assessment journey">
                <span>REGISTRATION</span><i>·</i><span>VALU TASTER</span><i>·</i><span>FULL VALU INDEX</span><i>·</i><span>PROFESSIONAL PROFILE</span>
              </div>
              <div className="home-dual-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">REGISTER & TAKE THE VALU TASTER <span aria-hidden="true">→</span></AssessmentStartLink>
                <a href="/valu" className="text-link">SEE HOW THE VALU INDEX WORKS <span aria-hidden="true">→</span></a>
              </div>
              <p className="valu-conversion-note">The taster is an initial snapshot, not your official VALU Index. The separate Full assessment establishes your points score and merit designation.</p>
            </Reveal>

            <Reveal className="valu-conversion-card">
              <div className="vcc-top"><span>THE FULL VALU INDEX</span><strong>POINTS-BASED PROFILE</strong></div>
              <div className="vcc-framework-list">
                <div><strong>PRIME</strong><span>Five capability dimensions</span></div>
                <div><strong>INSIGHT</strong><span>Assessment and development guidance</span></div>
              </div>
              <div className="vcc-steps">
                <div className="vcc-step is-active"><span>01</span><div><b>Register your details</b><small>Create your account and confirm your email.</small></div></div>
                <div className="vcc-step"><span>02</span><div><b>Complete the VALU taster</b><small>Receive an initial view of your capability.</small></div></div>
                <div className="vcc-step"><span>03</span><div><b>Complete the Full assessment</b><small>Receive your official points score and designation.</small></div></div>
                <div className="vcc-step"><span>04</span><div><b>Build your professional profile</b><small>Become discoverable when listing requirements are met.</small></div></div>
              </div>
              <AssessmentStartLink href={BRAND.assessmentUrl} className="vcc-bottom-cta">REGISTER TO BEGIN <span>→</span></AssessmentStartLink>
            </Reveal>
          </div>
        </section>

        <LiveProfilesScroll />

        <section className="home-pathways" aria-labelledby="pathways-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WHO VALORIA SERVES</span></div>
                <h2 id="pathways-title">What brings you<br /><em>to Valoria?</em></h2>
              </div>
              <p>Choose the path that matches what you need today. One clear standard connects professional development, visibility and opportunity.</p>
            </Reveal>
            <Reveal className="home-pathway-grid" as="div">
              {pathwayCards.map((card, index) => (
                <a className={'home-pathway-card ' + (index === 0 ? 'is-primary' : '')} href={card.href} key={card.label}>
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
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">WORTH. BUILT.</span></div>
            <h2>Capability deserves<br /><em>to be seen.</em></h2>
            <p>Start with your details. Complete the taster. Build your professional profile. Become discoverable when your profile meets the relevant listing requirements.</p>
            <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">REGISTER & TAKE THE VALU TASTER <span aria-hidden="true">→</span></AssessmentStartLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
