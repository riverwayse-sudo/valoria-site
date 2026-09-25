import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'What Is the VALU Index?',
  description: 'Learn what the VALU Index measures, how it relates to PRIME and how the initial assessment differs from the authoritative marketplace assessment.',
  alternates: { canonical: '/knowledge/valu-index' },
}

const faq = [
 ['What is the VALU Index?', 'The VALU Index is Valoria Institute’s professional-readiness diagnostic. It provides a structured view of professional capability through the five dimensions of PRIME.'],
 ['What does VALU measure?', 'VALU is built around Presence, Relationships, Intelligence, Mastery and Enterprise—the five PRIME dimensions used by Valoria Institute.'],
 ['Is the initial VALU assessment the final marketplace score?', 'No. The initial 15-question experience is directional. The authoritative marketplace record requires an account, the full VALU assessment, a completed professional profile and the relevant governance checks.'],
 ['What happens after VALU?', 'The assessment is a starting point. A professional can create an account, complete the authoritative assessment, build the professional profile and become eligible for relevant marketplace pathways when the applicable requirements are satisfied.'],
]

const schema = {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}

export default function ValuKnowledge(){return <><Nav/><main style={{background:'#F7F4EE',color:'#1A1A2E',minHeight:'100vh'}}>
<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
<section style={{padding:'150px 24px 90px',background:'#1A1A2E',color:'#F7F4EE'}}><div style={{maxWidth:900,margin:'0 auto'}}><div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.2em'}}>VALU INDEX · EXPLAINED</div><h1 style={{fontFamily:'var(--font)',fontSize:'clamp(48px,7vw,84px)',fontWeight:300,lineHeight:1,margin:'24px 0'}}>What is the<br/><em style={{color:'#C9A84C'}}>VALU Index?</em></h1><p style={{fontSize:19,lineHeight:1.75,color:'rgba(247,244,238,.62)'}}>The VALU Index gives professionals a structured starting point for understanding capability across the PRIME framework.</p></div></section>
<section style={{padding:'90px 24px'}}><div style={{maxWidth:900,margin:'0 auto'}}><h2 style={{fontFamily:'var(--font)',fontSize:42,fontWeight:400}}>The short answer</h2><p style={{fontSize:18,lineHeight:1.8,color:'#555565'}}>VALU is designed to make professional capability more legible. It is not a job title, CV replacement or permanent label. The public entry experience is a directional assessment; the authoritative marketplace record comes from the full assessment and profile/governance process.</p>
<h2 style={{fontFamily:'var(--font)',fontSize:42,fontWeight:400,marginTop:70}}>How VALU connects to PRIME</h2><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:1,background:'#D4C9A8',marginTop:25}}>{[['P','Presence'],['R','Relationships'],['I','Intelligence'],['M','Mastery'],['E','Enterprise']].map(([l,n])=><div key={l} style={{padding:20,background:'#FAFAF7'}}><b style={{color:'#9A7428',fontSize:28}}>{l}</b><div style={{marginTop:10,fontWeight:700}}>{n}</div></div>)}</div>
<h2 style={{fontFamily:'var(--font)',fontSize:42,fontWeight:400,marginTop:70}}>Frequently asked questions</h2>{faq.map(([q,a])=><article key={q} style={{padding:'25px 0',borderBottom:'1px solid #D4C9A8'}}><h3 style={{fontSize:20,margin:'0 0 8px'}}>{q}</h3><p style={{margin:0,lineHeight:1.75,color:'#555565'}}>{a}</p></article>)}<Link href="/valu" style={{display:'inline-block',marginTop:40,color:'#8A6B27',fontWeight:800,textDecoration:'none'}}>VIEW THE VALU INDEX →</Link></div></section></main><Footer/></>}
