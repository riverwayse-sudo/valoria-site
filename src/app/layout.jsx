import '../styles/globals.css'
import '../styles/brand-standard.css'
import '../styles/card-system.css'
import '../styles/homepage-actions.css'
import '../styles/motion.css'
import '../styles/component-system.css'
import '../styles/navigation-awakening.css'
import '../styles/design-constitution.css'
import './pages.css'
import Script from 'next/script'
import ValuCompletionNudge from '../components/ValuCompletionNudge'
import MarketingInstrumentation from '../components/MarketingInstrumentation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://valoriainstitute.com'
const SITE_NAME = 'Valoria Institute'
const IS_STAGING = process.env.VALU_STAGING_API_ENABLED === '1'
const META_PIXEL_ID = IS_STAGING ? undefined : process.env.NEXT_PUBLIC_META_PIXEL_ID
const GA_MEASUREMENT_ID = IS_STAGING ? undefined : (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-63M4SRXQKM')
const DESCRIPTION = "Valoria Institute assesses and develops professional capability through the PRIME framework, helping professionals build credible profiles. Africa is Valoria's first market. It is beginning in Nigeria."

export const metadata = { metadataBase:new URL(SITE_URL), title:{default:'Valoria Institute — Capability should decide who gets seen',template:'%s | Valoria Institute'}, description:DESCRIPTION, keywords:['professional capability institute','professional capability assessment','professional talent marketplace','VALU Index','PRIME framework','executive development','speaker discovery','facilitator discovery','professional development','talent discovery'], authors:[{name:'Valoria Institute'}], applicationName:SITE_NAME, category:'Business', robots:IS_STAGING?{index:false,follow:false,googleBot:{index:false,follow:false}}:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}}, openGraph:{type:'website',siteName:SITE_NAME,locale:'en_US',title:'Valoria Institute — Capability should decide who gets seen',description:DESCRIPTION,images:[{url:'/logo.png?v=20260922-2',width:1200,height:630,alt:'Valoria Institute — Worth, Built.'}]}, twitter:{card:'summary_large_image',title:'Valoria Institute — Worth, Built.',description:DESCRIPTION,images:['/logo.png?v=20260922-2']}, icons:{icon:'/logo.png',shortcut:'/logo.png',apple:'/logo.png'} }

const organizationSchema = {'@context':'https://schema.org','@type':'Organization',name:'Valoria Institute',url:SITE_URL,logo:`${SITE_URL}/logo.png`,description:DESCRIPTION,slogan:'Worth, Built.',areaServed:[{'@type':'Country',name:'Nigeria'}],address:{'@type':'PostalAddress',addressLocality:'Lagos',addressCountry:'NG'},sameAs:[],makesOffer:[{'@type':'Offer',name:'ATB Connect — Talent Discovery',description:'Explore professional profiles by capability and sector, with VALU Index points and designations shown where approved for public display.',url:`${SITE_URL}/marketplace/talent`},{'@type':'Offer',name:'ATB Spotlight — Speaker Discovery',description:'Explore speaker profiles and declared expertise where public listings are available.',url:`${SITE_URL}/marketplace/speakers`},{'@type':'Offer',name:'Valoria Develop — Development Programmes',description:'Explore PRIME-mapped development programmes; facilitator availability and suitability are confirmed for each engagement.',url:`${SITE_URL}/programmes`}]}

export default function RootLayout({ children }) {
  return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationSchema)}} /></head><body>{!IS_STAGING && <MarketingInstrumentation />}{GA_MEASUREMENT_ID&&<><Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive"/><Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}</Script></>}{META_PIXEL_ID&&<><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script><noscript><img height="1" width="1" alt="" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}/></noscript></>}<a className="skip-link" href="#site-content-start">Skip to main content</a><div id="site-content-start" tabIndex={-1} role="region" aria-label="Main content" className="site-content-root">{children}</div><ValuCompletionNudge /></body></html>
}