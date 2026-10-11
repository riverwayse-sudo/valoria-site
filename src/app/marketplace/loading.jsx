const shimmer = {
  background: 'linear-gradient(90deg, #EDE8DC 25%, #F7F4EE 50%, #EDE8DC 75%)',
  backgroundSize: '200% 100%',
  borderRadius: 6,
}
const line = (width, height = 12) => ({ ...shimmer, width, height })

export default function MarketplaceLoading() {
  return (
    <main aria-busy="true" aria-live="polite" aria-label="Loading Valoria Marketplace" style={{ minHeight: '100vh', background: '#FAFAF7', color: '#1A1A2E' }}>
      <div aria-hidden="true" style={{ height: 82, padding: '0 clamp(20px, 5vw, 72px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE8DC' }}>
        <div style={{ ...shimmer, width: 142, height: 36 }} />
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={line(54)} /><div style={line(70)} /><div style={line(68)} /><div style={{ ...shimmer, width: 132, height: 38, borderRadius: 4 }} />
        </div>
      </div>
      <section style={{ padding: 'clamp(38px, 6vw, 76px) clamp(20px, 5vw, 72px) 24px', background: '#F7F4EE' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ ...line(190, 10), marginBottom: 22 }} />
          <div style={{ ...line('min(540px, 80%)', 44), marginBottom: 12 }} />
          <div style={{ ...line('min(390px, 70%)', 18), marginBottom: 30 }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[82, 108, 108, 122].map((width, i) => <div key={i} style={{ ...shimmer, width, height: 38, borderRadius: 4 }} />)}
          </div>
        </div>
      </section>
      <section style={{ padding: '22px clamp(20px, 5vw, 72px) 70px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <div style={{ ...shimmer, height: 44, flex: 1, maxWidth: 720 }} />
          <div style={{ ...shimmer, height: 44, width: 230 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 255px), 1fr))', gap: 18 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <article key={i} style={{ minHeight: 300, padding: 18, border: '1px solid #EDE8DC', borderRadius: 9, background: '#F7F4EE' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ ...shimmer, width: 58, height: 58, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'grid', gap: 9 }}>
                  <div style={line('48%', 9)} /><div style={line('78%', 13)} /><div style={line('56%', 10)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, marginBottom: 22 }}>
                {[74, 56, 88].map((width, j) => <div key={j} style={{ ...shimmer, width, height: 23, borderRadius: 3 }} />)}
              </div>
              <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
                <div style={line('74%', 15)} /><div style={line('46%', 10)} /><div style={line('92%', 10)} /><div style={line('82%', 10)} /><div style={line('66%', 10)} />
              </div>
              <div style={{ ...shimmer, width: '100%', height: 1, marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={line('38%', 11)} /><div style={{ ...shimmer, width: 86, height: 30, borderRadius: 4 }} />
              </div>
            </article>
          ))}
        </div>
      </section>
      <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Loading marketplace profiles…</span>
    </main>
  )
}
