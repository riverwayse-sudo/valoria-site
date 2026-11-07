import styles from './IntelligenceDataArchitecture.module.css'

const layers = [
  {
    type: 'RELATIONAL · POSTGRESQL',
    name: 'The system of record',
    status: 'ACTIVE',
    tone: 'active',
    detail: 'Accounts, VALU outcomes, professional profiles, capability records, credentials, employers and opportunities remain in the existing Supabase Postgres database.',
    value: 'Keeps identity, permissions, assessment outcomes and institutional records consistent.',
  },
  {
    type: 'VECTOR · PGVECTOR',
    name: 'Semantic capability retrieval',
    status: 'ENABLED · NOT POPULATED',
    tone: 'ready',
    detail: 'The vector extension is installed and a private professional-search embedding table exists. The staging table currently has zero embeddings.',
    value: 'Can support meaning-based discovery after a governed embedding pipeline is implemented and validated.',
  },
  {
    type: 'RELATIONSHIPS · GRAPH MODEL',
    name: 'The connection layer',
    status: 'RELATIONAL LINKS',
    tone: 'active',
    detail: 'Professional-to-capability, credential, event, employer and opportunity relationships are represented through existing relational records and keys.',
    value: 'Enables connected queries without introducing a separate graph database at this stage.',
  },
  {
    type: 'OBJECT STORAGE',
    name: 'Evidence and documents',
    status: 'ACTIVE · PRIVATE',
    tone: 'active',
    detail: 'Existing private storage buckets hold CVs, career applications and professional evidence, with database records governing verification and visibility.',
    value: 'Separates file content from structured records while preserving access controls.',
  },
  {
    type: 'KEY–VALUE',
    name: 'Short-lived state and cache',
    status: 'NOT PROVISIONED',
    tone: 'deferred',
    detail: 'No separate key–value service is required for the current staging experience. Existing application and database state remains authoritative.',
    value: 'Consider only when measured caching, rate-limit or ephemeral-state workloads justify another service.',
  },
  {
    type: 'WIDE-COLUMN',
    name: 'High-volume analytical workloads',
    status: 'DEFERRED BY DESIGN',
    tone: 'deferred',
    detail: 'Valoria does not currently have a workload that justifies a separate wide-column database.',
    value: 'Revisit only if event telemetry or high-volume time-series workloads outgrow the existing Postgres architecture.',
  },
]

export default function IntelligenceDataArchitecture() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.kicker}><span /> UNDER THE HOOD · CURRENT STAGING ARCHITECTURE</div>
        <h2>Use the right data structure <em>for the right job.</em></h2>
        <p>Valoria does not need six separate database products. The architecture uses the existing platform where it is strongest, and introduces specialised data services only when a real workload warrants them.</p>
      </div>
      <div className={styles.grid}>
        {layers.map((layer, index) => (
          <article className={styles.card} key={layer.type}>
            <div className={styles.cardTop}>
              <span className={styles.number}>0{index + 1}</span>
              <span className={styles.status} data-tone={layer.tone}>{layer.status}</span>
            </div>
            <div className={styles.type}>{layer.type}</div>
            <h3>{layer.name}</h3>
            <p>{layer.detail}</p>
            <div className={styles.value}><b>VALUE TO VALORIA</b><span>{layer.value}</span></div>
          </article>
        ))}
      </div>
      <p className={styles.footnote}>No new paid database, storage service, model provider or subscription has been added. Vector search is not represented as operational until embeddings are generated, indexed and tested against approved records.</p>
    </section>
  )
}
