'use client'

import { useEffect, useState } from 'react'
import type { AgentMetric } from '@/data/agentSettingsData'

export default function RequestStatusPanel() {
  const [metrics, setMetrics] = useState<AgentMetric[]>([])

  useEffect(() => {
    fetch('/api/agents/metrics')
      .then((r) => r.json())
      .then((data) => setMetrics(data.data ?? []))
      .catch(() => setMetrics([]))
  }, [])

  const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0) || 1
  const sorted = [...metrics]
    .filter((m) => m.requestCount > 0)
    .sort((a, b) => b.requestCount - a.requestCount)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, borderTop: '1px solid #333333' }}>
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>
          요청현황
        </span>
        <span style={{ fontSize: 8, color: '#505661', fontFamily: 'monospace' }}>
          Total: {totalRequests === 1 ? 0 : totalRequests}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 10px' }}>
        {sorted.map((m) => {
          const pct = ((m.requestCount / totalRequests) * 100).toFixed(1)
          return (
            <div key={m.agentId} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9ca3af', marginBottom: 2 }}>
                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.name}
                </span>
                <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{pct}%</span>
              </div>
              <div style={{ height: 3, background: '#000000', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #3b82f688)',
                    borderRadius: 2,
                    transition: 'width 0.5s',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
