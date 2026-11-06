export default function VALUJourneyProgress({ stage = 'taster', currentQuestion }) {
  const steps = [
    { key: 'taster', title: 'Taster', detail: '9 questions' },
    { key: 'account', title: 'Account', detail: 'Confirm email' },
    { key: 'full', title: 'Full assessment', detail: '58 questions' },
  ]
  const active = Math.max(0, steps.findIndex(step => step.key === stage))
  return (
    <section aria-label="Separate VALU taster and formal assessment journey" style={{ margin: '0 0 22px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:11 }}>
        <span style={{ color:'#C9A84C', fontSize:9, fontWeight:800, letterSpacing:'.16em' }}>TASTER → FORMAL ASSESSMENT</span>
        <span style={{ color:'rgba(247,244,238,.48)', fontSize:10 }}>
          {Number.isInteger(currentQuestion) ? `QUESTION ${currentQuestion} OF 58` : stage === 'full' ? '58-QUESTION FORMAL ASSESSMENT' : 'YOUR NEXT STEP'}
        </span>
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
