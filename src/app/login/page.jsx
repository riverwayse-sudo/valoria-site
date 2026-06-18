import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Valoria Institute account.',
}

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero" style={{ paddingBottom: '120px' }}>
          <div className="page-hero-inner" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">SIGN IN</span><div className="eyebrow-line" /></div>
            <h1 className="page-title">Sign in on the<br /><em>assessment platform.</em></h1>
            <p className="page-sub" style={{ margin: '0 auto 32px' }}>
              Your account and PRIME profile live on {BRAND.name}&apos;s assessment platform — separate from this marketing site.
            </p>
            <div className="bridge-card">
              <a href={BRAND.assessmentUrl} className="btn-gold" target="_blank" rel="noopener noreferrer" style={{ width: '100%', textAlign: 'center' }}>
                SIGN IN
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
