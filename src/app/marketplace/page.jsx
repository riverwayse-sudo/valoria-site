import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import MarketplaceOptionsList from '@/components/MarketplaceOptionsList'
import '../pages.css'

// Previously this route just redirected straight to /atb-connect, silently
// deciding for the visitor which of the three marketplaces they wanted.
// It's now a real chooser page — same options/copy as the MarketplaceCTA
// popup used site-wide, via the shared MarketplaceOptionsList.
export const metadata = {
  title: 'The Marketplace — Choose Your Entry Point | Valoria Institute',
  description: 'One assessed standard, three ways in: ATB Connect for employers, ATB Spotlight for event planners, ATB Develop for L&D leaders.',
  alternates: { canonical: 'https://valoriainstitute.com/marketplace' },
}

export default function MarketplacePage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero">
          <div className="page-hero-inner" style={{ maxWidth: '640px' }}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">ONE STANDARD. THREE WAYS IN.</span></div>
            <h1 className="page-title">Which marketplace<br /><em>are you here for?</em></h1>
            <p className="page-sub">
              Every profile is underwritten by the same assessed standard. Pick the one that matches what you need.
            </p>
            <div style={{ marginTop: '32px', textAlign: 'left' }}>
              <MarketplaceOptionsList />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
