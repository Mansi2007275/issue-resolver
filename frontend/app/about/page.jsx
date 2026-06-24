'use client'

import { Check, Shield, DollarSign, Cpu, MessageSquare, ExternalLink } from 'lucide-react'

export default function AboutPage() {
  const highlights = [
    {
      icon: Shield,
      title: 'Privacy First',
      desc: 'Zero data leaves your device. No logs, no tracking, no telemetry.',
    },
    {
      icon: DollarSign,
      title: 'Zero Cost',
      desc: 'No API bills. No subscription. Run it forever, completely free.',
    },
    {
      icon: Cpu,
      title: 'Truly Private',
      desc: 'The AI model runs on your CPU. Your issues stay on your machine.',
    },
  ]

  const hackathonDetails = [
    { label: 'Event', value: 'QVAC Hackathon I — Unleash Edge AI' },
    { label: 'Organizer', value: 'QVAC team at Tether' },
    { label: 'Track', value: 'General Purpose Devices' },
    { label: 'Prize pool', value: '21,000 USDT' },
    { label: 'Dates', value: 'June 1–21, 2026' },
    { label: 'Status', value: 'Submitted' },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px 24px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Hero Card */}
      <div
        style={{
          backgroundColor: '#dcfce7',
          border: '1.5px solid #22c55e',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#16a34a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="20"
              height="20"
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
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 'bold', color: '#14532d', margin: 0 }}>
              PrivateBounty AI
            </h2>
            <span style={{ fontSize: '12px', color: '#4b7a5a', fontWeight: 500 }}>
              Local-first GitHub issue analyzer
            </span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#4b7a5a', margin: '12px 0 0 0', lineHeight: 1.6 }}>
          Built for QVAC Hackathon I — Unleash Edge AI by Tether (June 2026). PrivateBounty AI helps open source developers decide which GitHub issues they can solve — using AI that runs 100% on their own device. No cloud. No API key. No vendor lock-in. No API bills.
        </p>
      </div>

      {/* Grid: Builder & Why I Built This */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Builder card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            MY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: '#86efac', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Built by
            </span>
            <span style={{ color: '#14532d', fontSize: '16px', fontWeight: 'bold' }}>
              Mansi Yadav
            </span>
            <span style={{ color: '#4b7a5a', fontSize: '12px' }}>
              Ghaziabad, India
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              {['React', 'JavaScript', 'Node.js', 'Next.js'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href="https://github.com/Mansi2007275"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#16a34a',
                fontSize: '12px',
                textDecoration: 'none',
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 500,
              }}
            >
              github.com/Mansi2007275
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Why I built this */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#14532d', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} style={{ color: '#16a34a' }} />
            Why I Built This
          </h3>
          <p style={{ fontStyle: 'italic', color: '#4b7a5a', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
            "As an open source contributor, I spend a lot of time reading GitHub issues trying to figure out which ones I can actually solve. I wanted a tool that could help me make that decision faster — and I wanted it to be completely private, so my code browsing habits aren't sent to any cloud service. The QVAC SDK made it possible to run a real 4B parameter AI model entirely on my laptop. That's exactly what edge AI should feel like."
          </p>
        </div>
      </div>

      {/* Hackathon Info Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', color: '#14532d', margin: '0 0 16px 0', fontWeight: 'bold' }}>
          QVAC Hackathon I
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          {hackathonDetails.map((detail, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: idx < hackathonDetails.length - 1 ? '1px solid #f0fdf4' : 'none',
                paddingBottom: '8px',
                paddingTop: idx > 0 ? '4px' : '0',
              }}
            >
              <span style={{ color: '#4b7a5a', fontWeight: 500 }}>{detail.label}</span>
              <span style={{ color: '#14532d', fontWeight: 600 }}>{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {highlights.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Icon size={24} style={{ color: '#22c55e' }} />
              <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '14px', color: '#14532d', margin: 0, fontWeight: 'bold' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#4b7a5a', margin: 0, lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Open Source Footer Box */}
      <div
        style={{
          backgroundColor: '#dcfce7',
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#14532d', fontSize: '14px' }}>
          Open Source — MIT License
        </span>
        <p style={{ fontSize: '12px', color: '#4b7a5a', margin: 0 }}>
          Fork it, build on it, ship it. No restrictions.
        </p>
        <a
          href="https://github.com/Mansi2007275/issue-resolver"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            marginTop: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          View on GitHub
        </a>
      </div>
    </div>
  )
}
