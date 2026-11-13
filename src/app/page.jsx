import Nav from '@/components/Nav'
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
  title: 'Valoria Institute — Worth, Built.',
  description: 'An international professional capability institution helping individuals understand, develop and demonstrate their capabilities — and helping organisations discover and engage expertise.'
}

const pathwayCards = [
  { label: 'FOR PROFESSIONALS', title: 'Understand and develop your capabilities.', body: 'Gain a clearer view of your professional capabilities, identify areas for growth and build a profile that communicates your value.', href: '/valu', cta: 'EXPLORE VALU' },
  { label: 'FOR EMPLOYERS', title: 'Discover talent with greater context.', body: 'Explore professionals through structured capability profiles, experience and areas of expertise.', href: '/marketplace/talent', cta: 'DISCOVER TALENT' },
  { label: 'FOR FACILITATORS & EXPERTS', title: 'Make your expertise discoverable.', body: 'Present your subject expertise, specialisations and facilitation strengths to organisations seeking professional contributors.', href: '/marketplace/facilitators', cta: 'EXPLORE FACILITATORS' },
  { label: 'FOR EVENT ORGANISERS', title: 'Find the right voices for your programmes.', body: 'Discover speakers and subject-matter experts whose experience and expertise align with your event or programme.', href: '/marketplace/speakers', cta: 'FIND SPEAKERS' },
  { label: 'FOR INSTITUTIONS & PARTNERS', title: 'Build meaningful professional partnerships.', body: 'Explore collaboration around professional capability, development programmes, talent and institutional initiatives.', href: '/contact-us', cta: 'START A CONVERSATION' }
]

export default function HomePage() {
  return <>
    <Nav />
    <main id="main-content" className="home-redesign-root">
      <HeroSlider />
      <LiveProfilesScroll />

      <section className="home-pathways" aria-labelledby="pathways-title">
        <div className="container">
          <Reveal className="home-section-heading">
            <div>
              <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START HERE</span></div>
              <h2 id="pathways-title">What brings you<br/><em>to Valoria?</em></h2>
            </div>
            <p>Whether you are developing your capabilities, sharing expertise, discovering talent or building institutional partnerships, choose the pathway that reflects what you want to achieve.</p>
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

      <section className="valu-section valu-conversion" id="valu" aria-labelledby="home-valu-title">
        <div className="container valu-conversion-shell">
          <Reveal className="valu-conversion-intro">
            <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START WITH THE VALU INDEX</span></div>
            <h2 id="home-valu-title" className="valu-title">Before you build your next move, <em>know where you stand.</em></h2>
            <p className="valu-desc">Begin with the VALU taster for an initial perspective on your professional capabilities. Continue with the full VALU Index for a structured assessment across all five PRIME clusters.</p>
            <div className="valu-conversion-proof" aria-label="Assessment details">
              <span>FOCUSED TASTER</span><i>·</i><span><b>FREE</b> ENTRY</span><i>·</i><span>FULL INDEX · 5 CLUSTERS</span>
            </div>
            <div className="home-dual-actions">
              <a href={BRAND.assessmentUrl} className="btn-gold">START THE VALU TASTER <span aria-hidden="true">→</span></a>
              <a href="/valu" className="text-link">SEE HOW VALU WORKS <span aria-hidden="true">→</span></a>
            </div>
            <p className="valu-conversion-note">Your first result is directional. It is the starting signal for the wider Valoria journey — not a label and not the end of the process.</p>
          </Reveal>

          <Reveal className="valu-conversion-card">
            <div className="vcc-top"><span>YOUR ENTRY POINT</span><strong>VALU INDEX</strong></div>
            <div className="vcc-radar" aria-hidden="true">
              <svg className="vcc-radar-svg" viewBox="0 0 100 100" role="presentation">
                <g className="vcc-radar-grid">
                  <polygon points="50,42 57.6,44.5 54.7,53.6 45.3,53.6 42.4,44.5"/>
                  <polygon points="50,34 65.2,39 59.5,57.3 40.5,57.3 34.8,39"/>
                  <polygon points="50,26 72.8,33.5 64.3,61 35.7,61 27.2,33.5"/>
                  <polygon points="50,18 80.4,28 69,64.6 31,64.6 19.6,28"/>
                  <polygon points="50,10 88,22.5 73.8,68.2 26.2,68.2 12,22.5"/>
                  <line x1="50" y1="50" x2="50" y2="10"/><line x1="50" y1="50" x2="88" y2="22.5"/><line x1="50" y1="50" x2="73.8" y2="68.2"/><line x1="50" y1="50" x2="26.2" y2="68.2"/><line x1="50" y1="50" x2="12" y2="22.5"/>
                </g>
                <polygon className="vcc-radar-area" points="50,20 78,30 67,62 31,60 20,29"/>
                <g className="vcc-radar-points"><circle cx="50" cy="20" r="1.8"/><circle cx="78" cy="30" r="1.8"/><circle cx="67" cy="62" r="1.8"/><circle cx="31" cy="60" r="1.8"/><circle cx="20" cy="29" r="1.8"/></g>
                <g className="vcc-radar-labels">
                  <text x="50" y="5" textAnchor="middle">PRESENCE</text><text x="94" y="21" textAnchor="end">RELATIONSHIPS</text><text x="79" y="78" textAnchor="middle">INTELLIGENCE</text><text x="21" y="78" textAnchor="middle">MASTERY</text><text x="6" y="21">ENTERPRISE</text>
                </g>
              </svg>
              <div className="vcc-radar-center">VALU</div>
            </div>
            <div className="vcc-steps">
              <div className="vcc-step is-active"><span>01</span><div><b>See your signal</b><small>Focused VALU taster</small></div></div>
              <div className="vcc-step"><span>02</span><div><b>Build your picture</b><small>Full VALU Index + professional profile</small></div></div>
              <div className="vcc-step"><span>03</span><div><b>Become discoverable</b><small>Capability, eligibility and marketplace</small></div></div>
            </div>
            <a href={BRAND.assessmentUrl} className="vcc-bottom-cta">BEGIN THE VALU TASTER <span>→</span></a>
          </Reveal>
        </div>
      </section>

      <HomepageEvents />
    </main>
    <Footer />
  </>
}
