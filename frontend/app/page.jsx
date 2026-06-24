'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Github,
  Sparkles,
  Check,
  X,
  ExternalLink,
  Zap,
  Clock,
  Target,
  GitBranch,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
  FolderOpen,
  FlaskConical,
  ListTodo,
  FileText,
  MessageCircle,
  ArrowRight,
  Star,
  Copy,
  Link2,
} from 'lucide-react'

// ── Constants & Helpers ──────────────────────────────────────────────────────

const GITHUB_ISSUE_REGEX =
  /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+\/?(\\?.*)?$/

const LOADING_STEPS = [
  { id: 0, label: 'Fetching issue from GitHub', btnText: 'Fetching from GitHub...' },
  { id: 1, label: 'Building local knowledge index', btnText: 'Building knowledge index...' },
  { id: 2, label: 'Running on-device AI analysis', btnText: 'Running AI analysis...' },
]

const TERMINAL_LINES = [
  '> Connecting to GitHub API...',
  "> Issue fetched: '{title}'",
  '> Chunking text into {chunks} segments...',
  '> Loading GTE_LARGE_FP16 embedding model...',
  '> Embedding and indexing locally...',
  '> Loading LLaMA 3.2 1B model...',
  '> Generating analysis...',
]

const QUICK_ACTIONS = [
  { id: 'files', icon: FolderOpen, title: 'Files to Edit', sub: 'Which files should I look at first?' },
  { id: 'test', icon: FlaskConical, title: 'Test Strategy', sub: 'How should I test my fix?' },
  { id: 'subtasks', icon: ListTodo, title: 'Break into Subtasks', sub: 'Split into smaller chunks' },
  { id: 'pr', icon: FileText, title: 'Generate PR Draft', sub: 'Write my PR description' },
]

const FEATURE_PILLS = [
  { label: 'Zero cloud' },
  { label: 'On-device LLM' },
  { label: 'No API key' },
  { label: 'Private' },
]

function parseGitHubUrl(url) {
  const match = url.trim().match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)/
  )
  if (!match) return null
  return { owner: match[1], repo: match[2], issueNumber: match[3] }
}

function getLabelStyle(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('bug')) return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#dc2626' }
  if (n.includes('enhancement') || n.includes('feature')) return { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#2563eb' }
  if (n.includes('good first')) return { bg: '#dcfce7', border: '#86efac', color: '#15803d' }
  if (n.includes('help wanted')) return { bg: '#fefce8', border: '#fde68a', color: '#92400e' }
  return { bg: '#dcfce7', border: '#86efac', color: '#15803d' }
}

function getDifficultyStyle(difficulty) {
  const d = (difficulty || '').toLowerCase()
  if (d.includes('beginner') || d.includes('easy')) return { bg: '#dcfce7', color: '#15803d', border: '#86efac' }
  if (d.includes('advanced') || d.includes('expert')) return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' }
  return { bg: '#fefce8', color: '#92400e', border: '#fde68a' }
}

function getConfidenceColor(pct) {
  if (pct > 70) return '#16a34a'
  if (pct >= 40) return '#f59e0b'
  return '#ef4444'
}

function getComplexity(difficulty, hours) {
  const d = (difficulty || '').toLowerCase()
  if (d.includes('advanced') || hours > 16) return 'High complexity'
  if (d.includes('beginner') || hours <= 4) return 'Low complexity'
  return 'Medium complexity'
}

function parseApproachSteps(approach) {
  if (!approach) return []
  const lines = approach.split('\n').filter(Boolean)
  const steps = []
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*(.+)/)
    steps.push(m ? m[1] : line.replace(/^[-•]\s*/, ''))
  }
  return steps.length ? steps : [approach]
}

function formatTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Particle Canvas Component ───────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const particles = []
    const PARTICLE_COUNT = 50
    const MAX_DIST = 110

    function resize() {
      canvas.width = canvas.parentElement.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement.clientHeight || window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.08 * (1 - dist / MAX_DIST)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      // Draw and move particles
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'
        ctx.fill()

        p.x += p.vx
        p.y += p.vy

        // Wrap around boundary instead of bouncing for smoother floating look
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ConfidenceRing({ value, size = 96 }) {
  const [display, setDisplay] = useState(0)
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const color = '#22c55e'
  const offset = circumference - (display / 100) * circumference

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    let start = null
    const duration = 1200
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplay(Math.round(progress * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#dcfce7"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="ring-progress"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center mono font-bold"
        style={{ fontSize: size * 0.22, color: '#14532d' }}
      >
        {display}%
      </div>
    </div>
  )
}

function ProgressBar({ label, value, delay = 0 }) {
  const color = getConfidenceColor(value)
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2 text-sm">
        <span style={{ color: '#4b7a5a' }}>{label}</span>
        <span className="mono font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#dcfce7' }}>
        <div
          className="progress-bar-fill h-full rounded-full"
          style={{
            '--bar-target': `${value}%`,
            '--bar-delay': `${delay}ms`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) { }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{
        background: '#dcfce7',
        border: '1px solid #86efac',
        color: '#15803d',
      }}
    >
      <Copy size={12} />
      {copied ? 'Copied! ✓' : 'Copy'}
    </button>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-3 chat-bubble-ai">
      <span style={{ fontSize: 13, color: '#4b7a5a' }}>Analyzing...</span>
      <div className="flex gap-1">
        <span className="thinking-dot bounce-dot-1" />
        <span className="thinking-dot bounce-dot-2" />
        <span className="thinking-dot bounce-dot-3" />
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage({ activeTab: propActiveTab, setActiveTab: propSetActiveTab }) {
  const [localActiveTab, setLocalActiveTab] = useState('analyze')
  const activeTab = propActiveTab || localActiveTab
  const setActiveTab = propSetActiveTab || setLocalActiveTab

  // ── Existing State ──
  const [githubUrl, setGithubUrl] = useState('')
  const [compareUrl, setCompareUrl] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Node.js']) // Pre-filled skills tags
  const [skillsInput, setSkillsInput] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [terminalLines, setTerminalLines] = useState([])
  const [error, setError] = useState(null)

  const [result, setResult] = useState(null)
  const [result2, setResult2] = useState(null)

  const [approachOpen, setApproachOpen] = useState(true)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [breakdownLoading, setBreakdownLoading] = useState(false)
  const [breakdown, setBreakdown] = useState(null)
  const [breakdownError, setBreakdownError] = useState(null)
  const [prDraftOpen, setPrDraftOpen] = useState(false)
  const [checkedSubtasks, setCheckedSubtasks] = useState({})

  const [chatHistory, setChatHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [streamingMessage, setStreamingMessage] = useState('')
  const [chatThinking, setChatThinking] = useState(false)
  const [chatStreaming, setChatStreaming] = useState(false)

  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const terminalTimers = useRef([])

  const urlValid = useMemo(() => GITHUB_ISSUE_REGEX.test(githubUrl.trim()), [githubUrl])
  const compareUrlValid = useMemo(() => GITHUB_ISSUE_REGEX.test(compareUrl.trim()), [compareUrl])
  const urlTouched = githubUrl.length > 0
  const compareTouched = compareUrl.length > 0

  const canAnalyze = urlValid && (!compareMode || compareUrlValid) && !loading

  const scrollChat = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollChat()
  }, [chatHistory, streamingMessage, chatThinking, scrollChat])

  // Support Tab Change Custom Event sync
  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail)
    }
    window.addEventListener('set-active-tab', handleTabChange)
    return () => window.removeEventListener('set-active-tab', handleTabChange)
  }, [setActiveTab])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('active-tab-changed', { detail: activeTab }))
  }, [activeTab])

  const clearTerminalTimers = () => {
    terminalTimers.current.forEach(clearTimeout)
    terminalTimers.current = []
  }

  const startTerminalAnimation = (issueTitle = 'Fix button accessibility', chunks = 4) => {
    clearTerminalTimers()
    setTerminalLines([])
    const lines = TERMINAL_LINES.map((l) =>
      l
        .replace('{title}', issueTitle)
        .replace('{chunks}', String(chunks))
    )
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        setTerminalLines((prev) => [...prev, line])
      }, i * 600)
      terminalTimers.current.push(t)
    })
  }

  const advanceLoadingSteps = () => {
    setLoadingStep(0)
    const t1 = setTimeout(() => setLoadingStep(1), 2500)
    const t2 = setTimeout(() => setLoadingStep(2), 5500)
    terminalTimers.current.push(t1, t2)
  }

  const analyzeOne = async (url, userSkills) => {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), skills: userSkills }),
    })
    if (!res.ok) {
      let errText = await res.text()
      try {
        const parsed = JSON.parse(errText)
        errText = parsed.error || errText
      } catch {
        if (errText.includes('<!DOCTYPE') || errText.includes('<html')) {
          errText = `Server error (${res.status}). API route may be unavailable — restart the dev server.`
        }
      }
      throw new Error(errText || `Analysis failed (${res.status})`)
    }
    return res.json()
  }

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    setError(null)
    setResult(null)
    setResult2(null)
    setBreakdown(null)
    setBreakdownError(null)
    setBreakdownOpen(false)
    setChatHistory([])
    setLoading(true)
    setLoadingStep(0)
    startTerminalAnimation()
    advanceLoadingSteps()

    try {
      const data = await analyzeOne(githubUrl, skills)
      setResult(data)
      setLoadingStep(3)

      if (compareMode && compareUrlValid) {
        const data2 = await analyzeOne(compareUrl, skills)
        setResult2(data2)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      clearTerminalTimers()
      setLoading(false)
    }
  }

  const applyBreakdown = (data) => {
    setBreakdown(data)
    setBreakdownError(null)
    const initial = {}
      ; (data.subtasks || []).forEach((s) => {
        initial[s.id || s.text] = false
      })
    setCheckedSubtasks(initial)
  }

  const loadBreakdown = async (workspace) => {
    if (breakdown || breakdownLoading) return
    setBreakdownLoading(true)
    setBreakdownError(null)
    try {
      const params = new URLSearchParams({
        workspace: workspace || '',
        issueTitle: result?.issue?.title || '',
        skills: skills.join(','),
      })
      const res = await fetch(`/api/breakdown?${params}`)
      if (res.ok) {
        applyBreakdown(await res.json())
      } else {
        let errMsg = 'Could not generate breakdown, please try again'
        try {
          const errData = await res.json()
          errMsg = errData.error || errMsg
        } catch (_) { }
        setBreakdownError(errMsg)
      }
    } catch (_) {
      setBreakdownError('Could not generate breakdown, please try again')
    } finally {
      setBreakdownLoading(false)
    }
  }

  useEffect(() => {
    if (breakdownOpen && result?.workspace) {
      loadBreakdown(result.workspace)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdownOpen, result?.workspace])

  const handleSkillsChange = (e) => {
    const val = e.target.value
    if (val.includes(',')) {
      const parts = val.split(',')
      const newTags = parts
        .slice(0, -1)
        .map((s) => s.trim())
        .filter(Boolean)
      setSkills((prev) => {
        const merged = [...prev]
        newTags.forEach((t) => {
          if (!merged.some((s) => s.toLowerCase() === t.toLowerCase())) merged.push(t)
        })
        return merged
      })
      setSkillsInput(parts[parts.length - 1])
    } else {
      setSkillsInput(val)
    }
  }

  const handleSkillsKeyDown = (e) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault()
      const t = skillsInput.trim()
      if (!skills.some((s) => s.toLowerCase() === t.toLowerCase())) {
        setSkills((prev) => [...prev, t])
      }
      setSkillsInput('')
    }
    if (e.key === 'Backspace' && !skillsInput && skills.length) {
      setSkills((prev) => prev.slice(0, -1))
    }
  }

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const sendChat = async (message, preset = null) => {
    const text = (message || chatInput).trim()
    if (!text || chatStreaming || !result) return

    const userMsg = { role: 'user', content: text, time: new Date() }
    setChatHistory((prev) => [...prev, userMsg])
    setChatInput('')
    setChatThinking(true)
    setStreamingMessage('')
    setChatStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          preset,
          workspace: result.workspace,
          issueUrl: githubUrl,
          skills,
          history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Chat request failed')

      setChatThinking(false)

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingMessage(accumulated)
      }

      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: accumulated, time: new Date() },
      ])
      setStreamingMessage('')
    } catch (_) {
      setChatThinking(false)
      const fallback = preset
        ? `Based on the issue analysis, here's my guidance for "${text}":\n\n${result.analysis?.firstStep || 'Start by reading the issue thread and reproducing the bug locally.'}\n\nRecommended approach:\n${result.analysis?.approach || 'Follow the numbered steps in the analysis above.'}`
        : `I analyzed this issue locally. ${result.analysis?.canSolve ? 'You appear well-suited to tackle it.' : 'There may be skill gaps to address first.'} Key first step: ${result.analysis?.firstStep || 'Review the issue description carefully.'}`
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: fallback, time: new Date() },
      ])
      setStreamingMessage('')
    } finally {
      setChatStreaming(false)
    }
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChat()
    }
  }

  const handleQuickAction = (action) => {
    const prompts = {
      files: 'Which files should I look at first to solve this issue?',
      test: 'How should I test my fix for this issue?',
      subtasks: 'Break this issue into smaller subtasks with time estimates.',
      pr: 'Generate a PR description for fixing this issue.',
    }
    sendChat(prompts[action.id], action.id)
    chatInputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const matchedSkills = useMemo(() => {
    if (!result?.analysis) return []
    const required = result.analysis.requiredSkills || []
    const missing = (result.analysis.missingSkills || []).map((s) => s.toLowerCase())
    return required.filter((s) => !missing.includes(s.toLowerCase()))
  }, [result])

  const missingSkills = result?.analysis?.missingSkills || []

  const recommendedIssue = useMemo(() => {
    if (!result || !result2) return null
    const score = (r) => {
      if (!r?.analysis) return 0
      let s = r.analysis.confidence || 0
      if (r.analysis.canSolve) s += 20
      s -= (r.analysis.estimatedHours || 0) * 0.5
      return s
    }
    return score(result) >= score(result2) ? 1 : 2
  }, [result, result2])

  const analysis = result?.analysis
  const issue = result?.issue
  const approachSteps = parseApproachSteps(analysis?.approach)

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* ── Particle Canvas Background ── */}
      <ParticleCanvas />

      {/* Main Container */}
      <div
        className="max-w-[1100px] mx-auto px-6 pb-24"
        style={{ position: 'relative', zIndex: 1, fontFamily: 'Inter, sans-serif' }}
      >
        {/* ════════════════════════════════════════════════════════════════════
           TAB 1: ANALYZE TAB
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analyze' && (
          <div>
            {/* HERO SECTION */}
            <section className="pt-16 pb-8 text-center fade-up">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span
                  className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full"
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    fontWeight: 500,
                  }}
                >
                  <span className="pulse-dot-hero" />
                  Built for QVAC Hackathon I by Tether
                </span>
              </div>

              {/* Title lines */}
              <h1
                className="font-display leading-tight mb-4"
                style={{
                  fontSize: '30px',
                  fontWeight: 500,
                  color: '#14532d',
                }}
              >
                Analyze any GitHub issue
                <br />
                <span style={{ color: '#16a34a', fontStyle: 'italic' }}>with on-device AI</span>
              </h1>

              {/* Subtitle */}
              <p
                className="max-w-xl mx-auto mb-8 leading-relaxed"
                style={{ color: '#4b7a5a', fontSize: '13px' }}
              >
                Paste a GitHub issue URL and your skills — get instant AI analysis running 100% on your device. No cloud. No API key. Your data never leaves your machine.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {FEATURE_PILLS.map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                    }}
                  >
                    <span>{pill.label}</span>
                  </span>
                ))}
              </div>

              {/* Stats Row */}
              <div className="flex justify-center gap-6 mb-12 flex-wrap">
                {[
                  { value: '100%', label: 'On-device' },
                  { value: '0', label: 'Cloud calls' },
                  { value: '4B', label: 'Model params' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '120px',
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                      {stat.value}
                    </span>
                    <span style={{ fontSize: '10px', color: '#86efac', fontWeight: 500 }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* INPUT CARD */}
              <div
                className="text-left rounded-2xl p-8 fade-up-delay-1"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #bbf7d0',
                  boxShadow: '0 0 60px rgba(34, 197, 94, 0.04)',
                }}
              >
                <h3 className="font-display font-semibold text-lg mb-1" style={{ color: '#14532d' }}>
                  Analyze a GitHub Issue
                </h3>
                <p className="text-xs mb-6" style={{ color: '#4b7a5a' }}>
                  Enter any public GitHub issue URL to get started
                </p>

                {/* URL Input */}
                <div className="section-label">GitHub Issue URL</div>
                <div className="relative mb-2">
                  <Link2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#86efac' }}
                  />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/facebook/react/issues/1"
                    className={`input-field pl-11 pr-11 ${urlTouched ? (urlValid ? 'valid' : 'invalid') : ''}`}
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                    }}
                  />
                  {urlTouched && urlValid && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#22c55e' }}>
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] mb-6" style={{ color: '#4b7a5a' }}>
                  Works with any public GitHub repository
                </p>

                {/* Skills Input */}
                <div className="section-label">Your Skills</div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    minHeight: '46px',
                    marginBottom: '16px',
                    alignItems: 'center',
                  }}
                >
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-tag"
                      style={{
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#15803d',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={handleSkillsChange}
                    onKeyDown={handleSkillsKeyDown}
                    placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      flex: 1,
                      minWidth: '120px',
                      fontSize: '13px',
                      color: '#14532d',
                    }}
                  />
                </div>

                {/* Analyze Button */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className={`btn-primary w-full h-[52px] rounded-xl font-display font-medium text-[15px] flex items-center justify-center gap-2 ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      {' '}{LOADING_STEPS[Math.min(loadingStep, 2)]?.btnText || 'Analyzing...'}
                    </>
                  ) : (
                    <>Analyze with QVAC AI →</>
                  )}
                </button>

                {/* loading bar */}
                {loading && (
                  <div className="loading-bar-container" style={{ height: '3px', background: '#dcfce7', marginTop: '12px' }}>
                    <div className="loading-bar-fill" style={{ background: '#22c55e' }} />
                  </div>
                )}

                {/* Button Subtext */}
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#86efac',
                    marginTop: '10px',
                  }}
                >
                  Powered by Qwen3 4B running on your device
                </div>

                {error && (
                  <p className="mt-4 text-sm text-center" style={{ color: '#ef4444' }}>
                    {error}
                  </p>
                )}

                {/* Compare Toggle */}
                <button
                  type="button"
                  onClick={() => setCompareMode((v) => !v)}
                  className="mt-4 w-full text-sm transition-colors"
                  style={{ color: '#4b7a5a', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {compareMode ? '− Hide comparison' : '+ Compare with another issue'}
                </button>

                {/* Compare URL Input */}
                <AnimatePresence>
                  {compareMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <div className="section-label">Second Issue URL</div>
                        <div className="relative">
                          <Link2
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: '#86efac' }}
                          />
                          <input
                            type="url"
                            value={compareUrl}
                            onChange={(e) => setCompareUrl(e.target.value)}
                            placeholder="https://github.com/owner/repo/issues/99"
                            className={`input-field pl-11 pr-11 ${compareTouched ? (compareUrlValid ? 'valid' : 'invalid') : ''}`}
                            style={{
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* LOADING STATE LOGS */}
            <AnimatePresence>
              {loading && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-12"
                >
                  <div className="max-w-lg mx-auto mb-8 space-y-4">
                    {LOADING_STEPS.map((step) => {
                      const done = loadingStep > step.id
                      const active = loadingStep === step.id
                      return (
                        <div key={step.id} className="flex items-center gap-4">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${done
                                ? 'step-circle-done'
                                : active
                                  ? 'step-circle-green animate-pulse'
                                  : 'step-circle-pending'
                              }`}
                          >
                            {done ? <Check size={14} /> : active ? '●' : '○'}
                          </div>
                          <span
                            className={`text-sm ${done ? 'line-through' : ''}`}
                            style={{
                              color: done ? '#86efac' : active ? '#14532d' : '#4b7a5a',
                              opacity: active ? 1 : 0.6,
                            }}
                          >
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="terminal max-w-2xl mx-auto min-h-[200px]" style={{ backgroundColor: '#14532d', borderColor: '#22c55e' }}>
                    {terminalLines.map((line, i) => (
                      <div key={i} className="terminal-line" style={{ color: '#86efac' }}>
                        <span className="terminal-prompt" style={{ color: '#22c55e' }}>$</span>
                        {line}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* HOW IT WORKS (show only when no result yet and not loading) */}
            {!result && !loading && (
              <section className="mt-16 fade-up">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 className="font-display font-semibold text-2xl" style={{ color: '#14532d' }}>
                    How it works
                  </h2>
                  <p style={{ color: '#4b7a5a', fontSize: '13px' }}>
                    4 steps, all on your device
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {[
                    { id: '1', title: 'Paste issue URL', desc: 'Any public GitHub issue' },
                    { id: '2', title: 'Local RAG indexing', desc: 'Stored in SQLite on device' },
                    { id: '3', title: 'On-device LLM', desc: 'Qwen3 4B via QVAC SDK' },
                    { id: '4', title: 'Instant analysis', desc: 'Zero cloud, zero cost' },
                  ].map((step) => (
                    <div
                      key={step.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '16px',
                        }}
                      >
                        {step.id}
                      </div>
                      <h4
                        className="font-display font-semibold text-sm mb-2"
                        style={{ color: '#14532d' }}
                      >
                        {step.title}
                      </h4>
                      <p style={{ color: '#4b7a5a', fontSize: '12px' }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* RESULTS VIEW */}
            {result && !loading && (
              <div className="space-y-6 mt-8">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 fade-up">
                  <h3 className="font-display font-semibold text-xl" style={{ color: '#14532d' }}>
                    Analysis Complete
                  </h3>
                  <span
                    className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #bbf7d0',
                      color: '#15803d',
                      fontWeight: 500,
                    }}
                  >
                    Ran locally · 0 cloud calls
                  </span>
                </div>

                {/* Card 1 — Issue Info */}
                <div className="card p-6 fade-up">
                  <div className="flex items-start gap-3 mb-4">
                    <Github size={20} style={{ color: '#16a34a', marginTop: 2 }} />
                    <div className="flex-1 min-w-0">
                      <a
                        href={issue?.url || githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-base font-semibold hover:underline inline-flex items-center gap-2 break-words"
                        style={{ color: '#14532d' }}
                      >
                        {issue?.title || parseGitHubUrl(githubUrl)?.issueNumber || 'Issue'}
                        <ExternalLink size={14} style={{ color: '#86efac', flexShrink: 0 }} />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="mono" style={{ color: '#14532d', fontWeight: 500 }}>
                      {issue?.repo || `${parseGitHubUrl(githubUrl)?.owner}/${parseGitHubUrl(githubUrl)?.repo}`}
                    </span>
                    <span style={{ color: '#86efac' }}>·</span>
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full capitalize"
                      style={{
                        background: issue?.state === 'closed' ? '#f3f4f6' : '#dcfce7',
                        color: issue?.state === 'closed' ? '#6b7280' : '#15803d',
                        border: `1px solid ${issue?.state === 'closed' ? '#e5e7eb' : '#86efac'}`,
                      }}
                    >
                      {issue?.state || 'open'}
                    </span>
                    <span style={{ color: '#86efac' }}>·</span>
                    <span style={{ color: '#4b7a5a' }}>
                      {issue?.commentsCount ?? issue?.comments ?? 0} comments
                    </span>
                  </div>
                </div>

                {/* Card 2 — Verdict */}
                <div
                  className="card p-6 flex flex-col sm:flex-row items-center gap-6 fade-up-delay-1"
                  style={{
                    borderLeft: `4px solid ${analysis.canSolve ? '#22c55e' : '#f59e0b'}`,
                  }}
                >
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                      <h2 className="font-display text-2xl font-semibold" style={{ color: '#14532d' }}>
                        {analysis.canSolve ? 'You can solve this!' : 'Skill gap detected'}
                      </h2>
                    </div>
                    <p style={{ color: '#4b7a5a', fontSize: '13px' }}>
                      {analysis.canSolve
                        ? 'Skills match well'
                        : 'Some skills needed'}
                    </p>
                  </div>
                  <ConfidenceRing value={analysis.confidence || 0} />
                </div>

                {/* Stats 2x2 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-up-delay-2">
                  {/* Difficulty */}
                  <div className="stat-box">
                    <div className="flex items-center gap-2 mb-3" style={{ color: '#16a34a' }}>
                      <Zap size={18} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#4b7a5a' }}>Difficulty</span>
                    </div>
                    <span
                      className="inline-block text-xs px-3 py-1 rounded-full font-medium"
                      style={getDifficultyStyle(analysis.difficulty)}
                    >
                      {analysis.difficulty || 'Unknown'}
                    </span>
                  </div>

                  {/* Time Estimate */}
                  <div className="stat-box">
                    <div className="flex items-center gap-2 mb-3" style={{ color: '#16a34a' }}>
                      <Clock size={18} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#4b7a5a' }}>Time Estimate</span>
                    </div>
                    <div className="mono font-bold" style={{ fontSize: '28px', color: '#14532d' }}>
                      {analysis.estimatedHours || 0}h
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="stat-box">
                    <div className="flex items-center gap-2 mb-3" style={{ color: '#16a34a' }}>
                      <Target size={18} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#4b7a5a' }}>Confidence</span>
                    </div>
                    <div className="mono font-bold mb-3" style={{ fontSize: '28px', color: '#14532d' }}>
                      {analysis.confidence || 0}%
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#dcfce7' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${analysis.confidence || 0}%`,
                          background: '#22c55e',
                        }}
                      />
                    </div>
                  </div>

                  {/* Complexity */}
                  <div className="stat-box">
                    <div className="flex items-center gap-2 mb-3" style={{ color: '#16a34a' }}>
                      <GitBranch size={18} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#4b7a5a' }}>Complexity</span>
                    </div>
                    <div className="font-display font-medium text-lg" style={{ color: '#14532d' }}>
                      {getComplexity(analysis.difficulty, analysis.estimatedHours)}
                    </div>
                  </div>
                </div>

                {/* Suggested Approach */}
                <div className="card overflow-hidden fade-up-delay-3">
                  <button
                    type="button"
                    onClick={() => setApproachOpen((v) => !v)}
                    className="w-full flex items-center justify-between p-6 text-left transition-colors"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <h3 className="font-display font-semibold text-lg" style={{ color: '#14532d' }}>
                      Suggested Approach
                    </h3>
                    {approachOpen ? <ChevronUp size={20} style={{ color: '#16a34a' }} /> : <ChevronDown size={20} style={{ color: '#16a34a' }} />}
                  </button>
                  <AnimatePresence>
                    {approachOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6" style={{ background: '#ffffff' }}>
                          {approachSteps.map((step, i) => (
                            <div
                              key={i}
                              className="approach-step"
                              style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}
                            >
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: '#dcfce7',
                                  color: '#15803d',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {i + 1}
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: '#14532d', margin: 0 }}>
                                {step}
                              </p>
                            </div>
                          ))}

                          {analysis.firstStep && (
                            <div
                              className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                              style={{
                                border: '1.5px solid #22c55e',
                                backgroundColor: '#f0fdf4',
                              }}
                            >
                              <div>
                                <div className="text-xs font-semibold mb-1" style={{ color: '#16a34a' }}>
                                  → Start Here
                                </div>
                                <p className="font-display font-semibold text-sm" style={{ color: '#14532d', margin: 0 }}>
                                  {analysis.firstStep}
                                </p>
                              </div>
                              <CopyButton text={analysis.firstStep} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Skills Grid */}
                <div className="card p-6 fade-up-delay-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-display font-medium mb-4 text-sm" style={{ color: '#16a34a' }}>
                        You have these skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchedSkills.length > 0 ? (
                          matchedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                              style={{
                                background: '#dcfce7',
                                border: '1px solid #86efac',
                                color: '#15803d',
                                fontWeight: 500,
                              }}
                            >
                              <Check size={12} />
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm" style={{ color: '#4b7a5a' }}>
                            Add skills to see matches
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-display font-medium mb-4 text-sm" style={{ color: '#d97706' }}>
                        Skills to learn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.length > 0 ? (
                          missingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                              style={{
                                background: '#fefce8',
                                border: '1px solid #fde68a',
                                color: '#d97706',
                                fontWeight: 500,
                              }}
                            >
                              <BookOpen size={12} />
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm" style={{ color: '#4b7a5a' }}>
                            No gaps detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compare Results Table */}
                {result && result2 && (
                  <section className="mt-10 fade-up">
                    <h3 className="font-display font-semibold text-lg mb-4" style={{ color: '#14532d' }}>
                      Issue Comparison
                    </h3>
                    <div className="card overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: '1px solid #bbf7d0' }}>
                            <th className="text-left p-4 font-normal" style={{ color: '#4b7a5a' }}>Feature</th>
                            <th
                              className={`p-4 text-left font-display ${recommendedIssue === 1 ? 'recommended-col' : ''}`}
                              style={{ color: '#16a34a' }}
                            >
                              Issue 1
                              {recommendedIssue === 1 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#fefce8', color: '#92400e' }}>
                                  <Star size={10} fill="#f59e0b" style={{ color: '#f59e0b' }} /> Recommended
                                </span>
                              )}
                            </th>
                            <th
                              className={`p-4 text-left font-display ${recommendedIssue === 2 ? 'recommended-col' : ''}`}
                              style={{ color: '#16a34a' }}
                            >
                              Issue 2
                              {recommendedIssue === 2 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#fefce8', color: '#92400e' }}>
                                  <Star size={10} fill="#f59e0b" style={{ color: '#f59e0b' }} /> Recommended
                                </span>
                              )}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: 'Title', k1: result.issue?.title, k2: result2.issue?.title },
                            { label: 'Can Solve', k1: result.analysis?.canSolve ? 'Yes' : 'No', k2: result2.analysis?.canSolve ? 'Yes' : 'No' },
                            { label: 'Confidence', k1: `${result.analysis?.confidence}%`, k2: `${result2.analysis?.confidence}%` },
                            { label: 'Difficulty', k1: result.analysis?.difficulty, k2: result2.analysis?.difficulty },
                            { label: 'Est. Hours', k1: `${result.analysis?.estimatedHours}h`, k2: `${result2.analysis?.estimatedHours}h` },
                            { label: 'Missing Skills', k1: (result.analysis?.missingSkills || []).length, k2: (result2.analysis?.missingSkills || []).length },
                          ].map((row) => (
                            <tr key={row.label} className="compare-row" style={{ borderBottom: '1px solid #bbf7d0' }}>
                              <td className="p-4" style={{ color: '#4b7a5a' }}>{row.label}</td>
                              <td className={`p-4 mono text-xs ${recommendedIssue === 1 ? 'recommended-col' : ''}`} style={{ color: '#14532d' }}>{row.k1}</td>
                              <td className={`p-4 mono text-xs ${recommendedIssue === 2 ? 'recommended-col' : ''}`} style={{ color: '#14532d' }}>{row.k2}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Quick Actions 2x2 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      disabled={chatStreaming}
                      className="action-btn group"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dcfce7'
                        e.currentTarget.style.borderColor = '#22c55e'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff'
                        e.currentTarget.style.borderColor = '#bbf7d0'
                      }}
                    >
                      <div className="font-display font-semibold text-sm mb-1" style={{ color: '#14532d' }}>
                        {action.title}
                      </div>
                      <div className="text-xs" style={{ color: '#4b7a5a' }}>
                        {action.sub}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Chat Section */}
                <section className="mt-12 fade-up-delay-3" ref={chatInputRef}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={20} style={{ color: '#16a34a' }} />
                      <h3 className="font-display font-semibold text-base" style={{ color: '#14532d', margin: 0 }}>
                        Chat with AI about this issue
                      </h3>
                    </div>
                    <span
                      className="text-xs px-3 py-1 rounded-full self-start"
                      style={{
                        background: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        fontWeight: 500,
                      }}
                    >
                      On-device · QVAC Qwen3 4B
                    </span>
                  </div>

                  <div
                    className="rounded-2xl border mb-4 overflow-y-auto flex flex-col gap-4 p-5"
                    style={{
                      minHeight: 200,
                      maxHeight: 380,
                      background: '#ffffff',
                      borderColor: '#bbf7d0',
                    }}
                  >
                    {chatHistory.length === 0 && !chatThinking && !streamingMessage && (
                      <p className="text-sm text-center py-8" style={{ color: '#4b7a5a' }}>
                        Ask anything about this issue — files to edit, test strategy, or how to get started.
                      </p>
                    )}

                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                          style={{
                            backgroundColor: msg.role === 'user' ? '#16a34a' : '#dcfce7',
                            borderColor: msg.role === 'user' ? 'transparent' : '#86efac',
                            color: msg.role === 'user' ? '#ffffff' : '#14532d',
                          }}
                        >
                          <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                        </div>
                        <span className="text-[10px] mt-1 px-1" style={{ color: '#86efac' }}>
                          {formatTime(msg.time)}
                        </span>
                      </div>
                    ))}

                    {chatThinking && <ThinkingDots />}

                    {streamingMessage && (
                      <div className="flex flex-col items-start">
                        <div
                          className="chat-bubble-ai streaming-cursor"
                          style={{
                            backgroundColor: '#dcfce7',
                            borderColor: '#86efac',
                            color: '#14532d',
                          }}
                        >
                          <p className="whitespace-pre-wrap m-0">{streamingMessage}</p>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex gap-3">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder="Ask anything about this issue..."
                      disabled={chatStreaming}
                      rows={1}
                      className="input-field flex-1 resize-none min-h-[48px] py-3"
                      style={{
                        maxHeight: 120,
                        backgroundColor: '#f0fdf4',
                        borderColor: '#bbf7d0',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => sendChat()}
                      disabled={chatStreaming || !chatInput.trim()}
                      className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
           TAB 2: HISTORY TAB
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="pt-16 fade-up">
            <h2 className="font-display font-semibold text-2xl mb-1" style={{ color: '#14532d' }}>
              Analysis History
            </h2>
            <p className="text-sm mb-8" style={{ color: '#4b7a5a' }}>
              Stored locally on your device
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Card 1 */}
              <div
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
                    <h4 className="font-display font-semibold text-base" style={{ color: '#14532d', margin: 0 }}>
                      feat: Support hostNetwork for webhook Deployment
                    </h4>
                    <span style={{ fontSize: '12px', color: '#4b7a5a' }}>
                      kubearmor/KubeArmor · Today 8:51 PM
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#dcfce7',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 500,
                    }}
                  >
                    Can solve
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#4b7a5a' }}>
                  <span>82% match</span>
                  <span>·</span>
                  <span>Intermediate</span>
                  <span>·</span>
                  <span>8h estimate</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['React', 'Go', 'Node.js'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setGithubUrl('https://github.com/kubearmor/KubeArmor/issues/1')
                      setActiveTab('analyze')
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#16a34a',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Re-analyze →
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div
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
                    <h4 className="font-display font-semibold text-base" style={{ color: '#14532d', margin: 0 }}>
                      Review OpenSSF tooling for usefulness to SDT
                    </h4>
                    <span style={{ fontSize: '12px', color: '#4b7a5a' }}>
                      openmainframeproject/software-discovery-tool · Today 7:30 PM
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#fefce8',
                      border: '1px solid #fde68a',
                      color: '#d97706',
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 500,
                    }}
                  >
                    Skill gap
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#4b7a5a' }}>
                  <span>45% match</span>
                  <span>·</span>
                  <span>Advanced</span>
                  <span>·</span>
                  <span>16h estimate</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Python', 'JavaScript'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setGithubUrl('https://github.com/openmainframeproject/software-discovery-tool/issues/1')
                      setActiveTab('analyze')
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#16a34a',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Re-analyze →
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div
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
                    <h4 className="font-display font-semibold text-base" style={{ color: '#14532d', margin: 0 }}>
                      Add Claude Code GitHub Workflow
                    </h4>
                    <span style={{ fontSize: '12px', color: '#4b7a5a' }}>
                      opensource-society/CodeClip · Today 6:15 PM
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#dcfce7',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 500,
                    }}
                  >
                    Can solve
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#4b7a5a' }}>
                  <span>80% match</span>
                  <span>·</span>
                  <span>Beginner</span>
                  <span>·</span>
                  <span>5h estimate</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['React', 'HTML', 'CSS', 'JavaScript'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setGithubUrl('https://github.com/opensource-society/CodeClip/issues/1')
                      setActiveTab('analyze')
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#16a34a',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Re-analyze →
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                color: '#4b7a5a',
                fontSize: '12px',
                marginTop: '32px',
              }}
            >
              💾 History is stored locally in your browser
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
           TAB 3: HOW IT WORKS TAB
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'howItWorks' && (
          <div className="pt-16 fade-up">
            <h2 className="font-display font-semibold text-2xl mb-1" style={{ color: '#14532d' }}>
              How PrivateBounty AI Works
            </h2>
            <p className="text-sm mb-8" style={{ color: '#4b7a5a' }}>
              Everything runs on your device using the QVAC SDK
            </p>

            {/* Vertical flow diagram */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              {[
                { step: '1', title: 'You paste a GitHub Issue URL', detail: 'Any public repo — github.com/owner/repo/issues/123' },
                { step: '2', title: 'GitHub REST API fetches the issue', detail: 'Free, no auth. Fetches title, body, labels, comments' },
                { step: '3', title: 'QVAC ragIngest() indexes it locally', detail: 'Chunked and stored in SQLite on YOUR device only' },
                { step: '4', title: 'QVAC completion() runs Qwen3 4B on CPU', detail: '4B model generates analysis — zero cloud, zero API' },
                { step: '5', title: 'Analysis shown in UI', detail: 'canSolve, confidence, approach — all from local LLM' },
              ].map((flow, i) => (
                <div key={flow.step} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderLeft: '3px solid #16a34a',
                      borderRadius: '8px',
                      padding: '14px',
                      width: '100%',
                      maxWidth: '600px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <h4 className="font-display font-semibold text-sm mb-1" style={{ color: '#14532d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{flow.title}</span>
                    </h4>
                    <p style={{ color: '#4b7a5a', fontSize: '12px', margin: 0 }}>
                      {flow.detail}
                    </p>
                  </div>
                  {i < 4 && (
                    <div style={{ color: '#16a34a', fontSize: '20px', margin: '8px 0' }}>
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Privacy Guarantee Box */}
            <div
              style={{
                backgroundColor: '#dcfce7',
                border: '1.5px solid #22c55e',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '32px',
                color: '#14532d',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              <strong>Privacy Guarantee</strong> — Zero data is sent to any cloud. Your issue content, skills, and AI analysis stay on your machine. Only external call: GitHub public API to fetch the issue.
            </div>

            {/* Tech Stack 2x2 grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginTop: '32px',
              }}
            >
              {[
                { title: 'QVAC SDK', desc: '@qvac/sdk inference, RAG, completion' },
                { title: 'Qwen3 4B', desc: '4B LLM running on CPU via QVAC' },
                { title: 'Next.js 15', desc: 'React framework for the web interface' },
                { title: 'SQLite', desc: 'Local vector DB via @sqliteai/sqlite-wasm' },
              ].map((tech, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <h4 className="font-display font-semibold text-sm mb-1" style={{ color: '#14532d' }}>
                    {tech.title}
                  </h4>
                  <p style={{ color: '#4b7a5a', fontSize: '12px', margin: 0 }}>{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
           TAB 4: DOCS TAB
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'docs' && (
          <div className="pt-16 fade-up">
            <h2 className="font-display font-semibold text-2xl mb-8" style={{ color: '#14532d' }}>
              Documentation
            </h2>

            {/* Section 1 — Quick Start */}
            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-display font-semibold text-lg mb-3" style={{ color: '#14532d' }}>
                Quick Start
              </h3>
              <pre
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#4ade80',
                  padding: '16px',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  overflowX: 'auto',
                }}
              >
                {`git clone https://github.com/Mansi2007275/issue-resolver
cd backend && npm install
node server.js
cd ../frontend && npm install && npm run dev
Open: http://localhost:3000`}
              </pre>
            </div>

            {/* Section 2 — Hardware Requirements */}
            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-display font-semibold text-lg mb-3" style={{ color: '#14532d' }}>
                Hardware Requirements
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #bbf7d0' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #bbf7d0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#14532d', borderRight: '1px solid #bbf7d0' }}>Component</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#14532d', borderRight: '1px solid #bbf7d0' }}>Minimum</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#14532d' }}>Recommended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { component: 'CPU', min: 'Any modern', rec: '4+ cores recommended' },
                      { component: 'RAM', min: '8GB min', rec: '16GB recommended' },
                      { component: 'Storage', min: '5GB free', rec: '10GB recommended' },
                      { component: 'GPU', min: 'Not required', rec: 'Optional' },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          backgroundColor: i % 2 === 0 ? '#f0fdf4' : '#ffffff',
                          borderBottom: '1px solid #bbf7d0',
                        }}
                      >
                        <td style={{ padding: '12px', color: '#14532d', borderRight: '1px solid #bbf7d0', fontWeight: 'bold' }}>{row.component}</td>
                        <td style={{ padding: '12px', color: '#4b7a5a', borderRight: '1px solid #bbf7d0' }}>{row.min}</td>
                        <td style={{ padding: '12px', color: '#4b7a5a' }}>{row.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3 — QVAC SDK Features Used */}
            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-display font-semibold text-lg mb-3" style={{ color: '#14532d' }}>
                QVAC SDK Features Used
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {[
                  { title: 'completion()', desc: 'Runs LLM to generate analysis JSON' },
                  { title: 'loadModel()', desc: 'Loads Qwen3 4B with ctx_size 4096' },
                  { title: 'unloadModel()', desc: 'Releases model memory after request' },
                  { title: 'QWEN3_4B_INST_Q4_K_M', desc: 'Model constant for inference' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>
                      {item.title}
                    </div>
                    <p style={{ color: '#4b7a5a', fontSize: '12px', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4 — API Routes */}
            <div style={{ marginBottom: '32px' }}>
              <h3 className="font-display font-semibold text-lg mb-3" style={{ color: '#14532d' }}>
                API Routes
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  { method: 'POST', route: '/api/analyze', desc: 'Input: {url, skills} Output: {analysis}' },
                  { method: 'GET', route: '/api/breakdown', desc: 'Returns: {error: unavailable}' },
                  { method: 'POST', route: '/api/chat', desc: 'Input: {message,workspace} Output: {reply}' },
                ].map((route, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span
                        style={{
                          backgroundColor: route.method === 'GET' ? '#dcfce7' : '#f0fdf4',
                          border: `1px solid ${route.method === 'GET' ? '#86efac' : '#bbf7d0'}`,
                          color: '#16a34a',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {route.method}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 'bold', color: '#14532d' }}>
                        {route.route}
                      </span>
                    </div>
                    <p style={{ color: '#4b7a5a', fontSize: '12px', margin: 0 }}>{route.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5 — Links */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3" style={{ color: '#14532d' }}>
                Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <a href="https://docs.qvac.tether.io" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'none' }}>
                  QVAC Docs → https://docs.qvac.tether.io
                </a>
                <a href="https://huggingface.co/collections/qvac/medpsy" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'none' }}>
                  Models → https://huggingface.co/collections/qvac/medpsy
                </a>
                <a href="https://github.com/Mansi2007275/issue-resolver" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'none' }}>
                  GitHub → https://github.com/Mansi2007275/issue-resolver
                </a>
                <a href="https://dorahacks.io/hackathon/qvac-unleach-edge-ai-i/detail" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'none' }}>
                  Hackathon Submission → Link
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
           TAB 5: ABOUT TAB
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'about' && (
          <div className="pt-16 fade-up">
            <h2 className="font-display font-semibold text-2xl mb-8" style={{ color: '#14532d' }}>
              About PrivateBounty AI
            </h2>

            {/* Hero Card */}
            <div
              style={{
                backgroundColor: '#dcfce7',
                border: '1.5px solid #22c55e',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                color: '#14532d',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              PrivateBounty AI is a local-first GitHub issue analyzer built for the QVAC Hackathon I by Tether (June 2026). It helps open source developers decide which GitHub issues they can solve — using AI that runs 100% on their own device.
            </div>

            {/* Builder & Why I Built This Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Builder card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <h3 className="font-display font-semibold text-base mb-4" style={{ color: '#14532d' }}>
                  Built by Mansi Yadav
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#4b7a5a' }}>
                  <span><strong>Location:</strong> Ghaziabad, India</span>
                  <span><strong>Skills:</strong> React, JavaScript, Node.js, Next.js</span>
                  <span>
                    <strong>GitHub:</strong>{' '}
                    <a href="https://github.com/Mansi2007275" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>
                      github.com/Mansi2007275
                    </a>
                  </span>
                </div>
              </div>

              {/* Why I built this */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <h3 className="font-display font-semibold text-base mb-3" style={{ color: '#14532d' }}>
                  Why I built this
                </h3>
                <p style={{ color: '#4b7a5a', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                  As an open source contributor, I spend a lot of time reading GitHub issues trying to figure out which ones I can solve. I wanted a tool that helps me decide faster — and keeps my browsing private. QVAC SDK made it possible to run real AI locally.
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
                marginBottom: '24px',
              }}
            >
              <h3 className="font-display font-semibold text-base mb-4" style={{ color: '#14532d' }}>
                Hackathon Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#4b7a5a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0fdf4', paddingBottom: '6px' }}>
                  <span><strong>Event:</strong></span>
                  <span>QVAC Hackathon I — Unleash Edge AI</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0fdf4', paddingBottom: '6px' }}>
                  <span><strong>Organizer:</strong></span>
                  <span>QVAC team at Tether</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0fdf4', paddingBottom: '6px' }}>
                  <span><strong>Track:</strong></span>
                  <span>General Purpose</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0fdf4', paddingBottom: '6px' }}>
                  <span><strong>Prize Pool:</strong></span>
                  <span>21,000 USDT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                  <span><strong>Dates:</strong></span>
                  <span>June 1–21, 2026</span>
                </div>
              </div>
            </div>

            {/* 3 feature cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { title: 'Privacy First', desc: 'Zero data leaves your device.' },
                { title: 'Zero Cost', desc: 'No API bills. Run it forever free.' },
                { title: 'Fast', desc: 'No network latency for AI calls.' },
              ].map((feat, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <h4 className="font-display font-semibold text-sm mb-1" style={{ color: '#14532d' }}>
                    {feat.title}
                  </h4>
                  <p style={{ color: '#4b7a5a', fontSize: '12px', margin: 0 }}>{feat.desc}</p>
                </div>
              ))}
            </div>

            {/* MIT license note + GitHub link */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#4b7a5a' }}>
              Released under the{' '}
              <a href="https://github.com/Mansi2007275/issue-resolver/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', fontWeight: 'bold' }}>
                MIT License
              </a>
              . Feel free to fork and contribute!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
