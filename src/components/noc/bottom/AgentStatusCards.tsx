'use client'

import { useMemo } from 'react'
import { NocTheme, withAlpha } from '@/constants/nocTheme'
import type { AgentState } from '@/types/topology'
import { deriveAgentStatusSummary } from '@/utils/nocDataTransform'

interface AgentStatusCardsProps {
  readonly agents: ReadonlyArray<AgentState>
}

const AGENT_COLORS: Record<string, string> = {
  orchestrator: '#00ff88',
  planner: '#06b6d4',
  executor: '#f59e0b',
  tool: '#a855f7',
  verifier: '#ec4899',
}

function getAgentColor(type: string): string {
  return AGENT_COLORS[type.toLowerCase()] ?? '#3b82f6'
}

function getStatusColor(cpu: number): string {
  if (cpu > 80) return NocTheme.red
  if (cpu > 60) return NocTheme.orange
  return '#00ff88'
}

export default function AgentStatusCards({ agents }: AgentStatusCardsProps) {
  const summaries = useMemo(() => deriveAgentStatusSummary(agents), [agents])

  if (summaries.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333', fontSize: 9, letterSpacing: '0.1em' }}>
        AWAITING AGENT INITIALIZATION...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 10px', overflowX: 'auto', height: '100%', alignItems: 'center' }}>
      {summaries.map((agent) => {
        const accentColor = getAgentColor(agent.type)
        const statusColor = getStatusColor(agent.cpuUsage)
        return (
          <div
            key={agent.id}
            style={{
              minWidth: 140,
              height: '100%',
              background: withAlpha(accentColor, 0.03),
              border: `1px solid ${withAlpha(accentColor, 0.15)}`,
              borderRadius: 4,
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {/* Agent type badge + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: accentColor,
                  letterSpacing: '0.08em',
                  background: withAlpha(accentColor, 0.1),
                  padding: '1px 5px',
                  borderRadius: 2,
                }}
              >
                {agent.type.slice(0, 4).toUpperCase()}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: statusColor,
                    boxShadow: `0 0 6px ${statusColor}`,
                  }}
                />
                <span style={{ fontSize: 7, color: statusColor, fontWeight: 600 }}>LIVE</span>
              </div>
            </div>

            {/* Agent name */}
            <div
              style={{
                fontSize: 10,
                color: NocTheme.textPrimary,
                fontWeight: 600,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                letterSpacing: '0.02em',
              }}
            >
              {agent.name}
            </div>

            {/* Status metrics */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4, fontSize: 8, width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#999' }}>CPU</div>
                <div style={{ color: accentColor, fontWeight: 600 }}>{Math.round(agent.cpuUsage)}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#999' }}>MEM</div>
                <div style={{ color: accentColor, fontWeight: 600 }}>{Math.round(agent.memUsage)}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#999' }}>TKN</div>
                <div style={{ color: accentColor, fontWeight: 600 }}>{Math.round(agent.tokenRate)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
