import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const SITE_URL = 'https://valoriainstitute.com'

export default function KnowledgeArticle({ title, eyebrow = 'VALORIA KNOWLEDGE', description, path, children }) {
  const url = SITE_URL + path
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Valoria Institute', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Valoria Institute', url: SITE_URL },
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: SITE_URL + '/knowledge' },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  }
  const schemaJson = JSON.stringify([schema, breadcrumb]).replace(/</g, '\\u003c')

  return (
    <>
      <Nav />
      <main id="main-content" className="decision-page">
        <section className="page-hero">
          <div className="page-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">{eyebrow}</span></div>
            <h1 className="page-title">{title}</h1>
            <p className="page-sub">{description}</p>
          </div>
        </section>
        <section className="page-section">
          <div className="page-section-inner prime-narrow">{children}</div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
    </>
  )
}
