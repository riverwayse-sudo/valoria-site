export default function MarketplaceLoading() {
  return (
    <main aria-busy="true" aria-label="Loading marketplace" style={{ minHeight: '100vh', background: '#F7F4EE', color: '#1A1A2E' }}>
      <header style={{ height: 80, borderBottom: '1px solid #D4C9A8', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ width: 130, height: 28, background: '#EDE8DC', borderRadius: 4 }} /><div style={{ width: 120, height: 12, background: '#EDE8DC', borderRadius: 4 }} /><div style={{ width: 110, height: 12, background: '#EDE8DC', borderRadius: 4 }} />
      </header>
      <section style={{ padding: '72px 24px 44px', borderBottom: '1px solid #D4C9A8' }}><div style={{ maxWidth: 1120, margin: '0 auto' }}><div style={{ width: 180, height: 10, background: '#EDE8DC', borderRadius: 3, marginBottom: 18 }} /><div style={{ width: 'min(620px, 80%)', height: 62, background: '#EDE8DC', borderRadius: 5, marginBottom: 20 }} /><div style={{ width: 'min(700px, 90%)', height: 18, background: '#EDE8DC', borderRadius: 4 }} /></div></section>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>{[1,2,3,4].map(i => <div key={i} style={{ height: 300, background: '#FAFAF7', border: '1px solid #D4C9A8', borderRadius: 8 }} />)}</div></section>
    </main>
  )
}
