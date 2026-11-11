import Link from 'next/link'
import KnowledgeArticle from '@/components/KnowledgeArticle'
import { PRIME_CLUSTERS } from '@/lib/brand'

export const metadata = {
  title: 'The PRIME Framework | Valoria Institute',
  description: 'Explore the five proprietary capability clusters that structure Valoria’s professional capability framework.',
  alternates: { canonical: 'https://valoriainstitute.com/knowledge/prime-framework' },
}

export default function PrimeKnowledgePage() {
  return (
    <KnowledgeArticle
      title="The PRIME Framework"
      eyebrow="VALORIA CAPABILITY ARCHITECTURE"
      description="PRIME is Valoria’s proprietary five-cluster capability framework. Its five dimensions provide a shared language for understanding professional capability, development and discovery. The detailed skill architecture and assessment criteria are proprietary to Valoria Institute."
      path="/knowledge/prime-framework"
    >
      <h2 className="section-title">Five clusters. One coherent framework.</h2>
      {PRIME_CLUSTERS.map(cluster => (
        <section className="prime-cluster" key={cluster.letter}>
          <div className="cluster-letter prime-letter">{cluster.letter}</div>
          <div>
            <h3 className="cluster-name prime-name">{cluster.name}</h3>
            <div className="prime-subtitle">{cluster.subtitle}</div>
            <p className="page-copy">One of five connected dimensions within Valoria’s professional capability framework.</p>

          </div>
        </section>
      ))}
      <p className="page-copy">PRIME provides a common structure for understanding and developing capability. It is a framework, not a professional licence or a guarantee of performance.</p>
      <p className="page-copy"><Link className="text-link" href="/prime">Explore PRIME at Valoria →</Link></p>
    </KnowledgeArticle>
  )
}
