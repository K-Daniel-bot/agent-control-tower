'use client'

import { useState, useCallback, useEffect } from 'react'
import type { AgentIdentity, TopologyAgentType } from '@/types/topology'
import type { AgentRank, AgentRoleType, AgentSkill, SavedAgent } from '@/types/agent'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { createOrchestratorIdentity, assignName } from '@/data/koreanNamePool'
import { useAgentStorage } from '@/hooks/useAgentStorage'
import { inferFromDescription, ROLE_META, SKILL_META, RANK_OPTIONS } from '@/utils/agentInference'

const ROLE_TYPE_ORDER: AgentRoleType[] = [
  'orchestrator', 'planner', 'executor',
  'coder', 'tool', 'verifier',
  'researcher', 'analyst', 'reviewer',
  'tester', 'documenter', 'security',
]

const ALL_SKILLS: AgentSkill[] = [
  'coding', 'web_search', 'file_mgmt', 'git',
  'database', 'api', 'messaging', 'code_review',
  'testing', 'documentation', 'security_analysis', 'data_analysis',
  'browser', 'shell',
]

const TOPOLOGY_TYPE_MAP: Partial<Record<AgentRoleType, TopologyAgentType>> = {
  orchestrator: 'orchestrator',
  planner: 'planner',
  executor: 'executor',
  coder: 'executor',
  tool: 'tool',
  verifier: 'verifier',
  researcher: 'tool',
  analyst: 'tool',
  reviewer: 'verifier',
  tester: 'verifier',
  documenter: 'tool',
  security: 'verifier',
}

const ICON_OPTIONS: readonly string[] = [
  '🤖', '🧠', '🔍', '🛡', '⚡', '📋',
  '🔧', '👑', '📊', '🌿', '🧪', '🔬',
  '💡', '🚀', '🎯', '🔐', '📡', '🌐',
  '🖥', '💻', '🗄', '🔄', '📈', '🤝',
  '⚙️', '🔒', '🔑', '📝', '🎨', '🧬',
  '🦾', '🧩', '🔭', '📦', '🏗', '🎪',
]

interface AgentCreatePanelProps {
  onClose: () => void
}

