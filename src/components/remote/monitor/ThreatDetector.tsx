'use client'

import React from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'
import type { ThreatLevel } from '@/types/remote'

const LEVEL_CONFIG: Record<ThreatLevel, { readonly color: string; readonly label: string }> = {
  info: { color: NocTheme.blue, label: 'INFO' },
  warning: { color: NocTheme.orange, label: 'WARN' },
  danger: { color: NocTheme.red, label: 'DANGER' },
}

function getOverallStatus(counts: Record<ThreatLevel, number>): {
  readonly label: string
  readonly color: string
} {
  if (counts.danger > 0) return { label: '위험', color: NocTheme.red }
  if (counts.warning > 0) return { label: '주의', color: NocTheme.orange }
  return { label: '정상', color: NocTheme.green }
}

function countByLevel(
  threats: readonly { readonly level: ThreatLevel }[]
): Record<ThreatLevel, number> {
  const counts: Record<ThreatLevel, number> = { info: 0, warning: 0, danger: 0 }
  for (const threat of threats) {
    counts[threat.level] = (counts[threat.level] || 0) + 1
  }
  return counts
}

export default function ThreatDetector() {
  const { state, toggleMonitoring } = useRemote()
  const { threats, monitoringEnabled } = state

  const counts = countByLevel(threats)
  const status = getOverallStatus(counts)

  const recentThreats = threats.slice(-3)

  return (
    <div style={{ fontFamily: 'monospace', minWidth: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: status.color,
            boxShadow: `0 0 6px ${status.color}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: status.color, fontWeight: 600 }}>
          {status.label}
        </span>
        <button
          onClick={toggleMonitoring}
          style={{
            marginLeft: 'auto',
            fontSize: 9,
            fontFamily: 'monospace',
            color: monitoringEnabled ? NocTheme.green : NocTheme.red,
            background: monitoringEnabled ? `${NocTheme.green}15` : `${NocTheme.red}15`,
            border: `1px solid ${monitoringEnabled ? NocTheme.green : NocTheme.red}40`,
            borderRadius: 3,
            padding: '2px 8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          감시 {monitoringEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        {(Object.keys(LEVEL_CONFIG) as ThreatLevel[]).map((level) => (
          <div
            key={level}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 9,
              color: LEVEL_CONFIG[level].color,
            }}
          >
            <span>{LEVEL_CONFIG[level].label}</span>
            <span style={{ fontWeight: 700 }}>{counts[level]}</span>
          </div>
        ))}
      </div>

      {recentThreats.length > 0 && (
        <div style={{ borderTop: `1px solid ${NocTheme.border}`, paddingTop: 4 }}>
          {recentThreats.map((threat) => (
            <div
              key={threat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 9,
                color: LEVEL_CONFIG[threat.level].color,
                marginBottom: 2,
              }}
            >
              <span style={{ flexShrink: 0 }}>
                {new Date(threat.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {threat.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
