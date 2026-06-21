'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [dropOpen, setDropOpen]     = useState(false)
  const [user, setUser]             = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user); setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleSignOut() {
    supabase.auth.signOut().then(() => { window.location.href = '/' })
  }

  const closeMenu = () => setMenuOpen(false)

  // "Explore" dropdown items
  const exploreLinks = [
    { href: '/marketplace',   label: 'Marketplace' },
    { href: '/atb-connect',   label: 'Find Talent' },
    { href: '/spotlight',     label: 'Book a Speaker' },
    { href: '/facilitators',  label: 'Commission Facilitators' },
    { href: '/prime',         label: 'PRIME Framework' },
    { href: '/about-us',      label: 'About' },
    { href: '/programmes',    label: 'Programmes' },
    { href: '/contact-us',    label: 'Contact' },
  ]

  return (
    <>
      <style>{`
        nav.vi-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          padding: 0 var(--pad);
          display: flex; align-items: center; justify-content: space-between;
          height: 68px;
          transition: background .3s, border-color .3s;
          background: var(--nav-bg);
          border-bottom: 1px solid rgba(201,168,76,0.08);
        }
        nav.vi-nav.scrolled {
          background: rgba(15,15,26,0.97);
          border-color: rgba(201,168,76,.14);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        /* LOGO */
        .nav-logo { display: flex; align-items: center; text-decoration: none; line-height: 0; }
        .nav-logo img { height: 52px; width: auto; display: block; }

        /* DESKTOP LINKS */
        .nav-links { display: flex; align-items: center; gap: 6px; list-style: none; margin: 0; padding: 0; }

        /* Explore dropdown trigger */
        .nav-explore-btn {
          background: none; border: none; cursor: pointer; padding: 8px 14px;
          font-size: 12px; color: var(--dim); letter-spacing: .07em;
          font-weight: 400; font-family: var(--font); transition: color .2s;
          display: flex; align-items: center; gap: 5px;
        }
        .nav-explore-btn:hover { color: var(--parchment); }
        .nav-explore-arrow {
          font-size: 8px; transition: transform .2s; display: inline-block;
        }
        .nav-explore-arrow.open { transform: rotate(180deg); }

        /* Dropdown panel */
        .nav-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: rgba(15,15,26,.98); border: 1px solid rgba(201,168,76,.15);
          border-radius: 10px; padding: 8px 0; min-width: 220px;
          backdrop-filter: blur(20px); display: none; z-index: 300;
        }
        .nav-dropdown.open { display: block; }
        .nav-dropdown a {
          display: block; padding: 10px 18px;
          font-size: 12px; color: var(--dim); text-decoration: none;
          letter-spacing: .06em; transition: color .15s, background .15s;
        }
        .nav-dropdown a:hover { color: var(--parchment); background: rgba(201,168,76,.06); }
        .nav-dropdown-divider {
          height: 1px; background: rgba(201,168,76,.08); margin: 6px 0;
        }
        .nav-explore-wrap { position: relative; }

        /* Plain nav links */
        .nav-link {
          font-size: 12px; color: var(--dim); text-decoration: none;
          letter-spacing: .07em; font-weight: 400; transition: color .2s;
          padding: 8px 14px; display: block;
        }
        .nav-link:hover { color: var(--parchment); }

        /* Sign Out button styled like a nav link */
        .nav-link-btn {
          background: none; border: none; cursor: pointer; padding: 8px 14px;
          font-size: 12px; color: var(--dim); letter-spacing: .07em;
          font-weight: 400; font-family: var(--font); transition: color .2s;
        }
        .nav-link-btn:hover { color: var(--parchment); }

        /* Primary CTA */
        .nav-cta {
          padding: 10px 22px;
          background: var(--gold); color: var(--dark) !important;
          border-radius: var(--btn-radius);
          font-size: 11px; font-weight: 700; letter-spacing: .14em;
          text-decoration: none; white-space: nowrap;
          transition: opacity .2s; margin-left: 8px;
        }
        .nav-cta:hover { opacity: .88; }

        /* Burger */
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

        /* Mobile overlay */
        .nav-mobile {
          display: none; position: fixed; inset: 0; top: 68px;
          background: rgba(10,10,20,.98); z-index: 199;
          padding: 32px var(--pad) 48px; flex-direction: column; gap: 0;
          backdrop-filter: blur(20px); overflow-y: auto;
        }
        .nav-mobile.open { display: flex; }
        .nav-mobile a, .nav-mobile button.m-signout {
          font-size: 20px; font-family: var(--font); color: var(--dim); font-weight: 300;
          text-decoration: none; padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,.05); transition: color .2s;
          display: block;
        }
        .nav-mobile a:hover { color: var(--parchment); }
        button.m-signout {
          background: none; border: none; border-bottom: 1px solid rgba(255,255,255,.05);
          cursor: pointer; text-align: left; width: 100%;
        }
        button.m-signout:hover { color: var(--parchment); }
        .nav-mobile .m-section-label {
          font-size: 9px; font-weight: 700; letter-spacing: .18em;
          color: rgba(201,168,76,.4); margin: 24px 0 4px; text-transform: uppercase;
        }
        .nav-mobile .m-cta {
          margin-top: 28px; padding: 16px 32px;
          background: var(--gold); color: var(--dark);
          font-size: 12px; font-weight: 700; letter-spacing: .14em;
          text-align: center; border-radius: var(--btn-radius); border: none;
        }
        .nav-mobile .m-cta:hover { opacity: .88; }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-burger { display: flex; }
        }
      `}</style>

      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Backdrop to close dropdown on outside click */}
      {dropOpen && (
        <div
          onClick={() => setDropOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
          aria-hidden="true"
        />
      )}

      <nav className={`vi-nav${scrolled ? ' scrolled' : ''}`}>
        {/* LOGO */}
        <Link href="/" className="nav-logo" aria-label="Valoria Institute home">
          <img src="/logo.png" alt="Valoria Institute" />
        </Link>

        {/* DESKTOP NAV — 4 visible items max */}
        <ul className="nav-links" role="list">

          {/* 1. Explore dropdown */}
          <li className="nav-explore-wrap">
            <button
              className="nav-explore-btn"
              onClick={() => setDropOpen(d => !d)}
              aria-expanded={dropOpen}
              aria-haspopup="true"
            >
              Explore
              <span className={`nav-explore-arrow${dropOpen ? ' open' : ''}`}>▾</span>
            </button>
            <div className={`nav-dropdown${dropOpen ? ' open' : ''}`} role="menu">
              <a href="/marketplace" onClick={() => setDropOpen(false)}>Marketplace</a>
              <div className="nav-dropdown-divider" />
              <a href="/atb-connect" onClick={() => setDropOpen(false)}>Find Talent</a>
              <a href="/spotlight" onClick={() => setDropOpen(false)}>Book a Speaker</a>
              <a href="/facilitators" onClick={() => setDropOpen(false)}>Commission Facilitators</a>
              <div className="nav-dropdown-divider" />
              <a href="/prime" onClick={() => setDropOpen(false)}>PRIME Framework</a>
              <a href="/programmes" onClick={() => setDropOpen(false)}>Programmes</a>
              <a href="/about-us" onClick={() => setDropOpen(false)}>About</a>
              <a href="/contact-us" onClick={() => setDropOpen(false)}>Contact</a>
            </div>
          </li>

          {/* 2. Auth-aware: Dashboard or Sign In */}
          {authChecked && (
            user ? (
              <>
                <li><Link href="/dashboard" className="nav-link">Dashboard</Link></li>
                <li><button onClick={handleSignOut} className="nav-link-btn">Sign Out</button></li>
              </>
            ) : (
              <li><Link href="/login" className="nav-link">Sign In</Link></li>
            )
          )}

          {/* 3. Primary CTA — always visible, always gold */}
          <li>
            <a
              href="https://assessment.valoriainstitute.com/"
              className="nav-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              TAKE THE VALU INDEX
            </a>
          </li>
        </ul>

        {/* BURGER */}
        <button
          className={`nav-burger${menuOpen ? ' open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE OVERLAY */}
      <nav className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation">
        <div className="m-section-label">Marketplace</div>
        <Link href="/marketplace" onClick={closeMenu}>Browse All</Link>
        <Link href="/atb-connect" onClick={closeMenu}>Find Talent</Link>
        <Link href="/spotlight" onClick={closeMenu}>Book a Speaker</Link>
        <Link href="/facilitators" onClick={closeMenu}>Commission Facilitators</Link>

        <div className="m-section-label">Platform</div>
        <Link href="/prime" onClick={closeMenu}>PRIME Framework</Link>
        <Link href="/programmes" onClick={closeMenu}>Programmes</Link>
        <Link href="/about-us" onClick={closeMenu}>About</Link>
        <Link href="/contact-us" onClick={closeMenu}>Contact</Link>

        <div className="m-section-label">Account</div>
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
