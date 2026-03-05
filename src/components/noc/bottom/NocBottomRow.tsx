'use client'

import { NocTheme, withAlpha } from '@/constants/nocTheme'
import AgentStatusCards from './AgentStatusCards'
import CommunicationChannelCards from './CommunicationChannelCards'
import ToolResourceCards from './ToolResourceCards'
import type { AgentState, ExecutionEdge, DependencyLink } from '@/types/topology'

interface NocBottomRowProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly edges: ReadonlyArray<ExecutionEdge>
  readonly links: ReadonlyArray<DependencyLink>
}

interface SectionConfig {
  readonly title: string
  readonly subtitle: string
  readonly accentColor: string
  readonly statusLabel: string
  readonly component: React.ReactNode
}

export default function NocBottomRow({ agents, edges, links }: NocBottomRowProps) {
  const sections: readonly SectionConfig[] = [
    {
      title: 'AGENT OPERATIONS',
      subtitle: 'Real-time agent resource monitoring',
      accentColor: '#00ff88',
      statusLabel: `${agents.length} ACTIVE`,
      component: <AgentStatusCards agents={agents} />,
    },
    {
      title: 'COMM CHANNELS',
      subtitle: 'Inter-agent communication traffic',
      accentColor: '#06b6d4',
      statusLabel: `${edges.length} LINKS`,
      component: <CommunicationChannelCards edges={edges} />,
    },
    {
      title: 'TOOL RESOURCES',
      subtitle: 'System tool utilization status',
      accentColor: '#a855f7',
      statusLabel: `${links.length} TOOLS`,
      component: <ToolResourceCards agents={agents} links={links} />,
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        height: 190,
        background: NocTheme.background,
        borderTop: `1px solid ${NocTheme.divider}`,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {sections.map((section, idx) => (
        <div
          key={section.title}
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: idx < sections.length - 1 ? `1px solid ${NocTheme.divider}` : 'none',
            minWidth: 0,
          }}
        >
          {/* Premium section header */}
          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              borderBottom: `1px solid ${NocTheme.divider}`,
              background: withAlpha(section.accentColor, 0.03),
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: section.accentColor,
                  boxShadow: `0 0 8px ${withAlpha(section.accentColor, 0.6)}`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: section.accentColor,
                }}
              >
                {section.title}
              </span>
              <div style={{ width: 1, height: 10, background: NocTheme.divider }} />
              <span style={{ fontSize: 8, color: '#4a5568', letterSpacing: '0.03em' }}>
                {section.subtitle}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: section.accentColor,
                  background: withAlpha(section.accentColor, 0.1),
                  padding: '2px 6px',
                  borderRadius: 2,
                  border: `1px solid ${withAlpha(section.accentColor, 0.2)}`,
                  letterSpacing: '0.05em',
                }}
              >
                {section.statusLabel}
              </span>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            {section.component}
          </div>
        </div>
      ))}
    </div>
  )
}
