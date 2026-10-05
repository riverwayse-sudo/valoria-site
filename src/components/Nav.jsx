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
  // Keep the primary CTA stable during auth hydration. Previously it changed
  // from START VALU to MY PROFILE/DASHBOARD after getUser(), causing a visible
  // header layout shift on every page for signed-in users.
  const cta = { label: 'START VALU', href: NAVIGATION.assessmentUrl, external: true }

  const renderItem = (item, className = 'nav-dropdown-link') => {
    const active = isPathActive(pathname, item.href)
    if (item.external) {
      return <a href={item.href} className={`${className}${active ? ' active' : ''}`} onClick={close}>{item.label}</a>
    }
    return <Link href={item.href} className={`${className}${active ? ' active' : ''}`} onClick={close}>{item.label}</Link>
  }

  return <>
    

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

        {authChecked && user && <li className="nav-account"><Link href="/dashboard" className={`nav-link${isPathActive(pathname, '/dashboard') ? ' active' : ''}`}>Dashboard</Link><NotificationBell userId={user.id} /><button onClick={signOut} className="nav-link nav-signout">Sign Out</button></li>}
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
