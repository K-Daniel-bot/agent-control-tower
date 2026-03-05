'use client'

import { NocTheme } from '@/constants/nocTheme'
import AgentStatusCards from './AgentStatusCards'
import CommunicationChannelCards from './CommunicationChannelCards'
import ToolResourceCards from './ToolResourceCards'
import type { AgentState, ExecutionEdge, DependencyLink } from '@/types/topology'

interface NocBottomRowProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly edges: ReadonlyArray<ExecutionEdge>
  readonly links: ReadonlyArray<DependencyLink>
}

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  height: 180,
  background: NocTheme.background,
  borderTop: `1px solid ${NocTheme.divider}`,
  flexShrink: 0,
  overflow: 'hidden',
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${NocTheme.divider}`,
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
  borderBottom: `1px solid ${NocTheme.divider}`,
  background: 'transparent',
  flexShrink: 0,
}

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const titleTextStyle: React.CSSProperties = {
  color: NocTheme.textSecondary,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.02em',
}

const decorIconsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  color: NocTheme.textMuted,
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

interface Section {
  readonly title: string
  readonly component: React.ReactNode
}

export default function NocBottomRow({ agents, edges, links }: NocBottomRowProps) {
  const sections: readonly Section[] = [
    { title: 'Agent', component: <AgentStatusCards agents={agents} /> },
    { title: 'Communication', component: <CommunicationChannelCards edges={edges} /> },
    { title: 'Tool', component: <ToolResourceCards agents={agents} links={links} /> },
  ]

  return (
    <div style={containerStyle}>
      {sections.map((section, idx) => (
        <div key={section.title} style={idx === sections.length - 1 ? lastSectionStyle : sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>
              <span style={{ color: NocTheme.blue, fontSize: 10 }}>&#9654;</span>
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
