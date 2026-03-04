'use client'

import type { LegendEntry } from '@/types/topology'

const LEGEND_ITEMS: LegendEntry[] = [
  { label: 'CEO', color: '#ffd700', type: 'orchestrator' },
  { label: 'PLANNER', color: '#8b5cf6', type: 'planner' },
  { label: 'EXECUTOR', color: '#f59e0b', type: 'executor' },
  { label: 'TOOL', color: '#06b6d4', type: 'tool' },
  { label: 'VERIFIER', color: '#10b981', type: 'verifier' },
  { label: 'GIT', color: '#f97316', type: 'hub' },
  { label: 'SHELL', color: '#06b6d4', type: 'hub' },
  { label: 'BROWSER', color: '#3b82f6', type: 'hub' },
  { label: 'SLACK', color: '#e74c3c', type: 'hub' },
  { label: 'POLICY', color: '#ef4444', type: 'hub' },
  { label: 'KNOWLEDGE', color: '#a855f7', type: 'hub' },
]

export function GraphLegend() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '8px 10px',
        background: 'rgba(10, 14, 26, 0.8)',
        borderRadius: 6,
        border: '1px solid #2a3042',
      }}
    >
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: item.color,
              boxShadow: `0 0 4px ${item.color}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 8,
              color: '#9ca3af',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default GraphLegend
