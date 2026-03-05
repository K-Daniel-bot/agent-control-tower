'use client'

import GaugeChart from './GaugeChart'

const MOCK_TOOLS = [
  { id: 'claude', name: '[API] Claude', usage: 74 },
  { id: 'fs', name: '[FS] FileSystem', usage: 42 },
  { id: 'git', name: '[VCS] Git', usage: 58 },
  { id: 'shell', name: '[SH] Shell', usage: 33 },
  { id: 'browser', name: '[WEB] Browser', usage: 86 },
] as const

const cardStyle: React.CSSProperties = {
  minWidth: 100,
  height: '100%',
  background: 'transparent',
  border: '1px solid #333333',
  borderRadius: 3,
  padding: '6px 8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  flexShrink: 0,
  justifyContent: 'center',
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

const usageTextStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#6b7280',
  marginTop: -2,
}

export default function ToolResourceCards() {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px', overflowX: 'auto', height: '100%', background: 'transparent', alignItems: 'center' }}>
      {MOCK_TOOLS.map((tool) => (
        <div key={tool.id} style={cardStyle}>
          <div style={nameStyle}>{tool.name}</div>
          <GaugeChart value={tool.usage} label="Usage" size={52} />
          <div style={usageTextStyle}>{tool.usage}% used</div>
        </div>
      ))}
    </div>
  )
}
