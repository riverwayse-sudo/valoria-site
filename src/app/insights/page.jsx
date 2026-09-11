import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Insights — Valoria Institute',
  description: 'Perspectives on professional capability, leadership, influence and opportunity from Valoria Institute.',
}

const pieces = [
  ['PROFESSIONAL CAPABILITY', 'Good work is only the beginning.', 'Capability has to be understood, developed and made legible before it can consistently translate into opportunity.'],
  ['VISIBILITY', 'Being seen is not the same as being understood.', 'Professional visibility becomes more valuable when the signal behind the profile is structured, credible and useful to the person making the decision.'],
  ['INFLUENCE', 'Authority is not the only currency in the room.', 'The ability to move people, decisions and outcomes increasingly depends on influence — and influence can be developed deliberately.'],
]

export default function InsightsPage() {
  return <><Nav /><main style={{background:'#F7F4EE',color:'#1A1A2E',minHeight:'100vh',paddingTop:68}}><section style={{padding:'130px 24px 90px',background:'#0F0F1A',color:'#F7F4EE'}}><div style={{maxWidth:1240,margin:'0 auto'}}><div style={{fontSize:10,fontWeight:800,letterSpacing:'.2em',color:'#C9A84C'}}>VALORIA INSTITUTE · INSIGHTS</div><h1 style={{fontFamily:'var(--font)',fontSize:'clamp(54px,7vw,92px)',fontWeight:300,lineHeight:.98,letterSpacing:'-.045em',margin:'22px 0'}}>Ideas worth carrying<br /><em style={{color:'#C9A84C'}}>into the room.</em></h1><p style={{fontSize:19,lineHeight:1.7,color:'rgba(247,244,238,.55)',maxWidth:700}}>Perspectives on professional capability, leadership, influence, work and the systems that determine who gets seen.</p></div></section><section style={{padding:'105px 24px'}}><div style={{maxWidth:1240,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(3,1fr)',borderTop:'1px solid rgba(26,26,46,.2)',borderLeft:'1px solid rgba(26,26,46,.2)'}}>{pieces.map(([k,t,b],i)=><article key={k} style={{minHeight:370,padding:30,borderRight:'1px solid rgba(26,26,46,.2)',borderBottom:'1px solid rgba(26,26,46,.2)',display:'flex',flexDirection:'column'}}><div style={{fontSize:9,fontWeight:800,letterSpacing:'.16em',color:'#9a7428'}}>{k}</div><h2 style={{fontFamily:'var(--font)',fontSize:34,fontWeight:500,lineHeight:1.1,margin:'65px 0 15px'}}>{t}</h2><p style={{fontSize:15,lineHeight:1.7,color:'#555565',marginTop:0}}>{b}</p><div style={{marginTop:'auto',paddingTop:25,fontSize:9,fontWeight:800,letterSpacing:'.12em',color:'#777786'}}>VALORIA EDITORIAL · {String(i+1).padStart(2,'0')}</div></article>)}</div></section></main><Footer /><style>{`@media(max-width:800px){main section:nth-of-type(2)>div{grid-template-columns:1fr!important}.insights-placeholder{padding:80px 18px}}`}</style></>
}
