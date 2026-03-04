'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrchestraMode } from '@/types/topology'
import { AgentOrchestraProvider, useOrchestra } from '@/context/AgentOrchestraContext'
import { useAgentSimulation } from '@/hooks/useAgentSimulation'
import { resetNamePool } from '@/data/koreanNamePool'
import ExecutionFlowSection from './ExecutionFlowSection'
import DependencyGraphSection from './DependencyGraphSection'
import DependencyDetailSection from './DependencyDetailSection'
import AgentCreatePanel from './AgentCreatePanel'

function ModeToggle({
  mode,
  onToggle,
}: {
  mode: OrchestraMode
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '3px 10px',
        background:
          mode === 'auto'
            ? 'rgba(139,92,246,0.15)'
            : 'rgba(59,130,246,0.15)',
        border: `1px solid ${
          mode === 'auto'
            ? 'rgba(139,92,246,0.4)'
            : 'rgba(59,130,246,0.4)'
        }`,
        borderRadius: 4,
        fontSize: 9,
        color: mode === 'auto' ? '#8b5cf6' : '#3b82f6',
        cursor: 'pointer',
        letterSpacing: '0.03em',
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
    >
      {mode === 'auto' ? '⚙ 자동' : '✋ 수동'}
    </button>
  )
}

function TopologyController() {
  const { state, dispatch } = useOrchestra()
  const { startSimulation, resetSimulation } = useAgentSimulation(dispatch)
  const [mode, setMode] = useState<OrchestraMode>('manual')
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const hasAutoStartedRef = useRef(false)

  // Reset when switching to manual mode
  const prevModeRef = useRef(mode)
  useEffect(() => {
    if (prevModeRef.current === 'auto' && mode === 'manual') {
      resetSimulation()
    }
    if (mode === 'auto') {
      setShowCreatePanel(false)
    }
    prevModeRef.current = mode
  }, [mode, resetSimulation])

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'auto' ? 'manual' : 'auto'))
  }, [])

  const handleReset = useCallback(() => {
    resetSimulation()
    resetNamePool()
    setShowCreatePanel(false)
  }, [resetSimulation])

  // Auto mode: start simulation automatically
  useEffect(() => {
    if (mode === 'auto' && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true
      const timer = setTimeout(() => startSimulation(), 500)
      return () => clearTimeout(timer)
    }
    if (mode !== 'auto') {
      hasAutoStartedRef.current = false
    }
  }, [mode, startSimulation])

  const btnBase = {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 9,
    cursor: 'pointer' as const,
    letterSpacing: '0.03em',
    transition: 'all 0.15s',
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          zIndex: 20,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {/* Phase indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            background: 'rgba(10,14,26,0.9)',
            borderRadius: 4,
            border: '1px solid #2a3042',
            fontSize: 9,
            color: '#6b7280',
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background:
                state.phase === 'running'
                  ? '#00ff88'
                  : state.phase === 'complete'
                  ? '#6b7280'
                  : '#2a3042',
              boxShadow:
                state.phase === 'running' ? '0 0 4px #00ff88' : 'none',
              animation:
                state.phase === 'running'
                  ? 'pulse-dot 1.5s ease-in-out infinite'
                  : 'none',
            }}
          />
          <span>
            {state.phase === 'idle' && '대기'}
            {state.phase === 'running' &&
              `실행 중 · ${state.agents.filter((a) => a.status !== 'complete').length}명`}
            {state.phase === 'complete' && '완료'}
          </span>
        </div>

        {/* Mode toggle */}
        <ModeToggle mode={mode} onToggle={handleToggleMode} />

        {/* Auto mode controls */}
        {mode === 'auto' && (
          <>
            <button
              onClick={startSimulation}
              style={{
                ...btnBase,
                background: 'rgba(0,255,136,0.1)',
                border: '1px solid rgba(0,255,136,0.3)',
                color: '#00ff88',
              }}
            >
              ▶ 시작
            </button>
            <button
              onClick={handleReset}
              style={{
                ...btnBase,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
              }}
            >
              ■ 초기화
            </button>
          </>
        )}

        {/* Manual mode controls */}
        {mode === 'manual' && (
          <>
            <button
              onClick={() => setShowCreatePanel((v) => !v)}
              style={{
                ...btnBase,
                background: showCreatePanel
                  ? 'rgba(0,255,136,0.2)'
                  : 'rgba(0,255,136,0.1)',
                border: '1px solid rgba(0,255,136,0.3)',
                color: '#00ff88',
                fontWeight: 600,
              }}
            >
              + 에이전트 추가
            </button>
            <button
              onClick={handleReset}
              style={{
                ...btnBase,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
              }}
            >
              ■ 초기화
            </button>
          </>
        )}
      </div>

      {/* Create panel */}
      {mode === 'manual' && showCreatePanel && (
        <AgentCreatePanel onClose={() => setShowCreatePanel(false)} />
      )}
    </>
  )
}

function TopologyContent() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0e1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <TopologyController />
      <ExecutionFlowSection />
      <DependencyGraphSection />
      <DependencyDetailSection />
    </div>
  )
}

export default function TopologyMap() {
  return (
    <AgentOrchestraProvider>
      <TopologyContent />
    </AgentOrchestraProvider>
  )
}
