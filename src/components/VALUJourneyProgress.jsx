export default function VALUJourneyProgress({ stage = 'bridge', currentQuestion }) {
  const steps = [
    { key: 'opening', title: 'Opening', detail: 'Questions 1–9' },
    { key: 'bridge', title: 'Account', detail: 'Save & confirm' },
    { key: 'continuation', title: 'Continue', detail: 'Questions 10–58' },
  ]
  const active = Math.max(0, steps.findIndex(step => step.key === stage))
  return (
    <section aria-label="One VALU assessment journey" style={{ margin: '0 0 22px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:11 }}>
        <span style={{ color:'#C9A84C', fontSize:9, fontWeight:800, letterSpacing:'.16em' }}>ONE VALU ASSESSMENT</span>
        <span style={{ color:'rgba(247,244,238,.48)', fontSize:10 }}>{Number.isInteger(currentQuestion) ? `QUESTION ${currentQuestion} OF 58` : 'YOUR PROGRESS IS PRESERVED'}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:8 }}>
        {steps.map((step,index) => {
          const done = index < active
          const current = index === active
          return <div key={step.key} aria-current={current ? 'step' : undefined} style={{ minWidth:0 }}>
            <div style={{ height:3, borderRadius:99, background:done || current ? '#C9A84C' : 'rgba(247,244,238,.12)' }} />
            <div style={{ display:'flex', gap:6, alignItems:'baseline', flexWrap:'wrap', marginTop:8 }}>
              <span style={{ color:done || current ? '#C9A84C' : 'rgba(247,244,238,.4)', fontSize:9, fontWeight:800 }}>{done ? '✓' : `0${index+1}`}</span>
              <span style={{ color:current ? '#FAFAF7' : 'rgba(247,244,238,.58)', fontSize:9, fontWeight:800, letterSpacing:'.08em' }}>{step.title.toUpperCase()}</span>
            </div>
            <div style={{ color:'rgba(247,244,238,.4)', fontSize:9, marginTop:3 }}>{step.detail}</div>
          </div>
        })}
      </div>
    </section>
  )
}
