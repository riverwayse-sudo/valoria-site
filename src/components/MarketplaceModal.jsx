'use client'
import { useEffect } from 'react'
import MarketplaceOptionsList from './MarketplaceOptionsList'

// Shared "which marketplace?" popup. Any generic marketplace CTA site-wide
// should open this instead of navigating straight to ATB Connect — see
// MarketplaceCTA.jsx for the trigger wrapper used at each call site.
export default function MarketplaceModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <style>{`
        .vi-mkt-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(10,10,20,0.92);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: mktIn 0.4s ease;
        }
        @keyframes mktIn { from { opacity: 0; } to { opacity: 1; } }
        .vi-mkt-card {
          background: #0F0F1A;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 16px;
          padding: clamp(28px,5vw,44px);
          max-width: 560px; width: 100%;
          position: relative;
          animation: mktUp 0.4s ease;
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes mktUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vi-mkt-close {
          position: absolute; top: 18px; right: 18px;
          background: none; border: none; color: rgba(247,244,238,0.35);
          font-size: 20px; cursor: pointer; line-height: 1; padding: 4px;
        }
        .vi-mkt-eyebrow {
          font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
          color: rgba(201,168,76,0.5); text-transform: uppercase;
          margin-bottom: 12px; font-family: var(--font);
        }
        .vi-mkt-title {
          font-family: var(--font);
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 200; line-height: 1.15;
          letter-spacing: -0.02em;
          color: #F7F4EE; margin-bottom: 10px;
        }
        .vi-mkt-title em { color: #C9A84C; font-style: italic; font-weight: 300; }
        .vi-mkt-sub {
          font-size: 13px; font-weight: 300;
          color: rgba(247,244,238,0.45); line-height: 1.7;
          margin-bottom: 26px;
        }
      `}</style>

      <div
        className="vi-mkt-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a marketplace"
        onClick={() => onClose && onClose()}
      >
        <div className="vi-mkt-card" onClick={e => e.stopPropagation()}>
          {onClose && (
            <button className="vi-mkt-close" onClick={onClose} aria-label="Close">×</button>
          )}

          <div className="vi-mkt-eyebrow">ONE STANDARD. THREE WAYS IN.</div>
          <h2 className="vi-mkt-title">
            Which marketplace<br />are you here for?
          </h2>
          <p className="vi-mkt-sub">
            Every profile is underwritten by the same assessed standard. Pick the one that matches what you need.
          </p>

          <MarketplaceOptionsList />
        </div>
      </div>
    </>
  )
}
