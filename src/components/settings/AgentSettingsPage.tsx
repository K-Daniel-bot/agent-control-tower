'use client'

import AgentResourcePanel from './AgentResourcePanel'
import AgentInfraMap from './AgentInfraMap'
import AgentStatusPanel from './AgentStatusPanel'
import RequestStatusPanel from './RequestStatusPanel'
import AgentMetricsBar from './AgentMetricsBar'
import AgentEventTicker from './AgentEventTicker'

export default function AgentSettingsPage() {
  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateRows: '1fr auto 36px',
        gridTemplateColumns: '220px 1fr 240px',
        gridTemplateAreas: `
          "left   center right"
          "bottom bottom bottom"
          "ticker ticker ticker"
        `,
        overflow: 'hidden',
        background: '#0a0e1a',
        gap: 0,
      }}
    >
      {/* Left: Resource Top5 */}
      <div
        style={{
          gridArea: 'left',
          overflow: 'hidden',
          borderRight: '1px solid #1a2035',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AgentResourcePanel />
      </div>

      {/* Center: Infra Map */}
      <div style={{ gridArea: 'center', overflow: 'hidden', position: 'relative' }}>
        <AgentInfraMap />
      </div>

      {/* Right: Status + Requests */}
      <div
        style={{
          gridArea: 'right',
          overflow: 'hidden',
          borderLeft: '1px solid #1a2035',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AgentStatusPanel />
        <RequestStatusPanel />
      </div>

      {/* Bottom: Metrics */}
      <div style={{ gridArea: 'bottom', overflow: 'hidden', borderTop: '1px solid #1a2035' }}>
        <AgentMetricsBar />
      </div>

      {/* Ticker */}
      <div style={{ gridArea: 'ticker', overflow: 'hidden', borderTop: '1px solid #1a2035' }}>
        <AgentEventTicker />
      </div>
    </div>
  )
}
