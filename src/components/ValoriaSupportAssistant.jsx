'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const QUICK_PROMPTS = [
  'How does VALU work?',
  'How do I find a professional?',
  'Where can I find events?',
]

const GREETING = 'Welcome to Valoria Institute. I can help you navigate VALU, professional profiles, the marketplace, and events. What would you like to do?'

export default function ValoriaSupportAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('chat')
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState({ category: 'website', summary: '', details: '', email: '', website: '' })
  const [reportStatus, setReportStatus] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const launcherRef = useRef(null)

  useEffect(() => {
    if (open && view === 'chat') inputRef.current?.focus()
  }, [open, view])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  async function sendMessage(text) {
    const content = String(text || '').trim()
    if (!content || busy) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setDraft('')
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-10), pagePath: pathname || '/' }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.answer) throw new Error(payload.error || 'The assistant is temporarily unavailable.')
      setMessages(current => [...current, { role: 'assistant', content: payload.answer }])
    } catch (e) {
      setError(e.message || 'The assistant is temporarily unavailable. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function submitReport(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setReportStatus('')
    try {
      const response = await fetch('/api/support/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...report, pagePath: pathname || '/' }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Could not send the report.')
      setReportStatus(payload.message || 'Your report has been sent to Valoria support.')
      setReport({ category: 'website', summary: '', details: '', email: '', website: '' })
    } catch (e) {
      setError(e.message || 'Could not send the report.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="valoria-support" id="valoria-support-assistant">
      {open && (
        <section className="valoria-support-panel" id="valoria-support-panel" aria-label="Valoria website assistant">
          <header className="valoria-support-header">
            <div className="valoria-support-mark" aria-hidden="true">V</div>
            <div className="valoria-support-heading">
              <strong>Valoria Assistant</strong>
              <span>Website guidance and support</span>
            </div>
            <button className="valoria-support-icon-button" type="button" aria-label="Close Valoria Assistant" onClick={() => setOpen(false)}>×</button>
          </header>

          <nav className="valoria-support-tabs" aria-label="Assistant options">
            <button type="button" className={view === 'chat' ? 'active' : ''} aria-pressed={view === 'chat'} onClick={() => { setView('chat'); setError(''); setReportStatus('') }}>Ask Valoria</button>
            <button type="button" className={view === 'report' ? 'active' : ''} aria-pressed={view === 'report'} onClick={() => { setView('report'); setError(''); setReportStatus('') }}>Report an issue</button>
          </nav>

          {view === 'chat' ? (
            <>
              <div className="valoria-support-messages" aria-live="polite" aria-relevant="additions text">
                {messages.map((message, index) => (
                  <div className={`valoria-support-message ${message.role === 'user' ? 'user' : 'assistant'}`} key={`${message.role}-${index}`}>
                    <span className="valoria-support-sender">{message.role === 'user' ? 'You' : 'Valoria'}</span>
                    <p>{message.content}</p>
                  </div>
                ))}
                {busy && <p className="valoria-support-thinking" role="status">Valoria is preparing a response…</p>}
                <div ref={endRef} />
              </div>
              {messages.length === 1 && (
                <div className="valoria-support-prompts" aria-label="Suggested questions">
                  {QUICK_PROMPTS.map(prompt => <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={busy}>{prompt}</button>)}
                </div>
              )}
              <form className="valoria-support-compose" onSubmit={event => { event.preventDefault(); sendMessage(draft) }}>
                <label className="sr-only" htmlFor="valoria-support-message">Your message</label>
                <textarea id="valoria-support-message" ref={inputRef} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask Valoria a question…" rows={2} maxLength={1800} required disabled={busy} />
                <button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">Send</button>
              </form>
            </>
          ) : (
            <form className="valoria-support-report" onSubmit={submitReport}>
              <p>Tell us what went wrong. Your report will be emailed to the Valoria support team.</p>
              <label>Issue type
                <select value={report.category} onChange={event => setReport(current => ({ ...current, category: event.target.value }))}>
                  <option value="website">Website or page error</option>
                  <option value="account">Account or sign-in</option>
                  <option value="assessment">VALU assessment or report</option>
                  <option value="profile">Professional profile or marketplace</option>
                  <option value="event">Event registration</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>Short summary
                <input value={report.summary} onChange={event => setReport(current => ({ ...current, summary: event.target.value }))} maxLength={180} required placeholder="e.g. My profile page will not load" />
              </label>
              <label>What happened?
                <textarea value={report.details} onChange={event => setReport(current => ({ ...current, details: event.target.value }))} maxLength={3500} rows={4} required placeholder="Include the steps that led to the issue. Do not include passwords or payment details." />
              </label>
              <label>Email for follow-up (optional)
                <input type="email" value={report.email} onChange={event => setReport(current => ({ ...current, email: event.target.value }))} maxLength={254} placeholder="you@example.com" />
              </label>
              <div className="valoria-support-honeypot" aria-hidden="true">
                <label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={report.website} onChange={event => setReport(current => ({ ...current, website: event.target.value }))} /></label>
              </div>
              <button className="valoria-support-submit-report" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Email support report'}</button>
              {reportStatus && <p className="valoria-support-success" role="status">{reportStatus}</p>}
            </form>
          )}

          {error && <p className="valoria-support-error" role="alert">{error}</p>}
          <footer className="valoria-support-footer">
            <span>For account-specific matters, never share passwords or one-time codes.</span>
            <a href="mailto:info@valoriainstitute.com">Email support</a>
          </footer>
        </section>
      )}

      <button ref={launcherRef} className={`valoria-support-launcher ${open ? 'is-open' : ''}`} type="button" aria-expanded={open} aria-controls={open ? 'valoria-support-panel' : undefined} onClick={() => setOpen(value => !value)}>
        <span className="valoria-support-launcher-icon" aria-hidden="true">{open ? '×' : '✦'}</span>
        <span>{open ? 'Close assistant' : 'Chat with Valoria'}</span>
      </button>
    </div>
  )
}
