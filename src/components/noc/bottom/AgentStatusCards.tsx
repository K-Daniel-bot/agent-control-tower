'use client'

import GaugeChart from './GaugeChart'

const MOCK_AGENTS = [
  { id: 'orc', name: '[ORC] Orchestrator', cpu: 42, mem: 67, token: 78 },
  { id: 'pln', name: '[PLN] Planner', cpu: 31, mem: 54, token: 45 },
  { id: 'exe', name: '[EXE] Executor', cpu: 88, mem: 72, token: 91 },
  { id: 'rev', name: '[REV] Reviewer', cpu: 15, mem: 38, token: 22 },
  { id: 'sec', name: '[SEC] Security', cpu: 55, mem: 61, token: 63 },
] as const

const cardStyle: React.CSSProperties = {
  minWidth: 130,
  background: 'rgba(15,20,35,0.9)',
  border: '1px solid #1e2535',
  borderRadius: 3,
  padding: '6px 8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  flexShrink: 0,
}

const nameStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#9ca3af',
  fontWeight: 500,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
}

const gaugeRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 2,
}

export default function AgentStatusCards() {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px', overflowX: 'auto' }}>
      {MOCK_AGENTS.map((agent) => (
        <div key={agent.id} style={cardStyle}>
          <div style={nameStyle}>{agent.name}</div>
          <div style={gaugeRowStyle}>
            <GaugeChart value={agent.cpu} label="CPU" size={42} />
            <GaugeChart value={agent.mem} label="MEM" size={42} />
            <GaugeChart value={agent.token} label="TKN" size={42} />
          </div>
        </div>
      ))}
    </div>
  )
}