export function AgentCreatePanel({ onClose }: AgentCreatePanelProps) {
  const { state, dispatch } = useOrchestra()
  const { addAgent } = useAgentStorage()

  const [name, setName] = useState('')
  const [rank, setRank] = useState<AgentRank>('Mid-Level')
  const [roleType, setRoleType] = useState<AgentRoleType>('executor')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState<AgentSkill[]>(['coding', 'api'])
  const [parentId, setParentId] = useState('orchestrator-ceo')
  const [selectedIcon, setSelectedIcon] = useState<string>('🤖')
  const [inferred, setInferred] = useState<{ summary: string } | null>(null)

  // Real-time inference as user types description
  useEffect(() => {
    if (!description.trim()) { setInferred(null); return }
    const result = inferFromDescription(description)
    setInferred({ summary: result.summary })
    setRoleType(result.roleType)
    setSkills(result.skills)
  }, [description])

  // Auto-update icon when role type changes (if user hasn't manually picked one)
  const [iconManuallySet, setIconManuallySet] = useState(false)
  useEffect(() => {
    if (!iconManuallySet) {
      setSelectedIcon(ROLE_META[roleType].icon)
    }
  }, [roleType, iconManuallySet])

  const toggleSkill = useCallback((skill: AgentSkill) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }, [])

  const hasCeo = state.agents.some((a) => a.identity.id === 'orchestrator-ceo')
  const activeAgents = state.agents.filter((a) => a.status !== 'complete')
  const usedNames = state.agents.map((a) => a.identity.koreanName)

  const handleCreate = useCallback(() => {
    if (!hasCeo) {
      const ceo = createOrchestratorIdentity()
      dispatch({ type: 'SPAWN_AGENT', payload: ceo })
      dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'active', tokenRate: 120, latencyMs: 45 } })
      dispatch({ type: 'SET_PHASE', payload: 'running' })
    }

    const roleMeta = ROLE_META[roleType]
    const topologyType: TopologyAgentType = TOPOLOGY_TYPE_MAP[roleType] ?? 'executor'
    const customName = name.trim()

    // If user provided a name, use it directly as the display name
    let identity: AgentIdentity
    if (customName) {
      identity = {
        id: `${topologyType}-${customName.replace(/\s+/g, '-')}-${Date.now()}`,
        koreanName: customName,
        title: rank,
        englishRole: roleMeta.label,
        agentType: topologyType,
        icon: selectedIcon,
      }
    } else {
      // Fall back to Korean name pool
      const nameEntry = assignName(usedNames)
      identity = {
        id: `${topologyType}-${nameEntry.koreanName}-${Date.now()}`,
        koreanName: nameEntry.koreanName,
        title: nameEntry.title,
        englishRole: roleMeta.label,
        agentType: topologyType,
        icon: selectedIcon,
      }
    }

    dispatch({ type: 'SPAWN_AGENT', payload: identity })

    const effectiveParentId = parentId || 'orchestrator-ceo'
    dispatch({
      type: 'ADD_EXECUTION_EDGE',
      payload: { id: `e-${effectiveParentId}-${identity.id}`, sourceId: effectiveParentId, targetId: identity.id, status: 'normal', dataRate: Math.floor(Math.random() * 60) + 20 },
    })
    dispatch({
      type: 'ADD_DEPENDENCY_LINK',
      payload: { id: `d-${effectiveParentId}-${identity.id}`, sourceId: effectiveParentId, targetId: identity.id, type: 'communicates' },
    })

    setTimeout(() => {
      dispatch({
        type: 'UPDATE_AGENT_STATUS',
        payload: { id: identity.id, status: 'active', tokenRate: Math.floor(Math.random() * 80) + 20, latencyMs: Math.floor(Math.random() * 200) + 50 },
      })
    }, 600)

    // Persist to localStorage
    const savedAt = Date.now()
    const saved: SavedAgent = {
      id: identity.id,
      name: customName || identity.koreanName,
      rank,
      roleType,
      roleDescription: description,
      inferredSummary: inferred?.summary ?? roleMeta.label,
      skills,
      icon: selectedIcon,
      createdAt: savedAt,
    }
    addAgent(saved)

    // Also save as markdown file in ~/.claude/agents/
    void fetch('/api/agents/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: identity.id,
        name: customName || identity.koreanName,
        rank,
        roleType,
        roleLabel: roleMeta.label,
        roleDescription: description,
        inferredSummary: inferred?.summary ?? roleMeta.label,
        skills,
        icon: selectedIcon,
        createdAt: savedAt,
      }),
    })

    setName('')
    setDescription('')
    setIconManuallySet(false)
    onClose()
  }, [name, rank, roleType, description, skills, parentId, selectedIcon, hasCeo, usedNames, dispatch, addAgent, inferred, onClose])

  const roleMeta = ROLE_META[roleType]

  return (
    <div
      style={{
        position: 'absolute',
        top: 36,
        right: 12,
        zIndex: 30,
        width: 340,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        background: 'rgba(16,20,32,0.97)',
        border: '1px solid #2a3042',
        borderRadius: 8,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.04em' }}>
          에이전트 생성
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, padding: 2 }}>
          ✕
        </button>
      </div>

      {/* Name + Rank row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>에이전트 이름</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: Alex, DataBot, Sentinel"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>직급</label>
          <select value={rank} onChange={e => setRank(e.target.value as AgentRank)} style={{ ...inputStyle, width: 100 }}>
            {RANK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Icon picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>아이콘 선택</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {ICON_OPTIONS.map(icon => {
            const active = selectedIcon === icon
            return (
              <button
                key={icon}
                onClick={() => { setSelectedIcon(icon); setIconManuallySet(true) }}
                style={{
                  width: 30,
                  height: 30,
                  fontSize: 16,
                  background: active ? 'rgba(0,255,136,0.15)' : 'rgba(42,48,66,0.4)',
                  border: `1px solid ${active ? 'rgba(0,255,136,0.5)' : '#2a3042'}`,
                  borderRadius: 5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.1s',
                  boxShadow: active ? '0 0 6px rgba(0,255,136,0.3)' : 'none',
                }}
                title={icon}
              >
                {icon}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 8, color: '#4b5563' }}>
          현재 선택: <span style={{ fontSize: 14 }}>{selectedIcon}</span> · 역할 변경 시 자동 업데이트
        </div>
      </div>

      {/* Role description → inference */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>역할 설명 (Claude가 유형 추론)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="예: 코드 품질을 검토하고 보안 취약점을 분석합니다"
          rows={2}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
        />
        {inferred?.summary && (
          <div style={{ fontSize: 9, color: '#00ff88', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', background: 'rgba(0,255,136,0.06)', borderRadius: 3, border: '1px solid rgba(0,255,136,0.2)' }}>
            <span>✦</span>
            <span>{roleMeta.icon} {roleMeta.label} 로 추론됨 — {inferred.summary}</span>
          </div>
        )}
      </div>

      {/* Role type grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>역할 유형</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {ROLE_TYPE_ORDER.map(rt => {
            const meta = ROLE_META[rt]
            const active = roleType === rt
            return (
              <button
                key={rt}
                onClick={() => setRoleType(rt)}
                style={{
                  padding: '4px 6px',
                  background: active ? `${meta.color}18` : 'rgba(42,48,66,0.4)',
                  border: `1px solid ${active ? meta.color + '60' : '#2a3042'}`,
                  borderRadius: 4,
                  color: active ? meta.color : '#6b7280',
                  fontSize: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.12s',
                  fontWeight: active ? 700 : 400,
                }}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Skills chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>스킬 (복수 선택)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ALL_SKILLS.map(skill => {
            const meta = SKILL_META[skill]
            const active = skills.includes(skill)
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                style={{
                  padding: '2px 7px',
                  background: active ? 'rgba(0,255,136,0.12)' : 'rgba(42,48,66,0.4)',
                  border: `1px solid ${active ? 'rgba(0,255,136,0.4)' : '#2a3042'}`,
                  borderRadius: 10,
                  color: active ? '#00ff88' : '#6b7280',
                  fontSize: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.12s',
                }}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Parent agent */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={labelStyle}>상위 에이전트</label>
        <select value={parentId} onChange={e => setParentId(e.target.value)} style={inputStyle}>
          <option value="orchestrator-ceo">CEO (기본)</option>
          {activeAgents.filter(a => a.identity.id !== 'orchestrator-ceo').map(a => (
            <option key={a.identity.id} value={a.identity.id}>
              {a.identity.koreanName} / {a.identity.title}
            </option>
          ))}
        </select>
      </div>

      {/* Create */}
      <button
        onClick={handleCreate}
        style={{
          padding: '8px 12px',
          background: 'rgba(0,255,136,0.12)',
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
        + 에이전트 생성 &amp; 저장
      </button>

      <span style={{ fontSize: 8, color: '#374151', textAlign: 'center' }}>
        생성된 에이전트는 에이전트 설정 &gt; 에이전트 현황에 저장됩니다
      </span>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  color: '#9ca3af',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  padding: '5px 8px',
  background: 'rgba(10,14,26,0.8)',
  border: '1px solid #2a3042',
  borderRadius: 4,
  color: '#e5e7eb',
  fontSize: 10,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

export default AgentCreatePanel
