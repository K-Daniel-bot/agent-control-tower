'use client'

import type { NeuralNode, NeuralEdge } from '@/types/worldmap'
import { NODE_TYPE_COLORS, LAYER_LABELS } from '@/types/worldmap'

interface Props {
  node: NeuralNode
  edges: readonly NeuralEdge[]
  nodes: readonly NeuralNode[]
  onClose: () => void
}

const HEALTH_LABELS: Record<string, { label: string; color: string }> = {
  ok: { label: 'HEALTHY', color: '#00ff88' },
  warn: { label: 'WARNING', color: '#f59e0b' },
  error: { label: 'ERROR', color: '#ef4444' },
  idle: { label: 'IDLE', color: '#6b7280' },
}

export default function MapInspector({ node, edges, nodes, onClose }: Props) {
  const color = NODE_TYPE_COLORS[node.type]
  const health = HEALTH_LABELS[node.health] ?? HEALTH_LABELS.idle

  const inbound = edges.filter(e => e.target === node.id)
  const outbound = edges.filter(e => e.source === node.id)

  const resolveLabel = (id: string) => nodes.find(n => n.id === id)?.label ?? id

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: 280, background: '#080c16', borderLeft: '1px solid #1a2a40',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid #1a2a40',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color }}>{node.label}</div>
          <div style={{ fontSize: 10, color: '#4a5568', marginTop: 2 }}>
            {node.type.toUpperCase()} / {LAYER_LABELS[node.layer]}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #1a2a40', borderRadius: 3,
            color: '#4a5568', fontSize: 10, padding: '2px 6px', cursor: 'pointer',
          }}
        >
          ESC
        </button>
      </div>

      {/* Health + Metrics */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #0e1822' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: health.color, boxShadow: `0 0 6px ${health.color}`,
          }} />
          <span style={{ fontSize: 10, color: health.color, fontWeight: 600 }}>{health.label}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          {[
            { label: 'CPU', value: `${node.metrics.cpu}%`, color: node.metrics.cpu > 60 ? '#f59e0b' : '#3a4a60' },
            { label: 'Token Rate', value: `${node.metrics.tokenRate} t/s`, color: '#3a4a60' },
            { label: 'Latency', value: `${node.metrics.latency}ms`, color: node.metrics.latency > 300 ? '#f59e0b' : '#3a4a60' },
            { label: 'Queue', value: `${node.metrics.queueDepth}`, color: node.metrics.queueDepth > 5 ? '#ef4444' : '#3a4a60' },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 8, color: '#2a3548', textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
        {/* Inbound */}
        <div style={{ fontSize: 9, color: '#2a3548', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
          INBOUND ({inbound.length})
        </div>
        {inbound.length === 0 ? (
          <div style={{ fontSize: 10, color: '#1a2530', marginBottom: 12 }}>No inbound connections</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
            {inbound.map((e, i) => {
              const src = nodes.find(n => n.id === e.source)
              const sc = src ? NODE_TYPE_COLORS[src.type] : '#444'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 8px', background: '#0a0e18', borderRadius: 3,
                  border: `1px solid ${sc}15`,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc }} />
                  <span style={{ fontSize: 9, color: '#5a6a80', flex: 1 }}>{resolveLabel(e.source)}</span>
                  <span style={{ fontSize: 8, color: e.active ? '#00ff8860' : '#1a2530' }}>
                    {e.kind} {e.active ? '\u25CF' : '\u25CB'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Outbound */}
        <div style={{ fontSize: 9, color: '#2a3548', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.06em' }}>
          OUTBOUND ({outbound.length})
        </div>
        {outbound.length === 0 ? (
          <div style={{ fontSize: 10, color: '#1a2530' }}>No outbound connections</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {outbound.map((e, i) => {
              const tgt = nodes.find(n => n.id === e.target)
              const tc = tgt ? NODE_TYPE_COLORS[tgt.type] : '#444'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 8px', background: '#0a0e18', borderRadius: 3,
                  border: `1px solid ${tc}15`,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: tc }} />
                  <span style={{ fontSize: 9, color: '#5a6a80', flex: 1 }}>{resolveLabel(e.target)}</span>
                  <span style={{ fontSize: 8, color: e.active ? '#00ff8860' : '#1a2530' }}>
                    {e.kind} {e.active ? '\u25CF' : '\u25CB'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid #0e1822',
        fontSize: 8, color: '#1a2530', fontFamily: 'monospace',
      }}>
        NODE_ID: {node.id} | TYPE: {node.type} | LAYER: {node.layer}
      </div>
    </div>
  )
}
