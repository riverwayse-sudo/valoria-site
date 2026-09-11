import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import EntryPointsGrid from '@/components/EntryPointsGrid'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import { BRAND } from '@/lib/brand'
import './home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth. Built.',
  description: 'Valoria Institute builds the infrastructure that develops, surfaces and connects professional merit to opportunity.'
}

const pathwayCards = [
  { label: 'FOR PROFESSIONALS', title: 'Build a verified professional presence.', body: 'Understand where you stand, complete your profile and become discoverable for the right opportunities.', href: '/valu', cta: 'START WITH VALU' },
  { label: 'FOR EMPLOYERS', title: 'Find capability with context.', body: 'Discover professionals through structured profiles built around capability, experience and verified pathways.', href: '/marketplace', cta: 'EXPLORE MARKETPLACE' },
  { label: 'FOR EVENT ORGANISERS', title: 'Find speakers and facilitators.', body: 'Access professionals with relevant expertise for conversations, programmes and organisational moments.', href: '/marketplace?track=speaker', cta: 'FIND PROFESSIONALS' }
]

export default function HomePage() {
  return <>
    <Nav />
    <main id="main-content">
      <HeroSlider />

      <section className="home-pathways" aria-labelledby="pathways-title">
        <div className="container">
          <Reveal className="home-section-heading">
            <div>
              <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">START HERE</span></div>
              <h2 id="pathways-title">What brings you<br/><em>to Valoria?</em></h2>
            </div>
            <p>Choose the path that matches what you need today. Valoria connects professional development, visibility and opportunity through one institutional standard.</p>
          </Reveal>
          <Reveal className="home-pathway-grid" as="div">
            {pathwayCards.map((card, index) => <a className={`home-pathway-card ${index === 0 ? 'is-primary' : ''}`} href={card.href} key={card.label}>
              <span className="home-pathway-number">0{index + 1}</span>
              <span className="home-pathway-label">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <span className="home-pathway-cta">{card.cta} <span aria-hidden="true">→</span></span>
            </a>)}
          </Reveal>
        </div>
      </section>

      <section className="home-marketplace" aria-labelledby="marketplace-title">
        <div className="container">
          <Reveal className="home-marketplace-heading">
            <div>
              <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">THE AFRICAN TALENT BUREAU</span></div>
              <h2 id="marketplace-title">Capability you can<br/><em>actually discover.</em></h2>
            </div>
            <div className="home-marketplace-side"><p>Explore real professionals across talent, speaking and facilitation pathways. One person. One professional profile. Multiple capabilities.</p><a className="text-link" href="/marketplace">EXPLORE THE MARKETPLACE <span aria-hidden="true">→</span></a></div>
          </Reveal>
          <Reveal className="home-profiles-wrap" as="div"><LiveProfilesScroll /></Reveal>
        </div>
      </section>

      <section className="alignment" id="alignment">
        <div className="container"><Reveal className="alignment-inner">
          <div className="eyebrow" style={{justifyContent:'center'}}><div className="eyebrow-line"/><span className="eyebrow-text">THE VALORIA PROMISE</span><div className="eyebrow-line"/></div>
          <blockquote className="alignment-quote">&ldquo;We will <span className="highlight">develop you, surface you, and connect you</span> to the opportunity you have earned.&rdquo;</blockquote>
          <p className="alignment-sub">Valoria builds the infrastructure through which capability is developed, merit becomes visible and opportunity can be matched with precision.</p>
          <div className="alignment-cats" aria-label="The Valoria promise"><div className="cat-item"><div className="cat-num">01</div><div className="cat-name">Develop</div></div><div className="cat-item cat-highlight"><div className="cat-num">02</div><div className="cat-name">Surface</div></div><div className="cat-item"><div className="cat-num">03</div><div className="cat-name">Connect</div></div></div>
        </Reveal></div>
      </section>

      <section className="valu-section" id="valu">
        <div className="container valu-inner">
          <Reveal>
            <div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">THE VALU INDEX</span></div>
            <h2 className="valu-title">Know exactly<br/>where you <em>stand.</em></h2>
            <p className="valu-desc">Start with a 15-question directional assessment across the five PRIME clusters. Complete your result, create your professional account and complete your profile; after normal governance checks, your professional profile can be eligible for the general marketplace.</p>
            <ul className="valu-checklist" role="list">{['Directional insight across all five PRIME clusters','A five-cluster profile showing where your capability is strongest','One professional profile with multiple capabilities or modalities','General marketplace entry after the initial assessment and profile are complete','Deeper assessment available later for advanced intelligence and opportunity pathways'].map((text,i)=><li className="vc-item" key={i}><div className="vc-dot" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>{text}</li>)}</ul>
            <div className="home-dual-actions"><a href="/valu" className="btn-gold">UNDERSTAND THE VALU INDEX <span aria-hidden="true">→</span></a><a href={BRAND.assessmentUrl} target="_blank" rel="noopener noreferrer" className="text-link">TAKE THE ASSESSMENT <span aria-hidden="true">→</span></a></div>
          </Reveal>
          <Reveal className="radar-card" aria-label="Illustrative radar chart for the VALU Index"><div className="rc-label">ILLUSTRATIVE VALU PROFILE</div><svg className="rc-radar" viewBox="0 0 260 260" aria-hidden="true"><g opacity=".35" stroke="#D4C9A8" strokeWidth=".5" fill="none"><polygon points="130,22 222,80 192,188 68,188 38,80"/><polygon points="130,50 196,98 172,174 88,174 64,98"/><polygon points="130,78 170,116 152,160 108,160 90,116"/><polygon points="130,106 144,134 132,146 128,146 116,134"/><line x1="130" y1="22" x2="130" y2="188"/><line x1="130" y1="22" x2="222" y2="80"/><line x1="130" y1="22" x2="192" y2="188"/><line x1="130" y1="22" x2="68" y2="188"/><line x1="130" y1="22" x2="38" y2="80"/></g><polygon points="130,36 214,88 186,178 74,178 46,88" fill="rgba(201,168,76,.40)" stroke="#C9A84C" strokeWidth="1.5"/><circle cx="130" cy="36" r="4" fill="#C9A84C"/><circle cx="214" cy="88" r="4" fill="#C9A84C"/><circle cx="186" cy="178" r="4" fill="#C9A84C"/><circle cx="74" cy="178" r="4" fill="#C9A84C"/><circle cx="46" cy="88" r="4" fill="#C9A84C"/><text x="130" y="12" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">P</text><text x="234" y="88" textAnchor="start" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">R</text><text x="196" y="202" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">I</text><text x="62" y="202" textAnchor="middle" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">M</text><text x="22" y="88" textAnchor="end" fontFamily="Raleway,sans-serif" fontSize="10" fontWeight="700" fill="#C9A84C">E</text></svg><div className="rc-bottom"><div><div className="rc-b-label">EXAMPLE ONLY</div><div style={{fontFamily:'var(--font)',fontSize:'40px',fontWeight:800,color:'var(--gold)',lineHeight:1}}>84</div></div><div><div className="rc-b-label">DESIGNATION</div><div className="rc-desig">ILLUSTRATIVE · NOT AN ASSESSMENT</div></div></div></Reveal>
        </div>
      </section>

      <section className="home-featured-event" aria-labelledby="event-title">
        <div className="container home-event-grid">
          <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">COMING SOON</span></div><h2 id="event-title">The professional<br/><em>standard series.</em></h2></Reveal>
          <Reveal className="home-event-copy"><p>Live conversations on capability, leadership, influence, relationships and enterprise. New sessions are announced as registration opens.</p><div className="home-event-actions"><a href="/events" className="btn-gold">VIEW EVENTS <span aria-hidden="true">→</span></a><a href="/insights" className="text-link">READ INSIGHTS <span aria-hidden="true">→</span></a></div></Reveal>
        </div>
      </section>

      <section className="home-insights" aria-labelledby="insights-title">
        <div className="container home-insights-grid"><Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-text">INSIGHTS</span></div><h2 id="insights-title">Ideas for the<br/><em>professional room.</em></h2></Reveal><Reveal className="home-insights-copy"><p>Perspectives on capability, leadership, influence and professional opportunity — built to help professionals think beyond the job title.</p><a className="text-link" href="/insights">EXPLORE INSIGHTS <span aria-hidden="true">→</span></a></Reveal></div>
      </section>

      <section className="webinar-replay" id="webinar" aria-labelledby="replay-title"><div className="container"><Reveal className="wr-inner"><div className="eyebrow" style={{justifyContent:'center'}}><div className="eyebrow-line"/><span className="eyebrow-text">SESSION 01 · WATCH THE REPLAY</span><div className="eyebrow-line"/></div><h2 id="replay-title" className="wr-title">Why being good at your job<br/>is no longer <em>enough.</em></h2><p className="wr-sub">Watch the full session on the VALU Index, the PRIME framework and Valoria’s belief that talent is not the problem — infrastructure is.</p><div className="wr-video"><iframe src="https://www.youtube.com/embed/B9dD22vTErI" title="Valoria Institute — Launch Webinar Replay" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><a href="/valu" className="btn-gold" style={{marginTop:'clamp(28px,4vw,40px)'}}>EXPLORE THE VALU INDEX <span aria-hidden="true">→</span></a></Reveal></div></section>
    </main>
    <Footer />
  </>
}
