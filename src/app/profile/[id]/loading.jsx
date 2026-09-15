export default function ProfileLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading professional profile"
      style={{
        minHeight: '100vh',
        background: '#0F0F1A',
        color: 'rgba(247,244,238,.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Raleway, sans-serif',
        fontSize: '13px',
        letterSpacing: '.08em',
      }}
    >
      Loading profile…
    </div>
  )
}
