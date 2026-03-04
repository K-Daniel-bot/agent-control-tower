'use client'

import { useOrchestra } from '@/context/AgentOrchestraContext'
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
        background: '#0a0e1a',
        overflow: 'hidden',
      }}
    >
      {/* Row 1: Left charts | Center isometric | Right event table + topology */}
      <div
        style={{
          gridColumn: '1',
          gridRow: '1',
          overflow: 'hidden',
          borderRight: '1px solid #1e2535',
        }}
      >
        <NocLeftPanel />
      </div>

      <div
        style={{
          gridColumn: '2',
          gridRow: '1',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <AgentOperationsCenter agents={state.agents} phase={state.phase} />
      </div>

      <div
        style={{
          gridColumn: '3',
          gridRow: '1',
          overflow: 'hidden',
          borderLeft: '1px solid #1e2535',
        }}
      >
        <NocRightPanel />
      </div>

      {/* Row 2: Bottom cards (3 equal panels) */}
      <div
        style={{
          gridColumn: '1 / -1',
          gridRow: '2',
          borderTop: '1px solid #1e2535',
        }}
      >
        <NocBottomRow />
      </div>

      {/* Row 3: Event log footer */}
      <div
        style={{
          gridColumn: '1 / -1',
          gridRow: '3',
          borderTop: '1px solid #1e2535',
        }}
      >
        <NocEventLogFooter />
      </div>
    </div>
  )
}
