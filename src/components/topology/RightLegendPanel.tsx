'use client'

import type { OrchestraState } from '@/types/topology'

const FLOW_LEGEND = [
  { label: 'Planner', color: '#8b5cf6' },
  { label: 'EXECUTOR A', color: '#3b82f6' },
  { label: 'EXECUTOR B', color: '#06b6d4' },
  { label: 'EXECUTOR C', color: '#22d3ee' },
  { label: 'Browser', color: '#3b82f6' },
  { label: 'Filesystem', color: '#a855f7' },
]

const DEP_LEGEND = [
  { label: 'PLANNER', color: '#8b5cf6' },
  { label: 'EXECUTOR A', color: '#f59e0b' },
  { label: 'EXECUTOR B', color: '#f97316' },
  { label: 'GIT', color: '#f97316' },
  { label: 'SLACK', color: '#e74c3c' },
  { label: 'NOTION', color: '#6366f1' },
  { label: 'KNOWLEDGE', color: '#a855f7' },
]

const STATUS_ITEMS = [
  { label: '실행', color: '#00ff88' },
  { label: '대기', color: '#6b7280' },
  { label: '오류', color: '#ef4444' },
]

function LegendDot({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 5px ${color}80`,
        flexShrink: 0,
      }}
    />
  )
}

function LegendRow({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <LegendDot color={color} />
      <span
        style={{
          fontSize: 9,
          color: '#9ca3af',
          letterSpacing: '0.03em',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  )
}

interface Props {
  state: OrchestraState
}

export function RightLegendPanel({ state }: Props) {
  const running = state.agents.filter(
    (a) => a.status === 'active' || a.status === 'working',
  ).length
  const waiting = state.agents.filter(
    (a) => a.status === 'spawning' || a.status === 'idle',
  ).length
  const error = state.agents.filter((a) => a.status === 'error').length

  return (
    <div
      style={{
        width: 188,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,14,26,0.97)',
        borderLeft: '1px solid #2a3042',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* ─── Execution Flow Legend ─── */}
      <div
        style={{
          flex: '0 0 auto',
          padding: '12px 14px',
          borderBottom: '1px solid #1e2535',
        }}
      >
        <div
          style={{
            fontSize: 8,
            color: '#4b5563',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          Execution Flow
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {FLOW_LEGEND.map((item) => (
            <LegendRow key={item.label} label={item.label} color={item.color} />
          ))}
        </div>
      </div>

      {/* ─── Dependency Graph Legend ─── */}
      <div
        style={{
          flex: '0 0 auto',
          padding: '12px 14px',
          borderBottom: '1px solid #1e2535',
        }}
      >
        <div
          style={{
            fontSize: 8,
            color: '#4b5563',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          Dependency Graph
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {DEP_LEGEND.map((item) => (
            <LegendRow key={item.label} label={item.label} color={item.color} />
          ))}
        </div>
      </div>

      {/* ─── Status counts ─── */}
      <div style={{ flex: 1, padding: '12px 14px' }}>
        <div
          style={{
            fontSize: 8,
            color: '#4b5563',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          상태
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '실행', color: '#00ff88', count: running },
            { label: '대기', color: '#6b7280', count: waiting },
            { label: '오류', color: '#ef4444', count: error },
          ].map(({ label, color, count }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <LegendDot color={color} />
                <span style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.03em' }}>{label}</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: '#1e2535', margin: '14px 0' }} />

        {/* Status filter chips */}
        <div
          style={{
            fontSize: 8,
            color: '#4b5563',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          필터
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {STATUS_ITEMS.map(({ label, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                background: `${color}10`,
                border: `1px solid ${color}30`,
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: color,
                }}
              />
              <span style={{ fontSize: 8, color, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightLegendPanel
