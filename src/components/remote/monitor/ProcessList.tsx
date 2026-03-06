'use client'

import React, { useState, useCallback } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'
import type { ProcessInfo } from '@/types/remote'

type SortKey = 'cpu' | 'memory'

const STATUS_COLORS: Record<ProcessInfo['status'], string> = {
  running: NocTheme.green, sleeping: NocTheme.textTertiary,
  stopped: NocTheme.orange, zombie: NocTheme.red,
}

const TH: React.CSSProperties = {
  fontSize: 9, color: NocTheme.textTertiary, fontFamily: 'monospace',
  padding: '4px 6px', textAlign: 'right', whiteSpace: 'nowrap',
  borderBottom: `1px solid ${NocTheme.border}`,
}

const TD: React.CSSProperties = {
  fontSize: 10, fontFamily: 'monospace', padding: '3px 6px',
  textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
}

function sortProcs(procs: readonly ProcessInfo[], key: SortKey): readonly ProcessInfo[] {
  return [...procs].sort((a, b) => b[key] - a[key])
}

function colorByUsage(val: number): string {
  return val > 80 ? NocTheme.red : NocTheme.textPrimary
}

export default function ProcessList() {
  const { state } = useRemote()
  const [sortKey, setSortKey] = useState<SortKey>('cpu')
  const sorted = sortProcs(state.processes, sortKey)
  const handleSort = useCallback((key: SortKey) => { setSortKey(key) }, [])

  const sortTh = (key: SortKey, label: string) => (
    <th
      style={{ ...TH, cursor: 'pointer', color: sortKey === key ? NocTheme.cyan : TH.color, width: 50 }}
      onClick={() => handleSort(key)}
    >
      {label}{sortKey === key ? ' \u25BC' : ''}
    </th>
  )

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, padding: '0 4px' }}>
        <span style={{ fontSize: 11, color: NocTheme.textPrimary, fontWeight: 600 }}>{'\uD504\uB85C\uC138\uC2A4'}</span>
        <span style={{ fontSize: 9, color: NocTheme.textTertiary }}>{sorted.length}{'\uAC1C'}</span>
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto', border: `1px solid ${NocTheme.border}`, borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: 'left', width: 40 }}>PID</th>
              <th style={{ ...TH, textAlign: 'left', width: 100 }}>Name</th>
              {sortTh('cpu', 'CPU%')}
              {sortTh('memory', 'MEM%')}
              <th style={{ ...TH, width: 50 }}>Status</th>
              <th style={{ ...TH, width: 60 }}>User</th>
              <th style={{ ...TH, width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.pid} style={{
                backgroundColor: p.isSuspicious ? `${NocTheme.red}15` : 'transparent',
                borderBottom: `1px solid ${NocTheme.border}`,
              }}>
                <td style={{ ...TD, textAlign: 'left', color: NocTheme.textSecondary }}>{p.pid}</td>
                <td style={{ ...TD, textAlign: 'left', color: p.isSuspicious ? NocTheme.red : NocTheme.textPrimary, maxWidth: 100 }}>
                  {p.isSuspicious && <span style={{ marginRight: 3 }}>{'\u26A0'}</span>}
                  {p.name}
                </td>
                <td style={{ ...TD, color: colorByUsage(p.cpu) }}>{p.cpu.toFixed(1)}</td>
                <td style={{ ...TD, color: colorByUsage(p.memory) }}>{p.memory.toFixed(1)}</td>
                <td style={{ ...TD, color: STATUS_COLORS[p.status], fontSize: 9 }}>{p.status}</td>
                <td style={{ ...TD, color: NocTheme.textTertiary, fontSize: 9 }}>{p.user}</td>
                <td style={{ ...TD, textAlign: 'center' }}>
                  {p.isSuspicious && (
                    <button type="button" style={{
                      background: `${NocTheme.red}30`, border: `1px solid ${NocTheme.red}60`,
                      color: NocTheme.red, fontSize: 9, fontFamily: 'monospace',
                      padding: '1px 6px', borderRadius: 3, cursor: 'pointer',
                    }}>{'\uC885\uB8CC'}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
