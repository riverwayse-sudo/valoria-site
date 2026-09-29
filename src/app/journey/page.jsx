import ValoriaJourneyCards from '@/components/ValoriaJourneyCards'
import Link from 'next/link'

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

      <section style={{ maxWidth:1100, margin:'10px auto 0', padding:'0 clamp(20px,4vw,40px)' }}>
        <div style={{ borderTop:'1px solid rgba(201,168,76,.16)', paddingTop:28 }}>
          <div style={{ color:'rgba(201,168,76,.6)', fontSize:9, fontWeight:800, letterSpacing:'.16em', marginBottom:16 }}>OTHER ENTRY POINTS</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:10 }}>
            {[
              ['VALU','Understand your professional value','https://assessment.valoriainstitute.com/',true],
              ['EVENTS','Attend a Valoria session','/events',false],
              ['MARKETPLACE','Discover assessed professionals','/marketplace',false],
              ['INSIGHTS','Learn with Valoria','/insights',false],
            ].map(([title,desc,href,external]) => (
              external
                ? <a key={title} href={href} target="_blank" rel="noopener noreferrer" style={entryStyle}>{title}<span>{desc}</span>→</a>
                : <Link key={title} href={href} style={entryStyle}>{title}<span>{desc}</span>→</Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

const entryStyle = {
  display:'flex',
  flexDirection:'column',
  gap:8,
  minHeight:120,
  padding:'18px',
  background:'#1A1A2E',
  border:'1px solid rgba(250,250,247,.08)',
  color:'#C9A84C',
  textDecoration:'none',
  fontSize:10,
  fontWeight:800,
  letterSpacing:'.1em',
}
