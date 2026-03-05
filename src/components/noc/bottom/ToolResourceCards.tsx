'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import GaugeChart from './GaugeChart'
import type { AgentState, DependencyLink } from '@/types/topology'
import { deriveToolStatus } from '@/utils/nocDataTransform'

interface ToolResourceCardsProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly links: ReadonlyArray<DependencyLink>
}

const cardStyle: React.CSSProperties = {
  minWidth: 100,
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

const usageTextStyle: React.CSSProperties = {
  fontSize: 10,
  color: NocTheme.textTertiary,
  marginTop: -2,
}

export default function ToolResourceCards({ agents, links }: ToolResourceCardsProps) {
  const tools = useMemo(() => deriveToolStatus(agents, links), [agents, links])

  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px', overflowX: 'auto', height: '100%', background: 'transparent', alignItems: 'center' }}>
      {tools.map((tool) => (
        <div key={tool.name} style={cardStyle}>
          <div style={nameStyle}>{tool.name}</div>
          <GaugeChart value={Math.round(tool.usage)} label="Usage" size={52} />
          <div style={usageTextStyle}>{Math.round(tool.usage)}% used</div>
        </div>
      ))}
    </div>
  )
}
