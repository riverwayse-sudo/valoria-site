import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import HeroSlider from '@/components/HeroSlider'
import LiveProfilesScroll from '@/components/LiveProfilesScroll'
import HomepageEvents from '@/components/HomepageEvents'
import './home.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Valoria Institute — Worth, Built.',
  description: 'Valoria Institute helps professionals understand capability, build credible professional profiles and connect with relevant opportunities through PRIME, the VALU Index and the Valoria Marketplace.',
  alternates: { canonical: 'https://valoriainstitute.com/' },
  openGraph: { title: 'Valoria Institute — Worth, Built.', description: 'Make your capability count.', url: 'https://valoriainstitute.com/' },
  twitter: { card: 'summary_large_image', title: 'Valoria Institute — Worth, Built.' },
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="home-redesign-root vi-home-editorial">
        <HeroSlider />

        <section className="vi-audience-section home-pathways" aria-labelledby="vi-audience-title">
          <div className="vi-section-intro">
            <span className="vi-section-kicker">TWO CLEAR WAYS IN</span>
            <h2 id="vi-audience-title">Where do you want<br /><em>to go next?</em></h2>
          <p>Choose the path that matches the decision ahead: understand your own capability or access talent for your organisation.</p>
          </div>
          <div className="vi-audience-grid">
            <Reveal className="vi-audience-panel vi-audience-professional valu-conversion">
              <span className="vi-audience-number">01 / PROFESSIONALS</span>
              <h3>Your next move<br />starts with <em>clarity.</em></h3>
              <p>Explore your strengths, understand your PRIME capability profile and build a professional presence that can be discovered.</p>
              <a href="/valu" className="vi-audience-link">Explore your VALU Index <span>↗</span></a>
            </Reveal>
            <Reveal className="vi-audience-panel vi-audience-organisations">
              <span className="vi-audience-number">02 / ORGANISATIONS</span>
              <h3>Find the capability<br />your work <em>needs.</em></h3>
              <p>Discover talent, speakers and facilitators through a shared framework for understanding professional capability.</p>
              <a href="/atb-connect" className="vi-audience-link">Explore talent access <span>↗</span></a>
              <div className="vi-audience-secondary-links" aria-label="Event and facilitation pathways"><a href="/marketplace/speakers">FOR EVENT ORGANISERS ↗</a><a href="/marketplace/facilitators">FOR FACILITATORS ↗</a></div>
            </Reveal>
          </div>
        </section>

        <section className="vi-standard-strip" aria-label="Valoria capability system">
          <div className="vi-standard-heading"><span>THE VALORIA STANDARD</span><strong>One framework.<br />A clearer view of capability.</strong></div>
          <div className="vi-standard-step"><b>01</b><span>PRIME</span><small>Understand capability</small></div>
          <div className="vi-standard-step"><b>02</b><span>VALU INDEX</span><small>See it in points</small></div>
          <div className="vi-standard-step"><b>03</b><span>MARKETPLACE</span><small>Connect to opportunity</small></div>
          <a href="/prime" className="vi-standard-link">Explore the framework ↗</a>
        </section>

        <LiveProfilesScroll />

        <section className="vi-develop-band">
          <div><span className="vi-section-kicker">DEVELOP · CONNECT · CONTRIBUTE</span><h2>Capability is not<br />the destination. <em>It’s the beginning.</em></h2></div>
          <a href="/develop">Explore Valoria Develop <span>↗</span></a>
        </section>

        <HomepageEvents />
      </main>
      <Footer />
    </>
  )
}
