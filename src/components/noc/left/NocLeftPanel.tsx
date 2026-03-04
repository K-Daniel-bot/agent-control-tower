'use client'

import TokenRateChart from './TokenRateChart'
import ContextUsageChart from './ContextUsageChart'
import CommunicationTrafficChart from './CommunicationTrafficChart'

export default function NocLeftPanel() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,14,26,0.97)',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, borderBottom: '1px solid #1e2535' }}>
        <TokenRateChart />
      </div>
      <div style={{ flex: 1, minHeight: 0, borderBottom: '1px solid #1e2535' }}>
        <ContextUsageChart />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CommunicationTrafficChart />
      </div>
    </div>
  )
}
