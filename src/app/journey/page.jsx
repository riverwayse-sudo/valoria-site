import ValoriaJourneyCards from '@/components/ValoriaJourneyCards'

export const metadata = {
  title: 'Your Valoria Journey',
  robots: { index: false, follow: false },
}

export default function JourneyPage() {
  return (
    <main style={{ minHeight:'100vh', background:'#0F0F1A', color:'#FAFAF7', padding:'90px 0 80px', fontFamily:'Raleway,Arial,sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 clamp(20px,4vw,40px)' }}>
        <div style={{ color:'#C9A84C', fontSize:10, fontWeight:800, letterSpacing:'.18em', marginBottom:12 }}>VALORIA CONTINUITY</div>
        <h1 style={{ margin:0, fontSize:'clamp(34px,6vw,64px)', fontWeight:400, lineHeight:1.02 }}>Continue your<br /><em>Valoria journey.</em></h1>
        <p style={{ maxWidth:680, color:'rgba(250,250,247,.58)', fontSize:15, lineHeight:1.8, margin:'20px 0 0' }}>
          Wherever you entered Valoria, this is your return point. Your completed milestones stay connected and your next step changes with you.
        </p>
      </div>
      <ValoriaJourneyCards />
    </main>
  )
}
