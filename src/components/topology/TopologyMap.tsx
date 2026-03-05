'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AgentOrchestraProvider, useOrchestra } from '@/context/AgentOrchestraContext'
import { useAgentSimulation } from '@/hooks/useAgentSimulation'
import { useAgentSSE } from '@/hooks/useAgentSSE'
import { resetNamePool } from '@/data/koreanNamePool'
import AgentCreatePanel from './AgentCreatePanel'
import NocDashboard from '@/components/noc/NocDashboard'


type ActiveTab = 'manual' | 'auto' | 'test'

function TopologyController() {
  const { state, dispatch } = useOrchestra()
  const { startSimulation, resetSimulation } = useAgentSimulation(dispatch)

  // SSE 실시간 연동 (항상 활성)
  useAgentSSE(dispatch)
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
    background: active ? `${color}25` : '#000000',
    border: `1px solid ${active ? color + '60' : '#333333'}`,
    borderRadius: 4,
    fontSize: 9,
    color: active ? color : '#505661',
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
          borderBottom: '1px solid #333333',
          background: '#000000',
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
            background: '#000000',
            borderRadius: 4,
            border: '1px solid #333333',
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
                  : '#333333',
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
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <TopologyController />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <NocDashboard />
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
