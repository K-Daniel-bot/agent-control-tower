'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import GaugeChart from './GaugeChart'
import type { AgentState } from '@/types/topology'
import { deriveAgentStatusSummary } from '@/utils/nocDataTransform'

interface AgentStatusCardsProps {
  readonly agents: ReadonlyArray<AgentState>
}

const cardStyle: React.CSSProperties = {
  minWidth: 130,
  height: '100%',
  background: 'transparent',
  border: `1px solid ${NocTheme.divider}`,
  borderRadius: 3,
  padding: '6px 8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  flexShrink: 0,
  justifyContent: 'center',
}

const nameStyle: React.CSSProperties = {
  fontSize: 10,
  color: NocTheme.textSecondary,
  fontWeight: 500,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
}

const gaugeRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 2,
  marginTop: 2,
}

const agentIconStyle: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 4,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function getAgentIcon(type: string): string {
  const lowerType = type.toLowerCase()
  if (lowerType === 'orchestrator') return '🤖'
  if (lowerType === 'planner') return '🧠'
  if (lowerType === 'executor') return '⚙️'
  if (lowerType === 'tool') return '🔧'
  if (lowerType === 'verifier') return '✅'
  return '🎯'
}

export default function AgentStatusCards({ agents }: AgentStatusCardsProps) {
  const summaries = useMemo(() => deriveAgentStatusSummary(agents), [agents])

  if (summaries.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: NocTheme.textMuted, fontSize: 11 }}>
        에이전트 대기 중...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px', overflowX: 'auto', height: '100%', background: 'transparent', alignItems: 'center' }}>
      {summaries.map((agent) => (
        <div key={agent.id} style={cardStyle}>
          <div style={agentIconStyle}>{getAgentIcon(agent.type)}</div>
          <div style={nameStyle}>[{agent.type.slice(0, 3).toUpperCase()}] {agent.name}</div>
          <div style={gaugeRowStyle}>
            <GaugeChart value={Math.round(agent.cpuUsage)} label="CPU" size={42} />
            <GaugeChart value={Math.round(agent.memUsage)} label="MEM" size={42} />
            <GaugeChart value={Math.round(agent.tokenRate)} label="TKN" size={42} />
          </div>
        </div>
      ))}
    </div>
  )
}
