'use client'

import { useOrchestra } from '@/context/AgentOrchestraContext'
import { NocTheme } from '@/constants/nocTheme'
import NocLeftPanel from './left/NocLeftPanel'
import AgentOperationsCenter from './center/AgentOperationsCenter'
import NocRightPanel from './right/NocRightPanel'
import NocBottomRow from './bottom/NocBottomRow'
import NocEventLogFooter from './footer/NocEventLogFooter'

export default function NocDashboard() {
  const { state } = useOrchestra()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '25% 1fr 30%',
        gridTemplateRows: '1fr auto auto',
        width: '100%',
        height: '100%',
        background: NocTheme.background,
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
        color: '#e5e7eb',
      }}
    >
      {/* Row 1: Left charts | Center isometric | Right event table + topology */}
      <div style={{ gridColumn: '1', gridRow: '1', overflow: 'hidden', borderRight: `1px solid ${NocTheme.divider}` }}>
        <NocLeftPanel agents={state.agents} messages={state.messages} />
      </div>

      <div style={{ gridColumn: '2', gridRow: '1', overflow: 'hidden', position: 'relative' }}>
        <AgentOperationsCenter agents={state.agents} phase={state.phase} />
      </div>

      <div style={{ gridColumn: '3', gridRow: '1', overflow: 'hidden', borderLeft: `1px solid ${NocTheme.divider}` }}>
        <NocRightPanel agents={state.agents} messages={state.messages} />
      </div>

      {/* Row 2: Bottom cards (3 equal panels) */}
      <div style={{ gridColumn: '1 / -1', gridRow: '2', borderTop: `1px solid ${NocTheme.divider}` }}>
        <NocBottomRow agents={state.agents} edges={state.executionEdges} links={state.dependencyLinks} />
      </div>

      {/* Row 3: Event log footer */}
      <div style={{ gridColumn: '1 / -1', gridRow: '3', borderTop: `1px solid ${NocTheme.divider}` }}>
        <NocEventLogFooter messages={state.messages} />
      </div>
    </div>
  )
}
