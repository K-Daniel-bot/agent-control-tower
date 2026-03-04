'use client'

import { useCallback } from 'react'
import type { AgentState, AgentStatus } from '@/types/topology'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { getDisplayLabel } from '@/data/koreanNamePool'

interface AgentControlPopoverProps {
  agent: AgentState
  position: { x: number; y: number }
  onClose: () => void
}

const STATUS_TRANSITIONS: { from: AgentStatus; to: AgentStatus; label: string; color: string }[] = [
  { from: 'spawning', to: 'active', label: '활성화', color: '#00ff88' },
  { from: 'active', to: 'working', label: '작업 시작', color: '#00ff88' },
  { from: 'working', to: 'complete', label: '완료', color: '#6b7280' },
  { from: 'idle', to: 'active', label: '활성화', color: '#00ff88' },
  { from: 'error', to: 'active', label: '복구', color: '#00ff88' },
]

const STATUS_LABELS: Record<AgentStatus, string> = {
  spawning: '생성 중',
  active: '활성',
  working: '작업 중',
  idle: '대기',
  error: '오류',
  complete: '완료',
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  spawning: '#3b82f6',
  active: '#00ff88',
  working: '#00ff88',
  idle: '#6b7280',
  error: '#ef4444',
  complete: '#4b5563',
}

export function AgentControlPopover({ agent, position, onClose }: AgentControlPopoverProps) {
  const { dispatch } = useOrchestra()

  const handleStatusChange = useCallback(
    (newStatus: AgentStatus) => {
      if (newStatus === 'complete') {
        dispatch({ type: 'COMPLETE_AGENT', payload: { id: agent.identity.id } })
      } else {
        dispatch({
          type: 'UPDATE_AGENT_STATUS',
          payload: {
            id: agent.identity.id,
            status: newStatus,
            tokenRate: newStatus === 'working' ? Math.floor(Math.random() * 100) + 30 : agent.tokenRate,
            latencyMs: newStatus === 'working' ? Math.floor(Math.random() * 300) + 50 : agent.latencyMs,
          },
        })
      }
      onClose()
    },
    [agent, dispatch, onClose]
  )

  const handleSetError = useCallback(() => {
    dispatch({
      type: 'UPDATE_AGENT_STATUS',
      payload: { id: agent.identity.id, status: 'error', tokenRate: 0, latencyMs: 0 },
    })
    onClose()
  }, [agent, dispatch, onClose])

  const handleRemove = useCallback(() => {
    dispatch({ type: 'REMOVE_AGENT', payload: { id: agent.identity.id } })
    onClose()
  }, [agent, dispatch, onClose])

  const availableTransitions = STATUS_TRANSITIONS.filter((t) => t.from === agent.status)
  const statusColor = STATUS_COLORS[agent.status] ?? '#6b7280'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
        }}
      />

      {/* Popover */}
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 50,
          width: 200,
          background: 'rgba(26,31,46,0.97)',
          border: '1px solid #2a3042',
          borderRadius: 8,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {/* Agent info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 4px ${statusColor}`,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e7eb' }}>
            {getDisplayLabel(agent.identity)}
          </span>
        </div>
        <div style={{ fontSize: 8, color: '#6b7280', display: 'flex', gap: 8 }}>
          <span>{agent.identity.englishRole}</span>
          <span>·</span>
          <span>{STATUS_LABELS[agent.status]}</span>
          {agent.tokenRate > 0 && (
            <>
              <span>·</span>
              <span style={{ fontFamily: 'monospace' }}>{agent.tokenRate}t/s</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#2a3042' }} />

        {/* Status transitions */}
        {availableTransitions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {availableTransitions.map((t) => (
              <button
                key={t.to}
                onClick={() => handleStatusChange(t.to)}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(0,255,136,0.08)',
                  border: `1px solid rgba(0,255,136,0.2)`,
                  borderRadius: 4,
                  color: t.color,
                  fontSize: 9,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                → {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Error / Remove */}
        <div style={{ display: 'flex', gap: 4 }}>
          {agent.status !== 'error' && agent.status !== 'complete' && (
            <button
              onClick={handleSetError}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 4,
                color: '#ef4444',
                fontSize: 9,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              오류 발생
            </button>
          )}
          {agent.identity.id !== 'orchestrator-ceo' && (
            <button
              onClick={handleRemove}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 4,
                color: '#ef4444',
                fontSize: 9,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default AgentControlPopover
