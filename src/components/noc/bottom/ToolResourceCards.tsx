'use client'

import { useMemo } from 'react'
import { NocTheme, withAlpha } from '@/constants/nocTheme'
import type { AgentState, DependencyLink } from '@/types/topology'
import { deriveToolStatus } from '@/utils/nocDataTransform'

interface ToolResourceCardsProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly links: ReadonlyArray<DependencyLink>
}

const TOOL_COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#06b6d4', '#00ff88']

function getUsageStatus(usage: number): { color: string; label: string } {
  if (usage > 80) return { color: '#ef4444', label: 'HIGH' }
  if (usage > 50) return { color: '#f59e0b', label: 'MED' }
  return { color: '#00ff88', label: 'LOW' }
}

export default function ToolResourceCards({ agents, links }: ToolResourceCardsProps) {
  const tools = useMemo(() => deriveToolStatus(agents, links), [agents, links])

  if (tools.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333', fontSize: 9, letterSpacing: '0.1em' }}>
        INITIALIZING TOOL SUBSYSTEMS...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 10px', overflowX: 'auto', height: '100%', alignItems: 'center' }}>
      {tools.map((tool, idx) => {
        const accentColor = TOOL_COLORS[idx % TOOL_COLORS.length]
        const usage = Math.round(tool.usage)
        const status = getUsageStatus(usage)

        return (
          <div
            key={tool.name}
            style={{
              minWidth: 110,
              height: '100%',
              background: withAlpha(accentColor, 0.03),
              border: `1px solid ${withAlpha(accentColor, 0.15)}`,
              borderRadius: 4,
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {/* Tool name + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span
                style={{
                  fontSize: 9,
                  color: NocTheme.textPrimary,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '65%',
                }}
              >
                {tool.name}
              </span>
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  color: status.color,
                  background: withAlpha(status.color, 0.1),
                  padding: '1px 4px',
                  borderRadius: 2,
                  letterSpacing: '0.05em',
                }}
              >
                {status.label}
              </span>
            </div>

            {/* Usage bar */}
            <div style={{ width: '100%' }}>
              <div style={{ width: '100%', height: 3, background: '#1a1a1a', borderRadius: 2 }}>
                <div
                  style={{
                    width: `${usage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${accentColor}, ${status.color})`,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 7, color: '#4a5568' }}>0%</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: accentColor }}>{usage}%</span>
                <span style={{ fontSize: 7, color: '#4a5568' }}>100%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
