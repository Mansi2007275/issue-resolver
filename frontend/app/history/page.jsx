'use client'

import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { Check, AlertTriangle, Database } from 'lucide-react'

export default function HistoryPage() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('privatebounty_history')
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (_) {}
  }, [])

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('privatebounty_history')
      setHistory([])
    } catch (_) {}
  }

  // Pre-configured example cards
  const examples = [
    {
      id: 1,
      title: 'feat: Support hostNetwork for kubearmor-controller webhook',
      repo: 'kubearmor/KubeArmor',
      date: 'Today, 8:51 PM',
      canSolve: true,
      stats: '82% confidence · Intermediate · 8h',
      skills: ['React', 'Go', 'Node.js'],
    },
    {
      id: 2,
      title: 'Review OpenSSF tooling for usefulness to SDT',
      repo: 'openmainframeproject/software-discovery-tool',
      date: 'Today, 7:30 PM',
      canSolve: false,
      stats: '45% confidence · Advanced · 16h',
      skills: ['Python', 'JavaScript'],
    },
    {
      id: 3,
      title: 'Add Claude Code GitHub Workflow',
      repo: 'opensource-society/CodeClip',
      date: 'Today, 6:15 PM',
      canSolve: true,
      stats: '80% confidence · Beginner · 5h',
      skills: ['React', 'HTML', 'CSS', 'JavaScript'],
    },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px 24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <PageHeader
          title="Analysis History"
          subtitle="Your recent GitHub issue analyses — stored locally"
        />
        <button
          onClick={handleClearHistory}
          style={{
            backgroundColor: 'transparent',
            color: '#dc2626',
            border: '1.5px solid #fca5a5',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          Clear History
        </button>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
        {examples.map((card) => (
          <div
            key={card.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#14532d',
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  {card.title}
                </h3>
                <span style={{ fontSize: '12px', color: '#4b7a5a' }}>
                  {card.repo} · {card.date}
                </span>
              </div>

              {card.canSolve ? (
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Check size={12} />
                  Can solve
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: '#fff8e1',
                    border: '1px solid #ffe082',
                    color: '#b7791f',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertTriangle size={12} />
                  Skill gap
                </span>
              )}
            </div>

            <div style={{ fontSize: '13px', color: '#4b7a5a' }}>
              {card.stats}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {card.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <a
                href={`/?url=${encodeURIComponent('https://github.com/' + card.repo + '/issues/1')}`}
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Re-analyze →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Box */}
      <div
        style={{
          backgroundColor: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          marginTop: '32px',
          color: '#4b7a5a',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Database size={24} style={{ color: '#16a34a' }} />
        <span>
          History is stored locally in your browser. Real analyses will appear here after you use the Analyze tab.
        </span>
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#86efac', marginTop: '24px' }}>
        In a future version, history will be saved to localStorage so it persists across sessions.
      </div>
    </div>
  )
}
