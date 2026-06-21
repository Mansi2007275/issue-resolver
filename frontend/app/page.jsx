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
} from 'lucide-react'

// ── Constants & Helpers ──────────────────────────────────────────────────────

const GITHUB_ISSUE_REGEX =
  /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+\/?(\?.*)?$/

const LOADING_STEPS = [
  { id: 0, label: 'Fetching issue from GitHub', emoji: '📡', btnText: 'Fetching from GitHub...' },
  { id: 1, label: 'Building local knowledge index', emoji: '🧠', btnText: 'Building knowledge index...' },
  { id: 2, label: 'Running on-device AI analysis', emoji: '🤖', btnText: 'Running AI analysis...' },
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
  { id: 'files', icon: FolderOpen, emoji: '📁', title: 'Files to Edit', sub: 'Which files should I look at first?' },
  { id: 'test', icon: FlaskConical, emoji: '🧪', title: 'Test Strategy', sub: 'How should I test my fix?' },
  { id: 'subtasks', icon: ListTodo, emoji: '⏱', title: 'Break into Subtasks', sub: 'Split into smaller chunks' },
  { id: 'pr', icon: FileText, emoji: '📝', title: 'Generate PR Draft', sub: 'Write my PR description' },
]

const FEATURE_PILLS = [
  { emoji: '🔒', label: 'Private & local' },
  { emoji: '⚡', label: 'On-device inference' },
  { emoji: '🎯', label: 'Skill-matched' },
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
  if (n.includes('bug')) return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', color: '#fca5a5' }
  if (n.includes('enhancement') || n.includes('feature')) return { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', color: '#93c5fd' }
  if (n.includes('good first')) return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#6ee7b7' }
  if (n.includes('help wanted')) return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', color: '#fcd34d' }
  return { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)', color: '#a78bfa' }
}

function getDifficultyStyle(difficulty) {
  const d = (difficulty || '').toLowerCase()
  if (d.includes('beginner')) return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.35)' }
  if (d.includes('advanced')) return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.35)' }
  return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.35)' }
}

