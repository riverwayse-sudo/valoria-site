import { MARKETPLACE_OPTIONS } from '@/lib/marketplaceOptions'

export default function MarketplaceOptionsList() {
  return (
    <>
      <style>{`
        .vi-mkt-option {
          display: flex; align-items: center; gap: 14px;
          width: 100%; text-align: left;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(247,244,238,0.08);
          border-radius: 10px;
          padding: 16px 18px;
          margin-bottom: 12px;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .vi-mkt-option:last-child { margin-bottom: 0; }
        .vi-mkt-option:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(201,168,76,0.35);
          transform: translateX(2px);
        }
        .vi-mkt-bar {
          width: 3px; align-self: stretch; min-height: 48px;
          border-radius: 2px; flex-shrink: 0;
        }
        .vi-mkt-opt-tag {
          font-size: 9px; font-weight: 700; letter-spacing: 0.16em;
          font-family: var(--font); margin-bottom: 4px;
        }
        .vi-mkt-opt-label {
          font-family: var(--font); font-size: 16px; font-weight: 400;
          color: #F7F4EE; margin-bottom: 4px;
        }
        .vi-mkt-opt-desc {
          font-size: 12px; color: rgba(247,244,238,0.45);
          line-height: 1.5; font-family: var(--font);
        }
        .vi-mkt-opt-arrow { color: rgba(201,168,76,0.5); flex-shrink: 0; font-size: 18px; }
      `}</style>

      {MARKETPLACE_OPTIONS.map(opt => (
        <a key={opt.key} href={opt.href} className="vi-mkt-option">
          <div className="vi-mkt-bar" style={{ background: opt.color }} />
          <div style={{ flex: 1 }}>
            <div className="vi-mkt-opt-tag" style={{ color: opt.color }}>{opt.tag}</div>
            <div className="vi-mkt-opt-label">{opt.label} — {opt.cta}</div>
            <div className="vi-mkt-opt-desc">{opt.desc}</div>
          </div>
          <div className="vi-mkt-opt-arrow">→</div>
        </a>
      ))}
    </>
  )
}
