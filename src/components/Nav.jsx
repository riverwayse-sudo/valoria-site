'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NotificationBell from './NotificationBell'
import { NAVIGATION, isPathActive } from '@/config/navigation'

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [accountType, setAccountType] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const closeMenus = (event) => {
      if (!event.target.closest?.('.vi-nav-menu')) setOpenMenu(null)
    }
    document.addEventListener('click', closeMenus)
    return () => document.removeEventListener('click', closeMenus)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => listener.subscription.unsubscribe()
  }, [])

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
    checkAccountType()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    setMenuOpen(false)
    setOpenMenu(null)
  }, [pathname])

  function signOut() {
    supabase.auth.signOut().then(() => { window.location.href = '/' })
  }

  const close = () => setMenuOpen(false)
  const profileHref = user ? `/profile/${user.id}` : '/login'
  const cta = user
    ? accountType === 'professional'
      ? { label: 'MY PROFILE', href: profileHref }
      : { label: 'DASHBOARD', href: '/dashboard' }
    : { label: 'START VALU', href: NAVIGATION.assessmentUrl, external: true }

  const renderItem = (item, className = 'nav-dropdown-link') => {
    const active = isPathActive(pathname, item.href)
    if (item.external) {
      return <a href={item.href} className={`${className}${active ? ' active' : ''}`} onClick={close}>{item.label}</a>
    }
    return <Link href={item.href} className={`${className}${active ? ' active' : ''}`} onClick={close}>{item.label}</Link>
  }

  return <>
    <style>{`
      nav.vi-nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:0 var(--pad);height:68px;display:flex;align-items:center;justify-content:space-between;background:var(--nav-bg);border-bottom:1px solid rgba(201,168,76,.08);transition:background .3s,box-shadow .3s}
      nav.vi-nav.scrolled{background:rgba(15,15,26,.97);backdrop-filter:blur(16px);border-color:rgba(201,168,76,.14);box-shadow:0 8px 30px rgba(0,0,0,.12)}
      .nav-logo{display:flex;align-items:center;line-height:0;flex:none}.nav-logo img{height:40px;width:auto}
      .nav-links{display:flex;align-items:center;gap:1px;list-style:none;margin:0;padding:0}.nav-links>li{position:relative}
      .nav-link{font-size:11px;color:var(--dim);text-decoration:none;letter-spacing:.07em;padding:10px 12px;transition:color .2s,background .2s;border-radius:999px;white-space:nowrap}
      .nav-link:hover,.nav-link.active{color:var(--parchment);background:rgba(255,255,255,.035)}
      .nav-trigger{font:inherit;border:0;background:transparent;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.nav-chevron{font-size:9px;opacity:.5;transition:transform .2s}.nav-trigger[aria-expanded="true"] .nav-chevron{transform:rotate(180deg)}
      .nav-dropdown{position:absolute;top:calc(100% + 10px);left:50%;transform:translateX(-50%) translateY(-5px);width:510px;padding:18px;background:rgba(15,15,26,.985);border:1px solid rgba(201,168,76,.16);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.38);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s,transform .18s,visibility .18s}
      .nav-dropdown.open{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(-50%) translateY(0)}
      .nav-dropdown-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.nav-dropdown-single{grid-template-columns:1fr}
      .nav-dropdown-label{font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(201,168,76,.65);margin:2px 10px 8px}
      .nav-dropdown-link{display:block;color:var(--parchment);text-decoration:none;padding:10px;border-radius:10px;font-size:13px;transition:background .2s,color .2s}.nav-dropdown-link:hover,.nav-dropdown-link.active{background:rgba(201,168,76,.08);color:var(--gold-light)}
      .nav-dropdown-description{display:block;color:rgba(247,244,238,.45);font-size:10px;line-height:1.45;margin-top:3px}
      .nav-cta{padding:10px 20px;background:var(--gold);color:var(--dark)!important;border-radius:var(--btn-radius);font-size:10px;font-weight:800;letter-spacing:.12em;text-decoration:none;margin-left:7px;white-space:nowrap;transition:transform .2s,background .2s}.nav-cta:hover{background:var(--gold-light);transform:translateY(-1px)}
      .nav-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;background:none;border:0}.nav-burger span{display:block;width:22px;height:1.5px;background:var(--parchment);transition:.3s}.nav-burger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}.nav-burger.open span:nth-child(2){opacity:0}.nav-burger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
      .nav-mobile{display:none;position:fixed;inset:68px 0 0;background:rgba(10,10,20,.985);z-index:199;padding:22px var(--pad) 48px;overflow:auto;backdrop-filter:blur(20px)}.nav-mobile.open{display:flex;flex-direction:column}
      .nav-mobile a,.nav-mobile button{font:300 18px var(--font);color:var(--dim);text-decoration:none;padding:14px 0;border:0;border-bottom:1px solid rgba(255,255,255,.05);background:none;text-align:left}.nav-mobile a.active{color:var(--gold-light)}
      .m-label{font-size:9px;font-weight:800;letter-spacing:.18em;color:rgba(201,168,76,.55);margin:18px 0 2px;text-transform:uppercase}.m-label:first-child{margin-top:0}
      .m-cta{margin-top:24px!important;padding:16px 20px!important;background:var(--gold)!important;color:var(--dark)!important;text-align:center!important;font-size:11px!important;font-weight:800!important;letter-spacing:.12em!important;border:0!important;border-radius:var(--btn-radius)!important}.nav-signout{cursor:pointer}
      .nav-account{display:flex;align-items:center;gap:2px}.nav-account .nav-link{padding-inline:10px}
      @media(max-width:1080px){.nav-links{display:none}.nav-burger{display:flex}}
      @media(min-width:1081px){.nav-mobile{display:none!important}}
    `}</style>

    <nav className={`vi-nav${scrolled ? ' scrolled' : ''}`} aria-label="Primary navigation">
      <Link href="/" className="nav-logo" aria-label="Valoria Institute home"><img src="/logo.png" alt="Valoria Institute" /></Link>

      <ul className="nav-links" role="list">
        {NAVIGATION.primary.map((item) => item.groups ? (
          <li className="vi-nav-menu" key={item.label}>
            <button className={`nav-link nav-trigger${item.groups.some(g => g.items.some(i => isPathActive(pathname, i.href))) ? ' active' : ''}`} aria-expanded={openMenu === item.label} onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === item.label ? null : item.label) }}>
              {item.label}<span className="nav-chevron">⌄</span>
            </button>
            <div className={`nav-dropdown${openMenu === item.label ? ' open' : ''}${item.groups.length === 1 ? ' nav-dropdown-single' : ''}`}>
              <div className={`nav-dropdown-grid${item.groups.length === 1 ? ' nav-dropdown-single' : ''}`}>
                {item.groups.map((group) => <div key={group.label}>
                  <div className="nav-dropdown-label">{group.label}</div>
                  {group.items.map((entry) => <div key={entry.label}>{renderItem(entry)}{entry.description && <span className="nav-dropdown-description">{entry.description}</span>}</div>)}
                </div>)}
              </div>
            </div>
          </li>
        ) : (
          <li key={item.label}>{item.href.startsWith('http') ? <a href={item.href} className={`nav-link${isPathActive(pathname, item.href) ? ' active' : ''}`}>{item.label}</a> : <Link href={item.href} className={`nav-link${isPathActive(pathname, item.href) ? ' active' : ''}`}>{item.label}</Link>}</li>
        ))}

        {authChecked && user && <li className="nav-account"><Link href="/dashboard" className={`nav-link${isPathActive(pathname, '/dashboard') ? ' active' : ''}`}>Dashboard</Link><NotificationBell userId={user.id} /><button onClick={signOut} className="nav-link" style={{background:'none',border:0,cursor:'pointer'}}>Sign Out</button></li>}
        {authChecked && !user && <li><Link href="/login" className={`nav-link${isPathActive(pathname, '/login') ? ' active' : ''}`}>Sign In</Link></li>}
        <li><a href={cta.href} className="nav-cta">{cta.label}</a></li>
      </ul>

      <button className={`nav-burger${menuOpen ? ' open' : ''}`} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
    </nav>

    <nav className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation">
      <div className="m-label">Explore</div>
      {NAVIGATION.mobile.explore.map(item => <div key={item.label}>{renderItem(item, 'nav-mobile-link')}</div>)}
      <div className="m-label">VALU Index</div>
      {NAVIGATION.mobile.valu.map(item => <div key={item.label}>{renderItem(item, 'nav-mobile-link')}</div>)}
      <div className="m-label">About</div>
      {NAVIGATION.mobile.about.map(item => <div key={item.label}>{renderItem(item, 'nav-mobile-link')}</div>)}
      <div className="m-label">Account</div>
      {authChecked && user ? <>
        <div>{renderItem({ label: 'Dashboard', href: '/dashboard' }, 'nav-mobile-link')}</div>
        <div>{renderItem({ label: 'My Profile', href: `/profile/${user.id}` }, 'nav-mobile-link')}</div>
        <button className="nav-signout" onClick={() => { close(); signOut() }}>Sign Out</button>
      </> : <div>{renderItem({ label: 'Sign In', href: '/login' }, 'nav-mobile-link')}</div>}
      <a href={cta.href} className="m-cta" onClick={close}>{cta.label}</a>
    </nav>
  </>
}
