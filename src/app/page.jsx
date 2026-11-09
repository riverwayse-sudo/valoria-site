import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import HomepageEvents from '@/components/HomepageEvents'
import './home.css'
import './home-institutional.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Understand capability. Build it. Put it to work.',
  description: 'Valoria Institute helps people and organisations understand professional capability, strengthen it through development, and connect expertise to meaningful work.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
  openGraph: {
    title: 'Valoria Institute — Africa’s Human Capital Institution',
    description: 'Starting in Nigeria, Valoria connects professional capability to development and opportunity for broader African and international audiences.',
    url: 'https://valoriainstitute.com/',
  },
}

const system = [
  {
    number: '01',
    name: 'PRIME Framework',
    role: 'THE STANDARD',
    title: 'A shared language for human capability.',
    body: 'A structured framework spanning Presence, Relationships, Intelligence, Mastery and Enterprise — giving professionals and institutions a clearer way to understand the capabilities that matter.',
    href: '/prime',
    action: 'Explore the framework',
  },
  {
    number: '02',
    name: 'VALU Index',
    role: 'THE INTELLIGENCE',
    title: 'Turn capability into useful insight.',
    body: 'A structured assessment and points-based capability profile that helps professionals understand their strengths and informs more deliberate development decisions.',
    href: '/valu',
    action: 'Understand VALU',
  },
  {
    number: '03',
    name: 'African Talent Bureau',
    role: 'THE CONNECTION',
    title: 'Make expertise easier to discover.',
    body: 'A capability-led registry connecting organisations with professionals, speakers and facilitators whose experience and expertise fit the work ahead.',
    href: '/marketplace',
    action: 'Explore the Registry',
  },
  {
    number: '04',
    name: 'Valoria Develop',
    role: 'THE DEVELOPMENT',
    title: 'Build the capabilities that move work forward.',
    body: 'Professional and organisational development pathways designed around capability, practical application and the needs of a changing world of work.',
    href: '/develop',
    action: 'Explore development',
  },
]

const audiences = [
  {
    number: '01',
    label: 'FOR EMPLOYERS & TALENT LEADERS',
    title: 'Make more informed talent decisions.',
    body: 'Discover professionals through structured capability profiles, relevant experience and clearer context for sourcing and engagement.',
    href: '/atb-connect',
    action: 'Explore ATB Connect',
  },
  {
    number: '02',
    label: 'FOR INSTITUTIONS & PARTNERS',
    title: 'Build capability with purpose.',
    body: 'Connect organisational priorities to professional development, capability insight and institutional programmes.',
    href: '/develop',
    action: 'Explore Valoria Develop',
  },
  {
    number: '03',
    label: 'FOR EVENT ORGANISERS',
    title: 'Bring the right expertise into the room.',
    body: 'Find speakers and facilitators whose knowledge and experience are relevant to your audience, event or programme.',
    href: '/atb-spotlight',
    action: 'Explore ATB Spotlight',
  },
  {
    number: '04',
    label: 'FOR PROFESSIONALS SEEKING DEVELOPMENT',
    title: 'Make your capability clearer.',
    body: 'Understand your professional strengths, build a credible profile and become discoverable for relevant opportunities.',
    href: '/valu',
    action: 'Begin with VALU',
  },
  {
    number: '05',
    label: 'FOR FACILITATORS & EXPERTS',
    title: 'Put your expertise to work.',
    body: 'Make your facilitation and specialist expertise visible to organisations seeking people who can lead learning, dialogue and meaningful change.',
    href: '/marketplace/facilitators',
    action: 'Explore facilitator pathways',
  },
]

