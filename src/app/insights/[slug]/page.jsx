import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { INSIGHTS, getInsight, getRelatedInsights } from '@/content/insights'

const SITE_URL = 'https://valoriainstitute.com'

export function generateStaticParams() {
  return INSIGHTS.map(item => ({ slug: item.slug }))
}

export async function generateMetadata({ params }) {
  const article = getInsight(params.slug)
  if (!article) return {}
  const url = `${SITE_URL}/insights/${article.slug}`
  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.description,
      siteName: 'Valoria Institute',
      locale: 'en_NG',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ['Valoria Institute'],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.description },
  }
}

export default function InsightArticle({ params }) {
  const article = getInsight(params.slug)
  if (!article) notFound()
  const related = getRelatedInsights(article)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'Valoria Institute', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Valoria Institute', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/insights/${article.slug}` },
    keywords: article.tags.join(', '),
    articleSection: article.category,
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Insights', item: `${SITE_URL}/insights` },
      { '@type': 'ListItem', position: 2, name: article.title, item: `${SITE_URL}/insights/${article.slug}` },
    ],
  }

  return <>
    <Nav />
    <main className="insight-article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <article className="insight-article">
        <header className="insight-article-hero">
          <div className="page-section-inner">
            <Link className="insight-back" href="/insights">← Insights</Link>
            <div className="page-kicker">{article.category}</div>
            <h1 className="insight-article-title">{article.title}</h1>
            <p className="insight-article-dek">{article.description}</p>
            <div className="insight-article-meta">{article.readTime} · Published {article.publishedAt}</div>
          </div>
        </header>
        <div className="page-section-inner insight-article-body">
          {article.body.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          <div className="insight-article-cta">
            <div className="page-kicker">TURN INSIGHT INTO DIRECTION</div>
            <h2>Know where you stand.</h2>
            <p>Start with VALU and turn a clearer picture of your capability into your next professional move.</p>
            <Link className="btn-gold" href="/valu">START MY VALU SNAPSHOT</Link>
          </div>
        </div>
      </article>
      <section className="page-section insight-related">
        <div className="page-section-inner">
          <div className="page-kicker">CONTINUE READING</div>
          <h2 className="section-title">Related insights.</h2>
          <div className="insight-related-grid">
            {related.map(item => (
              <Link className="insight-related-card" key={item.slug} href={`/insights/${item.slug}`}>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <b>READ INSIGHT →</b>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
