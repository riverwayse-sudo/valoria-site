import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
 title:'What Is Professional Capability?',
 description:'A practical explanation of professional capability and why job title, experience and visibility alone do not fully describe it.',
 alternates:{canonical:'/knowledge/professional-capability'}
}
const faq=[
 ['What is professional capability?','Professional capability is the combination of knowledge, judgement, behaviour and execution that enables a person to create value in a professional context.'],
 ['Why is a job title not enough to describe capability?','A job title identifies a role, but it does not by itself describe how someone communicates, reasons, collaborates, executes, adapts or creates value.'],
 ['How does Valoria structure capability?','Valoria uses the PRIME architecture—Presence, Relationships, Intelligence, Mastery and Enterprise—to organise professional capability into a consistent framework.'],
 ['How does capability connect to opportunity?','Valoria’s model is designed to develop capability, make assessed capability legible and connect eligible professionals to relevant opportunities.']
]
const schema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
export default function CapabilityKnowledge(){return <><Nav/><main style={{background:'#F7F4EE',color:'#1A1A2E',minHeight:'100vh'}}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><section style={{padding:'150px 24px 90px',background:'#1A1A2E',color:'#F7F4EE'}}><div style={{maxWidth:900,margin:'0 auto'}}><div style={{color:'#C9A84C',fontSize:10,fontWeight:800,letterSpacing:'.2em'}}>PROFESSIONAL CAPABILITY · EXPLAINED</div><h1 style={{fontFamily:'var(--font)',fontSize:'clamp(48px,7vw,84px)',fontWeight:300,lineHeight:1,margin:'24px 0'}}>What is<br/><em style={{color:'#C9A84C'}}>professional capability?</em></h1><p style={{fontSize:19,lineHeight:1.75,color:'rgba(247,244,238,.62)'}}>Capability is more than a title. It is the underlying ability to think, relate, deliver and create value.</p></div></section><section style={{padding:'90px 24px'}}><div style={{maxWidth:900,margin:'0 auto'}}><h2 style={{fontFamily:'var(--font)',fontSize:42,fontWeight:400}}>Frequently asked questions</h2>{faq.map(([q,a])=><article key={q} style={{padding:'25px 0',borderBottom:'1px solid #D4C9A8'}}><h3 style={{fontSize:20,margin:'0 0 8px'}}>{q}</h3><p style={{margin:0,lineHeight:1.75,color:'#555565'}}>{a}</p></article>)}</div></section></main><Footer/></>}