function getConfidenceColor(pct) {
  if (pct > 70) return '#10b981'
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
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Sub-components (inline helpers as functions returning JSX) ───────────────

function ConfidenceRing({ value, size = 96 }) {
  const [display, setDisplay] = useState(0)
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const color = getConfidenceColor(value)
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
          stroke="rgba(255,255,255,0.06)"
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
        style={{ fontSize: size * 0.22, color }}
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
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="mono font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
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
    } catch (_) {}
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{
        background: 'rgba(124,58,237,0.15)',
        border: '1px solid rgba(124,58,237,0.3)',
        color: 'var(--text-accent)',
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
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🤖 Analyzing...</span>
      <div className="flex gap-1">
        <span className="thinking-dot bounce-dot-1" />
        <span className="thinking-dot bounce-dot-2" />
        <span className="thinking-dot bounce-dot-3" />
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [githubUrl, setGithubUrl] = useState('')
  const [compareUrl, setCompareUrl] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [skills, setSkills] = useState([])
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
    ;(data.subtasks || []).forEach((s) => {
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
        } catch (_) {}
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
    <div className="max-w-[1100px] mx-auto px-6 pb-24">
      {/* ── SECTION 1: Hero ── */}
      <section className="pt-20 pb-8 text-center fade-up">
        <h1
          className="font-display font-semibold leading-tight mb-4"
          style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}
        >
          Analyze any GitHub issue
          <br />
          <span style={{ color: 'var(--accent-bright)' }}>with on-device AI</span>
        </h1>
        <p
          className="max-w-xl mx-auto mb-8 leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontSize: 16 }}
        >
          Paste an issue URL, add your skills — get an instant local AI analysis.
          No cloud. No API key. Powered by QVAC SDK running on your device.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FEATURE_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{pill.emoji}</span>
              {pill.label}
            </span>
          ))}
        </div>

        {/* Main Input Card */}
        <div
          className="text-left rounded-2xl p-8 fade-up-delay-1"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 60px rgba(124,58,237,0.08)',
          }}
        >
          {/* GitHub URL */}
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            GitHub Issue URL
          </label>
          <div className="relative mb-5">
            <Github
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/issues/42"
              className={`input-field pl-11 pr-11 ${urlTouched ? (urlValid ? 'valid' : 'invalid') : ''}`}
            />
            {urlTouched && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                {urlValid ? (
                  <Check size={18} style={{ color: 'var(--success)' }} />
                ) : (
                  <X size={18} style={{ color: 'var(--danger)' }} />
                )}
              </span>
            )}
          </div>

          {/* Skills */}
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Your Skills
          </label>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    className="skill-tag-remove"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="relative mb-6">
            <Sparkles
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              value={skillsInput}
              onChange={handleSkillsChange}
              onKeyDown={handleSkillsKeyDown}
              placeholder="React, Node.js, Solidity, Python..."
              className="input-field pl-11"
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
                {LOADING_STEPS[Math.min(loadingStep, 2)]?.emoji}{' '}
                {LOADING_STEPS[Math.min(loadingStep, 2)]?.btnText || 'Analyzing...'}
              </>
            ) : (
              <>Analyze Issue →</>
            )}
          </button>

          {error && (
            <p className="mt-4 text-sm text-center" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          {/* Compare Toggle */}
          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            className="mt-4 w-full text-sm transition-colors hover:text-accent"
            style={{ color: 'var(--text-secondary)' }}
          >
            {compareMode ? '− Hide comparison' : '+ Compare with another issue'}
          </button>

          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Second Issue URL
                  </label>
                  <div className="relative">
                    <Github
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-secondary)' }}
                    />
                    <input
                      type="url"
                      value={compareUrl}
                      onChange={(e) => setCompareUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo/issues/99"
                      className={`input-field pl-11 pr-11 ${compareTouched ? (compareUrlValid ? 'valid' : 'invalid') : ''}`}
                    />
                    {compareTouched && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2">
                        {compareUrlValid ? (
                          <Check size={18} style={{ color: 'var(--success)' }} />
                        ) : (
                          <X size={18} style={{ color: 'var(--danger)' }} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── SECTION 2: Loading State ── */}
      <AnimatePresence>
        {loading && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-12 fade-up"
          >
            <div className="max-w-lg mx-auto mb-8 space-y-4">
              {LOADING_STEPS.map((step) => {
                const done = loadingStep > step.id
                const active = loadingStep === step.id
                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                        done
                          ? 'step-circle-done'
                          : active
                            ? 'step-circle-violet animate-pulse'
                            : 'step-circle-pending'
                      }`}
                      style={active ? { animation: 'pulseGlow 2s ease-in-out infinite' } : {}}
                    >
                      {done ? <Check size={14} /> : active ? '●' : '○'}
                    </div>
                    <span
                      className={`text-sm ${done ? 'line-through' : ''}`}
                      style={{
                        color: done
                          ? 'var(--text-secondary)'
                          : active
                            ? 'var(--text-primary)'
                            : 'var(--text-secondary)',
                        opacity: active ? 1 : 0.6,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="terminal max-w-2xl mx-auto min-h-[200px]">
              {terminalLines.map((line, i) => (
                <div
                  key={i}
                  className="terminal-line"
                  style={{ animationDelay: '0ms' }}
                >
                  <span className="terminal-prompt">$</span>
                  {line}
                </div>
              ))}
              {terminalLines.length > 0 && terminalLines.length < TERMINAL_LINES.length && (
                <div className="terminal-line dim mt-1">
                  <span className="inline-block w-2 h-4 ml-1 streaming-cursor" style={{ background: 'transparent' }} />
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── SECTION 3: Results ── */}
      <AnimatePresence>
        {result && analysis && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 fade-up">
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Analysis complete</span>
              <span
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full self-start"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#6ee7b7',
                }}
              >
                🔒 Ran locally · 0 cloud calls
              </span>
            </div>

            {/* Card 1 — Issue Info */}
            <div className="card p-6 fade-up">
              <div className="flex items-start gap-3 mb-4">
                <Github size={20} style={{ color: 'var(--text-secondary)', marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <a
                    href={issue?.url || githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-base font-medium hover:underline inline-flex items-center gap-2 break-words"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {issue?.title || parseGitHubUrl(githubUrl)?.issueNumber || 'Issue'}
                    <ExternalLink size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  </a>
                </div>
              </div>

              {(issue?.labels?.length > 0 || issue?.labels) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Array.isArray(issue.labels)
                    ? issue.labels
                    : String(issue.labels || '').split(',').filter(Boolean)
                  ).map((label) => {
                    const name = typeof label === 'string' ? label : label.name
                    const style = getLabelStyle(name)
                    return (
                      <span
                        key={name}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
                      >
                        {name}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mono">{issue?.repo || `${parseGitHubUrl(githubUrl)?.owner}/${parseGitHubUrl(githubUrl)?.repo}`}</span>
                <span>·</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: issue?.state === 'closed' ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.12)',
                    color: issue?.state === 'closed' ? 'var(--text-secondary)' : '#10b981',
                    border: `1px solid ${issue?.state === 'closed' ? 'var(--border)' : 'rgba(16,185,129,0.3)'}`,
                  }}
                >
                  {issue?.state || 'open'}
                </span>
                <span>·</span>
                <span>{issue?.commentsCount ?? issue?.comments ?? 0} comments</span>
              </div>
            </div>

            {/* Card 2 — Verdict */}
            <div
              className={`card p-6 flex flex-col sm:flex-row items-center gap-6 fade-up-delay-1 ${
                analysis.canSolve ? 'verdict-positive glow-green' : 'verdict-negative glow-red'
              }`}
            >
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-2xl font-semibold mb-2">
                  {analysis.canSolve ? '✅ You can solve this' : '⚠️ Skill gap detected'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  {analysis.canSolve
                    ? 'Your skills align well with this issue.'
                    : 'Some skills may need development before tackling this.'}
                </p>
              </div>
              <ConfidenceRing value={analysis.confidence || 0} />
            </div>

            {/* Card 3 — Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 fade-up-delay-2">
              {/* Difficulty */}
              <div className="stat-box">
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Zap size={18} />
                  <span className="text-sm">Difficulty</span>
                </div>
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full font-medium"
                  style={getDifficultyStyle(analysis.difficulty)}
                >
                  {analysis.difficulty || 'Unknown'}
                </span>
              </div>

              {/* Time */}
              <div className="stat-box">
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Clock size={18} />
                  <span className="text-sm">Time estimate</span>
                </div>
                <div className="mono font-bold" style={{ fontSize: 28 }}>
                  {analysis.estimatedHours || 0}h
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>estimated</div>
              </div>

              {/* Confidence */}
              <div className="stat-box">
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <Target size={18} />
                  <span className="text-sm">Confidence</span>
                </div>
                <div className="mono font-bold mb-3" style={{ fontSize: 28, color: getConfidenceColor(analysis.confidence) }}>
                  {analysis.confidence || 0}%
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                  <div
                    className="h-full rounded-full progress-bar-fill"
                    style={{
                      '--bar-target': `${analysis.confidence || 0}%`,
                      background: getConfidenceColor(analysis.confidence),
                    }}
                  />
                </div>
              </div>

              {/* Complexity */}
              <div className="stat-box">
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <GitBranch size={18} />
                  <span className="text-sm">Complexity</span>
                </div>
                <div className="font-display font-medium text-lg">
                  {getComplexity(analysis.difficulty, analysis.estimatedHours)}
                </div>
              </div>
            </div>

            {/* Card 4 — Approach */}
            <div className="card overflow-hidden fade-up-delay-3">
              <button
                type="button"
                onClick={() => setApproachOpen((v) => !v)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
              >
                <h3 className="font-display font-semibold text-lg">Suggested Approach</h3>
                {approachOpen ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
              </button>
              <AnimatePresence>
                {approachOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      {approachSteps.map((step, i) => (
                        <div
                          key={i}
                          className="approach-step"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <div className="step-circle step-circle-violet">{i + 1}</div>
                          <p className="text-sm leading-relaxed pt-1">{step}</p>
                        </div>
                      ))}

                      {analysis.firstStep && (
                        <div className="first-step-box mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-accent)' }}>
                              Start here →
                            </div>
                            <p className="font-display font-semibold text-sm">{analysis.firstStep}</p>
                          </div>
                          <CopyButton text={analysis.firstStep} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card 5 — Skills */}
            <div className="card p-6 fade-up-delay-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-display font-medium mb-4 text-sm" style={{ color: 'var(--success)' }}>
                    You have these
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                          style={{
                            background: 'rgba(16,185,129,0.12)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            color: '#6ee7b7',
                          }}
                        >
                          <Check size={12} />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Add skills to see matches
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-display font-medium mb-4 text-sm" style={{ color: 'var(--warning)' }}>
                    You&apos;ll need to learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                          style={{
                            background: 'rgba(245,158,11,0.12)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            color: '#fcd34d',
                          }}
                        >
                          <BookOpen size={12} />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        No gaps detected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {missingSkills.length > 0 && (
                <p className="mt-5 text-sm pt-4 border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                  💡 Don&apos;t worry — you can pick these up while solving the issue
                </p>
              )}
            </div>

            {/* Card 6 — Warning */}
            {analysis.warningFlags && analysis.warningFlags.trim() && (
              <div
                className="card p-5 flex items-start gap-3 fade-up-delay-5"
                style={{
                  borderLeft: '3px solid var(--warning)',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)',
                }}
              >
                <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm leading-relaxed">{analysis.warningFlags}</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── SECTION 7: Compare Table ── */}
      {result && result2 && !loading && (
        <section className="mt-10 fade-up">
          <h3 className="font-display font-semibold text-lg mb-4">Issue Comparison</h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left p-4 font-normal" style={{ color: 'var(--text-secondary)' }}>Feature</th>
                  <th
                    className={`p-4 text-left font-display ${recommendedIssue === 1 ? 'recommended-col' : ''}`}
                    style={{ color: 'var(--accent-bright)' }}
                  >
                    Issue 1
                    {recommendedIssue === 1 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                        <Star size={10} fill="#fcd34d" /> Recommended
                      </span>
                    )}
                  </th>
                  <th
                    className={`p-4 text-left font-display ${recommendedIssue === 2 ? 'recommended-col' : ''}`}
                    style={{ color: 'var(--info)' }}
                  >
                    Issue 2
                    {recommendedIssue === 2 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                        <Star size={10} fill="#fcd34d" /> Recommended
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Title', k1: result.issue?.title, k2: result2.issue?.title },
                  { label: 'Can Solve', k1: result.analysis?.canSolve ? '✅ Yes' : '⚠️ No', k2: result2.analysis?.canSolve ? '✅ Yes' : '⚠️ No' },
                  { label: 'Confidence', k1: `${result.analysis?.confidence}%`, k2: `${result2.analysis?.confidence}%` },
                  { label: 'Difficulty', k1: result.analysis?.difficulty, k2: result2.analysis?.difficulty },
                  { label: 'Est. Hours', k1: `${result.analysis?.estimatedHours}h`, k2: `${result2.analysis?.estimatedHours}h` },
                  { label: 'Missing Skills', k1: (result.analysis?.missingSkills || []).length, k2: (result2.analysis?.missingSkills || []).length },
                ].map((row) => (
                  <tr key={row.label} className="compare-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-4" style={{ color: 'var(--text-secondary)' }}>{row.label}</td>
                    <td className={`p-4 mono text-xs ${recommendedIssue === 1 ? 'recommended-col' : ''}`}>{row.k1}</td>
                    <td className={`p-4 mono text-xs ${recommendedIssue === 2 ? 'recommended-col' : ''}`}>{row.k2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── SECTION 4: Quick Actions ── */}
      {result && !loading && (
        <section className="mt-12 fade-up-delay-2">
          <h3 className="font-display font-semibold text-xl mb-5">Ask the AI anything →</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleQuickAction(action)}
                disabled={chatStreaming}
                className="action-btn group"
              >
                <span className="text-2xl mb-3 block">{action.emoji}</span>
                <div className="font-display font-semibold text-sm mb-1">{action.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{action.sub}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 5: Chat ── */}
      {result && !loading && (
        <section className="mt-12 fade-up-delay-3" ref={chatInputRef}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} style={{ color: 'var(--accent-bright)' }} />
              <h3 className="font-display font-semibold">Chat with AI about this issue</h3>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full self-start"
              style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.25)',
                color: 'var(--text-accent)',
              }}
            >
              On-device · Powered by QVAC
            </span>
          </div>

          <div
            className="rounded-2xl border mb-4 overflow-y-auto flex flex-col gap-4 p-5"
            style={{
              minHeight: 300,
              maxHeight: 480,
              background: '#0a0a14',
              borderColor: 'var(--border)',
            }}
          >
            {chatHistory.length === 0 && !chatThinking && !streamingMessage && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                Ask anything about this issue — files to edit, test strategy, or how to get started.
              </p>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                    >
                      <span className="text-[8px] font-bold text-white">Q</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>QVAC AI</span>
                  </div>
                )}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-xs mt-1 px-1" style={{ color: 'var(--text-secondary)' }}>
                  {formatTime(msg.time)}
                </span>
              </div>
            ))}

            {chatThinking && <ThinkingDots />}

            {streamingMessage && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                  >
                    <span className="text-[8px] font-bold text-white">Q</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>QVAC AI</span>
                </div>
                <div className="chat-bubble-ai streaming-cursor">
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
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
              style={{ maxHeight: 120 }}
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
      )}

      {/* ── SECTION 6: Confidence Breakdown ── */}
      {result && !loading && (
        <section className="mt-12 fade-up-delay-4">
          <button
            type="button"
            onClick={() => setBreakdownOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
            style={{ color: 'var(--text-secondary)' }}
          >
            {breakdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Show confidence breakdown
          </button>

          <AnimatePresence>
            {breakdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="card p-6 mt-4">
                  {breakdownLoading ? (
                    <div className="space-y-4">
                      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                        🤖 Running on-device AI analysis — this takes ~15 seconds...
                      </p>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton shimmer h-8 rounded-lg" />
                      ))}
                    </div>
                  ) : breakdownError ? (
                    <div
                      className="flex items-start gap-3 p-4 rounded-xl"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                      }}
                    >
                      <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--danger)' }}>Unable to generate breakdown</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{breakdownError}</p>
                        <button
                          type="button"
                          onClick={() => { setBreakdown(null); setBreakdownError(null); loadBreakdown(result?.workspace) }}
                          className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)' }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : breakdown ? (
                    <>
                      <ProgressBar label="Skill match" value={breakdown.breakdown?.skillMatch ?? 0} delay={0} />
                      <ProgressBar label="Issue clarity" value={breakdown.breakdown?.issueClarity ?? 0} delay={100} />
                      <ProgressBar label="Codebase complexity" value={breakdown.breakdown?.codebaseComplexity ?? 0} delay={200} />
                      <ProgressBar label="Prior art needed" value={breakdown.breakdown?.priorArtNeeded ?? 0} delay={300} />

                      {(breakdown.subtasks?.length > 0) && (
                        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                          <h4 className="font-display font-medium mb-4">Subtasks</h4>
                          <div className="space-y-3">
                            {breakdown.subtasks.map((task) => {
                              const key = task.id || task.text
                              return (
                                <label
                                  key={key}
                                  className="flex items-center gap-3 cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!checkedSubtasks[key]}
                                    onChange={() =>
                                      setCheckedSubtasks((prev) => ({ ...prev, [key]: !prev[key] }))
                                    }
                                    className="w-4 h-4 rounded accent-violet-600"
                                    style={{ accentColor: 'var(--accent)' }}
                                  />
                                  <span
                                    className={`text-sm flex-1 ${checkedSubtasks[key] ? 'line-through opacity-60' : ''}`}
                                  >
                                    {task.text}
                                  </span>
                                  <span
                                    className="text-xs mono px-2 py-0.5 rounded-full"
                                    style={{
                                      background: 'var(--bg-hover)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    {task.hours}h
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {breakdown.prDraft && (
                        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                          <button
                            type="button"
                            onClick={() => setPrDraftOpen((v) => !v)}
                            className="flex items-center gap-2 font-display font-medium mb-4"
                          >
                            Generated PR Draft
                            {prDraftOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <AnimatePresence>
                            {prDraftOpen && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4 text-sm"
                              >
                                {[
                                  { label: 'Title', value: breakdown.prDraft.title },
                                  { label: 'Problem', value: breakdown.prDraft.problem },
                                  { label: 'Solution', value: breakdown.prDraft.solution },
                                  { label: 'Testing', value: breakdown.prDraft.testing },
                                ].map((section) => (
                                  <div key={section.label}>
                                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-accent)' }}>
                                      {section.label}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)' }}>{section.value}</p>
                                  </div>
                                ))}
                                <CopyButton
                                  text={[
                                    `## ${breakdown.prDraft.title}`,
                                    `\n### Problem\n${breakdown.prDraft.problem}`,
                                    `\n### Solution\n${breakdown.prDraft.solution}`,
                                    `\n### Testing\n${breakdown.prDraft.testing}`,
                                  ].join('')}
                                  className="mt-2 !px-5 !py-2.5 !text-sm"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  )
}
