import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Create an Account',
  description: 'Create your Valoria Institute account and take the VALU Index.',
}

export default function RegisterPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="page-hero" style={{ paddingBottom: '120px' }}>
          <div className="page-hero-inner" style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="eyebrow-line" /><span className="eyebrow-text">CREATE YOUR ACCOUNT</span><div className="eyebrow-line" /></div>
            <h1 className="page-title">Your account lives<br />on the <em>assessment platform.</em></h1>
            <p className="page-sub" style={{ margin: '0 auto 32px' }}>
              Accounts, the VALU Index, and your PRIME profile are all on {BRAND.name}&apos;s assessment platform — separate from this marketing site.
            </p>
            <div className="bridge-card">
              <a href={BRAND.assessmentUrl} className="btn-gold" target="_blank" rel="noopener noreferrer" style={{ width: '100%', textAlign: 'center' }}>
                CREATE ACCOUNT &amp; TAKE THE VALU INDEX
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
