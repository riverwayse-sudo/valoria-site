import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Knowledge Hub | Valoria Institute',
  description: 'Authoritative explanations of the VALU Index, PRIME Framework and professional capability.',
  alternates: { canonical: 'https://valoriainstitute.com/knowledge' },
}

const ARTICLES = [
  {
    title: 'The VALU Index',
    description: 'Understand Valoria’s points-based assessment view of professional capability and how results are interpreted.',
    href: '/knowledge/valu-index',
    label: 'ASSESSMENT & INSIGHT',
  },
  {
    title: 'The PRIME Framework',
    description: 'Explore the five capability clusters that structure Valoria’s professional capability model.',
    href: '/knowledge/prime-framework',
    label: 'CAPABILITY ARCHITECTURE',
  },
  {
    title: 'Professional Capability',
    description: 'Understand capability beyond a job title or CV, and how structured insight supports better professional decisions.',
    href: '/knowledge/professional-capability',
    label: 'CORE CONCEPT',
  },
]

export default function KnowledgeHubPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="decision-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">VALORIA KNOWLEDGE</span></div>
            <h1 className="page-title">Understand the ideas<br /><em>behind the platform.</em></h1>
            <p className="page-sub">Clear, authoritative explanations of the framework, assessment and professional capability principles that inform the Valoria experience.</p>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner">
            <div className="programmes-grid">
              {ARTICLES.map(article => (
                <article className="card-gold programme-card" key={article.href}>
                  <div className="programme-label">{article.label}</div>
                  <h2 className="cluster-name">{article.title}</h2>
                  <p className="cluster-desc">{article.description}</p>
                  <Link className="text-link" href={article.href}>READ THE EXPLANATION →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
