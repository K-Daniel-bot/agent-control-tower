'use client'

import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react'

export type EdgeStatus = 'normal' | 'warning' | 'error'

export interface CustomEdgeData {
  status?: EdgeStatus
}

const EDGE_COLORS: Record<EdgeStatus, string> = {
  normal:  '#00ff88',
  warning: '#fbbf24',
  error:   '#ef4444',
}

const ANIMATION_STYLE = `
@keyframes flow-dash {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}
`

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const edgeData = (data ?? {}) as CustomEdgeData
  const status: EdgeStatus = edgeData.status ?? 'normal'
  const color = EDGE_COLORS[status]

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <style>{ANIMATION_STYLE}</style>

      {/* Static base stroke */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          opacity: 0.35,
        }}
      />

      {/* Animated flow overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="8 16"
        strokeLinecap="round"
        style={{
          animation: 'flow-dash 2s linear infinite',
          opacity: 0.9,
          filter: `drop-shadow(0 0 3px ${color})`,
        }}
      />
    </>
  )
}

export default CustomEdge
