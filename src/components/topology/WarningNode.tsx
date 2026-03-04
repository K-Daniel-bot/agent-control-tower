'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface WarningNodeData {
  label: string
}

export function WarningNode({ data }: NodeProps) {
  const nodeData = data as unknown as WarningNodeData

  return (
    <div
      style={{
        width: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#f97316',
          border: '2px solid #f97316',
          width: 7,
          height: 7,
          top: '38%',
        }}
      />

      {/* Triangle warning shape */}
      <div style={{ position: 'relative', width: 54, height: 46 }}>
        <svg width="54" height="46" viewBox="0 0 54 46" fill="none">
          <path
            d="M27 3L51 43H3L27 3Z"
            fill="rgba(249,115,22,0.12)"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Glow */}
          <path
            d="M27 3L51 43H3L27 3Z"
            fill="none"
            stroke="rgba(249,115,22,0.3)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* ! text */}
          <text
            x="27"
            y="32"
            textAnchor="middle"
            fill="#f97316"
            fontSize="18"
            fontWeight="bold"
            fontFamily="monospace"
          >
            !
          </text>
        </svg>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 8,
          color: '#f97316',
          fontWeight: 600,
          textAlign: 'center',
          letterSpacing: '0.03em',
          lineHeight: 1.3,
          background: 'rgba(249,115,22,0.08)',
          border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 4,
          padding: '2px 6px',
          maxWidth: 88,
          wordBreak: 'keep-all',
        }}
      >
        {nodeData.label ?? 'LLM timeout'}
      </div>
    </div>
  )
}

export default WarningNode
