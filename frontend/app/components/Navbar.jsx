'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Clock, Settings, FileText, Info } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Analyze', icon: Search },
    { href: '/history', label: 'History', icon: Clock },
    { href: '/how-it-works', label: 'How it Works', icon: Settings },
    { href: '/docs', label: 'Docs', icon: FileText },
    { href: '/about', label: 'About', icon: Info },
  ]

  return (
    <nav
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1.5px solid #bbf7d0',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Side: Logo & App Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: '#16a34a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#14532d',
              }}
            >
              PrivateBounty
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>AI</span>
            </span>
            <span
              style={{
                color: '#86efac',
                fontSize: '10px',
                fontWeight: 500,
              }}
            >
              by QVAC SDK
            </span>
          </div>
        </div>

        {/* Center: Nav Links */}
        <div
          className="navbar-tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/analyze')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: isActive ? '1.5px solid #bbf7d0' : '1.5px solid transparent',
                  borderRadius: '6px',
                  backgroundColor: isActive ? '#dcfce7' : 'transparent',
                  color: isActive ? '#16a34a' : '#6b7280',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Side: Badges & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* QVAC badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '999px',
              padding: '4px 10px',
            }}
          >
            <div
              className="pulsing-green-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#16a34a',
              }}
            >
              QVAC on-device
            </span>
          </div>

          {/* GitHub Star Button */}
          <a
            href="https://github.com/Mansi2007275/issue-resolver"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
          >
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
