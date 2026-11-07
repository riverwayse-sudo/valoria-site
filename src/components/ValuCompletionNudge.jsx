'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ValuCompletionNudge() {
  const [show, setShow] = useState(false)
  const [assessed, setAssessed] = useState(false)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const closeRef = useRef(null)
  const previewRef = useRef(false)

  useEffect(() => {
    let active = true

    async function load() {
      const previewMode = new URLSearchParams(window.location.search).get('valuNudgePreview')
      if (previewMode) {
        previewRef.current = true
        setAssessed(previewMode === 'complete')
        setAssessmentStarted(previewMode === 'started')
        setShow(true)
        return
      }

      try {
        if (sessionStorage.getItem('valu_nudge_dismissed_today') === new Date().toISOString().slice(0, 10)) return
      } catch {}

      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return

      const [{ data: profile }, { data: assessment }, { data: latestSession }] = await Promise.all([
        supabase.from('professional_profiles').select('profile_complete').eq('id', user.id).maybeSingle(),
        supabase.from('valu_assessments').select('id,total_score,completed_at').eq('user_id', user.id).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('assessment_sessions').select('id,completed_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      if (!active || !profile || profile.profile_complete) return
      const fullAssessmentComplete = !!assessment?.completed_at && Number(assessment?.total_score || 0) >= 35
      const started = !!latestSession?.id && !latestSession?.completed_at
      setAssessmentStarted(started)
      setAssessed(fullAssessmentComplete)
      setShow(true)
    }

    load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!show) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') dismiss()
      if (event.key !== 'Tab') return
      const dialog = document.querySelector('.vi-nudge-dialog')
      const focusable = dialog?.querySelectorAll('button:not([disabled]),a[href]')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus?.()
    }
  }, [show])

  if (!show) return null

  function dismiss() {
    if (!previewRef.current) {
      try { sessionStorage.setItem('valu_nudge_dismissed_today', new Date().toISOString().slice(0, 10)) } catch {}
    }
    setShow(false)
  }

  const eyebrow = assessed ? 'ASSESSMENT COMPLETE' : assessmentStarted ? 'YOUR VALU JOURNEY' : 'A CLEARER PROFESSIONAL SIGNAL'
  const title = assessed
    ? <>Your assessment is complete.<br/><em>Now complete your profile.</em></>
    : assessmentStarted
      ? <>Your progress is saved.<br/><em>Continue when ready.</em></>
      : <>Make your capability<br/><em>easier to recognise.</em></>
  const copy = assessed
    ? 'Your full VALU assessment is complete. Add the professional details that help organisations understand your experience and discover your capabilities.'
    : assessmentStarted
      ? 'You have already begun your VALU journey. Return to your saved session and continue without losing your work.'
      : 'Begin with the VALU assessment, then build a professional profile that connects your capabilities to meaningful opportunities.'
  const action = assessed ? 'COMPLETE MY PROFILE' : assessmentStarted ? 'CONTINUE VALU' : 'BEGIN VALU'
  const href = assessed ? '/profile/setup' : '/valu/start'

  return (
    <div className="vi-nudge-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) dismiss() }}>
      <section className="vi-nudge-dialog" role="dialog" aria-modal="true" aria-labelledby="vi-nudge-title" aria-describedby="vi-nudge-copy">
        <button ref={closeRef} className="vi-nudge-close" type="button" onClick={dismiss} aria-label="Close reminder">×</button>
        <aside className="vi-nudge-editorial">
          <div className="vi-nudge-brand"><span className="vi-nudge-brand-mark">V</span><span>VALORIA<br/>INSTITUTE</span></div>
          <div className="vi-nudge-editorial-body">
            <span className="vi-nudge-overline">WORTH. BUILT.</span>
            <p>Capability is more than a claim.<br/><em>Make it legible.</em></p>
            <span className="vi-nudge-editorial-rule"/>
            <small>PRIME · PRESENCE · RELATIONSHIPS · INTELLIGENCE · MASTERY · ENTERPRISE</small>
          </div>
          <div className="vi-nudge-editorial-foot"><span>YOUR NEXT STEP</span><span>VALU INDEX</span></div>
          <div className="vi-nudge-orbit" aria-hidden="true"/>
        </aside>

        <div className="vi-nudge-content">
          <div className="vi-nudge-status"><span className="vi-nudge-status-dot"/>{eyebrow}</div>
          <h2 id="vi-nudge-title">{title}</h2>
          <p id="vi-nudge-copy" className="vi-nudge-copy">{copy}</p>

          <div className="vi-nudge-steps" aria-label="Your Valoria journey">
            <div className={assessed ? 'is-complete' : 'is-current'}><span>01</span><div><strong>Understand</strong><small>VALU assessment</small></div><i>{assessed ? '✓' : '•'}</i></div>
            <div className={assessed ? 'is-current' : ''}><span>02</span><div><strong>Build</strong><small>Professional profile</small></div><i>{assessed ? '•' : '—'}</i></div>
            <div><span>03</span><div><strong>Connect</strong><small>Marketplace opportunities</small></div><i>—</i></div>
          </div>

          <a className="vi-nudge-primary" href={href}><span>{action}</span><b aria-hidden="true">↗</b></a>
          <button className="vi-nudge-later" type="button" onClick={dismiss}>I’ll do this later</button>
          <p className="vi-nudge-note">Your assessment progress is saved to your account.</p>
        </div>
      </section>

      <style>{\`
        .vi-nudge-overlay{position:fixed;inset:0;z-index:9998;display:grid;place-items:center;padding:clamp(12px,3vw,30px);background:rgba(10,11,20,.76);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:viNudgeFade .24s ease both}
        .vi-nudge-dialog{position:relative;display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);width:min(900px,100%);max-height:min(90dvh,760px);overflow:auto;border:1px solid rgba(201,168,76,.38);background:#F7F4EE;box-shadow:0 34px 110px rgba(0,0,0,.42);animation:viNudgeRise .38s cubic-bezier(.2,.8,.2,1) both}
        .vi-nudge-close{position:absolute;z-index:5;top:16px;right:16px;width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(26,26,46,.13);border-radius:50%;background:rgba(247,244,238,.94);color:#1A1A2E;font-size:25px;font-weight:300;cursor:pointer;transition:background .2s,transform .2s}
        .vi-nudge-close:hover{background:#C9A84C;transform:rotate(90deg)}
        .vi-nudge-close:focus-visible,.vi-nudge-primary:focus-visible,.vi-nudge-later:focus-visible{outline:3px solid rgba(201,168,76,.72);outline-offset:3px}
        .vi-nudge-editorial{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;min-height:560px;overflow:hidden;padding:clamp(30px,4vw,48px);background:#1A1A2E;color:#FAFAF7}
        .vi-nudge-editorial:before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 18% 82%,rgba(201,168,76,.14),transparent 45%),linear-gradient(150deg,#2E2E4A 0%,#1A1A2E 64%)}
        .vi-nudge-brand{position:relative;z-index:1;display:flex;align-items:center;gap:11px;font-size:9px;font-weight:800;letter-spacing:.2em;line-height:1.5}
        .vi-nudge-brand-mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(201,168,76,.72);color:#C9A84C;font-family:Georgia,serif;font-size:24px;font-weight:400}
        .vi-nudge-editorial-body{position:relative;z-index:1;margin:50px 0}
        .vi-nudge-overline{color:#D4B96F;font-size:9px;font-weight:800;letter-spacing:.2em}
        .vi-nudge-editorial-body p{margin:16px 0 22px;color:#FAFAF7;font-family:var(--font),Arial,sans-serif;font-size:clamp(30px,3.7vw,45px);font-weight:400;line-height:1.08;letter-spacing:-.04em}
        .vi-nudge-editorial-body p em{color:#C9A84C;font-family:Georgia,serif;font-weight:400}
        .vi-nudge-editorial-rule{display:block;width:44px;height:1px;background:#C9A84C}
        .vi-nudge-editorial-body small{display:block;max-width:280px;margin-top:18px;color:rgba(250,250,247,.48);font-size:8px;font-weight:700;letter-spacing:.12em;line-height:1.9}
        .vi-nudge-editorial-foot{position:relative;z-index:1;display:flex;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid rgba(201,168,76,.2);color:rgba(250,250,247,.46);font-size:8px;font-weight:800;letter-spacing:.15em}
        .vi-nudge-editorial-foot span:last-child{color:#C9A84C}
        .vi-nudge-orbit{position:absolute;right:-190px;bottom:100px;width:360px;height:360px;border:1px solid rgba(201,168,76,.13);border-radius:50%;box-shadow:0 0 0 42px rgba(201,168,76,.025),0 0 0 84px rgba(201,168,76,.02);pointer-events:none}
        .vi-nudge-content{display:flex;flex-direction:column;justify-content:center;padding:clamp(34px,5vw,62px);background:#F7F4EE}
        .vi-nudge-status{display:flex;align-items:center;gap:9px;margin-bottom:18px;color:#8B702B;font-size:9px;font-weight:800;letter-spacing:.16em}
        .vi-nudge-status-dot{width:7px;height:7px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 4px rgba(201,168,76,.12)}
        .vi-nudge-content h2{margin:0;color:#1A1A2E;font-family:var(--font),Arial,sans-serif;font-size:clamp(29px,3.3vw,42px);font-weight:700;line-height:1.06;letter-spacing:-.04em}
        .vi-nudge-content h2 em{color:#9A7428;font-family:Georgia,serif;font-weight:400}
        .vi-nudge-copy{margin:16px 0 24px;color:#626273;font-size:13px;line-height:1.75}
        .vi-nudge-steps{display:grid;gap:0;margin:0 0 25px;border-top:1px solid rgba(26,26,46,.12);border-bottom:1px solid rgba(26,26,46,.12)}
        .vi-nudge-steps>div{display:grid;grid-template-columns:30px minmax(0,1fr) 20px;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(26,26,46,.08);color:#9898A4}
        .vi-nudge-steps>div:last-child{border-bottom:0}
        .vi-nudge-steps>div>span{color:#9B9BA7;font-size:9px;font-weight:800;letter-spacing:.1em}
        .vi-nudge-steps>div strong{display:block;color:#666677;font-size:11px;font-weight:700}
        .vi-nudge-steps>div small{display:block;margin-top:3px;color:#9898A4;font-size:10px}
        .vi-nudge-steps>div i{color:#A0A0AA;font-size:13px;font-style:normal;text-align:right}
        .vi-nudge-steps>div.is-current strong,.vi-nudge-steps>div.is-current>span,.vi-nudge-steps>div.is-current i{color:#8B702B}
        .vi-nudge-steps>div.is-complete strong,.vi-nudge-steps>div.is-complete>span,.vi-nudge-steps>div.is-complete i{color:#527A61}
        .vi-nudge-primary{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:54px;padding:0 19px;border:1px solid #1A1A2E;background:#1A1A2E;color:#FAFAF7;text-decoration:none;font-size:9px;font-weight:800;letter-spacing:.15em;transition:background .2s,transform .2s}
        .vi-nudge-primary b{color:#C9A84C;font-size:19px;transition:transform .2s}
        .vi-nudge-primary:hover{background:#2E2E4A;transform:translateY(-1px)}
        .vi-nudge-primary:hover b{transform:translate(3px,-3px)}
        .vi-nudge-later{align-self:center;margin:14px 0 0;padding:7px 12px;border:0;background:transparent;color:#777786;font:inherit;font-size:11px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
        .vi-nudge-note{margin:12px 0 0;color:#A0A0AA;font-size:9px;line-height:1.5;text-align:center}
        @keyframes viNudgeFade{from{opacity:0}to{opacity:1}}
        @keyframes viNudgeRise{from{opacity:0;transform:translateY(14px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media(max-width:700px){.vi-nudge-overlay{padding:10px}.vi-nudge-dialog{grid-template-columns:1fr;max-height:94dvh}.vi-nudge-editorial{min-height:215px;padding:24px 25px}.vi-nudge-brand{font-size:8px}.vi-nudge-brand-mark{width:32px;height:32px;font-size:20px}.vi-nudge-editorial-body{margin:30px 0 20px}.vi-nudge-editorial-body p{max-width:500px;margin:10px 0 14px;font-size:31px}.vi-nudge-editorial-body small{display:none}.vi-nudge-editorial-foot{padding-top:11px}.vi-nudge-content{padding:28px 25px 30px}.vi-nudge-content h2{font-size:30px}.vi-nudge-copy{margin:12px 0 18px}.vi-nudge-steps{margin-bottom:18px}.vi-nudge-close{top:11px;right:11px;width:35px;height:35px}}
        @media(max-width:390px){.vi-nudge-editorial{min-height:190px;padding:20px}.vi-nudge-editorial-body{margin:23px 0 16px}.vi-nudge-editorial-body p{font-size:28px}.vi-nudge-content{padding:23px 20px 24px}.vi-nudge-content h2{font-size:27px}}
        @media(prefers-reduced-motion:reduce){.vi-nudge-overlay,.vi-nudge-dialog{animation:none}.vi-nudge-close,.vi-nudge-primary,.vi-nudge-primary b{transition:none}}
      \`}</style>
    </div>
  )
}
