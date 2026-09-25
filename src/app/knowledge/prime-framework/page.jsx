import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { PRIME_CLUSTERS } from '@/lib/brand'

export const metadata = {
  title: 'What Is the PRIME Framework?',
  description: 'Learn how Valoria Institute’s PRIME framework defines professional capability across Presence, Relationships, Intelligence, Mastery and Enterprise.',
  alternates: { canonical: '/knowledge/prime-framework' },
}

const answer='PRIME is Valoria Institute’s proprietary capability architecture. It organises professional capability into five dimensions: Presence, Relationships, Intelligence, Mastery and Enterprise, covering 17 skills in total.'

export default function PrimeKnowledge(){
 const schema={'@context':'https://schema.org','@type':'Article','headline':'What Is the PRIME Framework?','description':answer,'author':{'@type':'Organization','name':'Valoria Institute'},'publisher':{'@type':'Organization','name':'Valoria Institute','logo':{'@type':'ImageObject','url':'https://valoriainstitute.com/valoria-original.png'}},'mainEntityOfPage':'https://valoriainstitute.com/knowledge/prime-framework'}
 return <><Nav/><main style={{background:'#F7F4EE',color:'#1A1A2E',minHeight:'100vh'}}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><section style={{padding:'150px 24px 90px',background:'#1A1A2E',color:'#F7F4EE'}}><div style={{maxWidth:1000,margin:'0 auto'}}><div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.2em'}}>PRIME FRAMEWORK · EXPLAINED</div><h1 style={{fontFamily:'var(--font)',fontSize:'clamp(48px,7vw,84px)',fontWeight:300,lineHeight:1,margin:'24px 0'}}>What is the<br/><em style={{color:'#C9A84C'}}>PRIME Framework?</em></h1><p style={{fontSize:20,lineHeight:1.75,color:'rgba(247,244,238,.62)'}}>{answer}</p></div></section><section style={{padding:'90px 24px'}}><div style={{maxWidth:1000,margin:'0 auto'}}><h2 style={{fontFamily:'var(--font)',fontSize:42,fontWeight:400}}>The five dimensions</h2>{PRIME_CLUSTERS.map(c=><article key={c.letter} style={{padding:'30px 0',borderBottom:'1px solid #D4C9A8'}}><div style={{display:'flex',gap:20,alignItems:'baseline'}}><b style={{color:'#9A7428',fontSize:30}}>{c.letter}</b><h3 style={{fontSize:24,margin:0}}>{c.name}</h3></div><p style={{color:'#555565',lineHeight:1.7}}> {c.subtitle}. The PRIME architecture includes {c.skills.join(', ')}.</p></article>)}<div style={{marginTop:45,display:'flex',gap:20,flexWrap:'wrap'}}><Link href="/prime" style={{color:'#8A6B27',fontWeight:800,textDecoration:'none'}}>EXPLORE PRIME →</Link><Link href="/valu" style={{color:'#8A6B27',fontWeight:800,textDecoration:'none'}}>TAKE VALU →</Link></div></div></section></main><Footer/></>
}