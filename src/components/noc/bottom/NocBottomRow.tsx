'use client'

import AgentStatusCards from './AgentStatusCards'
import CommunicationChannelCards from './CommunicationChannelCards'
import ToolResourceCards from './ToolResourceCards'

interface PanelSection {
  title: string
  component: React.ReactNode
}

const PANELS: PanelSection[] = [
  { title: '주요 에이전트 운영현황(Agent)', component: <AgentStatusCards /> },
  { title: '주요 에이전트 운영현황(Communication)', component: <CommunicationChannelCards /> },
  { title: '주요 에이전트 운영현황(Tool)', component: <ToolResourceCards /> },
]

const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: 180,
  background: 'rgba(8,12,22,0.95)',
  borderTop: '1px solid #1e2535',
  flexShrink: 0,
}

const panelHeaderStyle: React.CSSProperties = {
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 8px',
  borderBottom: '1px solid #1e2535',
  background: 'rgba(15,20,35,0.95)',
  flexShrink: 0,
}

const panelTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const titleTextStyle: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.02em',
}

const decorIconsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  color: '#4b5563',
  fontSize: 10,
  cursor: 'default',
}

const panelContentStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
}

export default function NocBottomRow() {
  return (
    <div style={containerStyle}>
      {PANELS.map((panel, idx) => (
        <div
          key={panel.title}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRight: idx < PANELS.length - 1 ? '1px solid #1e2535' : 'none',
            minWidth: 0,
          }}
        >
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>
              <span style={{ color: '#3b82f6', fontSize: 10 }}>&#9654;</span>
              <span style={titleTextStyle}>{panel.title}</span>
            </div>
            <div style={decorIconsStyle}>
              <span>&#9633;</span>
              <span>&#10005;</span>
            </div>
          </div>
          <div style={panelContentStyle}>{panel.component}</div>
        </div>
      ))}
    </div>
  )
}
