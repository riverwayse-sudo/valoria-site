export default function VALUJourneyProgress({ stage = 'taster' }) {
  const steps = [
    { key: 'registration', title: 'Register' },
    { key: 'taster', title: 'Taster' },
    { key: 'account', title: 'Account' },
    { key: 'full', title: 'Assessment' },
  ]
  const active = Math.max(0, steps.findIndex(step => step.key === stage))
  return (
    <nav aria-label="Assessment journey" style={{ margin: '0 0 16px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8 }}>
        {steps.map((step,index) => {
          const done = index < active
          const current = index === active
          return <div key={step.key} aria-current={current ? 'step' : undefined} style={{ minWidth:0 }}>
            <div style={{ height:2, borderRadius:99, background:done || current ? '#C9A84C' : 'rgba(247,244,238,.14)' }} />
            <span style={{ display:'block', marginTop:6, color:current ? '#FAFAF7' : 'rgba(247,244,238,.48)', fontSize:9, fontWeight:700, letterSpacing:'.06em' }}>{step.title}</span>
          </div>
        })}
      </div>
    </nav>
  )
}
