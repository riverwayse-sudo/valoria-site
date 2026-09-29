import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic='force-dynamic'
export const revalidate=0

const supabase=createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {auth:{persistSession:false,autoRefreshToken:false}}
)

export default async function CertificateVerificationPage({params}) {
  const {data:certificate}=await supabase
    .from('professional_certificates')
    .select('certificate_number,title,event_title,event_date,issuer,issued_at,professional_id')
    .eq('verification_token',params.token)
    .is('revoked_at',null)
    .maybeSingle()

  if(!certificate) {
    return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',fontFamily:'Raleway,sans-serif',display:'grid',placeItems:'center',padding:24}}>
      <div style={{maxWidth:560,textAlign:'center'}}>
        <div style={{fontSize:10,letterSpacing:'.18em',color:'#C9A84C',fontWeight:700}}>VALORIA INSTITUTE</div>
        <h1 style={{fontSize:'clamp(34px,6vw,56px)',margin:'18px 0 12px'}}>Certificate not found.</h1>
        <p style={{color:'rgba(247,244,238,.55)',lineHeight:1.7}}>The certificate may be invalid, revoked, or the verification code may be incomplete.</p>
        <Link href="/" style={{display:'inline-block',marginTop:24,color:'#C9A84C',textDecoration:'none'}}>← Return to Valoria Institute</Link>
      </div>
    </main>
  }

  const date=new Intl.DateTimeFormat('en-NG',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Lagos'}).format(new Date(certificate.event_date))
  const issued=new Intl.DateTimeFormat('en-NG',{day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Lagos'}).format(new Date(certificate.issued_at))

  return <main style={{minHeight:'100vh',background:'#0F0F1A',color:'#F7F4EE',fontFamily:'Raleway,sans-serif',padding:'80px 24px'}}>
    <div style={{maxWidth:860,margin:'0 auto',border:'1px solid rgba(201,168,76,.32)',background:'#1A1A2E',padding:'clamp(34px,7vw,80px)',position:'relative'}}>
      <div style={{position:'absolute',inset:14,border:'1px solid rgba(201,168,76,.12)',pointerEvents:'none'}}/>
      <div style={{position:'relative',textAlign:'center'}}>
        <div style={{fontSize:10,letterSpacing:'.24em',color:'#C9A84C',fontWeight:700}}>VALORIA INSTITUTE</div>
        <div style={{fontSize:9,letterSpacing:'.16em',color:'rgba(247,244,238,.45)',marginTop:10}}>VERIFIED PROFESSIONAL RECORD</div>
        <h1 style={{fontSize:'clamp(34px,6vw,62px)',fontWeight:500,margin:'52px 0 16px'}}>Certificate of Attendance</h1>
        <p style={{fontSize:16,color:'rgba(247,244,238,.62)',lineHeight:1.7}}>This record confirms verified attendance at</p>
        <h2 style={{fontSize:'clamp(24px,4vw,40px)',fontWeight:500,color:'#C9A84C',lineHeight:1.15,margin:'20px auto',maxWidth:680}}>{certificate.event_title}</h2>
        <div style={{margin:'34px auto',width:70,height:1,background:'#C9A84C'}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,textAlign:'left',marginTop:34}}>
          <div><div style={{fontSize:8,letterSpacing:'.16em',color:'rgba(201,168,76,.55)',fontWeight:700}}>EVENT DATE</div><div style={{marginTop:7,fontSize:14}}>{date}</div></div>
          <div><div style={{fontSize:8,letterSpacing:'.16em',color:'rgba(201,168,76,.55)',fontWeight:700}}>ISSUED</div><div style={{marginTop:7,fontSize:14}}>{issued}</div></div>
          <div><div style={{fontSize:8,letterSpacing:'.16em',color:'rgba(201,168,76,.55)',fontWeight:700}}>CERTIFICATE</div><div style={{marginTop:7,fontSize:12,fontVariantNumeric:'tabular-nums'}}>{certificate.certificate_number}</div></div>
        </div>
        <div style={{marginTop:46,paddingTop:24,borderTop:'1px solid rgba(201,168,76,.14)',fontSize:11,color:'rgba(247,244,238,.42)',letterSpacing:'.06em'}}>Authenticity can be verified through this Valoria Institute record.</div>
      </div>
    </div>
  </main>
}
