import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import HomepageEvents from '@/components/HomepageEvents'
import { BRAND } from '@/lib/brand'
import { AssessmentStartLink } from '@/components/Nav'
import './home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth, Built.',
  openGraph: { title: 'Valoria Institute — Worth, Built.', description: 'Valoria Institute is a professional capability institution. Through PRIME and the VALU Index, it helps professionals understand capability, connect insight to development, and supports employers and institutions with structured talent discovery.', url: 'https://valoriainstitute.com/' },
  twitter: { card: 'summary_large_image', title: 'Valoria Institute — Worth, Built.' },
  description: 'Valoria Institute is a professional capability institution. Through PRIME and the VALU Index, it helps professionals understand capability, connect insight to development, and supports employers and institutions with structured talent discovery.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
}

const institutionalCapabilities = [
  {
    number: '01',
    label: 'A SHARED STANDARD',
    title: 'PRIME Framework',
    body: 'A structured framework for understanding professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise.',
    outcome: 'A common language for capability.',
  },
  {
    number: '02',
    label: 'ASSESSMENT & INSIGHT',
    title: 'VALU Index',
    body: 'An assessment-led view of capability that helps professionals understand their strengths and gives development decisions a clearer starting point.',
    outcome: 'Evidence to inform the next decision.',
  },
  {
    number: '03',
    label: 'TALENT ACCESS',
    title: 'Valoria Marketplace',
    body: 'A straightforward way for employers, event organizers and program teams to find experienced professionals, speakers and facilitators.',
    outcome: 'Relevant expertise, easier to find.',
  },
  {
    number: '04',
    label: 'CAPABILITY DEVELOPMENT',
    title: 'Valoria Develop',
    body: 'Structured learning and development pathways that help individuals and organizations build the capabilities that matter.',
    outcome: 'Development connected to real needs.',
  },
]

// Three audience routes: professionals, employers, and event organizers/training buyers; facilitators are the supply side.
const decisionPathways = [
  {
    number: '01',
    label: 'FOR PROFESSIONALS',
    title: 'Make your capability legible.',
    body: 'For established professionals whose contribution carries weight: understand capability through PRIME and the VALU Index, then connect insight to deliberate development.',
    href: '/valu',
    cta: 'START THE VALU TASTER',
  },
  {
    number: '02',
    label: 'FOR EMPLOYERS',
    title: 'See beyond the résumé.',
    body: 'Find experienced professionals whose skills and work match the role. A VALU Index result may offer useful context where a professional has chosen to share it; your organization remains responsible for checking credentials and making hiring decisions. The VALU Index informs consideration; it does not replace independent credential checks.',
    href: '/atb-connect',
    cta: 'DISCUSS YOUR TALENT NEEDS',
  },
  {
    number: '03',
    label: 'FOR EVENT ORGANIZERS · FOR FACILITATORS & PROGRAM LEADERS',
    title: 'Engage expertise with intention.',
    body: 'Discover speakers and facilitators whose professional experience and skills align with the purpose, audience and goals of your event or program.',
    href: '/atb-spotlight',
    cta: 'FIND A SPEAKER OR FACILITATOR',
  },
]

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="home-redesign-root vi-home-editorial">
        <HeroSlider />
        <section className="home-framework" aria-labelledby="home-framework-title">
          <div className="home-framework-atmosphere" data-parallax-speed="0.035" aria-hidden="true" />
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">A CLEARER STANDARD FOR CAPABILITY</span></div>
                <h2 id="home-framework-title">Reputation is a signal. Capability deserves <em>to be understood with precision.</em></h2>
              </div>
              <p>For accomplished professionals and the institutions that rely on their judgment, Valoria connects a shared capability framework, structured assessment, development and professional discovery.</p>
            </Reveal>
            <Reveal className="home-framework-grid home-institutional-grid" as="div">
              {institutionalCapabilities.map((item) => (
                <article className="home-framework-card home-institutional-card" key={item.number}>
                  <span className="home-framework-number">{item.number}</span>
                  <span className="home-institutional-card-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <strong className="home-institutional-outcome">{item.outcome}</strong>
                </article>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="home-journey" aria-labelledby="home-journey-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">HOW IT WORKS</span></div>
                <h2 id="home-journey-title">From professional insight <em>to considered opportunity.</em></h2>
              </div>
              <p>Start with a directional signal, build a fuller professional record, then become discoverable when the relevant eligibility and visibility requirements are met.</p>
            </Reveal>
            <div className="home-journey-grid">
              <article className="home-journey-card"><span>01</span><h3>Take the taster</h3><p>Begin with a short set of prompts for an initial read across four Intelligence skills.</p></article>
              <article className="home-journey-card"><span>02</span><h3>Complete the full assessment</h3><p>Continue to the separate full assessment after creating or confirming your Valoria account.</p></article>
              <article className="home-journey-card"><span>03</span><h3>Build your professional profile</h3><p>Use your VALU results and professional information to create a credible profile.</p></article>
              <article className="home-journey-card"><span>04</span><h3>Become discoverable</h3><p>Present your experience and skills to employers and organisations when your profile is eligible and you choose to be visible.</p></article>
            </div>
            <div className="home-journey-actions">
              <a href="/valu" className="home-journey-link">UNDERSTAND THE VALU JOURNEY <span aria-hidden="true">→</span></a>
              <a href="/opportunities" className="home-journey-link">EXPLORE OPPORTUNITIES <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

        <section className="home-pathways home-decision-pathways" aria-labelledby="decision-pathways-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THREE WAYS TO ENGAGE.</span></div>
                <h2 id="decision-pathways-title">A considered pathway for every <em>decision-maker.</em></h2>
              </div>
              <p>For professionals, employers and institutions, the next step should reflect the responsibility at hand—not a one-size-fits-all funnel.</p>
            </Reveal>
            <Reveal className="home-pathway-grid home-decision-grid" as="div">
              {decisionPathways.map((item) => (
                <a className="home-pathway-card" href={item.href} key={item.number}>
                  <span className="home-pathway-number">{item.number}</span>
                  <span className="home-pathway-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="home-pathway-cta">{item.cta} <span aria-hidden="true">→</span></span>
                </a>
              ))}
            </Reveal>
          </div>
        </section>

        <LiveProfilesScroll />

        <section className="home-partnership-band home-consolidated-engagement valu-conversion" aria-labelledby="partnership-band-title">
          <div className="container">
            <Reveal className="home-partnership-content">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">YOUR NEXT STEP</span></div>
                <h2 id="partnership-band-title">Make your next capability decision with <em>greater clarity.</em></h2>
                <p>Professionals can begin with the VALU taster. Employers and institutions can speak with Valoria about finding professional expertise, development programs or event support.</p>
              </div>
              <div className="home-professional-entry-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">START THE VALU TASTER <span aria-hidden="true">→</span></AssessmentStartLink>
                <a href="/contact-us" className="home-professional-secondary">TALK TO VALORIA <span aria-hidden="true">→</span></a>
              </div>
            </Reveal>
          </div>
        </section>

        <HomepageEvents />
      </main>
      <Footer />
    </>
  )
}
