'use client'

import React from 'react'
import type { SeverityLevel } from '@/types/remote'

interface SeverityBadgeProps {
  readonly severity: SeverityLevel
}

const SEVERITY_CONFIG: Record<SeverityLevel, { readonly color: string; readonly label: string }> = {
  low: { color: '#10b981', label: '낮음' },
  medium: { color: '#f59e0b', label: '중간' },
  high: { color: '#ef4444', label: '높음' },
  blocked: { color: '#6b7280', label: '차단' },
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 9999,
        backgroundColor: `${config.color}1f`,
        color: config.color,
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: 600,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.color,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  )
}
