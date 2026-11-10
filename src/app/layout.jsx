import '../styles/globals.css'
import '../styles/brand-standard.css'
import '../styles/card-system.css'
import '../styles/homepage-actions.css'
import '../styles/motion.css'
import '../styles/component-system.css'
import '../styles/navigation-awakening.css'
import '../styles/design-constitution.css'
import './pages.css'
import '../styles/left-alignment.css'
import Script from 'next/script'
import ValuCompletionNudge from '../components/ValuCompletionNudge'
import MarketingInstrumentation from '../components/MarketingInstrumentation'
import ParallaxController from '../components/ParallaxController'

const SITE_URL = 'https://valoriainstitute.com'
const SITE_NAME = 'Valoria Institute'
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const IS_STAGING = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.VALU_PREVIEW === '1' || process.env.VERCEL_ENV === 'preview' || process.env.CF_WORKERS_PREVIEW === '1'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-63M4SRXQKM'
const DESCRIPTION = "Valoria Institute helps professionals understand their capabilities, build a stronger professional presence and connect with opportunity through the VALU Index, PRIME framework and Valoria Marketplace."

export const metadata = { metadataBase:new URL(SITE_URL), title:{default:'Valoria Institute — Worth. Built.',template:'%s | Valoria Institute'}, description:DESCRIPTION, keywords:['professional capability marketplace','professional capability assessment','VALU Index','PRIME framework','professional development','talent discovery','speaker discovery','facilitator discovery','Nigeria','Africa'], authors:[{name:'Valoria Institute'}], applicationName:SITE_NAME, category:'Business', robots:IS_STAGING?{index:false,follow:false}:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}}, openGraph:{type:'website',siteName:SITE_NAME,locale:'en_NG',title:'Valoria Institute — Worth. Built.',description:DESCRIPTION,images:[{url:'/logo.png?v=20260922-2',width:1200,height:630,alt:'Valoria Institute — Worth. Built.'}]}, twitter:{card:'summary_large_image',title:'Valoria Institute — Worth. Built.',description:DESCRIPTION,images:['/logo.png?v=20260922-2']}, icons:{icon:'/logo.png',shortcut:'/logo.png',apple:'/logo.png'} }

const organizationSchema = {'@context':'https://schema.org','@type':'Organization',name:'Valoria Institute',url:SITE_URL,logo:`${SITE_URL}/logo.png`,description:DESCRIPTION,slogan:'Worth. Built.',areaServed:[{'@type':'Country',name:'Nigeria'}],address:{'@type':'PostalAddress',addressLocality:'Lagos',addressCountry:'NG'},sameAs:[],makesOffer:[{'@type':'Offer',name:'ATB Connect — Capability-Led Talent Discovery',description:'Employer pathway for exploring professional profiles and requesting buyer access. Search availability depends on the public Marketplace inventory.',url:`${SITE_URL}/atb-connect`},{'@type':'Offer',name:'ATB Spotlight — Speaker and Facilitator Discovery',description:'Event organiser and training buyer pathway for discovering speakers and facilitators through capability-led profiles, where available.',url:`${SITE_URL}/atb-spotlight`},{'@type':'Offer',name:'Valoria Develop — PRIME-Based Professional Development',description:'Professional development pathways structured around the PRIME framework. Programme availability and certification status are confirmed on the service page.',url:`${SITE_URL}/develop`}]}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'en-NG',
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationSchema)}} /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteSchema)}} /></head>
      <body>
        {IS_STAGING ? <div className="staging-site-banner" role="status">STAGING PREVIEW · NOT PRODUCTION · ISOLATED TEST ENVIRONMENT</div> : <MarketingInstrumentation />}
        {!IS_STAGING && GA_MEASUREMENT_ID && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive"/><Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}</Script></>}
        {!IS_STAGING && META_PIXEL_ID && <><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f.fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script><noscript><img height="1" width="1" alt="" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}/></noscript></>}
        {children}
        <ValuCompletionNudge />
      </body>
    </html>
  )
}