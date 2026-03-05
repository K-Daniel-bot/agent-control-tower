'use client'

import { useEffect, useState } from 'react'
import type { AgentMetric } from '@/data/agentSettingsData'

function BarChart({ data, valueKey, label, color }: {
  data: { name: string; value: number }[]
  valueKey: string
  label: string
  color: string
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#9ca3af',
          padding: '8px 10px 4px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          borderBottom: '1px solid #333333',
        }}
      >
        <span style={{ color }}>{label}</span> Top5
      </div>
      <div style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto' }}>
        {data.slice(0, 5).map((item) => (
          <div key={`${valueKey}-${item.name}`} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9ca3af' }}>
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span style={{ fontFamily: 'monospace', color }}>{item.value.toFixed(1)}%</span>
            </div>
            <div style={{ height: 4, background: '#000000', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(item.value / maxVal) * 100}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AgentResourcePanel() {
  const [metrics, setMetrics] = useState<AgentMetric[]>([])

  useEffect(() => {
    fetch('/api/agents/metrics')
      .then((r) => r.json())
      .then((data) => setMetrics(data.data ?? []))
      .catch(() => setMetrics([]))
  }, [])

  const cpuData = [...metrics]
    .sort((a, b) => b.cpuUsage - a.cpuUsage)
    .map((m) => ({ name: m.name, value: m.cpuUsage }))

  const memData = [...metrics]
    .sort((a, b) => b.memUsage - a.memUsage)
    .map((m) => ({ name: m.name, value: m.memUsage }))

  return (
    <>
      <BarChart data={cpuData} valueKey="cpu" label="CPU Used" color="#00ff88" />
      <div style={{ height: 1, background: '#333333' }} />
      <BarChart data={memData} valueKey="mem" label="MEM Used" color="#3b82f6" />
    </>
  )
}
