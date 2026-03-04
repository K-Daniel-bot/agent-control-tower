'use client'

import { useState, useCallback } from 'react'
import type { TopologyAgentType } from '@/types/topology'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { createAgentIdentity, createOrchestratorIdentity } from '@/data/koreanNamePool'

const ROLE_OPTIONS: { value: TopologyAgentType; label: string; icon: string }[] = [
  { value: 'planner', label: 'Planner', icon: '📋' },
  { value: 'executor', label: 'Executor', icon: '⚡' },
  { value: 'tool', label: 'Tool', icon: '🔧' },
  { value: 'verifier', label: 'Verifier', icon: '✅' },
]

interface AgentCreatePanelProps {
  onClose: () => void
}

export function AgentCreatePanel({ onClose }: AgentCreatePanelProps) {
  const { state, dispatch } = useOrchestra()
  const [agentType, setAgentType] = useState<TopologyAgentType>('executor')
  const [englishRole, setEnglishRole] = useState('')
  const [parentId, setParentId] = useState('orchestrator-ceo')

  const usedNames = state.agents.map((a) => a.identity.koreanName)
  const hasCeo = state.agents.some((a) => a.identity.id === 'orchestrator-ceo')

  const handleCreate = useCallback(() => {
    // Ensure CEO exists first
    if (!hasCeo) {
      const ceo = createOrchestratorIdentity()
      dispatch({ type: 'SPAWN_AGENT', payload: ceo })
      dispatch({
        type: 'UPDATE_AGENT_STATUS',
        payload: { id: ceo.id, status: 'active', tokenRate: 120, latencyMs: 45 },
      })
      dispatch({ type: 'SET_PHASE', payload: 'running' })
    }

    const roleLabel = englishRole.trim() || ROLE_OPTIONS.find((r) => r.value === agentType)?.label || agentType
    const identity = createAgentIdentity(agentType, roleLabel, usedNames)

    dispatch({ type: 'SPAWN_AGENT', payload: identity })

    // Auto-connect to parent
    const effectiveParentId = parentId || 'orchestrator-ceo'
    dispatch({
      type: 'ADD_EXECUTION_EDGE',
      payload: {
        id: `e-${effectiveParentId}-${identity.id}`,
        sourceId: effectiveParentId,
        targetId: identity.id,
        status: 'normal',
        dataRate: Math.floor(Math.random() * 60) + 20,
      },
    })
    dispatch({
      type: 'ADD_DEPENDENCY_LINK',
      payload: {
        id: `d-${effectiveParentId}-${identity.id}`,
        sourceId: effectiveParentId,
        targetId: identity.id,
        type: 'communicates',
      },
    })

    // Activate after short delay
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_AGENT_STATUS',
        payload: {
          id: identity.id,
          status: 'active',
          tokenRate: Math.floor(Math.random() * 80) + 20,
          latencyMs: Math.floor(Math.random() * 200) + 50,
        },
      })
    }, 600)

    setEnglishRole('')
    onClose()
  }, [agentType, englishRole, parentId, hasCeo, usedNames, dispatch, onClose])

  const activeAgents = state.agents.filter((a) => a.status !== 'complete')

  return (
    <div
      style={{
        position: 'absolute',
        top: 36,
        right: 12,
        zIndex: 30,
        width: 260,
        background: 'rgba(26,31,46,0.95)',
        border: '1px solid #2a3042',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.03em' }}>
          에이전트 생성
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: 2,
          }}
        >
          ✕
        </button>
      </div>

      {/* Agent type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          역할 유형
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAgentType(opt.value)}
              style={{
                padding: '5px 8px',
                background: agentType === opt.value ? 'rgba(0,255,136,0.1)' : 'rgba(42,48,66,0.5)',
                border: `1px solid ${agentType === opt.value ? 'rgba(0,255,136,0.4)' : '#2a3042'}`,
                borderRadius: 4,
                color: agentType === opt.value ? '#00ff88' : '#9ca3af',
                fontSize: 9,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s',
              }}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* English role */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          역할명 (선택)
        </label>
        <input
          type="text"
          value={englishRole}
          onChange={(e) => setEnglishRole(e.target.value)}
          placeholder="예: Frontend Dev, DB Optimizer"
          style={{
            padding: '5px 8px',
            background: 'rgba(10,14,26,0.8)',
            border: '1px solid #2a3042',
            borderRadius: 4,
            color: '#e5e7eb',
            fontSize: 10,
            outline: 'none',
          }}
        />
      </div>

      {/* Parent agent */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          상위 에이전트
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          style={{
            padding: '5px 8px',
            background: 'rgba(10,14,26,0.8)',
            border: '1px solid #2a3042',
            borderRadius: 4,
            color: '#e5e7eb',
            fontSize: 10,
            outline: 'none',
          }}
        >
          <option value="orchestrator-ceo">강다니엘/CEO (기본)</option>
          {activeAgents
            .filter((a) => a.identity.id !== 'orchestrator-ceo')
            .map((a) => (
              <option key={a.identity.id} value={a.identity.id}>
                {a.identity.koreanName}/{a.identity.title}
              </option>
            ))}
        </select>
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        style={{
          padding: '7px 12px',
          background: 'rgba(0,255,136,0.15)',
          border: '1px solid rgba(0,255,136,0.4)',
          borderRadius: 6,
          color: '#00ff88',
          fontSize: 10,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.03em',
          transition: 'all 0.15s',
        }}
      >
        + 에이전트 생성
      </button>

      {/* Info */}
      <span style={{ fontSize: 8, color: '#4b5563', textAlign: 'center' }}>
        한국 이름과 직급은 자동 할당됩니다
      </span>
    </div>
  )
}

export default AgentCreatePanel