const dimensions = [
  ['P', 'Presence', 'How you show up', 'Communication · Negotiation · Personal Brand & Executive Presence'],
  ['R', 'Relationships', 'How you connect', 'Emotional Intelligence · Conflict Resolution · People Development · Stakeholder Management'],
  ['I', 'Intelligence', 'How you think', 'Critical Thinking · Strategic Thinking · Business Acumen · AI Fluency'],
  ['M', 'Mastery', 'How you deliver', 'Execution & Accountability · Resilience & Self-Leadership · Adaptability'],
  ['E', 'Enterprise', 'How you create', 'Commercial Creativity · Influence Without Authority · Human-AI Collaboration'],
]

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="vi-institutional-home">
        <section className="vi-ih-hero" aria-labelledby="vi-ih-title">
          <div className="vi-ih-hero-image" aria-hidden="true">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85" alt="" fetchPriority="high" />
          </div>
          <div className="vi-ih-hero-shade" aria-hidden="true" />
          <div className="vi-ih-hero-content">
            <div className="vi-ih-eyebrow"><span /> A PROFESSIONAL CAPABILITY INSTITUTION</div>
            <h1 id="vi-ih-title">Understand your capability.<br /><em>Put it to work.</em></h1>
            <p className="vi-ih-hero-lede">Valoria helps professionals understand what they bring, build what comes next, and become easier to discover. Organisations use Valoria to find relevant talent, speakers and facilitators, and develop the capabilities their work requires.</p>
            <div className="vi-ih-actions">
              <a className="vi-ih-button vi-ih-button-gold" href="#how-valoria-works">How Valoria works <span>↗</span></a>
              <a className="vi-ih-button vi-ih-button-quiet" href="/valu">Start with VALU <span>↗</span></a>
            </div>
            <div className="vi-ih-hero-foot">
              <span>INITIAL MARKET <b>NIGERIA</b></span>
              <span>Built for an international audience. Operating first in Nigeria.</span>
              <span>Initial operating focus is Nigeria.</span>
            </div>
          </div>
          <div className="vi-ih-hero-index" aria-hidden="true">
            <span>VI</span><i />
            <small>WORTH. BUILT.</small>
          </div>
        </section>

        <section className="vi-ih-thesis" aria-labelledby="vi-ih-thesis-title">
          <div className="vi-ih-wrap vi-ih-thesis-grid">
            <Reveal className="vi-ih-thesis-heading">
              <div className="vi-ih-kicker">THE INFRASTRUCTURE GAP</div>
              <h2 id="vi-ih-thesis-title">Talent is everywhere.<br /><em>Clarity is not.</em></h2>
            </Reveal>
            <Reveal className="vi-ih-thesis-copy">
              <p className="vi-ih-thesis-lede">The world does not lack capable people. It lacks consistent ways to recognise what people can do, develop what is needed and connect expertise to the places it can create value.</p>
              <p>Too often, capability is fragmented across résumés, credentials, networks and disconnected development programmes. Valoria exists to bring greater structure to that landscape.</p>
              <a className="vi-ih-inline-link" href="/about-us">Understand our institutional mandate <span>↗</span></a>
            </Reveal>
          </div>
          <div className="vi-ih-wrap vi-ih-principles">
            <div><span>01 / RECOGNISE</span><strong>Make capability<br />understood.</strong></div>
            <div><span>02 / DEVELOP</span><strong>Strengthen what<br />matters.</strong></div>
            <div><span>03 / CONNECT</span><strong>Bring expertise<br />to opportunity.</strong></div>
          </div>
        </section>


        <section className="vi-ih-how" id="how-valoria-works" aria-labelledby="vi-ih-how-title">
          <div className="vi-ih-wrap">
            <div className="vi-ih-how-head">
              <div><div className="vi-ih-kicker">VALORIA, IN PRACTICE</div><h2 id="vi-ih-how-title">A clearer picture of capability.<br /><em>A practical path forward.</em></h2></div>
              <p>Valoria connects assessment, professional development and talent discovery. You can enter through the pathway that matches what you need.</p>
            </div>
            <div className="vi-ih-how-steps">
              <article><span>01</span><small>UNDERSTAND</small><h3>Explore your capability</h3><p>Start with the VALU taster to become familiar with PRIME. It is an introduction, not your official VALU Index.</p><a href="/valu">Understand VALU <b>↗</b></a></article>
              <article><span>02</span><small>ASSESS</small><h3>Receive your VALU Index</h3><p>After creating your account, complete the separate full assessment. Your official result is expressed in points and gives you a structured view of your capability.</p><a href="/valu">How the Index works <b>↗</b></a></article>
              <article><span>03</span><small>DEVELOP & PRESENT</small><h3>Build your professional profile</h3><p>Use your capability insight to shape your professional profile, identify development priorities and present your experience clearly.</p><a href="/signup">Create your account <b>↗</b></a></article>
              <article><span>04</span><small>CONNECT</small><h3>Find relevant next steps</h3><p>Explore development pathways, professional opportunities and the Registry, where eligible public profiles can be discovered.</p><a href="/marketplace">Explore the Registry <b>↗</b></a></article>
            </div>
            <p className="vi-ih-how-note">For organisations, Valoria provides pathways to discover talent, source speakers and facilitators, and discuss capability development.</p>
          </div>
        </section>
