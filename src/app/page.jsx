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
  title: 'Valoria Institute — Africa’s Human Capital Institution',
  description: 'Valoria Institute builds the infrastructure through which African professional capability is understood, developed, surfaced and connected to opportunity.',
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
    title: 'African Talent Bureau',
    body: 'A capability-led route for employers, event organisers and programme teams to discover professionals, speakers and facilitators.',
    outcome: 'Relevant expertise, easier to find.',
  },
  {
    number: '04',
    label: 'CAPABILITY DEVELOPMENT',
    title: 'Valoria Develop',
    body: 'Structured learning and development pathways that help individuals and organisations build the capabilities that matter.',
    outcome: 'Development connected to real needs.',
  },
]

const decisionPathways = [
  {
    number: '01',
    label: 'FOR EMPLOYERS & TALENT LEADERS',
    title: 'Make better talent decisions.',
    body: 'Bring capability, professional context and role requirements into the same conversation. Explore a more considered approach to talent discovery and sourcing.',
    href: '/atb-connect',
    cta: 'EXPLORE ATB CONNECT',
  },
  {
    number: '02',
    label: 'FOR EVENT ORGANISERS',
    title: 'Find expertise for the room.',
    body: 'Identify speakers and facilitators whose knowledge and experience are relevant to your audience, event or programme.',
    href: '/atb-spotlight',
    cta: 'EXPLORE ATB SPOTLIGHT',
  },
  {
    number: '03',
    label: 'FOR INSTITUTIONS & PARTNERS',
    title: 'Build capability at scale.',
    body: 'Explore development programmes and institutional partnerships that connect professional growth to organisational and sector priorities.',
    href: '/develop',
    cta: 'EXPLORE VALORIA DEVELOP',
  },
  {
    number: '04',
    label: 'FOR FACILITATORS & EXPERTS',
    title: 'Put your expertise to work.',
    body: 'Make your facilitation and specialist expertise visible to organisations seeking people who can lead learning, dialogue and meaningful change.',
    href: '/marketplace/facilitators',
    cta: 'EXPLORE FACILITATOR PATHWAYS',
  },
]

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="home-redesign-root">
        <HeroSlider />

        <section className="home-institutional-case" aria-labelledby="institutional-case-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">THE INFRASTRUCTURE GAP</span></div>
                <h2 id="institutional-case-title">Talent exists. The systems to recognise and mobilise it must work <em>better.</em></h2>
              </div>
              <p>Across hiring, leadership, learning and events, organisations need more than access to résumés or networks. They need clearer ways to understand capability, develop it and connect it to the right opportunity.</p>
            </Reveal>
            <Reveal className="home-institutional-proof" as="div">
              <div className="home-institutional-proof-item">
                <span>THE CHALLENGE</span>
                <strong>Capability is difficult to compare.</strong>
                <p>Experience, potential and professional strengths are often presented in disconnected ways.</p>
              </div>
              <div className="home-institutional-proof-item">
                <span>THE OPPORTUNITY</span>
                <strong>Better decisions need better context.</strong>
                <p>Shared language and structured insight can strengthen how people are assessed, developed and discovered.</p>
              </div>
              <div className="home-institutional-proof-item">
                <span>THE VALORIA RESPONSE</span>
                <strong>One connected capability infrastructure.</strong>
                <p>Framework, assessment, development and talent access working as parts of one institutional system.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="home-framework" aria-labelledby="home-framework-title">
          <div className="home-framework-atmosphere" data-parallax-speed="0.035" aria-hidden="true" />
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">HOW THE INSTITUTION WORKS</span></div>
                <h2 id="home-framework-title">Four connected capabilities. <em>One institutional system.</em></h2>
              </div>
              <p>Valoria Institute is the parent institution. Each part of its system has a distinct role, from the framework that defines capability to the pathways that help put it to work.</p>
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

        <section className="home-pathways home-decision-pathways" aria-labelledby="decision-pathways-title">
          <div className="container">
            <Reveal className="home-section-heading">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FIVE WAYS TO ENGAGE.</span></div>
                <h2 id="decision-pathways-title">Start with the outcome your organisation <em>needs.</em></h2>
              </div>
              <p>Whether you are sourcing talent, curating an event or building workforce capability, Valoria provides a clear route into the relevant part of the institution.</p>
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

        <section className="home-partnership-band" aria-labelledby="partnership-band-title">
          <div className="container">
            <Reveal className="home-partnership-content">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR ORGANISATIONS & INSTITUTIONS</span></div>
                <h2 id="partnership-band-title">The next step is a better <em>capability conversation.</em></h2>
                <p>Tell us what your organisation is trying to solve. We can explore talent access, professional development, event expertise or a wider institutional partnership.</p>
              </div>
              <a href="/contact-us" className="btn-gold">START A CONVERSATION <span aria-hidden="true">→</span></a>
            </Reveal>
          </div>
        </section>

        <section className="home-professional-entry valu-section valu-conversion" aria-labelledby="professional-entry-title">
          <div className="container">
            <Reveal className="home-professional-entry-content">
              <div>
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR PROFESSIONALS</span></div>
                <h2 id="professional-entry-title">Make your capability <em>clearer.</em></h2>
                <p>Explore the VALU Index and begin with a short reflection on the five PRIME dimensions. Use the insight as a starting point for your next professional move.</p>
              </div>
              <div className="home-professional-entry-actions">
                <AssessmentStartLink href={BRAND.assessmentUrl} className="btn-gold">START THE VALU TASTER <span aria-hidden="true">→</span></AssessmentStartLink>
                <a href="/valu" className="home-professional-secondary">UNDERSTAND THE VALU INDEX <span aria-hidden="true">→</span></a>
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
