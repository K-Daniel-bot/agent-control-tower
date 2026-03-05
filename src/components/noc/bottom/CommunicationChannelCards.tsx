'use client'

const MOCK_CHANNELS = [
  { id: 'plan', name: 'PlanBot Simulator', icon: '◈', traffic: '226.65 k', inRate: '142.3 k', outRate: '84.35 k' },
  { id: 'ath', name: 'Athon', icon: '◆', traffic: '40.55 k', inRate: '22.1 k', outRate: '18.45 k' },
  { id: 'msw', name: 'MainSwitch-2', icon: '▣', traffic: '185.20 k', inRate: '98.7 k', outRate: '86.50 k' },
  { id: 'sw7', name: 'switch7/5STS', icon: '▤', traffic: '12.88 k', inRate: '7.2 k', outRate: '5.68 k' },
  { id: 'hub', name: 'AgentHub-Core', icon: '◉', traffic: '332.10 k', inRate: '180.5 k', outRate: '151.60 k' },
] as const

const cardStyle: React.CSSProperties = {
  minWidth: 115,
  height: '100%',
  background: 'transparent',
  border: '1px solid #333333',
  borderRadius: 3,
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
  justifyContent: 'center',
}

const iconStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#3b82f6',
}

const nameStyle: React.CSSProperties = {
  fontSize: 9,
  color: '#6b7280',
  textAlign: 'center',
  whiteSpace: 'nowrap',
}

const trafficStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#e6edf3',
  letterSpacing: '0.02em',
}

const rateRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  fontSize: 9,
  color: '#6b7280',
}

export default function CommunicationChannelCards() {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px', overflowX: 'auto', height: '100%', background: 'transparent', alignItems: 'center' }}>
      {MOCK_CHANNELS.map((ch) => (
        <div key={ch.id} style={cardStyle}>
          <span style={iconStyle}>{ch.icon}</span>
          <span style={nameStyle}>{ch.name}</span>
          <span style={trafficStyle}>{ch.traffic}</span>
          <div style={rateRowStyle}>
            <span>
              <span style={{ color: '#22c55e' }}>▲</span> {ch.inRate}
            </span>
            <span>
              <span style={{ color: '#ef4444' }}>▼</span> {ch.outRate}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
