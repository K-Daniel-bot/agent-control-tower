'use client'

import { NocTheme } from '@/constants/nocTheme'
import TokenRateChart from './TokenRateChart'
import ContextUsageChart from './ContextUsageChart'
import CommunicationTrafficChart from './CommunicationTrafficChart'
import type { AgentState, AgentMessage } from '@/types/topology'

interface NocLeftPanelProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly messages: ReadonlyArray<AgentMessage>
}

export default function NocLeftPanel({ agents, messages }: NocLeftPanelProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: NocTheme.background,
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, borderBottom: `1px solid ${NocTheme.divider}` }}>
        <TokenRateChart agents={agents} />
      </div>
      <div style={{ flex: 1, minHeight: 0, borderBottom: `1px solid ${NocTheme.divider}` }}>
        <ContextUsageChart agents={agents} />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CommunicationTrafficChart messages={messages} />
      </div>
    </div>
  )
}
