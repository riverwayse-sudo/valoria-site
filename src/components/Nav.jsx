'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NotificationBell from './NotificationBell'

const ASSESSMENT_URL = 'https://assessment.valoriainstitute.com/'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [accountType, setAccountType] = useState(null)

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll) }, [])
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [menuOpen])
  useEffect(() => { supabase.auth.getUser().then(({ data: { user: u } }) => { setUser(u); setAuthChecked(true) }); const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null)); return () => listener.subscription.unsubscribe() }, [])
  useEffect(() => {
    if (!user) { setAccountType(null); return }
    let cancelled = false
    async function checkAccountType() {
      const { data: proProfile } = await supabase.from('professional_profiles').select('id').eq('id', user.id).maybeSingle()
      if (cancelled) return
      if (proProfile) { setAccountType('professional'); return }
      const { data: buyerProfile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (!cancelled) setAccountType(buyerProfile ? 'buyer' : 'none')
    }
    checkAccountType(); return () => { cancelled = true }
  }, [user])

  function signOut() { supabase.auth.signOut().then(() => { window.location.href = '/' }) }
  const close = () => setMenuOpen(false)
  const cta = user ? (accountType === 'professional' ? { label: 'MY PROFILE', href: `/profile/${user.id}` } : { label: 'DASHBOARD', href: '/dashboard' }) : { label: 'TAKE VALU', href: ASSESSMENT_URL }
  const links = [['Marketplace','/marketplace'],['Events','/events'],['Insights','/insights'],['VALU Index',ASSESSMENT_URL],['About','/about-us']]

  return <>
    <style>{`nav.vi-nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:0 var(--pad);height:68px;display:flex;align-items:center;justify-content:space-between;background:var(--nav-bg);border-bottom:1px solid rgba(201,168,76,.08);transition:background .3s}nav.vi-nav.scrolled{background:rgba(15,15,26,.97);backdrop-filter:blur(16px);border-color:rgba(201,168,76,.14)}.nav-logo{display:flex;align-items:center;line-height:0}.nav-logo img{height:40px;width:auto}.nav-links{display:flex;align-items:center;gap:3px;list-style:none;margin:0;padding:0}.nav-link{font-size:11px;color:var(--dim);text-decoration:none;letter-spacing:.07em;padding:8px 12px;transition:color .2s}.nav-link:hover{color:var(--parchment)}.nav-cta{padding:10px 20px;background:var(--gold);color:var(--dark)!important;border-radius:var(--btn-radius);font-size:10px;font-weight:800;letter-spacing:.12em;text-decoration:none;margin-left:7px;white-space:nowrap}.nav-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:0}.nav-burger span{display:block;width:22px;height:1.5px;background:var(--parchment);transition:.3s}.nav-burger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}.nav-burger.open span:nth-child(2){opacity:0}.nav-burger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}.nav-mobile{display:none;position:fixed;inset:68px 0 0;background:rgba(10,10,20,.98);z-index:199;padding:28px var(--pad) 48px;overflow:auto;backdrop-filter:blur(20px)}.nav-mobile.open{display:flex;flex-direction:column}.nav-mobile a,.nav-mobile button{font:300 20px var(--font);color:var(--dim);text-decoration:none;padding:16px 0;border:0;border-bottom:1px solid rgba(255,255,255,.05);background:none;text-align:left}.m-label{font-size:9px;font-weight:800;letter-spacing:.18em;color:rgba(201,168,76,.45);margin:20px 0 2px;text-transform:uppercase}.m-cta{margin-top:24px!important;padding:16px 20px!important;background:var(--gold)!important;color:var(--dark)!important;text-align:center!important;font-size:11px!important;font-weight:800!important;letter-spacing:.12em!important;border:0!important}.nav-signout{cursor:pointer}@media(max-width:1020px){.nav-links{display:none}.nav-burger{display:flex}}`}</style>
    <nav className={`vi-nav${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="nav-logo" aria-label="Valoria Institute home"><img src="/logo.png" alt="Valoria Institute" /></Link>
      <ul className="nav-links" role="list">
        {links.map(([label, href]) => <li key={label}><a href={href} className="nav-link">{label}</a></li>)}
        {authChecked && user && <><li><Link href="/dashboard" className="nav-link">Dashboard</Link></li><li><NotificationBell userId={user.id} /></li><li><button onClick={signOut} className="nav-link" style={{background:'none',border:0,cursor:'pointer'}}>Sign Out</button></li></>}
        {authChecked && !user && <li><Link href="/login" className="nav-link">Sign In</Link></li>}
        <li><a href={cta.href} className="nav-cta">{cta.label}</a></li>
      </ul>
      <button className={`nav-burger${menuOpen ? ' open' : ''}`} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
    </nav>
    <nav className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation">
      <div className="m-label">Explore Valoria</div>
      {links.map(([label, href]) => <a key={label} href={href} onClick={close}>{label}</a>)}
      <div className="m-label">Account</div>
      {authChecked && (user ? <><Link href="/dashboard" onClick={close}>Dashboard</Link><button className="nav-signout" onClick={() => { close(); signOut() }}>Sign Out</button></> : <Link href="/login" onClick={close}>Sign In</Link>)}
      <a href={cta.href} className="m-cta" onClick={close}>{cta.label}</a>
    </nav>
  </>
}
