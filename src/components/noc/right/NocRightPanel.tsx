'use client'

import { NocTheme } from '@/constants/nocTheme'
import AgentEventCountTable from './AgentEventCountTable'
import AgentServiceTopology from './AgentServiceTopology'
import type { AgentState, AgentMessage } from '@/types/topology'

interface NocRightPanelProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly messages: ReadonlyArray<AgentMessage>
}

function PanelHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 10px',
        background: 'transparent',
        borderBottom: `1px solid ${NocTheme.divider}`,
        minHeight: 28,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: NocTheme.textDark, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {title}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: NocTheme.textMuted, cursor: 'pointer' }}>□</span>
        <span style={{ fontSize: 10, color: NocTheme.textMuted, cursor: 'pointer' }}>✕</span>
      </div>
    </div>
  )
}

export default function NocRightPanel({ agents, messages }: NocRightPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: NocTheme.background, overflow: 'hidden' }}>
      <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: `1px solid ${NocTheme.divider}` }}>
        <PanelHeader title="이벤트 개수 (프로파일)" />
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 8px', background: 'transparent' }}>
          <AgentEventCountTable agents={agents} messages={messages} />
        </div>
      </div>
      <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        <PanelHeader title="에이전트 서비스별 (Bubble Style)" />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <AgentServiceTopology />
        </div>
      </div>
    </div>
  )
}
