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

  // Escape dismisses either navigation surface for keyboard users.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      setOpenMenu(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
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
  // from START VALU INDEX to MY PROFILE/DASHBOARD after getUser(), causing a visible
  // header layout shift on every page for signed-in users.
  const cta = { label: 'START VALU INDEX', href: NAVIGATION.assessmentUrl, external: true }

  const renderItem = (item, className = 'nav-dropdown-link') => {
    const active = isPathActive(pathname, item.href)
    if (item.external) {
      if (item.href === NAVIGATION.assessmentUrl) {
        return <AssessmentStartLink href={item.href} className={`${className}${active ? ' active' : ''}`} onClick={close}>{item.label}</AssessmentStartLink>
      }
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
            <button className={`nav-link nav-trigger${item.groups.some(g => g.items.some(i => isPathActive(pathname, i.href))) ? ' active' : ''}`} aria-expanded={openMenu === item.label} aria-controls={`vi-dropdown-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === item.label ? null : item.label) }}>
              {item.label}<span className="nav-chevron">⌄</span>
            </button>
            <div id={`vi-dropdown-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={`nav-dropdown${openMenu === item.label ? ' open' : ''}${item.groups.length === 1 ? ' nav-dropdown-single' : ''}`}>
              <div className={`nav-dropdown-grid${item.groups.length === 1 ? ' nav-dropdown-single' : ''}`}>
                {item.groups.map((group) => <div key={group.label}>
                  <div className="nav-dropdown-label">{group.label}</div>
                  {group.items.map((entry) => <div key={entry.label}>{renderItem(entry)}{entry.description && <span className="nav-dropdown-description">{entry.description}</span>}</div>)}
                </div>)}
              </div>
            </div>
          </li>
        ) : (
          <li key={item.label}>{item.href === NAVIGATION.assessmentUrl
          ? <AssessmentStartLink href={item.href} className={`nav-link${isPathActive(pathname, item.href) ? ' active' : ''}`}>{item.label}</AssessmentStartLink>
          : item.href.startsWith('http')
            ? <a href={item.href} className={`nav-link${isPathActive(pathname, item.href) ? ' active' : ''}`}>{item.label}</a>
            : <Link href={item.href} className={`nav-link${isPathActive(pathname, item.href) ? ' active' : ''}`}>{item.label}</Link>}</li>
        ))}

        {authChecked && user && <li className="nav-account"><Link href="/dashboard" className={`nav-link${isPathActive(pathname, '/dashboard') ? ' active' : ''}`}>Dashboard</Link><NotificationBell userId={user.id} /><button onClick={signOut} className="nav-link nav-signout">Sign Out</button></li>}
        {authChecked && !user && <li><Link href="/login" className={`nav-link${isPathActive(pathname, '/login') ? ' active' : ''}`}>Sign In</Link></li>}
        <li><AssessmentStartLink href={cta.href} className="nav-cta">{cta.label}</AssessmentStartLink></li>
      </ul>

      <button className={`nav-burger${menuOpen ? ' open' : ''}`} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="vi-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
    </nav>

    <nav id="vi-mobile-navigation" className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
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
      <AssessmentStartLink href={cta.href} className="m-cta" onClick={close}>{cta.label}</AssessmentStartLink>
    </nav>
  </>
}
 
// Route every signed-in VALU Index start through the authenticated continuation endpoint.
// Anonymous visitors still begin at the configured public taster URL.
export function AssessmentStartLink({ href = '/valu/assessment/', className, style, children, onClick, dashboardOnly = false, ...props }) {
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  async function handleClick(event) {
    if (onClick) onClick(event)
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    if (opening) return
    setOpening(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      // Every signed-in assessment CTA must issue the secure continuation
      // handoff and navigate directly to the dedicated /remaining route.
      // Returning to /dashboard here caused the public header CTA to loop
      // participants back to the page they were already on.
      if (session?.access_token) {
        // Verify the participant's saved journey before requesting a full-assessment
        // handoff. Accounts without a completed, verified taster must still be able
        // to reach the public taster instead of receiving a dead-end 404.
        const accessResponse = await fetch('/api/valu-handoff', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const access = await accessResponse.json().catch(() => ({}))
        if (!accessResponse.ok) {
          throw new Error(access.error || 'We could not verify your VALU Index access.')
        }
        if (access.assessment_completed) {
          window.location.assign('/dashboard')
          return
        }
        if (!access.can_continue) {
          window.location.assign(href)
          return
        }

        const response = await fetch('/api/valu-handoff', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.url) {
          if (data.already_completed) {
            window.location.assign('/dashboard')
            return
          }
          throw new Error(data.error || 'We could not securely open your saved assessment.')
        }
        window.location.assign(data.url)
        return
      }
      if (dashboardOnly) {
        window.location.assign('/login?returnTo=%2Fdashboard')
        return
      }
      // Anonymous visitors start the public nine-question taster.
      window.location.assign(href)
    } catch (err) {
      setError(err?.message || 'We could not open your VALU Index. Please try again.')
      setOpening(false)
    }
  }

  // The anchor must advertise the actual assessment destination. Normal clicks
  // still obtain a fresh, short-lived handoff code before navigating, so this
  // canonical URL is never used as a substitute for the authenticated token.
  // Modified clicks and no-JavaScript fallbacks must not bypass the signed dashboard handoff.
  const linkHref = dashboardOnly ? '/dashboard' : href

  return <>
    <a href={linkHref} className={className} style={style} onClick={handleClick} aria-busy={opening} {...props}>
      {opening ? 'Opening VALU…' : children}
    </a>
    {error && <span role="alert" style={{ display: 'block', color: '#F09595', fontSize: '12px', marginTop: '6px' }}>{error}</span>}
  </>
}
