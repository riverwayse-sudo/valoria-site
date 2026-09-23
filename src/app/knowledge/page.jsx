import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Professional Capability Knowledge Hub',
  description: 'Authoritative explanations of the VALU Index, PRIME framework, professional capability and Valoria Institute pathways.',
  alternates: { canonical: '/knowledge' },
}

const entries = [
  ['VALU Index', 'What is the VALU Index?', 'A structured professional-readiness diagnostic built around the five PRIME dimensions.', '/knowledge/valu-index'],
  ['PRIME Framework', 'What is the PRIME Framework?', 'Valoria Institute’s capability architecture across Presence, Relationships, Intelligence, Mastery and Enterprise.', '/knowledge/prime-framework'],
  ['Professional Capability', 'What is professional capability?', 'A practical framework for understanding capability beyond job title, CV and years of experience.', '/knowledge/professional-capability'],
]

const schema = {
  '@context':'https://schema.org',
  '@type':'CollectionPage',
  name:'Valoria Institute Knowledge Hub',
  description:'Authoritative explanations of professional capability, VALU and PRIME.',
  url:'https://valoriainstitute.com/knowledge',
  isPartOf:{'@type':'WebSite','@id':'https://valoriainstitute.com/#website'},
}

export default function KnowledgePage(){
  return <><Nav/><main style={{background:'#F7F4EE',color:'#1A1A2E',minHeight:'100vh'}}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <section style={{padding:'150px 24px 90px',background:'#1A1A2E',color:'#F7F4EE'}}><div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{fontSize:10,fontWeight:800,letterSpacing:'.2em',color:'#C9A84C'}}>VALORIA INSTITUTE · KNOWLEDGE</div>
      <h1 style={{fontFamily:'var(--font)',fontSize:'clamp(52px,7vw,90px)',fontWeight:300,lineHeight:.98,letterSpacing:'-.05em',margin:'24px 0'}}>Understand the<br/><em style={{color:'#C9A84C'}}>standard.</em></h1>
      <p style={{maxWidth:700,fontSize:19,lineHeight:1.7,color:'rgba(247,244,238,.62)'}}>Clear explanations of the ideas, assessments and capability architecture behind Valoria Institute.</p>
    </div></section>
    <section style={{padding:'90px 24px'}}><div style={{maxWidth:1180,margin:'0 auto',display:'grid',gap:18}}>{entries.map(([k,t,b,h])=><Link key={h} href={h} style={{display:'block',padding:'30px',border:'1px solid #D4C9A8',textDecoration:'none',color:'#1A1A2E',background:'#FAFAF7'}}>
      <div style={{fontSize:9,fontWeight:800,letterSpacing:'.16em',color:'#9A7428'}}>{k}</div><h2 style={{fontFamily:'var(--font)',fontSize:30,fontWeight:500,margin:'14px 0 8px'}}>{t}</h2><p style={{margin:0,color:'#555565',lineHeight:1.7}}>{b}</p>
    </Link>)}</div></section>
  </main><Footer/></>
}
