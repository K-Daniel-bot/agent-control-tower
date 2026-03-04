'use client'

import { Handle, Position, NodeProps } from '@xyflow/react'

export type AgentNodeType = 'userRequest' | 'planner' | 'executor' | 'tool' | 'verifier' | 'result'

export interface AgentNodeData {
  label: string
  agentType: AgentNodeType
  status: 'active' | 'idle' | 'error' | 'warning'
  tokenRate?: number
}

const AGENT_CONFIG: Record<AgentNodeType, { icon: string; color: string; glowColor: string }> = {
  userRequest: { icon: '🧑', color: '#3b82f6', glowColor: '59,130,246' },
  planner:     { icon: '📋', color: '#8b5cf6', glowColor: '139,92,246' },
  executor:    { icon: '⚡', color: '#f59e0b', glowColor: '245,158,11' },
  tool:        { icon: '🔧', color: '#06b6d4', glowColor: '6,182,212' },
  verifier:    { icon: '✅', color: '#10b981', glowColor: '16,185,129' },
  result:      { icon: '📊', color: '#00ff88', glowColor: '0,255,136' },
}

const STATUS_COLORS: Record<AgentNodeData['status'], string> = {
  active:  '#00ff88',
  idle:    '#6b7280',
  error:   '#ef4444',
  warning: '#fbbf24',
}

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as AgentNodeData
  const config = AGENT_CONFIG[nodeData.agentType] ?? AGENT_CONFIG.executor
  const statusColor = STATUS_COLORS[nodeData.status] ?? STATUS_COLORS.idle
  const isActive = nodeData.status === 'active'

  return (
    <div
      style={{
        width: 80,
        minHeight: 60,
        background: 'rgba(26,31,46,0.95)',
        border: `1px solid ${isActive ? config.color : '#2a3042'}`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 4px',
        gap: 3,
        boxShadow: isActive
          ? `0 0 10px rgba(${config.glowColor},0.6), 0 0 20px rgba(${config.glowColor},0.2)`
          : '0 2px 4px rgba(0,0,0,0.4)',
        position: 'relative',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: config.color,
          border: `2px solid ${config.color}`,
          width: 8,
          height: 8,
        }}
      />

      {/* Status indicator */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: statusColor,
          animation: isActive ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
          boxShadow: isActive ? `0 0 4px ${statusColor}` : 'none',
        }}
      />

      {/* Icon */}
      <span style={{ fontSize: 20, lineHeight: 1 }}>{config.icon}</span>

      {/* Label */}
      <span
        style={{
          fontSize: 9,
          color: '#cbd5e1',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: 72,
          wordBreak: 'keep-all',
        }}
      >
        {nodeData.label}
      </span>

      {/* Token rate */}
      {nodeData.tokenRate != null && (
        <span
          style={{
            fontSize: 8,
            color: config.color,
            fontFamily: 'monospace',
          }}
        >
          {nodeData.tokenRate}t/s
        </span>
      )}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: config.color,
          border: `2px solid ${config.color}`,
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}

export default AgentNode
