'use client'

import { useMemo } from 'react'
import { FLOW_STEPS, FLOW_CONNECTIONS } from '@/data/worldmapNodes'

interface Props {
  width: number
  height: number
}

const BG = '#060a12'
const BOX_W = 68
const BOX_H = 24
const GROUP_GAP = 12

const GROUP_COLORS = [
  '#3b82f6', // ingest - blue
  '#06b6d4', // context - teal
  '#ffcc00', // plan - yellow
  '#00ff88', // execute - green
  '#8b5cf6', // verify - purple
  '#ec4899', // document - pink
  '#f59e0b', // observe - amber
]

export default function FlowArchitecture({ width, height }: Props) {
  const positions = useMemo(() => {
    const groups = new Map<number, typeof FLOW_STEPS>()
    for (const step of FLOW_STEPS) {
      groups.set(step.group, [...(groups.get(step.group) ?? []), step])
    }
    const maxGroup = Math.max(...FLOW_STEPS.map(s => s.group))
    const px = 50
    const py = 36
    const uw = width - px * 2
    const uh = height - py * 2
    const pos = new Map<string, { x: number; y: number; color: string }>()

    for (let g = 0; g <= maxGroup; g++) {
      const items = groups.get(g) ?? []
      const x = px + (g / maxGroup) * uw
      for (const [i, item] of items.entries()) {
        const y = py + ((i + 1) / (items.length + 1)) * uh
        pos.set(item.id, { x, y, color: GROUP_COLORS[g] ?? '#555' })
      }
    }
    return pos
  }, [width, height])

  return (
    <div style={{ width: '100%', height: '100%', background: BG, position: 'relative' }}>
      {/* Title */}
      <div style={{
        position: 'absolute', top: 8, left: 14,
        fontSize: 9, color: '#1e3050', fontFamily: 'monospace', letterSpacing: '0.08em',
      }}>
        EXECUTION FLOW / PROPERTIES
      </div>
      <div style={{
        position: 'absolute', bottom: 6, right: 14,
        fontSize: 8, color: '#14202e', fontFamily: 'monospace',
      }}>
        {FLOW_STEPS.length} STEPS  {FLOW_CONNECTIONS.length} LINKS
      </div>

      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* Corner brackets */}
        <g stroke="#1a2a40" strokeWidth="1" fill="none">
          <polyline points="6,22 6,6 22,6" />
          <polyline points={`${width - 22},6 ${width - 6},6 ${width - 6},22`} />
          <polyline points={`6,${height - 22} 6,${height - 6} 22,${height - 6}`} />
          <polyline points={`${width - 22},${height - 6} ${width - 6},${height - 6} ${width - 6},${height - 22}`} />
        </g>

        {/* Connections */}
        {FLOW_CONNECTIONS.map(([src, tgt]) => {
          const s = positions.get(src)
          const t = positions.get(tgt)
          if (!s || !t) return null
          const mx = (s.x + t.x) / 2
          return (
            <path
              key={`${src}-${tgt}`}
              d={`M${s.x + BOX_W / 2},${s.y} C${mx},${s.y} ${mx},${t.y} ${t.x - BOX_W / 2},${t.y}`}
              fill="none"
              stroke={s.color + '20'}
              strokeWidth={0.8}
            />
          )
        })}

        {/* Flow boxes */}
        {FLOW_STEPS.map((step) => {
          const p = positions.get(step.id)
          if (!p) return null
          return (
            <g key={step.id}>
              {/* Box */}
              <rect
                x={p.x - BOX_W / 2}
                y={p.y - BOX_H / 2}
                width={BOX_W}
                height={BOX_H}
                rx={3}
                fill="#0a0e18"
                stroke={p.color + '35'}
                strokeWidth={1}
              />
              {/* Label */}
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={p.color + '88'}
                fontSize={8}
                fontFamily="monospace"
                fontWeight={600}
              >
                {step.label}
              </text>
              {/* Dot indicator */}
              <circle
                cx={p.x - BOX_W / 2 + 6}
                cy={p.y}
                r={2}
                fill={p.color + '55'}
              />
            </g>
          )
        })}

        {/* Group labels at bottom */}
        {['INGEST', 'CONTEXT', 'PLAN', 'EXEC', 'VERIFY', 'DOC', 'OBS'].map((label, i) => {
          const maxGroup = 6
          const px2 = 50
          const uw2 = width - px2 * 2
          const x = px2 + (i / maxGroup) * uw2
          return (
            <text
              key={label}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fill="#14202e"
              fontSize={7}
              fontFamily="monospace"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
