import Nav, { AssessmentStartLink } from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import HomepageEvents from '@/components/HomepageEvents'
import { BRAND } from '@/lib/brand'
import './home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth. Built.',
  description: 'Valoria Institute builds the infrastructure through which African professional capability is assessed, developed, recognised and connected to opportunity.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
}

const frameworkStages = [
  {
    number: '01',
    title: 'Assess capability',
    body: 'The VALU Index provides a structured view of professional capability across the PRIME dimensions.',
    href: '/valu',
    cta: 'EXPLORE THE VALU INDEX',
  },
  {
    number: '02',
    title: 'Develop with intention',
    body: 'The PRIME framework gives professionals a shared language for strengthening Presence, Relationships, Intelligence, Mastery and Enterprise.',
    href: '/programmes',
    cta: 'EXPLORE PROGRAMMES',
  },
  {
    number: '03',
    title: 'Connect to opportunity',
    body: 'The Valoria Talent Marketplace helps organisations discover professionals through capability-led profiles and pathways.',
    href: '/marketplace',
    cta: 'EXPLORE THE BUREAU',
  },
]

const pathwayCards = [
  {
    label: 'FOR PROFESSIONALS',
    title: 'Make your capability visible.',
    body: 'Understand where you stand, build a stronger professional record and become discoverable for relevant opportunities.',
    href: '/valu',
    cta: 'START WITH VALU INDEX',
  },
  {
    label: 'FOR EMPLOYERS',
    title: 'Find capability with context.',
    body: 'Explore professionals through structured profiles that bring capability, experience and professional pathways into view.',
    href: '/marketplace',
    cta: 'EXPLORE THE BUREAU',
  },
  {
    label: 'FOR EVENT ORGANISERS',
    title: 'Find the right voices.',
    body: 'Discover speakers with relevant expertise for conversations, conferences, programmes and organisational moments.',
    href: '/marketplace/speakers',
    cta: 'FIND SPEAKERS',
  },
  {
    label: 'FOR FACILITATORS & EXPERTS',
    title: 'Put expertise to work.',
    body: 'Make your facilitation and specialist expertise visible to organisations seeking people who can lead learning and meaningful change.',
    href: '/facilitators',
    cta: 'EXPLORE FACILITATOR PATHWAYS',
  },
  {
    label: 'FOR INSTITUTIONS & PARTNERS',
    title: 'Build capability together.',
    body: 'Work with Valoria on professional development, institutional programmes and partnerships that connect capability to opportunity.',
    href: '/contact-us',
    cta: 'DISCUSS A PARTNERSHIP',
  },
]

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="home-redesign-root">
        <HeroSlider />

        <section className="valu-section valu-conversion" id="valu" aria-labelledby="home-valu-title">
          <div className="container valu-conversion-shell">
            <Reveal className="valu-conversion-intro">
              <div className="eyebrow">
                <div className="eyebrow-line" />
                <span className="eyebrow-text">A CLEAR STARTING POINT</span>
              </div>
              <h2 id="home-valu-title" className="valu-title">
                Before you build your next move, <em>know where you stand.</em>
              </h2>
              <p className="valu-desc">
                The VALU Index helps you understand your professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise. Begin with a free taster and take a clearer view of what to build next.
              </p>
              <div className="valu-conversion-proof" aria-label="VALU Index entry details">
                <span><b>9</b> QUESTIONS</span><i>·</i><span><b>FREE</b> ENTRY</span><i>·</i><span>NO ACCOUNT NEEDED</span><i>·</i><span><b>5</b> PRIME DIMENSIONS</span>
              </div>
              <div className="home-dual-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">
                  DISCOVER YOUR VALU INDEX <span aria-hidden="true">→</span>
                </AssessmentStartLink>
                <a href="/valu" className="text-link">
                  UNDERSTAND THE VALU INDEX <span aria-hidden="true">→</span>
                </a>
              </div>
              <p className="valu-conversion-note">
                A considered starting point for understanding your strengths and deciding what to build next.
              </p>
            </Reveal>

            <Reveal className="valu-conversion-card">
              <div className="vcc-top">
                <span>YOUR PROFESSIONAL STARTING POINT</span>
                <strong>VALU INDEX</strong>
              </div>
              <div className="vcc-radar" aria-hidden="true">
                <svg className="vcc-radar-svg" viewBox="0 0 100 100" role="presentation">
                  <g className="vcc-radar-grid">
                    <polygon points="50,42 57.6,44.5 54.7,53.6 45.3,53.6 42.4,44.5" />
                    <polygon points="50,34 65.2,39 59.5,57.3 40.5,57.3 34.8,39" />
                    <polygon points="50,26 72.8,33.5 64.3,61 35.7,61 27.2,33.5" />
                    <polygon points="50,18 80.4,28 69,64.6 31,64.6 19.6,28" />
                    <polygon points="50,10 88,22.5 73.8,68.2 26.2,68.2 12,22.5" />
                    <line x1="50" y1="50" x2="50" y2="10" />
                    <line x1="50" y1="50" x2="88" y2="22.5" />
                    <line x1="50" y1="50" x2="73.8" y2="68.2" />
                    <line x1="50" y1="50" x2="26.2" y2="68.2" />
                    <line x1="50" y1="50" x2="12" y2="22.5" />
                  </g>
                  <polygon className="vcc-radar-area" points="50,20 78,30 67,62 31,60 20,29" />
                  <g className="vcc-radar-labels">
                    <text x="50" y="5" textAnchor="middle">PRESENCE</text>
                    <text x="94" y="21" textAnchor="end">RELATIONSHIPS</text>
                    <text x="79" y="78" textAnchor="middle">INTELLIGENCE</text>
                    <text x="21" y="78" textAnchor="middle">MASTERY</text>
                    <text x="6" y="21">ENTERPRISE</text>
                  </g>
                </svg>
              </div>
              <div className="vcc-steps">
                <div className="vcc-step is-active">
                  <span>01</span>
                  <div><b>Understand your capability</b><small>Start with a structured view of your strengths.</small></div>
                </div>
                <div className="vcc-step">
                  <span>02</span>
                  <div><b>Build your professional picture</b><small>Bring capability and experience into context.</small></div>
                </div>
                <div className="vcc-step">
                  <span>03</span>
                  <div><b>Explore relevant opportunities</b><small>Connect your professional record to the Bureau.</small></div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <LiveProfilesScroll />

        <section className="home-framework" aria-labelledby="home-framework-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE VALORIA FRAMEWORK</span></div>
                <h2 id="home-framework-title">From professional capability to <em>meaningful opportunity.</em></h2>
              </div>
              <p>Valoria connects assessment, development and professional visibility through one institutional framework.</p>
            </Reveal>
            <Reveal className="home-framework-grid" as="div">
              {frameworkStages.map((stage) => (
                <article className="home-framework-card" key={stage.number}>
                  <span className="home-framework-number">{stage.number}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                  <a className="home-framework-link" href={stage.href}>{stage.cta} <span aria-hidden="true">→</span></a>
                </article>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="home-pathways" aria-labelledby="pathways-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">PATHWAYS INTO VALORIA</span></div>
                <h2 id="pathways-title">One institution.<br /><em>Five ways to engage.</em></h2>
              </div>
              <p>For professionals, organisations and institutions, Valoria creates clear pathways to capability, expertise and meaningful collaboration.</p>
            </Reveal>

            <Reveal className="home-pathway-grid" as="div">
              {pathwayCards.map((card, index) => (
                <a className="home-pathway-card" href={card.href} key={card.label}>
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
      </main>
      <Footer />
    </>
  )
}
