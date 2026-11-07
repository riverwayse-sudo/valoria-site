import Link from 'next/link'
import KnowledgeArticle from '@/components/KnowledgeArticle'
import { PRIME_CLUSTERS } from '@/lib/brand'

export const metadata = {
  title: 'The PRIME Framework: Five Clusters and 17 Skills | Valoria Institute',
  description: 'Explore the canonical PRIME Framework across Presence, Relationships, Intelligence, Mastery and Enterprise.',
  alternates: { canonical: 'https://valoriainstitute.com/knowledge/prime-framework' },
}

export default function PrimeKnowledgePage() {
  return (
    <KnowledgeArticle
      title="The PRIME Framework"
      eyebrow="VALORIA CAPABILITY ARCHITECTURE"
      description="PRIME is Valoria’s capability architecture: five connected clusters that organise 17 professional skills into a shared language for assessment, development and discovery."
      path="/knowledge/prime-framework"
    >
      <h2 className="section-title">Five clusters. Seventeen skills.</h2>
      {PRIME_CLUSTERS.map(cluster => (
        <section className="prime-cluster" key={cluster.letter}>
          <div className="cluster-letter prime-letter">{cluster.letter}</div>
          <div>
            <h3 className="cluster-name prime-name">{cluster.name}</h3>
            <div className="prime-subtitle">{cluster.subtitle}</div>
            <ul className="prime-signals">
              {cluster.skills.map(skill => (
                <li className="prime-signal" key={skill}>
                  <span className="prime-signal-mark">{['AI Fluency', 'Human-AI Collaboration'].includes(skill) ? '★' : '•'}</span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <p className="prime-future-note">★ Future-Ready skill — critical for the professional talent market of 2025 to 2035.</p>
      <p className="page-copy">PRIME provides a common structure for understanding and developing capability. It is a framework, not a professional licence or a guarantee of performance.</p>
      <p className="page-copy"><Link className="text-link" href="/prime">Explore PRIME at Valoria →</Link></p>
    </KnowledgeArticle>
  )
}
