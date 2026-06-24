'use client'

import { useState } from 'react'

export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {}
  }

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '8px',
        marginBottom: '16px',
      }}
    >
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: '#2d6a4f',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
        }}
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
      <pre
        style={{
          color: '#4ade80',
          fontFamily: 'JetBrains Mono, Courier New, monospace',
          fontSize: '12px',
          overflowX: 'auto',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          paddingRight: '60px',
        }}
      >
        {code}
      </pre>
    </div>
  )
}
