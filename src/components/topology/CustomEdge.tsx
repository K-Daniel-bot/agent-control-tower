'use client'

import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react'

export type EdgeStatus = 'normal' | 'warning' | 'error'

export interface CustomEdgeData {
  status?: EdgeStatus
  dataRate?: number
}

const EDGE_COLORS: Record<EdgeStatus, string> = {
  normal:  '#00ff88',
  warning: '#fbbf24',
  error:   '#ef4444',
}

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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* Static base stroke */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          opacity: 0.3,
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
          opacity: 0.85,
          filter: `drop-shadow(0 0 3px ${color})`,
        }}
      />

      {/* Data rate label */}
      {edgeData.dataRate != null && edgeData.dataRate > 0 && (
        <foreignObject
          x={labelX - 16}
          y={labelY - 8}
          width={32}
          height={16}
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              fontSize: 7,
              color: '#6b7280',
              fontFamily: 'monospace',
              textAlign: 'center',
              background: 'rgba(10,14,26,0.8)',
              borderRadius: 3,
              padding: '1px 3px',
            }}
          >
            {edgeData.dataRate}t/s
          </div>
        </foreignObject>
      )}
    </>
  )
}

export default CustomEdge
