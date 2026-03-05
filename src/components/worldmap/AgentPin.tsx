'use client'

import type { AgentPin as AgentPinType } from '@/types/worldmap'

interface AgentPinProps {
  agent: AgentPinType
  selected: boolean
  onClick: (id: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: '#00ff88',
  working: '#f59e0b',
  spawning: '#3b82f6',
  idle: '#6b7280',
  error: '#ef4444',
  complete: '#6b7280',
}

export default function AgentPinComponent({ agent, selected, onClick }: AgentPinProps) {
  const color = STATUS_COLORS[agent.status] ?? '#6b7280'
  const size = Math.max(28, Math.min(48, 28 + agent.tokenRate * 2))

  return (
    <g
      onClick={() => onClick(agent.id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Pulse ring for active */}
      {(agent.status === 'active' || agent.status === 'working') && (
        <circle
          r={size / 2 + 6}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            from={size / 2 + 4}
            to={size / 2 + 14}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.4"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Selection ring */}
      {selected && (
        <circle
          r={size / 2 + 3}
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Body */}
      <circle
        r={size / 2}
        fill={`${color}20`}
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Avatar letter */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.4}
        fontWeight="700"
        fontFamily="monospace"
      >
        {agent.avatar}
      </text>

      {/* Name label */}
      <text
        y={size / 2 + 12}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="9"
        fontFamily="sans-serif"
      >
        {agent.name}
      </text>
    </g>
  )
}
