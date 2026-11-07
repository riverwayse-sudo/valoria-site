'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { supabase } from '@/lib/supabase'
import MarketplaceCTA from './MarketplaceCTA'
import { AssessmentStartLink } from './Nav'

export default function Footer() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  useEffect(() => { supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setAuthChecked(true) }); const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null)); return () => listener.subscription.unsubscribe() }, [])
  function handleSignOut() { supabase.auth.signOut().then(() => { window.location.href = '/' }) }
  return <>
    
    <footer className="vi-footer"><div className="container"><div className="uf-grid"><div className="uf-brand"><img src={BRAND.logo} alt="Valoria Institute" style={{height:'52px',width:'auto',display:'block',marginBottom:'16px'}}/><p className="uf-desc">A professional capability platform helping people understand what they bring, build a stronger professional presence and connect with meaningful opportunity.</p><div className="uf-tagline">Worth. Built.</div></div><div><div className="uf-col-title">Explore Valoria</div><ul className="uf-links"><li><AssessmentStartLink href={BRAND.assessmentUrl}>VALU Index</AssessmentStartLink></li><li><MarketplaceCTA>Marketplace</MarketplaceCTA></li><li><Link href="/prime">PRIME Framework</Link></li><li><Link href="/marketplace/talent">ATB Connect</Link></li><li><Link href="/marketplace/speakers">ATB Spotlight</Link></li><li><Link href="/develop">Valoria Develop</Link></li></ul></div><div><div className="uf-col-title">Company</div><ul className="uf-links"><li><Link href="/about-us">About Us</Link></li><li><Link href="/events">Events</Link></li><li><Link href="/insights">Insights</Link></li><li><Link href="/contact-us">Contact</Link></li><li><Link href="/careers">Careers</Link></li></ul></div><div><div className="uf-col-title">Legal</div><ul className="uf-links"><li><Link href="/privacypolicy">Privacy Policy</Link></li><li><Link href="/terms-of-use">Terms of Use</Link></li></ul><div className="uf-col-title" style={{marginTop:'28px'}}>Get Started</div><ul className="uf-links"><li><AssessmentStartLink href={BRAND.assessmentUrl} className="uf-cta">Start the 9-question taster →</AssessmentStartLink></li>{authChecked&&(user?<><li><Link href="/dashboard">Dashboard</Link></li><li><button onClick={handleSignOut}>Sign Out</button></li></>:<><li><Link href="/signup">Create Account</Link></li><li><Link href="/login">Sign In</Link></li></>)}</ul></div></div><div className="uf-bottom"><span>&copy; {new Date().getFullYear()} {BRAND.copyrightEntity} &middot; {BRAND.name} &middot; {BRAND.location}</span><span><a href={`mailto:${BRAND.email}`} style={{color:'rgba(247,244,238,.76)',textDecoration:'none'}}>{BRAND.email}</a></span></div></div></footer>
  </>
}
