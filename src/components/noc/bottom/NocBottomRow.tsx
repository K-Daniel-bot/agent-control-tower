'use client'

import AgentStatusCards from './AgentStatusCards'
import CommunicationChannelCards from './CommunicationChannelCards'
import ToolResourceCards from './ToolResourceCards'

interface PanelSection {
  readonly title: string
  readonly component: React.ReactNode
}

const SECTIONS: readonly PanelSection[] = [
  { title: 'Agent', component: <AgentStatusCards /> },
  { title: 'Communication', component: <CommunicationChannelCards /> },
  { title: 'Tool', component: <ToolResourceCards /> },
]

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  height: 180,
  background: 'transparent',
  borderTop: '1px solid #333333',
  flexShrink: 0,
  overflow: 'hidden',
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #333333',
  minWidth: 0,
}

const lastSectionStyle: React.CSSProperties = {
  ...sectionStyle,
  borderRight: 'none',
}

const sectionHeaderStyle: React.CSSProperties = {
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 8px',
  borderBottom: '1px solid #333333',
  background: 'transparent',
  flexShrink: 0,
}

const sectionTitleStyle: React.CSSProperties = {
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
  color: '#505661',
  fontSize: 10,
  cursor: 'default',
}

const sectionContentStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  background: 'transparent',
}

export default function NocBottomRow() {
  return (
    <div style={containerStyle}>
      {SECTIONS.map((section, idx) => (
        <div key={section.title} style={idx === SECTIONS.length - 1 ? lastSectionStyle : sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>
              <span style={{ color: '#3b82f6', fontSize: 10 }}>&#9654;</span>
              <span style={titleTextStyle}>주요 에이전트 운영현황({section.title})</span>
            </div>
            <div style={decorIconsStyle}>
              <span>&#9633;</span>
              <span>&#10005;</span>
            </div>
          </div>
          <div style={sectionContentStyle}>{section.component}</div>
        </div>
      ))}
    </div>
  )
}
