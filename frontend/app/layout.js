import './globals.css'

export const metadata = {
  title: 'PrivateBounty AI',
  description:
    'Analyze any GitHub issue with local AI. Paste a URL, get an instant skill-matched analysis powered by QVAC SDK. No cloud. No API key. 100% on-device.',
  keywords: 'github, bounty, ai, local, qvac, on-device, privacy, rag',
  openGraph: {
    title: 'PrivateBounty AI',
    description: 'On-device GitHub issue analysis. No cloud. Powered by QVAC SDK.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@500;600&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dot-grid" style={{ backgroundColor: 'var(--bg-base)' }}>
        {/* ── Top Navbar ── */}
        <nav
          style={{
            height: 'var(--navbar-height)',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'rgba(8, 8, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L13 4V8C13 11 10.5 13.5 8 15C5.5 13.5 3 11 3 8V4L8 1Z" fill="white" fillOpacity="0.9" />
                  <circle cx="8" cy="8" r="2.5" fill="white" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: 'Space Grotesk, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 17,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.3px',
                }}
              >
                PrivateBounty
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}> AI</span>
              </span>
            </div>

            {/* Right: QVAC Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 999,
                padding: '6px 14px',
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  animation: 'pulseDot 2s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-accent)',
                  whiteSpace: 'nowrap',
                }}
              >
                Powered by QVAC SDK
              </span>
            </div>
          </div>
        </nav>

        {/* ── Page Content ── */}
        <main style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
          {children}
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: '1px solid var(--border)',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span>Built for QVAC Hackathon I on DoraHacks · </span>
          <span style={{ color: 'var(--text-accent)' }}>100% on-device · 0 cloud calls</span>
          <span> · Powered by QVAC SDK by Tether</span>
        </footer>
      </body>
    </html>
  )
}
