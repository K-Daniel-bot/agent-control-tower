'use client'

import { useState, useEffect } from 'react'
import type { SavedAgent, AgentSkill } from '@/types/agent'
import { useAgentStorage } from '@/hooks/useAgentStorage'
import { ROLE_META, SKILL_META } from '@/utils/agentInference'

interface FsAgent { fileName: string; path: string; name: string; description: string }

const RANK_COLOR: Record<string, string> = {
  Junior:    '#6b7280',
  'Mid-Level': '#3b82f6',
  Senior:    '#8b5cf6',
  Lead:      '#f59e0b',
  Principal: '#f97316',
  Staff:     '#ec4899',
  Fellow:    '#ffd700',
}

function SkillChip({ skill }: { skill: AgentSkill }) {
  const meta = SKILL_META[skill]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: '1px 5px',
        background: 'rgba(0,255,136,0.06)',
        border: '1px solid rgba(0,255,136,0.15)',
        borderRadius: 8,
        fontSize: 7,
        color: '#6b7280',
      }}
    >
      {meta.icon} {meta.label}
    </span>
  )
}

function AgentProfileModal({ agent, onClose }: { agent: SavedAgent; onClose: () => void }) {
  const roleMeta = ROLE_META[agent.roleType]
  const rankColor = RANK_COLOR[agent.rank] ?? '#6b7280'
  const createdDate = new Date(agent.createdAt).toLocaleDateString('ko-KR')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 420,
          background: 'rgba(16,20,32,0.98)',
          border: '1px solid #2a3042',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: `${roleMeta.color}18`,
                border: `2px solid ${roleMeta.color}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {roleMeta.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e5e7eb' }}>{agent.name}</div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 2 }}>
                <span style={{ fontSize: 9, color: rankColor, fontWeight: 600, padding: '1px 5px', background: `${rankColor}15`, borderRadius: 3, border: `1px solid ${rankColor}40` }}>
                  {agent.rank}
                </span>
                <span style={{ fontSize: 9, color: roleMeta.color, padding: '1px 5px', background: `${roleMeta.color}12`, borderRadius: 3, border: `1px solid ${roleMeta.color}30` }}>
                  {roleMeta.label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Summary */}
        {agent.inferredSummary && (
          <div style={{ padding: '8px 10px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 6 }}>
            <div style={{ fontSize: 9, color: '#00ff88', marginBottom: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>추론된 역할</div>
            <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.5 }}>{agent.inferredSummary}</div>
          </div>
        )}

        {/* Description */}
        {agent.roleDescription && (
          <div>
            <div style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>역할 설명</div>
            <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.6 }}>{agent.roleDescription}</div>
          </div>
        )}

        {/* Skills */}
        <div>
          <div style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5 }}>
            스킬 ({agent.skills.length}개)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {agent.skills.map(skill => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 8px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 10,
                  fontSize: 9,
                  color: '#60a5fa',
                }}
              >
                {SKILL_META[skill].icon} {SKILL_META[skill].label}
              </span>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, paddingTop: 6, borderTop: '1px solid #1e2535' }}>
          <div>
            <div style={{ fontSize: 8, color: '#374151', letterSpacing: '0.05em' }}>ID</div>
            <div style={{ fontSize: 8, color: '#4b5563', fontFamily: 'monospace' }}>{agent.id.slice(0, 20)}...</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: '#374151', letterSpacing: '0.05em' }}>생성일</div>
            <div style={{ fontSize: 9, color: '#6b7280' }}>{createdDate}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentRow({ agent, onDelete, onProfile }: { agent: SavedAgent; onDelete: () => void; onProfile: () => void }) {
  const roleMeta = ROLE_META[agent.roleType]
  const rankColor = RANK_COLOR[agent.rank] ?? '#6b7280'

  return (
    <div
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid rgba(42,48,66,0.6)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      {/* Role icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `${roleMeta.color}12`,
          border: `1px solid ${roleMeta.color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {roleMeta.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#e5e7eb' }}>{agent.name}</span>
          <span style={{ fontSize: 8, color: rankColor, padding: '0 4px', background: `${rankColor}12`, borderRadius: 3, border: `1px solid ${rankColor}30` }}>
            {agent.rank}
          </span>
          <span style={{ fontSize: 8, color: roleMeta.color }}>{roleMeta.label}</span>
        </div>
        {agent.inferredSummary && (
          <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent.inferredSummary}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {agent.skills.slice(0, 5).map(s => <SkillChip key={s} skill={s} />)}
          {agent.skills.length > 5 && (
            <span style={{ fontSize: 7, color: '#374151' }}>+{agent.skills.length - 5}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center', paddingTop: 2 }}>
        <button
          onClick={onProfile}
          style={{
            padding: '2px 7px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 4,
            color: '#60a5fa',
            fontSize: 8,
            cursor: 'pointer',
          }}
        >
          프로필
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '2px 7px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 4,
            color: '#ef4444',
            fontSize: 8,
            cursor: 'pointer',
          }}
        >
          삭제
        </button>
      </div>
    </div>
  )
}

export default function AgentRegistryPanel() {
  const { agents, deleteAgent } = useAgentStorage()
  const [profileAgent, setProfileAgent] = useState<SavedAgent | null>(null)
  const [fsAgents, setFsAgents] = useState<FsAgent[]>([])
  const [fsDir, setFsDir] = useState<string>('')

  useEffect(() => {
    fetch('/api/agents/save')
      .then(r => r.json())
      .then((data: { agents?: FsAgent[]; dir?: string }) => {
        setFsAgents(data.agents ?? [])
        setFsDir(data.dir ?? '')
      })
      .catch(() => {})
  }, [])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0a0e1a',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #1e2535',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.04em' }}>
            에이전트 현황
          </div>
          <div style={{ fontSize: 9, color: '#4b5563', marginTop: 1 }}>
            영구 저장된 에이전트 — 관제 대시보드에서 추가
          </div>
        </div>
        <div
          style={{
            padding: '3px 10px',
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: 12,
            fontSize: 11,
            color: '#00ff88',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        >
          {agents.length}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {agents.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 32 }}>🤖</div>
            <div style={{ fontSize: 11, color: '#4b5563' }}>저장된 에이전트 없음</div>
            <div style={{ fontSize: 9, color: '#374151', lineHeight: 1.5 }}>
              관제 대시보드 &gt; 수동 탭 &gt;<br />+ 에이전트 추가로 생성하세요
            </div>
          </div>
        ) : (
          agents.map(agent => (
            <AgentRow
              key={agent.id}
              agent={agent}
              onDelete={() => deleteAgent(agent.id)}
              onProfile={() => setProfileAgent(agent)}
            />
          ))
        )}
      </div>

      {/* Filesystem agents section */}
      {(fsAgents.length > 0 || fsDir) && (
        <div style={{ borderTop: '1px solid #1e2535', flexShrink: 0 }}>
          <div
            style={{
              padding: '8px 14px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.04em' }}>
                파일로 저장된 에이전트
              </div>
              {fsDir && (
                <div
                  style={{ fontSize: 7, color: '#374151', fontFamily: 'monospace', marginTop: 1 }}
                  title={fsDir}
                >
                  {fsDir}
                </div>
              )}
            </div>
            <span
              style={{
                padding: '1px 7px',
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: 10,
                fontSize: 10,
                color: '#a855f7',
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            >
              {fsAgents.length}
            </span>
          </div>
          <div style={{ maxHeight: 150, overflowY: 'auto', padding: '0 0 6px' }}>
            {fsAgents.length === 0 ? (
              <div style={{ padding: '8px 14px', fontSize: 9, color: '#374151' }}>
                저장된 파일 없음
              </div>
            ) : (
              fsAgents.map(a => (
                <div
                  key={a.fileName}
                  style={{
                    padding: '5px 14px',
                    borderBottom: '1px solid rgba(42,48,66,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🤖</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: 7, color: '#4b5563', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.path}>
                      {a.fileName}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {profileAgent && (
        <AgentProfileModal agent={profileAgent} onClose={() => setProfileAgent(null)} />
      )}
    </div>
  )
}