\n        <section className="vi-ih-system" id="institutional-system" aria-labelledby="vi-ih-system-title">
          <div className="vi-ih-wrap">
            <Reveal className="vi-ih-section-intro">
              <div>
                <div className="vi-ih-kicker">THE VALORIA INSTITUTIONAL SYSTEM</div>
                <h2 id="vi-ih-system-title">One institution.<br /><em>Four connected functions.</em></h2>
              </div>
              <p>PRIME gives Valoria its shared capability framework. VALU turns assessment into insight. The Registry makes approved professional expertise discoverable. Valoria Develop supports growth.</p>
            </Reveal>
            <div className="vi-ih-system-list">
              {system.map((item) => (
                <Reveal className="vi-ih-system-row" key={item.number}>
                  <div className="vi-ih-system-number">{item.number}</div>
                  <div className="vi-ih-system-name"><span>{item.role}</span><h3>{item.name}</h3></div>
                  <div className="vi-ih-system-detail"><h4>{item.title}</h4><p>{item.body}</p><a href={item.href}>{item.action} <span>↗</span></a></div>
                  <div className="vi-ih-system-mark" aria-hidden="true">↗</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="vi-ih-prime valu-conversion" aria-labelledby="vi-ih-prime-title">
          <div className="vi-ih-prime-backdrop" aria-hidden="true" />
          <div className="vi-ih-wrap">
            <Reveal className="vi-ih-prime-intro">
              <div className="vi-ih-kicker">THE PRIME FRAMEWORK</div>
              <h2 id="vi-ih-prime-title">A broader view of<br /><em>professional capability.</em></h2>
              <p>A shared language across five PRIME dimensions and seventeen skills, helping professionals and institutions understand the capabilities that shape professional contribution.</p>
              <div className="vi-ih-prime-actions"><a className="vi-ih-inline-link" href="/prime">Explore all 17 skills <span>↗</span></a><a className="vi-ih-button vi-ih-button-gold" href="/valu/assessment/">START THE VALU TASTER <span>↗</span></a></div>
            </Reveal>
            <div className="vi-ih-dimensions">
              {dimensions.map(([letter, name, question, skills]) => (
                <Reveal className="vi-ih-dimension" key={letter}>
                  <span className="vi-ih-dimension-letter">{letter}</span>
                  <h3>{name}</h3>
                  <p>{question}</p>
                  <small>{skills}</small>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="vi-ih-audiences home-pathways" aria-labelledby="vi-ih-audiences-title">
          <div className="vi-ih-wrap">
            <Reveal className="vi-ih-section-intro">
              <div>
                <div className="vi-ih-kicker">WHERE THE SYSTEM CREATES VALUE</div>
                <h2 id="vi-ih-audiences-title">Five ways to engage.<br /><em>One institutional partner.</em></h2>
              </div>
              <p>Valoria works across the professional and organisational landscape. From talent sourcing and facilitation to professional development and institutional partnerships, start with the outcome you need to achieve.</p>
            </Reveal>
            <div className="vi-ih-audience-grid">
              {audiences.map((item, index) => {
                const imagery = [
                  { src: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85', alt: 'Professionals collaborating around a shared worktable' },
                  { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85', alt: 'A leadership team working through a strategic decision' },
                  { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1100&q=85', alt: 'A speaker addressing an engaged audience on stage' },
                  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1100&q=85', alt: 'Learners sharing ideas in a collaborative learning environment' },
                  { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1100&q=85', alt: 'A facilitator guiding a focused group discussion' },
                ][index]
                return (
                  <Reveal className="vi-ih-audience-card" key={item.number} delay={index * 0.06}>
                    <a className="vi-ih-audience-image" href={item.href} tabIndex={-1} aria-hidden="true">
                      <img src={imagery.src} alt={imagery.alt} loading="lazy" />
                      <span className="vi-ih-audience-image-number">{item.number}</span>
                    </a>
                    <div className="vi-ih-audience-card-copy">
                      <div className="vi-ih-audience-label">{item.label}</div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      <a className="vi-ih-audience-card-link" href={item.href} aria-label={item.action}>{item.action} <span>↗</span></a>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="vi-ih-registry-intro">
          <div className="vi-ih-wrap vi-ih-registry-grid">
            <div>
              <div className="vi-ih-kicker">THE AFRICAN TALENT BUREAU</div>
              <h2>Expertise should be<br /><em>easier to find.</em></h2>
            </div>
            <p>A capability-led registry for discovering professionals, speakers and facilitators. Explore expertise through structured profiles and relevant professional context.</p>
          </div>
        </section>
        <LiveProfilesScroll />

        <section className="vi-ih-partnership">
          <div className="vi-ih-wrap vi-ih-partnership-grid">
            <div>
              <div className="vi-ih-kicker">FOR ORGANISATIONS & INSTITUTIONS</div>
              <h2>Build a better way to recognise and mobilise <em>capability.</em></h2>
            </div>
            <div>
              <p>Tell us what your organisation is working towards. We can explore talent access, capability development, event expertise or a wider institutional partnership.</p>
              <a className="vi-ih-button vi-ih-button-gold" href="/contact-us">START A CONVERSATION <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="vi-ih-events"><div className="vi-ih-wrap"><HomepageEvents /></div></section>
      </main>
      <Footer />
    </>
  )
}
