import './globals.css'
import LayoutWrapper from './components/LayoutWrapper'

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#f0fdf4', margin: 0 }}>
        <LayoutWrapper>{children}</LayoutWrapper>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: '1px solid #bbf7d0',
            padding: '24px',
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              paddingBottom: '24px',
            }}
          >
            {/* COLUMN 1: Logo & App Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#16a34a',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#14532d',
                  }}
                >
                  PrivateBounty <span style={{ color: '#16a34a' }}>AI</span>
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#4b7a5a' }}>
                A local-first GitHub issue analyzer
              </span>
              <span style={{ fontSize: '11px', color: '#86efac' }}>
                Built by Mansi Yadav
              </span>
            </div>

            {/* COLUMN 2: Built With */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#14532d' }}>Built With</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#4b7a5a' }}>
                <span>✅ QVAC SDK (@qvac/sdk)</span>
                <span>✅ Qwen3 4B on-device model</span>
                <span>✅ Next.js 15</span>
                <span>✅ SQLite local vector DB</span>
              </div>
            </div>

            {/* COLUMN 3: Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#14532d' }}>Links</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <a
                  href="https://github.com/Mansi2007275/issue-resolver"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#16a34a', textDecoration: 'none' }}
                >
                  GitHub Repo →
                </a>
                <a
                  href="https://docs.qvac.tether.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#16a34a', textDecoration: 'none' }}
                >
                  QVAC Docs →
                </a>
                <a
                  href="https://dorahacks.io/hackathon/qvac-unleach-edge-ai-i/detail"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#16a34a', textDecoration: 'none' }}
                >
                  DoraHacks Submission
                </a>
                <a
                  href="https://discord.com/invite/tetherdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#16a34a', textDecoration: 'none' }}
                >
                  QVAC Discord →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              borderTop: '1px solid #bbf7d0',
              paddingTop: '16px',
              textAlign: 'center',
              color: '#86efac',
              fontSize: '10px',
              fontWeight: 500,
            }}
          >
            © 2026 PrivateBounty AI · QVAC Hackathon I · MIT License · 0 cloud
          </div>
        </footer>
      </body>
    </html>
  )
}
