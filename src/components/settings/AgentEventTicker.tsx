'use client'

import { useEffect, useState, useRef } from 'react'
import type { AgentEvent } from '@/data/agentSettingsData'

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#ef4444',
}

const SEVERITY_BG: Record<string, string> = {
  info: 'transparent',
  warning: 'transparent',
  error: 'transparent',
  critical: 'rgba(239,68,68,0.15)',
}

export default function AgentEventTicker() {
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/agents/events')
      .then((r) => r.json())
      .then((data) => setEvents(data.data ?? []))
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (events.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [events.length])

  const current = events[currentIndex]
  if (!current) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 9, color: '#4b5563' }}>이벤트 대기 중...</span>
      </div>
    )
  }

  const sevColor = SEVERITY_COLORS[current.severity] ?? '#6b7280'
  const sevBg = SEVERITY_BG[current.severity] ?? 'transparent'

  return (
    <div
      ref={tickerRef}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 10,
        background: sevBg,
        transition: 'background 0.3s',
      }}
    >
      {/* Severity badge */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: sevColor,
          boxShadow: current.severity === 'critical' ? `0 0 6px ${sevColor}` : 'none',
          flexShrink: 0,
          animation: current.severity === 'critical' ? 'pulse-dot 1s ease-in-out infinite' : 'none',
        }}
      />

      {/* Timestamp */}
      <span style={{ fontSize: 9, color: '#6b7280', fontFamily: 'monospace', flexShrink: 0 }}>
        {current.timestamp}
      </span>

      {/* Agent */}
      <span style={{ fontSize: 9, color: sevColor, fontWeight: 700, flexShrink: 0 }}>
        [{current.agentName}]
      </span>

      {/* Message */}
      <span
        style={{
          fontSize: 9,
          color: '#e5e7eb',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {current.message}
      </span>

      {/* Counter */}
      <span style={{ fontSize: 8, color: '#4b5563', flexShrink: 0, fontFamily: 'monospace' }}>
        {currentIndex + 1}/{events.length}
      </span>
    </div>
  )
}
