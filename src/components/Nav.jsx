'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BRAND } from '@/lib/brand'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  // Pull the Supabase-stored session on load — this is what makes the nav
  // "remember" a signed-in visitor instead of always showing Sign In.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleSignOut() {
    supabase.auth.signOut().then(() => { window.location.href = '/' })
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <style>{`
        nav.vi-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px var(--pad);
          display: flex; align-items: center; justify-content: space-between;
          transition: background .3s, border-color .3s, padding .3s;
          background: var(--nav-bg);
          border-bottom: 1px solid rgba(201,168,76,0.08);
        }
        nav.vi-nav.scrolled {
          background: rgba(15,15,26,0.97);
          border-color: rgba(201,168,76,.12);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 14px var(--pad);
        }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; line-height: 0; }
        .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
        .nav-links a {
          font-size: 12px; color: var(--dim); text-decoration: none;
          letter-spacing: .06em; transition: color .2s; font-weight: 400;
        }
        .nav-links a:hover { color: var(--parchment); }
        .nav-cta {
          padding: 9px 20px;
          border: 1px solid rgba(201,168,76,.4);
          border-radius: var(--btn-radius);
          font-size: 11px; font-weight: 600; color: var(--gold) !important;
          letter-spacing: .14em; transition: background .2s, color .2s !important;
        }
        .nav-cta:hover { background: var(--gold) !important; color: var(--dark) !important; }
        .nav-link-btn {
          background: none; border: none; cursor: pointer; padding: 0;
          font-size: 12px; color: var(--dim); letter-spacing: .06em;
          font-weight: 400; font-family: var(--font); transition: color .2s;
        }
        .nav-link-btn:hover { color: var(--parchment); }
        .nav-mobile button.m-signout {
          background: none; border: none; cursor: pointer; text-align: left;
          font-size: 22px; font-family: var(--font); color: var(--dim); font-weight: 300;
          padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.05);
          transition: color .2s; width: 100%;
        }
        .nav-mobile button.m-signout:hover { color: var(--parchment); }
        .nav-burger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 4px; background: none; border: none;
        }
        .nav-burger span {
          display: block; width: 22px; height: 1.5px;
          background: var(--parchment); transition: all .3s;
        }
        .nav-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nav-burger.open span:nth-child(2) { opacity: 0; }
        .nav-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
        .nav-mobile {
          display: none; position: fixed; inset: 0; top: 60px;
          background: var(--nav-bg); z-index: 99;
          padding: 40px var(--pad); flex-direction: column; gap: 0;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        }
        .nav-mobile.open { display: flex; }
        .nav-mobile a {
          font-size: 22px; font-family: var(--font); color: var(--dim); font-weight: 300;
          text-decoration: none; padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,.05); transition: color .2s;
        }
        .nav-mobile a:hover { color: var(--parchment); }
        .nav-mobile .m-cta {
          margin-top: 28px; padding: 16px 32px;
          background: var(--gold); color: var(--dark);
          font-size: 13px; font-weight: 600; letter-spacing: .14em;
          text-align: center; border-radius: var(--btn-radius);
        }
        @media (max-width: 980px) {
          .nav-links { display: none; }
          .nav-burger { display: flex; }
        }
      `}</style>

      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav className={`vi-nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="nav-logo" aria-label="Valoria Institute home">
          <img src={BRAND.logo} alt="Valoria Institute" style={{ height: '66px', width: 'auto', display: 'block' }} />
        </Link>

        <ul className="nav-links" role="list">
          <li><Link href="/marketplace">Marketplace</Link></li>
          {authChecked && (
            user ? (
              <>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><button onClick={handleSignOut} className="nav-link-btn">Sign Out</button></li>
              </>
            ) : (
              <>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/signup">Create Account</Link></li>
              </>
            )
          )}
          <li><Link href="/atb-connect">Find Talent</Link></li>
          <li><Link href="/spotlight">Book a Speaker</Link></li>
          <li><Link href="/facilitators">Commission Facilitators</Link></li>
          <li><Link href="/prime">PRIME Framework</Link></li>
          <li><Link href="/about-us">About</Link></li>
          <li>
            <a href="https://assessment.valoriainstitute.com/" className="nav-cta" target="_blank" rel="noopener noreferrer">
              TAKE THE VALU INDEX
            </a>
          </li>
        </ul>

        <button
          className={`nav-burger${menuOpen ? ' open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <nav className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation">
        <Link href="/marketplace" onClick={closeMenu}>Marketplace</Link>
        {authChecked && (
          user ? (
            <>
              <Link href="/dashboard" onClick={closeMenu}>Dashboard</Link>
              <button className="m-signout" onClick={() => { closeMenu(); handleSignOut() }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu}>Sign In</Link>
              <Link href="/signup" onClick={closeMenu}>Create Account</Link>
            </>
          )
        )}
        <Link href="/atb-connect" onClick={closeMenu}>Find Talent</Link>
        <Link href="/spotlight" onClick={closeMenu}>Book a Speaker</Link>
        <Link href="/facilitators" onClick={closeMenu}>Commission Facilitators</Link>
        <Link href="/prime" onClick={closeMenu}>PRIME Framework</Link>
        <Link href="/about-us" onClick={closeMenu}>About</Link>
        <a
          href="https://assessment.valoriainstitute.com/"
          className="m-cta"
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          TAKE THE VALU INDEX — FREE
        </a>
      </nav>
    </>
  )
}
