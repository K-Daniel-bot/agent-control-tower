'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import type { AgentState, AgentMessage } from '@/types/topology'
import { deriveEventCountGrid, type EventCountCell } from '@/utils/nocDataTransform'

interface AgentEventCountTableProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly messages: ReadonlyArray<AgentMessage>
}

interface SeverityColumn {
  readonly key: keyof Pick<EventCountCell, 'caution' | 'danger' | 'urgent' | 'sustained' | 'total'>
  readonly label: string
  readonly color: string
}

const SEVERITY_COLUMNS: readonly SeverityColumn[] = [
  { key: 'caution', label: '주의', color: NocTheme.orange },
  { key: 'danger', label: '위험', color: NocTheme.orangeBright },
  { key: 'urgent', label: '긴급', color: NocTheme.red },
  { key: 'sustained', label: '지속', color: NocTheme.purple },
  { key: 'total', label: '합계', color: NocTheme.surfaceLight },
] as const

const CODE_MAP: Record<string, string> = {
  orchestrator: 'ORC',
  planner: 'PLN',
  executor: 'EXE',
  tool: 'TOL',
  verifier: 'VRF',
}

function CountIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" fill={NocTheme.textMuted} />
      <rect x="8" y="1" width="5" height="5" rx="1" fill={NocTheme.textMuted} />
      <rect x="1" y="8" width="5" height="5" rx="1" fill={NocTheme.textMuted} />
      <rect x="8" y="8" width="5" height="5" rx="1" fill={NocTheme.textMuted} />
    </svg>
  )
}

export default function AgentEventCountTable({ agents, messages }: AgentEventCountTableProps) {
  const rows = useMemo(() => deriveEventCountGrid(agents, messages), [agents, messages])

  const totalCounts = useMemo(() =>
    SEVERITY_COLUMNS.map(col => rows.reduce((sum, row) => sum + row[col.key], 0)),
    [rows]
  )

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 2, marginBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0', background: 'transparent', borderRadius: 3 }}>
          <CountIcon />
        </div>
        {SEVERITY_COLUMNS.map((col) => (
          <div key={col.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0', fontSize: 10, fontWeight: 600, color: col.color, background: 'transparent', borderRadius: 3, letterSpacing: '0.03em' }}>
            {col.label}
          </div>
        ))}
      </div>

      {rows.map((row) => (
        <div key={row.type} style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 2, marginBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 2px', fontSize: 10, fontWeight: 600, color: NocTheme.textTertiary, background: 'transparent', borderRadius: 3, letterSpacing: '0.02em' }} title={row.label}>
            {CODE_MAP[row.type] || row.type.slice(0, 3).toUpperCase()}
          </div>
          {SEVERITY_COLUMNS.map((col) => {
            const count = row[col.key]
            const isEmpty = count === 0
            return (
              <div key={col.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 30, borderRadius: 3, background: isEmpty ? NocTheme.background : col.color, opacity: isEmpty ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: isEmpty ? NocTheme.textMuted : NocTheme.textPrimary, textShadow: isEmpty ? 'none' : '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 2, marginTop: 4, borderTop: `1px solid ${NocTheme.divider}`, paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 2px', fontSize: 10, fontWeight: 700, color: NocTheme.textSecondary, background: 'transparent', borderRadius: 3 }}>
          ALL
        </div>
        {totalCounts.map((count, colIdx) => {
          const col = SEVERITY_COLUMNS[colIdx]
          return (
            <div key={col.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 30, borderRadius: 3, background: `${col.color}88`, border: `1px solid ${col.color}44` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
