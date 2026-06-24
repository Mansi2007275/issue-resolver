export default function PageHeader({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: '32px', marginBottom: '32px' }}>
      <h1
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '24px',
          fontWeight: '700',
          color: '#14532d',
          marginBottom: '8px',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: '#4b7a5a',
          margin: 0,
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}
