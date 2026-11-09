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
  title: 'Valoria Institute — Africa’s Human Capital Institution',
  description: 'The institutional infrastructure to recognise, develop and connect professional capability.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
  openGraph: {
    title: 'Valoria Institute — Africa’s Human Capital Institution',
    description: 'Recognise capability. Develop potential. Connect expertise to opportunity.',
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
    label: 'EMPLOYERS & TALENT LEADERS',
    title: 'Make more informed talent decisions.',
    body: 'Discover professionals through structured capability profiles, relevant experience and clearer context for sourcing and engagement.',
    href: '/atb-connect',
    action: 'Explore ATB Connect',
  },
  {
    number: '02',
    label: 'INSTITUTIONS & ORGANISATIONS',
    title: 'Build capability with purpose.',
    body: 'Connect organisational priorities to professional development, capability insight and institutional programmes.',
    href: '/develop',
    action: 'Explore Valoria Develop',
  },
  {
    number: '03',
    label: 'EVENT ORGANISERS & PROGRAMME TEAMS',
    title: 'Bring the right expertise into the room.',
    body: 'Find speakers and facilitators whose knowledge and experience are relevant to your audience, event or programme.',
    href: '/atb-spotlight',
    action: 'Explore ATB Spotlight',
  },
  {
    number: '04',
    label: 'PROFESSIONALS & PRACTITIONERS',
    title: 'Make your capability clearer.',
    body: 'Understand your professional strengths, build a credible profile and become discoverable for relevant opportunities.',
    href: '/valu',
    action: 'Begin with VALU',
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
            <div className="vi-ih-eyebrow"><span /> AFRICA’S HUMAN CAPITAL INSTITUTION</div>
            <h1 id="vi-ih-title">Talent is not the problem.<br /><em>Infrastructure is.</em></h1>
            <p className="vi-ih-hero-lede">We build the systems that help organisations recognise capability, develop people and connect professional expertise to meaningful opportunity.</p>
            <div className="vi-ih-actions">
              <a className="vi-ih-button vi-ih-button-gold" href="#institutional-system">Explore the institution <span>↗</span></a>
              <a className="vi-ih-button vi-ih-button-quiet" href="/contact-us">Engage Valoria <span>↗</span></a>
            </div>
            <div className="vi-ih-hero-foot">
              <span>INITIAL OPERATING MARKET <b>NIGERIA</b></span>
              <span>BUILT FOR <b>AFRICAN & INTERNATIONAL RELEVANCE</b></span>
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

        <section className="vi-ih-system" id="institutional-system" aria-labelledby="vi-ih-system-title">
          <div className="vi-ih-wrap">
            <Reveal className="vi-ih-section-intro">
              <div>
                <div className="vi-ih-kicker">THE VALORIA INSTITUTIONAL SYSTEM</div>
                <h2 id="vi-ih-system-title">One connected system.<br /><em>Four distinct functions.</em></h2>
              </div>
              <p>Each part has a defined role. Together, they create a connected pathway from understanding capability to putting it to work.</p>
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

        <section className="vi-ih-prime" aria-labelledby="vi-ih-prime-title">
          <div className="vi-ih-prime-backdrop" aria-hidden="true" />
          <div className="vi-ih-wrap">
            <Reveal className="vi-ih-prime-intro">
              <div className="vi-ih-kicker">THE PRIME FRAMEWORK</div>
              <h2 id="vi-ih-prime-title">A broader view of<br /><em>professional capability.</em></h2>
              <p>Five dimensions. Seventeen skills. One shared language for understanding the capabilities that shape professional contribution.</p>
              <a className="vi-ih-inline-link" href="/prime">Explore all 17 skills <span>↗</span></a>
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

        <section className="vi-ih-audiences" aria-labelledby="vi-ih-audiences-title">
          <div className="vi-ih-wrap">
            <Reveal className="vi-ih-section-intro">
              <div>
                <div className="vi-ih-kicker">WHERE THE SYSTEM CREATES VALUE</div>
                <h2 id="vi-ih-audiences-title">Different needs.<br /><em>One institutional partner.</em></h2>
              </div>
              <p>Valoria works across the professional and organisational landscape. Start with the outcome you need to achieve.</p>
            </Reveal>
            <div className="vi-ih-audience-list">
              {audiences.map((item) => (
                <Reveal className="vi-ih-audience-row" key={item.number}>
                  <span className="vi-ih-audience-number">{item.number}</span>
                  <div className="vi-ih-audience-label">{item.label}</div>
                  <div className="vi-ih-audience-copy"><h3>{item.title}</h3><p>{item.body}</p></div>
                  <a href={item.href} aria-label={item.action}>{item.action} <span>↗</span></a>
                </Reveal>
              ))}
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
              <a className="vi-ih-button vi-ih-button-gold" href="/contact-us">Start an institutional conversation <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="vi-ih-events"><div className="vi-ih-wrap"><HomepageEvents /></div></section>
      </main>
      <Footer />
    </>
  )
}
