'use client'

import { useState } from 'react'
import AgentResourcePanel from './AgentResourcePanel'
import AgentInfraMap from './AgentInfraMap'
import AgentStatusPanel from './AgentStatusPanel'
import RequestStatusPanel from './RequestStatusPanel'
import AgentMetricsBar from './AgentMetricsBar'
import AgentEventTicker from './AgentEventTicker'
import AgentRegistryPanel from './AgentRegistryPanel'

type SettingsTab = 'infra' | 'registry'

export default function AgentSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('infra')

  const tabBtn = (t: SettingsTab, label: string) => ({
    padding: '3px 12px',
    background: tab === t ? 'rgba(0,255,136,0.08)' : 'transparent',
    border: `1px solid ${tab === t ? 'rgba(0,255,136,0.3)' : 'transparent'}`,
    borderRadius: 3,
    color: tab === t ? '#00ff88' : '#6b7280',
    fontSize: 9,
    fontWeight: tab === t ? 700 : 400,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0e1a' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          borderBottom: '1px solid #1a2035',
          flexShrink: 0,
          background: 'rgba(16,20,32,0.8)',
        }}
      >
        <button style={tabBtn('infra', '인프라 현황')} onClick={() => setTab('infra')}>인프라 현황</button>
        <button style={tabBtn('registry', '에이전트 현황')} onClick={() => setTab('registry')}>에이전트 현황</button>
      </div>

      {/* Content */}
      {tab === 'infra' ? (
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
          }}
        >
          <div style={{ gridArea: 'left', overflow: 'hidden', borderRight: '1px solid #1a2035', display: 'flex', flexDirection: 'column' }}>
            <AgentResourcePanel />
          </div>
          <div style={{ gridArea: 'center', overflow: 'hidden', position: 'relative' }}>
            <AgentInfraMap />
          </div>
          <div style={{ gridArea: 'right', overflow: 'hidden', borderLeft: '1px solid #1a2035', display: 'flex', flexDirection: 'column' }}>
            <AgentStatusPanel />
            <RequestStatusPanel />
          </div>
          <div style={{ gridArea: 'bottom', overflow: 'hidden', borderTop: '1px solid #1a2035' }}>
            <AgentMetricsBar />
          </div>
          <div style={{ gridArea: 'ticker', overflow: 'hidden', borderTop: '1px solid #1a2035' }}>
            <AgentEventTicker />
          </div>
        </div>
      ) : (
        <AgentRegistryPanel />
      )}
    </div>
  )
}
