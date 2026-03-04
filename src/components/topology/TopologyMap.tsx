'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrchestraState } from '@/types/topology'
import { AgentOrchestraProvider, useOrchestra } from '@/context/AgentOrchestraContext'
import { useAgentSimulation } from '@/hooks/useAgentSimulation'
import { resetNamePool } from '@/data/koreanNamePool'
import ExecutionFlowSection from './ExecutionFlowSection'
import DependencyGraphSection from './DependencyGraphSection'
import AgentCreatePanel from './AgentCreatePanel'
import { RightLegendPanel } from './RightLegendPanel'
import LeftPanel from '@/components/left/LeftPanel'

function DashboardHeader({ state }: { state: OrchestraState }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false })
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const runningCount = state.agents.filter(
    (a) => a.status === 'active' || a.status === 'working',
  ).length

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(10,14,26,0.98)',
        borderBottom: '1px solid #1e2535',
        flexShrink: 0,
      }}
    >
      {/* Left: system name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: state.phase === 'running' ? '#00ff88' : '#2a3042',
            boxShadow: state.phase === 'running' ? '0 0 6px #00ff88' : 'none',
            animation: state.phase === 'running' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#e2e8f0',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}
        >
          Agent Control Tower
        </span>
        <span
          style={{
            fontSize: 8,
            color: '#4b5563',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Observability &amp; Control Plane
        </span>
      </div>

      {/* Center: phase indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 10px',
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid #1e2535',
            borderRadius: 4,
          }}
        >
          <span style={{ fontSize: 7, color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            PHASE
          </span>
          <span
            style={{
              fontSize: 8,
              color: state.phase === 'running' ? '#00ff88' : state.phase === 'complete' ? '#6b7280' : '#374151',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {state.phase.toUpperCase()}
          </span>
        </div>

        {runningCount > 0 && (
          <div
            style={{
              fontSize: 8,
              color: '#00ff88',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            {runningCount} ACTIVE
          </div>
        )}
      </div>

      {/* Right: datetime */}
      <div
        style={{
          fontSize: 9,
          color: '#6b7280',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {dateStr} {timeStr}
      </div>
    </div>
  )
}


type ActiveTab = 'manual' | 'auto' | 'test'

function TopologyController() {
  const { state, dispatch } = useOrchestra()
  const { startSimulation, resetSimulation } = useAgentSimulation(dispatch)
  const [tab, setTab] = useState<ActiveTab>('manual')
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const hasAutoStartedRef = useRef(false)

  const prevTabRef = useRef(tab)
  useEffect(() => {
    if (prevTabRef.current !== 'manual' && tab === 'manual') {
      resetSimulation()
    }
    if (tab !== 'manual') {
      setShowCreatePanel(false)
    }
    prevTabRef.current = tab
  }, [tab, resetSimulation])

  const handleReset = useCallback(() => {
    resetSimulation()
    resetNamePool()
    setShowCreatePanel(false)
  }, [resetSimulation])

  // Auto mode: start simulation automatically
  useEffect(() => {
    if (tab === 'auto' && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true
      const timer = setTimeout(() => startSimulation(), 500)
      return () => clearTimeout(timer)
    }
    if (tab !== 'auto') {
      hasAutoStartedRef.current = false
    }
  }, [tab, startSimulation])

  // Test mode: immediately start simulation on tab switch
  useEffect(() => {
    if (tab === 'test') {
      startSimulation()
    }
  }, [tab, startSimulation])

  const btnBase = {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 9,
    cursor: 'pointer' as const,
    letterSpacing: '0.03em',
    transition: 'all 0.15s',
  }

  const tabStyle = (active: boolean, color: string) => ({
    padding: '3px 10px',
    background: active ? `${color}25` : 'rgba(10,14,26,0.7)',
    border: `1px solid ${active ? color + '60' : '#2a3042'}`,
    borderRadius: 4,
    fontSize: 9,
    color: active ? color : '#4b5563',
    cursor: 'pointer' as const,
    fontWeight: active ? 700 : 500,
    letterSpacing: '0.06em',
    transition: 'all 0.15s',
  })

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '5px 12px',
          borderBottom: '1px solid #2a3042',
          background: 'rgba(10,14,26,0.95)',
          flexShrink: 0,
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
              boxShadow: state.phase === 'running' ? '0 0 4px #00ff88' : 'none',
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

        {/* Tab buttons */}
        <button onClick={() => setTab('manual')} style={tabStyle(tab === 'manual', '#3b82f6')}>
          수동
        </button>
        <button onClick={() => setTab('auto')} style={tabStyle(tab === 'auto', '#8b5cf6')}>
          자동
        </button>
        <button onClick={() => setTab('test')} style={tabStyle(tab === 'test', '#f59e0b')}>
          TEST
        </button>

        {/* Auto mode controls */}
        {tab === 'auto' && (
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

        {/* Test mode controls */}
        {tab === 'test' && (
          <>
            <button
              onClick={() => startSimulation()}
              style={{
                ...btnBase,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#f59e0b',
              }}
            >
              ↺ 재실행
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
        {tab === 'manual' && (
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

      {tab === 'manual' && showCreatePanel && (
        <AgentCreatePanel onClose={() => setShowCreatePanel(false)} />
      )}
    </>
  )
}

function TopologyContent() {
  const { state } = useOrchestra()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0e1a',
        overflow: 'hidden',
      }}
    >
      <DashboardHeader state={state} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left agent status + conversation log */}
        <LeftPanel />

        {/* Main graph area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <TopologyController />
          <ExecutionFlowSection />
          <DependencyGraphSection />
        </div>

        {/* Right legend panel */}
        <RightLegendPanel state={state} />
      </div>
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
