import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import ContactForm from './ContactForm'
import { BRAND } from '@/lib/brand'
import '../pages.css'

export const metadata = {
  title: 'Institutional Partnerships & Enquiries | Valoria Institute',
  description: 'Discuss talent access, speaker and facilitator sourcing, professional development, or an institutional partnership with Valoria Institute.',
}

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="contact-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">FOR ORGANISATIONS & INSTITUTIONS</span></div>
            <h1 className="page-title">Let&apos;s build a better<br /><em>capability conversation.</em></h1>
            <p className="page-sub">
              Tell us what your organisation needs to achieve. We can discuss talent discovery, speaker and facilitator sourcing, capability development or a wider institutional partnership.
            </p>
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-inner two-col">
            <Reveal>
              <div className="info-card">
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">SEND A MESSAGE</span></div>
                <ContactForm />
              </div>
            </Reveal>
            <Reveal>
              <div className="info-card" className="info-card contact-direct-card">
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">EMAIL DIRECTLY</span></div>
                <a href={`mailto:${BRAND.email}`} className="contact-email">{BRAND.email}</a>
                <p className="contact-note">We respond within two business days.</p>
              </div>
              <div className="info-card">
                <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">LOCATION</span></div>
                <p className="contact-location">{BRAND.location}</p>
                <p className="contact-note">A {BRAND.copyrightEntity} initiative. {BRAND.compliance}.</p>
              </div>
            </Reveal>
          </div>
        </section>


      </main>
      <Footer />
    </>
  )
}
