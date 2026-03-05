'use client'

import { useEffect, useState } from 'react'
import type { AgentMetric } from '@/data/agentSettingsData'

export default function AgentMetricsBar() {
  const [metrics, setMetrics] = useState<AgentMetric[]>([])

  useEffect(() => {
    fetch('/api/agents/metrics')
      .then((r) => r.json())
      .then((data) => setMetrics(data.data ?? []))
      .catch(() => setMetrics([]))
  }, [])

  const activeMetrics = metrics.filter((m) => m.requestCount > 0)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: mini chart area */}
      <div
        style={{
          flex: '0 0 280px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #333333',
          padding: '8px 10px',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.05em' }}>
          네트워크 사용량
        </div>
        {/* Simple bar visualization */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, paddingBottom: 4 }}>
          {activeMetrics.map((m) => {
            const maxTps = Math.max(...activeMetrics.map((x) => x.tokenPerSec), 1)
            const heightPct = (m.tokenPerSec / maxTps) * 100
            return (
              <div
                key={m.agentId}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 28,
                    height: `${heightPct}%`,
                    minHeight: 4,
                    background: 'linear-gradient(180deg, #00ff88, #00ff8844)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.5s',
                  }}
                />
                <span style={{ fontSize: 6, color: '#505661', textAlign: 'center', lineHeight: 1 }}>
                  {m.name.split('/')[0]?.slice(0, 3)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: metrics table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333333' }}>
              {['에이전트', 'CPU%', 'MEM%', 'Token/s', 'Requests'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '4px 8px',
                    textAlign: 'left',
                    color: '#6b7280',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr
                key={m.agentId}
                style={{
                  borderBottom: '1px solid #333333',
                }}
              >
                <td style={{ padding: '3px 8px', color: '#e6edf3', fontWeight: 600 }}>
                  {m.name}
                </td>
                <td style={{ padding: '3px 8px', color: m.cpuUsage > 70 ? '#ef4444' : '#9ca3af', fontFamily: 'monospace' }}>
                  {m.cpuUsage.toFixed(1)}
                </td>
                <td style={{ padding: '3px 8px', color: m.memUsage > 70 ? '#f59e0b' : '#9ca3af', fontFamily: 'monospace' }}>
                  {m.memUsage.toFixed(1)}
                </td>
                <td style={{ padding: '3px 8px', color: '#00ff88', fontFamily: 'monospace' }}>
                  {m.tokenPerSec}
                </td>
                <td style={{ padding: '3px 8px', color: '#3b82f6', fontFamily: 'monospace' }}>
                  {m.requestCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
