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
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, borderBottom: '1px solid #333333' }}>
        <TokenRateChart />
      </div>
      <div style={{ flex: 1, minHeight: 0, borderBottom: '1px solid #333333' }}>
        <ContextUsageChart />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CommunicationTrafficChart />
      </div>
    </div>
  )
}
