'use client'

import { useEffect, useState } from 'react'
import type { AgentConfig } from '@/data/agentSettingsData'

const STATUS_DOT: Record<string, { color: string; label: string }> = {
  active: { color: '#00ff88', label: '활성' },
  inactive: { color: '#6b7280', label: '비활성' },
  error: { color: '#ef4444', label: '오류' },
}

export default function AgentStatusPanel() {
  const [agents, setAgents] = useState<AgentConfig[]>([])

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => setAgents(data.data ?? []))
      .catch(() => setAgents([]))
  }, [])

  const counts = {
    active: agents.filter((a) => a.status === 'active').length,
    inactive: agents.filter((a) => a.status === 'inactive').length,
    error: agents.filter((a) => a.status === 'error').length,
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>
          에이전트현황
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(counts).map(([key, count]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: STATUS_DOT[key]?.color ?? '#6b7280',
                }}
              />
              <span style={{ fontSize: 8, color: '#6b7280' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {agents.map((agent) => {
          const dot = STATUS_DOT[agent.status] ?? STATUS_DOT.inactive
          return (
            <div
              key={agent.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderBottom: '1px solid #333333',
                transition: 'background 0.15s',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: dot.color,
                  boxShadow: agent.status === 'active' ? `0 0 4px ${dot.color}` : 'none',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#e6edf3',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {agent.name}
                </div>
                <div style={{ fontSize: 7, color: '#6b7280' }}>{agent.englishRole}</div>
              </div>
              <div style={{ fontSize: 7, color: '#6b7280', flexShrink: 0 }}>{agent.model.split('-').pop()}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
