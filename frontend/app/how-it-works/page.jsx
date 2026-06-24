'use client'

import PageHeader from '../components/PageHeader'
import { Link2, Radio, Database, Cpu, Check, Lock, Zap, Bot, Atom } from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      icon: Link2,
      title: 'You paste a GitHub Issue URL',
      desc: 'Any public GitHub repo works — github.com/owner/repo/issues/123. No authentication needed.',
      tag: 'User Input',
      tagType: 'green',
    },
    {
      id: 2,
      icon: Radio,
      title: 'GitHub REST API fetches the issue',
      desc: 'The backend calls api.github.com to fetch the issue title, body, labels, and comments. This is the ONLY external network call the app makes.',
      tag: 'Only external call',
      tagType: 'amber',
    },
    {
      id: 3,
      icon: Database,
      title: 'Text is chunked and stored in local SQLite',
      desc: 'The issue text is split into 250-character chunks and stored in a SQLite database on YOUR device using @sqliteai/sqlite-wasm. Nothing is sent to any server.',
      tag: 'On-device storage',
      tagType: 'green',
    },
    {
      id: 4,
      icon: Cpu,
      title: 'QVAC SDK runs Qwen3 4B on your CPU',
      desc: 'The @qvac/sdk completion() function loads the Qwen3 4B model locally and generates a structured JSON analysis based on the issue context and your skills. Zero cloud. Zero API.',
      tag: 'QVAC SDK',
      tagType: 'green',
    },
    {
      id: 5,
      icon: Check,
      title: 'Analysis displayed in Next.js UI',
      desc: 'The structured JSON result (canSolve, confidence, difficulty, approach, skills) is shown in the result card. The chat feature also uses the same local model.',
      tag: 'Result',
      tagType: 'green',
    },
  ]

  const techStack = [
    {
      icon: Zap,
      title: 'QVAC SDK',
      detail: '@qvac/sdk — on-device inference, completion(), loadModel()',
    },
    {
      icon: Bot,
      title: 'Qwen3 4B Model',
      detail: 'QWEN3_4B_INST_Q4_K_M — 4B params, Q4 quantized, runs on CPU',
    },
    {
      icon: Atom,
      title: 'Next.js 15',
      detail: 'App Router, React 18, Tailwind CSS for the web interface',
    },
    {
      icon: Database,
      title: 'SQLite (local)',
      detail: '@sqliteai/sqlite-wasm — in-browser SQLite for vector storage',
    },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px 24px', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        title="How PrivateBounty AI Works"
        subtitle="5 steps — everything runs on your device via QVAC SDK"
      />

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderLeft: '3px solid #16a34a',
                  borderTop: '1px solid #bbf7d0',
                  borderRight: '1px solid #bbf7d0',
                  borderBottom: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  width: '100%',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#14532d', margin: 0 }}>
                      {step.title}
                    </h3>
                    <span
                      style={{
                        backgroundColor: step.tagType === 'amber' ? '#fff8e1' : '#dcfce7',
                        color: step.tagType === 'amber' ? '#b7791f' : '#15803d',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {step.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4b7a5a', margin: 0, lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  style={{
                    color: '#22c55e',
                    fontSize: '20px',
                    margin: '8px 0',
                    fontWeight: 'bold',
                  }}
                >
                  ↓
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Privacy Guarantee Box */}
      <div
        style={{
          backgroundColor: '#dcfce7',
          border: '1.5px solid #22c55e',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '40px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
        }}
      >
        <Lock size={28} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: 'bold', color: '#14532d', margin: '0 0 6px 0' }}>
            Privacy Guarantee
          </h4>
          <p style={{ fontSize: '13px', color: '#4b7a5a', margin: 0, lineHeight: 1.5 }}>
            Zero data is sent to any cloud server. Your GitHub issue content, your skills, and the AI analysis all stay on your machine. The only external call is to GitHub's public API to fetch the issue — which is public data anyway.
          </p>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div style={{ marginTop: '48px' }}>
        <h3
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px',
            color: '#14532d',
            marginBottom: '16px',
            fontWeight: 'bold',
          }}
        >
          Tech Stack
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {techStack.map((tech, i) => {
            const Icon = tech.icon
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <Icon size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '14px', color: '#14532d', margin: '0 0 4px 0', fontWeight: 'bold' }}>
                    {tech.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#4b7a5a', margin: 0, lineHeight: 1.4 }}>
                    {tech.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
