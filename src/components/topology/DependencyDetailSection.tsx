'use client'

import { useState, useCallback } from 'react'
import type { AgentState } from '@/types/topology'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { getDisplayLabel } from '@/data/koreanNamePool'
import SectionHeader from './SectionHeader'
import AgentControlPopover from './AgentControlPopover'

const STATUS_COLORS: Record<string, string> = {
  spawning: '#3b82f6',
  active: '#00ff88',
  working: '#00ff88',
  idle: '#6b7280',
  error: '#ef4444',
  complete: '#4b5563',
}

const STATUS_LABELS: Record<string, string> = {
  spawning: '생성 중',
  active: '활성',
  working: '작업 중',
  idle: '대기',
  error: '오류',
  complete: '완료',
}

export function DependencyDetailSection() {
  const { state } = useOrchestra()
  const isEmpty = state.agents.length === 0

  const [selectedAgent, setSelectedAgent] = useState<{
    agent: AgentState
    position: { x: number; y: number }
  } | null>(null)

  const handleCardClick = useCallback(
    (agent: AgentState, e: React.MouseEvent) => {
      setSelectedAgent({
        agent,
        position: { x: e.clientX, y: e.clientY - 120 },
      })
    },
    []
  )

  return (
    <div
      style={{
        flex: '2.5 1 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        borderTop: '1px solid #2a3042',
      }}
    >
      <SectionHeader title="Agent Status Detail" accentColor="#a855f7" />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '6px 10px',
          minHeight: 0,
        }}
      >
        {isEmpty ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: '#4b5563', letterSpacing: '0.05em' }}>
              에이전트 상태 대기 중...
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 6,
            }}
          >
            {state.agents.map((agent) => {
              const statusColor = STATUS_COLORS[agent.status] ?? '#6b7280'
              const statusLabel = STATUS_LABELS[agent.status] ?? agent.status
              const isActive = agent.status === 'active' || agent.status === 'working'

              return (
                <div
                  key={agent.identity.id}
                  onClick={(e) => handleCardClick(agent, e)}
                  style={{
                    background: 'rgba(26,31,46,0.8)',
                    border: `1px solid ${isActive ? statusColor : '#2a3042'}`,
                    borderRadius: 6,
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    opacity: agent.status === 'complete' ? 0.5 : 1,
                    transition: 'opacity 0.3s, border-color 0.3s',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: statusColor,
                      }}
                    >
                      {getDisplayLabel(agent.identity)}
                    </span>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: statusColor,
                        boxShadow: isActive ? `0 0 4px ${statusColor}` : 'none',
                        animation: isActive ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#6b7280' }}>
                    <span>{statusLabel}</span>
                    <span style={{ fontFamily: 'monospace' }}>
                      {agent.tokenRate > 0 ? `${agent.tokenRate}t/s` : '—'}
                    </span>
                  </div>
                  {agent.latencyMs > 0 && (
                    <div style={{ fontSize: 7, color: '#4b5563', fontFamily: 'monospace' }}>
                      p99: {agent.latencyMs}ms
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Agent control popover */}
      {selectedAgent && (
        <AgentControlPopover
          agent={selectedAgent.agent}
          position={selectedAgent.position}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}

export default DependencyDetailSection
