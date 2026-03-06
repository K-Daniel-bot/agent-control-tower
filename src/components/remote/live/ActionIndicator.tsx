'use client'

import { useState, useEffect } from 'react'
import { useRemote } from '../context/RemoteContext'

const ACTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  moving: { icon: '↗', label: '화면 탐색 중...', color: '#f59e0b' },
  clicking: { icon: '◉', label: '클릭 대기...', color: '#ef4444' },
  typing: { icon: '⌨', label: '텍스트 입력 중...', color: '#3b82f6' },
  dragging: { icon: '✥', label: '드래그 중...', color: '#a855f7' },
  scrolling: { icon: '↕', label: '스크롤 중...', color: '#06b6d4' },
}

export default function ActionIndicator() {
  const { state } = useRemote()
  const { aiCursor } = state
  const [progress, setProgress] = useState(0)

  const config = ACTION_CONFIG[aiCursor.action]
  const isActive = aiCursor.action !== 'idle' && config != null

  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      return
    }

    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2
        return next >= 100 ? 0 : next
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isActive, aiCursor.action])

  if (!isActive || !config) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        animation: 'indicator-fade-in 0.2s ease-out',
      }}
    >
      {/* Pill shape */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${config.color}40`,
          borderRadius: 20,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
          boxShadow: `0 0 12px ${config.color}20`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Progress bar background */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background: `${config.color}15`,
            transition: 'width 0.05s linear',
          }}
        />

        {/* Icon */}
        <span
          style={{
            fontSize: 14,
            color: config.color,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {config.icon}
        </span>

        {/* Label */}
        <span
          style={{
            fontSize: 12,
            color: config.color,
            fontWeight: 500,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {state.currentAction ?? config.label}
        </span>

        {/* Target label */}
        {aiCursor.targetLabel && (
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.5)',
              position: 'relative',
              zIndex: 1,
              marginLeft: 4,
            }}
          >
            [{aiCursor.targetLabel}]
          </span>
        )}
      </div>

      {/* Keyframe */}
      <style>{`
        @keyframes indicator-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
