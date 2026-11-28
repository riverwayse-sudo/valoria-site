import '../styles/globals.css'
import '../styles/brand-standard.css'
import '../styles/card-system.css'
import '../styles/homepage-actions.css'
import '../styles/component-system.css'
import '../styles/navigation-awakening.css'
import '../styles/design-constitution.css'
import './pages.css'
import '../styles/motion.css'
import ValuCompletionNudge from '../components/ValuCompletionNudge'
import MarketingInstrumentation from '../components/MarketingInstrumentation'
import ConsentManager from '../components/ConsentManager'

const IS_STAGING = process.env.VALU_PREVIEW === '1' || process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || (process.env.NEXT_PUBLIC_SITE_URL || '').includes('staging.')
const SITE_URL = IS_STAGING ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.valoriainstitute.com') : 'https://valoriainstitute.com'
const SITE_NAME = 'Valoria Institute'
const META_PIXEL_ID = IS_STAGING ? null : (process.env.NEXT_PUBLIC_META_PIXEL_ID || null)
const GA_MEASUREMENT_ID = IS_STAGING ? null : (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-63M4SRXQKM')
const DESCRIPTION = "Valoria helps professionals understand their capabilities, build a credible professional presence and discover opportunities aligned with what they can contribute."

export const metadata = { metadataBase:new URL(SITE_URL), title:{default:'Valoria Institute — Capability should decide who gets seen',template:'%s | Valoria Institute'}, description:DESCRIPTION, keywords:['professional capability framework','professional capability assessment','VALU Index','PRIME framework','speaker discovery','professional development','capability development','talent discovery'], authors:[{name:'Valoria Institute'}], applicationName:SITE_NAME, category:'Business', robots:IS_STAGING?{index:false,follow:false,googleBot:{index:false,follow:false}}:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}}, openGraph:{type:'website',siteName:SITE_NAME,title:'Valoria Institute — Capability should decide who gets seen',description:DESCRIPTION,images:[{url:'/logo.png?v=20260922-2',width:1200,height:630,alt:'Valoria Institute — Worth, Built.'}]}, twitter:{card:'summary_large_image',title:'Valoria Institute — Worth, Built.',description:DESCRIPTION,images:['/logo.png?v=20260922-2']}, icons:{icon:'/logo.png',shortcut:'/logo.png',apple:'/logo.png'} }

const organizationSchema = {'@context':'https://schema.org','@type':'Organization',name:'Valoria Institute',url:SITE_URL,logo:`${SITE_URL}/logo.png`,description:DESCRIPTION,slogan:'Worth, Built.',address:{'@type':'PostalAddress',addressLocality:'Lagos',addressCountry:'NG'},sameAs:[],makesOffer:[{'@type':'Offer',name:'ATB Connect — Talent Discovery',description:'Explore professional profiles by capability and sector, with VALU points and designations shown where a current Full assessment is available.',url:`${SITE_URL}/marketplace/talent`},{'@type':'Offer',name:'ATB Spotlight — Speaker Discovery',description:'Explore speaker profiles and declared expertise where public listings are available.',url:`${SITE_URL}/marketplace/speakers`},{'@type':'Offer',name:'Valoria Develop — Development Programmes',description:'Explore PRIME-mapped development programmes; facilitator availability and suitability are confirmed for each engagement.',url:`${SITE_URL}/programmes`}]}

export default function RootLayout({ children }) {
  return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationSchema)}} /></head><body className={IS_STAGING ? 'staging-site' : undefined}>{IS_STAGING&&<div className="staging-site-banner" role="status" style={{background:'#C9A84C',color:'#1A1A2E',textAlign:'center',padding:'6px 12px',fontSize:10,fontWeight:900,letterSpacing:'.14em',position:'sticky',top:0,zIndex:20000}}>STAGING PREVIEW · NOT LIVE</div>}<MarketingInstrumentation /><ConsentManager gaMeasurementId={GA_MEASUREMENT_ID} metaPixelId={META_PIXEL_ID} /><a className="skip-link" href="#site-content-start">Skip to main content</a><div id="site-content-start" tabIndex={-1} role="region" aria-label="Main content" className="site-content-root">{children}</div><ValuCompletionNudge /></body></html>
}