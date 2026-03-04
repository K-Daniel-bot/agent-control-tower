'use client'

import type { InfraNodeDef } from '@/data/infraNodeFeatures'

interface NodeFeaturePopoverProps {
  node: InfraNodeDef
  screenX: number
  screenY: number
}

export default function NodeFeaturePopover({ node, screenX, screenY }: NodeFeaturePopoverProps) {
  return (
    <div
      style={{
        position: 'fixed',
        left: screenX + 20,
        top: screenY - 40,
        zIndex: 60,
        width: 180,
        background: 'rgba(16,20,32,0.97)',
        border: `1px solid ${node.color}44`,
        borderRadius: 8,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${node.color}22`,
        pointerEvents: 'none',
        animation: 'popover-fade-in 0.15s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16 }}>{node.icon}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: node.color }}>{node.label}</div>
          <div style={{ fontSize: 8, color: '#6b7280' }}>{node.description}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `${node.color}22` }} />

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {node.features.map((feat) => (
          <div
            key={feat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 9,
              color: '#d1d5db',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: node.color,
                flexShrink: 0,
                boxShadow: `0 0 4px ${node.color}`,
              }}
            />
            {feat}
          </div>
        ))}
      </div>
    </div>
  )
}
